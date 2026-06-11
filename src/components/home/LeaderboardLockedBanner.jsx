import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

/**
 * Shown whenever leaderboard_hidden=true.
 * compact=true → smaller version for BottomSheet / inline.
 */
export default function LeaderboardLockedBanner({ compact = false }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--primary)/0.12) 0%, hsl(var(--primary)/0.04) 100%)',
        borderRadius: compact ? '1rem' : '0',
        padding: compact ? '2rem 1.5rem' : '2.5rem 1.5rem',
      }}
    >
      {/* Decorative blurred circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
        style={{ background: 'hsl(var(--primary))' }} />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10"
        style={{ background: 'hsl(var(--primary))' }} />

      <div className="relative flex flex-col items-center gap-4 text-center">

        {/* Lock icon with animated shackle */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
          className="relative"
        >
          {/* Glow ring */}
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.6, 0.35] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full"
            style={{ background: 'hsl(var(--primary))', filter: 'blur(14px)' }}
          />
          <div
            className="relative w-20 h-20 rounded-3xl flex items-center justify-center shadow-card"
            style={{ background: 'hsl(var(--primary))' }}
          >
            {/* Shackle wiggle */}
            <motion.div
              animate={{ rotate: [0, -8, 8, -8, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', repeatDelay: 1 }}
            >
              <Lock className="w-9 h-9 text-white" strokeWidth={2.5} />
            </motion.div>
          </div>
        </motion.div>

        {/* Texts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-2"
        >
          <p className="text-lg font-black text-foreground">
            لوحة الصدارة مغلقة 🔐
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            تم إغلاق لوحة الصدارة مؤقتاً،<br />
            سيتم الإعلان عن النتائج النهائية<br />
            في نهاية المسابقة 🏆
          </p>
        </motion.div>

        {/* Floating emojis */}
        <div className="flex gap-3">
          {['🥇', '🥈', '🥉', '🎯', '🔥'].map((emoji, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -7, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.18, ease: 'easeInOut' }}
              className="text-xl select-none"
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}