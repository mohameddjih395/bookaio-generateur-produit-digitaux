export interface User {
  id: string;
  email?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  plan: 'free' | 'essential' | 'abundance';
  ebook_count_this_month: number;
  quota_reset_at: string;
  created_at: string;
  updated_at: string;
  chat_usage?: number;
}

export interface MaketouOptions {
  apiKey: string;
  shopUrl: string;
  email: string;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}

export type PricingPlanId = 'free' | 'essential' | 'abundance';


export interface GenerationForm {
  nombre_pages: number;
  mots_par_page: number;
  avec_image: boolean;
  auteur: string;
  title: string;
  coverUrl: string;
  source_type: 'idea' | 'text' | 'youtube' | 'reel' | 'tiktok' | 'video' | 'audio' | 'vocal';
  source_content?: string;
  media_url?: string;
  customisation?: string;
  plan?: 'free' | 'essential' | 'abundance';
}

export enum Step {
  CONTENT = 0,
  NAMING = 1,
  DESIGN = 2,
  MOCKUP = 3,
  DASHBOARD = 4,
  SUCCESS = 5,
  ERROR = 6
}

export interface GeneratedItem {
  id: string;
  /* Added 'video' to the type union to support promo videos in production history */
  type: 'ebook' | 'cover' | 'mockup' | 'ad' | 'video';
  title: string;
  url: string;
  timestamp: number;
  expiresAt: number;
}

export interface StepProps {
  form: GenerationForm;
  updateForm: (updates: Partial<GenerationForm>) => void;
  onNext: (data?: any) => void;
  onPrev: () => void;
  onFail?: () => void;
  onModeChange?: (mode: any) => void;
  profile: UserProfile | null;
  user: User | null;
}

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

export const toast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  window.dispatchEvent(new CustomEvent('bookaio-notification', {
    detail: { message, type }
  }));
};