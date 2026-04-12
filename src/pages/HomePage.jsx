import { useState, useMemo } from 'react';
import StatsOverview from '@/components/home/StatsOverview';
import WeeklyProgress from '@/components/home/WeeklyProgress';
import CompetitionInfo from '@/components/home/CompetitionInfo';

export default function HomePage({ user, stats, questions, answers }) {
  return (
    <div className="space-y-5 pb-6">
      <StatsOverview stats={stats} />
      <WeeklyProgress questions={questions} answers={answers} />
      <CompetitionInfo />
    </div>
  );
}