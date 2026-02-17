import React, { useState, useRef, useEffect } from 'react';
import { Lightbulb, FileText, Youtube, Instagram, Video, Music, Mic, Lock, Sparkles, ChevronRight, Square } from 'lucide-react';
import { StepProps } from '../../types';
import { uploadToCloudinary } from '../../services/cloudinaryService';

export const StepContent: React.FC<StepProps> = ({ form, updateForm, onNext, profile }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordTime, setRecordTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<number | null>(null);

    const plan = profile?.plan || 'free';
    const isFree = plan === 'free';
    const maxPages = isFree ? 8 : 40;

    const sources = [
        { id: 'idea', icon: Lightbulb, label: 'Idée' },
        { id: 'text', icon: FileText, label: 'Texte' },
        { id: 'youtube', icon: Youtube, label: 'YouTube' },
        { id: 'reel', icon: Instagram, label: 'Reel' },
        { id: 'tiktok', icon: Video, label: 'TikTok' },
        { id: 'video', icon: Video, label: 'Vidéo' },
        { id: 'audio', icon: Music, label: 'Audio' },
        { id: 'vocal', icon: Mic, label: 'Vocal', locked: isFree },
    ];

    const startRecording = async () => {
        if (isFree) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
                setIsUploading(true);
                try { const url = await uploadToCloudinary(file); updateForm({ media_url: url }); } catch (error) { alert("Erreur vocal."); } finally { setIsUploading(false); }
            };
            mediaRecorder.start();
            setIsRecording(true);
            setRecordTime(0);
            timerRef.current = window.setInterval(() => setRecordTime(prev => prev + 1), 1000);
        } catch (err) { alert("Microphone inaccessible."); }
    };

    const stopRecording = () => { if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); if (timerRef.current) clearInterval(timerRef.current); } };

    const handlePageChange = (val: string) => {
        const num = parseInt(val) || 0;
        if (num > maxPages) {
            updateForm({ nombre_pages: maxPages });
        } else {
            updateForm({ nombre_pages: num });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sources.map((src) => (
                    <button key={src.id} type="button" disabled={src.locked} onClick={() => updateForm({ source_type: src.id as any })} className={`p-6 rounded-[28px] flex flex-col items-center gap-3 transition-all border relative overflow-hidden ${form.source_type === src.id ? 'border-red-500 bg-red-500/10 text-white shadow-lg' : 'border-white/5 bg-white/5 text-white/40 hover:bg-white/10 hover:border-white/10'} ${src.locked ? 'opacity-50' : ''}`}>
                        {src.locked && <Lock className="absolute top-2 right-2 w-3 h-3 text-red-500" />}
                        <src.icon className={`w-7 h-7 ${form.source_type === src.id ? 'text-red-500' : ''}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{src.label}</span>
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {['youtube', 'reel', 'tiktok'].includes(form.source_type) && <input type="url" placeholder="Lien source..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:border-red-500/50 outline-none" value={form.media_url || ''} onChange={(e) => updateForm({ media_url: e.target.value })} />}
                {form.source_type === 'vocal' && !isFree && (
                    <div className="flex flex-col items-center justify-center gap-6 p-12 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl">
                        {isRecording ? (
                            <div className="flex flex-col items-center gap-4">
                                <Square className="w-12 h-12 text-red-500 animate-pulse" />
                                <p className="text-2xl font-mono text-red-500 font-bold">{Math.floor(recordTime / 60)}:{(recordTime % 60).toString().padStart(2, '0')}</p>
                                <button onClick={stopRecording} className="px-8 py-3 rounded-xl bg-red-500 text-white font-bold uppercase text-xs">Arrêter</button>
                            </div>
                        ) : <button onClick={startRecording} className="px-8 py-3 rounded-xl bg-red-500 text-white font-bold uppercase text-xs">Démarrer Vocal</button>}
                    </div>
                )}
                {['idea', 'text'].includes(form.source_type) && <textarea rows={4} placeholder="Décrivez votre ebook..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-white focus:border-red-500/50 outline-none resize-none" value={form.source_content || ''} onChange={(e) => updateForm({ source_content: e.target.value })} />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Pages (Max {maxPages})</label>
                    <div className="relative">
                        <input type="number" min="1" max={maxPages} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-bold pr-12 outline-none" value={form.nombre_pages} onChange={(e) => handlePageChange(e.target.value)} />
                        {form.nombre_pages >= maxPages && <Sparkles className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />}
                    </div>
                </div>
                <div className="space-y-3"><label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Chapitres</label><input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-bold outline-none" value={form.nombre_chapitres} onChange={(e) => updateForm({ nombre_chapitres: parseInt(e.target.value) || 0 })} /></div>
                <div className="space-y-3"><label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Mots/Page</label><input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-bold outline-none" value={form.mots_par_page} onChange={(e) => updateForm({ mots_par_page: parseInt(e.target.value) || 0 })} /></div>
            </div>

            <button onClick={() => onNext()} className="w-full py-6 rounded-2xl gradient-amber text-white font-bold text-xl flex items-center justify-center gap-3 shadow-xl shadow-red-500/10">Suivant <ChevronRight className="w-6 h-6" /></button>
        </div>
    );
};
