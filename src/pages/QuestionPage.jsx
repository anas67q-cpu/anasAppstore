import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Lock, Timer, Clock, Send, ArrowRight, AlertTriangle } from 'lucide-react';
import Lottie from 'lottie-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { playCorrect, playWrong, playTap } from '@/lib/sounds';
import confetti from 'canvas-confetti';
import CompetitionCountdown from '@/components/challenge/CompetitionCountdown';

const EMOJI_LOADING_URL = 'https://media.base44.com/files/public/69daa39f99dd53afa074a17a/20fb7618b_Emojiloading.json';
let emojiLoadingCache = null;

const LAUNCH_ANIM_URL = 'https://media.base44.com/files/public/69daa39f99dd53afa074a17a/5c33f6776_.json';
let launchAnimCache = null;
const launchAnimPromise = fetch(LAUNCH_ANIM_URL)
  .then(r => r.json())
  .then(data => { launchAnimCache = data; return data; })
  .catch(() => null);

const ADMIN_EMAIL = 'anas6.7q@gmail.com';

function getNextQuestionTime() {
  const riyadhNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
  const next = new Date(riyadhNow);
  next.setHours(21, 30, 0, 0);
  if (riyadhNow >= next) next.setDate(next.getDate() + 1);
  return next - riyadhNow;
}

function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function getPointsForDay(d) {
  if (d <= 10) return 1; if (d <= 20) return 2; if (d <= 28) return 3; return 5;
}

function getOpenedKey(questionId, userEmail) {
  return `opened_q_${questionId}_${userEmail}`;
}

function InfoBox({ label, value, accent }) {
  return (
    <div className="text-center p-2.5 rounded-xl bg-secondary">
      <p className="text-sm font-bold" style={{ color: accent ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function LaunchOverlay({ animationData, onComplete }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9998] flex items-center justify-center"
      style={{ background: 'rgba(2,8,16,0.97)', backdropFilter: 'blur(20px)' }}>
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 16, stiffness: 260, delay: 0.08 }}
        style={{ width: '90vw', maxWidth: 420 }}>
        <Lottie animationData={animationData} loop={false} autoplay onComplete={onComplete}
          style={{ width: '100%', height: 'auto' }} rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }} />
      </motion.div>
    </motion.div>
  );
}

function ComingSoonScreen() {
  const [animData, setAnimData] = useState(emojiLoadingCache);
  useEffect(() => {
    if (emojiLoadingCache) { setAnimData(emojiLoadingCache); return; }
    fetch(EMOJI_LOADING_URL).then(r => r.json()).then(data => { emojiLoadingCache = data; setAnimData(data); });
  }, []);
  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <div style={{ width: 180, height: 180, margin: '0 auto' }}>
          {animData
            ? <Lottie animationData={animData} loop autoplay style={{ width: '100%', height: '100%' }} />
            : <div className="w-full h-full flex items-center justify-center text-5xl">⏳</div>
          }
        </div>
        <h3 className="text-3xl font-black" style={{ color: 'hsl(var(--primary))' }}>السؤال جاي الحين!</h3>
        <p className="text-lg font-bold text-foreground">🎯 خلك مستعد</p>
        <p className="text-sm text-muted-foreground">ستُحدَّث الصفحة تلقائياً عند نزول السؤال</p>
      </div>
    </div>
  );
}

