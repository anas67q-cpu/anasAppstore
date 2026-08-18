import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Trophy, Sparkles, Calendar, Star, Shield, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { APP_ASSETS } from '@/lib/appAssets';

function pad(n) { return String(n).padStart(2, '0'); }

// Lightweight inline countdown so Landing doesn't pull heavy deps beyond what's needed
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

const FEATURES = [
  { icon: Calendar, title: 'سؤال كل يوم', desc: 'سؤال رمضاني جديد يصدر يوميًا حتى نهاية الشهر' },
  { icon: Star, title: 'نقاط وتقدير', desc: 'احصد النقاط مع كل إجابة صحيحة وتصدّر لوحة المتصدرين' },
  { icon: Sparkles, title: 'ستريك وشارات', desc: 'حافظ على سلسلة إجاباتك الصحيحة وافتح شارات مميزة' },
  { icon: Shield, title: 'تنافس عادل', desc: 'بيئة تنافسية آمنة بضوابط تضمن مصداقية الترتيب' },
];

const STEPS = [
  { n: 1, title: 'سجّل دخولك', desc: 'أدخل بريدك وراح تدخل المسابقة فورًا' },
  { n: 2, title: 'أجب على سؤال اليوم', desc: 'توصلك المسابقة يوميًا وتجاوب قبل انتهاء الوقت' },
  { n: 3, title: 'تصدّر اللوحة', desc: 'اجمع نقاطك وحافظ على السلسلة للفوز' },
];

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
    <div className="min-h-100dvh w-full overflow-y-auto scroll-ios bg-background" dir="rtl">
      {/* Hero */}
      <header className="relative overflow-hidden"
        style={{ background: 'linear-gradient(165deg, hsl(var(--primary)) 0%, #065f5b 60%, #053f3c 100%)', borderBottomLeftRadius: '36px', borderBottomRightRadius: '36px' }}>
        {/* decorative */}
        <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-16 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute top-1/3 left-1/4 w-24 h-24 rounded-full bg-amber-300/15" />

        <div className="relative px-5 pt-12 pb-12 max-w-md mx-auto">
          {/* Top bar */}
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={APP_ASSETS.competition_logo} alt="مسابقة أنس"
                className="w-11 h-11 rounded-2xl object-cover"
                style={{ background: 'rgba(255,255,255,0.15)' }} />
              <div>
                <h1 className="text-white font-black text-lg leading-tight font-heading">مسابقة أنس</h1>
                <p className="text-white/70 text-xs">النسخة التاسعة · رمضان ١٤٤٨هـ</p>
              </div>
            </div>
            <button onClick={goLogin}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold tap-scale"
              style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', backdropFilter: 'blur(8px)' }}>
              <LogIn className="w-4 h-4" />
              دخول
            </button>
          </nav>

          {/* Hero text */}
          <div className="mt-12 text-center space-y-3">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-amber-300 text-sm font-bold">
              🌙 تجربة رمضانية تنافسية
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="text-white font-black text-3xl leading-snug font-heading">
              سؤال في كل يوم<br />
              <span className="text-amber-300">حتى نهاية الشهر</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }}
              className="text-white/75 text-sm leading-relaxed px-3">
              مسابقة دينية رمضانية تجمع بين الفائدة والمنافسة، نطرح فيها سؤالًا يوميًا ونتابع تقدّمك على لوحة الصدارة.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
              className="pt-2">
              <button onClick={goLogin} whileTap={{ scale: 0.96 }}
                className="w-full py-3.5 rounded-2xl text-base font-black tap-scale flex items-center justify-center gap-2"
                style={{ background: '#fff', color: 'hsl(var(--primary))' }}>
                ابدأ المشاركة الآن
                <ChevronLeft className="w-5 h-5" />
              </button>
              <p className="text-white/55 text-xs mt-2.5">تسجيل الدخول عبر بريدك الإلكتروني — لا تحتاج كلمة مرور</p>
            </motion.div>
          </div>

          {/* Countdown inside hero */}
          {target && (
            <div className="mt-9">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: c?.days ?? 0, label: 'يوم' },
                  { val: c?.hours ?? 0, label: 'ساعة' },
                  { val: c?.mins ?? 0, label: 'دقيقة' },
                  { val: c?.secs ?? 0, label: 'ثانية' },
                ].map(({ val, label }) => (
                  <div key={label} className="rounded-2xl text-center py-3"
                    style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}>
                    <p className="text-2xl font-black font-mono tabular-nums text-white">{pad(val)}</p>
                    <p className="text-[10px] text-white/70 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-white/65 text-xs mt-3">باقي على انطلاق المسابقة</p>
            </div>
          )}
        </div>
      </header>

      {/* Features */}
      <section className="px-4 pt-9 max-w-md mx-auto">
        <h3 className="text-lg font-black text-foreground font-heading">لماذا مسابقة أنس؟</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-5">تجربة تنافسية مصمّمة بعناية للمشاركة اليومية</p>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="card-surface shadow-card p-4 space-y-2.5">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: 'hsl(var(--primary)/0.12)' }}>
                <f.icon className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">{f.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="px-4 pt-9 max-w-md mx-auto">
        <h3 className="text-lg font-black text-foreground font-heading">كيف تبدأ؟</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-5">ثلاث خطوات بسيطة للمشاركة</p>
        <div className="space-y-3">
          {STEPS.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="card-surface shadow-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-white"
                style={{ background: 'hsl(var(--primary))' }}>
                {s.n}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-foreground text-sm">{s.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="px-4 pt-10 max-w-md mx-auto">
        <div className="rounded-3xl overflow-hidden shadow-card p-7 text-center relative"
          style={{ background: 'linear-gradient(150deg, hsl(var(--primary)) 0%, #053f3c 100%)' }}>
          <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="relative">
            <Trophy className="w-10 h-10 text-amber-300 mx-auto mb-3" />
            <h3 className="text-white font-black text-lg font-heading">جاهز للمنافسة؟</h3>
            <p className="text-white/75 text-sm mt-1 mb-4">سجّل دخولك وانضم لآلاف المشاركين في المسابقة الرمضانية</p>
            <button onClick={goLogin} whileTap={{ scale: 0.96 }}
              className="w-full py-3.5 rounded-2xl text-base font-black tap-scale flex items-center justify-center gap-2"
              style={{ background: '#fff', color: 'hsl(var(--primary))' }}>
              <LogIn className="w-5 h-5" />
              تسجيل الدخول
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 pt-10 pb-10 max-w-md mx-auto text-center">
        <p className="text-xs text-muted-foreground">مسابقة أنس الرمضانية · النسخة التاسعة</p>
        <p className="text-xs text-muted-foreground/70 mt-1">صُمّمت بعناية لمسابقة رمضانية ممتعة وعادلة</p>
      </footer>
    </div>
  );
}