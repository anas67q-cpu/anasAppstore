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
    <div className="fixed bottom-0 inset-x-0 z-40 flex justify-center pb-safe"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
      <div
        className="flex items-center gap-2 px-6 py-3 rounded-full shadow-card"
        style={{ background: 'hsl(var(--tabbar-bg))', border: '1px solid hsl(var(--border))' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              aria-label={LABELS[tab.id]}
              onClick={() => { playTap(); onTabChange(tab.id); }}
              className="relative flex flex-col items-center px-6 py-1 tap-scale"
            >
              <Icon
                className="w-6 h-6 transition-colors duration-200"
                style={{ color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -bottom-1 w-6 h-0.5 rounded-full"
                  style={{ background: 'hsl(var(--primary))' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}