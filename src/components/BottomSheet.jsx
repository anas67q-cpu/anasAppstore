import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const SPRING_IN  = { type: 'spring', damping: 32, stiffness: 320, mass: 0.8 };
const SPRING_OUT = { type: 'tween', duration: 0.22, ease: [0.4, 0, 1, 1] };

export default function BottomSheet({ open, onClose, children, title }) {
  const sheetRef = useRef(null);
  const dragStartY = useRef(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setDragOffset(0);
      setClosing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const triggerClose = () => {
    setClosing(true);
    setDragOffset(0);
    setTimeout(onClose, 220);
  };

  // Drag only on handle
  const onHandleTouchStart = (e) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const onHandleTouchMove = (e) => {
    if (dragStartY.current === null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy > 0) setDragOffset(dy);
  };

  const onHandleTouchEnd = () => {
    if (dragOffset > 80) {
      triggerClose();
    } else {
      setDragOffset(0);
    }
    dragStartY.current = null;
  };

  const sheetHeight = sheetRef.current?.offsetHeight || 600;
  const exitY = sheetHeight + 140;
  const animateY = closing ? exitY : dragOffset;
  const transition = dragOffset > 0 ? { type: 'tween', duration: 0 } : closing ? SPRING_OUT : SPRING_IN;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: closing ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            onClick={triggerClose}
          />

          {/* Filler behind TabBar */}
          <motion.div
            key="filler"
            initial={{ y: '110%' }}
            animate={{ y: animateY }}
            transition={transition}
            className="fixed inset-x-0 z-[99]"
            style={{
              bottom: 0,
              height: 'calc(72px + var(--sab, 0px))',
              background: 'hsl(var(--card))',
            }}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            ref={sheetRef}
            initial={{ y: '110%' }}
            animate={{ y: animateY }}
            transition={transition}
            className="fixed inset-x-0 z-[100] max-h-[82dvh] flex flex-col rounded-t-3xl border-t border-border"
            style={{
              bottom: 'calc(72px + var(--sab, 0px))',
              background: 'hsl(var(--card))',
              paddingBottom: 'calc(16px + var(--sab, 0px))',
            }}
          >
            {/* Drag handle — drag ONLY from here */}
            <div
              className="flex justify-center pt-3 pb-2 flex-shrink-0 cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
              onTouchStart={onHandleTouchStart}
              onTouchMove={onHandleTouchMove}
              onTouchEnd={onHandleTouchEnd}
            >
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-3 flex-shrink-0">
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
                <button onClick={triggerClose} className="p-2 rounded-full hover:bg-muted tap-scale">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            )}

            {/* Scrollable content — NO touch interference */}
            <div className="flex-1 overflow-y-auto scroll-ios px-6 pb-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}