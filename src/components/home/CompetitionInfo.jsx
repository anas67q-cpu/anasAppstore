import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import BottomSheet from '@/components/BottomSheet';
import { playTap } from '@/lib/sounds';

const MUATH_STATS = {
  name: 'معاذ الحقباني',
  seasons: '٤ نسخ',
  questions: 28,
  points: 23,
  maxPoints: 28,
  accuracy: 79,
};
const ASMAA_STATS = {
  name: 'أسماء',
  seasons: 'النسخة الأخيرة',
  questions: 28,
  points: 47,
  maxPoints: 54,
  accuracy: 82,
};

const CHAMPIONS = [
  { ...MUATH_STATS, category: 'فئة المتسابقين', icon: '🏆', color: '#f59e0b', detail: `بطل لـ ${MUATH_STATS.seasons}` },
  { ...ASMAA_STATS, category: 'فئة الضيوف', icon: '🥇', color: '#046B67', detail: `بطلة ${ASMAA_STATS.seasons}` },
];

export default function CompetitionInfo({ settings = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const championId = searchParams.get('champion');
  const selectedChampion = championId !== null ? CHAMPIONS[Number(championId)] || null : null;

  const openChampion = (c) => {
    const idx = CHAMPIONS.findIndex(x => x.name === c.name);
    setSearchParams(p => { p.set('champion', idx); return p; });
  };
  const closeChampion = () => setSearchParams(p => { p.delete('champion'); return p; });

  const settingsObj = {};
  settings.forEach(s => { if (s.key) settingsObj[s.key] = s; });
  const infoSettings = settingsObj['info'] || {};
  const description = infoSettings.competition_description ||
    'مسابقة أنس هي مسابقة ثقافية تنافسية تُقام سنويًا، وقد وصلت الآن إلى نسختها التاسعة المميزة. تتضمن أسئلة يومية متنوعة لمدة ٢٩ يومًا مع جوائز ومكافآت.';
  const logoUrl = infoSettings.competition_logo;
  const champions = CHAMPIONS;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card-surface shadow-card p-5 space-y-4"
      >
        {/* Title with logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ background: logoUrl ? 'transparent' : 'hsl(var(--primary))' }}>
            {logoUrl
              ? <img src={logoUrl} alt="logo" className="w-full h-full object-cover rounded-xl" />
              : <Star className="w-5 h-5 text-white" />
            }
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">مسابقة أنس</h3>
            <p className="text-xs text-muted-foreground">النسخة التاسعة 🎉</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

        {/* Champions */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-3">أبطال النسخة السابقة</p>
          <div className="space-y-2.5">
            {champions.map((c, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={() => { playTap(); openChampion(c); }}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-secondary tap-scale text-right"
              >
                <span className="text-2xl">{c.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.detail}</p>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-white"
                  style={{ background: c.color }}>
                  {c.category}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <BottomSheet open={!!selectedChampion} onClose={closeChampion}
        title={selectedChampion?.name}>
        {selectedChampion && <ChampionDetail champion={selectedChampion} />}
      </BottomSheet>
    </>
  );
}

function ChampionDetail({ champion }) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-4xl mb-2">{champion.icon}</p>
        <p className="text-lg font-black text-foreground">{champion.name}</p>
        <p className="text-sm text-muted-foreground">{champion.detail}</p>
      </div>

      <div>
        <p className="text-xs font-bold text-muted-foreground mb-3 text-center">إحصائياته الموسم الماضي</p>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="عدد الأسئلة" value={`${champion.questions} سؤال`} />
          <StatCard label="النقاط" value={`${champion.points}/${champion.maxPoints}`} accent />
          <StatCard label="الدقة" value={`${champion.accuracy}٪`} color={champion.color} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, color }) {
  return (
    <div className="text-center p-3 rounded-2xl bg-secondary">
      <p className="text-base font-black leading-tight"
        style={{ color: color || (accent ? 'hsl(var(--primary))' : 'hsl(var(--foreground))') }}>
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}