import StatsOverview from '@/components/home/StatsOverview';
import WeeklyProgress from '@/components/home/WeeklyProgress';
import CompetitionInfo from '@/components/home/CompetitionInfo';
import BadgesStrip from '@/components/home/BadgesStrip';

export default function HomePage({ user, stats, questions, answers, userBadges = [], allBadges = [], allUserBadges = [], settings = [], cardTemplateUrl, streakLogoUrl, userName, allStats = [] }) {
  const userCategory = stats?.category || 'guest';
  const userEmail = user?.email || '';

  // Filter questions visible to this user (same logic as ChallengePage)
  const visibleQs = (questions || []).filter(q => {
    if (!q.is_published) return false;
    const ta = q.target_audience || 'all';
    if (ta === 'all') return true;
    if (ta === 'contestants') return userCategory === 'contestant';
    if (ta === 'guests') return userCategory === 'guest';
    if (ta === 'specific') return (q.target_emails || []).includes(userEmail);
    return true;
  });

  return (
    <div className="space-y-5 pb-6">
      <StatsOverview stats={stats} />
      {userBadges.length > 0 && (
        <BadgesStrip
          userBadges={userBadges}
          allBadges={allBadges}
          allUserBadges={allUserBadges}
          cardTemplateUrl={cardTemplateUrl}
          userName={userName}
        />
      )}
      <WeeklyProgress questions={visibleQs} answers={answers} userEmail={userEmail} />
      <CompetitionInfo settings={settings} />
    </div>
  );
}