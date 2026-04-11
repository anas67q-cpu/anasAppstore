import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Timer, CheckCircle, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { playCorrect, playWrong, playTap } from '@/lib/sounds';
import BottomSheet from '@/components/BottomSheet';

export default function QuickChallenge({ onBack, user, stats, setStats }) {
  const [phase, setPhase] = useState('setup'); // setup, playing, results
  const [questionCount, setQuestionCount] = useState(5);
  const [totalTime, setTotalTime] = useState(60);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answered, setAnswered] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const generateQuestions = useCallback(async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `أنشئ ${questionCount} سؤال ثقافي متنوع وصعب باللغة العربية. الأسئلة يجب أن تكون مختلفة المواضيع (تاريخ، علوم، جغرافيا، أدب، رياضة، دين). كل سؤال له 4 خيارات.`,
      response_json_schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                correct: { type: "number" }
              }
            }
          }
        }
      }
    });
    setQuestions(res.questions || []);
    setPhase('playing');
    setTimeLeft(totalTime);
    setLoading(false);
  }, [questionCount, totalTime]);

  useEffect(() => {
    if (phase !== 'playing' || timeLeft <= 0) {
      if (phase === 'playing' && timeLeft <= 0) finishChallenge();
      return;
    }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  const handleAnswer = (idx) => {
    if (answered !== null) return;
    playTap();
    const isCorrect = idx === questions[currentQ].correct;
    setAnswered(idx);
    if (isCorrect) {
      playCorrect();
      setScore(prev => prev + 1);
    } else {
      playWrong();
    }
    setTimeout(() => {
      if (currentQ + 1 >= questions.length) {
        finishChallenge();
      } else {
        setCurrentQ(prev => prev + 1);
        setAnswered(null);
      }
    }, 800);
  };

  const finishChallenge = async () => {
    setPhase('results');
    const timeTaken = totalTime - timeLeft;
    if (stats) {
      const newScore = score > (stats.quick_challenge_score || 0) ? score : stats.quick_challenge_score;
      const newTime = timeTaken < (stats.quick_challenge_time || 9999) ? timeTaken : stats.quick_challenge_time;
      await base44.entities.UserStats.update(stats.id, {
        quick_challenge_score: newScore,
        quick_challenge_time: newTime,
      });
      setStats(prev => ({ ...prev, quick_challenge_score: newScore, quick_challenge_time: newTime }));
    }
    const all = await base44.entities.UserStats.list('-quick_challenge_score', 50);
    setLeaderboard(all.filter(s => s.quick_challenge_score > 0));
  };

  if (phase === 'setup') {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground tap-scale">
          <ArrowRight className="w-5 h-5" />
          <span className="text-sm">رجوع</span>
        </button>
        <h2 className="text-xl font-bold">التحدي السريع</h2>

        <div className="space-y-4">
          <div className="glass-surface rounded-2xl p-4">
            <p className="text-sm text-muted-foreground mb-3">عدد الأسئلة</p>
            <div className="flex gap-2">
              {[5, 7, 10].map(n => (
                <button
                  key={n}
                  onClick={() => { playTap(); setQuestionCount(n); }}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all tap-scale ${
                    questionCount === n
                      ? 'bg-primary text-primary-foreground glow-accent'
                      : 'bg-secondary text-foreground'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-surface rounded-2xl p-4">
            <p className="text-sm text-muted-foreground mb-3">الوقت الكلي</p>
            <div className="flex gap-2">
              {[30, 60, 90, 120].map(t => (
                <button
                  key={t}
                  onClick={() => { playTap(); setTotalTime(t); }}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all tap-scale ${
                    totalTime === t
                      ? 'bg-primary text-primary-foreground glow-accent'
                      : 'bg-secondary text-foreground'
                  }`}
                >
                  {t}ث
                </button>
              ))}
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={generateQuestions}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base glow-accent disabled:opacity-50"
        >
          {loading ? 'جاري التحضير...' : 'ابدأ التحدي'}
        </motion.button>
      </div>
    );
  }

  if (phase === 'playing' && questions.length > 0) {
    const q = questions[currentQ];
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{currentQ + 1}/{questions.length}</span>
          <div className="flex items-center gap-2 text-primary">
            <Timer className="w-4 h-4" />
            <span className="text-sm font-bold">{timeLeft}ث</span>
          </div>
        </div>
        <div className="w-full bg-secondary rounded-full h-1.5">
          <motion.div
            className="bg-primary h-full rounded-full"
            animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>
        <h3 className="text-lg font-bold leading-relaxed">{q.text}</h3>
        <div className="space-y-3">
          {q.options.map((opt, idx) => {
            let bg = 'bg-secondary hover:bg-secondary/80';
            if (answered !== null) {
              if (idx === q.correct) bg = 'bg-primary/20 border-primary';
              else if (idx === answered) bg = 'bg-destructive/20 border-destructive';
            }
            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAnswer(idx)}
                className={`w-full p-4 rounded-xl text-right text-sm font-medium transition-all border border-transparent ${bg} tap-scale`}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <div className="text-5xl font-black text-primary">{score}/{questions.length}</div>
          <p className="text-muted-foreground">نتيجتك في التحدي السريع</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { setPhase('setup'); setScore(0); setCurrentQ(0); setAnswered(null); }}
            className="flex-1 py-3 rounded-xl bg-secondary font-medium tap-scale"
          >
            حاول مرة أخرى
          </button>
          <button
            onClick={() => setShowLeaderboard(true)}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium tap-scale"
          >
            المتصدرين
          </button>
        </div>

        <button onClick={onBack} className="w-full py-3 text-sm text-muted-foreground tap-scale">
          رجوع
        </button>

        <BottomSheet open={showLeaderboard} onClose={() => setShowLeaderboard(false)} title="متصدري التحدي السريع">
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {leaderboard.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <span className="w-8 text-center font-bold text-muted-foreground">{i + 1}</span>
                <span className="flex-1 text-sm font-medium truncate">{s.user_name || 'مشترك'}</span>
                <span className="text-sm font-bold text-primary">{s.quick_challenge_score}</span>
              </div>
            ))}
          </div>
        </BottomSheet>
      </div>
    );
  }

  return null;
}