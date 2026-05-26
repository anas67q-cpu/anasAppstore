import { useState, useEffect } from 'react';
import { ArrowRight, Upload, Save, FileText, Link } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function CompetitionInfoManager() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [rulesUrl, setRulesUrl] = useState('');
  const [uploadingRules, setUploadingRules] = useState(false);
  const [settingId, setSettingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const all = await base44.entities.AppSettings.filter({ key: 'info' });
    if (all[0]) {
      setSettingId(all[0].id);
      setDescription(all[0].competition_description || '');
      setLogoUrl(all[0].competition_logo || '');
      setStartDate(all[0].competition_start_date || '');
      setRulesUrl(all[0].competition_rules_url || '');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { key: 'info', competition_description: description, competition_logo: logoUrl, competition_start_date: startDate || null, competition_rules_url: rulesUrl || null };
    if (settingId) {
      await base44.entities.AppSettings.update(settingId, data);
    } else {
      const c = await base44.entities.AppSettings.create(data);
      setSettingId(c.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setLogoUrl(file_url);
    setUploading(false);
  };

  const handleUploadRules = async (file) => {
    setUploadingRules(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setRulesUrl(file_url);
    setUploadingRules(false);
  };

  const ic = 'w-full bg-secondary rounded-xl px-3 py-3 text-sm text-foreground outline-none border border-border focus:border-primary';

  return (
    <div className="px-4 py-4 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-secondary tap-scale" aria-label="رجوع">
          <ArrowRight className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground">معلومات المسابقة</h2>
      </div>

      <div className="card-surface shadow-card p-5 space-y-4">
        {/* Logo */}
        <div>
          <p className="text-sm font-bold text-foreground mb-2">شعار المسابقة</p>
          {logoUrl && (
            <img src={logoUrl} alt="" className="w-20 h-20 rounded-2xl object-cover mb-3 shadow-card" />
          )}
          <label className="flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-sm cursor-pointer tap-scale">
            {uploading
              ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
              : <><Upload className="w-4 h-4" /> رفع شعار</>
            }
            <input type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />
          </label>
        </div>

        {/* Competition Start Date */}
        <div>
          <p className="text-sm font-bold text-foreground mb-2">📅 تاريخ بداية المسابقة (للعداد التنازلي)</p>
          <input
            type="datetime-local"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className={ic}
          />
          <p className="text-xs text-muted-foreground mt-1.5">سيظهر العداد التنازلي في خانة السؤال اليومي حتى هذا الموعد</p>
        </div>

        {/* Rules URL / PDF */}
        <div>
          <p className="text-sm font-bold text-foreground mb-2">📄 نظام المسابقة (رابط أو PDF)</p>
          <input
            type="url"
            value={rulesUrl}
            onChange={e => setRulesUrl(e.target.value)}
            className={ic}
            placeholder="https://... أو ارفع ملف PDF أدناه"
          />
          <div className="mt-2 flex items-center gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary text-sm cursor-pointer tap-scale">
              {uploadingRules
                ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
                : <><FileText className="w-4 h-4" /> رفع PDF</>
              }
              <input type="file" accept=".pdf,application/pdf" className="hidden"
                onChange={e => e.target.files[0] && handleUploadRules(e.target.files[0])} />
            </label>
            {rulesUrl && (
              <a href={rulesUrl} target="_blank" rel="noreferrer"
                className="px-4 py-2.5 rounded-xl text-sm font-medium tap-scale"
                style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
                معاينة
              </a>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">سيظهر هذا الرابط للمشتركين في صفحة الحساب وفي نافذة الموافقة الأولى</p>
        </div>

        {/* Description */}
        <div>
          <p className="text-sm font-bold text-foreground mb-2">نص تعريف المسابقة</p>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className={`${ic} min-h-[120px] resize-none`}
            placeholder="اكتب وصف المسابقة هنا..."
          />
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 tap-scale"
          style={{ background: saved ? '#046B67' : 'hsl(var(--primary))' }}>
          <Save className="w-4 h-4" />
          {saving ? 'جاري الحفظ...' : saved ? '✅ تم الحفظ' : 'حفظ التغييرات'}
        </button>
      </div>
    </div>
  );
}