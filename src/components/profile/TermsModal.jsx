import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ExternalLink, CheckSquare, Square, X } from 'lucide-react';

const STORAGE_KEY = 'terms_accepted_v1';

export default function TermsModal({ rulesUrl, onAcceptTerms }) {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Only show once per device
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
    onAcceptTerms?.();
  };

  const handleOpenRules = () => {
    if (rulesUrl) window.open(rulesUrl, '_blank');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-full max-w-lg rounded-t-3xl overflow-hidden"
            style={{ background: 'hsl(var(--card))', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 text-right">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto"
                style={{ background: 'hsl(var(--primary) / 0.12)' }}>
                <FileText className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
              </div>
              <h2 className="text-xl font-black text-foreground text-center">مرحباً بك في مسابقة أنس الرمضانية! 🌙</h2>
              <p className="text-sm text-muted-foreground text-center mt-2">
                قبل المشاركة، يرجى الاطلاع على الشروط والأحكام والموافقة عليها
              </p>
            </div>

            <div className="px-5 pb-2 space-y-4">
              {/* Rules link card */}
              {rulesUrl && (
                <button
                  onClick={handleOpenRules}
                  className="w-full p-4 rounded-2xl flex items-center gap-3 text-right tap-scale"
                  style={{ background: 'hsl(var(--primary) / 0.08)', border: '1.5px solid hsl(var(--primary) / 0.2)' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'hsl(var(--primary) / 0.15)' }}>
                    <ExternalLink className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: 'hsl(var(--primary))' }}>اطّلع على نظام المسابقة</p>
                    <p className="text-xs text-muted-foreground mt-0.5">اضغط هنا لقراءة الشروط والأحكام كاملة</p>
                  </div>
                  <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--primary))' }} />
                </button>
              )}

              {/* Checkbox agreement */}
              <button
                onClick={() => setChecked(v => !v)}
                className="w-full p-4 rounded-2xl flex items-center gap-3 text-right tap-scale"
                style={{
                  background: checked ? 'hsl(var(--primary) / 0.08)' : 'hsl(var(--secondary))',
                  border: checked ? '1.5px solid hsl(var(--primary) / 0.4)' : '1.5px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div className="flex-shrink-0">
                  {checked
                    ? <CheckSquare className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
                    : <Square className="w-6 h-6 text-muted-foreground" />
                  }
                </div>
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  أوافق على{' '}
                  <span
                    className="underline font-bold"
                    style={{ color: 'hsl(var(--primary))' }}
                    onClick={(e) => { e.stopPropagation(); handleOpenRules(); }}
                  >
                    شروط وأحكام
                  </span>
                  {' '}نظام مسابقة أنس الرمضانية
                </p>
              </button>

              {/* Accept button */}
              <button
                onClick={handleAccept}
                disabled={!checked}
                className="w-full py-4 rounded-2xl font-black text-base text-white tap-scale transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'hsl(var(--primary))' }}
              >
                موافق، أبدأ المسابقة 🚀
              </button>

              <div className="h-2" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}