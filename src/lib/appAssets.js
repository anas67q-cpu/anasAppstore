// Fixed app assets — admin-set images persisted as code constants.
// These act as permanent defaults so images always show even if DB records lose their values.
// DB values override these defaults whenever present.

// Common file-host prefix for competition assets hosted on Base44 storage.
const FILE_PREFIX =
  "https://base44.app/api/apps/69daa39f99dd53afa074a17a/files/mp/public/69daa39f99dd53afa074a17a/";

export const APP_ASSETS = {
  competition_logo:
    "https://base44.app/api/apps/69daa39f99dd53afa074a17a/files/mp/public/69daa39f99dd53afa074a17a/f794598b0_GreenandBlackPlayfulFrogCostumeAvatar.png",
  competition_rules_url:
    "https://base44.app/api/apps/69daa39f99dd53afa074a17a/files/mp/public/69daa39f99dd53afa074a17a/970c0aebb_--.pdf",
  competition_description:
    "مسابقة أنس الرمضانية في نسختها التاسعة لعام ١٤٤٨هـ هي مسابقة دينية رمضانية تُقام خلال شهر رمضان، تقوم على طرح سؤال كل يوم حتى نهاية الشهر، بأسلوب تنافسي بسيط وممتع بين المشاركين.",
  competition_start_date: "2027-02-08T19:38",
  leaderboard_shield:
    "https://base44.app/api/apps/69daa39f99dd53afa074a17a/files/mp/public/69daa39f99dd53afa074a17a/bdb572382_.png",
  streak_logo:
    "https://base44.app/api/apps/69daa39f99dd53afa074a17a/files/mp/public/69daa39f99dd53afa074a17a/383cf2c0f_GreenandBlackPlayfulFrogCostumeAvatar.png",
  quick_challenge_image:
    "https://base44.app/api/apps/69daa39f99dd53afa074a17a/files/mp/public/69daa39f99dd53afa074a17a/a0df8df6e_.png",
  card_template:
    "https://base44.app/api/apps/69daa39f99dd53afa074a17a/files/mp/public/69daa39f99dd53afa074a17a/65996b9bb_GreenandBlackPlayfulFrogCostumeAvatar.png",
};

// Persistent defaults for badge icon images, keyed by badge name.
// Applies to both Badge records (icon_url) and UserBadge records (badge_icon_url).
export const BADGE_ICONS = {
  "هيمنة": "https://media.base44.com/images/public/69daa39f99dd53afa074a17a/b03848f6d_GreenandBlackPlayfulFrogCostumeAvatar.png",
  "حامل اللقب": FILE_PREFIX + "48b76a083_GreenandBlackPlayfulFrogCostumeAvatar.png",
  "بطل الصدارة": FILE_PREFIX + "cbc3eb603_GreenandBlackPlayfulFrogCostumeAvatar.png",
  "نجم النصف الأول": "https://media.base44.com/images/public/69daa39f99dd53afa074a17a/052e2865d_GreenandBlackPlayfulFrogCostumeAvatar.png",
  "بطل السلسلة": FILE_PREFIX + "3c99a195b_GreenandBlackPlayfulFrogCostumeAvatar.png",
  "الرقم القياسي": FILE_PREFIX + "f417f62b7_GreenandBlackPlayfulFrogCostumeAvatar.png",
  "الخطأ الأول": FILE_PREFIX + "f5fc4c6a0_GreenandBlackPlayfulFrogCostumeAvatar.png",
  "الإجابة الأولى بالمسابقة": FILE_PREFIX + "20ab60316_GreenandBlackPlayfulFrogCostumeAvatar.png",
};

// Fields that should fall back to fixed assets when the DB value is empty.
export const ASSET_FIELDS = [
  "competition_logo",
  "competition_rules_url",
  "competition_description",
  "competition_start_date",
  "leaderboard_shield",
  "streak_logo",
  "quick_challenge_image",
  "card_template",
];

// Kick off preloading of all fixed asset URLs immediately at module import
// (happens at app startup, before any UI renders) so images load from cache
// instantly and their HTTP fetch begins as early as possible.
const _allAssetUrls = [...Object.values(APP_ASSETS), ...Object.values(BADGE_ICONS)].filter(Boolean);
// Fast path: prime browser HTTP cache right away (no await needed).
_allAssetUrls.forEach((url) => { const img = new Image(); img.src = url; });
// Persistent path: store in Cache Storage API for instant future loads.
import('@/lib/imageCache').then(({ preloadImages }) => preloadImages(_allAssetUrls)).catch(() => {});

// Apply fixed-asset fallbacks to a settings record (mutates a copy).
export function withAssetDefaults(record) {
  if (!record) return record;
  const merged = { ...record };
  ASSET_FIELDS.forEach((f) => {
    if (!merged[f] && APP_ASSETS[f]) merged[f] = APP_ASSETS[f];
  });
  return merged;
}

// Apply badge icon fallbacks to a Badge or UserBadge record (DB value wins when present).
// Badge records use { name, icon_url }; UserBadge records use { badge_name, badge_icon_url }.
export function withBadgeIconDefaults(record) {
  if (!record) return record;
  const merged = { ...record };
  const name = merged.name || merged.badge_name;
  if (!name) return merged;
  if (!merged.icon_url && BADGE_ICONS[name]) merged.icon_url = BADGE_ICONS[name];
  if (!merged.badge_icon_url && BADGE_ICONS[name]) merged.badge_icon_url = BADGE_ICONS[name];
  return merged;
}