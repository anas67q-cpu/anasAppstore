import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2 } from 'lucide-react';
import { Award } from 'lucide-react';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';

export default function NewBadgeModal({ badge, userName, cardTemplateUrl, onClose }) {
  const cardRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (badge) {
      setTimeout(() => {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 }, colors: ['#046B67', '#f59e0b', '#fff'] });
      }, 300);
    }
  }, [badge]);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    const canvas = await html2canvas(cardRef.current, {
      scale: 4, useCORS: true, allowTaint: true, backgroundColor: null, imageTimeout: 15000
    });
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `badge-${badge?.badge_name}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `حصلت على شارة ${badge?.badge_name}!` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `badge-${badge?.badge_name}-${userName}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
      setSharing(false);
    }, 'image/png', 1.0);
  };

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
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-12 left-6 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center tap-scale"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Title */}
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white text-xl font-black mb-6 text-center"
          >
            تم فتح شارة جديدة 🎉
          </motion.p>

          {/* Card preview */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
            style={{
              width: 300, height: 300, borderRadius: 28,
              overflow: 'hidden', position: 'relative',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 12, fontFamily: 'Rubik, sans-serif', direction: 'rtl', padding: 30,
              background: cardTemplateUrl
                ? `url(${cardTemplateUrl}) center/cover no-repeat`
                : `linear-gradient(135deg, ${badge.badge_color || '#046B67'} 0%, #034b48 100%)`,
            }}
          >
            {!cardTemplateUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 900, textAlign: 'center' }}>{userName}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, textAlign: 'center' }}>حصلت على شارة</div>
              {badge.badge_icon_url ? (
                <img src={badge.badge_icon_url} alt="" style={{ width: 100, height: 100, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 100, height: 100, borderRadius: 16, background: badge.badge_color || '#046B67', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 50 }}>🏅</span>
                </div>
              )}
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 900, textAlign: 'center' }}>{badge.badge_name}</div>
              {badge.badge_description && (
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, textAlign: 'center', lineHeight: 1.5 }}>{badge.badge_description}</div>
              )}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 w-full max-w-xs space-y-3"
          >
            {sharing && (
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/20">
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="h-full w-1/3 rounded-full bg-white"
                />
              </div>
            )}
            <button
              onClick={handleShare}
              disabled={sharing}
              className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'hsl(var(--primary))' }}
            >
              {sharing
                ? <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />جاري تجهيز البطاقة...</>
                : <><Share2 className="w-4 h-4" />نشر بطاقة الشارة</>
              }
            </button>
          </motion.div>

          {/* Hidden high-quality card for export — badge icon 320x320 */}
          <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
            <div ref={cardRef} style={{
              width: 800, height: 800, borderRadius: 48, overflow: 'hidden',
              position: 'relative', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 18,
              fontFamily: 'Rubik, sans-serif', direction: 'rtl', padding: 60,
              background: cardTemplateUrl
                ? `url(${cardTemplateUrl}) center/cover no-repeat`
                : `linear-gradient(135deg, ${badge.badge_color || '#046B67'} 0%, #034b48 100%)`,
            }}>
              {!cardTemplateUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{ color: '#fff', fontSize: 38, fontWeight: 900, textAlign: 'center' }}>{userName}</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 22, textAlign: 'center' }}>حصلت على شارة</div>
                {badge.badge_icon_url
                  ? <img src={badge.badge_icon_url} alt="" style={{ width: 320, height: 320, objectFit: 'cover' }} crossOrigin="anonymous" />
                  : <div style={{ width: 320, height: 320, borderRadius: 48, background: badge.badge_color || '#046B67', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 160 }}>🏅</span>
                    </div>
                }
                <div style={{ color: '#fff', fontSize: 38, fontWeight: 900, textAlign: 'center' }}>{badge.badge_name}</div>
                {badge.badge_description && (
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 20, textAlign: 'center', lineHeight: 1.5, maxWidth: 580 }}>{badge.badge_description}</div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}