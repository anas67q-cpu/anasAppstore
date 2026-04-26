import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '—';
  return `${seconds} ث`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

export default function AnswerViewer() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQ, setActiveQ] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [qs, as] = await Promise.all([
      base44.entities.Question.list('day_number', 100),
      base44.entities.Answer.list('-created_date', 1000),
    ]);
    setQuestions(qs);
    setAnswers(as);
    setLoading(false);
  };

  const getAnswersForQ = (q) => answers.filter(a => a.question_id === q.id);

  const statusIcon = (a, q) => {
    if (q?.type === 'essay' && !a.graded && a.user_answer) return <Clock className="w-3.5 h-3.5 text-amber-400" />;
    if (a.is_correct) return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    if (!a.user_answer) return <AlertCircle className="w-3.5 h-3.5 text-orange-400" />;
    return <XCircle className="w-3.5 h-3.5 text-red-500" />;
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-secondary tap-scale" aria-label="رجوع">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground">إجابات المتسابقين</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => {
            const qAnswers = getAnswersForQ(q);
            const isOpen = activeQ === q.id;
            return (
              <div key={q.id} className="card-surface shadow-card overflow-hidden">
                <button
                  onClick={() => setActiveQ(isOpen ? null : q.id)}
                  className="w-full p-4 flex items-center gap-3 text-right tap-scale"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background: 'hsl(var(--primary))' }}>{q.day_number}</div>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-bold text-foreground line-clamp-1">{q.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{qAnswers.length} إجابة</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="border-t border-border">
                    {qAnswers.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-4">لا توجد إجابات</p>
                    ) : (
                      qAnswers.map((a, i) => (
                        <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                          className="p-3 border-b border-border last:border-0">
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-0.5">{statusIcon(a, q)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-foreground">{a.user_name || '—'}</span>
                                <span className="text-[10px] text-muted-foreground">{a.user_email}</span>
                              </div>
                              {a.user_answer ? (
                                <p className="text-xs text-muted-foreground mt-1 bg-secondary px-2 py-1 rounded-lg">{a.user_answer}</p>
                              ) : (
                                <p className="text-xs text-orange-400 mt-0.5">فاته السؤال</p>
                              )}
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[10px] text-muted-foreground">⏱ {formatTime(a.time_taken)}</span>
                                <span className="text-[10px] text-muted-foreground">🕐 {formatDate(a.created_date)}</span>
                                {a.points_earned > 0 && (
                                  <span className="text-[10px] font-bold" style={{ color: 'hsl(var(--primary))' }}>+{a.points_earned} نقطة</span>
                                )}
                              </div>
                            </div>
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