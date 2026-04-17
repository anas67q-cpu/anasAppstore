import DailyQuestion from '@/components/challenge/DailyQuestion';

export default function ChallengePage({ user, stats, questions, answers, setStats, setAnswers, refreshStats }) {
  // All published questions sorted by day_number
  const publishedQs = (questions || [])
    .filter(q => q.is_published)
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