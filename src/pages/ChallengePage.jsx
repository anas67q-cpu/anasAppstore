import DailyQuestion from '@/components/challenge/DailyQuestion';

export default function ChallengePage({ user, stats, questions, answers, setStats, setAnswers, refreshStats }) {
  return (
    <div className="space-y-5 pb-6">
      <h2 className="text-xl font-bold text-foreground">سؤال اليوم</h2>
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
  );
}