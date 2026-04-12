import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { playTap } from '@/lib/sounds';

export default function QuestionForm({ question, onSaved }) {
  const [text, setText] = useState(question?.text || '');
  const [type, setType] = useState(question?.type || 'multiple_choice');
  const [options, setOptions] = useState(question?.options || ['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(question?.correct_answer || '');
  const [dayNumber, setDayNumber] = useState(question?.day_number || 1);
  const [timeLimit, setTimeLimit] = useState(question?.time_limit || 90);
  const [publishDate, setPublishDate] = useState(question?.publish_date || '');
  const [points, setPoints] = useState(question?.points ?? null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    playTap();
    const autoPoints = Number(dayNumber) <= 10 ? 1 : Number(dayNumber) <= 20 ? 2 : 3;
    const data = {
      text,
      type,
      options: type === 'multiple_choice' ? options.filter(o => o.trim()) : [],
      correct_answer: correctAnswer,
      day_number: Number(dayNumber),
      time_limit: Number(timeLimit),
      publish_date: publishDate,
      points: points !== null && points !== '' ? Number(points) : autoPoints,
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
          <input type="number" value={dayNumber} onChange={e => setDayNumber(e.target.value)} min={1} max={29} className={inputClass} />
        </div>
      </div>

      {type === 'multiple_choice' && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">الخيارات</label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <input
                key={i}
                value={opt}
                onChange={e => {
                  const newOpts = [...options];
                  newOpts[i] = e.target.value;
                  setOptions(newOpts);
                }}
                placeholder={`خيار ${i + 1}`}
                className={inputClass}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">الإجابة الصحيحة</label>
        <input value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} className={inputClass} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">الوقت (ثانية)</label>
          <input type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            النقاط
            <span className="text-[9px] text-primary mr-1">
              (تلقائي: {Number(dayNumber) <= 10 ? 1 : Number(dayNumber) <= 20 ? 2 : 3})
            </span>
          </label>
          <input type="number" min={1} max={10}
            value={points !== null && points !== '' ? points : ''}
            placeholder={String(Number(dayNumber) <= 10 ? 1 : Number(dayNumber) <= 20 ? 2 : 3)}
            onChange={e => setPoints(e.target.value === '' ? null : e.target.value)}
            className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">تاريخ النشر</label>
          <input type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)} className={inputClass} />
        </div>
      </div>

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