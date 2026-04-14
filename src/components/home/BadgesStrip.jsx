import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { playTap } from '@/lib/sounds';
import html2canvas from 'html2canvas';

export default function BadgesStrip({ userBadges = [], allBadges = [], cardTemplateUrl, userName = '' }) {
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
            allBadges={allBadges}
            userBadges={userBadges}
          />
        )}
      </BottomSheet>
    </>
  );
}

function BadgeSheetDetail({ ub, cardTemplateUrl, userName, allBadges, userBadges }) {
  const cardRef = useRef(null);
  const [saving, setSaving] = useState(false);

  // Who else has this badge
  const ownersOfThisBadge = userBadges.filter(b => b.badge_name === ub.badge_name);

  const handleSave = async () => {
    if (!cardRef.current) return;
    setSaving(true);
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `badge-${ub.badge_name}-${userName}.png`;
    a.click();
    setSaving(false);
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

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ background: 'hsl(var(--primary))' }}
      >
        <Download className="w-4 h-4" />
        {saving ? 'جاري الحفظ...' : 'حفظ بطاقة الشارة'}
      </button>

      {/* Hidden shareable card */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <div ref={cardRef} style={{
          width: 400, height: 400, borderRadius: 32, overflow: 'hidden',
          position: 'relative', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
          fontFamily: 'Rubik, sans-serif', direction: 'rtl',
          background: cardTemplateUrl ? `url(${cardTemplateUrl}) center/cover no-repeat` : `linear-gradient(135deg, ${ub.badge_color || '#046B67'} 0%, #034b48 100%)`,
          padding: 40,
        }}>
          {!cardTemplateUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            {ub.badge_icon_url && <img src={ub.badge_icon_url} alt="" style={{ width: 80, height: 80, objectFit: 'cover' }} />}
            <div style={{ color: '#fff', fontSize: 26, fontWeight: 900, textAlign: 'center' }}>{ub.badge_name}</div>
            {ub.badge_description && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', lineHeight: 1.5 }}>{ub.badge_description}</div>}
            <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{userName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}