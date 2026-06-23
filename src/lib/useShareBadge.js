/**
 * Draws the badge card directly on Canvas then shares/downloads it.
 * Call prepareCard(badge, userName, cardTemplateUrl) after mount (background prep).
 * Then shareCard(badgeName, userName, badge, cardTemplateUrl) on button press.
 */
import { useRef, useState, useCallback } from 'react';

const SIZE = 800;
const RADIUS = 48;

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    // force cache bust only for non-data URLs
    img.src = src.startsWith('data:') ? src : src + (src.includes('?') ? '&' : '?') + '_cb=' + Date.now();
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));
}

async function drawCard(badge, userName, cardTemplateUrl) {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  // Clip to rounded rect
  roundRectPath(ctx, 0, 0, SIZE, SIZE, RADIUS);
  ctx.save();
  ctx.clip();

  // --- Background ---
  if (cardTemplateUrl) {
    try {
      const bgImg = await loadImage(cardTemplateUrl);
      ctx.drawImage(bgImg, 0, 0, SIZE, SIZE);
    } catch {
      // fallback gradient if image fails
      const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
      grad.addColorStop(0, badge.badge_color || '#046B67');
      grad.addColorStop(1, '#034b48');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(0, 0, SIZE, SIZE);
    }
  } else {
    const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    grad.addColorStop(0, badge.badge_color || '#046B67');
    grad.addColorStop(1, '#034b48');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, SIZE, SIZE);
  }

  // --- Text layout (RTL centered column) ---
  const font = "'Rubik', 'Helvetica Neue', Arial, sans-serif";
  let y = 100;

  // Username
  ctx.save();
  ctx.font = `900 38px ${font}`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillText(userName || '', SIZE / 2, y);
  ctx.restore();
  y += 48;

  // Subtitle
  ctx.save();
  ctx.font = `400 22px ${font}`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.textAlign = 'center';
  ctx.fillText('حصلت على شارة', SIZE / 2, y);
  ctx.restore();
  y += 44;

  // Badge icon 320x320
  const iconSize = 320;
  const iconX = (SIZE - iconSize) / 2;
  if (badge.badge_icon_url) {
    try {
      const iconImg = await loadImage(badge.badge_icon_url);
      ctx.drawImage(iconImg, iconX, y, iconSize, iconSize);
    } catch {
      ctx.fillStyle = badge.badge_color || '#046B67';
      roundRectPath(ctx, iconX, y, iconSize, iconSize, 48);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = badge.badge_color || '#046B67';
    roundRectPath(ctx, iconX, y, iconSize, iconSize, 48);
    ctx.fill();
  }
  y += iconSize + 30;

  // Badge name
  ctx.save();
  ctx.font = `900 38px ${font}`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillText(badge.badge_name || '', SIZE / 2, y);
  ctx.restore();
  y += 52;

  // Badge description (word-wrap, RTL)
  if (badge.badge_description) {
    ctx.save();
    ctx.font = `400 20px ${font}`;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    const maxWidth = SIZE - 120;
    const words = badge.badge_description.split(' ');
    let line = '';
    const lines = [];
    for (const word of words) {
      const test = line ? word + ' ' + line : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    for (const l of lines) {
      ctx.fillText(l, SIZE / 2, y);
      y += 28;
    }
    ctx.restore();
  }

  ctx.restore(); // end clip
  return canvas;
}

export function useShareBadge() {
  const cardRef = useRef(null); // kept for API compatibility
  const blobRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  const prepareCard = useCallback(async (badge, userName, cardTemplateUrl) => {
    if (!badge) return;
    try {
      const canvas = await drawCard(badge, userName, cardTemplateUrl);
      const blob = await canvasToBlob(canvas);
      if (blob) blobRef.current = blob;
    } catch (e) {
      console.warn('[useShareBadge] prepareCard failed:', e);
    }
  }, []);

  const shareCard = useCallback(async (badgeName, userName, badge, cardTemplateUrl) => {
    setSharing(true);
    try {
      let blob = blobRef.current;
      if (!blob) {
        const canvas = await drawCard(badge, userName, cardTemplateUrl);
        blob = await canvasToBlob(canvas);
      }
      if (!blob) return;

      const file = new File([blob], `badge-${badgeName}.png`, { type: 'image/png' });
      const shareText = `🏆 حصلت على شارة "${badgeName}" من مسابقة أنس الرمضانية! 🎉`;

      if (navigator.share) {
        const canShareFile = navigator.canShare?.({ files: [file] });
        await navigator.share(
          canShareFile
            ? { files: [file], title: shareText, text: shareText }
            : { title: shareText, text: shareText }
        ).catch(() => {});
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `badge-${badgeName}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.warn('[useShareBadge] shareCard failed:', e);
    } finally {
      setSharing(false);
    }
  }, []);

  return { cardRef, sharing, prepareCard, shareCard };
}