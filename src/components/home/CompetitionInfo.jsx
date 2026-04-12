import { motion } from 'framer-motion';
import { Trophy, Star, Crown } from 'lucide-react';

const CHAMPIONS = [
  {
    category: 'فئة المتسابقين',
    icon: '🏆',
    name: 'معاذ الحقباني',
    detail: 'بطل لـ ٤ نسخ متتالية',
    color: '#f59e0b',
  },
  {
    category: 'فئة الضيوف',
    icon: '🥇',
    name: 'أسماء',
    detail: 'بطلة النسخة الأخيرة',
    color: '#046B67',
  },
];

export default function CompetitionInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="card-surface shadow-card p-5 space-y-4"
    >
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--primary))' }}>
          <Star className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">مسابقة أنس</h3>
          <p className="text-xs text-muted-foreground">النسخة التاسعة 🎉</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        مسابقة أنس هي مسابقة ثقافية تنافسية تُقام سنويًا، وقد وصلت الآن إلى نسختها التاسعة المميزة.
        تتضمن أسئلة يومية متنوعة لمدة ٢٩ يومًا مع جوائز ومكافآت.
      </p>

      {/* Champions */}
      <div>
        <p className="text-xs text-muted-foreground font-medium mb-3">أبطال النسخة السابقة</p>
        <div className="space-y-2.5">
          {CHAMPIONS.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary"
            >
              <span className="text-2xl">{c.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.detail}</p>
              </div>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                style={{ background: c.color }}
              >
                {c.category}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}