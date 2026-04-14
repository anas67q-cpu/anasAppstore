import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { toHijri } from '@/lib/hijri';
import { playTap } from '@/lib/sounds';

const DAYS = ['السبت','الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'];

function getWeekSaturday() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
  const day = now.getDay();
  const diff = day === 6 ? 0 : day + 1;
  const sat = new Date(now);
  sat.setDate(now.getDate() - diff);
  sat.setHours(0, 0, 0, 0);
  return sat;
}

function getDayStatus(dateStr, questions, answers, userEmail) {
  const q = questions.find(q => q.publish_date === dateStr);
  if (!q) return { status: 'none', q: null, a: null };
  const a = answers.find(a => a.question_id === q.id);
  if (a?.is_correct) return { status: 'correct', q, a };
  // Essay pending grading → show as future/pending
  if (a && !a.graded && q.type === 'essay' && a.user_answer) return { status: 'future', q, a };
  if (a && a.user_answer) return { status: 'wrong', q, a };
  // Published, no answer yet
  if (q.is_published) {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' });
    if (dateStr === today) return { status: 'future', q, a: null }; // today → still open
    return { status: 'missed', q, a: null };
  }
  return { status: 'future', q, a: null };
}

function getPointsForDay(dayNumber) {
  if (dayNumber <= 10) return 1;
  if (dayNumber <= 20) return 2;
  if (dayNumber <= 28) return 3;
  return 5;
}

const STATUS_COLORS = {
  correct: '#046B67',
  wrong: '#ef4444',
  missed: '#f59e0b',
  future: null,
  none: null,
};

export default function WeeklyProgress({ questions = [], answers = [], userEmail = '' }) {
  const [selected, setSelected] = useState(null);

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' });

  const weekDays = useMemo(() => {
    const sat = getWeekSaturday();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sat);
      d.setDate(sat.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      const { status, q, a } = getDayStatus(dateStr, questions, answers, userEmail);
      return { d, dateStr, dayName: DAYS[i], isToday, status, q, a };
    });
  }, [questions, answers, userEmail]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card-surface shadow-card p-5"
      >
        <h3 className="text-base font-bold text-foreground mb-4">التقدم الأسبوعي</h3>
        <div className="flex gap-1.5">
          {weekDays.map((day, i) => {
            const color = STATUS_COLORS[day.status];
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                onClick={() => { playTap(); setSelected(day); }}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl tap-scale transition-all bg-secondary ${day.isToday ? 'ring-2 ring-primary' : ''}`}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: color ? color + '22' : 'transparent' }}
                >
                  {day.status === 'correct' && <CheckCircle2 className="w-4 h-4" style={{ color: '#046B67' }} />}
                  {day.status === 'wrong' && <XCircle className="w-4 h-4" style={{ color: '#ef4444' }} />}
                  {day.status === 'missed' && <AlertCircle className="w-4 h-4" style={{ color: '#f59e0b' }} />}
                  {(day.status === 'future' || day.status === 'none') && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'hsl(0,0%,65%)' }} />
                  )}
                </div>
                <span className="text-[9px] text-muted-foreground font-medium text-center leading-tight">{day.dayName}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-border">
          {[
            { color: '#046B67', label: 'صحيح' },
            { color: '#ef4444', label: 'خاطئ' },
            { color: '#f59e0b', label: 'فاتتك' },
            { color: '#94a3b8', label: 'قادم' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-[10px] text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <BottomSheet open={!!selected} onClose={() => setSelected(null)}>
        {selected && <DayDetail day={selected} />}
      </BottomSheet>
    </>
  );
}

function DayDetail({ day }) {
  const hijriDate = toHijri(day.d);

  const statusMap = {
    correct: { label: 'أجبت صحيح ✅', color: '#046B67' },
    wrong: { label: 'أجبت خاطئ ❌', color: '#ef4444' },
    missed: { label: 'فاتك هذا السؤال ⚠️', color: '#f59e0b' },
    future: { label: day.q?.is_published ? 'السؤال وصل! انتظرك 📩' : 'لم يحن وقته بعد', color: '#94a3b8' },
    none: { label: 'لا يوجد سؤال', color: '#94a3b8' },
  };

  const st = statusMap[day.status];
  const typeMap = { multiple_choice: 'اختيار من متعدد', true_false: 'صح أو خطأ', essay: 'مقالي' };

  // Check if user has answered (opened the question)
  const hasAnswered = !!day.a;

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold text-foreground">{day.dayName}</h3>
        <p className="text-sm text-muted-foreground">{hijriDate}</p>
        <span
          className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mt-1"
          style={{ background: st.color }}
        >
          {st.label}
        </span>
      </div>

      {day.q ? (
        <div className="space-y-3">
          <div className="card-surface p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">سؤال رقم {day.q.day_number}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground">
                {typeMap[day.q.type] || day.q.type}
              </span>
            </div>
            {/* Only show question text if user has answered */}
            {hasAnswered ? (
              <p className="text-sm font-medium leading-relaxed text-foreground">{day.q.text}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">افتح الصندوق لرؤية السؤال 📦</p>
            )}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground">النقاط:</span>
              <span className="text-sm font-bold" style={{ color: 'hsl(var(--primary))' }}>
                {day.q.points || getPointsForDay(day.q.day_number)}
              </span>
            </div>
          </div>

          {hasAnswered && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary">
                <span className="text-xs text-muted-foreground">إجابتك:</span>
                <span className="text-sm font-medium text-foreground">{day.a.user_answer || '—'}</span>
              </div>
              {day.status !== 'future' && day.q?.correct_answer && (
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#046B6715' }}>
                  <span className="text-xs text-muted-foreground">الإجابة الصحيحة:</span>
                  <span className="text-sm font-bold" style={{ color: '#046B67' }}>{day.q.correct_answer}</span>
                </div>
              )}
              {/* Admin note */}
              {day.a?.admin_note && (
                <div className="p-3 rounded-xl border" style={{ borderColor: '#6366f140', background: '#6366f110' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: '#6366f1' }}>ملاحظة الإدارة</p>
                  <p className="text-sm text-foreground">{day.a.admin_note}</p>
                </div>
              )}
            </div>
          )}

          {day.status === 'missed' && (
            <div className="p-3 rounded-xl" style={{ background: '#f59e0b18' }}>
              <p className="text-xs text-center" style={{ color: '#f59e0b' }}>
                🔒 انتهى وقت هذا السؤال وأُغلق
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground text-sm">
          لا يوجد سؤال لهذا اليوم
        </div>
      )}
    </div>
  );
}