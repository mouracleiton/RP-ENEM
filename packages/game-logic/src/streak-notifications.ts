/**
 * Streak Notification System
 * Manages notifications to help users maintain their study streak
 */

// Extended NotificationOptions to include experimental/newer properties
interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  renotify?: boolean;
  actions?: Array<{ action: string; title: string; icon?: string }>;
}

const NOTIFICATION_SETTINGS_KEY = 'ita-rp-notification-settings';
const SCHEDULED_NOTIFICATIONS_KEY = 'ita-rp-scheduled-notifications';

interface NotificationSettings {
  enabled: boolean;
  reminderTime: string; // HH:mm format
  streakReminder: boolean;
  dailyChallengeReminder: boolean;
  achievementNotifications: boolean;
}

interface ScheduledNotification {
  id: string;
  type: 'streak_reminder' | 'daily_challenge' | 'streak_at_risk' | 'achievement';
  title: string;
  body: string;
  scheduledFor: number; // timestamp
  sent: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  reminderTime: '19:00', // 7 PM default
  streakReminder: true,
  dailyChallengeReminder: true,
  achievementNotifications: true,
};

// Get notification settings
export function getNotificationSettings(): NotificationSettings {
  try {
    const data = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error loading notification settings:', error);
  }
  return DEFAULT_SETTINGS;
}

// Save notification settings
export function saveNotificationSettings(settings: Partial<NotificationSettings>): void {
  try {
    const current = getNotificationSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Check if notifications are available
export function canSendNotifications(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

// Send a local notification
export function sendNotification(
  title: string,
  options: ExtendedNotificationOptions & { onClick?: () => void } = {}
): Notification | null {
  if (!canSendNotifications()) {
    console.log('Cannot send notification - permission not granted');
    return null;
  }

  const settings = getNotificationSettings();
  if (!settings.enabled) {
    console.log('Notifications disabled by user');
    return null;
  }

  const { onClick, ...notificationOptions } = options;

  // Cast to any since we're using extended notification options that TypeScript doesn't fully recognize
  const notification = new Notification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    ...notificationOptions,
  } as NotificationOptions);

  if (onClick) {
    notification.onclick = () => {
      onClick();
      notification.close();
    };
  }

  return notification;
}

// Send streak reminder notification
export function sendStreakReminder(currentStreak: number, hasStudiedToday: boolean): void {
  const settings = getNotificationSettings();

  if (!settings.streakReminder) {
    return;
  }

  if (hasStudiedToday) {
    // Already studied today, no reminder needed
    return;
  }

  let title: string;
  let body: string;
  let icon: string = '🔥';

  if (currentStreak === 0) {
    title = 'Comece sua sequência!';
    body = 'Estude hoje para iniciar uma nova sequência de estudos!';
    icon = '🚀';
  } else if (currentStreak < 7) {
    title = 'Mantenha sua sequência!';
    body = `Você está com ${currentStreak} dias seguidos. Estude hoje para continuar!`;
  } else if (currentStreak < 30) {
    title = 'Sequência em risco!';
    body = `Não perca sua sequência de ${currentStreak} dias! Estude agora.`;
    icon = '⚠️';
  } else {
    title = 'Sequência incrível em risco!';
    body = `Sua sequência de ${currentStreak} dias está em risco! Não deixe escapar!`;
    icon = '🏆';
  }

  sendNotification(title, {
    body,
    tag: 'streak-reminder', // Prevents duplicate notifications
    renotify: true,
    data: { type: 'streak_reminder', streak: currentStreak },
    actions: [
      { action: 'study', title: '📚 Estudar Agora' },
      { action: 'dismiss', title: 'Depois' },
    ],
  });
}

// Send daily challenge reminder
export function sendDailyChallengeReminder(completedCount: number, totalCount: number): void {
  const settings = getNotificationSettings();

  if (!settings.dailyChallengeReminder) {
    return;
  }

  if (completedCount >= totalCount) {
    // All challenges completed
    return;
  }

  const remaining = totalCount - completedCount;

  sendNotification('Missões Diárias Pendentes', {
    body: `Você ainda tem ${remaining} ${remaining === 1 ? 'missão' : 'missões'} para completar hoje!`,
    tag: 'daily-challenge-reminder',
    renotify: true,
    data: { type: 'daily_challenge', remaining },
    actions: [
      { action: 'challenges', title: '🎯 Ver Missões' },
      { action: 'dismiss', title: 'Depois' },
    ],
  });
}

// Send achievement notification
export function sendAchievementNotification(
  achievementName: string,
  achievementDescription: string
): void {
  const settings = getNotificationSettings();

  if (!settings.achievementNotifications) {
    return;
  }

  sendNotification('🏆 Nova Conquista!', {
    body: `${achievementName}: ${achievementDescription}`,
    tag: `achievement-${achievementName}`,
    data: { type: 'achievement', name: achievementName },
  });
}

// Schedule a daily reminder
export function scheduleDailyReminder(): void {
  const settings = getNotificationSettings();

  if (!settings.enabled || !settings.streakReminder) {
    return;
  }

  // Parse reminder time
  const [hours, minutes] = settings.reminderTime.split(':').map(Number);

  // Calculate next reminder time
  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(hours, minutes, 0, 0);

  // If time already passed today, schedule for tomorrow
  if (reminderTime <= now) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }

  const delay = reminderTime.getTime() - now.getTime();

  // Store scheduled notification info
  const scheduled: ScheduledNotification = {
    id: `daily-${Date.now()}`,
    type: 'streak_reminder',
    title: 'Lembrete de Estudos',
    body: 'Não esqueça de estudar hoje para manter sua sequência!',
    scheduledFor: reminderTime.getTime(),
    sent: false,
  };

  saveScheduledNotification(scheduled);

  // Schedule the notification (will be handled by the app when it's open)
  setTimeout(() => {
    // Check if user already studied today before sending
    const lastStudyDate = localStorage.getItem('ita-rp-last-study-date');
    const today = new Date().toDateString();

    if (lastStudyDate !== today) {
      sendStreakReminder(
        getStoredStreak(),
        false
      );
    }

    // Reschedule for next day
    scheduleDailyReminder();
  }, delay);

  console.log(`[Notifications] Daily reminder scheduled for ${reminderTime.toLocaleString()}`);
}

