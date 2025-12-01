/**
 * IndexedDB Service for Decentralized Data Persistence
 * Provides local-first storage with offline support
 */

const DB_NAME = 'ita-rp-game-db';
const DB_VERSION = 1;

interface StoredData<T> {
  id: string;
  data: T;
  timestamp: number;
  version: number;
  checksum: string;
}

interface SyncMetadata {
  lastSyncTime: number;
  syncedPeers: string[];
  conflictResolution: 'local' | 'remote' | 'merge';
}

export class IndexedDBService {
  private db: IDBDatabase | null = null;
  private readonly stores = {
    player: 'player_data',
    curriculum: 'curriculum_data',
    achievements: 'achievements_data',
    sessions: 'study_sessions',
    sync: 'sync_metadata',
    backup: 'backup_data',
  };

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Player data store
        if (!db.objectStoreNames.contains(this.stores.player)) {
          const playerStore = db.createObjectStore(this.stores.player, { keyPath: 'id' });
          playerStore.createIndex('timestamp', 'timestamp', { unique: false });
          playerStore.createIndex('version', 'version', { unique: false });
        }

        // Curriculum data store
        if (!db.objectStoreNames.contains(this.stores.curriculum)) {
          const curriculumStore = db.createObjectStore(this.stores.curriculum, { keyPath: 'id' });
          curriculumStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Achievements store
        if (!db.objectStoreNames.contains(this.stores.achievements)) {
          const achievementsStore = db.createObjectStore(this.stores.achievements, { keyPath: 'id' });
          achievementsStore.createIndex('unlockedAt', 'unlockedAt', { unique: false });
        }

        // Study sessions store
        if (!db.objectStoreNames.contains(this.stores.sessions)) {
          const sessionsStore = db.createObjectStore(this.stores.sessions, { keyPath: 'id' });
          sessionsStore.createIndex('startTime', 'startTime', { unique: false });
          sessionsStore.createIndex('skillId', 'skillId', { unique: false });
        }

        // Sync metadata store
        if (!db.objectStoreNames.contains(this.stores.sync)) {
          db.createObjectStore(this.stores.sync, { keyPath: 'id' });
        }

        // Backup store for version history
        if (!db.objectStoreNames.contains(this.stores.backup)) {
          const backupStore = db.createObjectStore(this.stores.backup, { keyPath: 'id' });
          backupStore.createIndex('timestamp', 'timestamp', { unique: false });
          backupStore.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  private generateChecksum(data: unknown): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private wrapData<T>(id: string, data: T, version: number = 1): StoredData<T> {
    return {
      id,
      data,
      timestamp: Date.now(),
      version,
      checksum: this.generateChecksum(data),
    };
  }

  // Generic CRUD operations
  async save<T>(storeName: string, id: string, data: T): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const wrapped = this.wrapData(id, data);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.put(wrapped);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, id: string): Promise<StoredData<T> | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<StoredData<T>[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Player-specific operations
  async savePlayer(playerData: unknown): Promise<void> {
    // Create backup before saving
    await this.createBackup('player', playerData);
    await this.save(this.stores.player, 'current', playerData);
  }

  async getPlayer<T>(): Promise<T | null> {
    const result = await this.get<T>(this.stores.player, 'current');
    return result?.data || null;
  }

  // Study sessions
  async saveSession(session: unknown): Promise<void> {
    const id = `session_${Date.now()}`;
    await this.save(this.stores.sessions, id, session);
  }

  async getSessions<T>(limit?: number): Promise<T[]> {
    const all = await this.getAll<T>(this.stores.sessions);
    const sorted = all.sort((a, b) => b.timestamp - a.timestamp);
    return limit ? sorted.slice(0, limit).map(s => s.data) : sorted.map(s => s.data);
  }

  // Backup system
  async createBackup(type: string, data: unknown): Promise<string> {
    const id = `backup_${type}_${Date.now()}`;
    const backupData = {
      id,
      type,
      data,
      timestamp: Date.now(),
    };

    await this.save(this.stores.backup, id, backupData);

    // Keep only last 10 backups per type
    await this.pruneBackups(type, 10);

    return id;
  }

  private async pruneBackups(type: string, keep: number): Promise<void> {
    const all = await this.getAll<{ type: string; timestamp: number }>(this.stores.backup);
    const typeBackups = all.filter(b => b.data.type === type);

    if (typeBackups.length > keep) {
      const toDelete = typeBackups
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(0, typeBackups.length - keep);

      for (const backup of toDelete) {
        await this.delete(this.stores.backup, backup.id);
      }
    }
  }

  async getBackups(type?: string): Promise<unknown[]> {
    const all = await this.getAll<{ type: string; data: unknown }>(this.stores.backup);
    const filtered = type ? all.filter(b => b.data.type === type) : all;
    return filtered.sort((a, b) => b.timestamp - a.timestamp).map(b => b.data);
  }

  async restoreBackup(backupId: string): Promise<unknown | null> {
    const backup = await this.get<{ type: string; data: unknown }>(this.stores.backup, backupId);
    return backup?.data?.data || null;
  }

  // Sync metadata
  async updateSyncMetadata(metadata: Partial<SyncMetadata>): Promise<void> {
    const existing = await this.get<SyncMetadata>(this.stores.sync, 'metadata');
    const updated: SyncMetadata = {
      lastSyncTime: Date.now(),
      syncedPeers: [],
      conflictResolution: 'merge',
      ...(existing?.data || {}),
      ...metadata,
    };
    await this.save(this.stores.sync, 'metadata', updated);
  }

  async getSyncMetadata(): Promise<SyncMetadata | null> {
    const result = await this.get<SyncMetadata>(this.stores.sync, 'metadata');
    return result?.data || null;
  }

  // Export all data
  async exportAllData(): Promise<string> {
    const exportData = {
      version: DB_VERSION,
      exportedAt: new Date().toISOString(),
      player: await this.getPlayer(),
      sessions: await this.getSessions(100),
      achievements: (await this.getAll(this.stores.achievements)).map(a => a.data),
      syncMetadata: await this.getSyncMetadata(),
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Import data
  async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);

      if (data.player) {
        await this.savePlayer(data.player);
      }

      if (data.sessions && Array.isArray(data.sessions)) {
        for (const session of data.sessions) {
          await this.saveSession(session);
        }
      }

      if (data.achievements && Array.isArray(data.achievements)) {
        for (const achievement of data.achievements) {
          await this.save(this.stores.achievements, achievement.id, achievement);
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Database info
  async getDatabaseStats(): Promise<{
    playerRecords: number;
    sessionRecords: number;
    achievementRecords: number;
    backupRecords: number;
    totalSize: string;
  }> {
    const player = await this.getAll(this.stores.player);
    const sessions = await this.getAll(this.stores.sessions);
    const achievements = await this.getAll(this.stores.achievements);
    const backups = await this.getAll(this.stores.backup);

    const totalData = [...player, ...sessions, ...achievements, ...backups];
    const totalSize = new Blob([JSON.stringify(totalData)]).size;

    return {
      playerRecords: player.length,
      sessionRecords: sessions.length,
      achievementRecords: achievements.length,
      backupRecords: backups.length,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
    };
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
export const indexedDBService = new IndexedDBService();
