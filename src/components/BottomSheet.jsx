import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const SPRING_IN  = { type: 'spring', damping: 32, stiffness: 320, mass: 0.8 };
const SPRING_OUT = { type: 'tween', duration: 0.22, ease: [0.4, 0, 1, 1] };
const INSTANT    = { type: 'tween', duration: 0 };

export default function BottomSheet({ open, onClose, children, title }) {
  const sheetRef = useRef(null);
  const dragStartY = useRef(null);
  const [dragging, setDragging] = useState(false);
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
    // Let exit animation finish then call onClose
    setTimeout(onClose, 240);
  };

  const onTouchStart = (e) => {
    dragStartY.current = e.touches[0].clientY;
    setDragging(true);
  };

  const onTouchMove = (e) => {
    if (dragStartY.current === null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy > 0) setDragOffset(dy);
  };

  const onTouchEnd = () => {
    setDragging(false);
    if (dragOffset > 100) {
      triggerClose();
    } else {
      setDragOffset(0);
    }
    dragStartY.current = null;
  };

  // Compute animate value: if closing → full screen height so it exits below screen
  const sheetHeight = sheetRef.current?.offsetHeight || 600;
  const fillerHeight = 72 + 34; // approx sab
  const exitY = sheetHeight + fillerHeight + 40;

  const animateY = closing ? exitY : dragging ? dragOffset : 0;
  const transition = dragging ? INSTANT : closing ? SPRING_OUT : SPRING_IN;

  return (
    <AnimatePresence mode="wait">
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
            className="fixed inset-x-0 z-[99]"
            initial={{ y: '110%' }}
            animate={{ y: animateY }}
            transition={transition}
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
            className="fixed inset-x-0 z-[100] max-h-[78dvh] flex flex-col rounded-t-3xl border-t border-border"
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
                <button onClick={triggerClose} className="p-2 rounded-full hover:bg-muted tap-scale">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            )}

            {/* Scrollable content */}
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