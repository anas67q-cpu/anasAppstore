import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { playTap } from '@/lib/sounds';

export default function StreakCard({ currentStreak = 0, highestStreak = 0 }) {
  const [showSheet, setShowSheet] = useState(false);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        onClick={() => { playTap(); setShowSheet(true); }}
        className="w-full glass-surface rounded-2xl p-4 tap-scale"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                <Flame className="w-6 h-6 text-primary" />
              </div>
              {currentStreak > 0 && (
                <div className="absolute -inset-1 rounded-xl bg-primary/10 animate-pulse-glow" />
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">السلسلة الحالية</p>
              <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-xs text-muted-foreground">الأعلى</p>
            <p className="text-xl font-semibold text-muted-foreground">{highestStreak}</p>
          </div>
        </div>
      </motion.button>

      <BottomSheet open={showSheet} onClose={() => setShowSheet(false)} title="السلسلة">
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary">
            <Flame className="w-10 h-10 text-primary" />
            <div>
              <p className="text-3xl font-bold">{currentStreak}</p>
              <p className="text-sm text-muted-foreground">يوم متتالي</p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• أجب بشكل صحيح كل يوم للحفاظ على سلسلتك</p>
            <p>• الإجابة الخاطئة أو عدم الإجابة تعيد السلسلة للصفر</p>
            <p>• أعلى سلسلة لك: <span className="text-foreground font-bold">{highestStreak}</span> يوم</p>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}