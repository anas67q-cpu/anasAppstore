import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function DailyStatus({ todayAnswer, todayQuestion }) {
  let status = 'waiting';
  let label = 'في انتظار السؤال';
  let Icon = Clock;
  let iconColor = 'text-muted-foreground';
  let bgColor = 'bg-secondary';

  if (todayQuestion && !todayAnswer) {
    status = 'pending';
    label = 'السؤال وصل — أجب الآن';
    Icon = Clock;
    iconColor = 'text-primary';
    bgColor = 'bg-primary/10';
  } else if (todayAnswer?.is_correct) {
    status = 'correct';
    label = 'أحسنت! إجابة صحيحة';
    Icon = CheckCircle;
    iconColor = 'text-primary';
    bgColor = 'bg-primary/10';
  } else if (todayAnswer && !todayAnswer.is_correct) {
    status = 'wrong';
    label = 'إجابة خاطئة';
    Icon = XCircle;
    iconColor = 'text-destructive';
    bgColor = 'bg-destructive/10';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className={`rounded-2xl p-4 flex items-center gap-3 ${bgColor}`}
    >
      <Icon className={`w-5 h-5 ${iconColor}`} />
      <span className="text-sm font-medium text-foreground">{label}</span>
    </motion.div>
  );
}