import Lottie from 'lottie-react';
import { useState, useEffect } from 'react';

const FIRE_URL = 'https://media.base44.com/files/public/69daa39f99dd53afa074a17a/916375250_Fire.json';

// Cache: _base = raw JSON, original/blue/purple = tinted versions
const cache = {};

function tintLottie(data, rgb) {
  const clone = JSON.parse(JSON.stringify(data));
  function walk(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) { obj.forEach(walk); return; }
    if ((obj.ty === 'gf' || obj.ty === 'gs') && obj.g?.k?.k) {
      const kk = obj.g.k.k;
      for (let i = 0; i < kk.length; i += 4) {
        if (i + 3 < kk.length) {
          kk[i + 1] = rgb[0];
          kk[i + 2] = rgb[1];
          kk[i + 3] = rgb[2];
        }
      }
    }
    Object.values(obj).forEach(walk);
  }
  walk(clone);
  return clone;
}

const BLUE_RGB   = [0.18, 0.55, 1.0];
const PURPLE_RGB = [0.58, 0.18, 0.9];

function getColorKey(streak) {
  if (streak >= 10) return 'purple';
  if (streak >= 5)  return 'blue';
  return 'original';
}

export default function StreakFlame({ streak, size = 28 }) {
  const [animData, setAnimData] = useState(() => {
    const key = getColorKey(streak || 0);
    return cache[key] || null;
  });

  useEffect(() => {
    if (!streak || streak <= 0) return;
    const colorKey = getColorKey(streak);
    if (cache[colorKey]) { setAnimData(cache[colorKey]); return; }

    (async () => {
      let base = cache['_base'];
      if (!base) {
        const res = await fetch(FIRE_URL);
        base = await res.json();
        cache['_base'] = base;
      }
      const tinted = colorKey === 'original'
        ? base
        : tintLottie(base, colorKey === 'blue' ? BLUE_RGB : PURPLE_RGB);
      cache[colorKey] = tinted;
      setAnimData(tinted);
    })();
  }, [streak]);

  if (!streak || streak <= 0) return null;

  return (
    <div style={{ width: size, height: size, display: 'inline-flex', flexShrink: 0 }}>
      {animData && (
        <Lottie animationData={animData} loop autoplay style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  );
}