// Simple Hijri date converter (Um Al-Qura approximation)
const HIJRI_MONTHS = [
  'محرم','صفر','ربيع الأول','ربيع الثاني',
  'جمادى الأولى','جمادى الثانية','رجب','شعبان',
  'رمضان','شوال','ذو القعدة','ذو الحجة'
];

export function toHijri(date) {
  // Use Intl API for accurate Um Al-Qura calendar
  try {
    const d = new Date(date);
    // Adjust to Makkah time (UTC+3)
    const makkah = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'long', year: 'numeric',
      timeZone: 'Asia/Riyadh'
    });
    return formatter.format(makkah);
  } catch {
    return '';
  }
}

export function getDayNameAr(date) {
  const d = new Date(date);
  return d.toLocaleDateString('ar-SA', { weekday: 'long', timeZone: 'Asia/Riyadh' });
}