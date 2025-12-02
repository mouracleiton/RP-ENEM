/**
 * Weekly Activity Module
 * Provides real data for weekly activity visualization
 */

import { getStudyHistory, type StudySessionData } from './useStudySession';

export interface DayActivity {
  day: string;
  dayIndex: number;
  date: string;
  active: boolean;
  minutes: number;
  sessions: number;
  avgPerformance: number;
}

export interface WeeklyActivityData {
  days: DayActivity[];
  totalMinutes: number;
  totalSessions: number;
  activeDays: number;
  avgMinutesPerDay: number;
  bestDay: DayActivity | null;
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Get weekly activity data based on real study history
 */
export function getWeeklyActivity(): WeeklyActivityData {
  const history = getStudyHistory();
  const today = new Date();
  const todayIndex = today.getDay();

  // Initialize days for the current week
  const days: DayActivity[] = DAY_NAMES.map((day, index) => {
    const date = new Date(today);
    const diff = index - todayIndex;
    date.setDate(date.getDate() + diff);

    return {
      day,
      dayIndex: index,
      date: date.toISOString().split('T')[0],
      active: false,
      minutes: 0,
      sessions: 0,
      avgPerformance: 0,
    };
  });

  // Process history to fill in activity
  const dateMap = new Map<string, { minutes: number; sessions: number; totalScore: number }>();

  history.forEach((session) => {
    const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
    const existing = dateMap.get(sessionDate) || { minutes: 0, sessions: 0, totalScore: 0 };

    dateMap.set(sessionDate, {
      minutes: existing.minutes + Math.round(session.totalTimeSpent / 60),
      sessions: existing.sessions + 1,
      totalScore: existing.totalScore + session.quizScore,
    });
  });

  // Fill in the days with activity data
  days.forEach((dayData) => {
    const activity = dateMap.get(dayData.date);
    if (activity) {
      dayData.active = true;
      dayData.minutes = activity.minutes;
      dayData.sessions = activity.sessions;
      dayData.avgPerformance =
        activity.sessions > 0 ? Math.round(activity.totalScore / activity.sessions) : 0;
    }
  });

  // Calculate summary stats
  const activeDays = days.filter((d) => d.active);
  const totalMinutes = activeDays.reduce((sum, d) => sum + d.minutes, 0);
  const totalSessions = activeDays.reduce((sum, d) => sum + d.sessions, 0);
  const avgMinutesPerDay = activeDays.length > 0 ? Math.round(totalMinutes / activeDays.length) : 0;

  // Find best day
  let bestDay: DayActivity | null = null;
  if (activeDays.length > 0) {
    bestDay = activeDays.reduce((best, current) =>
      current.minutes > best.minutes ? current : best
    );
  }

  return {
    days,
    totalMinutes,
    totalSessions,
    activeDays: activeDays.length,
    avgMinutesPerDay,
    bestDay,
  };
}

/**
 * Get activity data for the last N weeks
 */
export function getMonthlyActivity(weeks: number = 4): WeeklyActivityData[] {
  const results: WeeklyActivityData[] = [];
  const history = getStudyHistory();
  const today = new Date();

  for (let week = 0; week < weeks; week++) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() - week * 7);

    const days: DayActivity[] = DAY_NAMES.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + index);

      return {
        day,
        dayIndex: index,
        date: date.toISOString().split('T')[0],
        active: false,
        minutes: 0,
        sessions: 0,
        avgPerformance: 0,
      };
    });

    // Process history for this week
    history.forEach((session) => {
      const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
      const dayData = days.find((d) => d.date === sessionDate);

      if (dayData) {
        dayData.active = true;
        dayData.minutes += Math.round(session.totalTimeSpent / 60);
        dayData.sessions += 1;
        // Update average (simplified)
        dayData.avgPerformance = Math.round(
          (dayData.avgPerformance * (dayData.sessions - 1) + session.quizScore) / dayData.sessions
        );
      }
    });

    const activeDays = days.filter((d) => d.active);
    const totalMinutes = activeDays.reduce((sum, d) => sum + d.minutes, 0);
    const totalSessions = activeDays.reduce((sum, d) => sum + d.sessions, 0);

    results.push({
      days,
      totalMinutes,
      totalSessions,
      activeDays: activeDays.length,
      avgMinutesPerDay: activeDays.length > 0 ? Math.round(totalMinutes / activeDays.length) : 0,
      bestDay:
        activeDays.length > 0
          ? activeDays.reduce((best, current) => (current.minutes > best.minutes ? current : best))
          : null,
    });
  }

  return results;
}

/**
 * React hook for weekly activity
 */
export function useWeeklyActivity() {
  const weekly = getWeeklyActivity();
  const monthly = getMonthlyActivity(4);

  return {
    currentWeek: weekly,
    lastFourWeeks: monthly,
    hasActivity: weekly.totalSessions > 0,
  };
}
