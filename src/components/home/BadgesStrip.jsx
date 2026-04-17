import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Share2 } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { playTap } from '@/lib/sounds';
import html2canvas from 'html2canvas';

export default function BadgesStrip({ userBadges = [], allBadges = [], allUserBadges = [], cardTemplateUrl, userName = '' }) {
  const [selected, setSelected] = useState(null);
  if (userBadges.length === 0) return null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
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
              {iconUrl ? (
                <img src={iconUrl} alt={ub.badge_name}
                  className="w-16 h-16 object-cover"
                  style={{ borderRadius: 0 }}
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center"
                  style={{ background: ub.badge_color || badgeDef?.color || 'hsl(var(--primary))', borderRadius: 16 }}>
                  <Award className="w-8 h-8 text-white" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <BottomSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.badge_name}>
        {selected && (
          <BadgeSheetDetail
            ub={selected}
            cardTemplateUrl={cardTemplateUrl}
            userName={userName}
            allUserBadges={allUserBadges}
          />
        )}
      </BottomSheet>
    </>
  );
}

function BadgeSheetDetail({ ub, cardTemplateUrl, userName, allUserBadges }) {
  const cardRef = useRef(null);
  const [saving, setSaving] = useState(false);

  // Who has this badge — from all users
  const ownersOfThisBadge = allUserBadges.filter(b => b.badge_name === ub.badge_name);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setSaving(true);
    const canvas = await html2canvas(cardRef.current, { scale: 4, useCORS: true, allowTaint: true, backgroundColor: null, imageTimeout: 15000 });
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `badge-${ub.badge_name}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: ub.badge_name });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `badge-${ub.badge_name}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
      setSaving(false);
    }, 'image/png', 1.0);
  };

  return (
    <div className="space-y-5 text-center">
      {ub.badge_icon_url ? (
        <img src={ub.badge_icon_url} alt="" className="w-32 h-32 object-cover mx-auto" style={{ borderRadius: 0 }} />
      ) : (
        <div className="w-32 h-32 mx-auto rounded-3xl flex items-center justify-center"
          style={{ background: ub.badge_color || 'hsl(var(--primary))' }}>
          <Award className="w-16 h-16 text-white" />
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-foreground">{ub.badge_name}</h3>
        {ub.badge_description && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{ub.badge_description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl bg-secondary text-center">
          <p className="text-sm font-bold text-foreground">
            {new Date(ub.created_date).toLocaleDateString('ar-SA', { timeZone: 'Asia/Riyadh' })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">تاريخ الحصول</p>
        </div>
        <div className="p-3 rounded-2xl bg-secondary text-center">
          <p className="text-sm font-bold leading-snug text-foreground">
            {ownersOfThisBadge.map(b => b.user_name || b.user_email).join('، ') || '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">من يملكها؟</p>
        </div>
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

      <button
        onClick={handleShare}
        disabled={saving}
        className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ background: 'hsl(var(--primary))' }}
      >
        {saving
          ? <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />جاري تجهيز البطاقة...</>
          : <><Share2 className="w-4 h-4" />نشر بطاقة الشارة</>
        }
      </button>

      {/* Hidden high-quality card for export */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <div ref={cardRef} style={{
          width: 800, height: 800, borderRadius: 48, overflow: 'hidden',
          position: 'relative', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 20,
          fontFamily: 'Rubik, sans-serif', direction: 'rtl',
          background: cardTemplateUrl ? `url(${cardTemplateUrl}) center/cover no-repeat` : `linear-gradient(135deg, ${ub.badge_color || '#046B67'} 0%, #034b48 100%)`,
          padding: 60,
        }}>
          {!cardTemplateUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ color: '#fff', fontSize: 38, fontWeight: 900, textAlign: 'center' }}>{userName}</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 22, textAlign: 'center' }}>حصلت على شارة</div>
            {ub.badge_icon_url
              ? <img src={ub.badge_icon_url} alt="" style={{ width: 320, height: 320, objectFit: 'cover' }} crossOrigin="anonymous" />
              : <div style={{ width: 320, height: 320, borderRadius: 48, background: ub.badge_color || '#046B67', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 160 }}>🏅</span>
                </div>
            }
            <div style={{ color: '#fff', fontSize: 38, fontWeight: 900, textAlign: 'center' }}>{ub.badge_name}</div>
            {ub.badge_description && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 20, textAlign: 'center', lineHeight: 1.5, maxWidth: 580 }}>{ub.badge_description}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}