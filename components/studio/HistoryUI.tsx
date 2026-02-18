import React, { useState, useEffect } from 'react';
import { Clock, Trash2, FileText, Play, Layout, ExternalLink, Copy } from 'lucide-react';
import { GeneratedItem } from '../../types';
import { supabase } from '../../services/supabaseClient';

export const HistoryUI: React.FC<{ user: any }> = ({ user }) => {
    const [history, setHistory] = useState<GeneratedItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadHistory = async () => {
        if (!user) return;
        setIsLoading(true);
        const { data, error } = await supabase
            .from('generations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (data) {
            setHistory(data.map(item => ({
                id: item.id,
                type: item.type,
                title: item.title,
                url: item.url,
                timestamp: new Date(item.created_at).getTime(),
                expiresAt: 0 // Plus besoin d'expiration avec la DB persistante
            })));
        } else if (error) {
            console.error("Erreur chargement historique:", error);
            // Fallback éventuel sur localStorage si souhaité, 
            // mais on privilégie la source de vérité DB désormais.
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadHistory();
        window.addEventListener('historyUpdated', loadHistory);
        return () => window.removeEventListener('historyUpdated', loadHistory);
    }, [user]);

    const clear = async () => {
        if (confirm("Voulez-vous vider définitivement vos archives cloud ?")) {
            const { error } = await supabase.from('generations').delete().eq('user_id', user.id);
            if (!error) setHistory([]);
            else alert("Erreur lors de la suppression.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div><h3 className="text-3xl font-serif">Laboratoire d'Archives</h3><p className="text-white/40 text-sm">Tous vos actifs (Images, Vidéos, PDF) sauvegardés durablement.</p></div>
                <button onClick={clear} className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
                {isLoading ? (
                    <div className="py-20 text-center"><p className="animate-pulse text-white/20 uppercase tracking-widest text-[10px] font-bold">Synchronisation du coffre-fort...</p></div>
                ) : history.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center gap-4">
                        <Clock className="w-12 h-12 text-white/5" />
                        <p className="text-white/20 font-bold uppercase tracking-widest text-[10px]">Votre coffre-fort cloud est vide</p>
                    </div>
                ) : history.map(item => (
                    <div key={item.id} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between group hover:bg-white/[0.05] transition-all hover:border-red-500/20">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                                {item.type === 'ebook' ? <FileText className="w-5 h-5 text-red-500" /> : item.type === 'video' ? <Play className="w-5 h-5 text-red-500" /> : <Layout className="w-5 h-5 text-red-500" />}
                            </div>
                            <div><p className="text-sm font-bold text-white truncate max-w-[200px]">{item.title}</p><p className="text-[10px] text-white/20 uppercase tracking-widest">{item.type} • {new Date(item.timestamp).toLocaleString()}</p></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(item.url);
                                    alert("Lien copié !");
                                }}
                                aria-label="Copier le lien"
                                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-black/20 transition-all text-white/60 hover:text-white"
                            >
                                <Copy className="w-5 h-5" />
                            </button>
                            <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label="Ouvrir le lien" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500 hover:text-white transition-all"><ExternalLink className="w-5 h-5" /></a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
