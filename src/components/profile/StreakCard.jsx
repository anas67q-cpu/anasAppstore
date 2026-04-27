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
              className="text-5xl font-black"
              style={{ color: isActive ? '#f97316' : 'hsl(var(--muted-foreground))' }}
            >
              {streak}
            </motion.span>
            <span className="text-sm text-muted-foreground mb-2">يوم متتالي</span>
          </div>
          {!isActive && (
            <p className="text-xs text-muted-foreground mt-1">جاوب صح عشان تبدأ السلسلة🔥</p>
          )}
        </div>

        {/* Flame icon — large */}
        <div className="relative w-24 h-24 flex items-center justify-center">
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
    </motion.div>
  );
}

function FlameIcon({ active }) {
  if (!active) {
    return (
      <svg width="88" height="88" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M26 6C26 6 18 15 18 24C18 28.418 21.582 32 26 32C30.418 32 34 28.418 34 24C34 15 26 6 26 6Z"
          fill="hsl(var(--muted))"
        />
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
      animate={{ scaleY: [1, 1.07, 1], scaleX: [1, 0.95, 1] }}
      transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
      style={{ transformOrigin: 'bottom center' }}
    >
      <svg width="88" height="88" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Glow */}
        <ellipse cx="26" cy="37" rx="14" ry="6" fill="#f97316" opacity="0.22" />
        {/* Outer flame — orange/red */}
        <path
          d="M26 3C26 3 15 13.5 15 24C15 30.075 19.925 35 26 35C32.075 35 37 30.075 37 24C37 13.5 26 3 26 3Z"
          fill="url(#flame_outer)"
        />
        {/* Mid flame — amber */}
        <path
          d="M26 13C26 13 19 20.5 19 27C19 30.866 22.134 34 26 34C29.866 34 33 30.866 33 27C33 20.5 26 13 26 13Z"
          fill="url(#flame_mid)"
        />
        {/* Inner core — yellow/white */}
        <path
          d="M26 21C26 21 22.5 25.5 22.5 29C22.5 31.485 24.015 33 26 33C27.985 33 29.5 31.485 29.5 29C29.5 25.5 26 21 26 21Z"
          fill="url(#flame_core)"
        />
        <defs>
          <linearGradient id="flame_outer" x1="26" y1="3" x2="26" y2="35" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="55%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
          <linearGradient id="flame_mid" x1="26" y1="13" x2="26" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="flame_core" x1="26" y1="21" x2="26" y2="33" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}