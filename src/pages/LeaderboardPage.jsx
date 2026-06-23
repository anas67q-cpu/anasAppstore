import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { playTap } from '@/lib/sounds';
import LeaderboardLockedBanner from '@/components/home/LeaderboardLockedBanner';

const PODIUM_COLORS = ['#f59e0b', '#94a3b8', '#cd7c2f'];
const MEDALS = ['🥇', '🥈', '🥉'];

function assignRanks(list) {
  return list.map((item, i) => {
    if (i === 0) item._rank = 1;
    else if (item.points === list[i - 1].points) item._rank = list[i - 1]._rank;
    else item._rank = i + 1;
    return item;
  });
}

function Avatar({ name, size = 'md', color }) {
  const sizes = { sm: 'w-9 h-9 text-sm', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-xl', xl: 'w-20 h-20 text-2xl' };
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-black text-white flex-shrink-0`}
      style={{ background: color || 'hsl(var(--primary))' }}>
      {(name || 'م').charAt(0)}
    </div>
  );
}

function Podium({ top3, currentUserEmail }) {
  if (top3.length === 0) return null;
  const order = [top3[1], top3[0], top3[2]];
  const heights = ['h-20', 'h-28', 'h-14'];
  const avatarSizes = ['md', 'xl', 'sm'];
  const podiumColors = [PODIUM_COLORS[1], PODIUM_COLORS[0], PODIUM_COLORS[2]];

  return (
    <div className="flex items-end justify-center gap-4 px-4 pt-6 pb-2">
      {order.map((player, i) => {
        if (!player) return <div key={i} className="w-24" />;
        const isMe = player.user_email === currentUserEmail;
        const rankLabel = i === 0 ? '2' : i === 1 ? '1' : '3';
        const medal = MEDALS[i === 1 ? 0 : i === 0 ? 1 : 2];
        return (
          <motion.div key={player.user_email}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', damping: 18, stiffness: 250 }}
            className="flex flex-col items-center gap-2">
            <span className="text-2xl">{medal}</span>
            <div className="relative">
              <Avatar name={player.user_name} size={avatarSizes[i]} color={podiumColors[i]} />
              {isMe && <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-background" />}
            </div>
            <p className="text-xs font-bold text-foreground text-center max-w-[72px] truncate">
              {player.user_name || 'مشترك'}{isMe ? ' (أنت)' : ''}
            </p>
            <p className="text-xs font-black" style={{ color: podiumColors[i] }}>{player.points} نقطة</p>
            <div className={`w-20 ${heights[i]} rounded-t-2xl flex items-center justify-center`}
              style={{ background: podiumColors[i], opacity: 0.85 }}>
              <span className="text-white font-black text-2xl">{rankLabel}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function RankedList({ ranked, userEmail }) {
  if (ranked.length === 0) return (
    <p className="text-center text-muted-foreground py-8 text-sm">لا يوجد مشتركون بعد</p>
  );
  return (
    <div className="space-y-2">
      {ranked.map((s, i) => {
        const isMe = s.user_email === userEmail;
        const avatarColor = i < 3 ? PODIUM_COLORS[i] : 'hsl(var(--muted))';
        return (
          <motion.div key={s.user_email + i}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className={`flex items-center gap-3 p-3.5 rounded-2xl ${isMe ? 'ring-2 ring-primary' : ''}`}
            style={isMe ? { background: 'hsl(var(--primary)/0.1)' } : { background: 'hsl(var(--secondary))' }}>
            <div className="w-8 text-center flex-shrink-0">
              {i < 3
                ? <span className="text-lg">{MEDALS[i]}</span>
                : <span className="text-sm font-bold text-muted-foreground">{s._rank}</span>
              }
            </div>
            <Avatar name={s.user_name} size="sm" color={avatarColor} />
            <span className="flex-1 text-sm font-bold text-foreground truncate">
              {s.user_name || 'مشترك'}{isMe ? ' (أنت)' : ''}
            </span>
            <span className="text-sm font-black flex-shrink-0" style={{ color: 'hsl(var(--primary))' }}>
              {s.points}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

const ADMIN_EMAIL = 'anas6.7q@gmail.com';

export default function LeaderboardPage({ user }) {
  const navigate = useNavigate();
  const [allStats, setAllStats] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('contestants');

  const isAdmin = user?.email === ADMIN_EMAIL;
  const userEmail = user?.email || '';

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const [stats, setts] = await Promise.all([
        base44.entities.UserStats.list(),
        base44.entities.AppSettings.list(),
      ]);
      if (!cancelled) {
        setAllStats(stats);
        setSettings(setts);
        setLoading(false);
      }
    };
    load();

    // Subscribe to real-time stats AND settings (for live lock changes)
    const unsubStats = base44.entities.UserStats.subscribe(() => {
      base44.entities.UserStats.list().then(stats => { if (!cancelled) setAllStats(stats); });
    });
    const unsubSettings = base44.entities.AppSettings.subscribe(() => {
      base44.entities.AppSettings.list().then(setts => { if (!cancelled) setSettings(setts); });
    });

    return () => { cancelled = true; unsubStats(); unsubSettings(); };
  }, []);

  // Derive lock state from freshly-loaded settings
  const hiddenSetting = settings.find(s => typeof s.leaderboard_hidden === 'boolean');
  const isHidden = !isAdmin && hiddenSetting?.leaderboard_hidden === true;

  // Build ranked lists per category
  const makeRanked = (category) => assignRanks(
    allStats
      .filter(s => s.category === category)
      .map(s => ({ ...s, points: s.total_points || 0 }))
      .sort((a, b) => b.points - a.points)
  );

  const contestantRanked = makeRanked('contestant');
  const guestRanked = makeRanked('guest');
  const ranked = tab === 'contestants' ? contestantRanked : guestRanked;
  const top3 = ranked.slice(0, 3);
  const myEntry = ranked.find(s => s.user_email === userEmail);

  return (
    <div className="fixed inset-0 z-[9990] flex flex-col bg-background"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 flex-shrink-0"
        style={{ background: 'hsl(var(--primary))', paddingTop: 'max(16px, env(safe-area-inset-top, 0px))', paddingBottom: '16px', borderRadius: '0 0 24px 24px' }}>
        <button onClick={() => { playTap(); navigate(-1); }} className="p-2 rounded-full bg-white/20 tap-scale flex-shrink-0">
          <ArrowRight className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-white font-black text-xl flex-1 text-center">لوحة الصدارة</h1>
        <div className="w-9" />
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
        </div>
      ) : isHidden ? (
        <div className="flex-1 overflow-y-auto scroll-ios px-4 pt-6">
          <LeaderboardLockedBanner />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scroll-ios">

          {/* Category tabs */}
          <div className="px-4 pt-4">
            <div className="flex gap-1 p-1 rounded-2xl bg-secondary">
              {[
                { id: 'contestants', label: 'المتسابقون 🏆' },
                { id: 'guests', label: 'الضيوف 👤' },
              ].map(t => (
                <button key={t.id} onClick={() => { playTap(); setTab(t.id); }}
                  className="flex-1 py-2 rounded-xl text-sm font-bold transition-all tap-scale"
                  style={{
                    background: tab === t.id ? 'hsl(var(--primary))' : 'transparent',
                    color: tab === t.id ? 'white' : 'hsl(var(--muted-foreground))',
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* My rank banner */}
          {myEntry && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mx-4 mt-3 p-3 rounded-2xl flex items-center gap-3"
              style={{ background: 'hsl(var(--primary)/0.12)', border: '2px solid hsl(var(--primary)/0.3)' }}>
              <Avatar name={myEntry.user_name} size="sm" color="hsl(var(--primary))" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{myEntry.user_name || 'أنت'}</p>
                <p className="text-xs text-muted-foreground">{myEntry.points} نقطة</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: 'hsl(var(--primary))' }}>#{myEntry._rank}</p>
                <p className="text-[10px] text-muted-foreground">مركزك</p>
              </div>
            </motion.div>
          )}

          {/* Podium */}
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <Podium top3={top3} currentUserEmail={userEmail} />
            </motion.div>
          </AnimatePresence>

          {/* Full list */}
          <AnimatePresence mode="wait">
            <motion.div key={tab + '-list'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              className="px-4 pb-8 mt-2">
              <RankedList ranked={ranked} userEmail={userEmail} />
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}