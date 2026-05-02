import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, Pencil, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BottomSheet from '@/components/BottomSheet';
import QuestionForm from '@/components/admin/QuestionForm';

export default function QuestionManager() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const q = await base44.entities.Question.list('day_number', 100);
    setQuestions(q);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Question.delete(id);
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const togglePublish = async (q) => {
    const newVal = !q.is_published;
    await base44.entities.Question.update(q.id, { is_published: newVal, status: newVal ? 'published' : 'draft' });
    setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, is_published: newVal, status: newVal ? 'published' : 'draft' } : x));
  };

  const typeMap = { multiple_choice: 'م.م', true_false: 'ص/خ', essay: 'مقالي' };

  const markMissed = async (q) => {
    if (!q.publish_date) {
      alert('يجب تحديد تاريخ نشر للسؤال أولاً');
      return;
    }

    // Determine target category
    const ta = q.target_audience || 'all';
    let targetCategory = null;
    if (ta === 'contestants') targetCategory = 'contestant';
    else if (ta === 'guests') targetCategory = 'guest';

    // Get all users matching the target
    let allStats = await base44.entities.UserStats.list();
    let targetUsers = allStats;
    if (ta === 'contestants') {
      targetUsers = allStats.filter(s => s.category === 'contestant');
    } else if (ta === 'guests') {
      // guest is default — include users with category='guest' OR no category set
      targetUsers = allStats.filter(s => !s.category || s.category === 'guest');
    } else if (ta === 'specific') {
      const emails = q.target_emails || [];
      targetUsers = allStats.filter(s => emails.includes(s.user_email));
    }

    // Get existing answers for this question
    const existingAnswers = await base44.entities.Answer.filter({ question_id: q.id });
    const answeredEmails = new Set(existingAnswers.map(a => a.user_email));

    // Users who haven't answered
    const notAnswered = targetUsers.filter(u => !answeredEmails.has(u.user_email));

    if (notAnswered.length === 0) {
      alert('جميع المستخدمين المستهدفين أجابوا على هذا السؤال');
      return;
    }

    // Create missed answers for them — empty user_answer signals "missed", correct_answer stored in admin_note for display
    await Promise.all(notAnswered.map(async (u) => {
      await base44.entities.Answer.create({
        question_id: q.id,
        user_email: u.user_email,
        user_name: u.user_name || u.user_email,
        user_answer: '',
        is_correct: false,
        points_earned: 0,
        time_taken: 0,
        day_number: q.day_number,
        graded: false,
        admin_note: `الإجابة الصحيحة: ${q.correct_answer}`,
      });
      // Update user stats: increment total_missed
      const statsArr = await base44.entities.UserStats.filter({ user_email: u.user_email });
      if (statsArr[0]) {
        await base44.entities.UserStats.update(statsArr[0].id, {
          total_missed: (statsArr[0].total_missed || 0) + 1,
        });
      }
    }));

    alert(`✅ تم تسجيل ${notAnswered.length} شخص كفائت لهذا السؤال`);
  };

  return (
    <>
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-secondary tap-scale" aria-label="رجوع">
              <ArrowRight className="w-5 h-5 text-foreground" />
            </button>
            <h2 className="text-lg font-bold text-foreground">الأسئلة ({questions.length})</h2>
          </div>
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="p-2.5 rounded-xl text-white tap-scale" style={{ background: 'hsl(var(--primary))' }}
            aria-label="إضافة سؤال">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="space-y-2.5">
            {questions.map((q, i) => (
              <motion.div key={q.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="card-surface shadow-card p-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <span className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white"
                      style={{ background: 'hsl(var(--primary))' }}>{q.day_number}</span>
                    <span className="text-[9px] text-muted-foreground">{typeMap[q.type]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed line-clamp-2">{q.text}</p>
                    {q.image_url && <p className="text-[10px] text-primary mt-0.5">📷 تحتوي صورة</p>}
                    {q.target_audience && q.target_audience !== 'all' && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        🎯 {q.target_audience === 'contestants' ? 'للمتسابقين' : q.target_audience === 'guests' ? 'للضيوف' : 'لأشخاص محددين'}
                      </p>
                    )}
                    {q.publish_date && <p className="text-[10px] text-muted-foreground mt-1">{q.publish_date}</p>}
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <button onClick={() => togglePublish(q)} className="p-1.5 rounded-lg bg-secondary tap-scale" aria-label={q.is_published ? 'إخفاء' : 'نشر'}>
                      {q.is_published
                        ? <Eye className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
                        : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    <button onClick={() => { setEditing(q); setShowForm(true); }}
                      className="p-1.5 rounded-lg bg-secondary tap-scale" aria-label="تعديل">
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </button>
                    {q.publish_date && (
                      <button onClick={() => markMissed(q)} className="p-1.5 rounded-lg tap-scale" aria-label="تسجيل الفائتين"
                        title="تسجيل من لم يجب كفائت"
                        style={{ background: '#f59e0b18', border: '1px solid #f59e0b55' }}>
                        <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg bg-secondary tap-scale" aria-label="حذف">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomSheet open={showForm} onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? 'تعديل السؤال' : 'سؤال جديد'}>
        <QuestionForm question={editing} onSaved={() => { setShowForm(false); setEditing(null); load(); }} />
      </BottomSheet>
    </>
  );
}