import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import NameEditor from '@/components/profile/NameEditor';
import StreakCard from '@/components/profile/StreakCard';
import BadgesSection from '@/components/profile/BadgesSection';
import LeaderboardSection from '@/components/profile/LeaderboardSection';
import ComplaintsSection from '@/components/profile/ComplaintsSection';
import BottomSheet from '@/components/BottomSheet';
import { Trophy, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { playTap } from '@/lib/sounds';

export default function ProfilePage({ user, stats, allStats, userBadges, allBadges = [], allUserBadges = [], updateUserName, fetchAllStats, cardTemplateUrl, streakLogoUrl, userName, settings = [] }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const rank = allStats.findIndex(s => s.user_email === user?.email) + 1;

  useEffect(() => {
    fetchAllStats?.();
  }, []);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    // Delete user stats and answers
    if (stats?.id) await base44.entities.UserStats.delete(stats.id).catch(() => {});
    const userAnswers = await base44.entities.Answer.filter({ user_email: user?.email }).catch(() => []);
    await Promise.all(userAnswers.map(a => base44.entities.Answer.delete(a.id).catch(() => {})));
    base44.auth.logout();
  };

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

      <StreakCard streak={stats?.current_streak || 0} />

      <BadgesSection
        allBadges={allBadges}
        userBadges={userBadges}
        allUserBadges={allUserBadges}
        cardTemplateUrl={cardTemplateUrl}
        userName={userName}
      />

      <LeaderboardSection allStats={allStats} currentUserEmail={user?.email} settings={settings} />

      <ComplaintsSection user={user} stats={stats} />

      {/* Delete Account */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <button
          onClick={() => { playTap(); setShowDeleteConfirm(true); }}
          className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium tap-scale"
          style={{ background: '#ef444415', color: '#ef4444', border: '1px solid #ef444430' }}
        >
          <Trash2 className="w-4 h-4" />
          حذف الحساب
        </button>
      </motion.div>

      {/* Delete Confirmation BottomSheet */}
      <BottomSheet open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="حذف الحساب">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: '#ef444415' }}>
            <Trash2 className="w-8 h-8" style={{ color: '#ef4444' }} />
          </div>
          <div>
            <p className="font-bold text-foreground text-lg">هل أنت متأكد؟</p>
            <p className="text-sm text-muted-foreground mt-1">سيتم حذف جميع بياناتك وإجاباتك بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.</p>
          </div>
          <div className="space-y-2 pt-2">
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="w-full py-3.5 rounded-2xl font-bold text-white tap-scale disabled:opacity-50"
              style={{ background: '#ef4444' }}
            >
              {deleting ? 'جاري الحذف...' : 'نعم، احذف حسابي'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full py-3.5 rounded-2xl font-bold tap-scale bg-secondary text-foreground"
            >
              إلغاء
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}