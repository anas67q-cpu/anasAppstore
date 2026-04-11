import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Star } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { playTap } from '@/lib/sounds';

function getPointsForDay(day) {
  if (day <= 10) return 1;
  if (day <= 20) return 2;
  if (day <= 28) return 3;
  return 5;
}

function getDayStatus(day, questions, answers) {
  const q = questions.find(q => q.day_number === day);
  if (!q) return { status: 'future', question: null, answer: null };
  const a = answers.find(a => a.question_id === q.id);
  if (a?.is_correct) return { status: 'correct', question: q, answer: a };
  if (a && !a.is_correct) return { status: 'wrong', question: q, answer: a };
  if (q.is_published) return { status: 'available', question: q, answer: null };
  return { status: 'locked', question: q, answer: null };
}

export default function CompetitionCalendar({ questions = [], answers = [] }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [showSheet, setShowSheet] = useState(false);

  const days = useMemo(() => {
    return Array.from({ length: 29 }, (_, i) => {
      const day = i + 1;
      const { status, question, answer } = getDayStatus(day, questions, answers);
      return { day, points: getPointsForDay(day), status, question, answer };
    });
  }, [questions, answers]);

  const handleDayTap = (d) => {
    playTap();
    setSelectedDay(d);
    setShowSheet(true);
  };

  const statusColors = {
    correct: 'bg-primary/20 border-primary/30 text-primary',
    wrong: 'bg-destructive/15 border-destructive/30 text-destructive',
    available: 'bg-primary/10 border-primary/20 text-foreground',
    locked: 'bg-secondary/50 border-transparent text-muted-foreground/40',
    future: 'bg-secondary/30 border-transparent text-muted-foreground/30',
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-surface rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-muted-foreground">تقويم المسابقة</h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d, i) => (
            <motion.button
              key={d.day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.015 }}
              onClick={() => handleDayTap(d)}
              className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-0.5 tap-scale transition-all ${statusColors[d.status]}`}
            >
              <span className="text-sm font-bold">{d.day}</span>
              {d.day === 29 && <Star className="w-2.5 h-2.5" />}
            </motion.button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> صحيح</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive inline-block" /> خطأ</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted inline-block" /> قادم</span>
        </div>
      </motion.div>

      <BottomSheet open={showSheet} onClose={() => setShowSheet(false)} title={`اليوم ${selectedDay?.day}`}>
        {selectedDay && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary">
              <span className="text-sm text-muted-foreground">النقاط</span>
              <span className="text-lg font-bold text-primary">{selectedDay.points}</span>
            </div>

            {selectedDay.question ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <p className="text-sm font-medium leading-relaxed">{selectedDay.question.text}</p>
                </div>
                {selectedDay.answer && (
                  <div className="p-3 rounded-xl bg-secondary/50">
                    <p className="text-xs text-muted-foreground">
                      {selectedDay.answer.is_correct ? '✅ إجابة صحيحة' : '❌ إجابة خاطئة'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">لم يُنشر السؤال بعد</p>
            )}
          </div>
        )}
      </BottomSheet>
    </>
  );
}