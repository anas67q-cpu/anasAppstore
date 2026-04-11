import { motion } from 'framer-motion';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'صباح الخير';
  if (h < 17) return 'مساء الخير';
  return 'مساء النور';
}

export default function GreetingSection({ userName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-1"
    >
      <p className="text-muted-foreground text-sm font-light">{getGreeting()}</p>
      <h1 className="text-2xl font-bold text-foreground mt-0.5">
        {userName || 'مرحباً'}
      </h1>
    </motion.div>
  );
}