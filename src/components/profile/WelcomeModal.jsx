import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WelcomeModal({ userName, show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="w-full max-w-sm p-8 rounded-3xl text-center"
            style={{ background: 'hsl(var(--card))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-black text-foreground mb-4">
              أهلاً بك يا {userName}! 👋
            </h2>

            <p className="text-2xl font-black text-primary mb-8">
              الشهر عليكم مبارك 🌙
            </p>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl font-bold text-white tap-scale"
              style={{ background: 'hsl(var(--primary))' }}
            >
              ابدأ المسابقة
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}