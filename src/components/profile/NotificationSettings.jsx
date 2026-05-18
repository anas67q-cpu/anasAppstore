import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, MessageSquare, Clock, CheckCircle, Users, ChevronDown, ChevronUp, X, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { playTap } from '@/lib/sounds';

const PREFS_ITEMS = [
  {
    key: 'notify_new_question',
    icon: MessageSquare,
    color: '#046B67',
    title: 'سؤال جديد',
    description: 'يصلك تنبيه فور نشر سؤال جديد لتكون أول المجيبين وتحصل على أعلى النقاط.',
  },
  {
    key: 'notify_reminder',
    icon: Clock,
    color: '#f59e0b',
    title: 'تذكير الإجابة',
    description: 'إذا لم تجب على سؤال اليوم، يصلك تذكير قبل انتهاء الوقت حتى لا تفوتك الفرصة.',
  },
  {
    key: 'notify_grade',
    icon: CheckCircle,
    color: '#8b5cf6',
    title: 'نتيجة التصحيح',
    description: 'عند تصحيح إجابتك المقالية من الإدارة، يصلك تنبيه بالنتيجة والملاحظات.',
  },
  {
    key: 'notify_friends',
    icon: Users,
    color: '#ec4899',
    title: 'متابعة المشاركين',
    description: 'يصلك تنبيه عند إجابة المشاركين الذين تتابعهم — سواء أجابوا صح أو خطأ.',
  },
];

// Only show if PWA or native app
function isPWA() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
    || window.__fcmToken != null;
}

export default function NotificationSettings({ user, allStats = [] }) {
  const [prefs, setPrefs] = useState(null);
  const [prefsId, setPrefsId] = useState(null);
  const [saving, setSaving] = useState(null);
  const [showFriends, setShowFriends] = useState(false);
  const [search, setSearch] = useState('');
  const [isPwa] = useState(() => isPWA());

  useEffect(() => {
    if (!user?.email || !isPwa) return;
    base44.entities.NotificationPreferences.filter({ user_email: user.email }).then(list => {
      if (list[0]) {
        setPrefs(list[0]);
        setPrefsId(list[0].id);
      } else {
        setPrefs({
          notify_new_question: true,
          notify_reminder: true,
          notify_grade: true,
          notify_friends: false,
          watched_emails: [],
        });
      }
    });
  }, [user?.email, isPwa]);

  if (!isPwa) return null;
  if (!prefs) return (
    <div className="card-surface shadow-card p-4 flex items-center gap-3 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
    </div>
  );

  const savePrefs = async (updated) => {
    setPrefs(updated);
    if (prefsId) {
      await base44.entities.NotificationPreferences.update(prefsId, updated);
    } else {
      const created = await base44.entities.NotificationPreferences.create({
        user_email: user.email, ...updated,
      });
      setPrefsId(created.id);
    }
  };

  const toggle = async (key) => {
    playTap();
    setSaving(key);
    const updated = { ...prefs, [key]: !prefs[key] };
    await savePrefs(updated);
    setSaving(null);
  };

  const toggleWatch = async (email) => {
    playTap();
    const current = prefs.watched_emails || [];
    const updated = current.includes(email)
      ? current.filter(e => e !== email)
      : [...current, email];
    const updatedPrefs = { ...prefs, watched_emails: updated };
    await savePrefs(updatedPrefs);
  };

  const otherUsers = allStats.filter(s =>
    s.user_email !== user.email &&
    (search === '' || (s.user_name || s.user_email).includes(search))
  );

  const watchedCount = (prefs.watched_emails || []).length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Bell className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} />
        <h3 className="font-bold text-foreground text-base">الإشعارات</h3>
      </div>

      <div className="card-surface shadow-card divide-y divide-border overflow-hidden">
        {PREFS_ITEMS.map((item) => {
          const Icon = item.icon;
          const isOn = !!prefs[item.key];
          const isSaving = saving === item.key;
          const isFriendsRow = item.key === 'notify_friends';

          return (
            <div key={item.key}>
              <div className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: item.color + '18' }}>
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-foreground text-sm">{item.title}</p>
                    {isSaving ? (
                      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
                        style={{ borderColor: item.color, borderTopColor: 'transparent' }} />
                    ) : (
                      <button
                        onClick={() => toggle(item.key)}
                        className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
                        style={{ background: isOn ? item.color : 'hsl(var(--muted))' }}
                      >
                        <span
                          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200"
                          style={{ right: isOn ? '2px' : 'calc(100% - 22px)' }}
                        />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                  {isFriendsRow && isOn && (
                    <button
                      onClick={() => { playTap(); setShowFriends(v => !v); }}
                      className="mt-2 flex items-center gap-1 text-xs font-semibold tap-scale"
                      style={{ color: item.color }}
                    >
                      {showFriends ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {watchedCount > 0 ? `${watchedCount} مشارك متابَع` : 'اختر المشاركين للمتابعة'}
                    </button>
                  )}
                </div>
              </div>

              {/* Friends picker */}
              {isFriendsRow && isOn && showFriends && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="ابحث عن مشارك..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full bg-muted rounded-xl py-2 pr-9 pl-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {otherUsers.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-3">لا يوجد مشاركون</p>
                    )}
                    {otherUsers.map(s => {
                      const isWatched = (prefs.watched_emails || []).includes(s.user_email);
                      return (
                        <button
                          key={s.user_email}
                          onClick={() => toggleWatch(s.user_email)}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl tap-scale"
                          style={{ background: isWatched ? '#ec498918' : 'hsl(var(--muted)/0.5)' }}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                            style={{ background: isWatched ? '#ec4899' : '#94a3b8' }}>
                            {(s.user_name || s.user_email || '?')[0]}
                          </div>
                          <span className="flex-1 text-right text-sm font-medium text-foreground">{s.user_name || s.user_email}</span>
                          {isWatched && <X className="w-4 h-4 flex-shrink-0" style={{ color: '#ec4899' }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}