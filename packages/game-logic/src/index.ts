export { useGameStore, AERONAUTICS_RANKS } from './store';
export { XPSystem } from './xp-system';
export { RankSystem } from './rank-system';
export { AchievementSystem, ALL_ACHIEVEMENTS } from './achievement-system';
export {
  DailyChallengeSystem,
  dailyChallengeSystem,
  useDailyChallenges,
  type DailyChallenge,
  type ChallengeType,
} from './daily-challenges';

// Persistence exports
export {
  IndexedDBService,
  indexedDBService,
  P2PSyncService,
  p2pSyncService,
  DecentralizedStorageService,
  decentralizedStorage,
  useDecentralizedStorage,
  useGamePersistence,
} from './persistence';

// Study session exports
export {
  useStudySession,
  getStudyHistory,
  getSkillPerformanceHistory,
  getAveragePerformance,
  type StudySessionData,
  type StudySessionStep,
} from './useStudySession';

// PWA exports
export { usePWA } from './usePWA';

// Notification exports
export {
  useStreakNotifications,
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  canSendNotifications,
  sendNotification,
  sendStreakReminder,
  sendDailyChallengeReminder,
  sendAchievementNotification,
  initializeNotifications,
  type NotificationSettings,
} from './streak-notifications';
