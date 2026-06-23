/**
 * Draws the badge card directly on Canvas (no html2canvas DOM capture).
 * This is 10-20x faster on iOS compared to html2canvas.
 *
 * Call prepareCard(badge, userName, cardTemplateUrl) after mount.
 * Then shareCard(badgeName, userName) when the button is pressed.
 */
import { useRef, useState, useCallback } from 'react';

const SIZE = 800;
const RADIUS = 48;

function roundRect(ctx, x, y, w, h, r) {
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

async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function drawCard(badge, userName, cardTemplateUrl) {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  // Clip to rounded rect
  roundRect(ctx, 0, 0, SIZE, SIZE, RADIUS);
  ctx.save();
  ctx.clip();

  // Background
  if (cardTemplateUrl) {
    try {
      const bgImg = await loadImage(cardTemplateUrl);
      ctx.drawImage(bgImg, 0, 0, SIZE, SIZE);
    } catch {
      // fallback gradient
      const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
      grad.addColorStop(0, badge.badge_color || '#046B67');
      grad.addColorStop(1, '#034b48');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, SIZE, SIZE);
    }
  } else {
    const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    grad.addColorStop(0, badge.badge_color || '#046B67');
    grad.addColorStop(1, '#034b48');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, SIZE, SIZE);
    // dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, SIZE, SIZE);
  }

  // Layout: center column
  let y = 90;

  // Font setup (Rubik may not render in canvas, system Arabic font used as fallback)
  const fontStack = "'Rubik', 'Helvetica Neue', Arial, sans-serif";

  // Username
  ctx.save();
  ctx.font = `900 38px ${fontStack}`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillText(userName || '', SIZE / 2, y);
  ctx.restore();
  y += 50;

  // Subtitle
  ctx.save();
  ctx.font = `400 22px ${fontStack}`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.textAlign = 'center';
  ctx.fillText('حصلت على شارة', SIZE / 2, y);
  ctx.restore();
  y += 50;

  // Badge icon (320x320)
  const iconSize = 320;
  const iconX = (SIZE - iconSize) / 2;
  if (badge.badge_icon_url) {
    try {
      const iconImg = await loadImage(badge.badge_icon_url);
      ctx.drawImage(iconImg, iconX, y, iconSize, iconSize);
    } catch {
      // fallback colored square
      ctx.fillStyle = badge.badge_color || '#046B67';
      ctx.fillRect(iconX, y, iconSize, iconSize);
      ctx.font = `${iconSize * 0.5}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🏅', SIZE / 2, y + iconSize * 0.75);
    }
  } else {
    ctx.fillStyle = badge.badge_color || '#046B67';
    roundRect(ctx, iconX, y, iconSize, iconSize, 48);
    ctx.fill();
    ctx.font = `${iconSize * 0.5}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🏅', SIZE / 2, y + iconSize * 0.75);
  }
  y += iconSize + 30;

  // Badge name
  ctx.save();
  ctx.font = `900 38px ${fontStack}`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.direction = 'rtl';
  ctx.fillText(badge.badge_name || '', SIZE / 2, y);
  ctx.restore();
  y += 52;

  // Badge description (word-wrap)
  if (badge.badge_description) {
    ctx.save();
    ctx.font = `400 20px ${fontStack}`;
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
  const cardRef = useRef(null); // kept for API compatibility (not used for rendering)
  const blobRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  const prepareCard = useCallback(async (badge, userName, cardTemplateUrl) => {
    if (!badge) return;
    try {
      const canvas = await drawCard(badge, userName, cardTemplateUrl);
      canvas.toBlob(blob => {
        if (blob) blobRef.current = blob;
      }, 'image/png', 1.0);
    } catch {}
  }, []);

  const shareCard = useCallback(async (badgeName, userName, badge, cardTemplateUrl) => {
    setSharing(true);
    let blob = blobRef.current;

    if (!blob && badge) {
      try {
        const canvas = await drawCard(badge, userName, cardTemplateUrl);
        blob = await new Promise(res => canvas.toBlob(res, 'image/png', 1.0));
      } catch {}
    }

    if (!blob) { setSharing(false); return; }

    const file = new File([blob], `badge-${badgeName}.png`, { type: 'image/png' });
    const shareText = `🏆 حصلت على شارة "${badgeName}" من مسابقة أنس الرمضانية! 🎉`;

    if (navigator.share) {
      const shareData = navigator.canShare && navigator.canShare({ files: [file] })
        ? { files: [file], title: shareText, text: shareText }
        : { title: shareText, text: shareText };
      await navigator.share(shareData).catch(() => {});
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `badge-${badgeName}.png`; a.click();
      URL.revokeObjectURL(url);
    }
    setSharing(false);
  }, []);

  return { cardRef, sharing, prepareCard, shareCard };
}