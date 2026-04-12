import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { playTap } from '@/lib/sounds';

export default function BadgesStrip({ userBadges = [], allBadges = [] }) {
  const [selected, setSelected] = useState(null);
  if (userBadges.length === 0) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        {userBadges.map((ub, i) => {
          const badgeDef = allBadges.find(b => b.name === ub.badge_name);
          const iconUrl = ub.badge_icon_url || badgeDef?.icon_url;
          return (
            <motion.button
              key={ub.id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 400 }}
              onClick={() => { playTap(); setSelected(ub); }}
              className="flex-shrink-0 tap-scale"
            >
              <div
                className="w-14 h-14 rounded-2xl overflow-hidden shadow-card"
                style={{
                  background: ub.badge_color || badgeDef?.color || 'hsl(var(--primary))',
                  boxShadow: `0 0 12px ${ub.badge_color || badgeDef?.color || '#046B67'}55`
                }}
              >
                {iconUrl ? (
                  <img src={iconUrl} alt={ub.badge_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <BottomSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.badge_name}>
        {selected && <BadgeSheetDetail ub={selected} />}
      </BottomSheet>
    </>
  );
}

function BadgeSheetDetail({ ub }) {
  return (
    <div className="space-y-5 text-center">
      <div
        className="w-28 h-28 mx-auto rounded-3xl overflow-hidden shadow-card"
        style={{ background: ub.badge_color || 'hsl(var(--primary))' }}
      >
        {ub.badge_icon_url ? (
          <img src={ub.badge_icon_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Award className="w-14 h-14 text-white" />
          </div>
        )}
      </div>
      <div>
        <h3 className="text-xl font-bold text-foreground">{ub.badge_name}</h3>
        {ub.badge_description && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{ub.badge_description}</p>
        )}
      </div>
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
    </div>
  );
}