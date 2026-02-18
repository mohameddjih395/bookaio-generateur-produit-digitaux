// Supabase Edge Function: generate
// Acts as a secure proxy between the frontend and n8n webhooks.
// Secrets (n8n URL, webhook signing key) are stored in Supabase Edge Function
// environment variables — NEVER in the frontend bundle.
//
// Deploy with: supabase functions deploy generate
// Set secrets with:
//   supabase secrets set N8N_BASE_WEBHOOK_URL=https://...
//   supabase secrets set N8N_WEBHOOK_SECRET=your_secret_here

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── Types ────────────────────────────────────────────────────────────────────

type WebhookType = 'ebook' | 'cover' | 'mockup' | 'ad' | 'video';

interface GenerateRequest {
    type: WebhookType;
    [key: string]: unknown;
}

// ─── Plan Limits ──────────────────────────────────────────────────────────────

const PLAN_LIMITS: Record<string, number> = {
    free: 1,
    essential: 3,
    abundance: 10,
};

// ─── Rate Limiting (in-memory, per isolate) ───────────────────────────────────
// For production at scale, replace with a Supabase table or Upstash Redis.

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(userId);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return true;
    }

    if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
        return false;
    }

    entry.count++;
    return true;
}

// ─── CORS Headers ─────────────────────────────────────────────────────────────

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─── Main Handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
    }

    try {
        // ── 1. Authenticate the user via JWT ──────────────────────────────────────
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Non authentifié.' }), {
                status: 401,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Token invalide ou expiré.' }), {
                status: 401,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
        }

        // ── 2. Rate limiting ──────────────────────────────────────────────────────
        if (!checkRateLimit(user.id)) {
            return new Response(
                JSON.stringify({ error: 'Trop de requêtes. Attendez 1 minute avant de réessayer.' }),
                {
                    status: 429,
                    headers: {
                        ...CORS_HEADERS,
                        'Content-Type': 'application/json',
                        'Retry-After': '60',
                    },
                }
            );
        }

        // ── 3. Parse and validate request body ────────────────────────────────────
        let body: GenerateRequest;
        try {
            body = await req.json();
        } catch {
            return new Response(JSON.stringify({ error: 'Corps de requête JSON invalide.' }), {
                status: 400,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
        }

        const VALID_TYPES: WebhookType[] = ['ebook', 'cover', 'mockup', 'ad', 'video'];
        if (!body.type || !VALID_TYPES.includes(body.type)) {
            return new Response(JSON.stringify({ error: 'Type de génération invalide.' }), {
                status: 400,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
        }

        // Validate string fields to prevent oversized payloads
        for (const [key, value] of Object.entries(body)) {
            if (typeof value === 'string' && value.length > 5000) {
                return new Response(
                    JSON.stringify({ error: `Le champ "${key}" dépasse la limite autorisée.` }),
                    { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
                );
            }
        }

        // ── 4. Check user quota ───────────────────────────────────────────────────
        // Only ebook generation counts against the quota
        if (body.type === 'ebook') {
            const { data: profile } = await supabase
                .from('profiles')
                .select('plan, ebook_count_this_month, quota_reset_at')
                .eq('id', user.id)
                .single();

            if (profile) {
                const plan = profile.plan || 'free';
                const limit = PLAN_LIMITS[plan] ?? 1;
                const now = new Date();
                const resetAt = profile.quota_reset_at ? new Date(profile.quota_reset_at) : null;

                // Reset counter if we're past the reset date
                let currentCount = profile.ebook_count_this_month || 0;
                if (!resetAt || now > resetAt) {
                    currentCount = 0;
                    await supabase
                        .from('profiles')
                        .update({
                            ebook_count_this_month: 0,
                            quota_reset_at: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
                        })
                        .eq('id', user.id);
                }

                if (currentCount >= limit) {
                    return new Response(
                        JSON.stringify({
                            error: `Quota mensuel atteint (${limit} ebook${limit > 1 ? 's' : ''} / mois pour le plan ${plan}). Passez à un plan supérieur.`,
                            quota_exceeded: true,
                        }),
                        { status: 429, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
                    );
                }
            }
        }

        // ── 5. Proxy to n8n (secrets stay server-side) ────────────────────────────
        const n8nBaseUrl = Deno.env.get('N8N_BASE_WEBHOOK_URL');
        const n8nSecret = Deno.env.get('N8N_WEBHOOK_SECRET');

        if (!n8nBaseUrl || !n8nSecret) {
            console.error('[generate] Missing N8N env vars');
            return new Response(JSON.stringify({ error: 'Configuration serveur manquante.' }), {
                status: 500,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
        }

        const suffixMap: Record<WebhookType, string> = {
            ebook: '',
            cover: '-cover',
            mockup: '-mockup',
            ad: '-ad',
            video: '-video',
        };
        const webhookUrl = `${n8nBaseUrl}${suffixMap[body.type]}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300_000); // 5 min

        const n8nResponse = await fetch(webhookUrl, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'X-BookAIO-Secret': n8nSecret,
                'X-User-Id': user.id,
            },
            body: JSON.stringify({ ...body, user_id: user.id }),
        });

        clearTimeout(timeoutId);

        if (!n8nResponse.ok) {
            console.error(`[generate] n8n returned ${n8nResponse.status}`);
            return new Response(
                JSON.stringify({ error: 'Le service de génération a retourné une erreur.' }),
                { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
            );
        }

        // ── 6. Increment quota counter after successful ebook generation ───────────
        if (body.type === 'ebook') {
            await supabase.rpc('increment_ebook_count', { p_user_id: user.id });
        }

        // ── 7. Stream the response back to the client ─────────────────────────────
        const contentType = n8nResponse.headers.get('content-type') || 'application/json';
        const responseBody = await n8nResponse.arrayBuffer();

        return new Response(responseBody, {
            status: 200,
            headers: {
                ...CORS_HEADERS,
                'Content-Type': contentType,
            },
        });

    } catch (err: unknown) {
        const isAbort = err instanceof Error && err.name === 'AbortError';
        if (isAbort) {
            return new Response(
                JSON.stringify({ error: 'La génération a dépassé le délai de 5 minutes.' }),
                { status: 504, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
            );
        }

        // Never expose internal error details to the client
        console.error('[generate] Unhandled error:', err);
        return new Response(
            JSON.stringify({ error: 'Une erreur interne est survenue.' }),
            { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
    }
});
