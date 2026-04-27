import { motion, AnimatePresence } from 'framer-motion';

export default function StreakCard({ streak = 0 }) {
  const isActive = streak > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface shadow-card p-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">سلسلة الإجابات الصحيحة</p>
          <div className="flex items-end gap-1.5">
            <motion.span
              key={streak}
              initial={{ scale: 1.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="text-4xl font-black"
              style={{ color: isActive ? '#f97316' : 'hsl(var(--muted-foreground))' }}
            >
              {streak}
            </motion.span>
            <span className="text-sm text-muted-foreground mb-1">يوم متتالي</span>
          </div>
        </div>

        {/* Flame icon */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isActive ? (
              <motion.div
                key="flame-on"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <FlameIcon active />
              </motion.div>
            ) : (
              <motion.div
                key="flame-off"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <FlameIcon active={false} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-border"
        >
          <div className="flex gap-1.5 justify-center">
            {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 400 }}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: '#f9731620' }}
              >
                <SmallFlame />
              </motion.div>
            ))}
            {streak > 7 && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-secondary">
                <span className="text-[9px] font-bold text-muted-foreground">+{streak - 7}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {!isActive && (
        <p className="text-xs text-muted-foreground mt-2">أجب صحيحاً لتشعل السلسلة 🔥</p>
      )}
    </motion.div>
  );
}

function FlameIcon({ active }) {
  if (!active) {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer flame */}
        <path
          d="M26 6C26 6 18 15 18 24C18 28.418 21.582 32 26 32C30.418 32 34 28.418 34 24C34 15 26 6 26 6Z"
          fill="hsl(var(--muted))"
        />
        {/* Inner teardrop */}
        <path
          d="M26 18C26 18 22 23 22 27C22 29.209 23.791 31 26 31C28.209 31 30 29.209 30 27C30 23 26 18 26 18Z"
          fill="hsl(var(--muted-foreground))"
          opacity="0.4"
        />
      </svg>
    );
  }

  return (
    <motion.div
      animate={{ scaleY: [1, 1.08, 1], scaleX: [1, 0.96, 1] }}
      transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
      style={{ transformOrigin: 'bottom center' }}
    >
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Glow */}
        <ellipse cx="26" cy="36" rx="12" ry="5" fill="#f97316" opacity="0.2" />
        {/* Outer flame — orange */}
        <path
          d="M26 4C26 4 16 14 16 24C16 29.523 20.477 34 26 34C31.523 34 36 29.523 36 24C36 14 26 4 26 4Z"
          fill="url(#flame_outer)"
        />
        {/* Mid flame — yellow */}
        <path
          d="M26 14C26 14 20 21 20 27C20 30.314 22.686 33 26 33C29.314 33 32 30.314 32 27C32 21 26 14 26 14Z"
          fill="url(#flame_mid)"
        />
        {/* Inner core — white/yellow */}
        <path
          d="M26 22C26 22 23 26 23 29C23 30.657 24.343 32 26 32C27.657 32 29 30.657 29 29C29 26 26 22 26 22Z"
          fill="url(#flame_core)"
        />
        <defs>
          <linearGradient id="flame_outer" x1="26" y1="4" x2="26" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="60%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
          <linearGradient id="flame_mid" x1="26" y1="14" x2="26" y2="33" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="flame_core" x1="26" y1="22" x2="26" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

function SmallFlame() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1C7 1 4 4.5 4 7C4 8.657 5.343 10 7 10C8.657 10 10 8.657 10 7C10 4.5 7 1 7 1Z"
        fill="url(#sf_outer)" />
      <path d="M7 5C7 5 5.5 6.5 5.5 8C5.5 8.828 6.172 9.5 7 9.5C7.828 9.5 8.5 8.828 8.5 8C8.5 6.5 7 5 7 5Z"
        fill="#fde68a" />
      <defs>
        <linearGradient id="sf_outer" x1="7" y1="1" x2="7" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}