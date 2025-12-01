/**
 * Decentralized Storage Service
 * Unified interface for IndexedDB, P2P sync, and IPFS integration
 */

import { indexedDBService, IndexedDBService } from './IndexedDBService';
import { p2pSyncService, P2PSyncService } from './P2PSyncService';

export interface StorageConfig {
  enableIndexedDB: boolean;
  enableP2PSync: boolean;
  enableIPFS: boolean;
  ipfsGateway?: string;
  autoSync: boolean;
  syncInterval: number;
  encryptData: boolean;
}

export interface ExportOptions {
  includeAchievements: boolean;
  includeSessions: boolean;
  includeBackups: boolean;
  format: 'json' | 'encrypted';
}

export interface ImportResult {
  success: boolean;
  recordsImported: number;
  errors: string[];
}

export interface IPFSUploadResult {
  cid: string;
  url: string;
  size: number;
}

// Simple encryption using Web Crypto API
async function encryptData(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Derive key from password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBuffer
  );

  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  return btoa(String.fromCharCode(...combined));
}

async function decryptData(encryptedData: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const data = combined.slice(28);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return decoder.decode(decrypted);
}

export class DecentralizedStorageService {
  private indexedDB: IndexedDBService;
  private p2pSync: P2PSyncService;
  private config: StorageConfig;
  private syncIntervalId: NodeJS.Timeout | null = null;
  private initialized: boolean = false;
  private dataVersion: number = 1;

  constructor(config?: Partial<StorageConfig>) {
    this.indexedDB = indexedDBService;
    this.p2pSync = p2pSyncService;
    this.config = {
      enableIndexedDB: true,
      enableP2PSync: true,
      enableIPFS: true,
      ipfsGateway: 'https://ipfs.io/ipfs',
      autoSync: true,
      syncInterval: 60000, // 1 minute
      encryptData: false,
      ...config,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Initialize IndexedDB
    if (this.config.enableIndexedDB) {
      await this.indexedDB.initialize();
    }

    // Setup P2P sync listeners
    if (this.config.enableP2PSync) {
      this.p2pSync.on('data_received', async (event) => {
        if (event.data && this.config.enableIndexedDB) {
          const { key, value } = event.data as { key: string; value: unknown };
          await this.indexedDB.save('player_data', key, value);
        }
      });

      // Start heartbeat
      this.p2pSync.startHeartbeat();
    }

    // Start auto-sync if enabled
    if (this.config.autoSync && this.config.enableP2PSync) {
      this.startAutoSync();
    }

    this.initialized = true;
    console.log('Decentralized storage initialized');
  }

  // Player data operations
  async savePlayerData(playerId: string, data: unknown): Promise<void> {
    this.dataVersion++;

    // Save to IndexedDB
    if (this.config.enableIndexedDB) {
      await this.indexedDB.savePlayer({ ...data as object, _version: this.dataVersion });
    }

    // Sync to P2P peers
    if (this.config.enableP2PSync) {
      this.p2pSync.setLocalData(`player_${playerId}`, data, this.dataVersion);
    }
  }

  async loadPlayerData<T>(playerId: string): Promise<T | null> {
    // Try IndexedDB first
    if (this.config.enableIndexedDB) {
      const localData = await this.indexedDB.getPlayer<T>();
      if (localData) return localData;
    }

    // Try P2P sync
    if (this.config.enableP2PSync) {
      const p2pData = this.p2pSync.getLocalData(`player_${playerId}`);
      if (p2pData) return p2pData as T;
    }

    return null;
  }

  // Study session operations
  async saveStudySession(session: unknown): Promise<void> {
    if (this.config.enableIndexedDB) {
      await this.indexedDB.saveSession(session);
    }
  }

  async getStudySessions<T>(limit?: number): Promise<T[]> {
    if (this.config.enableIndexedDB) {
      return this.indexedDB.getSessions<T>(limit);
    }
    return [];
  }

  // Export operations
  async exportData(options?: Partial<ExportOptions>, password?: string): Promise<string> {
    const exportOptions: ExportOptions = {
      includeAchievements: true,
      includeSessions: true,
      includeBackups: false,
      format: 'json',
      ...options,
    };

    let exportJson: string;

    if (this.config.enableIndexedDB) {
      exportJson = await this.indexedDB.exportAllData();
    } else {
      // Export from P2P sync local data
      const allData: Record<string, unknown> = {};
      for (const key of ['player', 'achievements', 'sessions']) {
        const data = this.p2pSync.getLocalData(key);
        if (data) allData[key] = data;
      }
      exportJson = JSON.stringify(allData, null, 2);
    }

    // Filter based on options
    if (!exportOptions.includeAchievements || !exportOptions.includeSessions) {
      const data = JSON.parse(exportJson);
      if (!exportOptions.includeAchievements) delete data.achievements;
      if (!exportOptions.includeSessions) delete data.sessions;
      exportJson = JSON.stringify(data, null, 2);
    }

    // Encrypt if requested
    if (exportOptions.format === 'encrypted' && password) {
      exportJson = await encryptData(exportJson, password);
    }

    return exportJson;
  }

  async importData(data: string, password?: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      recordsImported: 0,
      errors: [],
    };

    try {
      let jsonData = data;

      // Try to decrypt if password provided
      if (password) {
        try {
          jsonData = await decryptData(data, password);
        } catch {
          result.errors.push('Failed to decrypt data - invalid password or corrupted data');
          return result;
        }
      }

      // Import to IndexedDB
      if (this.config.enableIndexedDB) {
        const success = await this.indexedDB.importData(jsonData);
        if (success) {
          result.success = true;
          const parsed = JSON.parse(jsonData);
          result.recordsImported =
            (parsed.player ? 1 : 0) +
            (parsed.sessions?.length || 0) +
            (parsed.achievements?.length || 0);
        }
      }

      // Sync to P2P
      if (this.config.enableP2PSync && result.success) {
        const parsed = JSON.parse(jsonData);
        if (parsed.player) {
          this.p2pSync.setLocalData('player', parsed.player, this.dataVersion);
        }
      }
    } catch (error) {
      result.errors.push(`Import failed: ${error}`);
    }

    return result;
  }

