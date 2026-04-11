import { motion } from 'framer-motion';

function CircleProgress({ value, max, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? (value / max) * circumference : 0;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--secondary))"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - progress }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  );
}

export default function StatsCard({ stats }) {
  const correct = stats?.total_correct || 0;
  const wrong = stats?.total_wrong || 0;
  const missed = stats?.total_missed || 0;
  const total = correct + wrong + missed;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-surface rounded-2xl p-5"
    >
      <h3 className="text-sm font-semibold text-muted-foreground mb-4">الإحصائيات</h3>
      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <CircleProgress value={correct} max={total || 1} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{percentage}%</span>
            <span className="text-[10px] text-muted-foreground">صحيح</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <StatRow label="صحيح" value={correct} color="text-primary" />
          <StatRow label="خاطئ" value={wrong} color="text-destructive" />
          <StatRow label="فائت" value={missed} color="text-muted-foreground" />
        </div>
      </div>
    </motion.div>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}