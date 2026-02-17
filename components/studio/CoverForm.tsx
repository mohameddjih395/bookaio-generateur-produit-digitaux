import React, { useState, useRef } from 'react';
import { Upload, Loader2, Sparkles } from 'lucide-react';
import { sendToWebhook } from '../../services/webhookService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { persistAndLog } from './StudioHelpers';
import { SuccessUI } from './SuccessUI';

export const CoverForm: React.FC<{ onUseInEbook: (url: string) => void; user: any; profile: any }> = ({ onUseInEbook, user, profile }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Blob | null>(null);
    const [prompt, setPrompt] = useState('');
    const [refUrl, setRefUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const blob = await sendToWebhook({ prompt, refUrl, type: 'cover' }, 'cover');
        if (blob instanceof Blob && user) {
            setResult(blob);
            await persistAndLog(user.id, blob, `Cover: ${prompt.slice(0, 30)}`, 'cover', 'cover_ia.png');
        }
        setLoading(false);
    };

    const handleRefUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setLoading(true); const url = await uploadToCloudinary(file); setRefUrl(url); setLoading(false); }
    };

    if (result) return <SuccessUI onReset={() => setResult(null)} title="Design Terminé" blob={result} filename="cover.png" onUseInEbook={onUseInEbook} user={user} />;

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-700">
            <div className="space-y-3"><h3 className="text-4xl font-serif">Direction Artistique</h3><p className="text-white/40 text-lg">Générez un visuel iconique (Attente max 5 min).</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <textarea required rows={6} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Décrivez l'univers visuel souhaité..." className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-white focus:border-red-500/30 outline-none resize-none text-lg" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="h-full min-h-[160px] border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center hover:bg-white/5 transition-all">
                    {refUrl ? <img src={refUrl} className="h-full w-full object-cover rounded-3xl" /> : <><Upload className="text-red-500" /> <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Inspiration (Optionnel)</span></>}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleRefUpload} className="hidden" accept="image/*" />
            </div>
            <button disabled={loading} className="w-full py-6 rounded-2xl gradient-amber text-white font-bold text-xl flex items-center justify-center gap-3 shadow-xl shadow-red-500/10">
                {loading ? <div className="flex items-center gap-3"><Loader2 className="animate-spin" /> Production en cours...</div> : <><Sparkles className="w-6 h-6" /> Générer la Couverture</>}
            </button>
        </form>
    );
};
