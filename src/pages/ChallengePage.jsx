import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DailyQuestion from '@/components/challenge/DailyQuestion';
import QuickChallenge from '@/components/challenge/QuickChallenge';
import MemoryChallenge from '@/components/challenge/MemoryChallenge';
import { Zap, Brain } from 'lucide-react';
import { playTap } from '@/lib/sounds';

export default function ChallengePage({ user, stats, questions, answers, setStats, setAnswers, refreshStats }) {
  const userCategory = stats?.category || 'guest';
  const userEmail = user?.email || '';
  const navigate = useNavigate();
  const location = useLocation();

  const subPage = new URLSearchParams(location.search).get('sub');

  // Filter questions visible to this user based on target_audience
  const visibleQs = (questions || []).filter(q => {
    if (!q.is_published) return false;
    const ta = q.target_audience || 'all';
    if (ta === 'all') return true;
    if (ta === 'contestants') return userCategory === 'contestant';
    if (ta === 'guests') return userCategory === 'guest';
    if (ta === 'specific') return (q.target_emails || []).includes(userEmail);
    return true;
  });

  const publishedQs = visibleQs.sort((a, b) => (a.day_number || 0) - (b.day_number || 0));

  const openSub = (name) => { playTap(); navigate(`/challenge?sub=${name}`); };
  const closeSub = () => navigate('/challenge');

  if (subPage === 'quick') {
    return (
      <div className="pb-6">
        <QuickChallenge onBack={closeSub} user={user} stats={stats} setStats={setStats} />
      </div>
    );
  }

  if (subPage === 'memory') {
    return (
      <div className="pb-6">
        <MemoryChallenge onBack={closeSub} user={user} stats={stats} setStats={setStats} />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <h2 className="text-xl font-bold text-foreground">
        سؤال اليوم{publishedQs.length > 1 ? ` (${publishedQs.length} أسئلة)` : ''}
      </h2>

      {publishedQs.length > 1 ? (
        publishedQs.map(q => (
          <DailyQuestion
            key={q.id}
            questions={[q]}
            answers={answers}
            user={user}
            stats={stats}
            setStats={setStats}
            setAnswers={setAnswers}
            refreshStats={refreshStats}
          />
        ))
      ) : (
        <DailyQuestion
          questions={visibleQs}
          answers={answers}
          user={user}
          stats={stats}
          setStats={setStats}
          setAnswers={setAnswers}
          refreshStats={refreshStats}
        />
      )}

      {/* Mini challenges */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => openSub('quick')}
          className="card-surface shadow-card p-4 flex flex-col items-center gap-2 tap-scale"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--primary)/0.12)' }}>
            <Zap className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} />
          </div>
          <p className="text-sm font-bold text-foreground">التحدي السريع</p>
          <p className="text-xs text-muted-foreground text-center">أسئلة ثقافية ضد الوقت</p>
        </button>
        <button
          onClick={() => openSub('memory')}
          className="card-surface shadow-card p-4 flex flex-col items-center gap-2 tap-scale"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--primary)/0.12)' }}>
            <Brain className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} />
          </div>
          <p className="text-sm font-bold text-foreground">تحدي الذاكرة</p>
          <p className="text-xs text-muted-foreground text-center">طابق البطاقات بأسرع وقت</p>
        </button>
      </div>
    </div>
  );
}