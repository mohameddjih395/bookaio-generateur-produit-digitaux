import React, { useState, useEffect } from 'react';
import { BookOpen, Image as ImageIcon, Box, Megaphone, Lock, Zap, Video, ChevronRight, History } from 'lucide-react';
import { GeneratorForm } from './GeneratorForm';
import { GenerationForm } from '../types';
import { supabase } from '../services/supabaseClient';
import { CoverForm } from './studio/CoverForm';
import { MockupForm } from './studio/MockupForm';
import { AdForm } from './studio/AdForm';
import { VideoForm } from './studio/VideoForm';
import { HistoryUI } from './studio/HistoryUI';

type StudioMode = 'cover' | 'ebook' | 'mockup' | 'ad' | 'video' | 'history';

interface StudioProps {
  user: any;
  profile: any;
  onAuthRequired: () => void;
}

export const Studio: React.FC<StudioProps> = ({ user, profile }) => {
  const [mode, setMode] = useState<StudioMode>('cover');
  const [usageCount, setUsageCount] = useState(0);
  const [ebookForm, setEbookForm] = useState<GenerationForm>({
    nombre_pages: 5, nombre_chapitres: 3, mots_par_page: 300, avec_image: true,
    auteur: '', title: '', coverUrl: '', source_type: 'idea',
  });

  const plan = profile?.plan || 'free';
  const limits = { free: 1, essential: 3, abundance: 10 };
  const currentLimit = limits[plan as keyof typeof limits] || 1;

  const fetchUsage = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed');
    setUsageCount(count || 0);
  };

  useEffect(() => { fetchUsage(); }, [user, profile]);

  return (
    <section id="studio" className="py-24 px-6 relative min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card mb-12 p-8 rounded-[40px] border-red-500/10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl -z-10" />
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${plan !== 'free' ? 'gradient-amber shadow-red-500/40 rotate-12' : 'bg-white/5 border border-white/10'}`}>
              {plan === 'free' ? <Lock className="w-8 h-8 text-white/20" /> : <Zap className="w-8 h-8 text-white" />}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-1">Status de Privilège</p>
              <h3 className="text-2xl font-serif">Plan <span className="capitalize text-white">{plan}</span> Elite</h3>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md space-y-3">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
              <span className="text-white/40">Consommation Ebooks</span>
              <span className="text-red-500">{usageCount} / {currentLimit}</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
              <div className={`h-full rounded-full transition-all duration-1000 shadow-lg ${usageCount >= currentLimit ? 'bg-zinc-600' : 'gradient-amber shadow-red-500/30'}`} style={{ width: `${Math.min((usageCount / currentLimit) * 100, 100)}%` }} />
            </div>
          </div>
          {usageCount >= currentLimit && <a href="#pricing" className="px-8 py-4 rounded-2xl gradient-amber text-white font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Upgrade</a>}
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-80 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 sticky top-32 no-scrollbar">
            {[
              { id: 'cover', icon: ImageIcon, label: 'Design de Cover' },
              { id: 'ebook', icon: BookOpen, label: "Générer l'Ebook" },
              { id: 'mockup', icon: Box, label: 'Mockup 3D Elite' },
              { id: 'ad', icon: Megaphone, label: 'Arsenal Publicitaire' },
              { id: 'video', icon: Video, label: 'Vidéo Promo (Elite)', locked: plan === 'free' },
              { id: 'history', icon: History, label: 'Archives & Logs' },
            ].map((m) => (
              <button
                key={m.id}
                disabled={m.locked}
                onClick={() => setMode(m.id as any)}
                aria-label={m.label}
                className={`flex-shrink-0 md:flex-shrink-1 flex items-center justify-between px-6 py-5 rounded-2xl transition-all border whitespace-nowrap ${mode === m.id ? 'bg-red-500/10 border-red-500/40 text-white shadow-inner shadow-red-500/5' : 'hover:bg-white/5 border-transparent text-white/40'} ${m.locked ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-4"><m.icon className={`w-5 h-5 ${mode === m.id ? 'text-red-500' : ''}`} /> <span className="font-bold text-sm">{m.label}</span></div>
                {m.locked ? <Lock className="w-3 h-3 ml-2" /> : <ChevronRight className="hidden md:block w-4 h-4 opacity-30" />}
              </button>
            ))}
          </div>

          <div className="flex-1 w-full">
            <div className="glass-card rounded-[48px] p-8 md:p-14 relative overflow-hidden border-red-500/5 min-h-[600px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] -z-10 rounded-full" />
              {mode === 'ebook' && <GeneratorForm sharedForm={ebookForm} onSharedFormUpdate={setEbookForm} onModeChange={setMode} profile={profile} user={user} />}
              {mode === 'cover' && <CoverForm onUseInEbook={(url) => { setEbookForm({ ...ebookForm, coverUrl: url }); setMode('ebook'); }} user={user} profile={profile} />}
              {mode === 'mockup' && <MockupForm user={user} profile={profile} />}
              {mode === 'ad' && <AdForm user={user} profile={profile} />}
              {mode === 'video' && <VideoForm user={user} profile={profile} />}
              {mode === 'history' && <HistoryUI user={user} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
