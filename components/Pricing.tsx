
import React, { useState } from 'react';
import { Check, ShieldCheck, Zap, XCircle, Loader2, Calendar, Sparkles } from 'lucide-react';

interface PricingProps {
  userEmail: string | undefined;
  userId: string | undefined;
  onPaymentSuccess: (plan: 'essential' | 'abundance') => void;
  onAuthRequired: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ userEmail, userId, onPaymentSuccess, onAuthRequired }) => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: { monthly: 0, annually: 0 },
      features: ['1 Ebook / à vie', '8 pages max', 'Sans Cover', 'Basique'],
      color: 'border-white/5',
      buttonClass: 'bg-white/5 text-white/40',
      link: '#studio'
    },
    {
      id: 'essential',
      name: 'Essentiel',
      price: { monthly: 2900, annually: 29000 },
      oldPrice: { monthly: 7900, annually: 79000 },
      badge: 'OFFRE LIMITÉE -63%',
      features: ['3 Ebooks / mois', 'Design Cover IA', 'Formatage PDF Pro', 'Support Mail'],
      color: 'border-red-500/30',
      buttonClass: 'bg-white/10 border border-red-500/30 text-white',
      link: null
    },
    {
      id: 'abundance',
      name: 'Abondance',
      price: { monthly: 9900, annually: 99000 },
      oldPrice: { monthly: 19900, annually: 199000 },
      badge: 'BEST-SELLER -50%',
      popular: true,
      features: ['10 Ebooks / mois', 'Mockups 3D Elite', 'Arsenal Ads', 'Vocal Illimité', 'Support VIP'],
      color: 'border-red-500/60',
      buttonClass: 'gradient-amber text-white shadow-xl shadow-red-500/20',
      link: null
    }
  ];

  const handlePayment = (planId: string, amount: number) => {
    if (!userEmail || !userId) {
      onAuthRequired();
      return;
    }

    setLoadingPlan(planId);

    const handler = (window as any).PaystackPop.setup({
      // Clé Live mise à jour
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: userEmail,
      amount: amount * 100,
      currency: 'XOF',
      metadata: {
        user_id: userId,
        pack: planId,
        price_fcfa: amount,
        billing: billingCycle
      },
      callback: (response: any) => {
        setLoadingPlan(null);
        // NOTE: In production, plan updates MUST be handled via a server-side webhook 
        // from Paystack to ensure payment integrity (e.g. n8n -> Supabase).
        // This client-side update is only for UI responsiveness.
        onPaymentSuccess(planId as any);
      },
      onClose: () => {
        setLoadingPlan(null);
      }
    });
    handler.openIframe();
  };

  return (
    <section id="pricing" className="py-24 px-6 relative overflow-hidden bg-white/[0.01]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-6 mb-16">
          <p className="text-red-500 font-bold uppercase tracking-[0.4em] text-[10px]">Tarifs Exceptionnels</p>
          <h2 className="text-4xl md:text-6xl font-serif">Le prix de l'excellence, <br /><span className="text-white/40">enfin accessible.</span></h2>

          <div className="flex items-center justify-center gap-4 pt-6">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${billingCycle === 'monthly' ? 'text-white' : 'text-white/20'}`}>Mensuel</span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')}
              className="w-14 h-7 rounded-full bg-white/5 border border-white/10 relative p-1"
            >
              <div className={`w-5 h-5 rounded-full gradient-amber transition-transform ${billingCycle === 'annually' ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${billingCycle === 'annually' ? 'text-white' : 'text-white/20'}`}>Annuel <span className="text-red-500">(-2 mois)</span></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.id} className={`glass-card rounded-[40px] p-10 border relative group transition-all duration-500 hover:scale-[1.02] ${plan.color} ${plan.popular ? 'shadow-[0_0_50px_rgba(225,29,72,0.1)]' : ''}`}>
              {plan.badge && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] font-bold px-4 py-1.5 rounded-full tracking-widest">{plan.badge}</div>}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-serif font-bold">{(billingCycle === 'monthly' ? plan.price.monthly : plan.price.annually).toLocaleString()}</span>
                  <span className="text-white/40 text-[10px] font-bold uppercase">Fcfa</span>
                </div>
                {plan.oldPrice && <p className="text-white/20 text-xs line-through mt-1">{(billingCycle === 'monthly' ? plan.oldPrice.monthly : plan.oldPrice.annually).toLocaleString()} Fcfa</p>}
              </div>
              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3"><Check className="w-4 h-4 text-red-500" /><span className="text-sm text-white/50">{f}</span></div>
                ))}
              </div>
              {plan.link ? (
                <a href={plan.link} className={`w-full py-4 rounded-xl font-bold uppercase text-[9px] text-center tracking-widest ${plan.buttonClass}`}>Démarrer</a>
              ) : (
                <button
                  onClick={() => handlePayment(plan.id, billingCycle === 'monthly' ? plan.price.monthly : plan.price.annually)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full py-4 rounded-xl font-bold uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 shine-effect ${plan.buttonClass}`}
                >
                  {loadingPlan === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  S'abonner
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
