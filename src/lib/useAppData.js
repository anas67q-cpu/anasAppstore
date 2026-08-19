import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { preloadImages } from '@/lib/imageCache';
import { withAssetDefaults, withBadgeIconDefaults, APP_ASSETS } from '@/lib/appAssets';

const ADMIN_EMAIL = 'anas6.7q@gmail.com';

const cache = {
  user: null, stats: null, questions: null, answers: null,
  allStats: null, settings: null, userBadges: null, allBadges: null, allUserBadges: null, lastFetch: {},
};
// TTL per data type (ms)
const TTL = {
  user:         60 * 60 * 1000, // 1 hour  — rarely changes
  stats:        30 * 1000,      // 30s     — changes after answer
  questions:    5  * 60 * 1000, // 5 min   — admin adds rarely
  answers:      30 * 1000,      // 30s
  allStats:     60 * 1000,      // 1 min   — leaderboard
  settings:     10 * 60 * 1000, // 10 min  — very rarely changes
  userBadges:   2  * 60 * 1000, // 2 min
  allBadges:    10 * 60 * 1000, // 10 min
  allUserBadges:2  * 60 * 1000, // 2 min
};

function shouldRefetch(key) {
  return Date.now() - (cache.lastFetch[key] || 0) > (TTL[key] ?? 30000);
}

