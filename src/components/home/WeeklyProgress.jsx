import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { toHijri } from '@/lib/hijri';
import { playTap } from '@/lib/sounds';

const DAYS = ['السبت','الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'];

function getRiyadhToday() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' });
}

// Returns 7 dateStrings for a given week offset (0=current, -1=last week, etc.)
function getWeekDateStrings(offset = 0) {
  const riyadhNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
  const day = riyadhNow.getDay();
  const daysFromSat = day === 6 ? 0 : day + 1;
  const result = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(riyadhNow);
    d.setDate(riyadhNow.getDate() - daysFromSat + i + offset * 7);
    result.push(d.toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' }));
  }
  return result;
}

function formatDateRange(dateStrings) {
  const first = dateStrings[0];
  const last = dateStrings[6];
  const fmt = (ds) => {
    const [y, m, d] = ds.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('ar-SA', {
      day: 'numeric', month: 'short',
    });
  };
  return `${fmt(first)} — ${fmt(last)}`;
}

function getDayStatus(dateStr, questions, answers) {
  const qs = questions.filter(q => q.publish_date === dateStr);
  if (qs.length === 0) return { status: 'none', entries: [] };
  const today = getRiyadhToday();

  const entries = qs.sort((a, b) => (a.day_number || 0) - (b.day_number || 0)).map(q => {
    const a = answers.find(a => a.question_id === q.id);
    let status;
    if (a?.is_correct) status = 'correct';
    else if (a && !a.graded && q.type === 'essay' && a.user_answer) status = 'future';
    else if (a && a.user_answer) status = 'wrong';
    // admin-marked missed: answer exists but user_answer is empty
    else if (a && a.user_answer === '' && !a.is_correct) status = 'missed';
    else if (q.is_published) status = dateStr === today ? 'future' : 'missed';
    else status = 'future';
    return { q, a: a || null, status };
  });

  const priority = { correct: 0, wrong: 1, missed: 2, future: 3 };
  const overall = entries.reduce((best, e) => priority[e.status] > priority[best] ? e.status : best, entries[0].status);
  return { status: overall, entries, q: entries[0].q, a: entries[0].a };
}

function getPointsForDay(dayNumber) {
  if (dayNumber <= 10) return 1;
  if (dayNumber <= 20) return 2;
  if (dayNumber <= 28) return 3;
  return 5;
}

const STATUS_COLORS = { correct: '#046B67', wrong: '#ef4444', missed: '#f59e0b', future: null, none: null };

