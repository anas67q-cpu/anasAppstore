import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, ArrowUpLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { APP_ASSETS } from '@/lib/appAssets';

function pad(n) { return String(n).padStart(2, '0'); }

function useCountdown(targetDate) {
  const [c, setC] = useState(() => calc(targetDate));
  useEffect(() => {
    if (!targetDate) return;
    const iv = setInterval(() => setC(calc(targetDate)), 1000);
    return () => clearInterval(iv);
  }, [targetDate]);
  return c;
}
function calc(targetDate) {
  if (!targetDate) return null;
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  };
}

export default function LandingPage() {
  const { navigateToLogin } = useAuth();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    const raw = APP_ASSETS.competition_start_date;
    if (raw) {
      const s = raw.includes('T') ? raw : raw + 'T00:00:00';
      setTarget(new Date(s) > new Date() ? s : null);
    }
  }, []);

  const c = useCountdown(target);
  const goLogin = () => { try { navigateToLogin(); } catch { window.location.reload(); } };

  const units = c
    ? [
        { val: c.days, label: 'يوم' },
        { val: c.hours, label: 'ساعة' },
        { val: c.mins, label: 'دقيقة' },
        { val: c.secs, label: 'ثانية' },
      ]
    : null;

  return (
    <div className="w-full flex flex-col overflow-hidden bg-white" dir="rtl"
      style={{ height: '100dvh', paddingTop: 'env(safe-area-inset-top, 0px)' }}>

      {/* Continuous snow-white canvas with extremely subtle brand-color tonal depth */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(130% 80% at 50% 0%, hsl(174 50% 95%) 0%, #ffffff 55%)' }} />
      <div className="absolute pointer-events-none" style={{
        top: '40%', right: '-18%', width: 300, height: 300, borderRadius: '50%',
        background: 'hsl(var(--primary) / 0.05)', filter: 'blur(6px)',
      }} />

      {/* Scrollable content column — keeps continuous white background, no black gaps */}
      <div className="relative z-10 flex-1 overflow-y-auto scroll-ios flex flex-col"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>

        {/* Masthead — small brand wordmark + edition chip */}
        <motion.div
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between px-5 pt-5"
        >
          <div className="flex items-center gap-2">
            <img src={APP_ASSETS.competition_logo} alt="" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-sm font-bold text-foreground font-heading">مسابقة أنس</span>
          </div>
          <span className="text-[11px] font-bold rounded-full px-2.5 py-1 text-white"
            style={{ background: 'hsl(var(--primary))' }}>النسخة التاسعة</span>
        </motion.div>

        {/* Hero poster card — large rounded brand-colour panel */}
        <div className="flex-1 flex items-center justify-center px-5 py-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full rounded-[2rem] overflow-hidden p-8 flex flex-col items-center text-center"
            style={{
              background: 'linear-gradient(155deg, hsl(var(--primary)) 0%, hsl(174 78% 18%) 100%)',
              boxShadow: '0 24px 48px -22px hsl(var(--primary) / 0.55)',
            }}>

            {/* subtle inner layered shape for editorial depth */}
            <div className="absolute inset-4 rounded-[1.6rem] pointer-events-none"
              style={{ border: '1px solid rgba(255,255,255,0.14)' }} />
            <div className="absolute pointer-events-none" style={{
              top: '-30%', width: 220, height: 220, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)', filter: 'blur(8px)',
            }} />

            {/* logo mark — elevated */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="relative">
              <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,255,255,0.18)', transform: 'scale(1.25)', filter: 'blur(12px)' }} />
              <img src={APP_ASSETS.competition_logo} alt="مسابقة أنس"
                className="relative w-20 h-20 rounded-2xl object-cover"
                style={{ background: 'rgba(255,255,255,0.12)' }} />
            </motion.div>

            {/* small edition line — NO letter spacing */}
            <p className="relative text-white/65 text-xs mt-6 font-medium">النسخة التاسعة · رمضان ١٤٤٨هـ</p>

            {/* strong dominant title — Thmanyah, bold, connected Arabic */}
            <h1 className="relative text-white font-heading font-black text-[2.9rem] leading-[1.05] mt-2">
              مسابقة أنس
            </h1>

            {/* refined divider */}
            <div className="relative my-5 h-px w-16" style={{ background: 'rgba(255,255,255,0.28)' }} />

            <p className="relative text-white/80 text-sm leading-relaxed font-medium">
              سؤال في كل يوم حتى نهاية الشهر
            </p>
            <p className="relative text-white/55 text-xs mt-1.5 leading-relaxed">
              مسابقة رمضانية تنافسية تجمع الفائدة والمنافسة
            </p>
          </motion.div>
        </div>

        {/* Editorial countdown — grouped, no widget feel */}
        {units && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="px-5 pb-2"
          >
            <div className="flex items-center justify-center gap-4">
              {units.map(({ val, label }, i) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-heading font-black text-2xl leading-none" style={{ color: 'hsl(var(--primary))' }}>
                      {pad(val)}
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: '#7d8a89' }}>{label}</p>
                  </div>
                  {i < units.length - 1 && <span className="font-heading text-xl" style={{ color: 'hsl(var(--primary) / 0.3)' }}>·</span>}
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] mt-3" style={{ color: '#7d8a89' }}>باقي على انطلاق المسابقة</p>
          </motion.div>
        )}

        {/* Branded CTA — editorial, not a generic SaaS pill */}
        <div className="px-5 pt-3 pb-5">
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.985 }}
            onClick={goLogin}
            className="w-full rounded-2xl flex items-center justify-center gap-2 py-3.5 font-heading font-bold text-base tap-scale text-white"
            style={{ background: 'hsl(var(--primary))', boxShadow: '0 12px 24px -10px hsl(var(--primary) / 0.45)' }}>
            <LogIn className="w-4 h-4" />
            تسجيل الدخول للمشاركة
            <ArrowUpLeft className="w-4 h-5" />
          </motion.button>
          <p className="text-center text-[10px] mt-2.5" style={{ color: '#9aa6a4' }}>
            الدخول عبر بريدك الإلكتروني — لا تحتاج كلمة مرور
          </p>
        </div>
      </div>
    </div>
  );
}