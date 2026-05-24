import { useRef, useState, useEffect } from 'react';

/**
 * LazyImage — loads image only when it enters the viewport (IntersectionObserver).
 * Falls back gracefully if the browser doesn't support IntersectionObserver.
 *
 * Props mirror a normal <img> tag plus:
 *   - placeholder: content shown while loading (defaults to a shimmer div)
 *   - rootMargin: how far before entering viewport to start loading (default "200px")
 */
export default function LazyImage({ src, alt = '', className = '', placeholder, rootMargin = '200px', ...props }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!src) return;
    // If IntersectionObserver not available (old WebView), load immediately
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [src, rootMargin]);

  return (
    <div ref={ref} className={className} style={{ position: 'relative', overflow: 'hidden', ...props.style }}>
      {/* Shimmer placeholder */}
      {!loaded && (
        placeholder || (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ background: 'hsl(var(--muted))' }}
          />
        )
      )}
      {visible && src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={className}
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            ...props.imgStyle,
          }}
          {...props}
        />
      )}
    </div>
  );
}