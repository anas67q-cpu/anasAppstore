import { motion } from 'framer-motion';
import { playTap } from '@/lib/sounds';

export default function ChallengeCard({ title, icon: Icon, description, image, onClick, delay = 0 }) {
  const hasImage = !!image;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      onClick={() => { playTap(); onClick?.(); }}
      className="w-full rounded-2xl overflow-hidden tap-scale shadow-premium relative"
      style={{ minHeight: 180 }}
    >
      {hasImage ? (
        <>
          <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative z-10 flex items-end p-5 h-full min-h-[180px]">
            <p className="text-white text-sm font-light opacity-80">{description}</p>
          </div>
        </>
      ) : (
        <div className="glass-surface h-full p-5 flex flex-col justify-between min-h-[180px]">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
            {Icon && <Icon className="w-6 h-6 text-primary" />}
          </div>
          <div className="mt-auto">
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      )}
    </motion.button>
  );
}