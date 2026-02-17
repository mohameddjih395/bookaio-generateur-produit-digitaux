import React from 'react';
import { StepProps } from '../../types';

export const StepNaming: React.FC<StepProps> = ({ form, updateForm, onNext, onPrev }) => (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Titre de l'Ebook</label>
                <input type="text" placeholder="Titre..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-white text-lg focus:border-red-500/50 outline-none" value={form.title} onChange={(e) => updateForm({ title: e.target.value })} />
            </div>
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Auteur</label>
                <input type="text" placeholder="Nom..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-white text-lg focus:border-red-500/50 outline-none" value={form.auteur} onChange={(e) => updateForm({ auteur: e.target.value })} />
            </div>
        </div>
        <div className="flex gap-4">
            <button onClick={onPrev} className="flex-1 py-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold uppercase text-xs">Retour</button>
            <button onClick={() => onNext()} className="flex-[2] py-6 rounded-2xl gradient-amber text-white font-bold text-xl">Suivant</button>
        </div>
    </div>
);
