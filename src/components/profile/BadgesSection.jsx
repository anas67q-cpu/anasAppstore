import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { playTap } from '@/lib/sounds';

export default function BadgesSection({ allBadges = [], userBadges = [] }) {
  const [selected, setSelected] = useState(null);

  const earnedSet = new Set(userBadges.map(b => b.badge_name));
  const earnedMap = {};
  userBadges.forEach(b => { earnedMap[b.badge_name] = b; });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-surface shadow-card p-5"
      >
        <h3 className="text-base font-bold text-foreground mb-4">الشارات</h3>

        {allBadges.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <Award className="w-10 h-10 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">لا توجد شارات بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {allBadges.map((badge, i) => {
              const earned = earnedSet.has(badge.name);
              const ub = earnedMap[badge.name];
              return (
                <motion.button
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => { playTap(); setSelected({ badge, earned, ub }); }}
                  className="flex flex-col items-center gap-1.5 tap-scale"
                  style={{ opacity: earned ? 1 : 0.35 }}
                >
                  <div className="w-16 h-16 overflow-hidden rounded-2xl"
                    style={{ filter: earned ? 'none' : 'grayscale(100%)' }}>
                    {badge.icon_url ? (
                      <img src={badge.icon_url} alt={badge.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center rounded-2xl"
                        style={{ background: badge.color || 'hsl(var(--primary))' }}>
                        <Award className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-center text-muted-foreground font-medium leading-tight line-clamp-2">
                    {badge.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>

      <BottomSheet open={!!selected} onClose={() => setSelected(null)}>
        {selected && <BadgeDetail item={selected} />}
      </BottomSheet>
    </>
  );
}

function BadgeDetail({ item }) {
  const { badge, earned, ub } = item;
  return (
    <div className="space-y-5 text-center">
      <div className="w-28 h-28 rounded-3xl mx-auto overflow-hidden shadow-card"
        style={{ filter: earned ? 'none' : 'grayscale(100%)', opacity: earned ? 1 : 0.4 }}>
        {badge.icon_url ? (
          <img src={badge.icon_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: badge.color || 'hsl(var(--primary))' }}>
            <Award className="w-14 h-14 text-white" />
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold text-foreground">{badge.name}</h3>
        {badge.description && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{badge.description}</p>
        )}
        {!earned && (
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
            لم تحصل على هذه الشارة بعد
          </span>
        )}
      </div>

      {earned && ub && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-secondary text-center">
            <p className="text-2xl font-black" style={{ color: 'hsl(var(--primary))' }}>{ub.count || 1}</p>
            <p className="text-xs text-muted-foreground mt-1">عدد المرات</p>
          </div>
          <div className="p-3 rounded-2xl bg-secondary text-center">
            <p className="text-sm font-bold text-foreground">
              {new Date(ub.created_date).toLocaleDateString('ar-SA', { timeZone: 'Asia/Riyadh' })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">تاريخ الحصول</p>
          </div>
        </div>
      )}
    </div>
  );
}