import React, { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { sendToWebhook } from '../../services/webhookService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { persistAndLog } from './StudioHelpers';
import { SuccessUI } from './SuccessUI';

export const AdForm: React.FC<{ user: any; profile: any }> = ({ user, profile }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Blob | null>(null);
    const [refImg, setRefImg] = useState('');
    const [description, setDescription] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async () => {
        setLoading(true);
        const blob = await sendToWebhook({ refImg, description }, 'ad');
        if (blob instanceof Blob && user) {
            setResult(blob);
            await persistAndLog(user.id, blob, `Arsenal Ad: ${description.slice(0, 20)}`, 'ad', 'ad_pro.png');
        }
        setLoading(false);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setLoading(true); const url = await uploadToCloudinary(file); setRefImg(url); setLoading(false); }
    };

    if (result) return <SuccessUI onReset={() => setResult(null)} title="Visuel Prêt" blob={result} filename="ad.png" user={user} />;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-3"><h3 className="text-4xl font-serif">Arsenal Publicitaire</h3><p className="text-white/40 text-lg">Générez des affiches marketing à haut taux de conversion.</p></div>
            <div className="space-y-8">
                <textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre offre ou vos arguments marketing..." className="w-full bg-white/5 border border-white/10 rounded-[32px] p-8 text-white focus:border-red-500/40 outline-none resize-none text-lg" />
                <button onClick={() => fileInputRef.current?.click()} className="w-full h-48 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center hover:bg-white/5 transition-all">
                    {refImg ? <img src={refImg} className="h-full w-full object-contain p-4" /> : <><Upload className="text-red-500 w-8 h-8 mb-4" /> <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Uploader Cover</span></>}
                </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
            <button onClick={handleSubmit} disabled={loading} className="w-full py-6 rounded-2xl gradient-amber text-white font-bold text-xl shadow-2xl shadow-red-500/20">
                {loading ? <div className="flex items-center gap-3"><Loader2 className="animate-spin" /> Création en cours...</div> : "Générer mon Arsenal"}
            </button>
        </div>
    );
};
