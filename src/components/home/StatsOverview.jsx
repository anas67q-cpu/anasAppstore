import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function StatsOverview({ stats }) {
  const correct = stats?.total_correct || 0;
  const wrong = stats?.total_wrong || 0;
  const missed = stats?.total_missed || 0;
  const total = correct + wrong + missed;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  const data = [
    { name: 'صحيح', value: correct || 0.001, color: '#046B67' },
    { name: 'خاطئ', value: wrong || 0.001, color: '#ef4444' },
    { name: 'فاتتك', value: missed || 0.001, color: '#f59e0b' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card-surface shadow-card p-5"
    >
      <h3 className="text-base font-bold text-foreground mb-4">إحصائياتك</h3>

      <div className="flex items-center gap-4">
        {/* Donut chart */}
        <div className="relative flex-shrink-0" style={{ width: 110, height: 110 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={34}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-foreground">{pct}%</span>
            <span className="text-[9px] text-muted-foreground">صحيح</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-2.5">
          <StatRow color="#046B67" label="صحيح" value={correct} total={total} />
          <StatRow color="#ef4444" label="خاطئ" value={wrong} total={total} />
          <StatRow color="#f59e0b" label="فاتتك" value={missed} total={total} />
        </div>
      </div>

      {/* Bottom totals */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
        <TotalBox label="إجمالي" value={total} />
        <TotalBox label="النقاط" value={stats?.total_points || 0} accent />
        <TotalBox label="السلسلة" value={stats?.current_streak || 0} />
      </div>
    </motion.div>
  );
}

function StatRow({ color, label, value, total }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function TotalBox({ label, value, accent }) {
  return (
    <div className="text-center p-2 rounded-xl bg-secondary">
      <p className="text-lg font-black" style={{ color: accent ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }}>
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}