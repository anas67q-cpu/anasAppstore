import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { playTap } from '@/lib/sounds';

export default function WarningsManager() {
  const navigate = useNavigate();
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(null);
  const [sortBy, setSortBy] = useState('count'); // 'count' | 'date'
  const [filterWithWarnings, setFilterWithWarnings] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.EscapeWarning.list();
    setWarnings(data);
    setLoading(false);
  };

  const handleReset = async (record) => {
    playTap();
    setResetting(record.id);
    await base44.entities.EscapeWarning.update(record.id, { warning_count: 0, last_warning_date: null });
    setWarnings(prev => prev.map(w => w.id === record.id ? { ...w, warning_count: 0, last_warning_date: null } : w));
    setResetting(null);
  };

  const filtered = warnings
    .filter(w => filterWithWarnings ? (w.warning_count || 0) > 0 : true)
    .sort((a, b) => {
      if (sortBy === 'count') return (b.warning_count || 0) - (a.warning_count || 0);
      return new Date(b.last_warning_date || 0) - new Date(a.last_warning_date || 0);
    });

  const totalWarnings = warnings.reduce((s, w) => s + (w.warning_count || 0), 0);
  const usersWithWarnings = warnings.filter(w => (w.warning_count || 0) > 0).length;

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => { playTap(); navigate('/admin'); }} className="p-2 rounded-xl bg-secondary tap-scale">
          <ArrowRight className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">تنبيهات المغادرة</h2>
          <p className="text-xs text-muted-foreground">رصد مغادرة الأسئلة أثناء الإجابة</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-surface shadow-card p-4 text-center rounded-2xl">
          <p className="text-2xl font-black" style={{ color: '#ef4444' }}>{usersWithWarnings}</p>
          <p className="text-xs text-muted-foreground mt-1">مشترك تلقى تنبيهاً</p>
        </div>
        <div className="card-surface shadow-card p-4 text-center rounded-2xl">
          <p className="text-2xl font-black" style={{ color: '#f59e0b' }}>{totalWarnings}</p>
          <p className="text-xs text-muted-foreground mt-1">إجمالي التنبيهات</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button onClick={() => { playTap(); setFilterWithWarnings(f => !f); }}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all tap-scale"
          style={{
            background: filterWithWarnings ? '#ef444415' : 'hsl(var(--secondary))',
            color: filterWithWarnings ? '#ef4444' : 'hsl(var(--muted-foreground))',
            border: filterWithWarnings ? '1.5px solid #ef444440' : '1.5px solid transparent',
          }}>
          {filterWithWarnings ? '⚠️ المخالفون فقط' : '👥 الكل'}
        </button>
        <button onClick={() => { playTap(); setSortBy(s => s === 'count' ? 'date' : 'count'); }}
          className="px-4 py-2 rounded-xl text-xs font-bold tap-scale bg-secondary text-muted-foreground">
          ترتيب: {sortBy === 'count' ? 'عدد التنبيهات' : 'الأحدث'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#ef4444', borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-surface p-8 text-center rounded-2xl">
          <AlertTriangle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">لا توجد تنبيهات مسجلة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((w, i) => {
            const count = w.warning_count || 0;
            const isExpanded = expanded === w.id;
            const severityColor = count >= 2 ? '#ef4444' : count === 1 ? '#f59e0b' : '#10b981';
            return (
              <motion.div key={w.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card-surface shadow-card rounded-2xl overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-base flex-shrink-0"
                    style={{ background: severityColor }}>
                    {(w.user_name || 'م').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{w.user_name || 'مشترك'}</p>
                    <p className="text-xs text-muted-foreground truncate">{w.user_email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-center">
                      <p className="text-xl font-black" style={{ color: severityColor }}>{count}</p>
                      <p className="text-[10px] text-muted-foreground">تنبيه</p>
                    </div>
                    <button onClick={() => { playTap(); setExpanded(isExpanded ? null : w.id); }}
                      className="p-1 rounded-lg bg-secondary tap-scale">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-secondary text-center">
                        <p className="text-xs text-muted-foreground">آخر تنبيه</p>
                        <p className="text-xs font-bold text-foreground mt-0.5">
                          {w.last_warning_date
                            ? new Date(w.last_warning_date).toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-secondary text-center">
                        <p className="text-xs text-muted-foreground">آخر سؤال</p>
                        <p className="text-xs font-bold text-foreground mt-0.5">
                          {w.question_day ? `اليوم ${w.question_day}` : '—'}
                        </p>
                      </div>
                    </div>
                    {count > 0 && (
                      <button onClick={() => handleReset(w)} disabled={resetting === w.id}
                        className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 tap-scale"
                        style={{ background: '#ef444415', color: '#ef4444', border: '1.5px solid #ef444430' }}>
                        {resetting === w.id
                          ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#ef4444', borderTopColor: 'transparent' }} />
                          : <><RotateCcw className="w-4 h-4" /> إعادة تعيين التنبيهات</>
                        }
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}