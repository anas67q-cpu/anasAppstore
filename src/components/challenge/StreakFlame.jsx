import Lottie from 'lottie-react';
import { useState, useEffect } from 'react';

const FIRE_URL = 'https://media.base44.com/files/public/69daa39f99dd53afa074a17a/916375250_Fire.json';

// Cache
const cache = {};

// Tint each gradient layer with a different shade from the palette
// Each layer gets progressively lighter to simulate multi-layer fire look
function tintLottie(data, layerColors) {
  const clone = JSON.parse(JSON.stringify(data));
  let layerIndex = 0;

  function walkShapes(shapes) {
    if (!Array.isArray(shapes)) return;
    shapes.forEach(shape => {
      if (shape.ty === 'gr') {
        // Each group is a flame layer
        const color = layerColors[Math.min(layerIndex, layerColors.length - 1)];
        layerIndex++;
        shape.it?.forEach(item => {
          if ((item.ty === 'gf' || item.ty === 'gs') && item.g?.k?.k) {
            const kk = item.g.k.k;
            for (let i = 0; i < kk.length; i += 4) {
              if (i + 3 < kk.length) {
                kk[i + 1] = color[0];
                kk[i + 2] = color[1];
                kk[i + 3] = color[2];
              }
            }
          }
          // Recurse into nested groups
          if (item.ty === 'gr') walkShapes([item]);
        });
      }
    });
  }

  function walkLayers(layers) {
    if (!Array.isArray(layers)) return;
    layers.forEach(layer => {
      layerIndex = 0;
      if (layer.shapes) walkShapes(layer.shapes);
    });
  }

  // Walk top-level layers and nested comps
  walkLayers(clone.layers);
  clone.assets?.forEach(asset => {
    if (asset.layers) walkLayers(asset.layers);
  });

  return clone;
}

function getColorKey(streak) {
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
      cache[colorKey] = base;
      setAnimData(base);
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