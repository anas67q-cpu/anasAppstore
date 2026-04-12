import { useState, useEffect } from 'react';
import TabBar from '@/components/TabBar';
import HomePage from '@/pages/HomePage';
import ChallengePage from '@/pages/ChallengePage';
import ProfilePage from '@/pages/ProfilePage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import useAppData from '@/lib/useAppData';
import { useTheme } from '@/lib/useTheme';
import { base44 } from '@/api/base44Client';
import { Settings, Sun, Moon, LogOut } from 'lucide-react';
import { playTap } from '@/lib/sounds';

export default function MainApp() {
  const {
    user, stats, questions, answers, allStats, settings, userBadges, allBadges, loading,
    refreshStats, fetchAllStats, updateUserName, setStats, setAnswers,
  } = useAppData();

  const displayName = stats?.user_name || user?.full_name || 'مرحباً';
  const { theme, toggle: toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [ensuredStats, setEnsuredStats] = useState(false);

  useEffect(() => {
    if (user && !stats && !ensuredStats && !loading) {
      setEnsuredStats(true);
      base44.entities.UserStats.create({
        user_email: user.email,
        user_name: user.full_name || '',
        total_correct: 0, total_wrong: 0, total_missed: 0,
        total_points: 0, current_streak: 0, highest_streak: 0,
      }).then(() => refreshStats());
    }
  }, [user, stats, loading]);

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (showAdmin) {
    return (
      <div className="h-full overflow-y-auto" style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}>
        <AdminDashboard onBack={() => setShowAdmin(false)} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 flex-shrink-0"
        style={{
          background: 'hsl(var(--primary))',
          paddingTop: 'max(env(safe-area-inset-top), 20px)',
          paddingBottom: '18px',
          borderRadius: '0 0 28px 28px',
        }}
      >
        {/* Right side: greeting + name (RTL = right) */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={() => { playTap(); setShowAdmin(true); }}
              className="p-2 rounded-full hover:bg-white/10 tap-scale">
              <Settings className="w-5 h-5 text-white" />
            </button>
          )}
          <div>
            <p className="text-white/70 text-xs">يا هلا ومرحبا،</p>
            <p className="text-white text-xl font-black">{displayName} 👋</p>
          </div>
        </div>

        {/* Left actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => { playTap(); toggleTheme(); }}
            className="p-2 rounded-full hover:bg-white/10 tap-scale">
            {theme === 'dark'
              ? <Sun className="w-5 h-5 text-white" />
              : <Moon className="w-5 h-5 text-white" />
            }
          </button>
          <button onClick={() => { playTap(); base44.auth.logout(); }}
            className="p-2 rounded-full hover:bg-white/10 tap-scale">
            <LogOut className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-4" style={{ paddingBottom: 100 }}>
        <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
          <HomePage
            user={user} stats={stats} questions={questions} answers={answers}
            userBadges={userBadges} allBadges={allBadges || []} settings={settings}
          />
        </div>
        <div style={{ display: activeTab === 'challenge' ? 'block' : 'none' }}>
          <ChallengePage
            user={user} stats={stats} questions={questions} answers={answers}
            setStats={setStats} setAnswers={setAnswers} refreshStats={refreshStats}
          />
        </div>
        <div style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
          <ProfilePage
            user={user} stats={stats} allStats={allStats}
            userBadges={userBadges} allBadges={allBadges || []}
            updateUserName={updateUserName} fetchAllStats={fetchAllStats}
          />
        </div>
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}