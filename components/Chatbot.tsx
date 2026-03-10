
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Rocket, Flame, Ban, Sparkles } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

import { User, UserProfile } from '../types';

interface ChatbotProps {
  user: User | null;
  profile: UserProfile | null;
}

export const Chatbot: React.FC<ChatbotProps> = ({ user, profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Hé ! Je suis Booky, ton ouistiti de l'IA ! 🐵🚀 Je survole le marché pour te dénicher les meilleures idées d'ebooks. Qu'est-ce qu'on lance aujourd'hui ?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const plan = profile?.plan || 'free';
  const chatUsage = profile?.chat_usage || 0;
  const chatLimit = 25;
  const isLimited = plan === 'free' && chatUsage >= chatLimit;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || isLimited || !user) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // 1. Mise à jour de l'usage dans Supabase
      await supabase.from('profiles').update({ chat_usage: chatUsage + 1 }).eq('id', user.id);

      // 2. Webhook IA
      const response = await fetch('https://digitaladn225.app.n8n.cloud/webhook/bookaio-chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, user_id: user.id, plan, email: user.email }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.output || data.response || "Mon jetpack a eu un raté ! 🐵 Peux-tu répéter ?" }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: "Booky a perdu le signal... 🍌 Réessaie dans un instant !" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* High-visibility Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 md:bottom-8 right-6 z-[60] w-16 h-16 rounded-[24px] gradient-amber text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-95 ${!isOpen ? 'animate-bounce-slow shadow-red-500/50' : ''}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : (
          <div className="relative">
            <Rocket className="w-7 h-7" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-red-500 animate-ping" />
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-40 md:bottom-28 right-6 z-[60] w-[calc(100vw-3rem)] md:w-[400px] h-[600px] glass-card rounded-[40px] overflow-hidden flex flex-col shadow-[0_20px_100px_rgba(0,0,0,0.8)] border-red-500/20 animate-in slide-in-from-bottom-8 duration-500">

          {/* Elite Mascot Header */}
          <div className="relative p-6 border-b border-white/5 bg-red-500/5 flex flex-col items-center pt-16">
            {/* Booky flying above header */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
              <div className="w-24 h-24 rounded-[32px] bg-red-600 border-2 border-white/20 shadow-2xl flex items-center justify-center text-5xl animate-float-booky relative overflow-hidden">
                🐵
                <div className="absolute -right-1 -bottom-1 bg-zinc-900 p-1 rounded-lg border border-white/5">
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                </div>
              </div>
              <div className="w-14 h-2 bg-black/60 blur-md rounded-full mt-3 animate-shadow-booky opacity-40" />
            </div>

            <div className="text-center">
              <h3 className="font-serif text-2xl flex items-center gap-2 justify-center">Booky <span className="text-red-500">Elite</span></h3>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Survol de Niche Actif</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide" ref={scrollRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-red-500 text-white rounded-tr-none' : 'bg-white/5 border border-white/5 text-white/80 rounded-tl-none'
                  }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full animate-bounce" />
                  <span className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input & Usage */}
          <div className="p-4 bg-black/40 border-t border-white/5">
            <div className="flex justify-between items-center mb-3 px-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">Jetpack Usage: {chatUsage} / {plan === 'free' ? chatLimit : '∞'}</p>
              {plan === 'free' && <a href="#pricing" className="text-[9px] font-bold text-red-500 uppercase tracking-widest hover:underline">Full Access</a>}
            </div>

            {isLimited ? (
              <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-center animate-in zoom-in">
                <Ban className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <p className="text-[10px] font-bold uppercase text-red-500">Limite Atteinte 🍌</p>
                <p className="text-[9px] text-white/40 mt-1 uppercase">Passez en Elite pour discuter sans limite avec Booky.</p>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={!user ? "Connectez-vous..." : "Écris à Booky..."}
                  disabled={!user}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-white focus:border-red-500/40 transition-all outline-none text-sm placeholder:text-white/10"
                />
                <button onClick={sendMessage} disabled={!input.trim() || isLoading || !user} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl gradient-amber flex items-center justify-center text-white shadow-lg active:scale-95 transition-all">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes float-booky {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes shadow-booky {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(0.7); opacity: 0.1; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float-booky { animation: float-booky 4s ease-in-out infinite; }
        .animate-shadow-booky { animation: shadow-booky 4s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 2.5s ease-in-out infinite; }
      `}</style>
    </>
  );
};
