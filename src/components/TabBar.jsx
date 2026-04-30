import { motion } from 'framer-motion';
import { Home, MessageCircleQuestion, UserCircle } from 'lucide-react';
import { playTap } from '@/lib/sounds';

const LABELS = { home: 'الرئيسية', challenge: 'التحدي', profile: 'حسابي' };

const tabs = [
  { id: 'home', icon: Home },
  { id: 'challenge', icon: MessageCircleQuestion },
  { id: 'profile', icon: UserCircle },
];

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 flex justify-center"
      style={{ paddingBottom: '20px' }}
    >
      <div
        className="flex items-center gap-1 px-4 py-2 rounded-full shadow-card"
        style={{
          background: 'hsl(var(--tabbar-bg))',
          border: '1px solid hsl(var(--border))',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              aria-label={LABELS[tab.id]}
              onClick={() => { playTap(); onTabChange(tab.id); }}
              className="relative flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-full tap-scale"
              style={{
                background: isActive ? 'hsl(var(--primary) / 0.12)' : 'transparent',
                transition: 'background 0.2s ease',
              }}
            >
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Icon
                  className="w-6 h-6"
                  style={{
                    color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                    transition: 'color 0.2s ease',
                  }}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </motion.div>
              <motion.span
                className="text-[9px] font-medium"
                animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 4 }}
                transition={{ duration: 0.2 }}
                style={{ color: 'hsl(var(--primary))' }}
              >
                {LABELS[tab.id]}
              </motion.span>
            </button>
          );
        })}
      </div>
    </div>
  );
}