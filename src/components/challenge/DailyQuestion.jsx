import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Lock, Timer } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { playCorrect, playWrong, playTap } from '@/lib/sounds';

function getNextQuestionTime() {
  const now = new Date();
  const target = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
  const targetRiyadh = new Date(now);
  // 9:30 PM Riyadh = 18:30 UTC
  const riyadhNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
  const next = new Date(riyadhNow);
  next.setHours(21, 30, 0, 0);
  if (riyadhNow >= next) next.setDate(next.getDate() + 1);
  const diffMs = next - riyadhNow;
  return diffMs;
}

function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function getPointsForDay(d) {
  if (d <= 10) return 1; if (d <= 20) return 2; if (d <= 28) return 3; return 5;
}

export default function DailyQuestion({ questions, answers, user, stats, setStats, setAnswers, refreshStats }) {
  const [phase, setPhase] = useState('preview');
  const [timeLeft, setTimeLeft] = useState(0);
  const [countdown, setCountdown] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const timerRef = useRef(null);

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' });
  const todayQ = questions.find(q => q.publish_date === today && q.is_published);
  const todayA = todayQ ? answers.find(a => a.question_id === todayQ.id) : null;

  useEffect(() => {
    if (todayA) setPhase('result');
    else if (todayQ) setPhase('preview');
    else setPhase('waiting');
  }, [todayA?.id, todayQ?.id]);

  useEffect(() => {
    if (phase === 'result' || phase === 'waiting') {
      const iv = setInterval(() => setCountdown(formatCountdown(getNextQuestionTime())), 1000);
      return () => clearInterval(iv);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'answering') return;
    const limit = todayQ?.time_limit || 90;
    setTimeLeft(limit);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const handleTimeout = async () => {
    if (!todayQ || todayA) return;
    const ans = { question_id: todayQ.id, user_email: user.email, user_answer: '', is_correct: false, points_earned: 0, day_number: todayQ.day_number };
    const created = await base44.entities.Answer.create(ans);
    setAnswers(prev => [created, ...prev]);
    if (stats) await base44.entities.UserStats.update(stats.id, { total_missed: (stats.total_missed||0)+1, current_streak: 0 });
    refreshStats();
    setPhase('result');
  };

  const handleAnswer = async (option) => {
    if (selectedAnswer !== null) return;
    playTap();
    setSelectedAnswer(option);
    clearInterval(timerRef.current);
    const isCorrect = option === todayQ.correct_answer;
    const pts = isCorrect ? getPointsForDay(todayQ.day_number) : 0;
    if (isCorrect) playCorrect(); else playWrong();

    const ans = {
      question_id: todayQ.id, user_email: user.email, user_answer: option,
      is_correct: isCorrect, points_earned: pts, day_number: todayQ.day_number,
      time_taken: (todayQ.time_limit||90) - timeLeft,
    };
    const created = await base44.entities.Answer.create(ans);
    setAnswers(prev => [created, ...prev]);

    if (stats) {
      const upd = { total_points: (stats.total_points||0) + pts };
      if (isCorrect) {
        upd.total_correct = (stats.total_correct||0)+1;
        upd.current_streak = (stats.current_streak||0)+1;
        upd.highest_streak = Math.max(stats.highest_streak||0, upd.current_streak);
      } else {
        upd.total_wrong = (stats.total_wrong||0)+1;
        upd.current_streak = 0;
      }
      await base44.entities.UserStats.update(stats.id, upd);
    }
    refreshStats();
    setTimeout(() => setPhase('result'), 900);
  };

  const typeMap = { multiple_choice: 'اختيار من متعدد', true_false: 'صح أو خطأ', essay: 'مقالي' };

  // Waiting
  if (phase === 'waiting') {
    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="card-surface shadow-card p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: 'hsl(var(--secondary))' }}>
          <Lock className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground">في انتظار السؤال</h3>
        <p className="text-sm text-muted-foreground">يصدر السؤال كل يوم الساعة ٩:٣٠ مساءً</p>
        <div className="p-4 rounded-2xl bg-secondary">
          <p className="text-xs text-muted-foreground mb-1">الوقت المتبقي</p>
          <p className="text-3xl font-black font-mono" style={{ color: 'hsl(var(--primary))' }}>{countdown}</p>
        </div>
      </motion.div>
    );
  }

  // Preview
  if (phase === 'preview') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="card-surface shadow-card overflow-hidden">
        {/* Header */}
        <div className="p-5" style={{ background: 'hsl(var(--primary))' }}>
          <p className="text-white/80 text-xs">اليوم {todayQ?.day_number}</p>
          <h2 className="text-white text-xl font-bold mt-1">السؤال وصل! 📩</h2>
          <p className="text-white/70 text-sm mt-1">لديك {todayQ?.time_limit || 90} ثانية للإجابة</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <InfoBox label="النوع" value={typeMap[todayQ?.type] || '—'} />
            <InfoBox label="الوقت" value={`${todayQ?.time_limit || 90}ث`} />
            <InfoBox label="النقاط" value={getPointsForDay(todayQ?.day_number || 1)} accent />
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setPhase('answering')}
            className="w-full py-4 rounded-2xl font-bold text-white text-base"
            style={{ background: 'hsl(var(--primary))' }}>
            ابدأ الإجابة
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Answering
  if (phase === 'answering') {
    const limit = todayQ?.time_limit || 90;
    const pct = (timeLeft / limit) * 100;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {/* Timer bar */}
        <div className="card-surface shadow-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">يوم {todayQ?.day_number}</span>
            <div className="flex items-center gap-1.5">
              <Timer className="w-4 h-4" style={{ color: timeLeft <= 10 ? '#ef4444' : 'hsl(var(--primary))' }} />
              <span className="font-black font-mono text-base" style={{ color: timeLeft <= 10 ? '#ef4444' : 'hsl(var(--primary))' }}>
                {timeLeft}ث
              </span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${pct}%`, background: timeLeft <= 10 ? '#ef4444' : 'hsl(var(--primary))' }} />
          </div>
        </div>

        {/* Question */}
        <div className="card-surface shadow-card p-5">
          <p className="text-base font-bold leading-relaxed text-foreground">{todayQ?.text}</p>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {todayQ?.type === 'multiple_choice' && todayQ?.options?.map((opt, i) => {
            let bg = 'bg-secondary';
            let border = 'border-transparent';
            if (selectedAnswer !== null) {
              if (opt === todayQ.correct_answer) { bg = ''; border = ''; }
              else if (opt === selectedAnswer) { bg = ''; border = ''; }
            }
            const isCorrectOpt = selectedAnswer !== null && opt === todayQ.correct_answer;
            const isWrongSelected = selectedAnswer === opt && opt !== todayQ.correct_answer;

            return (
              <motion.button key={i} whileTap={{ scale: 0.97 }} onClick={() => handleAnswer(opt)}
                className={`w-full p-4 rounded-2xl text-right font-medium text-sm border transition-all tap-scale`}
                style={{
                  background: isCorrectOpt ? '#046B6720' : isWrongSelected ? '#ef444420' : 'hsl(var(--secondary))',
                  borderColor: isCorrectOpt ? '#046B67' : isWrongSelected ? '#ef4444' : 'transparent',
                  color: 'hsl(var(--foreground))'
                }}>
                {opt}
              </motion.button>
            );
          })}

          {todayQ?.type === 'true_false' && ['صح', 'خطأ'].map(opt => {
            const isCorrectOpt = selectedAnswer !== null && opt === todayQ.correct_answer;
            const isWrongSelected = selectedAnswer === opt && opt !== todayQ.correct_answer;
            return (
              <motion.button key={opt} whileTap={{ scale: 0.97 }} onClick={() => handleAnswer(opt)}
                className="w-full p-4 rounded-2xl font-bold text-base border tap-scale"
                style={{
                  background: isCorrectOpt ? '#046B6720' : isWrongSelected ? '#ef444420' : 'hsl(var(--secondary))',
                  borderColor: isCorrectOpt ? '#046B67' : isWrongSelected ? '#ef4444' : 'transparent',
                  color: 'hsl(var(--foreground))'
                }}>
                {opt}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // Result
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="card-surface shadow-card overflow-hidden">
      <div className="p-6 text-center" style={{ background: todayA?.is_correct ? '#046B6715' : '#ef444415' }}>
        {todayA?.is_correct
          ? <CheckCircle2 className="w-14 h-14 mx-auto mb-3" style={{ color: '#046B67' }} />
          : <XCircle className="w-14 h-14 mx-auto mb-3" style={{ color: '#ef4444' }} />
        }
        <h3 className="text-xl font-bold text-foreground">
          {todayA?.is_correct ? 'أحسنت! إجابة صحيحة 🎉' : todayA?.user_answer ? 'إجابة خاطئة' : 'انتهى الوقت'}
        </h3>
        {todayA?.points_earned > 0 && (
          <p className="text-base font-black mt-2" style={{ color: '#046B67' }}>+{todayA.points_earned} نقطة</p>
        )}
      </div>
      <div className="p-5 text-center space-y-3">
        <p className="text-sm text-muted-foreground">السؤال القادم خلال</p>
        <p className="text-2xl font-black font-mono" style={{ color: 'hsl(var(--primary))' }}>{countdown}</p>
      </div>
    </motion.div>
  );
}

function InfoBox({ label, value, accent }) {
  return (
    <div className="text-center p-2.5 rounded-xl bg-secondary">
      <p className="text-sm font-bold" style={{ color: accent ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}