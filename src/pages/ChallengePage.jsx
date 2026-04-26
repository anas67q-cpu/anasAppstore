import DailyQuestion from '@/components/challenge/DailyQuestion';

export default function ChallengePage({ user, stats, questions, answers, setStats, setAnswers, refreshStats }) {
  const userCategory = stats?.category || 'guest';
  const userEmail = user?.email || '';

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

  // All published questions sorted by day_number
  const publishedQs = visibleQs
    .sort((a, b) => (a.day_number || 0) - (b.day_number || 0));

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
          questions={questions}
          answers={answers}
          user={user}
          stats={stats}
          setStats={setStats}
          setAnswers={setAnswers}
          refreshStats={refreshStats}
        />
      )}
    </div>
  );
}