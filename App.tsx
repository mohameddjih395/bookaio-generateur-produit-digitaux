import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { BottomBar } from './components/BottomBar';
import { Typewriter } from './components/Typewriter';
import { HeroIllustration } from './components/HeroIllustration';
import { AuthModal } from './components/AuthModal';
import { InstallPopup } from './components/InstallPopup';
import { Testimonials } from './components/Testimonials';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sparkles, ChevronRight, Zap, Trophy, Target, ArrowDown, LogOut, Loader2 } from 'lucide-react';
import { supabase } from './services/supabaseClient';

// Lazy-load heavy components to reduce initial bundle size
const Studio = lazy(() => import('./components/Studio').then(m => ({ default: m.Studio })));
const HowItWorks = lazy(() => import('./components/HowItWorks').then(m => ({ default: m.HowItWorks })));
const Pricing = lazy(() => import('./components/Pricing').then(m => ({ default: m.Pricing })));
const Chatbot = lazy(() => import('./components/Chatbot').then(m => ({ default: m.Chatbot })));
const FAQ = lazy(() => import('./components/FAQ').then(m => ({ default: m.FAQ })));
const PaymentSuccessModal = lazy(() => import('./components/PaymentSuccessModal').then(m => ({ default: m.PaymentSuccessModal })));

// Minimal loading fallback
const SectionLoader = () => (
  <div className="py-24 flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-red-500/40 animate-spin" />
  </div>
);

