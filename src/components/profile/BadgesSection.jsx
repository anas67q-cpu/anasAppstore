import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Lock } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { playTap } from '@/lib/sounds';

export default function BadgesSection({ userBadges = [] }) {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-surface shadow-card p-5"
      >
        <h3 className="text-base font-bold text-foreground mb-4">الشارات</h3>

        {userBadges.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <Award className="w-10 h-10 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">لا توجد شارات بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {userBadges.map((badge, i) => (
              <motion.button
                key={badge.id}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => { playTap(); setSelected(badge); }}
                className="flex flex-col items-center gap-1.5 tap-scale"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden shadow-card"
                  style={{ background: badge.badge_color || 'hsl(var(--primary))', padding: 2 }}
                >
                  {badge.badge_icon_url ? (
                    <img src={badge.badge_icon_url} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Award className="w-7 h-7 text-white" />
                  )}
                </div>
                <span className="text-[10px] text-center text-foreground font-medium leading-tight line-clamp-2">
                  {badge.badge_name}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      <BottomSheet open={!!selected} onClose={() => setSelected(null)}>
        {selected && <BadgeDetail badge={selected} />}
      </BottomSheet>
    </>
  );
}

function BadgeDetail({ badge }) {
  return (
    <div className="space-y-5 text-center">
      <div
        className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center overflow-hidden shadow-card"
        style={{ background: badge.badge_color || 'hsl(var(--primary))' }}
      >
        {badge.badge_icon_url ? (
          <img src={badge.badge_icon_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <Award className="w-12 h-12 text-white" />
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold text-foreground">{badge.badge_name}</h3>
        {badge.badge_description && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{badge.badge_description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl bg-secondary text-center">
          <p className="text-2xl font-black" style={{ color: 'hsl(var(--primary))' }}>{badge.count || 1}</p>
          <p className="text-xs text-muted-foreground mt-1">عدد المرات</p>
        </div>
        <div className="p-3 rounded-2xl bg-secondary text-center">
          <p className="text-sm font-bold text-foreground">
            {new Date(badge.created_date).toLocaleDateString('ar-SA', { timeZone: 'Asia/Riyadh' })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">تاريخ الحصول</p>
        </div>
      </div>
    </div>
  );
}