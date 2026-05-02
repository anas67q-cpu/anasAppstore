import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, ImageIcon, Link } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const SLOTS = [
  { key: 'competition_logo', label: 'شعار شاشة البداية (Splash Screen)', hint: 'يظهر عند فتح التطبيق — يُفضّل PNG شفاف بدقة عالية' },
  { key: 'quick_challenge_image', label: 'صورة التحدي السريع' },
  { key: 'memory_challenge_image', label: 'صورة تحدي الذاكرة' },
  { key: 'leaderboard_shield', label: 'شعار لوحة المتصدرين' },
  { key: 'card_template', label: 'قالب بطاقة النشر (الشكل الموحد)' },
  { key: 'streak_logo', label: 'شعار بطاقة سلسلة الإجابات' },
];

export default function ImageManager() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [urlInputs, setUrlInputs] = useState({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    const all = await base44.entities.AppSettings.list();
    setSettings(all.find(s => s.key === 'images') || null);
    setLoading(false);
  };

  const handleUrlSave = async (key) => {
    const url = urlInputs[key]?.trim();
    if (!url) return;
    setUploading(key);
    const data = { key: 'images', [key]: url };
    if (settings) {
      await base44.entities.AppSettings.update(settings.id, data);
      setSettings(p => ({ ...p, ...data }));
    } else {
      const c = await base44.entities.AppSettings.create(data);
      setSettings(c);
    }
    setUrlInputs(p => ({ ...p, [key]: '' }));
    setUploading(null);
  };

  const handleUpload = async (key, file) => {
    setUploading(key);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const data = { key: 'images', [key]: file_url };
    if (settings) {
      await base44.entities.AppSettings.update(settings.id, data);
      setSettings(p => ({ ...p, ...data }));
    } else {
      const c = await base44.entities.AppSettings.create(data);
      setSettings(c);
    }
    setUploading(null);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-secondary tap-scale" aria-label="رجوع">
          <ArrowRight className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground">الصور والأصول</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="space-y-4">
          {SLOTS.map((slot, i) => {
            const url = settings?.[slot.key];
            const isLogoSlot = slot.key === 'competition_logo';
            return (
              <motion.div key={slot.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="card-surface shadow-card p-4 space-y-3">
                <div>
                  <p className="font-medium text-foreground text-sm">{slot.label}</p>
                  {slot.hint && <p className="text-xs text-muted-foreground mt-0.5">{slot.hint}</p>}
                </div>
                {url ? (
                  <div className={`w-full rounded-xl overflow-hidden flex items-center justify-center ${isLogoSlot ? 'h-48 bg-primary/10' : 'h-40 bg-secondary'}`}>
                    <img src={url} alt="" className={isLogoSlot ? 'h-40 object-contain' : 'w-full h-full object-cover'} />
                  </div>
                ) : (
                  <div className="w-full h-40 rounded-xl bg-secondary flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                )}
                {/* Upload from device */}
                <label className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-sm font-medium cursor-pointer tap-scale">
                  {uploading === slot.key
                    ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
                    : <><Upload className="w-4 h-4" /> رفع من الجهاز</>}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files[0] && handleUpload(slot.key, e.target.files[0])} />
                </label>
                {/* URL input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="أو أدخل رابط الصورة..."
                    value={urlInputs[slot.key] || ''}
                    onChange={e => setUrlInputs(p => ({ ...p, [slot.key]: e.target.value }))}
                    className="flex-1 rounded-xl bg-secondary px-3 py-2 text-sm text-foreground outline-none border border-border focus:border-primary"
                    dir="ltr"
                  />
                  <button
                    onClick={() => handleUrlSave(slot.key)}
                    disabled={!urlInputs[slot.key]?.trim() || uploading === slot.key}
                    className="px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-40 tap-scale"
                    style={{ background: 'hsl(var(--primary))' }}
                  >
                    <Link className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}