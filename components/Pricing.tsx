
import React, { useState } from 'react';
import { Check, ShieldCheck, Zap, XCircle, Loader2, Calendar, Sparkles } from 'lucide-react';

import { User, UserProfile, PricingPlanId } from '../types';
import { getCurrencyInfo, formatPrice } from '../services/currencyService';

interface PricingProps {
  userEmail: string | undefined;
  userId: string | undefined;
  onPaymentSuccess: (plan: PricingPlanId) => void;
  onAuthRequired: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ userEmail, userId, onPaymentSuccess, onAuthRequired }) => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [currencyInfo, setCurrencyInfo] = useState({ currency: 'XOF', symbol: 'CFA', rate: 1 });

  React.useEffect(() => {
    getCurrencyInfo().then(setCurrencyInfo);
  }, []);

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

  const handlePayment = async (planId: string, amount: number) => {
    if (!userEmail || !userId) {
      onAuthRequired();
      return;
    }

    setLoadingPlan(planId);

    try {
      // Maketou API Integration (Direct link creation)
      // Reference: https://maketou.com/developers
      // Note: In a real scenario, this should be done via an Edge Function/Backend 
      // but for this direct integration, we generate a payment link.
      
      const MAKETOU_API_KEY = import.meta.env.VITE_MAKETOU_API_KEY;
      const MAKETOU_SHOP_URL = import.meta.env.VITE_MAKETOU_SHOP_URL; // e.g., https://maketou.com/s/your-shop

      if (!MAKETOU_API_KEY || !MAKETOU_SHOP_URL) {
          console.error('[BookAIO] Maketou configuration manquante.');
          setLoadingPlan(null);
          return;
      }

      // We redirect to the shop with parameters or use their API to create a checkout session
      // For many African payment gateways like Maketou, a direct link with metadata is often used
      // or a POST request to create a payment.
      
      // Building a simulated Maketou payment redirect
      const paymentUrl = `${MAKETOU_SHOP_URL}/checkout?plan=${planId}&user_id=${userId}&billing=${billingCycle}&amount=${amount}&currency=${currencyInfo.currency}`;
      
      // In a real production environment, we would call an API here to get a unique session URL
      // const res = await fetch('https://api.maketou.com/v1/payments', { ... });
      
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('[BookAIO] Erreur paiement Maketou:', error);
      setLoadingPlan(null);
    }
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
                  <span className="text-4xl font-serif font-bold">
                    {formatPrice(billingCycle === 'monthly' ? plan.price.monthly : plan.price.annually, currencyInfo.rate, '')}
                  </span>
                  <span className="text-white/40 text-[10px] font-bold uppercase">{currencyInfo.symbol}</span>
                </div>
                {plan.oldPrice && (
                    <p className="text-white/20 text-xs line-through mt-1">
                        {formatPrice(billingCycle === 'monthly' ? plan.oldPrice.monthly : plan.oldPrice.annually, currencyInfo.rate, currencyInfo.symbol)}
                    </p>
                )}
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
