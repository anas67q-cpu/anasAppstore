import { useState } from 'react';
import { motion } from 'framer-motion';
import StreakFlame from '@/components/challenge/StreakFlame';
import StreakModal from '@/components/profile/StreakModal';

export default function StreakCard({ streak = 0, answers = [] }) {
  const [showModal, setShowModal] = useState(false);
  const isActive = streak > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface shadow-card p-5 tap-scale cursor-pointer"
        onClick={() => setShowModal(true)}
        whileTap={{ scale: 0.98 }}
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

          <div className="w-24 h-24 flex items-center justify-center">
            {isActive ? (
              <StreakFlame streak={streak} size={96} />
            ) : (
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
            )}
          </div>
        </div>
      </motion.div>

      {showModal && (
        <StreakModal streak={streak} answers={answers} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}