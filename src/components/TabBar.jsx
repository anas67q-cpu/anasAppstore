import { motion } from 'framer-motion';
import { Home, Swords, UserCircle } from 'lucide-react';
import { playTap } from '@/lib/sounds';

const tabs = [
  { id: 'home', label: 'الواجهة', icon: Home },
  { id: 'challenge', label: 'التحدي', icon: Swords },
  { id: 'profile', label: 'حسابي', icon: UserCircle },
];

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40">
      <div className="shadow-tab-bar bg-card/80 backdrop-blur-2xl border-t-0 rounded-t-2xl">
        <div
          className="flex items-center justify-around px-2"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)', paddingTop: '10px' }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playTap();
                  onTabChange(tab.id);
                }}
                className="flex flex-col items-center gap-1 flex-1 tap-scale relative"
              >
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 transition-colors duration-200 ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="tab-glow"
                      className="absolute -inset-2 rounded-full bg-primary/20 blur-md"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}