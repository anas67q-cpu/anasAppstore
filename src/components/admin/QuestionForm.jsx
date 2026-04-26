import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { playTap } from '@/lib/sounds';
import NativeSelect from '@/components/ui/NativeSelect';
import { ImagePlus, X, Loader2 } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'multiple_choice', label: 'اختيار من متعدد' },
  { value: 'true_false', label: 'صح أو خطأ' },
  { value: 'essay', label: 'مقالي' },
];

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'الجميع 👥' },
  { value: 'contestants', label: 'المتسابقون فقط 🏆' },
  { value: 'guests', label: 'الضيوف فقط 👤' },
  { value: 'specific', label: 'أشخاص محددون ✉️' },
];

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
  const [imageUrl, setImageUrl] = useState(question?.image_url || '');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [targetAudience, setTargetAudience] = useState(question?.target_audience || 'all');
  const [targetEmails, setTargetEmails] = useState((question?.target_emails || []).join('\n'));

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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    setUploadingImage(false);
  };

  const handleSave = async () => {
    setSaving(true);
    playTap();
    const finalCorrect = getFinalCorrectAnswer();
    const emailList = targetAudience === 'specific'
      ? targetEmails.split('\n').map(e => e.trim()).filter(Boolean)
      : [];
    const data = {
      text, type,
      options: type === 'multiple_choice' ? options.filter(o => o.trim()) : [],
      correct_answer: finalCorrect,
      day_number: Number(dayNumber),
      time_limit: Number(timeLimit),
      points: Number(points),
      image_url: imageUrl || '',
      target_audience: targetAudience,
      target_emails: emailList,
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

      {/* Image upload */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">صورة للسؤال (اختياري)</label>
        {imageUrl ? (
          <div className="relative">
            <img src={imageUrl} alt="صورة السؤال" className="w-full rounded-2xl object-cover max-h-48" />
            <button
              type="button"
              onClick={() => setImageUrl('')}
              aria-label="حذف الصورة"
              className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center tap-scale"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-border cursor-pointer tap-scale hover:border-primary transition-colors">
            {uploadingImage
              ? <Loader2 className="w-6 h-6 animate-spin text-primary" />
              : <ImagePlus className="w-6 h-6 text-muted-foreground" />
            }
            <span className="text-sm text-muted-foreground">{uploadingImage ? 'جاري الرفع...' : 'اضغط لرفع صورة'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
          </label>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">النوع</label>
          <NativeSelect value={type} onChange={setType} options={TYPE_OPTIONS} label="نوع السؤال" />
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

      {/* Target audience */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">يظهر لـ</label>
        <NativeSelect value={targetAudience} onChange={setTargetAudience} options={AUDIENCE_OPTIONS} label="الجمهور المستهدف" />
      </div>
      {targetAudience === 'specific' && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">البريد الإلكتروني (سطر لكل شخص)</label>
          <textarea
            value={targetEmails}
            onChange={e => setTargetEmails(e.target.value)}
            placeholder={"user1@example.com\nuser2@example.com"}
            className={`${inputClass} min-h-[80px] resize-none`}
            dir="ltr"
          />
        </div>
      )}

      {type === 'multiple_choice' && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">الخيارات (اختر الصحيح)</label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <button
                  type="button"
                  aria-label={`تعيين الخيار ${i + 1} كإجابة صحيحة`}
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
        disabled={saving || !text.trim() || uploadingImage}
        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold tap-scale disabled:opacity-50"
      >
        {saving ? 'جاري الحفظ...' : (question ? 'تحديث' : 'إنشاء')}
      </button>
    </div>
  );
}