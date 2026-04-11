import NameEditor from '@/components/profile/NameEditor';
import WeeklyRow from '@/components/profile/WeeklyRow';
import StreakCard from '@/components/home/StreakCard';
import BadgesSection from '@/components/profile/BadgesSection';
import { base44 } from '@/api/base44Client';
import { LogOut } from 'lucide-react';
import { playTap } from '@/lib/sounds';

export default function ProfilePage({ user, stats, questions, answers, updateUserName }) {
  return (
    <div className="space-y-5 pb-4">
      <h2 className="text-xl font-bold">حسابي</h2>

      <NameEditor userName={user?.full_name} onSave={updateUserName} />
      <WeeklyRow answers={answers} questions={questions} />
      <StreakCard
        currentStreak={stats?.current_streak || 0}
        highestStreak={stats?.highest_streak || 0}
      />
      <BadgesSection stats={stats} />

      <button
        onClick={() => { playTap(); base44.auth.logout(); }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-muted-foreground text-sm font-medium tap-scale"
      >
        <LogOut className="w-4 h-4" />
        تسجيل الخروج
      </button>
    </div>
  );
}