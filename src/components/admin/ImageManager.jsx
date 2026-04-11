import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, Image } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { playTap } from '@/lib/sounds';

const imageSlots = [
  { key: 'quick_challenge_image', label: 'صورة التحدي السريع' },
  { key: 'memory_challenge_image', label: 'صورة تحدي الذاكرة' },
  { key: 'leaderboard_shield', label: 'شعار المتصدرين' },
];

export default function ImageManager({ onBack }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const all = await base44.entities.AppSettings.list();
    const imageSettings = all.find(s => s.key === 'images') || null;
    setSettings(imageSettings);
    setLoading(false);
  };

  const handleUpload = async (key, file) => {
    playTap();
    setUploading(key);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const data = { key: 'images', [key]: file_url };
    if (settings) {
      await base44.entities.AppSettings.update(settings.id, data);
      setSettings(prev => ({ ...prev, ...data }));
    } else {
      const created = await base44.entities.AppSettings.create(data);
      setSettings(created);
    }
    setUploading(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="tap-scale">
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </button>
        <h2 className="text-lg font-bold">الصور</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {imageSlots.map(slot => {
            const url = settings?.[slot.key];
            return (
              <motion.div
                key={slot.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-surface rounded-2xl p-4 space-y-3"
              >
                <p className="text-sm font-medium">{slot.label}</p>
                {url ? (
                  <img src={url} alt="" className="w-full h-40 object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-40 rounded-xl bg-secondary flex items-center justify-center">
                    <Image className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary text-sm font-medium cursor-pointer tap-scale">
                  {uploading === slot.key ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      رفع صورة
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files[0] && handleUpload(slot.key, e.target.files[0])}
                  />
                </label>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}