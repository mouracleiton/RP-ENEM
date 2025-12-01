/**
 * Persistence module exports
 */

export { IndexedDBService, indexedDBService } from './IndexedDBService';
export { P2PSyncService, p2pSyncService } from './P2PSyncService';
export {
  DecentralizedStorageService,
  decentralizedStorage,
  type StorageConfig,
  type ExportOptions,
  type ImportResult,
  type IPFSUploadResult,
} from './DecentralizedStorageService';
export { useDecentralizedStorage } from './useDecentralizedStorage';
export { useGamePersistence } from './useGamePersistence';
