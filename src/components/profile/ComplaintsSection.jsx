import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ComplaintsSection({ user, stats }) {
  const [complaints, setComplaints] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const data = await base44.entities.Complaint.filter({ user_email: user?.email }, '-created_date');
    setComplaints(data);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    const created = await base44.entities.Complaint.create({
      user_email: user?.email,
      user_name: stats?.user_name || user?.full_name || '',
      message: text.trim(),
      status: 'pending',
    });
    setComplaints(prev => [created, ...prev]);
    setText('');
    setSending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface shadow-card p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} />
        <h3 className="text-base font-bold text-foreground">الشكاوى والاستفسارات</h3>
      </div>

      {/* Send form */}
      <div className="space-y-2">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="اكتب شكواك أو استفسارك هنا..."
          className="w-full min-h-[90px] bg-secondary rounded-xl px-3 py-3 text-sm text-foreground outline-none resize-none border border-transparent focus:border-primary"
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ background: 'hsl(var(--primary))' }}
        >
          <Send className="w-4 h-4" />
          {sending ? 'جاري الإرسال...' : 'إرسال'}
        </button>
      </div>

      {/* Previous complaints */}
      {loading ? null : complaints.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground font-medium">سابقة</p>
          {complaints.map(c => (
            <div key={c.id} className="space-y-2">
              <div className="p-3 rounded-xl bg-secondary">
                <p className="text-xs text-muted-foreground mb-1">رسالتك</p>
                <p className="text-sm text-foreground">{c.message}</p>
              </div>
              {c.admin_reply ? (
                <div className="p-3 rounded-xl border" style={{ borderColor: '#046B6740', background: '#046B6710' }}>
                  <div className="flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3 h-3" style={{ color: '#046B67' }} />
                    <p className="text-xs font-bold" style={{ color: '#046B67' }}>رد الإدارة</p>
                  </div>
                  <p className="text-sm text-foreground">{c.admin_reply}</p>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-secondary/50 text-center">
                  <p className="text-xs text-muted-foreground">⏳ بانتظار رد الإدارة</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}