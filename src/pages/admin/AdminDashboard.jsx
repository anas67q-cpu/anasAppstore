import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { ArrowRight, FileQuestion, Users, Image, Award, BookOpen, Info, MessageSquare, ClipboardList, Activity, Lock, Unlock } from 'lucide-react';
import QuestionManager from '@/components/admin/QuestionManager';
import UserManager from '@/components/admin/UserManager';
import ImageManager from '@/components/admin/ImageManager';
import BadgeManager from '@/components/admin/BadgeManager';
import EssayReview from '@/components/admin/EssayReview';
import CompetitionInfoManager from '@/components/admin/CompetitionInfoManager';
import ComplaintsManager from '@/components/admin/ComplaintsManager';
import AnswerViewer from '@/components/admin/AnswerViewer';
import ActivityLogViewer from '@/components/admin/ActivityLogViewer';
import { base44 } from '@/api/base44Client';
import { playTap } from '@/lib/sounds';

const SECTIONS = [
  { id: 'questions', label: 'إدارة الأسئلة', sub: 'أضف وعدّل أسئلة المسابقة', icon: FileQuestion, color: '#046B67' },
  { id: 'essay', label: 'تصحيح المقالية', sub: 'تصحيح إجابات المشتركين', icon: BookOpen, color: '#8b5cf6' },
  { id: 'answers', label: 'إجابات المشتركين', sub: 'عرض جميع الإجابات والأوقات', icon: ClipboardList, color: '#0ea5e9' },
  { id: 'activity', label: 'نشاط المشتركين', sub: 'سجل الدخول والخروج والإجابات', icon: Activity, color: '#10b981' },
  { id: 'complaints', label: 'الشكاوى والاستفسارات', sub: 'الرد على استفسارات المشتركين', icon: MessageSquare, color: '#f59e0b' },
  { id: 'users', label: 'إدارة المشتركين', sub: 'تحديد فئة كل مشترك (ضيف/متسابق)', icon: Users, color: '#6366f1' },
  { id: 'badges', label: 'إدارة الشارات', sub: 'إنشاء ومنح شارات المشتركين', icon: Award, color: '#f59e0b' },
  { id: 'images', label: 'الصور والأصول', sub: 'رفع صور التطبيق وقوالب البطاقات', icon: Image, color: '#ec4899' },
  { id: 'info', label: 'معلومات المسابقة', sub: 'تعديل الوصف والشعار', icon: Info, color: '#0ea5e9' },
];

function AdminHome() {
  const navigate = useNavigate();
  const [leaderboardHidden, setLeaderboardHidden] = useState(false);
  const [settingRecord, setSettingRecord] = useState(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    base44.entities.AppSettings.list().then(list => {
      const rec = list.find(s => s.key === 'images') || list[0];
      if (rec) { setSettingRecord(rec); setLeaderboardHidden(!!rec.leaderboard_hidden); }
    });
  }, []);

  const toggleLeaderboard = async () => {
    playTap();
    setToggling(true);
    const newVal = !leaderboardHidden;
    if (settingRecord) {
      await base44.entities.AppSettings.update(settingRecord.id, { leaderboard_hidden: newVal });
      setSettingRecord(s => ({ ...s, leaderboard_hidden: newVal }));
    } else {
      const created = await base44.entities.AppSettings.create({ key: 'leaderboard_control', leaderboard_hidden: newVal });
      setSettingRecord(created);
    }
    setLeaderboardHidden(newVal);
    setToggling(false);
  };

  return (
    <div className="px-4 py-4 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/home')} className="p-2 rounded-xl bg-secondary tap-scale" aria-label="رجوع">
          <ArrowRight className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">لوحة التحكم</h2>
          <p className="text-xs text-muted-foreground">إدارة المسابقة</p>
        </div>
      </div>

      {/* Leaderboard toggle */}
      <motion.button whileTap={{ scale: 0.97 }} onClick={toggleLeaderboard} disabled={toggling}
        className="w-full p-4 rounded-2xl flex items-center gap-4 tap-scale relative overflow-hidden"
        style={{ background: leaderboardHidden ? '#ef444415' : '#046B6715', border: `2px solid ${leaderboardHidden ? '#ef444440' : '#046B6740'}` }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: leaderboardHidden ? '#ef444420' : '#046B6720' }}>
          {toggling
            ? <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: leaderboardHidden ? '#ef4444' : '#046B67', borderTopColor: 'transparent' }} />
            : leaderboardHidden ? <Lock className="w-6 h-6" style={{ color: '#ef4444' }} /> : <Unlock className="w-6 h-6" style={{ color: '#046B67' }} />
          }
        </div>
        <div className="flex-1 text-right">
          <p className="font-bold" style={{ color: leaderboardHidden ? '#ef4444' : '#046B67' }}>
            {leaderboardHidden ? '🔒 لوحة الصدارة مقفلة' : '🏆 لوحة الصدارة مفعّلة'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {leaderboardHidden ? 'اضغط لإعادة إظهارها لدى الجميع' : 'اضغط لإغلاقها وزيادة الإثارة!'}
          </p>
        </div>
        <AnimatePresence>
          {leaderboardHidden && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="absolute left-4 top-1/2 -translate-y-1/2">
              <motion.div animate={{ rotate: [0, -5, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>🔒</motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <div className="grid grid-cols-1 gap-3">
        {SECTIONS.map((sec, i) => {
          const Icon = sec.icon;
          return (
            <motion.button key={sec.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => { playTap(); navigate(`/admin/${sec.id}`); }}
              className="card-surface shadow-card p-4 flex items-center gap-4 tap-scale text-right w-full">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: sec.color + '20' }}>
                <Icon className="w-6 h-6" style={{ color: sec.color }} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">{sec.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sec.sub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ x: '-100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ type: 'tween', duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}
      className="scroll-ios"
    >
      {children}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const location = useLocation();
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedPage><AdminHome /></AnimatedPage>} />
          <Route path="/questions" element={<AnimatedPage><QuestionManager /></AnimatedPage>} />
          <Route path="/essay" element={<AnimatedPage><EssayReview /></AnimatedPage>} />
          <Route path="/answers" element={<AnimatedPage><AnswerViewer /></AnimatedPage>} />
          <Route path="/activity" element={<AnimatedPage><ActivityLogViewer /></AnimatedPage>} />
          <Route path="/complaints" element={<AnimatedPage><ComplaintsManager /></AnimatedPage>} />
          <Route path="/users" element={<AnimatedPage><UserManager /></AnimatedPage>} />
          <Route path="/badges" element={<AnimatedPage><BadgeManager /></AnimatedPage>} />
          <Route path="/images" element={<AnimatedPage><ImageManager /></AnimatedPage>} />
          <Route path="/info" element={<AnimatedPage><CompetitionInfoManager /></AnimatedPage>} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}