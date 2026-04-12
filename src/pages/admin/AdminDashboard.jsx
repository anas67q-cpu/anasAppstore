import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileQuestion, Users, Image, Award } from 'lucide-react';
import QuestionManager from '@/components/admin/QuestionManager';
import UserManager from '@/components/admin/UserManager';
import ImageManager from '@/components/admin/ImageManager';
import BadgeManager from '@/components/admin/BadgeManager';

const SECTIONS = [
  { id: 'questions', label: 'إدارة الأسئلة', sub: 'أضف وعدّل أسئلة المسابقة', icon: FileQuestion, color: '#046B67' },
  { id: 'users', label: 'إدارة المشتركين', sub: 'عرض وتعديل بيانات المشتركين', icon: Users, color: '#6366f1' },
  { id: 'badges', label: 'إدارة الشارات', sub: 'منح وإدارة شارات المشتركين', icon: Award, color: '#f59e0b' },
  { id: 'images', label: 'الصور والأصول', sub: 'رفع صور التطبيق', icon: Image, color: '#ec4899' },
];

export default function AdminDashboard({ onBack }) {
  const [section, setSection] = useState(null);

  if (section === 'questions') return <QuestionManager onBack={() => setSection(null)} />;
  if (section === 'users') return <UserManager onBack={() => setSection(null)} />;
  if (section === 'images') return <ImageManager onBack={() => setSection(null)} />;
  if (section === 'badges') return <BadgeManager onBack={() => setSection(null)} />;

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
              transition={{ delay: i * 0.07 }}
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