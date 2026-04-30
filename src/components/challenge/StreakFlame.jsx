import { motion } from 'framer-motion';

// Flame configs per streak level
const FLAME_LEVELS = [
  null, // 0 - no flame
  // 1-4: growing orange flame
  { emoji: '🔥', opacity: 0.35, scale: 0.7, color: '#f97316', label: 'بداية الاشتعال' },
  { emoji: '🔥', opacity: 0.55, scale: 0.8, color: '#f97316', label: 'يشتعل أكثر' },
  { emoji: '🔥', opacity: 0.75, scale: 0.9, color: '#ef4444', label: 'مشتعل!' },
  { emoji: '🔥', opacity: 1,    scale: 1.0, color: '#dc2626', label: 'نار حامية 🔥' },
  // 5-9: purple flame with different icon feel
  { emoji: '🌟', opacity: 1, scale: 1.05, color: '#a855f7', label: 'مشتعل بنفسجي ✨', purple: true },
  { emoji: '🌟', opacity: 1, scale: 1.08, color: '#9333ea', label: 'قوة بنفسجية', purple: true },
  { emoji: '🌟', opacity: 1, scale: 1.1,  color: '#7c3aed', label: 'قوة خارقة', purple: true },
  { emoji: '🌟', opacity: 1, scale: 1.12, color: '#6d28d9', label: 'غامق ورائع', purple: true },
  { emoji: '🌟', opacity: 1, scale: 1.14, color: '#5b21b6', label: 'مميز جداً', purple: true },
  // 10+: blue/navy royal flame
  { emoji: '⚡', opacity: 1, scale: 1.2, color: '#1e40af', label: 'اشتعال ملكي 👑', royal: true },
];

function getLevel(streak) {
  if (!streak || streak <= 0) return null;
  if (streak >= 10) return FLAME_LEVELS[10];
  return FLAME_LEVELS[streak] || FLAME_LEVELS[4];
}

export default function StreakFlame({ streak, size = 28 }) {
  const level = getLevel(streak);
  if (!level) return null;

  const glowColor = level.royal
    ? '0 0 12px #3b82f6, 0 0 24px #1e40af'
    : level.purple
      ? '0 0 10px #a855f7, 0 0 20px #7c3aed'
      : `0 0 8px ${level.color}88`;

  return (
    <motion.span
      key={streak}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: level.scale, opacity: level.opacity }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        fontSize: size,
        display: 'inline-flex',
        filter: `drop-shadow(${glowColor})`,
        lineHeight: 1,
      }}
    >
      {level.emoji}
    </motion.span>
  );
}

// Guide component to show all levels
export function StreakFlameGuide() {
  const levels = [
    { streak: 1, label: FLAME_LEVELS[1].label },
    { streak: 2, label: FLAME_LEVELS[2].label },
    { streak: 3, label: FLAME_LEVELS[3].label },
    { streak: 4, label: FLAME_LEVELS[4].label },
    { streak: 5, label: FLAME_LEVELS[5].label },
    { streak: 6, label: FLAME_LEVELS[6].label },
    { streak: 7, label: FLAME_LEVELS[7].label },
    { streak: 8, label: FLAME_LEVELS[8].label },
    { streak: 9, label: FLAME_LEVELS[9].label },
    { streak: 10, label: FLAME_LEVELS[10].label },
  ];

  return (
    <div className="card-surface p-4 space-y-3">
      <h4 className="text-sm font-bold text-foreground text-center">دليل سلسلة الإجابات</h4>
      <div className="grid grid-cols-2 gap-2">
        {levels.map(({ streak, label }) => (
          <div key={streak} className="flex items-center gap-2 p-2 rounded-xl bg-secondary">
            <StreakFlame streak={streak} size={22} />
            <div>
              <p className="text-[10px] text-muted-foreground">إجابة {streak}</p>
              <p className="text-xs font-medium text-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}