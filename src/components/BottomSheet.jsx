import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function BottomSheet({ open, onClose, children, title }) {
  const sheetRef = useRef(null);
  const dragY = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Lock background scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setDragOffset(0);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Swipe-to-dismiss handlers
  const onTouchStart = (e) => {
    dragY.current = e.touches[0].clientY;
    setDragging(true);
  };

  const onTouchMove = (e) => {
    const dy = e.touches[0].clientY - dragY.current;
    if (dy > 0) setDragOffset(dy); // only allow dragging down
  };

  const onTouchEnd = () => {
    setDragging(false);
    if (dragOffset > 120) {
      onClose();
    }
    setDragOffset(0);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — covers TabBar (z-[90]) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            onClick={onClose}
          />

          {/* Filler behind TabBar — same color as sheet so it looks seamless */}
          <div
            className="fixed inset-x-0 bottom-0 z-[99]"
            style={{ height: 80, background: 'hsl(var(--card))' }}
          />

          {/* Sheet — floats above TabBar */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: dragOffset }}
            exit={{ y: '100%' }}
            transition={dragging
              ? { type: 'tween', duration: 0 }
              : { type: 'spring', damping: 30, stiffness: 300 }
            }
            className="fixed inset-x-0 z-[100] max-h-[88dvh] flex flex-col rounded-t-3xl border-t border-border"
            style={{
              bottom: 'calc(72px + var(--sab, 0px))',
              background: 'hsl(var(--card))',
              paddingBottom: 'calc(16px + var(--sab, 0px))',
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-3 flex-shrink-0">
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-muted tap-scale">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            )}

            {/* Scrollable content — contained so background doesn't scroll */}
            <div
              className="flex-1 overflow-y-auto scroll-ios px-6 pb-6"
              style={{ overscrollBehaviorY: 'contain' }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}