import { useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Share2, Download } from 'lucide-react';

function arabicDays(n) {
  if (n === 0) return '٠ أيام';
  if (n === 1) return 'يوم واحد';
  if (n === 2) return 'يومان';
  if (n >= 3 && n <= 10) return `${n} أيام`;
  return `${n} يومًا`;
}

export default function StreakCard({ stats, streakLogoUrl }) {
  const current = stats?.current_streak || 0;
  const highest = stats?.highest_streak || 0;
  const cardRef = useRef(null);
  const userName = stats?.user_name || '';

  const handleShare = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `streak-${userName}.png`;
    a.click();
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white tap-scale"
          style={{ background: 'hsl(var(--primary))' }}
        >
          <Download className="w-3.5 h-3.5" />
          حفظ
        </motion.button>
      </div>

      {/* Streak display */}
      <div className="flex items-center gap-5">
        {/* Flame */}
        <div className="relative flex-shrink-0">
          <motion.div
            animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl select-none leading-none"
          >
            🔥
          </motion.div>
          {current > 0 && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
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

      {/* Hidden shareable card */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <div ref={cardRef} style={{
          width: 400, height: 400,
          borderRadius: 32,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #046B67 0%, #034b48 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 40, gap: 16, fontFamily: 'Rubik, sans-serif',
          direction: 'rtl',
        }}>
          {streakLogoUrl && <img src={streakLogoUrl} alt="" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 12 }} />}
          <div style={{ fontSize: 72, lineHeight: 1 }}>🔥</div>
          <div style={{ color: '#fff', fontSize: 48, fontWeight: 900, lineHeight: 1 }}>{current}</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: 600 }}>يوم متتالٍ</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 8 }}>{userName}</div>
          <div style={{ marginTop: 12, padding: '8px 20px', background: 'rgba(255,255,255,0.15)', borderRadius: 20 }}>
            <span style={{ color: '#fff', fontSize: 13 }}>🏆 الأعلى: {highest} يوم</span>
          </div>
          <div style={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>مسابقة أنس</div>
        </div>
      </div>
    </motion.div>
  );
}