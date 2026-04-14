import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { playTap } from '@/lib/sounds';
import html2canvas from 'html2canvas';

export default function BadgesSection({ allBadges = [], userBadges = [], cardTemplateUrl, userName = '' }) {
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
                  <div className="w-16 h-16 overflow-hidden"
                    style={{ filter: earned ? 'none' : 'grayscale(100%)', borderRadius: 0 }}>
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
        {selected && (
          <BadgeDetail
            item={selected}
            userBadges={userBadges}
            cardTemplateUrl={cardTemplateUrl}
            userName={userName}
          />
        )}
      </BottomSheet>
    </>
  );
}

function BadgeDetail({ item, userBadges, cardTemplateUrl, userName }) {
  const { badge, earned, ub } = item;
  const cardRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const ownersOfThisBadge = userBadges.filter(b => b.badge_name === badge.name);

  const handleSave = async () => {
    if (!cardRef.current || !earned) return;
    setSaving(true);
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `badge-${badge.name}.png`;
    a.click();
    setSaving(false);
  };

  return (
    <div className="space-y-5 text-center">
      <div className="w-32 h-32 mx-auto overflow-hidden" style={{ filter: earned ? 'none' : 'grayscale(100%)', opacity: earned ? 1 : 0.4, borderRadius: 0 }}>
        {badge.icon_url ? (
          <img src={badge.icon_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center rounded-3xl"
            style={{ background: badge.color || 'hsl(var(--primary))' }}>
            <Award className="w-16 h-16 text-white" />
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold text-foreground">{badge.name}</h3>
        {badge.description && (
          <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{badge.description}</p>
        )}
        {!earned && (
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
            لم تحصل على هذه الشارة بعد
          </span>
        )}
      </div>

      {/* Owners */}
      <div className="p-3 rounded-2xl bg-secondary text-center">
        {ownersOfThisBadge.length > 0 ? (
          <>
            <p className="text-xs text-muted-foreground mb-1">من يملكها؟</p>
            <p className="text-sm font-bold text-foreground">
              {ownersOfThisBadge.map(b => b.user_name || b.user_email).join('، ')}
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">لا أحد يملكها بعد</p>
        )}
      </div>

      {earned && ub && (
        <>
          <div className="p-3 rounded-2xl bg-secondary text-center">
            <p className="text-sm font-bold text-foreground">
              {new Date(ub.created_date).toLocaleDateString('ar-SA', { timeZone: 'Asia/Riyadh' })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">تاريخ الحصول</p>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'hsl(var(--primary))' }}>
            <Download className="w-4 h-4" />
            {saving ? 'جاري الحفظ...' : 'حفظ بطاقة الشارة'}
          </button>
        </>
      )}

      {/* Hidden share card */}
      {earned && ub && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
          <div ref={cardRef} style={{
            width: 400, height: 400, borderRadius: 32, overflow: 'hidden',
            position: 'relative', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 14,
            fontFamily: 'Rubik, sans-serif', direction: 'rtl', padding: 40,
            background: cardTemplateUrl
              ? `url(${cardTemplateUrl}) center/cover no-repeat`
              : `linear-gradient(135deg, ${badge.color || '#046B67'} 0%, #034b48 100%)`,
          }}>
            {!cardTemplateUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              {badge.icon_url && <img src={badge.icon_url} alt="" style={{ width: 80, height: 80, objectFit: 'cover' }} />}
              <div style={{ color: '#fff', fontSize: 26, fontWeight: 900, textAlign: 'center' }}>{badge.name}</div>
              {badge.description && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', lineHeight: 1.5 }}>{badge.description}</div>}
              <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{userName}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}