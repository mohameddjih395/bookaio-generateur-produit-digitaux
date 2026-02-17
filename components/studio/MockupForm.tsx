import React, { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { sendToWebhook } from '../../services/webhookService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { persistAndLog } from './StudioHelpers';
import { SuccessUI } from './SuccessUI';

export const MockupForm: React.FC<{ user: any; profile: any }> = ({ user, profile }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Blob | null>(null);
    const [mockupType, setMockupType] = useState('solo');
    const [coverUrl, setCoverUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async () => {
        if (!coverUrl) return alert("Veuillez d'abord importer une couverture.");
        setLoading(true);
        const blob = await sendToWebhook({ coverUrl, mockupType }, 'mockup');
        if (blob instanceof Blob && user) {
            setResult(blob);
            await persistAndLog(user.id, blob, `Mockup 3D (${mockupType})`, 'mockup', 'mockup_elite.png');
        }
        setLoading(false);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setLoading(true); const url = await uploadToCloudinary(file); setCoverUrl(url); setLoading(false); }
    };

    if (result) return <SuccessUI onReset={() => setResult(null)} title="Mockup Prêt" blob={result} filename="mockup.png" user={user} />;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-3"><h3 className="text-4xl font-serif">Mise en Scène 3D</h3><p className="text-white/40 text-lg">Convertissez votre design en un objet tangible haute définition.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <button onClick={() => fileInputRef.current?.click()} className="h-64 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center group overflow-hidden relative">
                    {coverUrl ? <img src={coverUrl} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <><Upload className="text-red-500 mb-2" /> <span className="text-xs font-bold uppercase text-white/40 tracking-widest">Importer Cover</span></>}
                </button>
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase text-white/40 tracking-widest">Type de Rendu</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['solo', 'pack', 'tablet', 'box'].map(t => (
                            <button key={t} onClick={() => setMockupType(t)} className={`p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${mockupType === t ? 'border-red-500 bg-red-500/10 text-white shadow-lg shadow-red-500/10' : 'border-white/10 hover:bg-white/5 text-white/40'}`}>{t}</button>
                        ))}
                    </div>
                </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
            <button onClick={handleSubmit} disabled={loading || !coverUrl} className="w-full py-6 rounded-2xl gradient-amber text-white font-bold text-xl flex items-center justify-center gap-3 shadow-xl">
                {loading ? <div className="flex items-center gap-3"><Loader2 className="animate-spin" /> Rendu 3D en cours...</div> : "Lancer le Rendu Elite"}
            </button>
        </div>
    );
};
