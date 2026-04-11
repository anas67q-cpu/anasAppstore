import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { playCorrect, playWrong, playTap } from '@/lib/sounds';

function getNextQuestionTime() {
  // 9:30 PM Makkah time (UTC+3) = 18:30 UTC
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(18, 30, 0, 0);
  if (now >= target) target.setUTCDate(target.getUTCDate() + 1);
  return target;
}

function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getPointsForDay(dayNumber) {
  if (dayNumber <= 10) return 1;
  if (dayNumber <= 20) return 2;
  if (dayNumber <= 28) return 3;
  return 5; // day 29 special
}

export default function DailyQuestion({ questions, answers, user, stats, setStats, setAnswers, refreshStats }) {
  const [phase, setPhase] = useState('preview'); // preview, answering, result
  const [timeLeft, setTimeLeft] = useState(0);
  const [countdown, setCountdown] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const timerRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];
  const todayQuestion = questions.find(q => q.publish_date === today && q.is_published);
  const todayAnswer = todayQuestion ? answers.find(a => a.question_id === todayQuestion.id) : null;

  useEffect(() => {
    if (todayAnswer) {
      setPhase('result');
    } else if (todayQuestion) {
      setPhase('preview');
    }
  }, [todayAnswer, todayQuestion]);

  // Countdown to next question
  useEffect(() => {
    if (phase === 'result' || !todayQuestion) {
      const interval = setInterval(() => {
        const diff = getNextQuestionTime() - new Date();
        setCountdown(formatCountdown(diff));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, todayQuestion]);

  // Question timer
  useEffect(() => {
    if (phase !== 'answering') return;
    const limit = todayQuestion?.time_limit || 90;
    setTimeLeft(limit);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const handleTimeout = async () => {
    if (!todayQuestion || todayAnswer) return;
    const answer = {
      question_id: todayQuestion.id,
      user_email: user.email,
      user_answer: '',
      is_correct: false,
      points_earned: 0,
      day_number: todayQuestion.day_number,
    };
    const created = await base44.entities.Answer.create(answer);
    setAnswers(prev => [created, ...prev]);
    if (stats) {
      await base44.entities.UserStats.update(stats.id, {
        total_missed: (stats.total_missed || 0) + 1,
        current_streak: 0,
      });
    }
    refreshStats();
    setPhase('result');
  };

  const handleAnswer = async (option) => {
    if (selectedAnswer !== null || !todayQuestion) return;
    playTap();
    setSelectedAnswer(option);
    clearInterval(timerRef.current);

    const isCorrect = option === todayQuestion.correct_answer;
    const pts = isCorrect ? getPointsForDay(todayQuestion.day_number) : 0;

    if (isCorrect) playCorrect();
    else playWrong();

    const answer = {
      question_id: todayQuestion.id,
      user_email: user.email,
      user_answer: option,
      is_correct: isCorrect,
      points_earned: pts,
      day_number: todayQuestion.day_number,
      time_taken: (todayQuestion.time_limit || 90) - timeLeft,
    };
    const created = await base44.entities.Answer.create(answer);
    setAnswers(prev => [created, ...prev]);

    if (stats) {
      const updates = {
        total_points: (stats.total_points || 0) + pts,
      };
      if (isCorrect) {
        updates.total_correct = (stats.total_correct || 0) + 1;
        updates.current_streak = (stats.current_streak || 0) + 1;
        updates.highest_streak = Math.max((stats.highest_streak || 0), updates.current_streak);
      } else {
        updates.total_wrong = (stats.total_wrong || 0) + 1;
        updates.current_streak = 0;
      }
      await base44.entities.UserStats.update(stats.id, updates);
    }
    refreshStats();

    setTimeout(() => setPhase('result'), 1000);
  };

  const typeLabels = {
    multiple_choice: 'اختيار من متعدد',
    true_false: 'صح أو خطأ',
    essay: 'مقالي',
  };

  // No question today
  if (!todayQuestion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-surface rounded-2xl p-6 text-center space-y-4"
      >
        <Lock className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">لا يوجد سؤال اليوم</p>
        <div>
          <p className="text-xs text-muted-foreground">السؤال القادم خلال</p>
          <p className="text-2xl font-bold text-primary mt-1 font-mono">{countdown}</p>
        </div>
      </motion.div>
    );
  }

  // Preview phase - show السؤال وصل
  if (phase === 'preview' && !todayAnswer) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-surface rounded-2xl p-6 space-y-5"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4 glow-accent">
            <span className="text-3xl">📩</span>
          </div>
          <h2 className="text-xl font-bold">السؤال وصل</h2>
        </div>

        <div className="space-y-3">
          <InfoRow label="النوع" value={typeLabels[todayQuestion.type] || todayQuestion.type} />
          <InfoRow label="الوقت" value={`${todayQuestion.time_limit || 90} ثانية`} />
          <InfoRow label="النقاط" value={getPointsForDay(todayQuestion.day_number)} />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setPhase('answering')}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold glow-accent tap-scale"
        >
          ابدأ الإجابة
        </motion.button>
      </motion.div>
    );
  }

  // Answering phase
  if (phase === 'answering') {
    const limit = todayQuestion.time_limit || 90;
    const pct = (timeLeft / limit) * 100;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-5"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">يوم {todayQuestion.day_number}</span>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className={`text-sm font-bold font-mono ${timeLeft <= 10 ? 'text-destructive' : 'text-primary'}`}>
              {timeLeft}ث
            </span>
          </div>
        </div>

        <div className="w-full bg-secondary rounded-full h-1">
          <motion.div
            className={`h-full rounded-full ${timeLeft <= 10 ? 'bg-destructive' : 'bg-primary'}`}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <h2 className="text-lg font-bold leading-relaxed">{todayQuestion.text}</h2>

        {todayQuestion.type === 'multiple_choice' && todayQuestion.options && (
          <div className="space-y-3">
            {todayQuestion.options.map((opt, i) => {
              let classes = 'bg-secondary';
              if (selectedAnswer !== null) {
                if (opt === todayQuestion.correct_answer) classes = 'bg-primary/20 border-primary';
                else if (opt === selectedAnswer) classes = 'bg-destructive/20 border-destructive';
              }
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAnswer(opt)}
                  className={`w-full p-4 rounded-xl text-right font-medium border border-transparent transition-all tap-scale ${classes}`}
                >
                  {opt}
                </motion.button>
              );
            })}
          </div>
        )}

        {todayQuestion.type === 'true_false' && (
          <div className="flex gap-3">
            {['صح', 'خطأ'].map(opt => {
              let classes = 'bg-secondary';
              if (selectedAnswer !== null) {
                if (opt === todayQuestion.correct_answer) classes = 'bg-primary/20 border-primary';
                else if (opt === selectedAnswer) classes = 'bg-destructive/20 border-destructive';
              }
              return (
                <motion.button
                  key={opt}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAnswer(opt)}
                  className={`flex-1 py-4 rounded-xl font-bold border border-transparent tap-scale ${classes}`}
                >
                  {opt}
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>
    );
  }

  // Result phase
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-surface rounded-2xl p-6 text-center space-y-5"
    >
      {todayAnswer?.is_correct ? (
        <CheckCircle className="w-16 h-16 text-primary mx-auto" />
      ) : (
        <XCircle className="w-16 h-16 text-destructive mx-auto" />
      )}
      <h2 className="text-xl font-bold">
        {todayAnswer?.is_correct ? 'إجابة صحيحة!' : 'إجابة خاطئة'}
      </h2>
      {todayAnswer?.points_earned > 0 && (
        <p className="text-primary font-bold text-lg">+{todayAnswer.points_earned} نقطة</p>
      )}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">انتظر السؤال القادم</p>
        <p className="text-xl font-bold text-primary mt-2 font-mono">{countdown}</p>
      </div>
    </motion.div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}