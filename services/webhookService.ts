import { GeneratedItem } from '../types';
import { supabase } from './supabaseClient';

// SECURITY: No secrets here. The n8n URL and webhook secret are stored
// exclusively in Supabase Edge Function environment variables (server-side).

export type WebhookType = 'ebook' | 'cover' | 'mockup' | 'ad' | 'video';

// ─── Input Validation ────────────────────────────────────────────────────────

const MAX_PROMPT_LENGTH = 2000;
const MAX_TITLE_LENGTH = 200;
const MAX_URL_LENGTH = 500;

export function validatePrompt(prompt: string): string {
  const trimmed = prompt.trim();
  if (!trimmed) throw new Error('Le prompt ne peut pas être vide.');
  if (trimmed.length > MAX_PROMPT_LENGTH) {
    throw new Error(`Le prompt ne peut pas dépasser ${MAX_PROMPT_LENGTH} caractères.`);
  }
  return trimmed;
}

export function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) throw new Error('Le titre ne peut pas être vide.');
  if (trimmed.length > MAX_TITLE_LENGTH) {
    throw new Error(`Le titre ne peut pas dépasser ${MAX_TITLE_LENGTH} caractères.`);
  }
  return trimmed;
}

export function validateUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed && trimmed.length > MAX_URL_LENGTH) {
    throw new Error(`L'URL ne peut pas dépasser ${MAX_URL_LENGTH} caractères.`);
  }
  // Basic URL format check
  if (trimmed) {
    try {
      new URL(trimmed);
    } catch {
      throw new Error('Format d\'URL invalide.');
    }
  }
  return trimmed;
}

// ─── History Persistence ─────────────────────────────────────────────────────

export const saveToHistory = async (
  userId: string,
  item: Omit<GeneratedItem, 'id' | 'timestamp' | 'expiresAt'>
) => {
  if (!userId) return;

  const { error } = await supabase.from('generations').insert({
    user_id: userId,
    type: item.type,
    title: item.title,
    url: item.url,
  });

  if (error) {
    // Log non-sensitive error info only
    console.error('[BookAIO] Erreur sauvegarde historique:', error.code, error.hint);
  }

  window.dispatchEvent(new Event('historyUpdated'));
};

// ─── Webhook via Edge Function (Secure Proxy) ────────────────────────────────

const RETRY_DELAYS_MS = [2000, 5000, 10000]; // 3 attempts: 2s, 5s, 10s

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sends a generation request through the Supabase Edge Function.
 * The Edge Function holds the n8n URL and secret — never the client.
 *
 * @param data   - The payload to send to n8n (sanitized before calling this)
 * @param type   - The type of generation
 * @returns      - A Blob (image/pdf/video) or a JSON object, or null on failure
 */
export const sendToWebhook = async (
  data: Record<string, unknown>,
  type: WebhookType = 'ebook'
): Promise<Blob | Record<string, unknown> | null> => {
  // Verify user is authenticated before making any request
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Vous devez être connecté pour utiliser cette fonctionnalité.');
  }

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const { data: result, error } = await supabase.functions.invoke('generate', {
        body: { ...data, type },
      });

      if (error) {
        // Edge Function returned an application-level error
        const status = (error as any)?.context?.status;

        // Do not retry on auth/quota errors
        if (status === 401 || status === 403 || status === 429) {
          const message = (error as any)?.message || 'Accès refusé ou quota dépassé.';
          throw new Error(message);
        }

        // Retry on server errors (5xx) or network issues
        if (attempt < RETRY_DELAYS_MS.length) {
          console.warn(`[BookAIO] Tentative ${attempt + 1} échouée, nouvelle tentative dans ${RETRY_DELAYS_MS[attempt] / 1000}s...`);
          await sleep(RETRY_DELAYS_MS[attempt]);
          continue;
        }

        throw new Error('Le service de génération est temporairement indisponible. Réessayez dans quelques minutes.');
      }

      // The Edge Function returns the raw response body
      // If it's a Blob (binary file), return it directly
      if (result instanceof Blob) return result;

      // Otherwise return the JSON object
      return result as Record<string, unknown>;

    } catch (err: any) {
      // Re-throw non-retryable errors immediately
      if (err.message && (
        err.message.includes('connecté') ||
        err.message.includes('Accès refusé') ||
        err.message.includes('quota')
      )) {
        throw err;
      }

      if (attempt < RETRY_DELAYS_MS.length) {
        console.warn(`[BookAIO] Erreur réseau tentative ${attempt + 1}:`, err.name);
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }

      // All retries exhausted
      console.error('[BookAIO] Toutes les tentatives ont échoué.');
      return null;
    }
  }

  return null;
};
