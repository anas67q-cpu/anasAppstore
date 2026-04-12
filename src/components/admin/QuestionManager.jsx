import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BottomSheet from '@/components/BottomSheet';
import QuestionForm from '@/components/admin/QuestionForm';

export default function QuestionManager({ onBack }) {
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

  return (
    <>
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-xl bg-secondary tap-scale">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h2 className="text-lg font-bold text-foreground">الأسئلة ({questions.length})</h2>
          </div>
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="p-2.5 rounded-xl text-white tap-scale"
            style={{ background: 'hsl(var(--primary))' }}>
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
                    {q.publish_date && (
                      <p className="text-[10px] text-muted-foreground mt-1">{q.publish_date}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <button onClick={() => togglePublish(q)} className="p-1.5 rounded-lg bg-secondary tap-scale">
                      {q.is_published
                        ? <Eye className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
                        : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    <button onClick={() => { setEditing(q); setShowForm(true); }}
                      className="p-1.5 rounded-lg bg-secondary tap-scale">
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg bg-secondary tap-scale">
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