import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Star, ChevronLeft, CheckCircle2, XCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { playTap } from '@/lib/sounds';
import { base44 } from '@/api/base44Client';
import CompetitionCountdown from '@/components/challenge/CompetitionCountdown';

export default function ChallengePage({ user, stats, questions, answers, setStats, setAnswers, refreshStats, onRoundOpen }) {
  const navigate = useNavigate();
  const userCategory = stats?.category || 'guest';
  const [competitionStartDate, setCompetitionStartDate] = useState(undefined);

  useEffect(() => {
    base44.entities.AppSettings.list().then(list => {
      const rec = list.find(s => s.competition_start_date);
      if (rec?.competition_start_date) {
        const raw = rec.competition_start_date;
        const localDateStr = raw.includes('T') ? raw : raw + 'T00:00:00';
        const target = new Date(localDateStr);
        setCompetitionStartDate(target > new Date() ? localDateStr : null);
      } else {
        setCompetitionStartDate(null);
      }
    });
  }, []);
  const userEmail = user?.email || '';

  const visibleQs = (questions || []).filter(q => {
    if (!q.is_published) return false;
    const ta = q.target_audience || 'all';
    if (ta === 'all') return true;
    if (ta === 'contestants') return userCategory === 'contestant';
    if (ta === 'guests') return userCategory === 'guest';
    if (ta === 'specific') return (q.target_emails || []).includes(userEmail);
    return true;
  });

  const publishedQs = visibleQs.sort((a, b) => (a.day_number || 0) - (b.day_number || 0));
  const answeredIds = new Set((answers || []).map(a => a.question_id));
  const unansweredCount = publishedQs.filter(q => !answeredIds.has(q.id)).length;
  const totalAnswered = publishedQs.length - unansweredCount;

  // For the question card preview: first unanswered or last
  const firstUnanswered = publishedQs.find(q => !answeredIds.has(q.id));
  const activeQ = firstUnanswered || publishedQs[publishedQs.length - 1] || null;
  const activeA = activeQ ? (answers || []).find(a => a.question_id === activeQ.id) : null;

  return (
    <div className="space-y-5 pb-6">
      <h2 className="text-xl font-bold text-foreground">
        سؤال اليوم{publishedQs.length > 1 ? ` (${publishedQs.length} أسئلة)` : ''}
      </h2>

      {/* Question card — taps to full-screen page */}
      {publishedQs.length === 0 ? (
        competitionStartDate === undefined ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'hsl(var(--primary))', borderTopColor: 'transparent' }} />
          </div>
        ) : competitionStartDate !== null ? (
          <CompetitionCountdown targetDate={competitionStartDate} onExpired={() => setCompetitionStartDate(null)} />
        ) : (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="card-surface shadow-card p-8 text-center space-y-3">
            <Lock className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="font-bold text-foreground">في انتظار السؤال</p>
            <p className="text-sm text-muted-foreground">يصدر السؤال كل يوم الساعة ٩:٣٠ مساءً</p>
          </motion.div>
        )
      ) : (
        <motion.button initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { playTap(); navigate('/question'); }}
          className="w-full card-surface shadow-card overflow-hidden text-right tap-scale">
          <div className="p-5" style={{ background: activeA ? (activeA.is_correct ? '#046B6715' : '#ef444415') : 'hsl(var(--primary))' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeA
                  ? (activeA.is_correct
                    ? <CheckCircle2 className="w-5 h-5" style={{ color: '#046B67' }} />
                    : <XCircle className="w-5 h-5" style={{ color: '#ef4444' }} />)
                  : null
                }
                <p className={`text-sm font-bold ${activeA ? '' : 'text-white/80'}`}
                  style={activeA ? { color: activeA.is_correct ? '#046B67' : '#ef4444' } : {}}>
                  {activeA ? (activeA.is_correct ? 'أحسنت! إجابة صحيحة' : (activeA.user_answer ? 'إجابة خاطئة' : 'انتهى الوقت')) : `اليوم ${activeQ?.day_number}`}
                </p>
              </div>
              <ChevronLeft className={`w-5 h-5 ${activeA ? 'text-muted-foreground' : 'text-white'}`} />
            </div>
            {!activeA && <h2 className="text-white text-xl font-bold mt-1">السؤال وصل! 📩</h2>}
            {!activeA && <p className="text-white/70 text-sm mt-0.5">اضغط للإجابة</p>}
            {publishedQs.length > 1 && (
              <p className={`text-xs mt-1 ${activeA ? 'text-muted-foreground' : 'text-white/70'}`}>
                {totalAnswered}/{publishedQs.length} أسئلة مجاب عليها
              </p>
            )}
          </div>
        </motion.button>
      )}

      {/* Round Card */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => { playTap(); navigate('/tour'); }}
        className="w-full rounded-3xl overflow-hidden shadow-card tap-scale text-right relative"
        style={{ background: 'linear-gradient(135deg, #046B67 0%, #065f5b 60%, #0a4f4c 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10 bg-white" />

        <div className="relative p-5 flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, -6, 6, -6, 0], y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="text-5xl select-none flex-shrink-0"
          >
            🏆
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs mb-0.5">جولة خاصة</p>
            <h3 className="text-white font-black text-base leading-tight">جولة في مسابقة أنس العام الماضي</h3>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-white/80 text-xs">
                <Clock className="w-3.5 h-3.5" /> دقيقتان
              </span>
              <span className="flex items-center gap-1 text-white/80 text-xs">
                <Star className="w-3.5 h-3.5" /> 10 أسئلة
              </span>
              <span className="text-white/80 text-xs">🎯 محاولة واحدة تُحسب</span>
            </div>
          </div>
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <Play className="w-5 h-5 text-white" fill="white" />
          </div>
        </div>
      </motion.button>


    </div>
  );
}