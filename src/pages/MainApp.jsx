import { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TabBar from '@/components/TabBar';
import HomePage from '@/pages/HomePage';
import ChallengePage from '@/pages/ChallengePage';
import ProfilePage from '@/pages/ProfilePage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import NewBadgeModal from '@/components/NewBadgeModal';
import TermsModal from '@/components/profile/TermsModal';
import WelcomeModal from '@/components/profile/WelcomeModal';
import useAppData from '@/lib/useAppData';
import { useTheme } from '@/lib/useTheme';
import { base44 } from '@/api/base44Client';
import { usePushNotifications } from '@/lib/usePushNotifications';
import PushNotificationBanner from '@/components/PushNotificationBanner';
import { Settings, Sun, Moon, LogOut, RefreshCw } from 'lucide-react';
import { playTap } from '@/lib/sounds';
import LeaderboardPage from '@/pages/LeaderboardPage';
import TourPage from '@/pages/TourPage';
import QuestionPage from '@/pages/QuestionPage';

const TAB_ORDER = ['home', 'challenge', 'profile'];

function PullToRefresh({ onRefresh, children, scrollRef, refreshing }) {
  const internalRef = useRef(null);
  const containerRef = scrollRef || internalRef;
  const startY = useRef(null);
  const [pulling, setPulling] = useState(false);
  const [progress, setProgress] = useState(0);
  const THRESHOLD = 72;

  const onTouchStart = useCallback((e) => {
    const el = containerRef.current;
    if (el && el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
  }, [containerRef]);

  const onTouchMove = useCallback((e) => {
    if (startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy < 0) { startY.current = null; return; }
    setPulling(true);
    setProgress(Math.min(dy / THRESHOLD, 1));
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (progress >= 1) await onRefresh();
    startY.current = null;
    setPulling(false);
    setProgress(0);
  }, [progress, onRefresh]);

  const showSpinner = pulling || refreshing;

  return (
    <div ref={containerRef} className="h-full overflow-y-auto scroll-ios" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {showSpinner && (
        <div className="flex justify-center pt-4 pb-1">
          <motion.div
            animate={{ rotate: refreshing ? 360 : progress * 180, scale: refreshing ? 1 : 0.7 + progress * 0.3 }}
            transition={refreshing ? { repeat: Infinity, duration: 0.7, ease: 'linear' } : { duration: 0.1 }}
          >
            <RefreshCw className="w-5 h-5" style={{ color: 'hsl(var(--primary))', opacity: refreshing ? 1 : progress }} />
          </motion.div>
        </div>
      )}
      {children}
    </div>
  );
}

// Shell that keeps all tabs mounted (preserves scroll + state)
function TabShell({ sharedProps, handleRefresh, updateUserName, fetchAllStats, setStats, setAnswers, refreshStats, settings, refreshing, rulesUrl, onRoundOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRefs = { home: useRef(null), challenge: useRef(null), profile: useRef(null) };
  const [roundOpen, setRoundOpen] = useState(false);

  const handleRoundOpen = (val) => { setRoundOpen(val); };

  const activeTab = TAB_ORDER.find(t => location.pathname.startsWith(`/${t}`)) || 'home';

  const handleTabChange = (tab) => {
    playTap();
    if (tab === activeTab) {
      // Scroll to top if already on this tab
      const el = scrollRefs[tab]?.current;
      if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
      navigate(`/${tab}`);
      return;
    }
    navigate(`/${tab}`);
  };

  return (
    <div className="flex-1 overflow-hidden relative">
      {/* Keep all tabs mounted to preserve scroll position */}
      {TAB_ORDER.map((tab) => (
        <div
          key={tab}
          className="absolute inset-0"
          style={{
            zIndex: tab === activeTab ? 1 : 0,
            pointerEvents: tab === activeTab ? 'auto' : 'none',
            opacity: tab === activeTab ? 1 : 0,
            transition: 'opacity 0.2s cubic-bezier(0.4,0,0.2,1)',
            willChange: 'opacity',
          }}
        >
          {tab === 'home' && (
            <PullToRefresh onRefresh={handleRefresh} scrollRef={scrollRefs.home} refreshing={refreshing}>
              <div className="px-4 pt-4" style={{ paddingBottom: 'calc(100px + var(--sab, 0px))' }}>
                <HomePage {...sharedProps} updateUserName={updateUserName} fetchAllStats={fetchAllStats} allStats={sharedProps.allStats} />
              </div>
            </PullToRefresh>
          )}
          {tab === 'challenge' && (
            <PullToRefresh onRefresh={handleRefresh} scrollRef={scrollRefs.challenge} refreshing={refreshing}>
              <div className="px-4 pt-4" style={{ paddingBottom: 'calc(100px + var(--sab, 0px))' }}>
                <ChallengePage {...sharedProps} setStats={setStats} setAnswers={setAnswers} refreshStats={refreshStats} onRoundOpen={handleRoundOpen} />
              </div>
            </PullToRefresh>
          )}
          {tab === 'profile' && (
            <PullToRefresh onRefresh={handleRefresh} scrollRef={scrollRefs.profile} refreshing={refreshing}>
              <div className="px-4 pt-4" style={{ paddingBottom: 'calc(100px + var(--sab, 0px))' }}>
                <ProfilePage {...sharedProps} answers={sharedProps.answers} updateUserName={updateUserName} fetchAllStats={fetchAllStats} settings={settings} rulesUrl={rulesUrl} />
              </div>
            </PullToRefresh>
          )}
        </div>
      ))}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} hidden={roundOpen} />

    </div>
  );
}

export default function MainApp({ overlayPage }) {
  const {
    user, stats, questions, answers, allStats, settings, userBadges, allBadges, allUserBadges, loading,
    refreshStats, fetchAllStats, updateUserName, setStats, setAnswers,
  } = useAppData();

  const displayName = stats?.user_name || user?.full_name || 'مرحباً';
  const { shouldShowPrompt, requestPermission } = usePushNotifications(user);
  const { theme, toggle: toggleTheme } = useTheme();
  const [ensuredStats, setEnsuredStats] = useState(false);
  const [newBadgeNotif, setNewBadgeNotif] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [roundOpen, setRoundOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect / → /home
  useEffect(() => {
    if (location.pathname === '/') navigate('/home', { replace: true });
  }, [location.pathname]);

  // Service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  // Register FCM device token when user logs in
  useEffect(() => {
    if (!user) return;
    // Base44 native iOS app exposes the FCM token via window.__fcmToken
    const token = window.__fcmToken;
    if (!token) return;
    base44.functions.invoke('registerDeviceToken', { token, platform: 'ios' }).catch(() => {});
  }, [user?.email]);

  // Ensure user stats
  useEffect(() => {
    if (user && !stats && !ensuredStats && !loading) {
      setEnsuredStats(true);
      base44.entities.UserStats.create({
        user_email: user.email, user_name: user.full_name || '',
        total_correct: 0, total_wrong: 0, total_missed: 0,
        total_points: 0, current_streak: 0, highest_streak: 0,
      }).then(() => refreshStats());
    }
  }, [user, stats, loading]);

  // Log login
  useEffect(() => {
    if (user && stats) {
      base44.entities.ActivityLog.create({
        user_email: user.email, user_name: stats?.user_name || user?.full_name || '',
        action: 'login', details: 'دخل إلى التطبيق',
        timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }),
      }).catch(() => {});
    }
  }, [user?.email]);

  // New badge notification
  useEffect(() => {
    if (!user || !userBadges?.length) return;
    const sessionKey = `badge_notif_seen_${user.email}`;
    if (sessionStorage.getItem(sessionKey)) return;
    const shownKey = `badge_shown_ids_${user.email}`;
    const shownIds = JSON.parse(localStorage.getItem(shownKey) || '[]');
    const recent = userBadges.find(b => {
      const age = Date.now() - new Date(b.created_date).getTime();
      return age < 48 * 3600000 && !shownIds.includes(b.id);
    });
    if (recent) {
      sessionStorage.setItem(sessionKey, '1');
      localStorage.setItem(shownKey, JSON.stringify([...shownIds, recent.id]));
      setNewBadgeNotif(recent);
    }
  }, [userBadges, user?.email]);

  const isAdmin = user?.role === 'admin';
  const isAdminRoute = location.pathname.startsWith('/admin');

  const settingsObj = {};
  (settings || []).forEach(s => { if (s.key) settingsObj[s.key] = s; });
  const imageSettings = settingsObj['images'] || {};
  const cardTemplateUrl = imageSettings.card_template;
  const streakLogoUrl = imageSettings.streak_logo;
  const userName = stats?.user_name || user?.full_name || '';
  const infoSettings = settingsObj['info'] || settings?.find(s => s.competition_rules_url) || {};
  const rulesUrl = infoSettings.competition_rules_url || null;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshStats(), fetchAllStats()]);
    setRefreshing(false);
  }, [refreshStats, fetchAllStats]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const sharedProps = {
    user, stats, questions, answers, allStats, settings,
    userBadges, allBadges: allBadges || [], allUserBadges: allUserBadges || [],
    cardTemplateUrl, streakLogoUrl, userName,
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {overlayPage === 'leaderboard' && (
        <LeaderboardPage user={user} allStats={allStats} answers={answers} settings={settings} />
      )}
      {overlayPage === 'tour' && (
        <TourPage user={user} userName={userName} />
      )}
      {overlayPage === 'question' && (
        <QuestionPage user={user} stats={stats} questions={questions} answers={answers} setStats={setStats} setAnswers={setAnswers} refreshStats={refreshStats} />
      )}
      <NewBadgeModal badge={newBadgeNotif} userName={userName} cardTemplateUrl={cardTemplateUrl} onClose={() => setNewBadgeNotif(null)} />
      {user && <TermsModal rulesUrl={rulesUrl} onAcceptTerms={() => setShowWelcome(true)} />}
      <WelcomeModal userName={displayName} show={showWelcome} onClose={() => setShowWelcome(false)} />

      {/* Header — hidden on admin routes and when round is open */}
      {!isAdminRoute && !roundOpen && (
        <div
          className="flex items-center justify-between px-5 flex-shrink-0 ui-no-select"
          style={{ background: 'hsl(var(--primary))', paddingTop: 'max(16px, env(safe-area-inset-top, 0px))', paddingBottom: '18px', borderRadius: '0 0 28px 28px' }}
        >
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button aria-label="لوحة الإدارة" onClick={() => { playTap(); navigate('/admin'); }}
                className="p-2 rounded-full hover:bg-white/10 tap-scale">
                <Settings className="w-5 h-5 text-white" />
              </button>
            )}
            <div>
              <p className="text-white/70 text-xs">يا هلا ومرحبا،</p>
              <p className="text-white text-xl font-black">{displayName} 👋</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {refreshing && (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
                <RefreshCw className="w-4 h-4 text-white/70" />
              </motion.div>
            )}
            <button aria-label={theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
              onClick={() => { playTap(); toggleTheme(); }} className="p-2 rounded-full hover:bg-white/10 tap-scale">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
            </button>
            <button aria-label="تسجيل الخروج"
              onClick={() => {
                playTap();
                if (user) base44.entities.ActivityLog.create({ user_email: user.email, user_name: stats?.user_name || user?.full_name || '', action: 'logout', details: 'غادر التطبيق', timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }) }).catch(() => {});
                base44.auth.logout();
              }}
              className="p-2 rounded-full hover:bg-white/10 tap-scale">
              <LogOut className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Push notification prompt banner */}
      {!isAdminRoute && (
        <PushNotificationBanner show={shouldShowPrompt} onEnable={requestPermission} />
      )}

      {/* Routes */}
      <Routes>
        {/* Admin routes */}
        <Route path="/admin/*" element={
          <div className="flex-1 overflow-y-auto scroll-ios" style={{ paddingTop: '16px' }}>
            <AdminDashboard />
          </div>
        } />

        {/* Tab routes — all kept mounted inside TabShell */}
        <Route path="/*" element={
          <TabShell
            sharedProps={sharedProps}
            handleRefresh={handleRefresh}
            updateUserName={updateUserName}
            fetchAllStats={fetchAllStats}
            setStats={setStats}
            setAnswers={setAnswers}
            refreshStats={refreshStats}
            settings={settings}
            refreshing={refreshing}
            rulesUrl={rulesUrl}
            onRoundOpen={setRoundOpen}
          />
        } />
      </Routes>
    </div>
  );
}