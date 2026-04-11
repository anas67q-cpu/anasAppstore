import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Minus } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { playTap } from '@/lib/sounds';

const dayNames = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const dayShort = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'];

function getSaturdayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 1) % 7; // Saturday = 6, so (6+1)%7 = 0 → need special handling
  const satDay = day === 6 ? 0 : day + 1;
  d.setDate(d.getDate() - satDay + (day === 6 ? 0 : -1));
  // Simpler: get current week starting Saturday
  const current = new Date();
  const currentDay = current.getDay();
  const saturdayOffset = currentDay === 6 ? 0 : currentDay + 1;
  const saturday = new Date(current);
  saturday.setDate(current.getDate() - saturdayOffset);
  saturday.setHours(0, 0, 0, 0);
  return saturday;
}

export default function WeeklyRow({ answers = [], questions = [] }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [showSheet, setShowSheet] = useState(false);

  const weekDays = useMemo(() => {
    const sat = getSaturdayOfWeek(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sat);
      d.setDate(sat.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const question = questions.find(q => q.publish_date === dateStr);
      const answer = question ? answers.find(a => a.question_id === question.id) : null;
      return { date: d, dateStr, question, answer, dayName: dayNames[i], dayShort: dayShort[i] };
    });
  }, [answers, questions]);

  const handleDayTap = (day) => {
    playTap();
    setSelectedDay(day);
    setShowSheet(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-surface rounded-2xl p-4"
      >
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">هذا الأسبوع</h3>
        <div className="flex gap-1.5">
          {weekDays.map((day, i) => {
            const isToday = day.dateStr === new Date().toISOString().split('T')[0];
            let status = 'none';
            if (day.answer?.is_correct) status = 'correct';
            else if (day.answer && !day.answer.is_correct) status = 'wrong';
            else if (day.question && !day.answer) status = 'pending';

            return (
              <button
                key={i}
                onClick={() => handleDayTap(day)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all tap-scale ${
                  isToday ? 'bg-primary/15 ring-1 ring-primary/30' : 'bg-secondary/50'
                }`}
              >
                <span className="text-[10px] text-muted-foreground">{day.dayShort}</span>
                {status === 'correct' && <CheckCircle className="w-4 h-4 text-primary" />}
                {status === 'wrong' && <XCircle className="w-4 h-4 text-destructive" />}
                {status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-primary animate-pulse" />}
                {status === 'none' && <Minus className="w-4 h-4 text-muted-foreground/30" />}
              </button>
            );
          })}
        </div>
      </motion.div>

      <BottomSheet open={showSheet} onClose={() => setShowSheet(false)} title={selectedDay?.dayName}>
        {selectedDay && (
          <div className="space-y-4">
            {selectedDay.question ? (
              <>
                <div className="p-4 rounded-xl bg-secondary">
                  <p className="text-sm font-medium leading-relaxed">{selectedDay.question.text}</p>
                </div>
                {selectedDay.answer ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {selectedDay.answer.is_correct ? (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                      <span className="text-sm font-medium">
                        {selectedDay.answer.is_correct ? 'إجابة صحيحة' : 'إجابة خاطئة'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      إجابتك: {selectedDay.answer.user_answer || 'لم تجب'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      الصحيح: {selectedDay.question.correct_answer}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">لم تجب بعد</p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">لا يوجد سؤال لهذا اليوم</p>
            )}
          </div>
        )}
      </BottomSheet>
    </>
  );
}