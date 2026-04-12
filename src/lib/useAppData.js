import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const ADMIN_EMAIL = 'anas6.7q@gmail.com';

const cache = {
  user: null, stats: null, questions: null, answers: null,
  allStats: null, settings: null, userBadges: null, allBadges: null, lastFetch: {},
};
const CACHE_TTL = 30000;

function shouldRefetch(key) {
  return Date.now() - (cache.lastFetch[key] || 0) > CACHE_TTL;
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
    const q = await base44.entities.Question.filter({ is_published: true }, 'day_number');
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
    const s = await base44.entities.AppSettings.list();
    cache.settings = s; cache.lastFetch.settings = Date.now();
    if (mounted.current) setSettings(s);
    return s;
  }, []);

  const fetchUserBadges = useCallback(async (email) => {
    if (!shouldRefetch('userBadges') && cache.userBadges) return cache.userBadges;
    const b = await base44.entities.UserBadge.filter({ user_email: email });
    cache.userBadges = b; cache.lastFetch.userBadges = Date.now();
    if (mounted.current) setUserBadges(b);
    return b;
  }, []);

  const fetchAllBadges = useCallback(async () => {
    if (!shouldRefetch('allBadges') && cache.allBadges?.length) return cache.allBadges;
    const b = await base44.entities.Badge.list('-created_date', 100);
    cache.allBadges = b; cache.lastFetch.allBadges = Date.now();
    if (mounted.current) setAllBadges(b);
    return b;
  }, []);

  const initAll = useCallback(async () => {
    setLoading(true);
    const u = await fetchUser();
    await Promise.all([
      fetchStats(u.email), fetchQuestions(), fetchAnswers(u.email),
      fetchAllStats(), fetchSettings(), fetchUserBadges(u.email), fetchAllBadges(),
    ]);
    if (mounted.current) setLoading(false);
  }, [fetchUser, fetchStats, fetchQuestions, fetchAnswers, fetchAllStats, fetchSettings, fetchUserBadges, fetchAllBadges]);

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

  return {
    user, stats, questions, answers, allStats, settings, userBadges, allBadges, loading,
    refreshStats, fetchAllStats, updateUserName, setStats, setAnswers,
  };
}