import StatsOverview from '@/components/home/StatsOverview';
import WeeklyProgress from '@/components/home/WeeklyProgress';
import CompetitionInfo from '@/components/home/CompetitionInfo';
import BadgesStrip from '@/components/home/BadgesStrip';

export default function HomePage({ user, stats, questions, answers, userBadges = [], allBadges = [], settings = [] }) {
  return (
    <div className="space-y-5 pb-6">
      <StatsOverview stats={stats} />
      {userBadges.length > 0 && <BadgesStrip userBadges={userBadges} allBadges={allBadges} />}
      <WeeklyProgress questions={questions} answers={answers} />
      <CompetitionInfo settings={settings} />
    </div>
  );
}