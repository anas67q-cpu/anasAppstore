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

export function haptic(type = 'light') {
  if (!navigator.vibrate) return;
  switch (type) {
    case 'light': navigator.vibrate(10); break;
    case 'success': navigator.vibrate([10, 50, 10]); break;
    case 'error': navigator.vibrate([30, 50, 30]); break;
  }
}