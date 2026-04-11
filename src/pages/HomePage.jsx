import GreetingSection from '@/components/home/GreetingSection';
import StreakCard from '@/components/home/StreakCard';
import StatsCard from '@/components/home/StatsCard';
import DailyStatus from '@/components/home/DailyStatus';
import LeaderboardPreview from '@/components/home/LeaderboardPreview';

export default function HomePage({ user, stats, questions, answers, allStats, settings }) {
  const today = new Date().toISOString().split('T')[0];
  const todayQuestion = questions.find(q => q.publish_date === today && q.status !== 'draft');
  const todayAnswer = todayQuestion
    ? answers.find(a => a.question_id === todayQuestion.id)
    : null;

  return (
    <div className="space-y-5 pb-4">
      <GreetingSection userName={user?.full_name} />
      <DailyStatus todayAnswer={todayAnswer} todayQuestion={todayQuestion} />
      <StreakCard
        currentStreak={stats?.current_streak || 0}
        highestStreak={stats?.highest_streak || 0}
      />
      <StatsCard stats={stats} />
      <LeaderboardPreview allStats={allStats} settings={settings} />
    </div>
  );
}