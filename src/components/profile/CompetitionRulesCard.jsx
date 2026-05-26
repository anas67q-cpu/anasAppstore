import { motion } from 'framer-motion';
import { FileText, ExternalLink, ChevronLeft } from 'lucide-react';
import { playTap } from '@/lib/sounds';

export default function CompetitionRulesCard({ rulesUrl }) {
  if (!rulesUrl) return null;

  const handleOpen = () => {
    playTap();
    window.open(rulesUrl, '_blank');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <button
        onClick={handleOpen}
        className="w-full p-4 rounded-2xl flex items-center gap-4 tap-scale text-right"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--primary) / 0.05) 100%)',
          border: '1.5px solid hsl(var(--primary) / 0.25)'
        }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'hsl(var(--primary) / 0.15)' }}>
          <FileText className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-foreground">نظام المسابقة</p>
          <p className="text-xs text-muted-foreground mt-0.5">اضغط للاطلاع على الشروط والأحكام</p>
        </div>
        <ExternalLink className="w-5 h-5 flex-shrink-0" style={{ color: 'hsl(var(--primary))' }} />
      </button>
    </motion.div>
  );
}