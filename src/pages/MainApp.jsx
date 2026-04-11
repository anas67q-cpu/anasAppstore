import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TabBar from '@/components/TabBar';
import HomePage from '@/pages/HomePage';
import ChallengePage from '@/pages/ChallengePage';
import ProfilePage from '@/pages/ProfilePage';
import CompetitionCalendar from '@/components/calendar/CompetitionCalendar';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import useAppData from '@/lib/useAppData';
import { base44 } from '@/api/base44Client';
import { Settings } from 'lucide-react';
import { playTap } from '@/lib/sounds';

export default function MainApp() {
  const {
    user, stats, questions, answers, allStats, settings, loading,
    refreshStats, refreshAll, updateUserName, setStats, setAnswers,
  } = useAppData();

  const [activeTab, setActiveTab] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [ensuredStats, setEnsuredStats] = useState(false);

  // Ensure user has stats record
  useEffect(() => {
    if (user && !stats && !ensuredStats && !loading) {
      setEnsuredStats(true);
      base44.entities.UserStats.create({
        user_email: user.email,
        user_name: user.full_name || '',
        total_correct: 0,
        total_wrong: 0,
        total_missed: 0,
        total_points: 0,
        current_streak: 0,
        highest_streak: 0,
      }).then(() => refreshStats());
    }
  }, [user, stats, loading]);

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">جاري التحميل</p>
        </div>
      </div>
    );
  }

  if (showAdmin) {
    return (
      <div className="h-full overflow-y-auto px-5 pt-safe pb-24" style={{ paddingTop: 'max(env(safe-area-inset-top), 20px)' }}>
        <AdminDashboard onBack={() => setShowAdmin(false)} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe pb-2" style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}>
        <h1 className="text-base font-bold text-primary">مسابقة أنس</h1>
        {isAdmin && (
          <button onClick={() => { playTap(); setShowAdmin(true); }} className="p-2 rounded-xl hover:bg-white/5 tap-scale">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Content - tabs are kept mounted */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
          <HomePage
            user={user}
            stats={stats}
            questions={questions}
            answers={answers}
            allStats={allStats}
            settings={settings}
          />
          <div className="mt-5">
            <CompetitionCalendar questions={questions} answers={answers} />
          </div>
        </div>

        <div style={{ display: activeTab === 'challenge' ? 'block' : 'none' }}>
          <ChallengePage
            user={user}
            stats={stats}
            questions={questions}
            answers={answers}
            settings={settings}
            setStats={setStats}
            setAnswers={setAnswers}
            refreshStats={refreshStats}
          />
        </div>

        <div style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
          <ProfilePage
            user={user}
            stats={stats}
            questions={questions}
            answers={answers}
            updateUserName={updateUserName}
          />
        </div>
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}