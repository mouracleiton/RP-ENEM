/**
 * Study Analytics Module
 * Provides comprehensive analytics and historical data tracking for study sessions
 */

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  duration: number; // minutes
  skillId: string;
  skillName: string;
  disciplineId: string;
  disciplineName: string;
  performance: number; // 0-100
  xpEarned: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionsAnswered: number;
  correctAnswers: number;
  hintsUsed: number;
  completionRate: number; // 0-100
  reviewCards?: number; // for spaced repetition
  focusScore?: number; // 0-100 based on time between interactions
}

export interface DailyStats {
  date: string;
  totalStudyTime: number;
  sessionsCount: number;
  skillsStudied: string[];
  totalXPEarned: number;
  averagePerformance: number;
  averageCompletionRate: number;
  streakDay: boolean;
  disciplineBreakdown: Record<string, {
    time: number;
    xp: number;
    skills: number;
  }>;
}

export interface WeeklyStats {
  weekStart: string;
  totalStudyTime: number;
  sessionsCount: number;
  skillsStudied: number;
  totalXPEarned: number;
  averagePerformance: number;
  averageCompletionRate: number;
  streakDays: number;
  longestSession: number;
  mostProductiveDay: string;
  disciplineFocus: string; // most studied discipline
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  totalStudyTime: number;
  sessionsCount: number;
  skillsStudied: number;
  totalXPEarned: number;
  averagePerformance: number;
  averageCompletionRate: number;
  activeDays: number;
  longestStreak: number;
  disciplineDistribution: Record<string, number>; // percentage per discipline
}

export interface SkillProgress {
  skillId: string;
  skillName: string;
  disciplineId: string;
  disciplineName: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  totalStudyTime: number;
  sessionCount: number;
  firstStudied: string;
  lastStudied: string;
  averagePerformance: number;
  averageCompletionRate: number;
  currentMastery: number; // 0-100 based on spaced repetition
  reviewsCount: number;
  nextReviewDate?: string;
  trends: {
    performance: 'improving' | 'stable' | 'declining';
    completion: 'improving' | 'stable' | 'declining';
    time: 'increasing' | 'stable' | 'decreasing';
  };
}

export interface LearningInsights {
  peakProductivityHours: number[];
  averageSessionLength: number;
  optimalSessionLength: number;
  disciplineStrengths: string[];
  improvementAreas: string[];
  learningVelocity: number; // skills per week
  retentionRate: number; // based on review performance
  studyConsistency: number; // 0-100 based on regularity
  nextMilestones: Array<{
    type: 'level' | 'skill' | 'streak';
    description: string;
    estimatedDays: number;
  }>;
}

const STORAGE_KEY = 'ita-rp-study-analytics';

