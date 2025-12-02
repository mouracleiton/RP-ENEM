/**
 * Data Export/Import Service
 * Handles backup and restoration of player data
 */

import type { PlayerState } from '@ita-rp/shared-types';
import { useGameStore } from './store';

// Export format version for compatibility checks
const EXPORT_VERSION = '1.0.0';

export interface ExportData {
  version: string;
  exportDate: string;
  player: PlayerState;
  studyHistory?: StudyHistoryEntry[];
  metadata: {
    appVersion: string;
    totalExports: number;
  };
}

export interface StudyHistoryEntry {
  id: string;
  skillId: string;
  date: string;
  duration: number;
  performance: number;
}

export interface ImportResult {
  success: boolean;
  message: string;
  importedData?: Partial<ExportData>;
  errors?: string[];
}

/**
 * Export player data to JSON
 */
export function exportPlayerData(): ExportData {
  const state = useGameStore.getState();

  // Get study history from localStorage
  const studyHistoryRaw = localStorage.getItem('ita-rp-game-study-history');
  const studyHistory = studyHistoryRaw ? JSON.parse(studyHistoryRaw) : [];

  const exportData: ExportData = {
    version: EXPORT_VERSION,
    exportDate: new Date().toISOString(),
    player: state.player,
    studyHistory,
    metadata: {
      appVersion: '2.0.0',
      totalExports: getExportCount() + 1,
    },
  };

  // Update export count
  incrementExportCount();

  return exportData;
}

/**
 * Export data and trigger download
 */
export function downloadExport(): void {
  const data = exportPlayerData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `ita-rp-game-backup-${formatDate(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Import player data from JSON
 */
export function importPlayerData(jsonString: string): ImportResult {
  try {
    const data = JSON.parse(jsonString) as ExportData;

    // Validate data structure
    const validationErrors = validateImportData(data);
    if (validationErrors.length > 0) {
      return {
        success: false,
        message: 'Invalid data format',
        errors: validationErrors,
      };
    }

    // Check version compatibility
    if (!isVersionCompatible(data.version)) {
      return {
        success: false,
        message: `Incompatible version: ${data.version}. Current version: ${EXPORT_VERSION}`,
        errors: ['Version mismatch'],
      };
    }

    // Restore player data
    const { updatePlayer } = useGameStore.getState();
    updatePlayer(data.player);

    // Restore study history if present
    if (data.studyHistory) {
      localStorage.setItem('ita-rp-game-study-history', JSON.stringify(data.studyHistory));
    }

    return {
      success: true,
      message: `Data imported successfully from ${formatDate(new Date(data.exportDate))}`,
      importedData: data,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to parse import data',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Import from file input
 */
export function importFromFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        resolve(importPlayerData(content));
      } else {
        resolve({
          success: false,
          message: 'Failed to read file',
          errors: ['Empty file content'],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        message: 'Failed to read file',
        errors: ['File read error'],
      });
    };

    reader.readAsText(file);
  });
}

/**
 * Validate import data structure
 */
function validateImportData(data: unknown): string[] {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Data must be an object');
    return errors;
  }

  const obj = data as Record<string, unknown>;

  if (!obj.version || typeof obj.version !== 'string') {
    errors.push('Missing or invalid version field');
  }

  if (!obj.exportDate || typeof obj.exportDate !== 'string') {
    errors.push('Missing or invalid exportDate field');
  }

  if (!obj.player || typeof obj.player !== 'object') {
    errors.push('Missing or invalid player field');
    return errors;
  }

  const player = obj.player as Record<string, unknown>;

  if (!player.id || typeof player.id !== 'string') {
    errors.push('Missing or invalid player.id');
  }

  if (!player.name || typeof player.name !== 'string') {
    errors.push('Missing or invalid player.name');
  }

  if (typeof player.level !== 'number') {
    errors.push('Missing or invalid player.level');
  }

  if (typeof player.xp !== 'number') {
    errors.push('Missing or invalid player.xp');
  }

  if (!Array.isArray(player.completedSkills)) {
    errors.push('Missing or invalid player.completedSkills');
  }

  return errors;
}

/**
 * Check version compatibility
 */
function isVersionCompatible(version: string): boolean {
  const [major] = version.split('.').map(Number);
  const [currentMajor] = EXPORT_VERSION.split('.').map(Number);
  // Allow same major version
  return major === currentMajor;
}

/**
 * Get export count from localStorage
 */
function getExportCount(): number {
  const count = localStorage.getItem('ita-rp-game-export-count');
  return count ? parseInt(count, 10) : 0;
}

/**
 * Increment export count
 */
function incrementExportCount(): void {
  const count = getExportCount();
  localStorage.setItem('ita-rp-game-export-count', String(count + 1));
}

/**
 * Format date for filename
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * React hook for data export/import
 */
export function useDataExport() {
  const exportData = () => {
    downloadExport();
  };

  const importData = async (file: File): Promise<ImportResult> => {
    return importFromFile(file);
  };

  const getExportPreview = (): ExportData => {
    return exportPlayerData();
  };

  return {
    exportData,
    importData,
    getExportPreview,
    exportVersion: EXPORT_VERSION,
  };
}
