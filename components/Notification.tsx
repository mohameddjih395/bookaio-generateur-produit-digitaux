import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
    message: string;
    type: NotificationType;
    onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
        error: 'bg-red-500/10 border-red-500/20 text-red-500',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-500'
    };

    const Icons = {
        success: CheckCircle2,
        error: XCircle,
        info: Info
    };

    const Icon = Icons[type];

    return (
        <div className={`fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-4 duration-300 ${styles[type]}`}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-[11px] font-bold uppercase tracking-widest">{message}</p>
            <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg transition-colors ml-2">
                <X className="w-4 h-4 opacity-40 hover:opacity-100" />
            </button>
        </div>
    );
};
