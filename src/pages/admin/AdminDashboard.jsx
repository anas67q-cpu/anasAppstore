import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileQuestion, Users, Image, Award, BookOpen, Info, MessageSquare, ClipboardList, Activity } from 'lucide-react';
import QuestionManager from '@/components/admin/QuestionManager';
import UserManager from '@/components/admin/UserManager';
import ImageManager from '@/components/admin/ImageManager';
import BadgeManager from '@/components/admin/BadgeManager';
import EssayReview from '@/components/admin/EssayReview';
import CompetitionInfoManager from '@/components/admin/CompetitionInfoManager';
import ComplaintsManager from '@/components/admin/ComplaintsManager';
import AnswerViewer from '@/components/admin/AnswerViewer';
import ActivityLogViewer from '@/components/admin/ActivityLogViewer';

const SECTIONS = [
  { id: 'questions', label: 'إدارة الأسئلة', sub: 'أضف وعدّل أسئلة المسابقة', icon: FileQuestion, color: '#046B67' },
  { id: 'essay', label: 'تصحيح المقالية', sub: 'تصحيح إجابات المتسابقين', icon: BookOpen, color: '#8b5cf6' },
  { id: 'answers', label: 'إجابات المتسابقين', sub: 'عرض جميع الإجابات والأوقات', icon: ClipboardList, color: '#0ea5e9' },
  { id: 'activity', label: 'نشاط المتسابقين', sub: 'سجل الدخول والخروج والإجابات', icon: Activity, color: '#10b981' },
  { id: 'complaints', label: 'الشكاوى والاستفسارات', sub: 'الرد على استفسارات المتسابقين', icon: MessageSquare, color: '#f59e0b' },
  { id: 'users', label: 'إدارة المشتركين', sub: 'عرض وتعديل بيانات المشتركين', icon: Users, color: '#6366f1' },
  { id: 'badges', label: 'إدارة الشارات', sub: 'إنشاء ومنح شارات المشتركين', icon: Award, color: '#f59e0b' },
  { id: 'images', label: 'الصور والأصول', sub: 'رفع صور التطبيق وقوالب البطاقات', icon: Image, color: '#ec4899' },
  { id: 'info', label: 'معلومات المسابقة', sub: 'تعديل الوصف والشعار', icon: Info, color: '#0ea5e9' },
];

export default function AdminDashboard({ onBack }) {
  const [section, setSection] = useState(null);

  if (section === 'questions') return <QuestionManager onBack={() => setSection(null)} />;
  if (section === 'essay') return <EssayReview onBack={() => setSection(null)} />;
  if (section === 'answers') return <AnswerViewer onBack={() => setSection(null)} />;
  if (section === 'activity') return <ActivityLogViewer onBack={() => setSection(null)} />;
  if (section === 'complaints') return <ComplaintsManager onBack={() => setSection(null)} />;
  if (section === 'users') return <UserManager onBack={() => setSection(null)} />;
  if (section === 'images') return <ImageManager onBack={() => setSection(null)} />;
  if (section === 'badges') return <BadgeManager onBack={() => setSection(null)} />;
  if (section === 'info') return <CompetitionInfoManager onBack={() => setSection(null)} />;

  return (
    <div className="px-4 py-4 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-secondary tap-scale">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">لوحة التحكم</h2>
          <p className="text-xs text-muted-foreground">إدارة المسابقة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {SECTIONS.map((sec, i) => {
          const Icon = sec.icon;
          return (
            <motion.button
              key={sec.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSection(sec.id)}
              className="card-surface shadow-card p-4 flex items-center gap-4 tap-scale text-right w-full"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: sec.color + '20' }}>
                <Icon className="w-6 h-6" style={{ color: sec.color }} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">{sec.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sec.sub}</p>
              </div>
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}