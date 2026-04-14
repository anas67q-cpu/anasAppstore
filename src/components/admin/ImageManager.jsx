import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SLOTS = [
  { key: 'quick_challenge_image', label: 'صورة التحدي السريع' },
  { key: 'memory_challenge_image', label: 'صورة تحدي الذاكرة' },
  { key: 'leaderboard_shield', label: 'شعار لوحة المتصدرين' },
  { key: 'card_template', label: 'قالب بطاقة النشر (الشكل الموحد)' },
  { key: 'streak_logo', label: 'شعار بطاقة سلسلة الإجابات' },
];

export default function ImageManager({ onBack }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const all = await base44.entities.AppSettings.list();
    setSettings(all.find(s => s.key === 'images') || null);
    setLoading(false);
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
        <button onClick={onBack} className="p-2 rounded-xl bg-secondary tap-scale">
          <ArrowLeft className="w-5 h-5 text-foreground" />
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
            return (
              <motion.div key={slot.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="card-surface shadow-card p-4 space-y-3">
                <p className="font-medium text-foreground text-sm">{slot.label}</p>
                {url ? (
                  <img src={url} alt="" className="w-full h-40 object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-40 rounded-xl bg-secondary flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-sm font-medium cursor-pointer tap-scale">
                  {uploading === slot.key
                    ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
                    : <><Upload className="w-4 h-4" /> رفع صورة</>}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files[0] && handleUpload(slot.key, e.target.files[0])} />
                </label>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}