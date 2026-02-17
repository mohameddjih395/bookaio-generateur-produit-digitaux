
import React from 'react';
import { Layers, MousePointer2, Zap, FileText, Share2, Sparkles, Layout } from 'lucide-react';


export const HeroIllustration: React.FC = () => {
  const cards = [
    { pos: 'top-0 left-[5%] md:left-[10%]', label: 'CONTENU', text: 'Rédaction IA', icon: FileText, delay: '0s' },
    { pos: 'top-10 right-[5%] md:right-[10%]', label: 'DESIGN', text: 'Mockups 3D', icon: Layers, delay: '0.5s' },
    { pos: 'bottom-0 left-[5%] md:left-[15%]', label: 'LAYOUT', text: 'Formatage PDF', icon: Layout, delay: '1s' },
    { pos: 'bottom-0 right-[5%] md:right-[15%]', label: 'ADS', text: 'Visuels Promo', icon: Share2, delay: '1.5s' },
  ];

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center pointer-events-none scale-90 md:scale-100">
      {/* Central Core */}
      <div className="relative z-20 w-44 h-44 rounded-[48px] bg-[#0a0a0a] border border-red-500/30 flex items-center justify-center shadow-[0_0_80px_rgba(225,29,72,0.2)] animate-float-slow">
        <div className="absolute inset-4 rounded-[36px] bg-red-500/5 border border-red-500/10" />
        <Zap className="w-16 h-16 text-red-500 drop-shadow-[0_0_15px_rgba(225,29,72,0.5)]" />

        {/* Orbital Backgrounds */}
        <div className="absolute -inset-12 border border-red-500/5 rounded-full animate-[spin_20s_linear_infinite]" />
        <div className="absolute -inset-24 border border-red-500/5 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
        <div className="absolute -inset-40 border border-red-500/5 rounded-full" />
      </div>

      {cards.map((card, i) => (
        <div
          key={i}
          className={`absolute ${card.pos} z-30 flex items-center gap-5 p-5 rounded-[24px] bg-[#0a0a0a] border border-red-500/20 shadow-2xl transition-all duration-700 animate-float-slow group`}
          style={{ animationDelay: card.delay }}
        >
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center transition-transform group-hover:scale-110">
            <card.icon className="w-6 h-6 text-red-500" />
          </div>
          <div className="text-left pr-4">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-[0.2em] mb-0.5">{card.label}</p>
            <p className="text-sm font-bold text-white tracking-tight">{card.text}</p>
          </div>

          {/* Subtle Glow behind each card */}
          <div className="absolute inset-0 bg-red-500/5 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ))}

      {/* Connection Lines (Refined SVG) */}
      <svg className="absolute inset-0 w-full h-full opacity-30 z-10" viewBox="0 0 1000 500">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e11d4800" />
            <stop offset="50%" stopColor="#e11d4844" />
            <stop offset="100%" stopColor="#e11d4800" />
          </linearGradient>
        </defs>
        {/* Curved dotted paths from center to card positions approx */}
        <path d="M500 250 Q300 150 200 100" stroke="url(#lineGrad)" strokeWidth="1" fill="none" strokeDasharray="6 6" className="animate-[pulse_4s_ease-in-out_infinite]" />
        <path d="M500 250 Q700 150 800 100" stroke="url(#lineGrad)" strokeWidth="1" fill="none" strokeDasharray="6 6" className="animate-[pulse_4s_ease-in-out_infinite] delay-500" />
        <path d="M500 250 Q300 350 250 450" stroke="url(#lineGrad)" strokeWidth="1" fill="none" strokeDasharray="6 6" className="animate-[pulse_4s_ease-in-out_infinite] delay-1000" />
        <path d="M500 250 Q700 350 750 450" stroke="url(#lineGrad)" strokeWidth="1" fill="none" strokeDasharray="6 6" className="animate-[pulse_4s_ease-in-out_infinite] delay-1500" />
      </svg>
    </div>
  );
};
