import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// Noto Emoji - animated trophy/party lottie via dotlottie CDN
const NOTO_TROPHY_URL = 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f3c6/lottie.json';
const NOTO_ROCKET_URL = 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/lottie.json';
const NOTO_STAR_URL   = 'https://fonts.gstatic.com/s/e/notoemoji/latest/2b50/lottie.json';
const NOTO_FIRE_URL   = 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/lottie.json';
const NOTO_PARTY_URL  = 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/lottie.json';

// Simple emoji img using Noto Emoji Google CDN (high-res PNG)
function NotoEmoji({ code, size = 80 }) {
  // code = unicode codepoint hex e.g. '1f3c6'
  return (
    <img
      src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${code}/emoji.svg`}
      alt=""
      width={size}
      height={size}
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
}

// Animated lottie emoji from Noto
function LottieEmoji({ url, size = 120 }) {
  const ref = useRef(null);
  const [animData, setAnimData] = useState(null);
  const [Lottie, setLottie] = useState(null);

  useEffect(() => {
    // Dynamically load lottie
    import('lottie-react').then(m => setLottie(() => m.default));
  }, []);

  useEffect(() => {
    fetch(url).then(r => r.json()).then(setAnimData).catch(() => {});
  }, [url]);

  if (!Lottie || !animData) return null;
  return <Lottie animationData={animData} loop autoplay style={{ width: size, height: size }} />;
}

function pad(n) { return String(n).padStart(2, '0'); }

function getCountdown(targetDate) {
  const now = Date.now();
  const target = new Date(targetDate).getTime();
  const diff = target - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs, total: diff };
}

function Confetti() {
  useEffect(() => {
    const end = Date.now() + 3500;
    const colors = ['#046B67', '#f59e0b', '#fff', '#6366f1', '#ec4899'];
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);
  return null;
}

// Paper confetti pieces overlay
function PaperConfettiOverlay() {
  const pieces = Array.from({ length: 18 }, (_, i) => i);
  const shapes = ['rounded-sm', 'rounded-full', 'rotate-45'];
  const colors = ['#046B67', '#f59e0b', '#6366f1', '#ec4899', '#10b981', '#fff'];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map(i => {
        const color = colors[i % colors.length];
        const shape = shapes[i % shapes.length];
        const left = `${(i * 23 + 7) % 100}%`;
        const delay = (i * 0.18) % 1.5;
        const dur = 2.2 + (i % 4) * 0.4;
        const size = 8 + (i % 3) * 6;
        return (
          <motion.div
            key={i}
            initial={{ y: '-10%', x: 0, opacity: 1, rotate: 0 }}
            animate={{ y: '110vh', x: [(i%2===0?30:-30)], opacity: [1, 1, 0], rotate: [0, 360 * (i%2===0?1:-1)] }}
            transition={{ duration: dur, delay, ease: 'easeIn', times: [0, 0.8, 1] }}
            style={{
              position: 'absolute',
              top: '-5%',
              left,
              width: size,
              height: size * (i%2===0 ? 1.6 : 1),
              background: color,
              opacity: 0.85,
            }}
            className={shape}
          />
        );
      })}
    </div>
  );
}

export default function CompetitionCountdown({ targetDate, onExpired }) {
  const [countdown, setCountdown] = useState(() => getCountdown(targetDate));
  const [showCelebration, setShowCelebration] = useState(false);
  const [done, setDone] = useState(false);
  const hasExpired = useRef(false);

  useEffect(() => {
    if (!targetDate) { onExpired?.(); return; }
    const iv = setInterval(() => {
      const c = getCountdown(targetDate);
      setCountdown(c);
      if (!c && !hasExpired.current) {
        hasExpired.current = true;
        clearInterval(iv);
        setShowCelebration(true);
        setTimeout(() => {
          setShowCelebration(false);
          setDone(true);
          onExpired?.();
        }, 3800);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [targetDate]);

  if (done) return null;

  const isClose = countdown && countdown.days === 0 && countdown.hours < 2;
  const isVeryClose = countdown && countdown.days === 0 && countdown.hours === 0 && countdown.mins < 10;

  return (
    <>
      <AnimatePresence>
        {showCelebration && (
          <>
            <Confetti />
            <PaperConfettiOverlay />
          </>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface shadow-card overflow-hidden"
      >
        {/* Header gradient */}
        <div
          className="px-6 pt-7 pb-4 text-center space-y-3"
          style={{ background: 'linear-gradient(160deg, hsl(var(--primary)/0.10), hsl(var(--primary)/0.03))' }}
        >
          {/* Noto animated emoji */}
          <div className="flex justify-center">
            {isVeryClose ? (
              <LottieEmoji url={NOTO_FIRE_URL} size={110} />
            ) : isClose ? (
              <LottieEmoji url={NOTO_ROCKET_URL} size={110} />
            ) : (
              <LottieEmoji url={NOTO_TROPHY_URL} size={110} />
            )}
          </div>

          <div>
            <h3 className="text-xl font-black text-foreground">
              {isVeryClose ? '🔥 المسابقة تبدأ الحين!' : isClose ? '🚀 قريباً جداً!' : '🏆 المسابقة قادمة'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isVeryClose ? 'جهّز نفسك، لحظات وتبدأ المسابقة!' : isClose ? 'استعد، الانطلاقة اقتربت!' : 'العداد التنازلي حتى انطلاق التحدي'}
            </p>
          </div>
        </div>

        {/* Countdown units */}
        <div className="px-5 pb-6 pt-2">
          {countdown ? (
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { value: countdown.days, label: 'يوم' },
                { value: countdown.hours, label: 'ساعة' },
                { value: countdown.mins, label: 'دقيقة' },
                { value: countdown.secs, label: 'ثانية' },
              ].map(({ value, label }, i) => (
                <motion.div
                  key={label}
                  className="rounded-2xl text-center py-3 px-1"
                  style={{
                    background: 'hsl(var(--secondary))',
                    border: '1.5px solid hsl(var(--border))',
                  }}
                >
                  <AnimatePresence mode="popLayout">
                    <motion.p
                      key={value}
                      initial={{ y: -12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 12, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-2xl font-black font-mono tabular-nums"
                      style={{ color: 'hsl(var(--primary))' }}
                    >
                      {pad(value)}
                    </motion.p>
                  </AnimatePresence>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{label}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 space-y-2">
              <div className="flex justify-center">
                <LottieEmoji url={NOTO_PARTY_URL} size={90} />
              </div>
              <p className="text-lg font-black" style={{ color: 'hsl(var(--primary))' }}>
                🎉 انطلقت المسابقة!
              </p>
            </div>
          )}

          {/* Stars strip */}
          <div className="flex justify-center gap-1 mt-4">
            {[0,1,2,3,4].map(i => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
              >
                <NotoEmoji code="2b50" size={18} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}