  // IPFS operations
  async uploadToIPFS(data: string): Promise<IPFSUploadResult | null> {
    if (!this.config.enableIPFS) return null;

    try {
      // Using a public IPFS pinning service (Pinata, Web3.Storage, or similar)
      // For demo, we'll use a mock implementation
      // In production, you'd integrate with actual IPFS node or pinning service

      const blob = new Blob([data], { type: 'application/json' });

      // Mock CID generation (in production, this comes from IPFS)
      const mockCID = `Qm${Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 44)}`;

      return {
        cid: mockCID,
        url: `${this.config.ipfsGateway}/${mockCID}`,
        size: blob.size,
      };
    } catch (error) {
      console.error('IPFS upload failed:', error);
      return null;
    }
  }

  async fetchFromIPFS(cid: string): Promise<string | null> {
    if (!this.config.enableIPFS) return null;

    try {
      const response = await fetch(`${this.config.ipfsGateway}/${cid}`);
      if (!response.ok) throw new Error('Failed to fetch from IPFS');
      return await response.text();
    } catch (error) {
      console.error('IPFS fetch failed:', error);
      return null;
    }
  }

  // Backup operations
  async createBackup(type: string = 'full'): Promise<string> {
    const data = await this.exportData();
    const backupId = await this.indexedDB.createBackup(type, JSON.parse(data));
    return backupId;
  }

  async restoreFromBackup(backupId: string): Promise<boolean> {
    const backupData = await this.indexedDB.restoreBackup(backupId);
    if (!backupData) return false;

    const result = await this.importData(JSON.stringify(backupData));
    return result.success;
  }

  async listBackups(): Promise<unknown[]> {
    return this.indexedDB.getBackups();
  }

  // P2P operations
  async generateShareCode(): Promise<string> {
    if (!this.config.enableP2PSync) {
      throw new Error('P2P sync is not enabled');
    }
    return this.p2pSync.generateConnectionCode();
  }

  async connectWithCode(code: string): Promise<string> {
    if (!this.config.enableP2PSync) {
      throw new Error('P2P sync is not enabled');
    }
    return this.p2pSync.connectWithCode(code);
  }

  async completeConnection(answerCode: string, tempPeerId: string): Promise<void> {
    if (!this.config.enableP2PSync) {
      throw new Error('P2P sync is not enabled');
    }
    await this.p2pSync.completeConnectionWithCode(answerCode, tempPeerId);
  }

  getConnectedPeers(): string[] {
    if (!this.config.enableP2PSync) return [];
    return this.p2pSync.getConnectedPeers();
  }

  getPeerId(): string {
    return this.p2pSync.getPeerId();
  }

  // Auto-sync management
  private startAutoSync(): void {
    if (this.syncIntervalId) return;

    this.syncIntervalId = setInterval(async () => {
      // Sync local data with IndexedDB
      if (this.config.enableIndexedDB) {
        const playerData = await this.indexedDB.getPlayer();
        if (playerData && this.config.enableP2PSync) {
          this.p2pSync.setLocalData('player', playerData, this.dataVersion);
        }
      }
    }, this.config.syncInterval);
  }

  stopAutoSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  // Statistics
  async getStorageStats(): Promise<{
    indexedDB: Awaited<ReturnType<IndexedDBService['getDatabaseStats']>> | null;
    p2p: {
      peerId: string;
      connectedPeers: number;
      localDataKeys: number;
    };
    config: StorageConfig;
  }> {
    const indexedDBStats = this.config.enableIndexedDB
      ? await this.indexedDB.getDatabaseStats()
      : null;

    return {
      indexedDB: indexedDBStats,
      p2p: {
        peerId: this.p2pSync.getPeerId(),
        connectedPeers: this.p2pSync.getConnectedPeers().length,
        localDataKeys: 0, // Would need to expose this from P2PSyncService
      },
      config: this.config,
    };
  }

  // Cleanup
  async cleanup(): Promise<void> {
    this.stopAutoSync();
    this.p2pSync.disconnectAll();
    this.indexedDB.close();
    this.initialized = false;
  }

  // Configuration
  updateConfig(config: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.autoSync !== undefined) {
      if (config.autoSync) {
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }
    }
  }
}

// Singleton instance
export const decentralizedStorage = new DecentralizedStorageService();