// Warning bottom sheet shown when user leaves during active question
function EscapeWarningSheet({ warningNumber, onDismiss }) {
  const isSecond = warningNumber >= 2;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="w-full max-w-lg rounded-t-3xl overflow-hidden"
          style={{
            background: isSecond ? '#1a0505' : 'hsl(var(--card))',
            paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))',
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ background: isSecond ? '#ef444450' : 'hsl(var(--border))' }} />
          </div>

          <div className="px-6 pt-4 pb-6 space-y-5">
            {/* Icon */}
            <div className="flex justify-center">
              <motion.div
                animate={{ scale: [1, 1.12, 1], rotate: isSecond ? [0, -5, 5, -5, 0] : [0, -3, 3, 0] }}
                transition={{ repeat: Infinity, duration: isSecond ? 1.2 : 2, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{ background: isSecond ? '#ef444420' : '#f59e0b20' }}
              >
                <AlertTriangle className="w-10 h-10" style={{ color: isSecond ? '#ef4444' : '#f59e0b' }} />
              </motion.div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black" style={{ color: isSecond ? '#ef4444' : '#f59e0b' }}>
                {isSecond ? 'تحذير أخير ⚠️' : 'قفطناك!! 👀'}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: isSecond ? '#fca5a5' : 'hsl(var(--foreground))' }}>
                {isSecond
                  ? 'تم رصد مغادرتك للسؤال أكثر من مرة.\n\nقد تقوم الإدارة بتطبيق عقوبة عليك تصل إلى خصم 5 درجات.\n\nيرجى الالتزام بالتعليمات لتجنب أي إجراءات إدارية.'
                  : 'لقد غادرت السؤال أثناء وقت الإجابة.\n\nهذا تنبيه أول فقط.\n\nفي حال تكرار هذا السلوك قد تقوم الإدارة بتطبيق عقوبة تصل إلى خصم 5 درجات من رصيدك.\n\nيرجى الالتزام والبقاء داخل السؤال حتى الانتهاء منه.'
                }
              </p>
            </div>

            {/* Warning count badge */}
            <div className="flex justify-center">
              <div className="px-4 py-2 rounded-full text-sm font-bold"
                style={{ background: isSecond ? '#ef444420' : '#f59e0b20', color: isSecond ? '#ef4444' : '#f59e0b' }}>
                عدد التنبيهات: {warningNumber}
              </div>
            </div>

            {/* CTA */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onDismiss}
              className="w-full py-4 rounded-2xl font-black text-white text-base"
              style={{ background: isSecond ? '#ef4444' : '#f59e0b' }}
            >
              {isSecond ? 'فهمت وسألتزم' : 'حسناً، فهمت'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function QuestionPage({ user, stats, questions, answers, setStats, setAnswers, refreshStats }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('init');
  const [timeLeft, setTimeLeft] = useState(0);
  const [countdown, setCountdown] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [pendingAnswer, setPendingAnswer] = useState(null);
  const [essayText, setEssayText] = useState('');
  const [essaySent, setEssaySent] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchAnimData, setLaunchAnimData] = useState(launchAnimCache);
  const [competitionStartDate, setCompetitionStartDate] = useState(undefined);
  const [countdownDone, setCountdownDone] = useState(false);
  const [escapeWarning, setEscapeWarning] = useState(null); // { count } when showing
  const timerRef = useRef(null);
  const isAdmin = user?.email === ADMIN_EMAIL;
  // Track if currently in active (answering) session
  const isActiveLocked = phase === 'answering' && !selectedAnswer && !essaySent;

  useEffect(() => {
    if (!launchAnimCache) {
      launchAnimPromise.then(data => { if (data) setLaunchAnimData(data); });
    }
  }, []);

  useEffect(() => {
    base44.entities.AppSettings.list().then(list => {
      const rec = list.find(s => s.competition_start_date);
      if (rec?.competition_start_date) {
        // Parse date-only strings as local midnight to avoid UTC offset issues
        const raw = rec.competition_start_date;
        const target = raw.includes('T') ? new Date(raw) : new Date(raw + 'T23:59:59');
        setCompetitionStartDate(target > new Date() ? raw : null);
      } else {
        setCompetitionStartDate(null);
      }
    });
  }, []);

  // ── Navigation lock during active question ──
  useEffect(() => {
    if (!isActiveLocked) return;

    // Block browser back button
    const handlePopState = (e) => {
      window.history.pushState(null, '', window.location.href);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    // Block beforeunload (tab close / refresh)
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isActiveLocked]);

  // ── Escape detection ──
  useEffect(() => {
    if (!isActiveLocked || isAdmin) return;

    const handleVisibilityChange = () => {
      if (document.hidden) triggerEscapeWarning();
    };
    const handleBlur = () => triggerEscapeWarning();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isActiveLocked, isAdmin]);

  const triggerEscapeWarning = useCallback(async () => {
    if (!user?.email || isAdmin) return;
    // Record escape in DB
    const existing = await base44.entities.EscapeWarning.filter({ user_email: user.email });
    const now = new Date().toISOString();
    let newCount;
    if (existing.length > 0) {
      const rec = existing[0];
      newCount = (rec.warning_count || 0) + 1;
      await base44.entities.EscapeWarning.update(rec.id, {
        warning_count: newCount,
        last_warning_date: now,
        user_name: stats?.user_name || user.full_name || '',
        question_day: todayQ?.day_number,
      });
    } else {
      newCount = 1;
      await base44.entities.EscapeWarning.create({
        user_email: user.email,
        user_name: stats?.user_name || user.full_name || '',
        warning_count: 1,
        last_warning_date: now,
        question_day: todayQ?.day_number,
      });
    }
    setEscapeWarning({ count: newCount });
  }, [user, isAdmin, stats]);

  // Determine the active question
  const todayQs = (questions || []).filter(q => q.is_published)
    .sort((a, b) => (a.day_number || 0) - (b.day_number || 0));

  const firstUnanswered = todayQs.find(q => !(answers || []).find(a => a.question_id === q.id));
  const todayQ = firstUnanswered || todayQs[todayQs.length - 1] || null;
  const todayA = todayQ ? (answers || []).find(a => a.question_id === todayQ.id) : null;

  useEffect(() => {
    if (todayQ?.image_url) { const img = new Image(); img.src = todayQ.image_url; }
  }, [todayQ?.image_url]);

  useEffect(() => {
    if (!todayQ) { setPhase('waiting'); return; }
    if (todayA) { setPhase('result'); return; }
    const alreadyOpened = localStorage.getItem(getOpenedKey(todayQ.id, user.email));
    setPhase(alreadyOpened ? 'answering' : 'preview');
    setSelectedAnswer(null); setPendingAnswer(null); setEssayText(''); setEssaySent(false);
  }, [todayA?.id, todayQ?.id]);

  useEffect(() => {
    if (phase === 'result' || phase === 'waiting') {
      const iv = setInterval(() => setCountdown(formatCountdown(getNextQuestionTime())), 1000);
      return () => clearInterval(iv);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'answering' || todayA) return;
    const stored = todayQ?.id ? localStorage.getItem(getOpenedKey(todayQ.id, user.email) + '_time') : null;
    const limit = todayQ?.time_limit || 90;
    let startLeft = limit;
    if (stored) {
      const elapsed = Math.floor((Date.now() - Number(stored)) / 1000);
      startLeft = Math.max(0, limit - elapsed);
    }
    if (startLeft <= 0) { handleTimeout(); return; }
    setTimeLeft(startLeft);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleTimeout(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const doStartAnswering = () => {
    if (todayQ) {
      localStorage.setItem(getOpenedKey(todayQ.id, user.email), '1');
      localStorage.setItem(getOpenedKey(todayQ.id, user.email) + '_time', Date.now().toString());
    }
    setPhase('answering');
  };

  const startAnswering = () => {
    playTap();
    if (launchAnimData) setLaunching(true);
    else doStartAnswering();
  };

  const handleTimeout = async () => {
    if (!todayQ || todayA) return;
    const ans = { question_id: todayQ.id, user_email: user.email, user_answer: '', is_correct: false, points_earned: 0, day_number: todayQ.day_number };
    const created = await base44.entities.Answer.create(ans);
    setAnswers(prev => [created, ...prev]);
    if (!isAdmin && stats) {
      await base44.entities.UserStats.update(stats.id, { total_missed: (stats.total_missed||0)+1, current_streak: 0 });
    }
    refreshStats();
    setPhase('result');
  };

  const handleSelectOption = (option) => {
    if (selectedAnswer !== null || todayA) return;
    playTap(); setPendingAnswer(option);
  };

  const handleAnswer = async (option) => {
    if (selectedAnswer !== null || todayA) return;
    playTap(); setPendingAnswer(null); setSelectedAnswer(option);
    clearInterval(timerRef.current);
    const isCorrect = option === todayQ.correct_answer;
    const pts = (isCorrect && !isAdmin) ? (todayQ.points || getPointsForDay(todayQ.day_number)) : 0;
    if (isCorrect) {
      playCorrect();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#046B67','#f59e0b','#fff'] });
    } else { playWrong(); }
    const ans = {
      question_id: todayQ.id, user_email: user.email,
      user_name: stats?.user_name || user?.full_name || '',
      user_answer: option, is_correct: isCorrect, points_earned: pts,
      day_number: todayQ.day_number, time_taken: (todayQ.time_limit||90) - timeLeft,
      graded: todayQ.type !== 'essay',
    };
    const created = await base44.entities.Answer.create(ans);
    setAnswers(prev => [created, ...prev]);
    base44.entities.ActivityLog.create({
      user_email: user.email, user_name: stats?.user_name || user?.full_name || '',
      action: 'answer', details: `أجاب على سؤال يوم ${todayQ.day_number} - ${isCorrect ? 'صحيح' : 'خاطئ'}`,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }),
    }).catch(() => {});
    if (!isAdmin && stats) {
      const upd = { total_points: (stats.total_points||0) + pts };
      if (isCorrect) {
        upd.total_correct = (stats.total_correct||0)+1;
        upd.current_streak = (stats.current_streak||0)+1;
        upd.highest_streak = Math.max(stats.highest_streak||0, upd.current_streak);
      } else { upd.total_wrong = (stats.total_wrong||0)+1; upd.current_streak = 0; }
      await base44.entities.UserStats.update(stats.id, upd);
    }
    refreshStats();
    setTimeout(() => setPhase('result'), 1200);
  };

  const handleEssaySubmit = async () => {
    if (!essayText.trim() || essaySent) return;
    playTap(); setEssaySent(true); clearInterval(timerRef.current);
    const ans = {
      question_id: todayQ.id, user_email: user.email,
      user_name: stats?.user_name || user?.full_name || '',
      user_answer: essayText.trim(), is_correct: false, points_earned: 0,
      day_number: todayQ.day_number, time_taken: (todayQ.time_limit||90) - timeLeft, graded: false,
    };
    const created = await base44.entities.Answer.create(ans);
    setAnswers(prev => [created, ...prev]);
    base44.entities.ActivityLog.create({
      user_email: user.email, user_name: stats?.user_name || user?.full_name || '',
      action: 'answer', details: `أرسل إجابة مقالية ليوم ${todayQ.day_number} - بانتظار التصحيح`,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }),
    }).catch(() => {});
    refreshStats();
    setTimeout(() => setPhase('result'), 800);
  };

  const typeMap = { multiple_choice: 'اختيار من متعدد', true_false: 'صح أو خطأ', essay: 'مقالي' };

  const answeredIds = new Set((answers || []).map(a => a.question_id));
  const remainingQs = todayQs.filter(q => !answeredIds.has(q.id));
  const hasMoreQuestions = remainingQs.length > 0 && todayA !== null;
  const isEssayPending = todayA && !todayA.is_correct && todayQ?.type === 'essay' && todayA.user_answer;

  const riyadhNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
  const h = riyadhNow.getHours(), mn = riyadhNow.getMinutes();
  const justPassed930 = h === 21 && mn >= 30 && mn < 60;

  return (
    <div className="fixed inset-0 z-[9992] flex flex-col bg-background"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 flex-shrink-0"
        style={{ background: 'hsl(var(--primary))', paddingTop: 'max(16px, env(safe-area-inset-top, 0px))', paddingBottom: '16px', borderRadius: '0 0 24px 24px' }}>
        {/* Back button: disabled + hidden while answering */}
        {isActiveLocked ? (
          <div className="p-2 rounded-full opacity-30 flex-shrink-0">
            <Lock className="w-5 h-5 text-white" />
          </div>
        ) : (
          <button onClick={() => { playTap(); navigate(-1); }} className="p-2 rounded-full bg-white/20 tap-scale flex-shrink-0">
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        )}
        <h1 className="text-white font-black text-lg flex-1 text-center">
          {todayQ ? `اليوم ${todayQ.day_number}` : 'سؤال اليوم'}
        </h1>
        {phase === 'answering' && !todayA ? (
          <div className="flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-white" style={{ color: timeLeft <= 10 ? '#fca5a5' : 'white' }} />
            <span className="font-black font-mono text-white" style={{ color: timeLeft <= 10 ? '#fca5a5' : 'white' }}>
              {timeLeft}ث
            </span>
          </div>
        ) : <div className="w-14" />}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scroll-ios px-4 pt-5 pb-8">

        {(phase === 'waiting' || phase === 'init') && (
          <>
            {competitionStartDate !== undefined && competitionStartDate !== null && !countdownDone ? (
              <CompetitionCountdown targetDate={competitionStartDate} onExpired={() => { setCountdownDone(true); setCompetitionStartDate(null); }} />
            ) : justPassed930 ? (
              <ComingSoonScreen />
            ) : (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                className="card-surface shadow-card p-8 text-center space-y-4 mt-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'hsl(var(--secondary))' }}>
                  <Lock className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">في انتظار السؤال</h3>
                <p className="text-sm text-muted-foreground">يصدر السؤال كل يوم الساعة ٩:٣٠ مساءً</p>
                <div className="p-4 rounded-2xl bg-secondary">
                  <p className="text-xs text-muted-foreground mb-1">الوقت المتبقي</p>
                  <p className="text-3xl font-black font-mono" style={{ color: 'hsl(var(--primary))' }}>{countdown}</p>
                </div>
              </motion.div>
            )}
          </>
        )}

        {phase === 'preview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="card-surface shadow-card overflow-hidden mt-2">
            <div className="p-5" style={{ background: 'hsl(var(--primary))' }}>
              <p className="text-white/80 text-xs">اليوم {todayQ?.day_number}</p>
              <h2 className="text-white text-xl font-bold mt-1">السؤال وصل! 📩</h2>
              <p className="text-white/70 text-sm mt-1">لديك {todayQ?.time_limit || 90} ثانية للإجابة</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-secondary/70 text-center">
                <p className="text-xs text-muted-foreground">⚠️ بمجرد الضغط على "ابدأ" سيبدأ العداد التنازلي ولا يمكن التراجع</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <InfoBox label="النوع" value={typeMap[todayQ?.type] || '—'} />
                <InfoBox label="الوقت" value={`${todayQ?.time_limit || 90}ث`} />
                <InfoBox label="النقاط" value={isAdmin ? '—' : (todayQ?.points || getPointsForDay(todayQ?.day_number || 1))} accent />
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={startAnswering}
                className="w-full py-4 rounded-2xl font-bold text-white text-base"
                style={{ background: 'hsl(var(--primary))' }}>
                ابدأ الإجابة
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === 'answering' && !todayA && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mt-2">
            <div className="card-surface shadow-card p-4 space-y-2">
              <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(timeLeft / (todayQ?.time_limit || 90)) * 100}%`, background: timeLeft <= 10 ? '#ef4444' : 'hsl(var(--primary))' }} />
              </div>
            </div>

            <div className="card-surface shadow-card p-5 space-y-3">
              {todayQ?.image_url && (
                <img src={todayQ.image_url} alt="صورة السؤال"
                  className="w-full rounded-xl object-contain max-h-56"
                  style={{ background: 'hsl(var(--secondary))' }} />
              )}
              <p className="text-base font-bold leading-relaxed text-foreground">{todayQ?.text}</p>
            </div>

            {todayQ?.type === 'multiple_choice' && (
              <div className="space-y-2.5">
                {todayQ.options?.map((opt, i) => {
                  const isCorrectOpt = selectedAnswer !== null && opt === todayQ.correct_answer;
                  const isWrongSelected = selectedAnswer === opt && opt !== todayQ.correct_answer;
                  const isPending = pendingAnswer === opt && selectedAnswer === null;
                  return (
                    <motion.button key={i} whileTap={{ scale: selectedAnswer === null ? 0.97 : 1 }}
                      onClick={() => selectedAnswer === null && handleSelectOption(opt)}
                      disabled={selectedAnswer !== null}
                      className="w-full p-4 rounded-2xl text-right font-medium text-sm border transition-all"
                      style={{
                        background: isCorrectOpt ? '#046B6720' : isWrongSelected ? '#ef444420' : isPending ? 'hsl(var(--primary) / 0.12)' : 'hsl(var(--secondary))',
                        borderColor: isCorrectOpt ? '#046B67' : isWrongSelected ? '#ef4444' : isPending ? 'hsl(var(--primary))' : 'transparent',
                        color: 'hsl(var(--foreground))'
                      }}>
                      <span className="flex items-center gap-2">
                        {isCorrectOpt && <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#046B67' }} />}
                        {isWrongSelected && <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#ef4444' }} />}
                        {opt}
                      </span>
                    </motion.button>
                  );
                })}
                {pendingAnswer && selectedAnswer === null && (
                  <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.97 }} onClick={() => handleAnswer(pendingAnswer)}
                    className="w-full py-4 rounded-2xl font-bold text-white text-base"
                    style={{ background: 'hsl(var(--primary))' }}>
                    ✅ إرسال الإجابة
                  </motion.button>
                )}
              </div>
            )}

            {todayQ?.type === 'true_false' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {['صح', 'خطأ'].map(opt => {
                    const isCorrectOpt = selectedAnswer !== null && opt === todayQ.correct_answer;
                    const isWrongSelected = selectedAnswer === opt && opt !== todayQ.correct_answer;
                    const isPending = pendingAnswer === opt && selectedAnswer === null;
                    return (
                      <motion.button key={opt} whileTap={{ scale: selectedAnswer === null ? 0.97 : 1 }}
                        onClick={() => selectedAnswer === null && handleSelectOption(opt)}
                        disabled={selectedAnswer !== null}
                        className="p-4 rounded-2xl font-bold text-base border tap-scale"
                        style={{
                          background: isCorrectOpt ? '#046B6720' : isWrongSelected ? '#ef444420' : isPending ? 'hsl(var(--primary) / 0.12)' : 'hsl(var(--secondary))',
                          borderColor: isCorrectOpt ? '#046B67' : isWrongSelected ? '#ef4444' : isPending ? 'hsl(var(--primary))' : 'transparent',
                          color: 'hsl(var(--foreground))'
                        }}>
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
                {pendingAnswer && selectedAnswer === null && (
                  <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.97 }} onClick={() => handleAnswer(pendingAnswer)}
                    className="w-full py-4 rounded-2xl font-bold text-white text-base"
                    style={{ background: 'hsl(var(--primary))' }}>
                    ✅ إرسال الإجابة
                  </motion.button>
                )}
              </div>
            )}

            {todayQ?.type === 'essay' && (
              <div className="space-y-3">
                {!essaySent ? (
                  <>
                    <textarea value={essayText} onChange={e => setEssayText(e.target.value)}
                      placeholder="اكتب إجابتك هنا..."
                      className="w-full min-h-[120px] rounded-2xl p-4 text-sm bg-secondary text-foreground outline-none resize-none border border-border focus:border-primary" />
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleEssaySubmit}
                      disabled={!essayText.trim()}
                      className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
                      style={{ background: 'hsl(var(--primary))' }}>
                      <Send className="w-4 h-4" /> إرسال الإجابة
                    </motion.button>
                  </>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground animate-pulse" />
                    <p className="font-bold text-foreground">بانتظار تصحيح الإدارة</p>
                    <p className="text-sm text-muted-foreground">سيتم إعلامك بالنتيجة قريباً</p>
                  </div>
                )}
              </div>
            )}

            {selectedAnswer !== null && todayQ?.type !== 'essay' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl text-center"
                style={{ background: selectedAnswer === todayQ.correct_answer ? '#046B6715' : '#ef444415' }}>
                {selectedAnswer === todayQ.correct_answer
                  ? <p className="font-bold" style={{ color: '#046B67' }}>🎉 أحسنت! إجابة صحيحة</p>
                  : <div className="space-y-1">
                      <p className="font-bold" style={{ color: '#ef4444' }}>😔 إجابة خاطئة</p>
                      <p className="text-xs text-muted-foreground">الإجابة الصحيحة: <span className="font-bold text-foreground">{todayQ.correct_answer}</span></p>
                    </div>
                }
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === 'result' && (
          <div className="space-y-4 mt-2">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="card-surface shadow-card overflow-hidden">
              <div className="p-6 text-center" style={{
                background: isEssayPending ? '#6366f115' : (todayA?.is_correct ? '#046B6715' : '#ef444415')
              }}>
                {isEssayPending
                  ? <Clock className="w-14 h-14 mx-auto mb-3 text-indigo-400 animate-pulse" />
                  : todayA?.is_correct
                    ? <CheckCircle2 className="w-14 h-14 mx-auto mb-3" style={{ color: '#046B67' }} />
                    : <XCircle className="w-14 h-14 mx-auto mb-3" style={{ color: '#ef4444' }} />
                }
                <h3 className="text-xl font-bold text-foreground">
                  {isEssayPending ? 'بانتظار التصحيح'
                    : todayA?.is_correct ? 'أحسنت! إجابة صحيحة 🎉'
                    : todayA?.user_answer ? 'إجابة خاطئة' : 'انتهى الوقت'}
                </h3>
                {isEssayPending && <p className="text-sm text-muted-foreground mt-1">ستظهر نتيجة الإجابة المقالية بعد تصحيح الإدارة</p>}
                {todayA?.points_earned > 0 && (
                  <p className="text-base font-black mt-2" style={{ color: '#046B67' }}>+{todayA.points_earned} نقطة</p>
                )}
                {todayA && !todayA.is_correct && !isEssayPending && todayQ?.correct_answer && (
                  <p className="text-xs text-muted-foreground mt-2">
                    الإجابة الصحيحة: <span className="font-bold text-foreground">{todayQ.correct_answer}</span>
                  </p>
                )}
              </div>
              {todayA?.admin_note && (
                <div className="mx-5 mb-1 p-3 rounded-xl border" style={{ borderColor: '#6366f140', background: '#6366f110' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: '#6366f1' }}>ملاحظة الإدارة</p>
                  <p className="text-sm text-foreground">{todayA.admin_note}</p>
                </div>
              )}
              {hasMoreQuestions ? (
                <div className="p-5 text-center">
                  <p className="text-sm text-muted-foreground mb-3">يوجد {remainingQs.length} سؤال آخر اليوم!</p>
                  <motion.button whileTap={{ scale: 0.97 }}
                    onClick={() => { setSelectedAnswer(null); setPendingAnswer(null); setEssayText(''); setEssaySent(false); setPhase('preview'); }}
                    className="w-full py-4 rounded-2xl font-bold text-white"
                    style={{ background: 'hsl(var(--primary))' }}>
                    السؤال التالي ←
                  </motion.button>
                </div>
              ) : (
                <div className="p-5 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">السؤال القادم خلال</p>
                  <p className="text-2xl font-black font-mono" style={{ color: 'hsl(var(--primary))' }}>{countdown}</p>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => { playTap(); navigate(-1); }}
                    className="w-full py-3 rounded-2xl font-bold text-sm tap-scale"
                    style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}>
                    العودة للرئيسية
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* Launch overlay */}
      <AnimatePresence>
        {launching && launchAnimData && (
          <LaunchOverlay animationData={launchAnimData} onComplete={() => { setLaunching(false); doStartAnswering(); }} />
        )}
      </AnimatePresence>

      {/* Escape warning bottom sheet */}
      {escapeWarning && (
        <EscapeWarningSheet
          warningNumber={escapeWarning.count}
          onDismiss={() => setEscapeWarning(null)}
        />
      )}
    </div>
  );
}