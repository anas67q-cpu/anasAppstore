import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileQuestion, Users, Settings, Image, Award, Flame } from 'lucide-react';
import QuestionManager from '@/components/admin/QuestionManager';
import UserManager from '@/components/admin/UserManager';
import ImageManager from '@/components/admin/ImageManager';

const sections = [
  { id: 'questions', label: 'الأسئلة', icon: FileQuestion },
  { id: 'users', label: 'المستخدمين', icon: Users },
  { id: 'images', label: 'الصور', icon: Image },
];

export default function AdminDashboard({ onBack }) {
  const [activeSection, setActiveSection] = useState(null);

  if (activeSection === 'questions') {
    return <QuestionManager onBack={() => setActiveSection(null)} />;
  }
  if (activeSection === 'users') {
    return <UserManager onBack={() => setActiveSection(null)} />;
  }
  if (activeSection === 'images') {
    return <ImageManager onBack={() => setActiveSection(null)} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="tap-scale">
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </button>
        <h2 className="text-xl font-bold">لوحة التحكم</h2>
      </div>

      <div className="space-y-3">
        {sections.map((sec, i) => {
          const Icon = sec.icon;
          return (
            <motion.button
              key={sec.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveSection(sec.id)}
              className="w-full glass-surface rounded-2xl p-4 flex items-center gap-4 tap-scale"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">{sec.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}