// Get stored streak (helper)
function getStoredStreak(): number {
  try {
    const gameState = localStorage.getItem('ita-rp-game-storage');
    if (gameState) {
      const data = JSON.parse(gameState);
      return data.state?.player?.currentStreak || 0;
    }
  } catch {
    // Ignore errors
  }
  return 0;
}

// Save scheduled notification
function saveScheduledNotification(notification: ScheduledNotification): void {
  try {
    const data = localStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    const notifications: ScheduledNotification[] = data ? JSON.parse(data) : [];

    // Remove old notifications of same type
    const filtered = notifications.filter(n => n.type !== notification.type);
    filtered.push(notification);

    // Keep only last 10
    const trimmed = filtered.slice(-10);

    localStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving scheduled notification:', error);
  }
}

// Initialize notification system
export function initializeNotifications(): void {
  // Request permission if not already granted
  if ('Notification' in window && Notification.permission === 'default') {
    // Don't auto-request, let user trigger it
    console.log('[Notifications] Permission not yet requested');
  }

  // Schedule daily reminder if enabled
  const settings = getNotificationSettings();
  if (settings.enabled && settings.streakReminder) {
    scheduleDailyReminder();
  }
}

// Hook for React components
import { useState, useEffect, useCallback } from 'react';

export function useStreakNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  useEffect(() => {
    // Listen for permission changes (some browsers support this)
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' as PermissionName })
        .then(status => {
          status.onchange = () => {
            setPermissionStatus(Notification.permission);
          };
        })
        .catch(() => {
          // Permissions API not fully supported
        });
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(Notification.permission);
    return granted;
  }, []);

  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    saveNotificationSettings(updates);
    setSettings(getNotificationSettings());

    // Reschedule reminders if needed
    if (updates.enabled !== undefined || updates.reminderTime !== undefined) {
      scheduleDailyReminder();
    }
  }, []);

  const sendTestNotification = useCallback(() => {
    sendNotification('Teste de Notificação', {
      body: 'As notificações estão funcionando corretamente!',
      tag: 'test',
    });
  }, []);

  return {
    settings,
    permissionStatus,
    canNotify: canSendNotifications(),
    requestPermission,
    updateSettings,
    sendTestNotification,
    sendStreakReminder,
    sendDailyChallengeReminder,
    sendAchievementNotification,
  };
}

export type { NotificationSettings, ScheduledNotification };
