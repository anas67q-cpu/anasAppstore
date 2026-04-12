import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NameEditor from '@/components/profile/NameEditor';
import BadgesSection from '@/components/profile/BadgesSection';
import LeaderboardSection from '@/components/profile/LeaderboardSection';
import { Trophy } from 'lucide-react';

export default function ProfilePage({ user, stats, allStats, userBadges, updateUserName, fetchAllStats }) {
  const rank = allStats.findIndex(s => s.user_email === user?.email) + 1;

  useEffect(() => {
    fetchAllStats?.();
  }, []);

  return (
    <div className="space-y-5 pb-6">
      <h2 className="text-xl font-bold text-foreground">حسابي</h2>

      {/* Rank badge */}
      {rank > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface shadow-card p-4 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'hsl(var(--primary))' }}>
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">مركزك في لوحة المتصدرين</p>
            <p className="text-2xl font-black text-foreground">
              {rank}
              <span className="text-sm font-normal text-muted-foreground mr-1">من {allStats.length}</span>
            </p>
          </div>
          <div className="mr-auto text-left">
            <p className="text-xs text-muted-foreground">نقاطك</p>
            <p className="text-xl font-black" style={{ color: 'hsl(var(--primary))' }}>
              {stats?.total_points || 0}
            </p>
          </div>
        </motion.div>
      )}

      <NameEditor userName={user?.full_name} statsName={stats?.user_name} onSave={updateUserName} />
      <BadgesSection userBadges={userBadges} />
      <LeaderboardSection allStats={allStats} currentUserEmail={user?.email} />
    </div>
  );
}