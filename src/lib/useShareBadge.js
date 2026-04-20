/**
 * Pre-renders a badge card into a Blob ahead of time so sharing is instant.
 * Call prepareCard() after mount, then shareCard() when button is pressed.
 */
import { useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';

export function useShareBadge() {
  const cardRef = useRef(null);
  const blobRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [sharing, setSharing] = useState(false);

  const prepareCard = useCallback(async () => {
    if (!cardRef.current) return;
    // Render off-screen card to blob in background
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, useCORS: true, allowTaint: true, backgroundColor: null, imageTimeout: 10000,
      });
      canvas.toBlob(blob => {
        if (blob) { blobRef.current = blob; setReady(true); }
      }, 'image/png', 1.0);
    } catch {}
  }, []);

  const shareCard = useCallback(async (badgeName, userName) => {
    setSharing(true);
    let blob = blobRef.current;
    // If not ready yet (rare), render now
    if (!blob && cardRef.current) {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, useCORS: true, allowTaint: true, backgroundColor: null, imageTimeout: 10000,
      });
      blob = await new Promise(res => canvas.toBlob(res, 'image/png', 1.0));
    }
    if (!blob) { setSharing(false); return; }

    const file = new File([blob], `badge-${badgeName}.png`, { type: 'image/png' });
    const shareText = `🏆 حصلت على شارة "${badgeName}" من مسابقة أنس الرمضانية! 🎉`;

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: shareText, text: shareText }).catch(() => {});
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `badge-${badgeName}.png`; a.click();
      URL.revokeObjectURL(url);
    }
    setSharing(false);
  }, []);

  return { cardRef, ready, sharing, prepareCard, shareCard };
}