const App: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeSuccessPlan, setActiveSuccessPlan] = useState<'essential' | 'abundance' | null>(null);

  const fetchProfile = async (userId: string, userEmail?: string) => {
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // First login: create the profile
      const { data: newData } = await supabase.from('profiles').insert({
        id: userId,
        email: userEmail,
        plan: 'free',
      }).select().single();
      data = newData;
    }

    if (data) setUserProfile(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handlePaymentSuccess = async (plan: 'essential' | 'abundance') => {
    // NOTE: The authoritative plan update happens via Paystack webhook → n8n → Supabase.
    // This only refreshes the local UI state after the Paystack modal closes.
    // We re-fetch the profile from DB to get the server-confirmed plan.
    if (user) {
      await fetchProfile(user.id, user.email);
    }
    setActiveSuccessPlan(plan);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen selection:bg-red-500/30">
        <Navbar />

        {/* User Status Control */}
        <div className="fixed top-24 right-6 z-40 hidden md:block">
          {user ? (
            <div className="flex items-center gap-4 glass px-4 py-2 rounded-2xl border-white/10 animate-in slide-in-from-right-4 shadow-xl">
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase text-white/30">Membre {userProfile?.plan || 'Free'}</p>
                <p className="text-[10px] font-bold text-red-500 truncate max-w-[120px]">{user.email}</p>
              </div>
              <button onClick={handleSignOut} className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 transition-colors text-white/40 hover:text-red-500">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="glass-card px-6 py-3 rounded-2xl border-red-500/20 text-[10px] font-bold uppercase tracking-widest text-white hover:border-red-500 transition-all flex items-center gap-2"
            >
              Se Connecter <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <header className="relative pt-20 md:pt-24 pb-16 px-6 overflow-hidden flex flex-col items-center">
          <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-full h-[500px] bg-red-600/5 blur-[150px] -z-10 rounded-full" />
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass border-white/5 mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
              <img src="https://res.cloudinary.com/dt9sxjxve/image/upload/v1768953839/5_STARS_sn08pn.png" alt="Elite" className="w-16 h-3 object-contain opacity-80" />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-red-500/80">L'Elite de la création de produit numérique</span>
            </div>
            <h1 className="text-6xl md:text-[8.5rem] font-serif max-w-7xl leading-[0.9] mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 tracking-tighter">
              Transformez <br /><Typewriter /> <br />en un produit digital.
            </h1>
            <p className="text-white/40 text-lg md:text-xl max-w-2xl mb-8 animate-in fade-in duration-1000 delay-300 leading-relaxed">
              Passez de l'idée brute à un produit PDF prêt-à-vendre. BookAIO automatise la rédaction, le design et vos visuels pour un lancement immédiat.
            </p>
            <div className="flex flex-col md:flex-row gap-4 animate-in fade-in duration-1000 delay-500 z-20 mb-12">
              <a href="#studio" className="px-12 py-5 rounded-2xl gradient-amber text-white font-bold text-lg hover:scale-105 transition-all flex items-center justify-center gap-2 group shadow-2xl shadow-red-500/20 shine-effect">
                Accéder au Studio <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#how-it-works" className="px-10 py-5 rounded-2xl glass border-white/10 font-bold text-lg hover:bg-white/5 transition-all flex items-center gap-2">
                Comment ça marche ? <ArrowDown className="w-4 h-4 opacity-40" />
              </a>
            </div>
            <div className="w-full mb-12"><Testimonials isLoggedIn={!!user} onAuthClick={() => setIsAuthOpen(true)} /></div>
            <div className="w-full max-w-5xl animate-in fade-in zoom-in duration-1000 delay-700"><HeroIllustration /></div>
          </div>
        </header>

        <section className="py-20 border-y border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: 'Ebooks Générés', val: '+1568+', icon: Zap },
              { label: 'Visuels de Vente', val: '+974', icon: Target },
              { label: 'Succès Client', val: '97%', icon: Trophy },
              { label: 'Délai Moyen', val: '< 45s', icon: Zap }
            ].map((stat) => (
              <div key={stat.label} className="text-center md:text-left space-y-1 group">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-white/40 group-hover:text-red-500 transition-colors">
                  <stat.icon className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{stat.label}</span>
                </div>
                <p className="text-4xl font-serif font-bold tracking-tight">{stat.val}</p>
              </div>
            ))}
          </div>
        </section>

        <Suspense fallback={<SectionLoader />}>
          <HowItWorks />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <Studio user={user} profile={userProfile} onAuthRequired={() => setIsAuthOpen(true)} />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <Pricing userEmail={user?.email} userId={user?.id} onPaymentSuccess={handlePaymentSuccess} onAuthRequired={() => setIsAuthOpen(true)} />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <FAQ />
        </Suspense>

        <footer className="pt-24 pb-32 md:pb-16 border-t border-white/5 relative overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-red-500/5 blur-[150px] -z-10 rounded-full" />
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-red-500/30">
                <img src="https://res.cloudinary.com/dt9sxjxve/image/upload/v1769591812/Untitled_design_4_fhluy3.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-2xl tracking-tighter">Book<span className="text-red-500">AIO</span></span>
            </div>
            <div className="flex flex-wrap justify-center gap-10 text-xs font-bold uppercase tracking-widest text-white/30">
              <a href="#how-it-works" className="hover:text-red-500 transition-colors">Vision</a>
              <a href="#studio" className="hover:text-red-500 transition-colors">Studio</a>
              <a href="#pricing" className="hover:text-red-500 transition-colors">Prix</a>
              <a href="#faq" className="hover:text-red-500 transition-colors">F.A.Q</a>
              <button onClick={() => user ? handleSignOut() : setIsAuthOpen(true)} className="hover:text-red-500 transition-colors">{user ? 'Déconnexion' : 'Connexion'}</button>
            </div>
            <p className="text-white/10 text-[9px] tracking-[0.5em] uppercase font-bold">© 2025 BookAIO.com - L'Excellence par l'IA.</p>
          </div>
        </footer>

        <BottomBar />

        <Suspense fallback={null}>
          <Chatbot user={user} profile={userProfile} />
        </Suspense>

        <InstallPopup />
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

        <Suspense fallback={null}>
          <PaymentSuccessModal plan={activeSuccessPlan} onClose={() => setActiveSuccessPlan(null)} />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default App;
