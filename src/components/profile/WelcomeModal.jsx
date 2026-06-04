import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';

const ANIMATION_URL = 'https://media.base44.com/files/public/69daa39f99dd53afa074a17a/c9b682c23_54d36c2a-1186-11ee-9a7c-63ef24e83d34.json';

// Pre-fetch animation data as soon as module loads
let cachedAnimation = null;
const animationPromise = fetch(ANIMATION_URL)
  .then(r => r.json())
  .then(data => { cachedAnimation = data; return data; })
  .catch(() => null);

export default function WelcomeModal({ userName, show, onClose }) {
  const [animationData, setAnimationData] = useState(cachedAnimation);

  useEffect(() => {
    if (!cachedAnimation) {
      animationPromise.then(data => setAnimationData(data));
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 320 }}
            className="w-full max-w-sm mx-4 rounded-3xl text-center overflow-hidden"
            style={{ background: 'hsl(var(--card))' }}
          >
            {/* Animation */}
            {animationData && (
              <div className="w-48 h-48 mx-auto mt-6">
                <Lottie
                  animationData={animationData}
                  loop={true}
                  autoplay={true}
                  style={{ width: '100%', height: '100%' }}
                  rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
                />
              </div>
            )}

            <div className="px-8 pb-8 pt-4">
              <h2 className="text-2xl font-black text-foreground mb-3">
                أهلاً بك يا {userName}! 👋
              </h2>

              <p className="text-xl font-black text-primary mb-8">
                الشهر عليكم مبارك 🌙
              </p>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl font-bold text-white tap-scale"
                style={{ background: 'hsl(var(--primary))' }}
              >
                ابدأ المسابقة
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}