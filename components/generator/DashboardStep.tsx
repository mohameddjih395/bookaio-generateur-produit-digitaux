import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export const DashboardStep: React.FC<{ resultData: any; onNext: () => void }> = ({ resultData, onNext }) => {
    const [progress, setProgress] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) { clearInterval(interval); setTimeout(() => setIsFinished(true), 500); return 100; }
                return prev + 2;
            });
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8 text-center py-10 animate-in fade-in duration-700">
            <h3 className="text-3xl font-serif">Production en cours</h3>
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90"><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" /><circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (progress / 100) * 440} className="text-red-500 transition-all duration-300" /></svg>
                <span className="absolute text-2xl font-bold text-white">{progress}%</span>
            </div>
            {isFinished && (
                <button onClick={() => { const a = document.createElement('a'); a.href = resultData.download_url; a.download = "Ebook_Elite.pdf"; a.click(); onNext(); }} className="w-full py-6 rounded-2xl gradient-amber text-white font-bold text-xl flex items-center justify-center gap-4 animate-bounce">
                    <Download className="w-6 h-6" /> Télécharger mon Ebook
                </button>
            )}
        </div>
    );
}
