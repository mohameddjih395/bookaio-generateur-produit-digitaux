import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { sendToWebhook } from '../../services/webhookService';
import { persistAndLog } from './StudioHelpers';
import { SuccessUI } from './SuccessUI';

export const VideoForm: React.FC<{ user: any; profile: any }> = ({ user, profile }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Blob | null>(null);
    const [description, setDescription] = useState('');

    const handleSubmit = async () => {
        setLoading(true);
        const blob = await sendToWebhook({ description, type: 'video' }, 'video');
        if (blob instanceof Blob && user) {
            setResult(blob);
            await persistAndLog(user.id, blob, `Vidéo Promo Elite`, 'video', 'promo_elite.mp4');
        }
        setLoading(false);
    };

    if (result) return <SuccessUI onReset={() => setResult(null)} title="Vidéo Générée" blob={result} filename="promo.mp4" user={user} />;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-3"><h3 className="text-4xl font-serif">Production Vidéo Elite</h3><p className="text-white/40 text-lg">Créez un spot publicitaire cinématographique (Attente max 5 min).</p></div>
            <textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez l'ambiance, les textes et le style de la vidéo promo..." className="w-full bg-white/5 border border-white/10 rounded-[32px] p-8 text-white focus:border-red-500/40 outline-none resize-none text-lg" />
            <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20 flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-1" />
                <p className="text-xs text-white/60 leading-relaxed">La production vidéo est un processus lourd. Ne fermez pas votre onglet. Nous avons augmenté le délai d'attente à 5 minutes pour garantir la réception du fichier.</p>
            </div>
            <button onClick={handleSubmit} disabled={loading} className="w-full py-6 rounded-2xl gradient-amber text-white font-bold text-xl shadow-2xl shadow-red-500/20">
                {loading ? <div className="flex items-center gap-3 justify-center"><Loader2 className="animate-spin" /> Rendu vidéo cinématographique (5min max)...</div> : "Lancer la production vidéo"}
            </button>
        </div>
    );
};
