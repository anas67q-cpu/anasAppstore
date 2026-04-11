import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Timer, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { playCorrect, playWrong, playTap } from '@/lib/sounds';
import BottomSheet from '@/components/BottomSheet';

const EMOJIS = ['🌙', '⭐', '🌍', '🏆', '💎', '🎯'];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoryChallenge({ onBack, user, stats, setStats }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const timerRef = useRef(null);

  const initGame = useCallback(() => {
    const pairs = shuffleArray([...EMOJIS, ...EMOJIS]);
    setCards(pairs.map((emoji, i) => ({ id: i, emoji })));
    setFlipped([]);
    setMatched([]);
    setTime(0);
    setStarted(true);
    setFinished(false);
  }, []);

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => setTime(t => t + 0.1), 100);
    }
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  useEffect(() => {
    if (matched.length === 12 && started) {
      clearInterval(timerRef.current);
      setFinished(true);
      saveResult();
    }
  }, [matched]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      if (cards[a].emoji === cards[b].emoji) {
        playCorrect();
        setMatched(prev => [...prev, a, b]);
        setFlipped([]);
      } else {
        playWrong();
        setTimeout(() => setFlipped([]), 500);
      }
    }
  }, [flipped, cards]);

  const saveResult = async () => {
    const finalTime = Math.round(time * 10) / 10;
    if (stats) {
      const best = stats.memory_best_time > 0
        ? Math.min(stats.memory_best_time, finalTime)
        : finalTime;
      await base44.entities.UserStats.update(stats.id, { memory_best_time: best });
      setStats(prev => ({ ...prev, memory_best_time: best }));
    }
    const all = await base44.entities.UserStats.list('memory_best_time', 50);
    setLeaderboard(all.filter(s => s.memory_best_time > 0));
  };

  const handleFlip = (idx) => {
    if (flipped.length >= 2 || flipped.includes(idx) || matched.includes(idx)) return;
    playTap();
    setFlipped(prev => [...prev, idx]);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground tap-scale">
          <ArrowRight className="w-5 h-5" />
          <span className="text-sm">رجوع</span>
        </button>
        <div className="flex items-center gap-2 text-primary">
          <Timer className="w-4 h-4" />
          <span className="text-sm font-bold">{time.toFixed(1)}ث</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(idx);
          return (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleFlip(idx)}
              className="aspect-square rounded-xl overflow-hidden tap-scale"
              style={{ perspective: 600 }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  className="absolute inset-0 bg-secondary rounded-xl flex items-center justify-center border border-white/5"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="w-3 h-3 rounded-full bg-primary/30" />
                </div>
                <div
                  className="absolute inset-0 bg-primary/15 rounded-xl flex items-center justify-center border border-primary/20"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className="text-2xl">{card.emoji}</span>
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      {finished && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <p className="text-3xl font-black text-primary">{time.toFixed(1)}ث</p>
          <p className="text-muted-foreground">أحسنت! أكملت التحدي</p>
          <div className="flex gap-3">
            <button
              onClick={() => initGame()}
              className="flex-1 py-3 rounded-xl bg-secondary font-medium tap-scale flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              مرة أخرى
            </button>
            <button
              onClick={() => setShowLeaderboard(true)}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium tap-scale"
            >
              المتصدرين
            </button>
          </div>
        </motion.div>
      )}

      <BottomSheet open={showLeaderboard} onClose={() => setShowLeaderboard(false)} title="أسرع اللاعبين">
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {leaderboard.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
              <span className="w-8 text-center font-bold text-muted-foreground">{i + 1}</span>
              <span className="flex-1 text-sm font-medium truncate">{s.user_name || 'مشترك'}</span>
              <span className="text-sm font-bold text-primary">{s.memory_best_time}ث</span>
            </div>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}