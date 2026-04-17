import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { playTap } from '@/lib/sounds';

export default function QuestionForm({ question, onSaved }) {
  const [text, setText] = useState(question?.text || '');
  const [type, setType] = useState(question?.type || 'multiple_choice');
  const [options, setOptions] = useState(question?.options || ['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(question?.correct_answer || '');
  const [correctOptionIndex, setCorrectOptionIndex] = useState(() => {
    if (question?.type === 'multiple_choice' && question?.correct_answer && question?.options) {
      const idx = question.options.indexOf(question.correct_answer);
      return idx >= 0 ? idx : -1;
    }
    return -1;
  });
  const [dayNumber, setDayNumber] = useState(question?.day_number || 1);
  const [timeLimit, setTimeLimit] = useState(question?.time_limit || 90);
  const [saving, setSaving] = useState(false);

  const suggestedPoints = dayNumber <= 10 ? 1 : dayNumber <= 20 ? 2 : 3;
  const [points, setPoints] = useState(question?.points || suggestedPoints);

  const getFinalCorrectAnswer = () => {
    if (type === 'multiple_choice') {
      const filtered = options.filter(o => o.trim());
      if (correctOptionIndex >= 0 && filtered[correctOptionIndex]) return filtered[correctOptionIndex];
      return correctAnswer;
    }
    return correctAnswer;
  };

  const handleSave = async () => {
    setSaving(true);
    playTap();
    const finalCorrect = getFinalCorrectAnswer();
    const data = {
      text,
      type,
      options: type === 'multiple_choice' ? options.filter(o => o.trim()) : [],
      correct_answer: finalCorrect,
      day_number: Number(dayNumber),
      time_limit: Number(timeLimit),
      points: Number(points),
    };
    if (question) {
      await base44.entities.Question.update(question.id, data);
    } else {
      await base44.entities.Question.create(data);
    }
    setSaving(false);
    onSaved();
  };

  const inputClass = 'w-full bg-secondary rounded-xl px-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">نص السؤال</label>
        <textarea value={text} onChange={e => setText(e.target.value)} className={`${inputClass} min-h-[80px] resize-none`} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">النوع</label>
          <select value={type} onChange={e => setType(e.target.value)} className={inputClass}>
            <option value="multiple_choice">اختيار من متعدد</option>
            <option value="true_false">صح أو خطأ</option>
            <option value="essay">مقالي</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">اليوم</label>
          <input type="number" value={dayNumber}
            onChange={e => {
              const d = Number(e.target.value);
              setDayNumber(d);
              if (!question?.points) setPoints(d <= 10 ? 1 : d <= 20 ? 2 : 3);
            }}
            min={1} max={29} className={inputClass} />
        </div>
      </div>

      {type === 'multiple_choice' && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">الخيارات (اختر الصحيح)</label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => setCorrectOptionIndex(i)}
                  className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all"
                  style={{
                    borderColor: correctOptionIndex === i ? '#046B67' : 'hsl(var(--border))',
                    background: correctOptionIndex === i ? '#046B67' : 'transparent',
                  }}
                />
                <input
                  value={opt}
                  onChange={e => {
                    const newOpts = [...options];
                    newOpts[i] = e.target.value;
                    setOptions(newOpts);
                  }}
                  placeholder={`خيار ${i + 1}`}
                  className={`${inputClass} flex-1`}
                />
              </div>
            ))}
          </div>
          {correctOptionIndex >= 0 && options[correctOptionIndex]?.trim() && (
            <p className="text-xs mt-1" style={{ color: '#046B67' }}>
              ✓ الإجابة الصحيحة: {options[correctOptionIndex]}
            </p>
          )}
        </div>
      )}

      {type !== 'multiple_choice' && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">الإجابة الصحيحة</label>
          <input value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} className={inputClass} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">النقاط</label>
          <input type="number" value={points} onChange={e => setPoints(e.target.value)} min={1} className={inputClass} />
          <p className="text-[10px] text-muted-foreground mt-0.5">مقترح: {suggestedPoints}</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">الوقت (ث)</label>
          <input type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} className={inputClass} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center py-1">
        💡 لتفعيل السؤال، استخدم أيقونة العين في قائمة الأسئلة
      </p>

      <button
        onClick={handleSave}
        disabled={saving || !text.trim()}
        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold tap-scale disabled:opacity-50"
      >
        {saving ? 'جاري الحفظ...' : (question ? 'تحديث' : 'إنشاء')}
      </button>
    </div>
  );
}