import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { base44 } from '@/api/base44Client';

function Avatar({ name, size = 64, color }) {
  return (
    <div className="rounded-full flex items-center justify-center font-black text-white flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4, background: color || 'hsl(var(--primary))' }}>
      {(name || 'م').charAt(0)}
    </div>
  );
}

export default function PlayerDetailModal({ player, onClose }) {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!player?.user_email) return;
    base44.entities.Answer.filter({ user_email: player.user_email })
      .then(data => {
        setAnswers(data.sort((a, b) => (a.day_number || 0) - (b.day_number || 0)));
        setLoading(false);
      });
  }, [player?.user_email]);

  // Build cumulative points chart data
  const chartData = (() => {
    let cumulative = 0;
    return answers.map(a => {
      cumulative += a.points_earned || 0;
      return { day: `${a.day_number}`, points: cumulative };
    });
  })();

  const correct = answers.filter(a => a.is_correct).length;
  const wrong = answers.filter(a => a.user_answer && !a.is_correct).length;
  const missed = answers.filter(a => !a.user_answer).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg bg-card rounded-t-3xl overflow-hidden"
          style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))', maxHeight: '85vh', overflowY: 'auto' }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center tap-scale">
            <X className="w-4 h-4 text-foreground" />
          </button>

          <div className="px-5 pt-4 pb-2">
            {/* Player header */}
            <div className="flex items-center gap-4 mb-5">
              <Avatar name={player?.user_name} size={60} color="hsl(var(--primary))" />
              <div>
                <h2 className="text-lg font-black text-foreground">{player?.user_name || 'مشترك'}</h2>
                <p className="text-sm font-bold" style={{ color: 'hsl(var(--primary))' }}>
                  {player?.points || 0} نقطة • المركز #{player?._rank}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="rounded-2xl p-3 text-center" style={{ background: '#046B6715' }}>
                <CheckCircle2 className="w-5 h-5 mx-auto mb-1" style={{ color: '#046B67' }} />
                <p className="text-xl font-black" style={{ color: '#046B67' }}>{correct}</p>
                <p className="text-[10px] text-muted-foreground">صحيحة</p>
              </div>
              <div className="rounded-2xl p-3 text-center" style={{ background: '#ef444415' }}>
                <XCircle className="w-5 h-5 mx-auto mb-1" style={{ color: '#ef4444' }} />
                <p className="text-xl font-black" style={{ color: '#ef4444' }}>{wrong}</p>
                <p className="text-[10px] text-muted-foreground">خاطئة</p>
              </div>
              <div className="rounded-2xl p-3 text-center" style={{ background: 'hsl(var(--secondary))' }}>
                <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xl font-black text-muted-foreground">{missed}</p>
                <p className="text-[10px] text-muted-foreground">فائتة</p>
              </div>
            </div>

            {/* Chart */}
            <div className="rounded-2xl p-4 mb-2" style={{ background: 'hsl(var(--secondary))' }}>
              <p className="text-xs font-bold text-muted-foreground mb-3">تطور النقاط</p>
              {loading ? (
                <div className="h-32 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
                </div>
              ) : chartData.length < 2 ? (
                <p className="text-center text-xs text-muted-foreground py-8">لا تتوفر بيانات كافية بعد</p>
              ) : (
                <ResponsiveContainer width="100%" height={130}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pointsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
                      labelFormatter={v => `يوم ${v}`}
                      formatter={v => [`${v} نقطة`, 'المجموع']}
                    />
                    <Area type="monotone" dataKey="points" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#pointsGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}