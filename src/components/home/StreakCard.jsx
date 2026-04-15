import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';

function arabicDays(n) {
  if (n === 0) return '٠ أيام';
  if (n === 1) return 'يوم واحد';
  if (n === 2) return 'يومان';
  if (n >= 3 && n <= 10) return `${n} أيام`;
  return `${n} يومًا`;
}

export default function StreakCard({ stats, streakLogoUrl, cardTemplateUrl }) {
  const current = stats?.current_streak || 0;
  const highest = stats?.highest_streak || 0;
  const cardRef = useRef(null);
  const userName = stats?.user_name || '';
  const [saving, setSaving] = useState(false);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setSaving(true);
    const canvas = await html2canvas(cardRef.current, { scale: 4, useCORS: true, allowTaint: true, backgroundColor: null, imageTimeout: 15000 });
    const url = canvas.toDataURL('image/png', 1.0);
    const a = document.createElement('a');
    a.href = url;
    a.download = `streak-${userName}.png`;
    a.click();
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="card-surface shadow-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">سلسلة الإجابات الصحيحة</h3>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleShare}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white tap-scale disabled:opacity-60"
          style={{ background: 'hsl(var(--primary))' }}
        >
          {saving ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          {saving ? 'جاري التجهيز...' : 'حفظ'}
        </motion.button>
      </div>

      {/* Saving progress bar */}
      {saving && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="w-full h-1 rounded-full overflow-hidden bg-secondary"
          style={{ transformOrigin: 'right' }}
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="h-full w-1/3 rounded-full"
            style={{ background: 'hsl(var(--primary))' }}
          />
        </motion.div>
      )}

      {/* Streak display */}
      <div className="flex items-center gap-5">
        {/* Logo / Flame */}
        <div className="relative flex-shrink-0 w-16 h-16 flex items-center justify-center">
          {streakLogoUrl ? (
            <motion.div
              animate={current >= 1 ? { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] } : {}}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full h-full"
            >
              <img src={streakLogoUrl} alt="streak" className="w-full h-full object-contain" />
            </motion.div>
          ) : (
            <motion.div
              animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-6xl select-none leading-none"
            >
              🔥
            </motion.div>
          )}
          {current >= 1 && (
            <motion.div
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full blur-sm"
              style={{ background: '#f97316' }}
            />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-black" style={{ color: current > 0 ? '#f97316' : 'hsl(var(--muted-foreground))' }}>
              {current}
            </span>
            <span className="text-sm font-medium text-muted-foreground">{arabicDays(current)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">الاستمرارية الحالية</p>
        </div>
      </div>

      {/* Highest */}
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-secondary">
        <span className="text-xl">🏆</span>
        <div>
          <p className="text-xs text-muted-foreground">أعلى رقم وصلته</p>
          <p className="text-base font-black text-foreground">{arabicDays(highest)}</p>
        </div>
      </div>

      {/* Hidden shareable card — uses cardTemplateUrl (الشكل الموحد) */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <div ref={cardRef} style={{
          width: 800, height: 800,
          borderRadius: 48,
          overflow: 'hidden',
          position: 'relative',
          background: cardTemplateUrl
            ? `url(${cardTemplateUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg, #046B67 0%, #034b48 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 60, gap: 20, fontFamily: 'Rubik, sans-serif',
          direction: 'rtl',
        }}>
          {!cardTemplateUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {/* Name at top */}
            <div style={{ color: '#fff', fontSize: 36, fontWeight: 900, textAlign: 'center' }}>{userName}</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 20, textAlign: 'center' }}>سلسلة الإجابات الصحيحة</div>
            {/* Logo */}
            {streakLogoUrl ? (
              <img src={streakLogoUrl} alt="" style={{ width: 140, height: 140, objectFit: 'contain' }} crossOrigin="anonymous" />
            ) : (
              <div style={{ fontSize: 120, lineHeight: 1 }}>🔥</div>
            )}
            {/* Number */}
            <div style={{ color: '#f97316', fontSize: 96, fontWeight: 900, lineHeight: 1 }}>{current}</div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 28, fontWeight: 700 }}>{arabicDays(current)} متتالية</div>
            <div style={{ marginTop: 16, padding: '12px 32px', background: 'rgba(255,255,255,0.15)', borderRadius: 30 }}>
              <span style={{ color: '#fff', fontSize: 22 }}>🏆 الأعلى: {arabicDays(highest)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}