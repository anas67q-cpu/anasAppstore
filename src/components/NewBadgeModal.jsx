import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2 } from 'lucide-react';
import { Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useShareBadge } from '@/lib/useShareBadge';

export default function NewBadgeModal({ badge, userName, cardTemplateUrl, onClose }) {
  const { cardRef, sharing, prepareCard, shareCard } = useShareBadge();

  useEffect(() => {
    if (badge) {
      setTimeout(() => {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 }, colors: ['#046B67', '#f59e0b', '#fff'] });
      }, 300);
      // Start preparing card immediately so it's ready before user taps share
      prepareCard();
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
              fontFamily: 'Rubik, sans-serif', direction: 'rtl',
              background: cardTemplateUrl
                ? `url(${cardTemplateUrl}) center/cover no-repeat`
                : `linear-gradient(145deg, #046B67 0%, #023d3a 100%)`,
            }}>
            {!cardTemplateUrl && (
              <>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #046B67dd 0%, #012b29ff 100%)' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }} />
              </>
            )}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 20 }}>
              <div style={{ color: '#f59e0b', fontSize: 10, fontWeight: 700, letterSpacing: 3, opacity: 0.9 }}>✦ مسابقة أنس الرمضانية ✦</div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 900, textAlign: 'center' }}>{userName}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, textAlign: 'center' }}>حصل على شارة</div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: `radial-gradient(circle, ${badge.badge_color || '#046B67'}55 0%, transparent 70%)` }} />
                <div style={{ width: 88, height: 88, borderRadius: 16, overflow: 'hidden', boxShadow: `0 0 20px ${badge.badge_color || '#046B67'}99` }}>
                  {badge.badge_icon_url
                    ? <img src={badge.badge_icon_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: badge.badge_color || '#046B67', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 44 }}>🏅</span>
                      </div>
                  }
                </div>
              </div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 900, textAlign: 'center' }}>{badge.badge_name}</div>
              {badge.badge_description && (
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, textAlign: 'center', lineHeight: 1.5 }}>{badge.badge_description}</div>
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
            <button onClick={() => shareCard(badge.badge_name, userName)} disabled={sharing}
              className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'hsl(var(--primary))' }}>
              {sharing
                ? <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />جاري النشر...</>
                : <><Share2 className="w-4 h-4" />نشر بطاقة الشارة</>
              }
            </button>
          </motion.div>

          {/* Hidden high-quality card for export — 1080x1080 Instagram-ready */}
          <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
            <div ref={cardRef} style={{
              width: 1080, height: 1080, borderRadius: 0, overflow: 'hidden', position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Rubik, sans-serif', direction: 'rtl',
              background: cardTemplateUrl
                ? `url(${cardTemplateUrl}) center/cover no-repeat`
                : `linear-gradient(145deg, #046B67 0%, #023d3a 50%, #01292700 100%)`,
            }}>
              {/* Background layers */}
              {!cardTemplateUrl && (
                <>
                  {/* Deep gradient overlay */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #046B67ee 0%, #023d3acc 40%, #011a18ff 100%)' }} />
                  {/* Decorative circles */}
                  <div style={{ position: 'absolute', top: -120, right: -120, width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.08)' }} />
                  <div style={{ position: 'absolute', bottom: -80, left: -80, width: 380, height: 380, borderRadius: '50%', background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.15)' }} />
                  <div style={{ position: 'absolute', top: 200, left: 60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
                  {/* Gold accent line */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: 'linear-gradient(90deg, transparent, #f59e0b, #fcd34d, #f59e0b, transparent)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, background: 'linear-gradient(90deg, transparent, #f59e0b, #fcd34d, #f59e0b, transparent)' }} />
                </>
              )}

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, padding: '80px 80px' }}>

                {/* Top label */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ color: '#f59e0b', fontSize: 28, fontWeight: 700, letterSpacing: 6, textTransform: 'uppercase', opacity: 0.9 }}>✦ مسابقة أنس الرمضانية ✦</div>
                  <div style={{ width: 120, height: 2, background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }} />
                </div>

                {/* User name */}
                <div style={{ color: '#ffffff', fontSize: 52, fontWeight: 900, textAlign: 'center', lineHeight: 1.2, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{userName}</div>

                {/* Subtitle */}
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 30, textAlign: 'center', fontWeight: 400 }}>حصل على شارة</div>

                {/* Badge icon with glow */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Glow ring */}
                  <div style={{ position: 'absolute', width: 440, height: 440, borderRadius: '50%', background: `radial-gradient(circle, ${badge.badge_color || '#046B67'}55 0%, transparent 70%)` }} />
                  {/* Outer ring */}
                  <div style={{ position: 'absolute', width: 390, height: 390, borderRadius: '50%', border: `3px solid ${badge.badge_color || '#046B67'}60` }} />
                  {/* Inner ring */}
                  <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', border: `2px solid rgba(245,158,11,0.3)` }} />
                  {/* Badge */}
                  <div style={{ width: 300, height: 300, borderRadius: 40, overflow: 'hidden', position: 'relative', boxShadow: `0 0 60px ${badge.badge_color || '#046B67'}88, 0 20px 60px rgba(0,0,0,0.6)` }}>
                    {badge.badge_icon_url
                      ? <img src={badge.badge_icon_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                      : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${badge.badge_color || '#046B67'}, #034b48)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 140 }}>🏅</span>
                        </div>
                    }
                  </div>
                </div>

                {/* Badge name */}
                <div style={{ color: '#ffffff', fontSize: 50, fontWeight: 900, textAlign: 'center', textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>{badge.badge_name}</div>

                {/* Badge description */}
                {badge.badge_description && (
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 26, textAlign: 'center', lineHeight: 1.6, maxWidth: 780, fontWeight: 400 }}>{badge.badge_description}</div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <div style={{ width: 120, height: 2, background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }} />
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 22, fontWeight: 500 }}>🏆 جائزة التميز والإبداع</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}