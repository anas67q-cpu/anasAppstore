import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronLeft } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { playTap } from '@/lib/sounds';

const PODIUM_COLORS = ['#f59e0b', '#94a3b8', '#cd7c2f'];
const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardSection({ allStats = [], currentUserEmail, settings = [] }) {
  const [showFull, setShowFull] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [activeTab, setActiveTab] = useState('contestants');

  const hiddenSetting = settings.find(s => typeof s.leaderboard_hidden === 'boolean');
  const isHidden = hiddenSetting?.leaderboard_hidden === true;

  const contestants = allStats.filter(s => s.category === 'contestant');
  const guests = allStats.filter(s => s.category !== 'contestant');

  const currentUserStat = allStats.find(s => s.user_email === currentUserEmail);
  const currentUserCategory = currentUserStat?.category || 'guest';

  // Default to user's own category tab
  const displayList = activeTab === 'contestants' ? contestants : guests;
  const top3 = displayList.slice(0, 3);

  if (isHidden) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card-surface shadow-card p-6"
      >
        <h3 className="text-base font-bold text-foreground mb-4">لوحة المتصدرين</h3>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-6 gap-4"
          >
            <motion.div
              animate={{ rotate: [0, -6, 6, -6, 0], scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="text-6xl select-none"
            >
              🔒
            </motion.div>
            <div className="text-center">
              <p className="font-black text-lg text-foreground">مغلقة مؤقتاً!</p>
              <p className="text-sm text-muted-foreground mt-1">ترقبوا النتائج قريباً 🎯</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card-surface shadow-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-foreground">لوحة المتصدرين</h3>
          <button onClick={() => { playTap(); setShowFull(true); }}
            className="flex items-center gap-1 text-xs font-medium tap-scale"
            style={{ color: 'hsl(var(--primary))' }}>
            المزيد <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 p-1 rounded-2xl bg-secondary">
          {[
            { id: 'contestants', label: `المتسابقون 🏆` },
            { id: 'guests', label: `الضيوف 👤` },
          ].map(tab => (
            <button key={tab.id} onClick={() => { playTap(); setActiveTab(tab.id); }}
              className="flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all tap-scale"
              style={{
                background: activeTab === tab.id ? 'hsl(var(--card))' : 'transparent',
                color: activeTab === tab.id ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Podium visual */}
        {top3.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">لا يوجد أحد في هذه الفئة بعد</p>
        ) : (
          <div className="flex items-end justify-center gap-3">
            {/* 2nd */}
            {top3[1] && (
              <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                onClick={() => { playTap(); setSelectedPlayer(top3[1]); }}
                className="flex flex-col items-center gap-1 tap-scale">
                <span className="text-2xl">🥈</span>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-card"
                  style={{ background: '#94a3b8' }}>2</div>
                <div className="w-16 h-14 rounded-t-xl bg-secondary flex flex-col items-center justify-center">
                  <p className="text-xs font-bold text-foreground truncate w-full text-center px-1">{top3[1].user_name || '—'}</p>
                  <p className="text-[10px]" style={{ color: 'hsl(var(--primary))' }}>{top3[1].total_points} نقطة</p>
                </div>
              </motion.button>
            )}
            {/* 1st */}
            {top3[0] && (
              <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                onClick={() => { playTap(); setSelectedPlayer(top3[0]); }}
                className="flex flex-col items-center gap-1 tap-scale">
                <span className="text-2xl">🥇</span>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-card"
                  style={{ background: '#f59e0b' }}>1</div>
                <div className="w-20 h-20 rounded-t-xl flex flex-col items-center justify-center"
                  style={{ background: 'hsl(var(--primary))' }}>
                  <p className="text-xs font-bold text-white truncate w-full text-center px-1">{top3[0].user_name || '—'}</p>
                  <p className="text-sm font-black text-white/90">{top3[0].total_points}</p>
                  <p className="text-[9px] text-white/70">نقطة</p>
                </div>
              </motion.button>
            )}
            {/* 3rd */}
            {top3[2] && (
              <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                onClick={() => { playTap(); setSelectedPlayer(top3[2]); }}
                className="flex flex-col items-center gap-1 tap-scale">
                <span className="text-2xl">🥉</span>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-card"
                  style={{ background: '#cd7c2f' }}>3</div>
                <div className="w-16 h-10 rounded-t-xl bg-secondary flex flex-col items-center justify-center">
                  <p className="text-xs font-bold text-foreground truncate w-full text-center px-1">{top3[2].user_name || '—'}</p>
                  <p className="text-[10px]" style={{ color: 'hsl(var(--primary))' }}>{top3[2].total_points} نقطة</p>
                </div>
              </motion.button>
            )}
          </div>
        )}
      </motion.div>

      {/* Full Leaderboard Sheet */}
      <BottomSheet open={showFull} onClose={() => setShowFull(false)} title="لوحة المتصدرين">
        <FullLeaderboard
          contestants={contestants}
          guests={guests}
          currentUserEmail={currentUserEmail}
          isHidden={isHidden}
          onSelectPlayer={setSelectedPlayer}
        />
      </BottomSheet>

      {/* Player detail Sheet */}
      <BottomSheet open={!!selectedPlayer} onClose={() => setSelectedPlayer(null)} title={selectedPlayer?.user_name || 'مشترك'}>
        {selectedPlayer && <PlayerDetail player={selectedPlayer} />}
      </BottomSheet>
    </>
  );
}

function FullLeaderboard({ contestants, guests, currentUserEmail, isHidden, onSelectPlayer }) {
  const [activeTab, setActiveTab] = useState('contestants');
  const displayList = activeTab === 'contestants' ? contestants : guests;
  const PODIUM_COLORS = ['#f59e0b', '#94a3b8', '#cd7c2f'];
  const MEDALS = ['🥇', '🥈', '🥉'];

  if (isHidden) {
    return (
      <div className="flex flex-col items-center py-10 gap-4">
        <motion.div animate={{ rotate: [0, -8, 8, -8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl">🔒</motion.div>
        <p className="text-center font-bold text-foreground">مغلقة مؤقتاً</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 p-1 rounded-2xl bg-secondary">
        {[
          { id: 'contestants', label: `المتسابقون 🏆 (${contestants.length})` },
          { id: 'guests', label: `الضيوف 👤 (${guests.length})` },
        ].map(tab => (
          <button key={tab.id} onClick={() => { playTap(); setActiveTab(tab.id); }}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all tap-scale"
            style={{
              background: activeTab === tab.id ? 'hsl(var(--card))' : 'transparent',
              color: activeTab === tab.id ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
            }}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="space-y-2 max-h-[55vh] overflow-y-auto">
        {displayList.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">لا يوجد أحد في هذه الفئة بعد</p>
        )}
        {displayList.map((s, i) => {
          const isMe = s.user_email === currentUserEmail;
          return (
            <motion.button key={s.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              onClick={() => { playTap(); onSelectPlayer(s); }}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl tap-scale transition-all ${isMe ? 'ring-2 ring-primary' : 'bg-secondary'}`}
              style={isMe ? { background: 'hsl(var(--primary) / 0.1)' } : {}}>
              <span className="w-7 text-center text-sm font-bold text-muted-foreground">
                {i < 3 ? MEDALS[i] : i + 1}
              </span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white"
                style={{ background: i < 3 ? PODIUM_COLORS[i] : 'hsl(var(--muted))' }}>
                {(s.user_name || 'م').charAt(0)}
              </div>
              <span className="flex-1 text-sm font-medium text-foreground truncate text-right">
                {s.user_name || 'مشترك'} {isMe && '(أنت)'}
              </span>
              <span className="text-sm font-bold" style={{ color: 'hsl(var(--primary))' }}>{s.total_points}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function PlayerDetail({ player }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'النقاط', value: player.total_points || 0, accent: true },
          { label: 'السلسلة', value: player.current_streak || 0 },
          { label: 'الأعلى', value: player.highest_streak || 0 },
        ].map((item, i) => (
          <div key={i} className="text-center p-3 rounded-2xl bg-secondary">
            <p className="text-xl font-black" style={{ color: item.accent ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }}>{item.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'صحيح', value: player.total_correct || 0, color: '#046B67' },
          { label: 'خاطئ', value: player.total_wrong || 0, color: '#ef4444' },
          { label: 'فاتتك', value: player.total_missed || 0, color: '#f59e0b' },
        ].map((item, i) => (
          <div key={i} className="text-center p-3 rounded-2xl bg-secondary">
            <p className="text-xl font-black" style={{ color: item.color }}>{item.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}