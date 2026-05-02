import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

function getPoints(dayNumber) {
  if (dayNumber <= 10) return 1;
  if (dayNumber <= 20) return 2;
  if (dayNumber <= 28) return 3;
  return 5;
}

export default function EssayReview() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQ, setActiveQ] = useState(null);
  const [saving, setSaving] = useState(null);
  const [noteText, setNoteText] = useState({});

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

  // Smart grading: handles toggling and prevents double-points
  const handleGrade = async (answer, isCorrect) => {
    // No change if same grade already applied
    if (answer.graded && answer.is_correct === isCorrect) return;

    setSaving(answer.id);
    const pts = isCorrect ? getPoints(answer.day_number) : 0;

    // Update stats: reverse previous if graded
    const statsArr = await base44.entities.UserStats.filter({ user_email: answer.user_email });
    const s = statsArr[0];
    if (s) {
      const upd = {};
      // Reverse old grade
      if (answer.graded) {
        if (answer.is_correct) {
          upd.total_correct = Math.max(0, (s.total_correct || 0) - 1);
          upd.total_points = Math.max(0, (s.total_points || 0) - (answer.points_earned || 0));
        } else {
          upd.total_wrong = Math.max(0, (s.total_wrong || 0) - 1);
        }
      }
      // Apply new grade
      if (isCorrect) {
        upd.total_correct = (upd.total_correct ?? s.total_correct ?? 0) + 1;
        upd.total_points = (upd.total_points ?? s.total_points ?? 0) + pts;
      } else {
        upd.total_wrong = (upd.total_wrong ?? s.total_wrong ?? 0) + 1;
      }
      await base44.entities.UserStats.update(s.id, upd);
    }

    const note = noteText[answer.id]?.trim() || answer.admin_note || '';
    await base44.entities.Answer.update(answer.id, {
      is_correct: isCorrect,
      points_earned: pts,
      graded: true,
      admin_note: note,
    });

    setAnswers(prev => prev.map(a =>
      a.id === answer.id ? { ...a, is_correct: isCorrect, points_earned: pts, graded: true, admin_note: note } : a
    ));
    setSaving(null);
  };

  const handleSaveNote = async (answer) => {
    const note = noteText[answer.id]?.trim();
    if (note === undefined) return;
    setSaving(answer.id + '_note');
    await base44.entities.Answer.update(answer.id, { admin_note: note });
    setAnswers(prev => prev.map(a => a.id === answer.id ? { ...a, admin_note: note } : a));
    setSaving(null);
  };

  const statusBadge = (a) => {
    if (a.graded && a.is_correct) return <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ background: '#046B6720', color: '#046B67' }}><CheckCircle2 className="w-3 h-3" /> صحيح</span>;
    if (a.graded && !a.is_correct) return <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ background: '#ef444420', color: '#ef4444' }}><XCircle className="w-3 h-3" /> خاطئ</span>;
    return <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground"><Clock className="w-3 h-3" /> انتظار</span>;
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-secondary tap-scale" aria-label="رجوع">
          <ArrowRight className="w-5 h-5 text-foreground" />
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
            const pending = qAnswers.filter(a => !a.graded);
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
                          className="p-4 border-b border-border last:border-0 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-xs font-bold text-foreground mb-0.5">{a.user_name || '—'}</p>
                              <p className="text-xs text-muted-foreground">{a.user_email}</p>
                              <p className="text-sm text-foreground leading-relaxed bg-secondary p-3 rounded-xl mt-2">{a.user_answer}</p>
                            </div>
                            <div className="flex-shrink-0">{statusBadge(a)}</div>
                          </div>

                          {/* Admin note */}
                          <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">ملاحظة للمتسابق (اختياري)</label>
                            <div className="flex gap-2">
                              <textarea
                                value={noteText[a.id] !== undefined ? noteText[a.id] : (a.admin_note || '')}
                                onChange={e => setNoteText(p => ({ ...p, [a.id]: e.target.value }))}
                                placeholder="اكتب ملاحظتك..."
                                className="flex-1 min-h-[60px] bg-secondary rounded-xl px-3 py-2 text-sm text-foreground outline-none resize-none border border-transparent focus:border-primary"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button onClick={() => handleGrade(a, true)}
                              disabled={saving === a.id}
                              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1 disabled:opacity-50"
                              style={{ background: a.graded && a.is_correct ? '#046B67' : '#046B6790' }}>
                              <CheckCircle2 className="w-4 h-4" /> صحيح
                            </button>
                            <button onClick={() => handleGrade(a, false)}
                              disabled={saving === a.id}
                              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-1 disabled:opacity-50"
                              style={{ background: a.graded && !a.is_correct ? '#ef4444' : '#ef444490' }}>
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