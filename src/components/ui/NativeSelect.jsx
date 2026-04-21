import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { playTap } from '@/lib/sounds';

/**
 * A native-style select replacement that opens a BottomSheet on mobile.
 * Props: value, onChange, options: [{value, label}], label, className
 */
export default function NativeSelect({ value, onChange, options = [], label, className = '' }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <>
      <button
        type="button"
        onClick={() => { playTap(); setOpen(true); }}
        className={`w-full flex items-center justify-between bg-secondary rounded-xl px-3 py-3 text-sm text-foreground outline-none tap-scale ${className}`}
      >
        <span>{selected?.label || '—'}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={label}>
        <div className="space-y-2">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { playTap(); onChange(opt.value); setOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl tap-scale transition-colors"
              style={{
                background: value === opt.value ? 'hsl(var(--primary) / 0.12)' : 'hsl(var(--secondary))',
                color: value === opt.value ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
              }}
            >
              <span className="font-medium">{opt.label}</span>
              {value === opt.value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}