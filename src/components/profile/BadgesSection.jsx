import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Share2 } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { playTap } from '@/lib/sounds';
import html2canvas from 'html2canvas';

export default function BadgesSection({ allBadges = [], userBadges = [], allUserBadges = [], cardTemplateUrl, userName = '' }) {
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
            allUserBadges={allUserBadges}
            cardTemplateUrl={cardTemplateUrl}
            userName={userName}
          />
        )}
      </BottomSheet>
    </>
  );
}

function BadgeDetail({ item, allUserBadges, cardTemplateUrl, userName }) {
  const { badge, earned, ub } = item;
  const cardRef = useRef(null);
  const [saving, setSaving] = useState(false);

  // Find all users who own this badge across ALL users
  const ownersOfThisBadge = allUserBadges.filter(b => b.badge_name === badge.name);

  const handleShare = async () => {
    if (!cardRef.current || !earned) return;
    setSaving(true);
    const canvas = await html2canvas(cardRef.current, { scale: 4, useCORS: true, allowTaint: true, backgroundColor: null, imageTimeout: 15000 });
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `badge-${badge.name}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: badge.name });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `badge-${badge.name}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
      setSaving(false);
    }, 'image/png', 1.0);
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

      {/* Owners — from ALL users */}
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

          {/* Save progress bar */}
          {saving && (
            <div className="w-full h-1.5 rounded-full overflow-hidden bg-secondary">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="h-full w-1/3 rounded-full"
                style={{ background: 'hsl(var(--primary))' }}
              />
            </div>
          )}

          <button onClick={handleShare} disabled={saving}
            className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'hsl(var(--primary))' }}>
            {saving
              ? <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />جاري تجهيز البطاقة...</>
              : <><Share2 className="w-4 h-4" />نشر بطاقة الشارة</>
            }
          </button>
        </>
      )}

      {/* Hidden share card — highest quality */}
      {earned && ub && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
          <div ref={cardRef} style={{
            width: 800, height: 800, borderRadius: 48, overflow: 'hidden',
            position: 'relative', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 18,
            fontFamily: 'Rubik, sans-serif', direction: 'rtl', padding: 60,
            background: cardTemplateUrl
              ? `url(${cardTemplateUrl}) center/cover no-repeat`
              : `linear-gradient(135deg, ${badge.color || '#046B67'} 0%, #034b48 100%)`,
          }}>
            {!cardTemplateUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              {/* Name at top */}
              <div style={{ color: '#fff', fontSize: 38, fontWeight: 900, textAlign: 'center' }}>{userName}</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 22, textAlign: 'center' }}>حصلت على شارة</div>
              {/* Badge icon */}
              {badge.icon_url
                ? <img src={badge.icon_url} alt="" style={{ width: 320, height: 320, objectFit: 'cover' }} crossOrigin="anonymous" />
                : <div style={{ width: 320, height: 320, borderRadius: 48, background: badge.color || '#046B67', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 160 }}>🏅</span>
                  </div>
              }
              <div style={{ color: '#fff', fontSize: 38, fontWeight: 900, textAlign: 'center' }}>{badge.name}</div>
              {badge.description && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 20, textAlign: 'center', lineHeight: 1.5, maxWidth: 580 }}>{badge.description}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}