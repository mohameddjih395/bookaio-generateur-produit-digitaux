import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const SuccessStep: React.FC<{ onGoToDashboard: () => void }> = ({ onGoToDashboard }) => (
    <div className="flex flex-col items-center text-center gap-10 py-16 animate-in zoom-in">
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30"><CheckCircle2 className="w-12 h-12 text-emerald-500" /></div>
        <div className="space-y-4"><h2 className="text-4xl font-serif">Actif Créé !</h2><p className="text-white/40 max-w-sm">Votre produit digital a été ajouté à votre coffre-fort Elite.</p></div>
        <div className="flex gap-4 w-full max-w-md">
            <button onClick={() => window.location.reload()} className="flex-1 py-5 rounded-2xl border border-white/10 text-white font-bold uppercase text-xs">Nouveau Projet</button>
            <button onClick={onGoToDashboard} className="flex-1 py-5 rounded-2xl bg-white/5 text-white font-bold uppercase text-xs">Mes Archives</button>
        </div>
    </div>
);
