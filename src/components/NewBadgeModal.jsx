import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { Award } from 'lucide-react';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';

export default function NewBadgeModal({ badge, userName, cardTemplateUrl, onClose }) {
  const cardRef = useRef(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (badge) {
      setTimeout(() => {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 }, colors: ['#046B67', '#f59e0b', '#fff'] });
      }, 300);
    }
  }, [badge]);

  const handleSave = async () => {
    if (!cardRef.current) return;
    setSaving(true);
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `badge-${badge?.badge_name}-${userName}.png`;
    a.click();
    setSaving(false);
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

          {/* Card */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 300 }}
            ref={cardRef}
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
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              {badge.badge_icon_url ? (
                <img src={badge.badge_icon_url} alt="" style={{ width: 72, height: 72, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: 16, background: badge.badge_color || '#046B67', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 36 }}>🏅</span>
                </div>
              )}
              <div style={{ color: '#fff', fontSize: 20, fontWeight: 900, textAlign: 'center' }}>{badge.badge_name}</div>
              {badge.badge_description && (
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, textAlign: 'center', lineHeight: 1.5 }}>{badge.badge_description}</div>
              )}
              <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>{userName}</div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 w-full max-w-xs"
          >
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'hsl(var(--primary))' }}
            >
              <Download className="w-4 h-4" />
              {saving ? 'جاري الحفظ...' : 'حفظ البطاقة'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}