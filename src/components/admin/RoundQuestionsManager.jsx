import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Plus, Trash2, Save, Edit2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { playTap } from '@/lib/sounds';

const EMPTY_Q = { text: '', options: ['', '', '', ''], correct_answer: '', order: 0 };

export default function RoundQuestionsManager() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null or question object (new has no id)
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    const qs = await base44.entities.RoundQuestion.list('order', 50);
    setQuestions(qs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (q) => {
    playTap();
    setEditing({ ...q, options: q.options?.length ? [...q.options] : ['', '', '', ''] });
  };

  const handleNew = () => {
    playTap();
    setEditing({ ...EMPTY_Q, options: ['', '', '', ''], order: questions.length + 1 });
  };

  const handleSave = async () => {
    if (!editing.text.trim() || !editing.correct_answer.trim()) return;
    const filtered = editing.options.filter(o => o.trim());
    if (!filtered.includes(editing.correct_answer)) return;
    setSaving(true);
    const data = { text: editing.text.trim(), options: filtered, correct_answer: editing.correct_answer, order: editing.order || 0 };
    if (editing.id) {
      await base44.entities.RoundQuestion.update(editing.id, data);
    } else {
      await base44.entities.RoundQuestion.create(data);
    }
    await load();
    setEditing(null);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = async (id) => {
    playTap();
    await base44.entities.RoundQuestion.delete(id);
    setQuestions(qs => qs.filter(q => q.id !== id));
  };

  const updateOption = (i, val) => {
    const opts = [...editing.options];
    opts[i] = val;
    setEditing(e => ({ ...e, options: opts }));
  };

  const optionLetters = ['أ', 'ب', 'ج', 'د'];

  return (
    <div className="px-4 py-4 space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => { playTap(); navigate('/admin'); }} className="p-2 rounded-xl bg-secondary tap-scale">
          <ArrowRight className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">أسئلة الجولة</h2>
          <p className="text-xs text-muted-foreground">أسئلة جولة مسابقة أنس العام الماضي</p>
        </div>
      </div>

      <button
        onClick={handleNew}
        className="w-full py-3.5 rounded-2xl font-bold text-white tap-scale flex items-center justify-center gap-2"
        style={{ background: 'hsl(var(--primary))' }}
      >
        <Plus className="w-5 h-5" /> إضافة سؤال جديد
      </button>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-3">📝</p>
          <p className="font-medium">لا توجد أسئلة بعد</p>
          <p className="text-sm mt-1">أضف أسئلة للجولة باستخدام الزر أعلاه</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card-surface shadow-card p-4 rounded-2xl"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                  style={{ background: 'hsl(var(--primary)/0.15)', color: 'hsl(var(--primary))' }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-relaxed">{q.text}</p>
                  <p className="text-xs mt-1.5" style={{ color: 'hsl(var(--primary))' }}>✓ {q.correct_answer}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleEdit(q)} className="p-2 rounded-xl bg-secondary tap-scale">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="p-2 rounded-xl bg-red-50 tap-scale">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit / New form overlay */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex flex-col"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="absolute inset-x-0 bottom-0 rounded-t-3xl flex flex-col max-h-[90dvh]"
              style={{ background: 'hsl(var(--card))' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
                <button onClick={() => setEditing(null)} className="p-2 rounded-xl bg-secondary tap-scale">
                  <ArrowRight className="w-5 h-5 text-foreground" />
                </button>
                <h3 className="font-black text-foreground">{editing.id ? 'تعديل السؤال' : 'سؤال جديد'}</h3>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl font-bold text-white text-sm tap-scale flex items-center gap-1.5"
                  style={{ background: 'hsl(var(--primary))' }}
                >
                  {saving ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin" /> : <Save className="w-4 h-4" />}
                  حفظ
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scroll-ios px-5 py-4 space-y-4 pb-8">
                {/* Question text */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1.5 block">نص السؤال</label>
                  <textarea
                    value={editing.text}
                    onChange={e => setEditing(ed => ({ ...ed, text: e.target.value }))}
                    rows={3}
                    className="w-full p-3 rounded-2xl border border-border bg-secondary text-sm text-foreground resize-none outline-none focus:ring-2 focus:ring-primary"
                    placeholder="اكتب السؤال هنا..."
                  />
                </div>

                {/* Options */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1.5 block">الخيارات</label>
                  <div className="space-y-2">
                    {editing.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button
                          onClick={() => setEditing(ed => ({ ...ed, correct_answer: opt }))}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 tap-scale transition-all ${editing.correct_answer === opt && opt.trim() ? 'text-white' : 'text-muted-foreground'}`}
                          style={{ background: editing.correct_answer === opt && opt.trim() ? 'hsl(var(--primary))' : 'hsl(var(--secondary))' }}
                        >
                          {editing.correct_answer === opt && opt.trim() ? <CheckCircle className="w-4 h-4" /> : optionLetters[i]}
                        </button>
                        <input
                          value={opt}
                          onChange={e => updateOption(i, e.target.value)}
                          className="flex-1 p-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                          placeholder={`الخيار ${optionLetters[i]}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">اضغط على رمز الخيار لتحديده كإجابة صحيحة</p>
                </div>

                {/* Order */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1.5 block">الترتيب</label>
                  <input
                    type="number"
                    value={editing.order}
                    onChange={e => setEditing(ed => ({ ...ed, order: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}