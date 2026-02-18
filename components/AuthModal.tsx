
import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, User, Chrome } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateForm = (): string | null => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Veuillez entrer une adresse email valide.';
    }
    if (password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    return null;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });

      if (authError) throw authError;

      if (!isLogin) {
        setSuccessMessage('Inscription réussie ! Vérifiez votre boîte mail pour confirmer votre compte.');
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'authentification.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (googleError) throw googleError;
    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion avec Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-md glass-card rounded-[48px] p-10 border-white/10 animate-in zoom-in duration-300 shadow-[0_0_80px_rgba(225,29,72,0.1)]">
        <button onClick={onClose} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl overflow-hidden mx-auto mb-6 border border-red-500/30 shadow-2xl shadow-red-500/10">
            <img src="https://res.cloudinary.com/dt9sxjxve/image/upload/v1769591812/Untitled_design_4_fhluy3.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-3xl font-serif font-bold tracking-tight">{isLogin ? 'Accès Privé' : 'Inscription Elite'}</h2>
          <p className="text-white/40 text-sm mt-3 leading-relaxed">
            {isLogin ? 'Reprenez le contrôle de votre empire numérique.' : 'Bâtissez votre patrimoine avec l\'élite de l\'IA.'}
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 mb-8 rounded-2xl bg-white/5 border border-white/10 text-white font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all text-[10px] tracking-widest uppercase shadow-lg"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Chrome className="w-5 h-5 text-red-500" />}
          Continuer avec Google
        </button>

        <div className="flex items-center gap-4 mb-8 text-white/5">
          <div className="flex-1 h-px bg-current" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">Authentification Email</span>
          <div className="flex-1 h-px bg-current" />
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-red-500 transition-colors" />
            <input
              type="email"
              placeholder="Adresse Email"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:border-red-500/40 outline-none transition-all placeholder:text-white/10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-red-500 transition-colors" />
            <input
              type="password"
              placeholder="Mot de passe"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:border-red-500/40 outline-none transition-all placeholder:text-white/10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest text-center animate-shake">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest text-center">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 rounded-2xl gradient-amber text-white font-bold uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-2xl shadow-red-500/20 shine-effect"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Se Connecter' : 'Créer mon Compte')}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 hover:text-red-500 transition-colors"
          >
            {isLogin ? "Nouveau ici ? Créer un compte" : "Déjà inscrit ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};
