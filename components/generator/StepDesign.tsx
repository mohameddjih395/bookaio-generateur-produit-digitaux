import React, { useState, useRef } from 'react';
import { Lock, Wand2, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { StepProps } from '../../types';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { saveToHistory } from '../../services/webhookService';

export const StepDesign: React.FC<StepProps> = ({ form, updateForm, onNext, onPrev, onModeChange, profile, user }) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isFree = (profile?.plan || 'free') === 'free';

    const handleManualUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user) {
            setIsUploading(true);
            try {
                const url = await uploadToCloudinary(file);
                updateForm({ coverUrl: url });
                saveToHistory(user.id, {
                    title: form.title || 'Design Importé',
                    type: 'cover',
                    url
                });
            } catch (error) {
                alert("Erreur lors de l'upload de la couverture.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Couverture {isFree && '(Vérouillée)'}</label>
                    {isFree ? (
                        <div className="glass-card p-8 rounded-[32px] border-red-500/10 space-y-4">
                            <Lock className="w-6 h-6 text-red-500" />
                            <p className="text-sm font-bold">Inaccessible en mode Gratuit</p>
                            <p className="text-xs text-white/40">Le design de couverture est réservé aux membres payants.</p>
                            <a href="#pricing" className="block text-[10px] font-bold text-red-500 pt-2 uppercase tracking-widest">Débloquer maintenant</a>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <button
                                onClick={() => onModeChange?.('cover')}
                                className="w-full flex items-center gap-4 p-6 rounded-3xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-left transition-all group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Wand2 className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Créer avec l'IA</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Générateur Magique</p>
                                </div>
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="w-full flex items-center gap-4 p-6 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 text-left transition-all group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {isUploading ? <Loader2 className="w-6 h-6 text-white/40 animate-spin" /> : <Upload className="w-6 h-6 text-white/40" />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Uploader ma Cover</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Fichier JPG / PNG</p>
                                </div>
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleManualUpload} className="hidden" accept="image/*" />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Aperçu du Design</label>
                    <div className="aspect-[2/3] glass-card rounded-[40px] overflow-hidden border border-white/10 shadow-2xl relative group">
                        {form.coverUrl ? (
                            <>
                                <img src={form.coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Preview" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                                    <h4 className="font-serif text-xl leading-tight text-white mb-1">{form.title}</h4>
                                    <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/60">{form.auteur}</p>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center text-white/10 gap-4">
                                <ImageIcon className="w-16 h-16 opacity-10" />
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">En attente de design</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button onClick={onPrev} className="flex-1 py-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold uppercase text-xs">Retour</button>
                <button onClick={() => onNext()} className="flex-[2] py-6 rounded-2xl gradient-amber text-white font-bold text-xl shadow-lg shadow-red-500/20">Suivant</button>
            </div>
        </div>
    );
};
