import { GeneratedItem } from '../types';

const BASE_WEBHOOK_URL = import.meta.env.VITE_BASE_WEBHOOK_URL;
const GLOBAL_TIMEOUT = 300000; // 5 minutes en millisecondes

export type WebhookType = 'ebook' | 'cover' | 'mockup' | 'ad' | 'video';

export const saveToHistory = (userId: string, item: Omit<GeneratedItem, 'id' | 'timestamp' | 'expiresAt'>) => {
  if (!userId) return;
  const storageKey = `bookaio_history_${userId}`;
  const history: GeneratedItem[] = JSON.parse(localStorage.getItem(storageKey) || '[]');

  const newItem: GeneratedItem = {
    ...item,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24h de visibilité dans les logs
  };

  const updatedHistory = [newItem, ...history].slice(0, 50); // On garde les 50 derniers logs
  localStorage.setItem(storageKey, JSON.stringify(updatedHistory));

  // Dispatch un event pour rafraîchir l'UI
  window.dispatchEvent(new Event('historyUpdated'));
};

export const sendToWebhook = async (data: any, type: WebhookType = 'ebook'): Promise<any> => {
  let url = BASE_WEBHOOK_URL;
  if (type === 'cover') url += '-cover';
  if (type === 'mockup') url += '-mockup';
  if (type === 'ad') url += '-ad';
  if (type === 'video') url += '-video';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GLOBAL_TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      signal: controller.signal,
      headers: {
        'Accept': 'application/pdf, application/json, image/png, image/jpeg, video/mp4',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || '';

    // Vérification si le retour est un fichier binaire
    if (
      contentType.includes('application/pdf') ||
      contentType.includes('image/') ||
      contentType.includes('video/mp4') ||
      contentType.includes('application/octet-stream')
    ) {
      return await response.blob();
    }

    // Sinon traitement JSON
    try {
      return await response.json();
    } catch (e) {
      return { status: 'success' };
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error("💥 Webhook Timeout: La génération a pris plus de 5 minutes.");
    } else {
      console.error(`💥 Webhook ${type} Error:`, error);
    }
    return null;
  }
};
