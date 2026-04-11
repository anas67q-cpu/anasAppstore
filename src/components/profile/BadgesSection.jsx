import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Trophy, Flame, Target, Star, Shield } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { playTap } from '@/lib/sounds';

const BADGES = [
  {
    id: 'first_step',
    name: 'الخطوة الأولى',
    icon: Star,
    desc: 'أجب على أول سؤال',
    condition: (s) => (s?.total_correct || 0) + (s?.total_wrong || 0) >= 1,
    progress: (s) => Math.min(((s?.total_correct || 0) + (s?.total_wrong || 0)) / 1 * 100, 100),
    progressText: (s) => `${Math.min((s?.total_correct || 0) + (s?.total_wrong || 0), 1)}/1`,
  },
  {
    id: 'streak_5',
    name: 'المثابر',
    icon: Flame,
    desc: 'حقق سلسلة 5 أيام',
    condition: (s) => (s?.highest_streak || 0) >= 5,
    progress: (s) => Math.min((s?.highest_streak || 0) / 5 * 100, 100),
    progressText: (s) => `${Math.min(s?.highest_streak || 0, 5)}/5`,
  },
  {
    id: 'sharpshooter',
    name: 'القناص',
    icon: Target,
    desc: 'أجب على 10 أسئلة صحيحة',
    condition: (s) => (s?.total_correct || 0) >= 10,
    progress: (s) => Math.min((s?.total_correct || 0) / 10 * 100, 100),
    progressText: (s) => `${Math.min(s?.total_correct || 0, 10)}/10`,
  },
  {
    id: 'committed',
    name: 'الملتزم',
    icon: Shield,
    desc: 'أجب أول 15 يوم متتالي من البداية',
    condition: (s) => (s?.consecutive_days_from_start || 0) >= 15,
    progress: (s) => Math.min((s?.consecutive_days_from_start || 0) / 15 * 100, 100),
    progressText: (s) => `${Math.min(s?.consecutive_days_from_start || 0, 15)}/15`,
  },
  {
    id: 'champion',
    name: 'البطل',
    icon: Trophy,
    desc: 'احصل على 50 نقطة',
    condition: (s) => (s?.total_points || 0) >= 50,
    progress: (s) => Math.min((s?.total_points || 0) / 50 * 100, 100),
    progressText: (s) => `${Math.min(s?.total_points || 0, 50)}/50`,
  },
];

export default function BadgesSection({ stats }) {
  const [selectedBadge, setSelectedBadge] = useState(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-surface rounded-2xl p-5"
      >
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">الأوسمة</h3>
        <div className="grid grid-cols-5 gap-2">
          {BADGES.map((badge, i) => {
            const unlocked = badge.condition(stats);
            const Icon = badge.icon;
            return (
              <motion.button
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                onClick={() => { playTap(); setSelectedBadge(badge); }}
                className="flex flex-col items-center gap-1.5 tap-scale"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  unlocked ? 'bg-primary/20 glow-accent' : 'bg-secondary'
                }`}>
                  {unlocked ? (
                    <Icon className="w-5 h-5 text-primary" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground/40" />
                  )}
                </div>
                <span className={`text-[9px] font-medium ${
                  unlocked ? 'text-foreground' : 'text-muted-foreground/50'
                }`}>
                  {badge.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <BottomSheet open={!!selectedBadge} onClose={() => setSelectedBadge(null)} title={selectedBadge?.name}>
        {selectedBadge && (
          <BadgeDetail badge={selectedBadge} stats={stats} />
        )}
      </BottomSheet>
    </>
  );
}

function BadgeDetail({ badge, stats }) {
  const unlocked = badge.condition(stats);
  const progress = badge.progress(stats);
  const Icon = badge.icon;

  return (
    <div className="space-y-5 text-center">
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto ${
        unlocked ? 'bg-primary/20 glow-accent' : 'bg-secondary'
      }`}>
        {unlocked ? (
          <Icon className="w-10 h-10 text-primary" />
        ) : (
          <Lock className="w-8 h-8 text-muted-foreground/40" />
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold">{badge.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{badge.desc}</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>التقدم</span>
          <span>{badge.progressText(stats)}</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <motion.div
            className="bg-primary h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {unlocked && (
        <div className="p-3 rounded-xl bg-primary/10">
          <p className="text-sm text-primary font-medium">✨ تم فتح الوسام</p>
        </div>
      )}
    </div>
  );
}