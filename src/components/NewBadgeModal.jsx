import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useShareBadge } from '@/lib/useShareBadge';

export default function NewBadgeModal({ badge, userName, cardTemplateUrl, onClose }) {
  const { cardRef, sharing, prepareCard, shareCard } = useShareBadge();

  useEffect(() => {
    if (badge) {
      setTimeout(() => {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 }, colors: ['#046B67', '#f59e0b', '#fff'] });
      }, 300);
      // Start preparing card in background immediately
      prepareCard(badge, userName, cardTemplateUrl);
    }
  }, [badge?.id]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        >
          <button onClick={onClose}
            className="absolute top-12 left-6 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center tap-scale">
            <X className="w-5 h-5 text-white" />
          </button>

          <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-white text-xl font-black mb-6 text-center">
            تم فتح شارة جديدة 🎉
          </motion.p>

          {/* Card preview */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
            style={{
              width: 300, height: 300, borderRadius: 28, overflow: 'hidden', position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 12, fontFamily: 'Rubik, sans-serif', direction: 'rtl', padding: 30,
              background: cardTemplateUrl
                ? `url(${cardTemplateUrl}) center/cover no-repeat`
                : `linear-gradient(135deg, ${badge.badge_color || '#046B67'} 0%, #034b48 100%)`,
            }}>
            {!cardTemplateUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 900, textAlign: 'center' }}>{userName}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'center' }}>حصلت على شارة</div>
              {badge.badge_icon_url
                ? <img src={badge.badge_icon_url} alt="" style={{ width: 100, height: 100, objectFit: 'cover' }} />
                : <div style={{ width: 100, height: 100, borderRadius: 16, background: badge.badge_color || '#046B67', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 50 }}>🏅</span>
                  </div>
              }
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 900, textAlign: 'center' }}>{badge.badge_name}</div>
              {badge.badge_description && (
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, textAlign: 'center', lineHeight: 1.5 }}>{badge.badge_description}</div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-6 w-full max-w-xs space-y-3">
            {sharing && (
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/20">
                <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="h-full w-1/3 rounded-full bg-white" />
              </div>
            )}
            <button onClick={() => shareCard(badge.badge_name, userName, badge, cardTemplateUrl)} disabled={sharing}
              className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'hsl(var(--primary))' }}>
              {sharing
                ? <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />جاري النشر...</>
                : <><Share2 className="w-4 h-4" />نشر بطاقة الشارة</>
              }
            </button>
          </motion.div>


        </motion.div>
      )}
    </AnimatePresence>
  );
}