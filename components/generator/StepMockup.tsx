import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { StepProps } from '../../types';
import { supabase } from '../../services/supabaseClient';
import { sendToWebhook, saveToHistory } from '../../services/webhookService';

export const StepMockup: React.FC<StepProps> = ({ form, onPrev, onNext, onFail, profile, user }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [limitReached, setLimitReached] = useState(false);
    const [checking, setChecking] = useState(true);

    const checkUsage = async () => {
        if (!user) return;

        const plan = profile?.plan || 'free';
        const limits = { free: 1, essential: 3, abundance: 10 };
        const max = limits[plan as keyof typeof limits] || 1;

        const { count, error } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'completed');

        if (!error && count !== null && count >= max) setLimitReached(true);
        setChecking(false);
    };

    useEffect(() => { checkUsage(); }, [profile, user]);

    const handleFinalSubmit = async () => {
        if (limitReached || !user) return;
        setIsSubmitting(true);
        const result = await sendToWebhook(form, 'ebook');
        if (result) {
            await supabase.from('orders').insert({
                user_id: user.id,
                title: form.title,
                status: 'completed',
                nombre_pages: form.nombre_pages,
                cover_url: form.coverUrl
            });

            const downloadUrl = result instanceof Blob ? URL.createObjectURL(result) : result.download_url;
            saveToHistory(user.id, {
                title: form.title || 'Ebook Sans Titre',
                type: 'ebook',
                url: downloadUrl
            });
            onNext({ download_url: downloadUrl });
        } else { if (onFail) onFail(); }
        setIsSubmitting(false);
    };

    if (checking) return <div className="py-20 flex flex-col items-center gap-4"><Loader2 className="w-10 h-10 animate-spin text-red-500" /><p className="text-white/40 uppercase tracking-widest text-xs">Vérification...</p></div>;

    return (
        <div className="space-y-10 text-center animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-8">
                <div className="w-48 aspect-[2/3] glass-card rounded-[24px] overflow-hidden shadow-2xl relative border-red-500/20">
                    {form.coverUrl && <img src={form.coverUrl} className="absolute inset-0 w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-black/40 p-4 flex flex-col justify-end text-left">
                        <h4 className="font-serif text-lg leading-tight text-white">{form.title}</h4>
                        <p className="text-[6px] uppercase tracking-widest text-white/50">{form.auteur}</p>
                    </div>
                </div>
                <h3 className="text-3xl font-serif">Prêt pour la Production</h3>
                {limitReached && (
                    <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 max-w-sm flex flex-col items-center gap-2">
                        <AlertTriangle className="w-6 h-6" />
                        <p className="font-bold text-sm">Limite atteinte ({profile?.plan || 'Free'})</p>
                        <a href="#pricing" className="text-[10px] font-bold uppercase tracking-widest underline mt-2">Voir les tarifs</a>
                    </div>
                )}
            </div>
            <div className="flex gap-4">
                <button onClick={onPrev} disabled={isSubmitting} className="flex-1 py-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold uppercase text-xs">Modifier</button>
                <button onClick={handleFinalSubmit} disabled={isSubmitting || limitReached} className={`flex-[2] py-6 rounded-2xl font-bold text-xl ${limitReached ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'gradient-amber text-white shadow-xl shadow-red-500/20'}`}>
                    {isSubmitting ? <Loader2 className="w-7 h-7 animate-spin mx-auto" /> : (limitReached ? "Limite Atteinte" : "Lancer la production")}
                </button>
            </div>
        </div>
    );
};
