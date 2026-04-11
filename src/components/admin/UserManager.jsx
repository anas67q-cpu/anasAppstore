import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Pencil } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BottomSheet from '@/components/BottomSheet';
import { playTap } from '@/lib/sounds';

export default function UserManager({ onBack }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const s = await base44.entities.UserStats.list('-total_points', 200);
    setStats(s);
    setLoading(false);
  };

  const filtered = stats.filter(s =>
    (s.user_name || '').includes(search) || (s.user_email || '').includes(search)
  );

  const handleEdit = (s) => {
    playTap();
    setEditing(s);
    setEditValues({
      total_points: s.total_points || 0,
      current_streak: s.current_streak || 0,
      highest_streak: s.highest_streak || 0,
      total_correct: s.total_correct || 0,
      total_wrong: s.total_wrong || 0,
      total_missed: s.total_missed || 0,
    });
  };

  const handleSave = async () => {
    playTap();
    await base44.entities.UserStats.update(editing.id, editValues);
    setStats(prev => prev.map(s => s.id === editing.id ? { ...s, ...editValues } : s));
    setEditing(null);
  };

  const inputClass = 'w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="tap-scale">
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </button>
        <h2 className="text-lg font-bold">المستخدمين</h2>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث..."
          className={`${inputClass} pr-10`}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="glass-surface rounded-xl p-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{s.user_name || 'بدون اسم'}</p>
                <p className="text-xs text-muted-foreground truncate">{s.user_email}</p>
              </div>
              <span className="text-sm font-bold text-primary">{s.total_points}</span>
              <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg hover:bg-white/5 tap-scale">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <BottomSheet open={!!editing} onClose={() => setEditing(null)} title={editing?.user_name || 'تعديل'}>
        {editing && (
          <div className="space-y-3">
            {Object.entries(editValues).map(([key, val]) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground mb-1 block">{key}</label>
                <input
                  type="number"
                  value={val}
                  onChange={e => setEditValues(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                  className={inputClass}
                />
              </div>
            ))}
            <button onClick={handleSave} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold tap-scale">
              حفظ
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}