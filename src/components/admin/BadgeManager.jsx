import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, Trash2, Award, Upload, Search, Tag, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BottomSheet from '@/components/BottomSheet';
import NativeSelect from '@/components/ui/NativeSelect';
import { playTap } from '@/lib/sounds';

export default function BadgeManager() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('catalog'); // 'catalog' | 'assign'
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [assignSheet, setAssignSheet] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [b, ub, u] = await Promise.all([
      base44.entities.Badge.list('-created_date', 200),
      base44.entities.UserBadge.list('-created_date', 200),
      base44.entities.UserStats.list('-total_points', 200),
    ]);
    setBadges(b);
    setUserBadges(ub);
    setUsers(u);
    setLoading(false);
  };

  const handleDeleteBadge = async (id) => {
    await base44.entities.Badge.delete(id);
    setBadges(prev => prev.filter(b => b.id !== id));
  };

  const handleDeleteAssignment = async (id) => {
    await base44.entities.UserBadge.delete(id);
    setUserBadges(prev => prev.filter(b => b.id !== id));
  };

  const filteredUB = userBadges.filter(b =>
    (b.user_name || '').includes(search) || (b.user_email || '').includes(search) || (b.badge_name || '').includes(search)
  );

  return (
    <>
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-secondary tap-scale" aria-label="رجوع">
              <ArrowRight className="w-5 h-5 text-foreground" />
            </button>
            <h2 className="text-lg font-bold text-foreground">إدارة الشارات</h2>
          </div>
          <button onClick={() => tab === 'catalog' ? setShowForm(true) : setAssignSheet(true)}
            className="p-2.5 rounded-xl text-white tap-scale"
            style={{ background: 'hsl(var(--primary))' }}>
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-secondary">
          {[{ id: 'catalog', label: 'كتالوج الشارات', icon: Tag }, { id: 'assign', label: 'منح الشارات', icon: Users }].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all tap-scale"
                style={{
                  background: tab === t.id ? 'hsl(var(--card))' : 'transparent',
                  color: tab === t.id ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                  boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
                }}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
          </div>
        ) : tab === 'catalog' ? (
          <div className="space-y-2">
            {badges.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">لا توجد شارات</p>}
            {badges.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="card-surface p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                  style={{ background: b.color || 'hsl(var(--primary))' }}>
                  {b.icon_url ? <img src={b.icon_url} alt="" className="w-full h-full object-cover" />
                    : <Award className="w-6 h-6 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{b.name}</p>
                  {b.description && <p className="text-xs text-muted-foreground truncate">{b.description}</p>}
                </div>
                <button onClick={() => handleDeleteBadge(b.id)} className="p-1.5 rounded-lg hover:bg-secondary tap-scale">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..."
                className="w-full bg-secondary rounded-xl px-3 py-2.5 pr-10 text-sm text-foreground outline-none" />
            </div>
            <div className="space-y-2">
              {filteredUB.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">لا توجد شارات ممنوحة</p>}
              {filteredUB.map((b, i) => (
                <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="card-surface p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{ background: b.badge_color || 'hsl(var(--primary))' }}>
                    {b.badge_icon_url ? <img src={b.badge_icon_url} alt="" className="w-full h-full object-cover" />
                      : <Award className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{b.badge_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{b.user_name || b.user_email}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground">{b.count || 1}×</span>
                  <button onClick={() => handleDeleteAssignment(b.id)} className="p-1.5 rounded-lg hover:bg-secondary tap-scale">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* New Badge Form */}
      <BottomSheet open={showForm} onClose={() => setShowForm(false)} title="شارة جديدة">
        <NewBadgeForm onSaved={() => { setShowForm(false); loadData(); }} />
      </BottomSheet>

      {/* Assign Badge Sheet */}
      <BottomSheet open={assignSheet} onClose={() => setAssignSheet(false)} title="منح شارة">
        <AssignBadgeForm badges={badges} users={users} onSaved={() => { setAssignSheet(false); loadData(); }} />
      </BottomSheet>
    </>
  );
}

function NewBadgeForm({ onSaved }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState('#046B67');
  const [iconUrl, setIconUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [uploadError, setUploadError] = useState('');

  const handleUpload = async (file) => {
    setUploadError('');
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('حجم الصورة كبير جداً (الحد الأقصى 5MB)');
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setIconUrl(file_url);
    } catch (e) {
      setUploadError('فشل رفع الصورة، حاول مرة أخرى');
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await base44.entities.Badge.create({ name, description: desc, icon_url: iconUrl, color });
    setSaving(false);
    onSaved();
  };

  const ic = 'w-full bg-secondary rounded-xl px-3 py-3 text-sm text-foreground outline-none';
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">اسم الشارة</label>
        <input value={name} onChange={e => setName(e.target.value)} className={ic} placeholder="اسم الشارة" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">الوصف</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} className={`${ic} min-h-[60px] resize-none`} placeholder="وصف..." />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">اللون</label>
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-10 rounded-xl border border-border cursor-pointer" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">أيقونة</label>
          <label className="flex items-center justify-center gap-2 h-10 rounded-xl bg-secondary text-sm cursor-pointer tap-scale">
            {uploading ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
              : iconUrl ? '✅ رُفعت' : <><Upload className="w-4 h-4" /> رفع</>}
            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />
          </label>
          {uploadError && <p className="text-xs text-destructive mt-1">{uploadError}</p>}
        </div>
      </div>
      <button onClick={handleSave} disabled={saving || !name.trim()}
        className="w-full py-3.5 rounded-xl text-white font-bold disabled:opacity-50 tap-scale"
        style={{ background: 'hsl(var(--primary))' }}>
        {saving ? 'جاري الإنشاء...' : 'إنشاء الشارة'}
      </button>
    </div>
  );
}

function AssignBadgeForm({ badges, users, onSaved }) {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedUser || !selectedBadge) return;
    setSaving(true);
    const badge = badges.find(b => b.id === selectedBadge);
    const user = users.find(u => u.user_email === selectedUser);
    const existing = await base44.entities.UserBadge.filter({ user_email: selectedUser, badge_name: badge.name });
    if (existing.length > 0) {
      await base44.entities.UserBadge.update(existing[0].id, { count: (existing[0].count || 1) + 1 });
    } else {
      await base44.entities.UserBadge.create({
        user_email: selectedUser, user_name: user?.user_name || '',
        badge_name: badge.name, badge_description: badge.description,
        badge_icon_url: badge.icon_url, badge_color: badge.color, count: 1,
      });
    }
    setSaving(false);
    onSaved();
  };

  const ic = 'w-full bg-secondary rounded-xl px-3 py-3 text-sm text-foreground outline-none';
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">الشارة</label>
        <NativeSelect
          value={selectedBadge}
          onChange={setSelectedBadge}
          options={[{ value: '', label: 'اختر شارة...' }, ...badges.map(b => ({ value: b.id, label: b.name }))]}
          label="الشارة"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">المشترك</label>
        <NativeSelect
          value={selectedUser}
          onChange={setSelectedUser}
          options={[{ value: '', label: 'اختر مشترك...' }, ...users.map(u => ({ value: u.user_email, label: u.user_name || u.user_email }))]}
          label="المشترك"
        />
      </div>
      <button onClick={handleSave} disabled={saving || !selectedUser || !selectedBadge}
        className="w-full py-3.5 rounded-xl text-white font-bold disabled:opacity-50 tap-scale"
        style={{ background: 'hsl(var(--primary))' }}>
        {saving ? 'جاري المنح...' : 'منح الشارة'}
      </button>
    </div>
  );
}