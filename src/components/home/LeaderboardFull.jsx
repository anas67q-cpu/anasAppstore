import { useState } from 'react';
import { motion } from 'framer-motion';
import BottomSheet from '@/components/BottomSheet';
import { playTap } from '@/lib/sounds';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const medals = ['🥇', '🥈', '🥉'];

export default function LeaderboardFull({ allStats = [], settings = [] }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const shieldSetting = settings.find(s => s.leaderboard_shield);
  const shieldUrl = shieldSetting?.leaderboard_shield;

  return (
    <>
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {shieldUrl && (
          <div className="flex justify-center mb-4">
            <img src={shieldUrl} alt="shield" className="w-24 h-24 object-contain" />
          </div>
        )}
        {allStats.map((s, i) => (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => { playTap(); setSelectedPlayer(s); }}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors tap-scale"
          >
            <span className="w-8 text-center font-bold text-muted-foreground">
              {i < 3 ? medals[i] : i + 1}
            </span>
            <span className="flex-1 text-sm font-medium text-foreground truncate text-right">
              {s.user_name || 'مشترك'}
            </span>
            <span className="text-sm font-bold text-primary">{s.total_points} نقطة</span>
          </motion.button>
        ))}
      </div>

      <BottomSheet
        open={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        title={selectedPlayer?.user_name || 'مشترك'}
      >
        {selectedPlayer && <PlayerDetail player={selectedPlayer} />}
      </BottomSheet>
    </>
  );
}

function PlayerDetail({ player }) {
  const chartData = [
    { name: 'صحيح', value: player.total_correct || 0 },
    { name: 'خاطئ', value: player.total_wrong || 0 },
    { name: 'فائت', value: player.total_missed || 0 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="النقاط" value={player.total_points || 0} />
        <StatBox label="السلسلة" value={player.current_streak || 0} />
        <StatBox label="الأعلى" value={player.highest_streak || 0} />
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fill: 'hsl(0,0%,55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: 'hsl(0,0%,9%)', border: 'none', borderRadius: 12, color: '#fff' }}
            />
            <Bar dataKey="value" fill="hsl(174,93%,22%)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-secondary rounded-xl p-3 text-center">
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}