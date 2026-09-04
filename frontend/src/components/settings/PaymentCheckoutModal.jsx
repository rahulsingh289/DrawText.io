import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  Check, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthStore } from '../../store/useAuthStore';

export const PaymentCheckoutModal = ({ plan, isOpen, onClose, onPaymentSuccess }) => {
  const { user } = useAuthStore();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'apple_pay' | 'paypal'
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardName, setCardName] = useState(user?.name || 'Rahul Singh');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !plan) return null;

  const isDowngrade = plan.id === 'plan_a';
  const basePrice = plan.id === 'plan_b' ? 9.99 : plan.id === 'plan_c' ? 24.99 : 0;
  const finalPrice = billingCycle === 'yearly' ? (basePrice * 12 * 0.8).toFixed(2) : basePrice.toFixed(2);
  const periodLabel = billingCycle === 'yearly' ? '/year (20% off)' : '/month';

  const handlePay = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(async () => {
      setIsProcessing(false);
      setIsSuccess(true);

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
      });

      if (onPaymentSuccess) {
        await onPaymentSuccess(plan.id);
      }

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-xl rounded-3xl bg-[#131622] border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0e111a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              isDowngrade ? 'bg-slate-800 text-slate-300' : 'bg-gradient-to-tr from-indigo-600 to-pink-500 text-white shadow-glow'
            }`}>
              {isDowngrade ? <CheckCircle2 className="w-5 h-5" /> : <Crown className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isDowngrade ? 'Confirm Plan Downgrade' : 'Secure Checkout & Payment'}
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                256-bit Encrypted SSL Connection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          /* Payment Success Confirmation View */
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-glow">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-white">
              {isDowngrade ? 'Downgrade Confirmed' : 'Payment Successful!'}
            </h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Your workspace has been successfully upgraded to <strong className="text-white">{plan.name}</strong>. Receipt sent to <span className="font-mono text-indigo-400">{user?.email}</span>.
            </p>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-mono inline-block">
              Transaction Ref: TXN-{Date.now().toString().slice(-8)}
            </div>
          </div>
        ) : (
          /* Checkout Form View */
          <form onSubmit={handlePay} className="p-6 overflow-y-auto space-y-5">
            {/* Plan Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-indigo-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Target Tier
                </span>
                <h4 className="text-base font-bold text-white">{plan.name}</h4>
                <p className="text-xs text-slate-400">{plan.desc}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white">
                  ${finalPrice}
                </span>
                <span className="text-xs text-slate-400 block">{periodLabel}</span>
              </div>
            </div>

            {!isDowngrade && (
              <>
                {/* Billing Cycle Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Billing Interval
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                        billingCycle === 'monthly'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Monthly Billing (${basePrice}/mo)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('yearly')}
                      className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        billingCycle === 'yearly'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Annual Billing</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        Save 20%
                      </span>
                    </button>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs font-bold">Credit Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('apple_pay')}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'apple_pay'
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Zap className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-bold">Apple / Google</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'paypal'
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-sm font-black text-sky-400 italic">P</span>
                      <span className="text-xs font-bold">PayPal</span>
                    </button>
                  </div>
                </div>

                {/* Credit Card Inputs */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          required
                          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Expiry Date (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          required
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          CVC / CVV
                        </label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="CVC"
                          required
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Full Name"
                        required
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {isDowngrade && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Downgrading to Free Tier
                </p>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  You will maintain up to 5 active whiteboards. Infinite canvas features, multi-user live rooms, and extended storage will be adjusted to Free tier quotas.
                </p>
              </div>
            )}

            {/* Footer Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
                Cancel anytime with 1-click
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>{isDowngrade ? 'Confirm Downgrade' : `Pay & Subscribe $${finalPrice}`}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
