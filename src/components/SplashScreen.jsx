import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ logoUrl, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 600);
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
          style={{ background: 'hsl(var(--primary))' }}
        >
          {/* Subtle radial glow behind logo */}
          <div style={{
            position: 'absolute', width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 18 }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="شعار المسابقة"
                style={{
                  width: 180, height: 180, objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))',
                }}
              />
            ) : (
              /* Fallback elegant text if no logo uploaded yet */
              <div style={{
                width: 140, height: 140, borderRadius: 36,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '1.5px solid rgba(255,255,255,0.2)',
              }}>
                <span style={{ fontSize: 64 }}>🏆</span>
              </div>
            )}
          </motion.div>

          {/* App name */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            style={{
              color: '#fff', fontWeight: 900, fontSize: 28,
              marginTop: 28, letterSpacing: 1,
              fontFamily: 'Rubik, sans-serif', direction: 'rtl',
              textShadow: '0 2px 12px rgba(0,0,0,0.2)',
              position: 'relative', zIndex: 1,
            }}
          >
            مسابقة أنس
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.55 }}
            style={{
              color: 'rgba(255,255,255,0.75)', fontSize: 14,
              marginTop: 8, fontFamily: 'Rubik, sans-serif', direction: 'rtl',
              position: 'relative', zIndex: 1,
            }}
          >
            استعد للمنافسة 🎯
          </motion.p>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{
              position: 'absolute', bottom: 60,
              display: 'flex', gap: 8, zIndex: 1,
            }}
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2, ease: 'easeInOut' }}
                style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.8)',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}