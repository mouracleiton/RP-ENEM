/**
 * Hook that integrates Zustand game store with decentralized storage
 * Provides automatic sync, manual save/load, and P2P features
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useGameStore } from '../store';
import { useDecentralizedStorage } from './useDecentralizedStorage';

interface UseGamePersistenceOptions {
  autoSync?: boolean;
  syncInterval?: number;
  enableP2P?: boolean;
  onSyncComplete?: () => void;
  onSyncError?: (error: string) => void;
}

interface SyncStatus {
  lastSyncTime: Date | null;
  isSyncing: boolean;
  syncError: string | null;
  pendingChanges: boolean;
}

export function useGamePersistence(options: UseGamePersistenceOptions = {}) {
  const {
    autoSync = true,
    syncInterval = 30000, // 30 seconds
    enableP2P = true,
    onSyncComplete,
    onSyncError,
  } = options;

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncTime: null,
    isSyncing: false,
    syncError: null,
    pendingChanges: false,
  });

  const player = useGameStore(state => state.player);
  const updatePlayer = useGameStore(state => state.updatePlayer);

  const storage = useDecentralizedStorage({
    autoInitialize: true,
    enableP2P,
    onDataReceived: (key, data) => {
      // Handle incoming data from P2P peers
      if (key === `player_${player.id}` && data) {
        handleRemotePlayerData(data);
      }
    },
  });

  const lastSavedRef = useRef<string>('');
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle remote player data from P2P sync
  const handleRemotePlayerData = useCallback((remoteData: unknown) => {
    const remote = remoteData as { xp?: number; level?: number; completedSkills?: string[] };

    // Merge strategy: take the best values
    const currentPlayer = useGameStore.getState().player;

    // Only update if remote has more progress
    if (remote.xp && remote.xp > currentPlayer.xp) {
      updatePlayer({
        xp: remote.xp,
        level: remote.level || currentPlayer.level,
      });
    }

    // Merge completed skills (union)
    if (remote.completedSkills) {
      const mergedSkills = Array.from(new Set([
        ...currentPlayer.completedSkills,
        ...remote.completedSkills,
      ]));

      if (mergedSkills.length > currentPlayer.completedSkills.length) {
        updatePlayer({ completedSkills: mergedSkills });
      }
    }
  }, [updatePlayer]);

  // Save player data to decentralized storage
  const saveToStorage = useCallback(async () => {
    if (!storage.initialized) return;

    const currentState = useGameStore.getState().player;
    const stateJson = JSON.stringify(currentState);

    // Skip if no changes
    if (stateJson === lastSavedRef.current) {
      return;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      await storage.savePlayerData(currentState.id, currentState);
      lastSavedRef.current = stateJson;

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date(),
        pendingChanges: false,
      }));

      onSyncComplete?.();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save';
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncError: errorMsg,
      }));
      onSyncError?.(errorMsg);
    }
  }, [storage, onSyncComplete, onSyncError]);

  // Load player data from decentralized storage
  const loadFromStorage = useCallback(async () => {
    if (!storage.initialized) return false;

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      const savedData = await storage.loadPlayerData<typeof player>(player.id);

      if (savedData) {
        updatePlayer(savedData);
        lastSavedRef.current = JSON.stringify(savedData);

        setSyncStatus(prev => ({
          ...prev,
          isSyncing: false,
          lastSyncTime: new Date(),
        }));

        return true;
      }

      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
      return false;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load';
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncError: errorMsg,
      }));
      return false;
    }
  }, [storage, player.id, updatePlayer]);

  // Auto-sync effect
  useEffect(() => {
    if (!autoSync || !storage.initialized) return;

    // Initial load
    loadFromStorage();

    // Set up periodic sync
    syncTimeoutRef.current = setInterval(() => {
      saveToStorage();
    }, syncInterval);

    return () => {
      if (syncTimeoutRef.current) {
        clearInterval(syncTimeoutRef.current);
      }
    };
  }, [autoSync, storage.initialized, syncInterval, loadFromStorage, saveToStorage]);

  // Mark pending changes when player state changes
  useEffect(() => {
    const currentJson = JSON.stringify(player);
    if (currentJson !== lastSavedRef.current) {
      setSyncStatus(prev => ({ ...prev, pendingChanges: true }));
    }
  }, [player]);

  // Export all game data
  const exportGameData = useCallback(async (encrypted?: boolean, password?: string) => {
    if (!storage.initialized) throw new Error('Storage not initialized');

    return storage.exportData({
      includeAchievements: true,
      includeSessions: true,
      encrypted,
      password,
    });
  }, [storage]);

  // Import game data
  const importGameData = useCallback(async (data: string, password?: string) => {
    if (!storage.initialized) throw new Error('Storage not initialized');

    const result = await storage.importData(data, password);

    if (result.success) {
      // Reload player data after import
      await loadFromStorage();
    }

    return result;
  }, [storage, loadFromStorage]);

  // Create backup
  const createBackup = useCallback(async () => {
    // First save current state
    await saveToStorage();
    // Then create backup
    return storage.createBackup('manual');
  }, [storage, saveToStorage]);

  // Restore from backup
  const restoreBackup = useCallback(async (backupId: string) => {
    const success = await storage.restoreFromBackup(backupId);
    if (success) {
      await loadFromStorage();
    }
    return success;
  }, [storage, loadFromStorage]);

  // Upload to IPFS
  const uploadToIPFS = useCallback(async () => {
    const data = await exportGameData();
    return storage.uploadToIPFS(data);
  }, [storage, exportGameData]);

  // Fetch from IPFS and import
  const importFromIPFS = useCallback(async (cid: string) => {
    const data = await storage.fetchFromIPFS(cid);
    if (data) {
      return importGameData(data);
    }
    return { success: false, recordsImported: 0, errors: ['Failed to fetch from IPFS'] };
  }, [storage, importGameData]);

  return {
    // Sync status
    syncStatus,
    isInitialized: storage.initialized,
    isLoading: storage.loading,
    error: storage.error,

    // Manual sync operations
    saveToStorage,
    loadFromStorage,

    // Export/Import
    exportGameData,
    importGameData,

    // Backup operations
    createBackup,
    restoreBackup,
    listBackups: storage.listBackups,

    // IPFS operations
    uploadToIPFS,
    importFromIPFS,

    // P2P operations
    peerId: storage.peerId,
    connectedPeers: storage.connectedPeers,
    generateShareCode: storage.generateShareCode,
    connectWithCode: storage.connectWithCode,
    completeConnection: storage.completeConnection,

    // Stats
    getStorageStats: storage.getStats,
  };
}
