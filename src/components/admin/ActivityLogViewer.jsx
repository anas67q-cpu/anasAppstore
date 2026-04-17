import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ACTION_MAP = {
  login: { label: 'دخول', color: '#046B67', emoji: '🟢' },
  logout: { label: 'خروج', color: '#6366f1', emoji: '🔴' },
  answer: { label: 'إجابة', color: '#f59e0b', emoji: '✏️' },
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  // Add 3 hours to compensate for server time offset
  const d = new Date(new Date(dateStr).getTime() + 3 * 60 * 60 * 1000);
  return d.toLocaleString('ar-SA', {
    timeZone: 'UTC',
    weekday: 'short', hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit',
  });
}

export default function ActivityLogViewer({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.ActivityLog.list('-created_date', 200);
    setLogs(data);
    setLoading(false);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-secondary tap-scale">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground">نشاط المتسابقين</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-xl bg-secondary tap-scale">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={async () => {
              if (!window.confirm('هل تريد حذف جميع السجلات؟')) return;
              const all = await base44.entities.ActivityLog.list('-created_date', 1000);
              await Promise.all(all.map(l => base44.entities.ActivityLog.delete(l.id)));
              setLogs([]);
            }}
            className="p-2 rounded-xl bg-destructive/10 tap-scale"
          >
            <span className="text-xs font-bold text-destructive px-1">حذف الكل</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
        </div>
      ) : logs.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">لا يوجد نشاط بعد</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log, i) => {
            const info = ACTION_MAP[log.action] || { label: log.action, color: '#94a3b8', emoji: '•' };
            return (
              <motion.div key={log.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.01 }}
                className="card-surface shadow-card p-3 flex items-center gap-3">
                <span className="text-lg flex-shrink-0">{info.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground truncate">{log.user_name || log.user_email}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                      style={{ background: info.color }}>{info.label}</span>
                  </div>
                  {log.details && <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>}
                  <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(log.created_date)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}