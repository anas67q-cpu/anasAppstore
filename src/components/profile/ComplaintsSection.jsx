import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ComplaintsSection({ user, stats }) {
  const [complaints, setComplaints] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const data = await base44.entities.Complaint.filter({ user_email: user?.email }, '-created_date');
    setComplaints(data);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    const msg = text.trim();
    setText('');

    // Optimistic — add immediately with temp id and pending flag
    const optimistic = {
      id: `opt_${Date.now()}`,
      message: msg,
      status: 'pending',
      created_date: new Date().toISOString(),
      _pending: true,
    };
    setComplaints(prev => [optimistic, ...prev]);

    const created = await base44.entities.Complaint.create({
      user_email: user?.email,
      user_name: stats?.user_name || user?.full_name || '',
      message: msg,
      status: 'pending',
    });

    // Replace optimistic with real record
    setComplaints(prev => prev.map(c => c.id === optimistic.id ? created : c));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
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
          disabled={!text.trim()}
          className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ background: 'hsl(var(--primary))' }}
        >
          <Send className="w-4 h-4" />
          إرسال
        </button>
      </div>

      {/* List */}
      {!loading && complaints.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground font-medium">سابقة</p>
          <AnimatePresence initial={false}>
            {complaints.map(c => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: c._pending ? 0.65 : 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-2"
              >
                <div className="p-3 rounded-xl bg-secondary relative">
                  <p className="text-xs text-muted-foreground mb-1">رسالتك</p>
                  <p className="text-sm text-foreground">{c.message}</p>
                  {c._pending && (
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-pulse text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">جاري الإرسال</span>
                    </div>
                  )}
                </div>
                {!c._pending && (
                  c.admin_reply ? (
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
                  )
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}