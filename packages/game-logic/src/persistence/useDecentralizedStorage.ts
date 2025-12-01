/**
 * React hook for decentralized storage
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { decentralizedStorage, DecentralizedStorageService } from './DecentralizedStorageService';

interface UseDecentralizedStorageOptions {
  autoInitialize?: boolean;
  enableP2P?: boolean;
  onDataReceived?: (key: string, data: unknown) => void;
  onPeerConnected?: (peerId: string) => void;
  onPeerDisconnected?: (peerId: string) => void;
}

interface StorageState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
  connectedPeers: string[];
  peerId: string | null;
}

export function useDecentralizedStorage(options: UseDecentralizedStorageOptions = {}) {
  const {
    autoInitialize = true,
    enableP2P = true,
    onDataReceived,
    onPeerConnected,
    onPeerDisconnected,
  } = options;

  const [state, setState] = useState<StorageState>({
    initialized: false,
    loading: false,
    error: null,
    connectedPeers: [],
    peerId: null,
  });

  const storageRef = useRef<DecentralizedStorageService>(decentralizedStorage);

  // Initialize storage
  const initialize = useCallback(async () => {
    if (state.initialized) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await storageRef.current.initialize();

      setState(prev => ({
        ...prev,
        initialized: true,
        loading: false,
        peerId: storageRef.current.getPeerId(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize storage',
      }));
    }
  }, [state.initialized]);

  // Auto-initialize on mount
  useEffect(() => {
    if (autoInitialize && !state.initialized) {
      initialize();
    }
  }, [autoInitialize, state.initialized, initialize]);

  // Update connected peers
  useEffect(() => {
    if (!state.initialized || !enableP2P) return;

    const interval = setInterval(() => {
      const peers = storageRef.current.getConnectedPeers();
      setState(prev => {
        if (JSON.stringify(prev.connectedPeers) !== JSON.stringify(peers)) {
          return { ...prev, connectedPeers: peers };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.initialized, enableP2P]);

  // Save player data
  const savePlayerData = useCallback(async (playerId: string, data: unknown) => {
    if (!state.initialized) {
      throw new Error('Storage not initialized');
    }
    await storageRef.current.savePlayerData(playerId, data);
  }, [state.initialized]);

  // Load player data
  const loadPlayerData = useCallback(async <T>(playerId: string): Promise<T | null> => {
    if (!state.initialized) {
      throw new Error('Storage not initialized');
    }
    return storageRef.current.loadPlayerData<T>(playerId);
  }, [state.initialized]);

  // Save study session
  const saveStudySession = useCallback(async (session: unknown) => {
    if (!state.initialized) {
      throw new Error('Storage not initialized');
    }
    await storageRef.current.saveStudySession(session);
  }, [state.initialized]);

  // Get study sessions
  const getStudySessions = useCallback(async <T>(limit?: number): Promise<T[]> => {
    if (!state.initialized) return [];
    return storageRef.current.getStudySessions<T>(limit);
  }, [state.initialized]);

  // Export data
  const exportData = useCallback(async (options?: {
    includeAchievements?: boolean;
    includeSessions?: boolean;
    encrypted?: boolean;
    password?: string;
  }) => {
    if (!state.initialized) {
      throw new Error('Storage not initialized');
    }
    return storageRef.current.exportData(
      {
        includeAchievements: options?.includeAchievements ?? true,
        includeSessions: options?.includeSessions ?? true,
        format: options?.encrypted ? 'encrypted' : 'json',
      },
      options?.password
    );
  }, [state.initialized]);

  // Import data
  const importData = useCallback(async (data: string, password?: string) => {
    if (!state.initialized) {
      throw new Error('Storage not initialized');
    }
    return storageRef.current.importData(data, password);
  }, [state.initialized]);

  // Generate share code for P2P
  const generateShareCode = useCallback(async () => {
    if (!state.initialized || !enableP2P) {
      throw new Error('P2P not available');
    }
    return storageRef.current.generateShareCode();
  }, [state.initialized, enableP2P]);

  // Connect with share code
  const connectWithCode = useCallback(async (code: string) => {
    if (!state.initialized || !enableP2P) {
      throw new Error('P2P not available');
    }
    return storageRef.current.connectWithCode(code);
  }, [state.initialized, enableP2P]);

  // Complete P2P connection
  const completeConnection = useCallback(async (answerCode: string, tempPeerId: string) => {
    if (!state.initialized || !enableP2P) {
      throw new Error('P2P not available');
    }
    await storageRef.current.completeConnection(answerCode, tempPeerId);
  }, [state.initialized, enableP2P]);

  // Create backup
  const createBackup = useCallback(async (type?: string) => {
    if (!state.initialized) {
      throw new Error('Storage not initialized');
    }
    return storageRef.current.createBackup(type);
  }, [state.initialized]);

  // Restore from backup
  const restoreFromBackup = useCallback(async (backupId: string) => {
    if (!state.initialized) {
      throw new Error('Storage not initialized');
    }
    return storageRef.current.restoreFromBackup(backupId);
  }, [state.initialized]);

  // List backups
  const listBackups = useCallback(async () => {
    if (!state.initialized) return [];
    return storageRef.current.listBackups();
  }, [state.initialized]);

  // Upload to IPFS
  const uploadToIPFS = useCallback(async (data: string) => {
    if (!state.initialized) {
      throw new Error('Storage not initialized');
    }
    return storageRef.current.uploadToIPFS(data);
  }, [state.initialized]);

  // Fetch from IPFS
  const fetchFromIPFS = useCallback(async (cid: string) => {
    if (!state.initialized) {
      throw new Error('Storage not initialized');
    }
    return storageRef.current.fetchFromIPFS(cid);
  }, [state.initialized]);

  // Get storage stats
  const getStats = useCallback(async () => {
    if (!state.initialized) return null;
    return storageRef.current.getStorageStats();
  }, [state.initialized]);

  // Cleanup
  useEffect(() => {
    return () => {
      // Don't cleanup on unmount to maintain persistence
    };
  }, []);

  return {
    // State
    ...state,

    // Initialization
    initialize,

    // Data operations
    savePlayerData,
    loadPlayerData,
    saveStudySession,
    getStudySessions,

    // Export/Import
    exportData,
    importData,

    // P2P operations
    generateShareCode,
    connectWithCode,
    completeConnection,

    // Backup operations
    createBackup,
    restoreFromBackup,
    listBackups,

    // IPFS operations
    uploadToIPFS,
    fetchFromIPFS,

    // Stats
    getStats,
  };
}
