import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Check, X, Info } from 'lucide-react';
import { playTap } from '@/lib/sounds';

export default function NameEditor({ userName, statsName, onSave }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(statsName || userName || '');

  const displayName = statsName || userName || 'لم يُحدَّد';

  const handleSave = () => {
    if (name.trim()) {
      playTap();
      onSave(name.trim());
      setEditing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface shadow-card p-5 space-y-3"
    >
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-black text-white"
          style={{ background: 'hsl(var(--primary))' }}>
          {displayName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                className="flex-1 rounded-xl px-3 py-2 text-sm bg-secondary text-foreground outline-none focus:ring-2"
                style={{ '--tw-ring-color': 'hsl(var(--primary))' }}
                autoFocus
              />
              <button onClick={handleSave} className="p-2 rounded-xl text-white tap-scale" style={{ background: 'hsl(var(--primary))' }}>
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setEditing(false)} className="p-2 rounded-xl bg-secondary tap-scale">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">اسمك في لوحة المتصدرين</p>
              </div>
              <button onClick={() => { playTap(); setEditing(true); setName(statsName || userName || ''); }}
                className="p-2 rounded-xl bg-secondary tap-scale">
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'hsl(var(--primary))' }} />
        <p className="text-xs text-muted-foreground leading-relaxed">
          هذا الاسم هو الذي يظهر في لوحة المتصدرين وليس اسم حسابك الأصلي
        </p>
      </div>
    </motion.div>
  );
}