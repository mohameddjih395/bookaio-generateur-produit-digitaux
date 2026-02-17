import React, { useState, useEffect } from 'react';
import { CheckCircle2, Download } from 'lucide-react';

export const SuccessUI: React.FC<{ onReset: () => void; title: string; blob: Blob | null; filename: string; onUseInEbook?: (url: string) => void; user: any }> = ({ onReset, title, blob, filename, onUseInEbook, user }) => {
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const isVideo = filename.endsWith('.mp4');

    useEffect(() => { if (blob) { const url = URL.createObjectURL(blob); setMediaUrl(url); return () => URL.revokeObjectURL(url); } }, [blob]);

    return (
        <div className="flex flex-col items-center text-center gap-10 py-16 animate-in zoom-in">
            <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30 shadow-[0_0_30px_rgba(225,29,72,0.2)]"><CheckCircle2 className="w-12 h-12 text-red-500" /></div>
            <div className="space-y-2">
                <h3 className="text-4xl font-serif">{title}</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">Actif sauvegardé dans votre Coffre-fort</p>
            </div>
            {mediaUrl && (
                <div className="w-full max-w-md aspect-video rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-black/40">
                    {isVideo ? <video src={mediaUrl} controls className="w-full h-full object-contain" /> : <img src={mediaUrl} className="w-full h-full object-cover" />}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                <button onClick={() => { const a = document.createElement('a'); a.href = mediaUrl!; a.download = filename; a.click(); }} className="py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Télécharger mon Actif
                </button>
                {onUseInEbook && mediaUrl && (
                    <button onClick={() => onUseInEbook(mediaUrl)} className="py-5 rounded-2xl gradient-amber text-white font-bold uppercase text-[10px] tracking-widest shadow-xl">
                        Utiliser pour Ebook
                    </button>
                )}
                <button onClick={onReset} className="py-5 rounded-2xl border border-white/10 text-white/40 font-bold uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all col-span-full">Nouveau Projet</button>
            </div>
        </div>
    );
};
