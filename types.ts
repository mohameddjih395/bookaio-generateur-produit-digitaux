
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
  profile: any;
  user: any;
}

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}