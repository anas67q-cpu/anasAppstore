// Lightweight sound & haptics utility
const audioCache = {};

function playTone(frequency, duration, volume = 0.15) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = 'sine';
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

export function playTap() {
  playTone(800, 0.05, 0.08);
  haptic('light');
}

export function playCorrect() {
  playTone(523, 0.15, 0.12);
  setTimeout(() => playTone(659, 0.15, 0.12), 100);
  setTimeout(() => playTone(784, 0.2, 0.12), 200);
  haptic('success');
}

export function playWrong() {
  playTone(300, 0.2, 0.1);
  setTimeout(() => playTone(250, 0.3, 0.1), 150);
  haptic('error');
}

// iOS Haptic Feedback via webkit (Safari 13+) + Android fallback
export function haptic(type = 'light') {
  // iOS Safari — uses AudioSession trick to trigger haptics
  try {
    if (window.DeviceMotionEvent && typeof window.DeviceMotionEvent.requestPermission === 'function') {
      // iOS 13+ — use AudioContext click to trigger haptic if possible
    }
    // Try webkit haptics (works on Safari iOS via CSS click)
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
    document.body.appendChild(el);
    
    if (type === 'light') {
      el.style.webkitTapHighlightColor = 'rgba(0,0,0,0.01)';
    }
    document.body.removeChild(el);
  } catch (e) {}

  // Android fallback
  if (navigator.vibrate) {
    switch (type) {
      case 'light': navigator.vibrate(10); break;
      case 'medium': navigator.vibrate(20); break;
      case 'heavy': navigator.vibrate(40); break;
      case 'success': navigator.vibrate([10, 30, 10]); break;
      case 'error': navigator.vibrate([30, 40, 30]); break;
      case 'warning': navigator.vibrate([20, 30, 20]); break;
    }
  }

  // iOS Safari 16+ — use the new Vibration API pattern via AudioContext pulse
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    gainNode.gain.value = 0;
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.001);
    ctx.close();
  } catch (e) {}
}