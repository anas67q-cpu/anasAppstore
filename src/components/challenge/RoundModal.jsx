import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Clock, CheckCircle, XCircle, Play, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TOTAL_TIME = 120; // 2 minutes

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Leaderboard screen ──────────────────────────────────────────────────────
function RoundLeaderboard({ score, timeTaken, totalQs, userName, onClose }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.RoundResult.list('-score', 100).then(list => {
      // sort: highest score first, then lowest time
      const sorted = [...list].sort((a, b) =>
        b.score !== a.score ? b.score - a.score : a.time_taken - b.time_taken
      );
      setResults(sorted);
      setLoading(false);
    });
  }, []);

  const myRank = results.findIndex(r => r.user_email === results.find(r2 => r2.user_name === userName)?.user_email) + 1;
  const MEDALS = ['🥇', '🥈', '🥉'];
  const PODIUM_COLORS = ['#f59e0b', '#94a3b8', '#cd7c2f'];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 flex-shrink-0" style={{ background: 'hsl(var(--primary))' }}>
        <button onClick={onClose} className="p-2 rounded-full bg-white/20 tap-scale">
          <X className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-white font-black text-lg">نتائج الجولة 🏆</h2>
        <div className="w-9" />
      </div>

      {/* My result card */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 200 }}
          className="rounded-3xl p-5 text-center"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(174 93% 32%) 100%)' }}
        >
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 10 }}
            className="text-5xl font-black text-white mb-1"
          >
            {score}/{totalQs}
          </motion.p>
          <p className="text-white/80 text-sm">نقاطك في الجولة</p>
          <div className="flex justify-center gap-6 mt-3">
            <div className="text-center">
              <p className="text-white font-black text-lg">{formatTime(timeTaken)}</p>
              <p className="text-white/70 text-xs">وقتك</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-white font-black text-lg">
                {Math.round((score / totalQs) * 100)}%
              </p>
              <p className="text-white/70 text-xs">دقة الإجابات</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Leaderboard list */}
      <div className="flex-1 overflow-y-auto scroll-ios px-5 pb-6">
        <p className="text-sm font-bold text-foreground mb-3">لوحة الصدارة 🏅</p>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((r, i) => {
              const isMe = r.user_name === userName;
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all ${isMe ? 'ring-2 ring-primary' : ''}`}
                  style={isMe
                    ? { background: 'hsl(var(--primary)/0.12)' }
                    : { background: 'hsl(var(--secondary))' }
                  }
                >
                  <span className="w-7 text-center text-sm font-bold text-muted-foreground">
                    {i < 3 ? MEDALS[i] : i + 1}
                  </span>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                    style={{ background: i < 3 ? PODIUM_COLORS[i] : 'hsl(var(--muted))' }}
                  >
                    {(r.user_name || 'م').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {r.user_name || 'مشترك'} {isMe && '(أنت)'}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatTime(r.time_taken)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black" style={{ color: 'hsl(var(--primary))' }}>
                      {r.score}/{r.total_questions}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Question card ───────────────────────────────────────────────────────────
function QuestionCard({ question, index, total, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (opt) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    const correct = opt === question.correct_answer;
    setTimeout(() => onAnswer(correct), 700);
  };

  const optionLetters = ['أ', 'ب', 'ج', 'د'];

  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -80, opacity: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      className="flex flex-col gap-5"
    >
      {/* Progress */}
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < index ? 'hsl(var(--primary))' : i === index ? 'hsl(var(--primary)/0.4)' : 'hsl(var(--muted))' }}
          />
        ))}
      </div>

      {/* Question */}
      <div className="card-surface p-5 rounded-3xl shadow-card">
        <p className="text-xs text-muted-foreground mb-2">سؤال {index + 1} من {total}</p>
        <p className="text-base font-bold text-foreground leading-relaxed">{question.text}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {(question.options || []).map((opt, i) => {
          const isSelected = selected === opt;
          const isCorrect = opt === question.correct_answer;
          let bg = 'hsl(var(--card))';
          let border = 'hsl(var(--border))';
          let textColor = 'hsl(var(--foreground))';

          if (revealed) {
            if (isCorrect) { bg = '#dcfce7'; border = '#16a34a'; textColor = '#166534'; }
            else if (isSelected) { bg = '#fee2e2'; border = '#dc2626'; textColor = '#991b1b'; }
          } else if (isSelected) {
            bg = 'hsl(var(--primary)/0.1)';
            border = 'hsl(var(--primary))';
          }

          return (
            <motion.button
              key={opt}
              whileTap={revealed ? {} : { scale: 0.97 }}
              onClick={() => handleSelect(opt)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-right transition-all tap-scale"
              style={{ background: bg, borderColor: border, color: textColor }}
            >
              <span
                className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ background: revealed && isCorrect ? '#16a34a' : revealed && isSelected ? '#dc2626' : 'hsl(var(--secondary))', color: revealed ? '#fff' : 'hsl(var(--foreground))' }}
              >
                {revealed && isCorrect ? <CheckCircle className="w-4 h-4" /> : revealed && isSelected ? <XCircle className="w-4 h-4" /> : optionLetters[i]}
              </span>
              <span className="text-sm font-medium flex-1">{opt}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Main modal ──────────────────────────────────────────────────────────────
export default function RoundModal({ open, onClose, user, userName }) {
  const [phase, setPhase] = useState('intro'); // intro | playing | results
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [startTime, setStartTime] = useState(null);
  const [finalTime, setFinalTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const endRound = useCallback(async (finalScore, elapsed) => {
    clearInterval(timerRef.current);
    setFinalTime(elapsed);
    setPhase('results');

    // Save best score only
    const existing = await base44.entities.RoundResult.filter({ user_email: user?.email || '' });
    const best = existing[0];
    const shouldSave = !best || finalScore > best.score || (finalScore === best.score && elapsed < best.time_taken);
    if (shouldSave) {
      const data = {
        user_email: user?.email || '',
        user_name: userName || user?.full_name || '',
        score: finalScore,
        time_taken: elapsed,
        total_questions: questions.length || 10,
      };
      if (best) {
        await base44.entities.RoundResult.update(best.id, data);
      } else {
        await base44.entities.RoundResult.create(data);
      }
    }
  }, [user, userName, questions.length]);

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          const elapsed = TOTAL_TIME - 0;
          endRound(score, elapsed);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // When timeLeft hits 0 during playing
  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      const elapsed = TOTAL_TIME;
      endRound(score, elapsed);
    }
  }, [timeLeft, phase]);

  const startRound = async () => {
    setLoading(true);
    const qs = await base44.entities.RoundQuestion.list('order', 50);
    setQuestions(qs);
    setCurrentIdx(0);
    setScore(0);
    setTimeLeft(TOTAL_TIME);
    setStartTime(Date.now());
    setLoading(false);
    setPhase('playing');
  };

  const handleAnswer = useCallback((correct) => {
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(s => s + 1);
    const nextIdx = currentIdx + 1;
    if (nextIdx >= questions.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      endRound(newScore, elapsed);
    } else {
      setCurrentIdx(nextIdx);
    }
  }, [currentIdx, questions.length, score, startTime, endRound]);

  const handleClose = () => {
    clearInterval(timerRef.current);
    setPhase('intro');
    setCurrentIdx(0);
    setScore(0);
    setTimeLeft(TOTAL_TIME);
    onClose();
  };

  const timerDanger = timeLeft <= 30;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="fixed inset-0 z-[9999] flex flex-col bg-background"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {phase === 'results' ? (
            <RoundLeaderboard
              score={score}
              timeTaken={finalTime}
              totalQs={questions.length}
              userName={userName || user?.full_name || ''}
              onClose={handleClose}
            />
          ) : (
            <>
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 flex-shrink-0"
                style={{ background: 'hsl(var(--primary))', paddingTop: 'max(16px, env(safe-area-inset-top, 0px))', paddingBottom: '16px', borderRadius: '0 0 24px 24px' }}
              >
                {phase === 'playing' ? (
                  <motion.div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ background: timerDanger ? '#ef444430' : 'rgba(255,255,255,0.2)' }}
                    animate={timerDanger ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                  >
                    <Clock className="w-4 h-4 text-white" />
                    <span className={`font-black text-white text-lg ${timerDanger ? 'text-red-200' : ''}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </motion.div>
                ) : (
                  <button onClick={handleClose} className="p-2 rounded-full bg-white/20 tap-scale">
                    <X className="w-5 h-5 text-white" />
                  </button>
                )}
                <h2 className="text-white font-black">جولة مسابقة أنس 🏆</h2>
                {phase === 'playing' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <Star className="w-4 h-4 text-yellow-300" fill="#fde047" />
                    <span className="font-black text-white">{score}</span>
                  </div>
                ) : (
                  <div className="w-9" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto scroll-ios px-5 pt-6 pb-10">
                {phase === 'intro' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-6 text-center pt-4"
                  >
                    <motion.div
                      animate={{ rotate: [0, -5, 5, -5, 0], y: [0, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                      className="text-8xl select-none"
                    >
                      🏆
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-black text-foreground mb-2">جولة في مسابقة أنس العام الماضي</h2>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        اختبر معلوماتك في أسئلة من مسابقة أنس العام الماضي!
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 w-full">
                      {[
                        { icon: '📝', label: 'عدد الأسئلة', value: '10 أسئلة' },
                        { icon: '⏱️', label: 'الوقت الكلي', value: 'دقيقتان' },
                        { icon: '⭐', label: 'كل سؤال', value: 'نقطة واحدة' },
                      ].map((item, i) => (
                        <div key={i} className="card-surface p-3 rounded-2xl shadow-card text-center">
                          <span className="text-2xl">{item.icon}</span>
                          <p className="text-[10px] text-muted-foreground mt-1">{item.label}</p>
                          <p className="text-xs font-bold text-foreground mt-0.5">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="card-surface p-4 rounded-2xl w-full text-right shadow-card">
                      <p className="text-xs font-bold text-foreground mb-2">قواعد الجولة 📋</p>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        <li>• لديك دقيقتان فقط للإجابة على جميع الأسئلة</li>
                        <li>• كل إجابة صحيحة = نقطة واحدة</li>
                        <li>• يُسجَّل أفضل نتيجة لك في لوحة الصدارة</li>
                        <li>• عند التساوي يتقدم الأسرع</li>
                        <li>• هذه الجولة لا تؤثر على نقاط المسابقة الرئيسية</li>
                      </ul>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={loading ? undefined : startRound}
                      disabled={loading}
                      className="w-full py-4 rounded-2xl font-black text-white text-lg shadow-card tap-scale flex items-center justify-center gap-3"
                      style={{ background: 'hsl(var(--primary))' }}
                    >
                      {loading ? (
                        <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-white animate-spin" />
                      ) : (
                        <>
                          <Play className="w-6 h-6" fill="white" />
                          ابدأ الجولة
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}

                {phase === 'playing' && questions.length > 0 && (
                  <AnimatePresence mode="wait">
                    <QuestionCard
                      key={currentIdx}
                      question={questions[currentIdx]}
                      index={currentIdx}
                      total={questions.length}
                      onAnswer={handleAnswer}
                    />
                  </AnimatePresence>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}