import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function ComplaintsManager() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [saving, setSaving] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const data = await base44.entities.Complaint.list('-created_date', 200);
    setComplaints(data);
    setLoading(false);
  };

  const handleReply = async (complaint) => {
    const reply = replyText[complaint.id]?.trim();
    if (!reply) return;
    setSaving(complaint.id);
    await base44.entities.Complaint.update(complaint.id, { admin_reply: reply, status: 'replied' });
    setComplaints(prev => prev.map(c => c.id === complaint.id ? { ...c, admin_reply: reply, status: 'replied' } : c));
    setSaving(null);
  };

  const pending = complaints.filter(c => c.status === 'pending');
  const replied = complaints.filter(c => c.status === 'replied');

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-secondary tap-scale" aria-label="رجوع">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">الشكاوى والاستفسارات</h2>
          {pending.length > 0 && (
            <p className="text-xs text-orange-500 font-medium">{pending.length} بانتظار الرد</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
        </div>
      ) : complaints.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">لا توجد شكاوى بعد</p>
      ) : (
        <div className="space-y-3">
          {complaints.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="card-surface shadow-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-foreground">{c.user_name || '—'}</p>
                  <p className="text-xs text-muted-foreground">{c.user_email}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(c.created_date).toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                  </p>
                </div>
                {c.status === 'pending'
                  ? <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-600"><Clock className="w-3 h-3" /> بانتظار الرد</span>
                  : <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full text-white" style={{ background: '#046B67' }}><CheckCircle2 className="w-3 h-3" /> تم الرد</span>
                }
              </div>

              <div className="p-3 rounded-xl bg-secondary">
                <p className="text-sm text-foreground">{c.message}</p>
              </div>

              {c.admin_reply && (
                <div className="p-3 rounded-xl border" style={{ borderColor: '#046B6740', background: '#046B6710' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: '#046B67' }}>ردك:</p>
                  <p className="text-sm text-foreground">{c.admin_reply}</p>
                </div>
              )}

              <div className="flex gap-2">
                <textarea
                  value={replyText[c.id] || ''}
                  onChange={e => setReplyText(p => ({ ...p, [c.id]: e.target.value }))}
                  placeholder={c.admin_reply ? 'تعديل الرد...' : 'اكتب ردك هنا...'}
                  className="flex-1 min-h-[70px] bg-secondary rounded-xl px-3 py-2 text-sm text-foreground outline-none resize-none border border-transparent focus:border-primary"
                />
                <button
                  onClick={() => handleReply(c)}
                  disabled={saving === c.id || !replyText[c.id]?.trim()}
                  className="px-4 py-2 rounded-xl text-white font-bold flex items-center gap-1 disabled:opacity-40 self-end"
                  style={{ background: 'hsl(var(--primary))' }}
                >
                  {saving === c.id ? '...' : <Send className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}