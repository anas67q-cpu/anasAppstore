/**
 * Badge sharing using html2canvas — renders a hidden DOM card → PNG → share/download.
 */
import { useRef, useState, useCallback } from 'react';

export function useShareBadge() {
  const cardRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  // prepareCard is a no-op kept for API compatibility
  const prepareCard = useCallback(() => {}, []);

  const shareCard = useCallback(async (badgeName, userName, badge, cardTemplateUrl) => {
    if (sharing) return;
    setSharing(true);
    try {
      const html2canvas = (await import('html2canvas')).default;

      // Build a hidden card DOM element
      const card = document.createElement('div');
      card.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 400px;
        height: 400px;
        border-radius: 32px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        font-family: 'Rubik', 'Helvetica Neue', Arial, sans-serif;
        direction: rtl;
        padding: 32px;
        box-sizing: border-box;
        background: ${cardTemplateUrl
          ? `url(${cardTemplateUrl}) center/cover no-repeat`
          : `linear-gradient(135deg, ${badge.badge_color || '#046B67'} 0%, #034b48 100%)`};
      `;

      // Dark overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: absolute; inset: 0;
        background: rgba(0,0,0,0.28);
      `;
      card.appendChild(overlay);

      // Content wrapper
      const content = document.createElement('div');
      content.style.cssText = `
        position: relative; z-index: 1;
        display: flex; flex-direction: column;
        align-items: center; gap: 10px; width: 100%;
      `;

      // Username
      const nameEl = document.createElement('div');
      nameEl.textContent = userName || '';
      nameEl.style.cssText = 'color:#fff;font-size:22px;font-weight:900;text-align:center;';
      content.appendChild(nameEl);

      // Subtitle
      const subEl = document.createElement('div');
      subEl.textContent = 'حصلت على شارة';
      subEl.style.cssText = 'color:rgba(255,255,255,0.75);font-size:14px;text-align:center;';
      content.appendChild(subEl);

      // Badge icon
      if (badge.badge_icon_url) {
        const img = document.createElement('img');
        img.src = badge.badge_icon_url;
        img.crossOrigin = 'anonymous';
        img.style.cssText = 'width:120px;height:120px;object-fit:cover;border-radius:16px;';
        content.appendChild(img);
      } else {
        const iconBox = document.createElement('div');
        iconBox.style.cssText = `
          width:120px;height:120px;border-radius:20px;
          background:${badge.badge_color || '#046B67'};
          display:flex;align-items:center;justify-content:center;
          font-size:60px;
        `;
        iconBox.textContent = '🏅';
        content.appendChild(iconBox);
      }

      // Badge name
      const bNameEl = document.createElement('div');
      bNameEl.textContent = badge.badge_name || '';
      bNameEl.style.cssText = 'color:#fff;font-size:20px;font-weight:900;text-align:center;';
      content.appendChild(bNameEl);

      // Description
      if (badge.badge_description) {
        const descEl = document.createElement('div');
        descEl.textContent = badge.badge_description;
        descEl.style.cssText = 'color:rgba(255,255,255,0.8);font-size:12px;text-align:center;line-height:1.5;';
        content.appendChild(descEl);
      }

      card.appendChild(content);
      document.body.appendChild(card);

      // Wait for images to load
      await new Promise(r => setTimeout(r, 400));

      const canvas = await html2canvas(card, {
        useCORS: true,
        allowTaint: false,
        scale: 2,
        width: 400,
        height: 400,
        backgroundColor: null,
      });

      document.body.removeChild(card);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
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
      console.warn('[useShareBadge] failed:', e);
    } finally {
      setSharing(false);
    }
  }, [sharing]);

  return { cardRef, sharing, prepareCard, shareCard };
}