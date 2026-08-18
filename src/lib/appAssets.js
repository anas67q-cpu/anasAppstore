// Fixed app assets — admin-set images persisted as code constants.
// These act as permanent defaults so images always show even if DB records lose their values.
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
const _allAssetUrls = Object.values(APP_ASSETS).filter(Boolean);
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