class StudyAnalyticsService {
  private sessions: StudySession[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.sessions = data.sessions || [];
      }
    } catch (error) {
      console.error('Error loading study analytics:', error);
      this.sessions = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sessions: this.sessions,
        lastUpdated: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error saving study analytics:', error);
    }
  }

  // Add a new study session
  addSession(session: Omit<StudySession, 'id'>): void {
    const newSession: StudySession = {
      ...session,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    this.sessions.push(newSession);
    this.saveToStorage();
  }

  // Get all sessions
  getSessions(): StudySession[] {
    return [...this.sessions];
  }

  // Get sessions in date range
  getSessionsByDateRange(startDate: string, endDate: string): StudySession[] {
    return this.sessions.filter(session =>
      session.date >= startDate && session.date <= endDate
    );
  }

  // Get sessions for specific skill
  getSessionsBySkill(skillId: string): StudySession[] {
    return this.sessions.filter(session => session.skillId === skillId);
  }

  // Get daily stats for the last N days
  getDailyStats(days: number = 30): DailyStats[] {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    const stats: DailyStats[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const daySessions = this.sessions.filter(s => s.date === dateStr);

      if (daySessions.length === 0) {
        // Include empty days for streak tracking
        stats.push({
          date: dateStr,
          totalStudyTime: 0,
          sessionsCount: 0,
          skillsStudied: [],
          totalXPEarned: 0,
          averagePerformance: 0,
          averageCompletionRate: 0,
          streakDay: false,
          disciplineBreakdown: {},
        });
      } else {
        const skillsStudied = [...new Set(daySessions.map(s => s.skillId))];
        const totalStudyTime = daySessions.reduce((sum, s) => sum + s.duration, 0);
        const totalXPEarned = daySessions.reduce((sum, s) => sum + s.xpEarned, 0);

        const disciplineBreakdown: Record<string, { time: number; xp: number; skills: number }> = {};
        daySessions.forEach(session => {
          if (!disciplineBreakdown[session.disciplineId]) {
            disciplineBreakdown[session.disciplineId] = { time: 0, xp: 0, skills: new Set().size };
          }
          disciplineBreakdown[session.disciplineId].time += session.duration;
          disciplineBreakdown[session.disciplineId].xp += session.xpEarned;
        });

        Object.keys(disciplineBreakdown).forEach(disciplineId => {
          disciplineBreakdown[disciplineId].skills =
            [...new Set(daySessions.filter(s => s.disciplineId === disciplineId).map(s => s.skillId))].length;
        });

        stats.push({
          date: dateStr,
          totalStudyTime,
          sessionsCount: daySessions.length,
          skillsStudied,
          totalXPEarned,
          averagePerformance: daySessions.reduce((sum, s) => sum + s.performance, 0) / daySessions.length,
          averageCompletionRate: daySessions.reduce((sum, s) => sum + s.completionRate, 0) / daySessions.length,
          streakDay: totalStudyTime > 0,
          disciplineBreakdown,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return stats;
  }

  // Get weekly stats
  getWeeklyStats(weeks: number = 12): WeeklyStats[] {
    const dailyStats = this.getDailyStats(weeks * 7);
    const weeklyStats: WeeklyStats[] = [];

    for (let i = 0; i < dailyStats.length; i += 7) {
      const weekData = dailyStats.slice(i, i + 7);
      if (weekData.length === 0) break;

      const totalStudyTime = weekData.reduce((sum, day) => sum + day.totalStudyTime, 0);
      const sessionsCount = weekData.reduce((sum, day) => sum + day.sessionsCount, 0);
      const skillsStudied = new Set(
        weekData.flatMap(day => day.skillsStudied)
      ).size;
      const totalXPEarned = weekData.reduce((sum, day) => sum + day.totalXPEarned, 0);
      const streakDays = weekData.filter(day => day.streakDay).length;

      const sessionsWithPerformance = weekData.filter(day => day.averagePerformance > 0);
      const averagePerformance = sessionsWithPerformance.length > 0
        ? sessionsWithPerformance.reduce((sum, day) => sum + day.averagePerformance, 0) / sessionsWithPerformance.length
        : 0;

      const sessionsWithCompletion = weekData.filter(day => day.averageCompletionRate > 0);
      const averageCompletionRate = sessionsWithCompletion.length > 0
        ? sessionsWithCompletion.reduce((sum, day) => sum + day.averageCompletionRate, 0) / sessionsWithCompletion.length
        : 0;

      const longestSession = Math.max(...weekData.map(day => day.totalStudyTime));
      const mostProductiveDay = weekData.reduce((max, day) =>
        day.totalStudyTime > max.totalStudyTime ? day : max
      ).date;

      // Find most studied discipline
      const disciplineTime: Record<string, number> = {};
      weekData.forEach(day => {
        Object.entries(day.disciplineBreakdown).forEach(([disciplineId, data]) => {
          disciplineTime[disciplineId] = (disciplineTime[disciplineId] || 0) + data.time;
        });
      });
      const disciplineFocus = Object.entries(disciplineTime).reduce((max, [disciplineId, time]) =>
        time > disciplineTime[max] ? disciplineId : max, Object.keys(disciplineTime)[0] || '');

      weeklyStats.push({
        weekStart: weekData[0].date,
        totalStudyTime,
        sessionsCount,
        skillsStudied,
        totalXPEarned,
        averagePerformance,
        averageCompletionRate,
        streakDays,
        longestSession,
        mostProductiveDay,
        disciplineFocus,
      });
    }

    return weeklyStats.reverse();
  }

  // Get skill progress data
  getSkillProgress(): SkillProgress[] {
    const skillMap = new Map<string, StudySession[]>();

    this.sessions.forEach(session => {
      if (!skillMap.has(session.skillId)) {
        skillMap.set(session.skillId, []);
      }
      skillMap.get(session.skillId)!.push(session);
    });

    return Array.from(skillMap.entries()).map(([skillId, sessions]) => {
      const sortedSessions = sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const firstSession = sortedSessions[0];
      const lastSession = sortedSessions[sortedSessions.length - 1];

      const totalStudyTime = sessions.reduce((sum, s) => sum + s.duration, 0);
      const totalXPEarned = sessions.reduce((sum, s) => sum + s.xpEarned, 0);
      const averagePerformance = sessions.reduce((sum, s) => sum + s.performance, 0) / sessions.length;
      const averageCompletionRate = sessions.reduce((sum, s) => sum + s.completionRate, 0) / sessions.length;

      // Calculate trends
      const recentSessions = sortedSessions.slice(-5);
      const olderSessions = sortedSessions.slice(0, Math.max(1, sortedSessions.length - 5));

      const recentAvgPerformance = recentSessions.reduce((sum, s) => sum + s.performance, 0) / recentSessions.length;
      const olderAvgPerformance = olderSessions.reduce((sum, s) => sum + s.performance, 0) / olderSessions.length;

      const recentAvgCompletion = recentSessions.reduce((sum, s) => sum + s.completionRate, 0) / recentSessions.length;
      const olderAvgCompletion = olderSessions.reduce((sum, s) => sum + s.completionRate, 0) / olderSessions.length;

      const recentAvgTime = recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length;
      const olderAvgTime = olderSessions.reduce((sum, s) => sum + s.duration, 0) / olderSessions.length;

      return {
        skillId,
        skillName: firstSession.skillName,
        disciplineId: firstSession.disciplineId,
        disciplineName: firstSession.disciplineName,
        difficulty: firstSession.difficulty,
        totalStudyTime,
        sessionCount: sessions.length,
        firstStudied: firstSession.date,
        lastStudied: lastSession.date,
        averagePerformance,
        averageCompletionRate,
        currentMastery: Math.min(100, averagePerformance * (sessions.length / 10)), // Simple mastery calculation
        reviewsCount: sessions.reduce((sum, s) => sum + (s.reviewCards || 0), 0),
        trends: {
          performance: recentAvgPerformance > olderAvgPerformance + 5 ? 'improving' :
                     recentAvgPerformance < olderAvgPerformance - 5 ? 'declining' : 'stable',
          completion: recentAvgCompletion > olderAvgCompletion + 5 ? 'improving' :
                     recentAvgCompletion < olderAvgCompletion - 5 ? 'declining' : 'stable',
          time: recentAvgTime > olderAvgTime + 10 ? 'increasing' :
                  recentAvgTime < olderAvgTime - 10 ? 'decreasing' : 'stable',
        },
      };
    });
  }

  // Generate learning insights
  getLearningInsights(): LearningInsights {
    const dailyStats = this.getDailyStats(30);
    const sessions = this.sessions;

    // Peak productivity hours
    const hourlyPerformance = new Map<number, number[]>();
    sessions.forEach(session => {
      const hour = parseInt(session.startTime.split(':')[0]);
      if (!hourlyPerformance.has(hour)) {
        hourlyPerformance.set(hour, []);
      }
      hourlyPerformance.get(hour)!.push(session.performance);
    });

    const peakProductivityHours = Array.from(hourlyPerformance.entries())
      .map(([hour, performances]) => ({
        hour,
        avg: performances.reduce((sum, p) => sum + p, 0) / performances.length,
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3)
      .map(item => item.hour);

    const averageSessionLength = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length
      : 0;

    // Find optimal session length (where performance is highest)
    const sessionLengthPerformance = sessions.reduce((acc, session) => {
      const lengthGroup = Math.floor(session.duration / 15) * 15; // Group by 15min intervals
      if (!acc[lengthGroup]) acc[lengthGroup] = [];
      acc[lengthGroup].push(session.performance);
      return acc;
    }, {} as Record<number, number[]>);

    const optimalSessionLength = Object.entries(sessionLengthPerformance)
      .map(([length, performances]) => ({
        length: parseInt(length),
        avg: performances.reduce((sum, p) => sum + p, 0) / performances.length,
      }))
      .sort((a, b) => b.avg - a.avg)[0]?.length || averageSessionLength;

    // Discipline strengths (best performing disciplines)
    const disciplineStats = new Map<string, number[]>();
    sessions.forEach(session => {
      if (!disciplineStats.has(session.disciplineId)) {
        disciplineStats.set(session.disciplineId, []);
      }
      disciplineStats.get(session.disciplineId)!.push(session.performance);
    });

    const disciplineStrengths = Array.from(disciplineStats.entries())
      .map(([disciplineId, performances]) => ({
        disciplineId,
        avg: performances.reduce((sum, p) => sum + p, 0) / performances.length,
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3)
      .map(item => item.disciplineId);

    const improvementAreas = Array.from(disciplineStats.entries())
      .filter(([_, performances]) => performances.length >= 3)
      .map(([disciplineId, performances]) => ({
        disciplineId,
        avg: performances.reduce((sum, p) => sum + p, 0) / performances.length,
      }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 3)
      .map(item => item.disciplineId);

    // Learning velocity (skills per week in last 4 weeks)
    const recentSessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      return sessionDate >= fourWeeksAgo;
    });
    const learningVelocity = new Set(recentSessions.map(s => s.skillId)).size / 4;

    // Study consistency (percentage of days with study in last 30 days)
    const studyConsistency = (dailyStats.filter(day => day.totalStudyTime > 0).length / dailyStats.length) * 100;

    return {
      peakProductivityHours,
      averageSessionLength,
      optimalSessionLength,
      disciplineStrengths,
      improvementAreas,
      learningVelocity,
      retentionRate: 85, // Would calculate from spaced repetition data
      studyConsistency,
      nextMilestones: [
        {
          type: 'level' as const,
          description: 'Próximo nível',
          estimatedDays: 7,
        },
        {
          type: 'skill' as const,
          description: '10 habilidades completas',
          estimatedDays: 14,
        },
        {
          type: 'streak' as const,
          description: '30 dias de streak',
          estimatedDays: 30 - (dailyStats.filter(day => day.streakDay).slice(-30).length || 0),
        },
      ],
    };
  }

  // Export data for backup
  exportData(): string {
    return JSON.stringify({
      sessions: this.sessions,
      dailyStats: this.getDailyStats(365),
      weeklyStats: this.getWeeklyStats(52),
      skillProgress: this.getSkillProgress(),
      insights: this.getLearningInsights(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  // Import data from backup
  importData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.sessions && Array.isArray(parsed.sessions)) {
        this.sessions = parsed.sessions;
        this.saveToStorage();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Clear all data
  clearData(): void {
    this.sessions = [];
    this.saveToStorage();
  }
}

// Export singleton instance
export const studyAnalytics = new StudyAnalyticsService();

// Export React hook
export function useStudyAnalytics() {
  return {
    addSession: (session: Omit<StudySession, 'id'>) => studyAnalytics.addSession(session),
    getSessions: () => studyAnalytics.getSessions(),
    getDailyStats: (days?: number) => studyAnalytics.getDailyStats(days),
    getWeeklyStats: (weeks?: number) => studyAnalytics.getWeeklyStats(weeks),
    getSkillProgress: () => studyAnalytics.getSkillProgress(),
    getLearningInsights: () => studyAnalytics.getLearningInsights(),
    exportData: () => studyAnalytics.exportData(),
    importData: (data: string) => studyAnalytics.importData(data),
    clearData: () => studyAnalytics.clearData(),
  };
}