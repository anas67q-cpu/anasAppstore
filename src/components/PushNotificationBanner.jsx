import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';

export default function PushNotificationBanner({ show, onEnable }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="mx-4 mt-3 p-3 rounded-2xl flex items-center gap-3"
          style={{ background: 'hsl(var(--primary) / 0.12)', border: '1px solid hsl(var(--primary) / 0.25)' }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'hsl(var(--primary) / 0.15)' }}>
            <Bell className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} />
          </div>
          <p className="flex-1 text-sm font-medium text-foreground">
            فعّل الإشعارات لتصلك أسئلة المسابقة يومياً
          </p>
          <button
            onClick={onEnable}
            className="px-3 py-1.5 rounded-xl text-sm font-bold text-white tap-scale flex-shrink-0"
            style={{ background: 'hsl(var(--primary))' }}
          >
            تفعيل
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}