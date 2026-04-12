import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EssayReview({ onBack }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQ, setActiveQ] = useState(null);
  const [saving, setSaving] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [qs, as] = await Promise.all([
      base44.entities.Question.filter({ type: 'essay' }),
      base44.entities.Answer.list('-created_date', 500),
    ]);
    setQuestions(qs);
    setAnswers(as);
    setLoading(false);
  };

  const getEssayAnswers = (q) => answers.filter(a => a.question_id === q.id && a.user_answer && a.user_answer.trim());

  const handleGrade = async (answer, isCorrect) => {
    setSaving(answer.id);
    const pts = isCorrect ? (answer.day_number <= 10 ? 1 : answer.day_number <= 20 ? 2 : answer.day_number <= 28 ? 3 : 5) : 0;
    const wasGraded = answer.graded === true;
    const wasCorrect = answer.is_correct === true;
    const prevPts = answer.points_earned || 0;

    await base44.entities.Answer.update(answer.id, { is_correct: isCorrect, points_earned: pts, graded: true });

    const statsArr = await base44.entities.UserStats.filter({ user_email: answer.user_email });
    if (statsArr[0]) {
      const s = statsArr[0];
      const upd = {};
      if (!wasGraded) {
        // First time grading
        if (isCorrect) {
          upd.total_points = (s.total_points || 0) + pts;
          upd.total_correct = (s.total_correct || 0) + 1;
        } else {
          upd.total_wrong = (s.total_wrong || 0) + 1;
        }
      } else if (wasCorrect && !isCorrect) {
        // Correct → Wrong
        upd.total_points = Math.max(0, (s.total_points || 0) - prevPts);
        upd.total_correct = Math.max(0, (s.total_correct || 0) - 1);
        upd.total_wrong = (s.total_wrong || 0) + 1;
      } else if (!wasCorrect && isCorrect) {
        // Wrong → Correct
        upd.total_points = (s.total_points || 0) + pts;
        upd.total_correct = (s.total_correct || 0) + 1;
        upd.total_wrong = Math.max(0, (s.total_wrong || 0) - 1);
      }
      // Same → Same: no-op
      if (Object.keys(upd).length > 0) {
        await base44.entities.UserStats.update(s.id, upd);
      }
    }
    setAnswers(prev => prev.map(a => a.id === answer.id ? { ...a, is_correct: isCorrect, points_earned: pts, graded: true } : a));
    setSaving(null);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-secondary tap-scale">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground">تصحيح الأسئلة المقالية</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
        </div>
      ) : questions.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">لا توجد أسئلة مقالية</p>
      ) : (
        <div className="space-y-4">
          {questions.map(q => {
            const qAnswers = getEssayAnswers(q);
            const pending = qAnswers.filter(a => !a.is_correct && a.points_earned === 0 && a.user_answer);
            return (
              <div key={q.id} className="card-surface shadow-card overflow-hidden">
                <button
                  onClick={() => setActiveQ(activeQ === q.id ? null : q.id)}
                  className="w-full p-4 flex items-center justify-between text-right tap-scale"
                >
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">يوم {q.day_number}: {q.text.slice(0, 60)}...</p>
                    <p className="text-xs text-muted-foreground mt-1">{qAnswers.length} إجابة · {pending.length} بانتظار التصحيح</p>
                  </div>
                  {pending.length > 0 && (
                    <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                      style={{ background: '#f59e0b' }}>{pending.length}</span>
                  )}
                </button>

                {activeQ === q.id && (
                  <div className="border-t border-border">
                    {qAnswers.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-4">لا توجد إجابات بعد</p>
                    ) : (
                      qAnswers.map(a => (
                        <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="p-4 border-b border-border last:border-0">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <p className="text-xs font-bold text-foreground mb-0.5">{a.user_name || '—'}</p>
                              <p className="text-xs text-muted-foreground font-medium mb-1">{a.user_email}</p>
                              <p className="text-sm text-foreground leading-relaxed bg-secondary p-3 rounded-xl">{a.user_answer}</p>
                            </div>
                            <div className="flex-shrink-0">
                              {a.is_correct ? (
                                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                                  style={{ background: '#046B6720', color: '#046B67' }}>
                                  <CheckCircle2 className="w-3 h-3" /> صحيح
                                </span>
                              ) : !a.graded && a.user_answer ? (
                                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                                  <Clock className="w-3 h-3" /> انتظار
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                                  style={{ background: '#ef444420', color: '#ef4444' }}>
                                  <XCircle className="w-3 h-3" /> خاطئ
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleGrade(a, true)} disabled={saving === a.id}
                              className="flex-1 py-2 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1 disabled:opacity-50"
                              style={{ background: '#046B67' }}>
                              <CheckCircle2 className="w-4 h-4" /> صحيح
                            </button>
                            <button onClick={() => handleGrade(a, false)} disabled={saving === a.id}
                              className="flex-1 py-2 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1 disabled:opacity-50"
                              style={{ background: '#ef4444' }}>
                              <XCircle className="w-4 h-4" /> خاطئ
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}