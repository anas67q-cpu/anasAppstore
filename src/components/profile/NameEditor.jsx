import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Check } from 'lucide-react';
import { playTap } from '@/lib/sounds';

export default function NameEditor({ userName, onSave }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(userName || '');

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
      className="glass-surface rounded-2xl p-5"
    >
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-primary">
            {(userName || 'م')[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1 bg-secondary rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <button onClick={handleSave} className="p-2 rounded-xl bg-primary tap-scale">
                <Check className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground truncate">{userName || 'اسمك'}</h2>
              <button
                onClick={() => { playTap(); setEditing(true); setName(userName || ''); }}
                className="p-1.5 rounded-lg hover:bg-white/5 tap-scale"
              >
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">ملفك الشخصي</p>
        </div>
      </div>
    </motion.div>
  );
}