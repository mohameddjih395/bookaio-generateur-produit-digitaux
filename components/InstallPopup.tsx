
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, ArrowUpCircle } from 'lucide-react';
import { toast } from '../types';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPopup: React.FC = () => {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Pour iOS, on affiche une instruction manuelle car beforeinstallprompt n'est pas supporté
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;

    if (isStandalone) return;

    if (isIOS) {
      // Afficher après 5 secondes pour iOS
      const timer = setTimeout(() => setShow(true), 5000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
      }
      setDeferredPrompt(null);
    } else {
      // Instruction pour iOS
      toast("Pour installer : Partager -> Sur l'écran d'accueil.", "info");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-28 md:bottom-8 left-6 right-6 md:left-auto md:right-24 z-[70] animate-in slide-in-from-bottom-8 duration-500">
      <div className="glass-card rounded-3xl p-6 border-red-500/20 shadow-2xl flex items-center gap-4 pr-12 relative overflow-hidden max-w-sm">
        <div className="absolute inset-0 bg-red-500/5 -z-10" />
        <button onClick={() => setShow(false)} className="absolute top-3 right-3 text-white/20 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/30">
          <Smartphone className="w-6 h-6 text-red-500" />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-bold text-white leading-tight">Installer BookAIO</p>
          <p className="text-[10px] text-white/40 font-medium">Accédez à votre studio instantanément depuis votre écran d'accueil.</p>
          <button
            onClick={handleInstall}
            className="text-[10px] font-bold uppercase tracking-widest text-red-500 pt-1 flex items-center gap-1.5 hover:gap-2 transition-all"
          >
            Installer maintenant <ArrowUpCircle className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
