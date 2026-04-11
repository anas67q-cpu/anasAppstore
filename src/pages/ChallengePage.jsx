import { useState } from 'react';
import { Zap, Brain } from 'lucide-react';
import ChallengeCard from '@/components/challenge/ChallengeCard';
import QuickChallenge from '@/components/challenge/QuickChallenge';
import MemoryChallenge from '@/components/challenge/MemoryChallenge';
import DailyQuestion from '@/components/challenge/DailyQuestion';

export default function ChallengePage({ user, stats, questions, answers, settings, setStats, setAnswers, refreshStats }) {
  const [activeChallenge, setActiveChallenge] = useState(null);

  const quickImg = settings.find(s => s.quick_challenge_image)?.quick_challenge_image;
  const memoryImg = settings.find(s => s.memory_challenge_image)?.memory_challenge_image;

  if (activeChallenge === 'quick') {
    return (
      <QuickChallenge
        onBack={() => setActiveChallenge(null)}
        user={user}
        stats={stats}
        setStats={setStats}
      />
    );
  }
  if (activeChallenge === 'memory') {
    return (
      <MemoryChallenge
        onBack={() => setActiveChallenge(null)}
        user={user}
        stats={stats}
        setStats={setStats}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">التحدي</h2>

      {/* Mini Games */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">الألعاب</p>
        <div className="grid grid-cols-2 gap-3">
          <ChallengeCard
            title="التحدي السريع"
            icon={Zap}
            description="أجب بأسرع وقت"
            image={quickImg}
            onClick={() => setActiveChallenge('quick')}
            delay={0.1}
          />
          <ChallengeCard
            title="تحدي الذاكرة"
            icon={Brain}
            description="اقلب وطابق"
            image={memoryImg}
            onClick={() => setActiveChallenge('memory')}
            delay={0.2}
          />
        </div>
      </div>

      {/* Daily Question */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">سؤال اليوم</p>
        <DailyQuestion
          questions={questions}
          answers={answers}
          user={user}
          stats={stats}
          setStats={setStats}
          setAnswers={setAnswers}
          refreshStats={refreshStats}
        />
      </div>
    </div>
  );
}