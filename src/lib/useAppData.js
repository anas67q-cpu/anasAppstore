import { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';

// Global cache for instant UI
const cache = {
  user: null,
  stats: null,
  questions: null,
  answers: null,
  allStats: null,
  settings: null,
  lastFetch: {},
};

const CACHE_TTL = 30000; // 30s cache

function shouldRefetch(key) {
  const last = cache.lastFetch[key] || 0;
  return Date.now() - last > CACHE_TTL;
}

export default function useAppData() {
  const [user, setUser] = useState(cache.user);
  const [stats, setStats] = useState(cache.stats);
  const [questions, setQuestions] = useState(cache.questions || []);
  const [answers, setAnswers] = useState(cache.answers || []);
  const [allStats, setAllStats] = useState(cache.allStats || []);
  const [settings, setSettings] = useState(cache.settings || []);
  const [loading, setLoading] = useState(!cache.user);
  const mounted = useRef(true);

  const fetchUser = useCallback(async () => {
    const u = await base44.auth.me();
    cache.user = u;
    cache.lastFetch.user = Date.now();
    if (mounted.current) setUser(u);
    return u;
  }, []);

  const fetchStats = useCallback(async (email) => {
    const s = await base44.entities.UserStats.filter({ user_email: email });
    const stat = s[0] || null;
    cache.stats = stat;
    cache.lastFetch.stats = Date.now();
    if (mounted.current) setStats(stat);
    return stat;
  }, []);

  const fetchQuestions = useCallback(async () => {
    if (!shouldRefetch('questions') && cache.questions) return cache.questions;
    const q = await base44.entities.Question.filter({ is_published: true }, '-day_number');
    cache.questions = q;
    cache.lastFetch.questions = Date.now();
    if (mounted.current) setQuestions(q);
    return q;
  }, []);

  const fetchAnswers = useCallback(async (email) => {
    if (!shouldRefetch('answers') && cache.answers) return cache.answers;
    const a = await base44.entities.Answer.filter({ user_email: email }, '-created_date');
    cache.answers = a;
    cache.lastFetch.answers = Date.now();
    if (mounted.current) setAnswers(a);
    return a;
  }, []);

  const fetchAllStats = useCallback(async () => {
    if (!shouldRefetch('allStats') && cache.allStats?.length) return cache.allStats;
    const s = await base44.entities.UserStats.list('-total_points', 100);
    cache.allStats = s;
    cache.lastFetch.allStats = Date.now();
    if (mounted.current) setAllStats(s);
    return s;
  }, []);

  const fetchSettings = useCallback(async () => {
    if (!shouldRefetch('settings') && cache.settings?.length) return cache.settings;
    const s = await base44.entities.AppSettings.list();
    cache.settings = s;
    cache.lastFetch.settings = Date.now();
    if (mounted.current) setSettings(s);
    return s;
  }, []);

  const initAll = useCallback(async () => {
    setLoading(true);
    const u = await fetchUser();
    // Fire all in parallel
    await Promise.all([
      fetchStats(u.email),
      fetchQuestions(),
      fetchAnswers(u.email),
      fetchAllStats(),
      fetchSettings(),
    ]);
    if (mounted.current) setLoading(false);
  }, [fetchUser, fetchStats, fetchQuestions, fetchAnswers, fetchAllStats, fetchSettings]);

  const refreshStats = useCallback(async () => {
    if (user) {
      cache.lastFetch.stats = 0;
      await fetchStats(user.email);
    }
  }, [user, fetchStats]);

  const refreshAll = useCallback(async () => {
    Object.keys(cache.lastFetch).forEach(k => cache.lastFetch[k] = 0);
    await initAll();
  }, [initAll]);

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
    user, stats, questions, answers, allStats, settings, loading,
    refreshStats, refreshAll, fetchAllStats, updateUserName,
    setStats, setAnswers,
  };
}