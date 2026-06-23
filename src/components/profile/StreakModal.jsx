import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StreakFlame from '@/components/challenge/StreakFlame';
import { playTap } from '@/lib/sounds';

const DAYS_AR = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

const MESSAGES_ACTIVE = [
  'ما شاء الله عليك، السلسلة شغالة بقوة 🔥',
  'واضح إنك داخل جو المنافسة 😎',
  'يوم جديد يعني فرصة تزيد الستريك أكثر 🚀',
  'لا تخلي السلسلة تنقطع، باقي لك الكثير 👏',
  'استمر على نفس المستوى، أمورك ممتازة 🔥',
];

const MESSAGES_ZERO = [
  'ابدأ السلسلة اليوم ولا تأجل 😎',
  'سؤال واحد صح اليوم ممكن يبدأ مشوار طويل 🔥',
  'كل المتصدرين بدؤوا من صفر 🚀',
  'فرصتك تبدأ من الحين وتبني سلسلة قوية 👏',
  'لا تنتظر بكرة، خل البداية اليوم 🔥',
];

// Spark particle component
function Spark({ delay, angle, distance }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 5, height: 5,
        background: `hsl(${30 + Math.random() * 20}, 100%, ${60 + Math.random() * 20}%)`,
        top: '50%', left: '50%',
        marginTop: -2.5, marginLeft: -2.5,
      }}
      animate={{
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 20,
        opacity: [0, 1, 0],
        scale: [0, 1.2, 0],
      }}
      transition={{
        duration: 2 + Math.random(),
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

function WeekRow({ answers }) {
  // Build a map of which days (Sun=0..Sat=6) this week the user answered correctly
  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
  const todayDay = today.getDay(); // 0=Sun

  // Get start of this week (Sunday)
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - todayDay);
  weekStart.setHours(0, 0, 0, 0);

  const completedDays = new Set();
  (answers || []).forEach(a => {
    if (!a.is_correct) return;
    const d = new Date(new Date(a.created_date).toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
    if (d >= weekStart && d <= today) completedDays.add(d.getDay());
  });

  return (
    <div className="flex justify-between gap-1 px-2">
      {DAYS_AR.map((label, dayIdx) => {
        const isToday = dayIdx === todayDay;
        const isDone = completedDays.has(dayIdx);
        const isFuture = dayIdx > todayDay;
        return (
          <div key={dayIdx} className="flex flex-col items-center gap-1.5">
            <motion.div
              animate={isToday && !isDone ? { scale: [1, 1.08, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="flex items-center justify-center rounded-full font-black text-xs"
              style={{
                width: isToday ? 38 : 32,
                height: isToday ? 38 : 32,
                background: isDone
                  ? 'linear-gradient(135deg, #f97316, #ef4444)'
                  : isToday
                    ? 'rgba(249,115,22,0.2)'
                    : 'rgba(255,255,255,0.06)',
                border: isToday && !isDone ? '2px solid #f97316' : isDone ? 'none' : '1.5px solid rgba(255,255,255,0.1)',
                boxShadow: isDone ? '0 0 10px rgba(249,115,22,0.5)' : isToday ? '0 0 8px rgba(249,115,22,0.3)' : 'none',
                color: isDone ? 'white' : isFuture ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)',
              }}
            >
              {isDone ? '✓' : ''}
            </motion.div>
            <span className="text-[9px]" style={{ color: isFuture ? 'rgba(255,255,255,0.25)' : isDone ? '#f97316' : 'rgba(255,255,255,0.6)' }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function StreakModal({ streak = 0, answers = [], onClose }) {
  const [msg] = useState(() => {
    const list = streak > 0 ? MESSAGES_ACTIVE : MESSAGES_ZERO;
    return list[Math.floor(Math.random() * list.length)];
  });

  const sparks = Array.from({ length: 10 }, (_, i) => ({
    delay: i * 0.22,
    angle: (i / 10) * Math.PI * 2,
    distance: 80 + Math.random() * 40,
  }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #1a0e05 0%, #0d0d0d 50%, #0f0a1a 100%)',
            border: '1px solid rgba(249,115,22,0.2)',
            boxShadow: '0 0 60px rgba(249,115,22,0.15), 0 25px 50px rgba(0,0,0,0.6)',
          }}
        >
          {/* Flame section */}
          <div className="relative flex flex-col items-center pt-10 pb-6 px-6">
            {/* Outer glow ring */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              className="absolute rounded-full"
              style={{
                width: 180, height: 180,
                background: 'radial-gradient(circle, rgba(249,115,22,0.35) 0%, transparent 70%)',
                top: '50px',
              }}
            />

            {/* Sparks */}
            <div className="absolute" style={{ top: '50px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0 }}>
              {sparks.map((s, i) => <Spark key={i} {...s} />)}
            </div>

            {/* Flame + number */}
            <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
              {streak > 0 ? (
                <StreakFlame streak={streak} size={200} />
              ) : (
                /* Static grey flame for zero streak */
                <div className="flex items-center justify-center" style={{ width: 200, height: 200 }}>
                  <svg width="160" height="160" viewBox="0 0 52 52" fill="none">
                    <path d="M26 4C26 4 14 16 14 26C14 32.627 19.373 38 26 38C32.627 38 38 32.627 38 26C38 16 26 4 26 4Z" fill="rgba(255,255,255,0.08)" />
                    <path d="M26 16C26 16 20 22 20 28C20 31.314 22.686 34 26 34C29.314 34 32 31.314 32 28C32 22 26 16 26 16Z" fill="rgba(255,255,255,0.05)" />
                  </svg>
                </div>
              )}
              {/* Number overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="font-black text-white"
                  style={{
                    fontSize: streak >= 100 ? 36 : streak >= 10 ? 44 : 52,
                    textShadow: '0 2px 20px rgba(0,0,0,0.8)',
                    marginTop: 20,
                  }}
                >
                  {streak}
                </motion.span>
              </div>
            </div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-black text-center mt-2"
              style={{ color: streak > 0 ? '#f97316' : 'rgba(255,255,255,0.7)' }}
            >
              {streak > 0 ? '🔥 حي عينك!' : '🔥 يلا نبدأ!'}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-center mt-2 leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              {streak > 0
                ? `مستمر بالإجابات من ${streak} يوم، لا توقف الحين وخلك محافظ على السلسلة.`
                : 'تو ما بدت سلسلة اجاباتك، وعدنا السؤال الجاي 👀'
              }
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-center mt-2 px-2"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              {msg}
            </motion.p>
          </div>

          {/* Week tracker */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mx-5 mb-5 p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-xs text-center mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>هذا الأسبوع</p>
            <WeekRow answers={answers} />
          </motion.div>

          {/* Footer hint */}
          <p className="text-center text-xs px-6 mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
            كل يوم تجاوب فيه سؤال واحد على الأقل يحافظ على الستريك 🔥
          </p>

          {/* Actions */}
          <div className="px-5 pb-6 space-y-2.5">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { playTap(); onClose(); }}
              className="w-full py-3.5 rounded-2xl font-black text-white text-base"
              style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', boxShadow: '0 4px 20px rgba(249,115,22,0.4)' }}
            >
              يلا نكمل 💪
            </motion.button>
            <button
              onClick={() => { playTap(); onClose(); }}
              className="w-full py-2.5 rounded-2xl text-sm font-bold"
              style={{ color: 'rgba(255,255,255,0.4)', background: 'transparent' }}
            >
              إغلاق
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}