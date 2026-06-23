/**
 * Badge sharing — pure Canvas API, no html2canvas dependency.
 * Works on iOS Safari, Android Chrome, and desktop.
 */
import { useRef, useState, useCallback } from 'react';

const SIZE = 600;
const RADIUS = 40;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function loadImg(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src.includes('?') ? src : src + '?_t=' + Date.now();
  });
}

async function buildCanvas(badge, userName, cardTemplateUrl) {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  // ── Clip to rounded rect ──
  roundRect(ctx, 0, 0, SIZE, SIZE, RADIUS);
  ctx.save();
  ctx.clip();

  // ── Background ──
  if (cardTemplateUrl) {
    const bgImg = await loadImg(cardTemplateUrl);
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, SIZE, SIZE);
    } else {
      drawGradient(ctx, badge);
    }
  } else {
    drawGradient(ctx, badge);
  }

  // Dark overlay
  ctx.fillStyle = 'rgba(0,0,0,0.30)';
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.restore();

  // ── Text & icon (no clip needed) ──
  const font = "'Rubik','Helvetica Neue',Arial,sans-serif";
  let y = 80;

  // Username
  ctx.save();
  ctx.font = `900 32px ${font}`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillText(userName || '', SIZE / 2, y);
  ctx.restore();
  y += 42;

  // Subtitle
  ctx.save();
  ctx.font = `400 18px ${font}`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.textAlign = 'center';
  ctx.fillText('حصلت على شارة', SIZE / 2, y);
  ctx.restore();
  y += 36;

  // Badge icon 240×240
  const iconSize = 240;
  const iconX = (SIZE - iconSize) / 2;
  if (badge.badge_icon_url) {
    const iconImg = await loadImg(badge.badge_icon_url);
    if (iconImg) {
      ctx.drawImage(iconImg, iconX, y, iconSize, iconSize);
    } else {
      drawIconFallback(ctx, badge, iconX, y, iconSize);
    }
  } else {
    drawIconFallback(ctx, badge, iconX, y, iconSize);
  }
  y += iconSize + 26;

  // Badge name
  ctx.save();
  ctx.font = `900 32px ${font}`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillText(badge.badge_name || '', SIZE / 2, y);
  ctx.restore();
  y += 44;

  // Description (word wrap)
  if (badge.badge_description) {
    ctx.save();
    ctx.font = `400 18px ${font}`;
    ctx.fillStyle = 'rgba(255,255,255,0.80)';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    const maxW = SIZE - 100;
    const words = badge.badge_description.split(' ');
    let line = '';
    const lines = [];
    for (const w of words) {
      const test = line ? w + ' ' + line : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);
    for (const l of lines) { ctx.fillText(l, SIZE / 2, y); y += 26; }
    ctx.restore();
  }

  return canvas;
}

function drawGradient(ctx, badge) {
  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, badge.badge_color || '#046B67');
  grad.addColorStop(1, '#034b48');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function drawIconFallback(ctx, badge, x, y, size) {
  ctx.save();
  roundRect(ctx, x, y, size, size, 32);
  ctx.fillStyle = badge.badge_color || '#046B67';
  ctx.fill();
  ctx.font = `${size * 0.5}px serif`;
  ctx.textAlign = 'center';
  ctx.fillText('🏅', x + size / 2, y + size * 0.65);
  ctx.restore();
}

function canvasToBlob(canvas) {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useShareBadge() {
  const cardRef = useRef(null);        // kept for API compat
  const [sharing, setSharing] = useState(false);

  const prepareCard = useCallback(() => {}, []);   // no-op, kept for compat

  const shareCard = useCallback(async (badgeName, userName, badge, cardTemplateUrl) => {
    // Guard: if already sharing, don't fire again
    setSharing(true);
    try {
      const canvas = await buildCanvas(badge, userName, cardTemplateUrl);
      const blob = await canvasToBlob(canvas);
      if (!blob) throw new Error('canvas blob is null');

      const file = new File([blob], `badge-${badgeName}.png`, { type: 'image/png' });
      const shareText = `🏆 حصلت على شارة "${badgeName}" من مسابقة أنس الرمضانية! 🎉`;

      if (navigator.share) {
        const canShareFile = navigator.canShare?.({ files: [file] });
        await navigator.share(
          canShareFile
            ? { files: [file], title: shareText, text: shareText }
            : { title: shareText, text: shareText }
        ).catch(() => {/* user cancelled */});
      } else {
        // Desktop fallback — download image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `badge-${badgeName}.png`; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err) {
      console.warn('[useShareBadge]', err);
    } finally {
      setSharing(false);
    }
  }, []);

  return { cardRef, sharing, prepareCard, shareCard };
}