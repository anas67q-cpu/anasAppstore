import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Pencil, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BottomSheet from '@/components/BottomSheet';
import { playTap } from '@/lib/sounds';

export default function UserManager({ onBack }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
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
    setSaving(true);
    await base44.entities.UserStats.update(editing.id, editValues);
    setStats(prev => prev.map(s => s.id === editing.id ? { ...s, ...editValues } : s));
    setEditing(null);
    setSaving(false);
  };

  const FIELD_LABELS = {
    total_points: 'النقاط الكلية',
    current_streak: 'السلسلة الحالية',
    highest_streak: 'أعلى سلسلة',
    total_correct: 'صحيح',
    total_wrong: 'خاطئ',
    total_missed: 'فاتته',
  };

  const ic = 'w-full bg-background rounded-xl px-3 py-2.5 text-sm text-foreground outline-none border border-border focus:border-primary';

  return (
    <>
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-secondary tap-scale">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground">المشتركون ({stats.length})</h2>
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو البريد..."
            className="w-full bg-secondary rounded-xl px-3 py-2.5 pr-10 text-sm text-foreground outline-none" />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="card-surface shadow-card p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: 'hsl(var(--primary))' }}>
                  {(s.user_name || '?').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{s.user_name || 'بدون اسم'}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{s.user_email}</p>
                </div>
                <div className="text-left flex-shrink-0">
                  <p className="text-base font-black" style={{ color: 'hsl(var(--primary))' }}>{s.total_points}</p>
                  <p className="text-[9px] text-muted-foreground">نقطة</p>
                </div>
                <button onClick={() => handleEdit(s)} className="p-2 rounded-xl bg-secondary tap-scale">
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomSheet open={!!editing} onClose={() => setEditing(null)} title={editing?.user_name || 'تعديل'}>
        {editing && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(editValues).map(([key, val]) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground mb-1 block">{FIELD_LABELS[key] || key}</label>
                  <input type="number" value={val} onChange={e => setEditValues(p => ({ ...p, [key]: Number(e.target.value) }))} className={ic} />
                </div>
              ))}
            </div>
            <button onClick={handleSave} disabled={saving}
              className="w-full py-3.5 rounded-xl text-white font-bold tap-scale"
              style={{ background: 'hsl(var(--primary))' }}>
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        )}
      </BottomSheet>
    </>
  );
}