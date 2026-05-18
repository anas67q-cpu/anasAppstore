import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, MessageSquare, Clock, CheckCircle, Users } from 'lucide-react';

const NOTIFICATION_DOCS = [
  {
    icon: MessageSquare,
    color: '#046B67',
    title: 'سؤال جديد',
    trigger: 'عند نشر سؤال (تغيير الحالة إلى published)',
    audience: 'يُرسل حسب target_audience السؤال (الجميع / المتسابقون / الضيوف / محددون)',
    messages: [
      {
        label: 'موحد لجميع المشاركين',
        title: '📝 سؤال جديد!',
        body: 'ترا وصل سؤال اليوم [رقم اليوم]، بالتوفيق! 🌟',
      },
    ],
    note: 'يُحترم إعداد المستخدم notify_new_question — من أوقف الإشعار لن يصله.',
  },
  {
    icon: Clock,
    color: '#f59e0b',
    title: 'تذكير الإجابة',
    trigger: 'يُرسل يومياً في الوقت المجدول (تشغيله من لوحة التحكم)',
    audience: 'المستخدمون الذين لم يجيبوا على سؤال اليوم بعد',
    messages: [
      {
        label: 'للجميع (غير مجيبين)',
        title: '⏰ تذكير - سؤال اليوم!',
        body: 'لم تجب على سؤال اليوم بعد. تبقى وقت قليل، أجب الآن!',
      },
    ],
    note: 'يُحترم إعداد المستخدم notify_reminder — من أوقف التذكير لن يصله.',
  },
  {
    icon: CheckCircle,
    color: '#8b5cf6',
    title: 'نتيجة التصحيح',
    trigger: 'عند تصحيح إجابة مقالية (تغيير graded إلى true)',
    audience: 'المستخدم صاحب الإجابة فقط',
    messages: [
      {
        label: 'موحد سواء صح أو خطأ',
        title: '📋 تم التصحيح!',
        body: 'ترا سؤال رقم [رقم السؤال] صححته الإدارة 👀',
      },
    ],
    note: 'يُحترم إعداد المستخدم notify_grade — من أوقف الإشعار لن يصله.',
  },
  {
    icon: Users,
    color: '#ec4899',
    title: 'متابعة المشاركين',
    trigger: 'عند إجابة أي مستخدم على سؤال اليوم',
    audience: 'المستخدمون الذين أضافوا هذا الشخص في قائمة المتابعة',
    messages: [
      {
        label: 'إجابة صحيحة',
        title: '🎯 [اسم المشارك] أجاب صح!',
        body: '[اسم المشارك] أجاب على سؤال اليوم بإجابة صحيحة! 🏆',
      },
      {
        label: 'إجابة خاطئة',
        title: '❌ [اسم المشارك] أجاب خطأ',
        body: '[اسم المشارك] أجاب على سؤال اليوم بإجابة خاطئة.',
      },
    ],
    note: 'يصل فقط لمن فعّل notify_friends وأضاف هذا المشارك في قائمة المتابعة.',
  },
];

export default function NotificationsManager() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="px-4 py-4 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin')} className="p-2 rounded-xl bg-secondary tap-scale" aria-label="رجوع">
          <ArrowRight className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">الإشعارات</h2>
          <p className="text-xs text-muted-foreground">نصوص الرسائل المُرسلة لكل حدث</p>
        </div>
      </div>

      <div className="space-y-3">
        {NOTIFICATION_DOCS.map((item, i) => {
          const Icon = item.icon;
          const isOpen = expanded === i;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card-surface shadow-card overflow-hidden">
              <button
                onClick={() => { setExpanded(isOpen ? null : i); }}
                className="w-full p-4 flex items-center gap-4 text-right tap-scale"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: item.color + '18' }}>
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.trigger}</p>
                </div>
                <Bell className="w-4 h-4 text-muted-foreground" />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                  <div className="rounded-xl p-3 text-sm space-y-1" style={{ background: item.color + '10' }}>
                    <p className="font-semibold" style={{ color: item.color }}>المستقبِلون</p>
                    <p className="text-foreground text-xs leading-relaxed">{item.audience}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground">نصوص الرسائل</p>
                    {item.messages.map((msg, mi) => (
                      <div key={mi} className="rounded-xl border border-border p-3 space-y-1.5">
                        <span className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: item.color + '18', color: item.color }}>
                          {msg.label}
                        </span>
                        <p className="text-xs font-bold text-foreground">{msg.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{msg.body}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl bg-muted p-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-bold text-foreground">ملاحظة: </span>
                      {item.note}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}