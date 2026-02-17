
import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 md:py-6 pointer-events-none">
      <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-red-500/30 shadow-lg shadow-red-500/10 group-hover:scale-110 transition-transform">
            <img src="https://res.cloudinary.com/dt9sxjxve/image/upload/v1769591812/Untitled_design_4_fhluy3.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-xl tracking-tighter">Book<span className="text-red-500">AIO</span></span>
        </div>

        <div className="hidden md:flex items-center gap-10 glass px-10 py-3 rounded-2xl border-white/5">
          <a href="#how-it-works" aria-label="Comment ça marche" className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Processus</a>
          <a href="#studio" aria-label="Accéder au Studio" className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Studio</a>
          <a href="#pricing" aria-label="Voir les tarifs" className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Tarifs</a>
        </div>

        <a href="#studio" aria-label="Créer un nouveau projet" className="px-6 py-3 rounded-xl border border-red-500/20 text-xs font-bold uppercase tracking-widest hover:bg-red-500/5 transition-all text-red-500 shine-effect">
          Créer un Projet
        </a>
      </div>
    </nav>
  );
};
