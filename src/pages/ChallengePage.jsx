import { useState } from 'react';
import DailyQuestion from '@/components/challenge/DailyQuestion';
import RoundModal from '@/components/challenge/RoundModal';
import { motion } from 'framer-motion';
import { Play, Trophy, Clock, Star } from 'lucide-react';
import { playTap } from '@/lib/sounds';

export default function ChallengePage({ user, stats, questions, answers, setStats, setAnswers, refreshStats }) {
  const [showRound, setShowRound] = useState(false);
  const userCategory = stats?.category || 'guest';
  const userEmail = user?.email || '';

  const visibleQs = (questions || []).filter(q => {
    if (!q.is_published) return false;
    const ta = q.target_audience || 'all';
    if (ta === 'all') return true;
    if (ta === 'contestants') return userCategory === 'contestant';
    if (ta === 'guests') return userCategory === 'guest';
    if (ta === 'specific') return (q.target_emails || []).includes(userEmail);
    return true;
  });

  const publishedQs = visibleQs.sort((a, b) => (a.day_number || 0) - (b.day_number || 0));

  const userName = stats?.user_name || user?.full_name || '';

  return (
    <div className="space-y-5 pb-6">
      {/* Round Card */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => { playTap(); setShowRound(true); }}
        className="w-full rounded-3xl overflow-hidden shadow-card tap-scale text-right relative"
        style={{ background: 'linear-gradient(135deg, #046B67 0%, #065f5b 60%, #0a4f4c 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10 bg-white" />

        <div className="relative p-5 flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, -6, 6, -6, 0], y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="text-5xl select-none flex-shrink-0"
          >
            🏆
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs mb-0.5">جولة خاصة</p>
            <h3 className="text-white font-black text-base leading-tight">جولة في مسابقة أنس العام الماضي</h3>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-white/80 text-xs">
                <Clock className="w-3.5 h-3.5" /> دقيقتان
              </span>
              <span className="flex items-center gap-1 text-white/80 text-xs">
                <Star className="w-3.5 h-3.5" /> 10 أسئلة
              </span>
              <span className="flex items-center gap-1 text-white/80 text-xs">
                <Trophy className="w-3.5 h-3.5" /> ليدربورد خاص
              </span>
            </div>
          </div>
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <Play className="w-5 h-5 text-white" fill="white" />
          </div>
        </div>
      </motion.button>

      <RoundModal
        open={showRound}
        onClose={() => setShowRound(false)}
        user={user}
        userName={userName}
      />

      <h2 className="text-xl font-bold text-foreground">
        سؤال اليوم{publishedQs.length > 1 ? ` (${publishedQs.length} أسئلة)` : ''}
      </h2>
      {publishedQs.length > 1 ? (
        publishedQs.map(q => (
          <DailyQuestion
            key={q.id}
            questions={[q]}
            answers={answers}
            user={user}
            stats={stats}
            setStats={setStats}
            setAnswers={setAnswers}
            refreshStats={refreshStats}
          />
        ))
      ) : (
        <DailyQuestion
          questions={visibleQs}
          answers={answers}
          user={user}
          stats={stats}
          setStats={setStats}
          setAnswers={setAnswers}
          refreshStats={refreshStats}
        />
      )}
    </div>
  );
}