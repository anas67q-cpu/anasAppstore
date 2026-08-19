import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, ChevronLeft } from 'lucide-react';
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

  return (
    <div className="min-h-100dvh w-full relative overflow-hidden bg-white flex flex-col" dir="rtl"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>

      {/* Subtle tonal background layers — very low contrast brand-color shapes for depth */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(120% 70% at 50% -10%, hsl(var(--primary) / 0.07) 0%, transparent 55%)' }} />
      <div className="absolute pointer-events-none" style={{
        top: '12%', left: '50%', transform: 'translateX(-50%)',
        width: 320, height: 320, borderRadius: '50%',
        background: 'hsl(var(--primary) / 0.05)', filter: 'blur(8px)',
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: '-6%', right: '-12%', width: 240, height: 240, borderRadius: '50%',
        background: 'hsl(var(--primary) / 0.04)', filter: 'blur(10px)',
      }} />

      {/* Centered poster composition */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">

        {/* Central brand visual — floating rounded card in brand color with the logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* soft elevated halo behind card */}
          <div className="absolute inset-0 rounded-[2.25rem] pointer-events-none"
            style={{ background: 'hsl(var(--primary) / 0.18)', transform: 'translateY(10px) scale(0.96)', filter: 'blur(18px)' }} />

          <div className="relative rounded-[2.25rem] flex items-center justify-center overflow-hidden"
            style={{
              width: 188, height: 188,
              background: 'linear-gradient(160deg, hsl(var(--primary)) 0%, hsl(174 80% 16%) 100%)',
              boxShadow: '0 22px 44px -18px hsl(var(--primary) / 0.55), 0 2px 6px rgba(0,0,0,0.04)',
            }}>
            {/* faint inner ring for editorial detail */}
            <div className="absolute inset-3 rounded-[1.6rem] pointer-events-none"
              style={{ border: '1px solid rgba(255,255,255,0.16)' }} />
            <img src={APP_ASSETS.competition_logo} alt="مسابقة أنس"
              className="relative w-24 h-24 rounded-[1.25rem] object-cover"
              style={{ background: 'rgba(255,255,255,0.10)' }} />
          </div>
        </motion.div>

        {/* Title block */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mt-9"
        >
          <p className="text-[11px] font-bold tracking-[0.35em] mb-3"
            style={{ color: 'hsl(var(--primary))' }}>النسخة التاسعة · رمضان ١٤٤٨هـ</p>
          <h1 className="text-foreground font-black text-[2.7rem] leading-[1.1] font-heading">
            مسابقة أنس
          </h1>
          {/* thin brand accent divider */}
          <div className="mx-auto my-5 rounded-full"
            style={{ width: 44, height: 3, background: 'hsl(var(--primary))' }} />
          <p className="text-sm leading-relaxed font-medium" style={{ color: '#5b6967' }}>
            سؤال في كل يوم حتى نهاية الشهر
          </p>
          <p className="text-xs mt-2" style={{ color: '#8b9997' }}>
            مسابقة رمضانية تنافسية تجمع الفائدة والمنافسة
          </p>
        </motion.div>

        {/* Supporting element — restrained countdown */}
        {target && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9"
          >
            <div className="flex items-center justify-center gap-2.5">
              {[
                { val: c?.days ?? 0, label: 'يوم' },
                { val: c?.hours ?? 0, label: 'ساعة' },
                { val: c?.mins ?? 0, label: 'دقيقة' },
                { val: c?.secs ?? 0, label: 'ثانية' },
              ].map(({ val, label }, i) => (
                <div key={label} className="flex items-center">
                  <div className="text-center" style={{ minWidth: 54 }}>
                    <p className="font-black tabular-nums leading-none text-2xl" style={{ color: '#1c2221' }}>
                      {pad(val)}
                    </p>
                    <p className="text-[10px] mt-1.5" style={{ color: '#8b9997' }}>{label}</p>
                  </div>
                  {i < 3 && <span className="mx-1 mb-3 text-lg" style={{ color: 'hsl(var(--primary) / 0.35)' }}>·</span>}
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] mt-3" style={{ color: '#8b9997' }}>باقي على انطلاق المسابقة</p>
          </motion.div>
        )}
      </div>

      {/* Footer action bar — prominent login CTA */}
      <div className="relative z-10 px-6 max-w-md mx-auto w-full"
        style={{ paddingBottom: 'max(28px, env(safe-area-inset-bottom, 0px))' }}>
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          whileTap={{ scale: 0.99 }}
          onClick={goLogin}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-base font-heading tap-scale"
          style={{
            background: 'hsl(var(--primary))', color: '#fff',
            boxShadow: '0 14px 28px -10px hsl(var(--primary) / 0.5)',
          }}>
          <LogIn className="w-5 h-5" />
          تسجيل الدخول للمشاركة
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <p className="text-center text-[11px] mt-3" style={{ color: '#8b9997' }}>
          الدخول عبر بريدك الإلكتروني — لا تحتاج كلمة مرور
        </p>
      </div>
    </div>
  );
}