export default function WeeklyProgress({ questions = [], answers = [], userEmail = '' }) {
  const [selected, setSelected] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0); // 0=current, -1=last week, etc.

  const todayStr = getRiyadhToday();

  const { weekDays, dateRange } = useMemo(() => {
    const dateStrings = getWeekDateStrings(weekOffset);
    const days = dateStrings.map((dateStr, i) => {
      const isToday = dateStr === todayStr;
      const { status, entries, q, a } = getDayStatus(dateStr, questions, answers);
      return { dateStr, dayName: DAYS[i], isToday, status, entries: entries || [], q, a };
    });
    return { weekDays: days, dateRange: formatDateRange(dateStrings) };
  }, [questions, answers, todayStr, weekOffset]);

  const weekLabel = weekOffset === 0 ? 'هذا الأسبوع' : weekOffset === -1 ? 'الأسبوع الماضي' : `قبل ${Math.abs(weekOffset)} أسابيع`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card-surface shadow-card p-5"
      >
        {/* Header with week navigation */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-foreground">التقدم الأسبوعي</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { if (weekOffset > -3) { playTap(); setWeekOffset(w => w - 1); } }}
              disabled={weekOffset <= -3}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-secondary tap-scale disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
            <button
              onClick={() => { if (weekOffset < 0) { playTap(); setWeekOffset(w => w + 1); } }}
              disabled={weekOffset >= 0}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-secondary tap-scale disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>

        {/* Week label + date range */}
        <div className="mb-4">
          <p className="text-xs font-semibold" style={{ color: 'hsl(var(--primary))' }}>{weekLabel}</p>
          <p className="text-[11px] text-muted-foreground">{dateRange}</p>
        </div>

        <div className="flex gap-1.5">
          {weekDays.map((day, i) => {
            const color = STATUS_COLORS[day.status];
            return (
              <motion.button
                key={`${weekOffset}-${i}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 + i * 0.04 }}
                onClick={() => { playTap(); setSelected(day); }}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl tap-scale transition-all bg-secondary ${day.isToday && weekOffset === 0 ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: color ? color + '22' : 'transparent' }}>
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
            { color: '#f59e0b', label: 'فاتك' },
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
        {selected && <DayDetail day={selected} allAnswers={answers} />}
      </BottomSheet>
    </>
  );
}

function DayDetail({ day, allAnswers }) {
  const dateParts = day.dateStr.split('-');
  const localDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
  const hijriDate = toHijri(localDate);
  const typeMap = { multiple_choice: 'اختيار من متعدد', true_false: 'صح أو خطأ', essay: 'مقالي' };
  const entries = day.entries && day.entries.length > 0 ? day.entries : (day.q ? [{ q: day.q, a: day.a, status: day.status }] : []);
  const statusLabels = {
    correct: { label: 'أجبت صحيح ✅', color: '#046B67' },
    wrong: { label: 'أجبت خاطئ ❌', color: '#ef4444' },
    missed: { label: 'فاتك السؤال ⚠️', color: '#f59e0b' },
    future: { label: 'لم يحن وقته بعد', color: '#94a3b8' },
    none: { label: 'لا يوجد سؤال', color: '#94a3b8' },
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h3 className="text-xl font-bold text-foreground">{day.dayName}</h3>
        <p className="text-sm text-muted-foreground">{hijriDate}</p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">لا يوجد سؤال لهذا اليوم</div>
      ) : (
        <div className="space-y-4">
          {entries.map(({ q, a, status }, idx) => {
            const st = { ...statusLabels[status] };
            if (status === 'future' && q?.is_published) st.label = 'السؤال وصل! انتظرك 📩';
            const hasAnswered = !!a;
            return (
              <div key={q.id} className="space-y-3">
                {entries.length > 1 && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground px-2">سؤال {idx + 1}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white" style={{ background: st.color }}>
                  {st.label}
                </span>
                <div className="card-surface p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">سؤال رقم {q.day_number}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground">{typeMap[q.type] || q.type}</span>
                  </div>
                  {(hasAnswered || status === 'missed') ? (
                    <p className="text-sm font-medium leading-relaxed text-foreground">{q.text}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">افتح الصندوق لرؤية السؤال 📦</p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-muted-foreground">النقاط:</span>
                    <span className="text-sm font-bold" style={{ color: 'hsl(var(--primary))' }}>{q.points || getPointsForDay(q.day_number)}</span>
                  </div>
                </div>
                {/* Admin-marked missed: answer exists but empty user_answer */}
                {hasAnswered && a?.user_answer === '' && status === 'missed' && (
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #f59e0b55', background: '#f59e0b0d' }}>
                    <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#f59e0b18', borderBottom: '1px solid #f59e0b33' }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#f59e0b' }} />
                      <p className="text-sm font-bold" style={{ color: '#f59e0b' }}>السؤال هذا فاتك</p>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      <p className="text-sm font-medium text-foreground leading-relaxed">{q.text}</p>
                      {q.correct_answer && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: '#046B6715' }}>
                          <span className="text-xs text-muted-foreground">الإجابة الصحيحة:</span>
                          <span className="text-sm font-bold" style={{ color: '#046B67' }}>{q.correct_answer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Regular answered */}
                {hasAnswered && a?.user_answer !== '' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary">
                      <span className="text-xs text-muted-foreground">إجابتك:</span>
                      <span className="text-sm font-medium text-foreground">{a.user_answer}</span>
                    </div>
                    {status !== 'future' && q?.correct_answer && (
                      <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#046B6715' }}>
                        <span className="text-xs text-muted-foreground">الإجابة الصحيحة:</span>
                        <span className="text-sm font-bold" style={{ color: '#046B67' }}>{q.correct_answer}</span>
                      </div>
                    )}
                    {a?.admin_note && (
                      <div className="p-3 rounded-xl border" style={{ borderColor: '#6366f140', background: '#6366f110' }}>
                        <p className="text-xs font-bold mb-1" style={{ color: '#6366f1' }}>ملاحظة الإدارة</p>
                        <p className="text-sm text-foreground">{a.admin_note}</p>
                      </div>
                    )}
                  </div>
                )}
                {status === 'missed' && !hasAnswered && (
                  <div className="p-3 rounded-xl" style={{ background: '#f59e0b18' }}>
                    <p className="text-xs text-center" style={{ color: '#f59e0b' }}>🔒 انتهى وقت هذا السؤال وأُغلق</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}