export default function useAppData() {
  const [user, setUser] = useState(cache.user);
  const [stats, setStats] = useState(cache.stats);
  const [questions, setQuestions] = useState(cache.questions || []);
  const [answers, setAnswers] = useState(cache.answers || []);
  const [allStats, setAllStats] = useState(cache.allStats || []);
  const [settings, setSettings] = useState(cache.settings || []);
  const [userBadges, setUserBadges] = useState(cache.userBadges || []);
  const [allBadges, setAllBadges] = useState(cache.allBadges || []);
  const [allUserBadges, setAllUserBadges] = useState(cache.allUserBadges || []);
  const [loading, setLoading] = useState(!cache.user);
  const mounted = useRef(true);

  const fetchUser = useCallback(async () => {
    const u = await base44.auth.me();
    cache.user = u; cache.lastFetch.user = Date.now();
    if (mounted.current) setUser(u);
    return u;
  }, []);

  const fetchStats = useCallback(async (email) => {
    const s = await base44.entities.UserStats.filter({ user_email: email });
    const stat = s[0] || null;
    cache.stats = stat; cache.lastFetch.stats = Date.now();
    if (mounted.current) setStats(stat);
    return stat;
  }, []);

  const fetchQuestions = useCallback(async () => {
    if (!shouldRefetch('questions') && cache.questions) return cache.questions;
    const q = await base44.entities.Question.list('day_number', 200);
    cache.questions = q; cache.lastFetch.questions = Date.now();
    if (mounted.current) setQuestions(q);
    return q;
  }, []);

  const fetchAnswers = useCallback(async (email) => {
    if (!shouldRefetch('answers') && cache.answers) return cache.answers;
    const a = await base44.entities.Answer.filter({ user_email: email }, '-created_date');
    cache.answers = a; cache.lastFetch.answers = Date.now();
    if (mounted.current) setAnswers(a);
    return a;
  }, []);

  const fetchAllStats = useCallback(async () => {
    if (!shouldRefetch('allStats') && cache.allStats?.length) return cache.allStats;
    const s = await base44.entities.UserStats.list('-total_points', 100);
    const filtered = s.filter(u => u.user_email !== ADMIN_EMAIL);
    cache.allStats = filtered; cache.lastFetch.allStats = Date.now();
    if (mounted.current) setAllStats(filtered);
    return filtered;
  }, []);

  const fetchSettings = useCallback(async () => {
    if (!shouldRefetch('settings') && cache.settings?.length) return cache.settings;
    const raw = await base44.entities.AppSettings.list();
    const s = raw.map(withAssetDefaults);
    cache.settings = s; cache.lastFetch.settings = Date.now();
    if (mounted.current) setSettings(s);
    // Pre-cache competition logo and card template persistently
    preloadImages(s.flatMap(r => [r.competition_logo, r.card_template, r.streak_logo, r.leaderboard_shield, r.quick_challenge_image, r.memory_challenge_image]));
    return s;
  }, []);

  const fetchUserBadges = useCallback(async (email) => {
    if (!shouldRefetch('userBadges') && cache.userBadges) return cache.userBadges;
    const b = (await base44.entities.UserBadge.filter({ user_email: email })).map(withBadgeIconDefaults);
    cache.userBadges = b; cache.lastFetch.userBadges = Date.now();
    if (mounted.current) setUserBadges(b);
    return b;
  }, []);

  const fetchAllBadges = useCallback(async () => {
    if (!shouldRefetch('allBadges') && cache.allBadges?.length) return cache.allBadges;
    const b = (await base44.entities.Badge.list('-created_date', 100)).map(withBadgeIconDefaults);
    cache.allBadges = b; cache.lastFetch.allBadges = Date.now();
    if (mounted.current) setAllBadges(b);
    // Pre-cache all badge images persistently
    preloadImages(b.map(badge => badge.icon_url));
    return b;
  }, []);

  const fetchAllUserBadges = useCallback(async () => {
    if (!shouldRefetch('allUserBadges') && cache.allUserBadges?.length) return cache.allUserBadges;
    const b = (await base44.entities.UserBadge.list('-created_date', 500)).map(withBadgeIconDefaults);
    cache.allUserBadges = b; cache.lastFetch.allUserBadges = Date.now();
    if (mounted.current) setAllUserBadges(b);
    return b;
  }, []);

  const initAll = useCallback(async () => {
    setLoading(true);
    const u = await fetchUser();
    await Promise.all([
      fetchStats(u.email), fetchQuestions(), fetchAnswers(u.email),
      fetchAllStats(), fetchSettings(), fetchUserBadges(u.email), fetchAllBadges(), fetchAllUserBadges(),
    ]);
    if (mounted.current) setLoading(false);
  }, [fetchUser, fetchStats, fetchQuestions, fetchAnswers, fetchAllStats, fetchSettings, fetchUserBadges, fetchAllBadges, fetchAllUserBadges]);

  const refreshStats = useCallback(async () => {
    if (user) { cache.lastFetch.stats = 0; await fetchStats(user.email); }
  }, [user, fetchStats]);

  const updateUserName = useCallback(async (name) => {
    await base44.auth.updateMe({ full_name: name });
    cache.user = { ...cache.user, full_name: name };
    setUser(prev => ({ ...prev, full_name: name }));
    if (stats) {
      await base44.entities.UserStats.update(stats.id, { user_name: name });
      cache.stats = { ...cache.stats, user_name: name };
      setStats(prev => ({ ...prev, user_name: name }));
    }
  }, [stats]);

  useEffect(() => {
    mounted.current = true;
    initAll();
    return () => { mounted.current = false; };
  }, []);

  // Real-time subscriptions — update UI instantly when data changes
  useEffect(() => {
    if (!user?.email) return;

    const unsubAnswer = base44.entities.Answer.subscribe((event) => {
      if (event.data?.user_email !== user.email) return;
      if (!mounted.current) return;
      if (event.type === 'create') {
        setAnswers(prev => {
          if (prev.find(a => a.id === event.id)) return prev;
          return [event.data, ...prev];
        });
      } else if (event.type === 'update') {
        setAnswers(prev => prev.map(a => a.id === event.id ? event.data : a));
      } else if (event.type === 'delete') {
        setAnswers(prev => prev.filter(a => a.id !== event.id));
      }
    });

    const unsubStats = base44.entities.UserStats.subscribe((event) => {
      if (event.data?.user_email !== user.email) return;
      if (!mounted.current) return;
      if (event.type === 'update' || event.type === 'create') {
        setStats(event.data);
        cache.stats = event.data;
      }
      // Also refresh allStats for leaderboard
      cache.lastFetch.allStats = 0;
      base44.entities.UserStats.list('-total_points', 100).then(s => {
        const filtered = s.filter(u => u.user_email !== ADMIN_EMAIL);
        cache.allStats = filtered;
        if (mounted.current) setAllStats(filtered);
      });
    });

    const unsubBadge = base44.entities.UserBadge.subscribe((event) => {
      if (event.data?.user_email !== user.email) return;
      if (!mounted.current) return;
      cache.lastFetch.userBadges = 0;
      fetchUserBadges(user.email);
    });

    return () => {
      unsubAnswer();
      unsubStats();
      unsubBadge();
    };
  }, [user?.email]);

  return {
    user, stats, questions, answers, allStats, settings, userBadges, allBadges, allUserBadges, loading,
    refreshStats, fetchAllStats, updateUserName, setStats, setAnswers,
  };
}