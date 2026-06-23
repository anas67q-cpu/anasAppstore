import { motion } from 'framer-motion';
import { Trophy, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeaderboardLockedBanner from '@/components/home/LeaderboardLockedBanner';
import { playTap } from '@/lib/sounds';

const medals = ['🥇', '🥈', '🥉'];

export default function LeaderboardPreview({ allStats = [], settings = [] }) {
  const navigate = useNavigate();
  const top3 = allStats.slice(0, 3);

  const hiddenSetting = settings.find(s => typeof s.leaderboard_hidden === 'boolean');
  const isHidden = hiddenSetting?.leaderboard_hidden === true;

  if (isHidden) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="card-surface shadow-card overflow-hidden rounded-2xl"
      >
        <LeaderboardLockedBanner compact />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="card-surface shadow-card rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-muted-foreground">المتصدرين</h3>
        </div>
        <button
          onClick={() => { playTap(); navigate('/leaderboard'); }}
          className="flex items-center gap-1 text-xs text-primary font-medium tap-scale"
        >
          المزيد
          <ChevronLeft className="w-3 h-3" />
        </button>
      </div>

      {top3.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات بعد</p>
      ) : (
        <div className="space-y-2">
          {top3.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors"
            >
              <span className="text-lg">{medals[i]}</span>
              <span className="flex-1 text-sm font-medium text-foreground truncate">
                {s.user_name || 'مشترك'}
              </span>
              <span className="text-sm font-bold text-primary">{s.total_points}</span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}