import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BottomSheet from '@/components/BottomSheet';
import QuestionForm from '@/components/admin/QuestionForm';

export default function QuestionManager({ onBack }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const loadQuestions = async () => {
    const q = await base44.entities.Question.list('day_number', 100);
    setQuestions(q);
    setLoading(false);
  };

  useEffect(() => { loadQuestions(); }, []);

  const handleDelete = async (id) => {
    await base44.entities.Question.delete(id);
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const togglePublish = async (q) => {
    const updated = await base44.entities.Question.update(q.id, {
      is_published: !q.is_published,
      status: !q.is_published ? 'published' : 'draft'
    });
    setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, is_published: !x.is_published, status: !x.is_published ? 'published' : 'draft' } : x));
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingQuestion(null);
    loadQuestions();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="tap-scale">
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <h2 className="text-lg font-bold">الأسئلة</h2>
        </div>
        <button
          onClick={() => { setEditingQuestion(null); setShowForm(true); }}
          className="p-2 rounded-xl bg-primary tap-scale"
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="glass-surface rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                      يوم {q.day_number}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${q.is_published ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                      {q.is_published ? 'منشور' : 'مسودة'}
                    </span>
                  </div>
                  <p className="text-sm truncate">{q.text}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => togglePublish(q)} className="p-1.5 rounded-lg hover:bg-white/5 tap-scale">
                    {q.is_published ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-primary" />}
                  </button>
                  <button onClick={() => { setEditingQuestion(q); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-white/5 tap-scale">
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg hover:bg-white/5 tap-scale">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <BottomSheet open={showForm} onClose={() => { setShowForm(false); setEditingQuestion(null); }} title={editingQuestion ? 'تعديل السؤال' : 'سؤال جديد'}>
        <QuestionForm question={editingQuestion} onSaved={handleSaved} />
      </BottomSheet>
    </div>
  );
}