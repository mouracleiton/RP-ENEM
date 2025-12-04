import { curriculumService } from '@ita-rp/curriculum';

/**
 * Curriculum Constants
 * Centralized constants for curriculum-related values
 */

export const CURRICULUM_CONSTANTS = {
  /**
   * Number of curriculum files/disciplines (as of 2025-12-04)
   */
  TOTAL_DISCIPLINES: 26,

  /**
   * Average number of skills per discipline
   * This will be updated dynamically based on actual curriculum data
   */
  AVG_SKILLS_PER_DISCIPLINE: 277,
} as const;

// Cache for calculated values
let cachedTotalSkills: number | null = null;

/**
 * Get the total number of skills in the curriculum
 * Dynamically calculates from loaded curriculum data
 */
export function getTotalSkills(): number {
  // Return cached value if already calculated
  if (cachedTotalSkills !== null) {
    return cachedTotalSkills;
  }

  // Try to get from curriculum service if it's loaded
  if (curriculumService.isLoaded()) {
    try {
      const allSkills = curriculumService.getAllSkills();
      cachedTotalSkills = allSkills.length;
      console.log('[curriculum-constants] Total skills calculated:', cachedTotalSkills);
      return cachedTotalSkills;
    } catch (error) {
      console.warn('[curriculum-constants] Could not calculate total skills from curriculum service:', error);
    }
  }

  // Fallback to estimated value based on current knowledge
  // This will be updated once curriculum loads
  console.log('[curriculum-constants] Using fallback estimate for total skills');
  return 15507; // This is our best current estimate
}

/**
 * Reset the cached total skills (call when curriculum is reloaded)
 */
export function resetTotalSkillsCache(): void {
  cachedTotalSkills = null;
}

/**
 * Calculate completion percentage
 */
export function getCompletionPercentage(completedSkills: number): number {
  const totalSkills = getTotalSkills();
  return Math.min((completedSkills / totalSkills) * 100, 100);
}

/**
 * Get progress for achievements
 */
export function getAchievementProgress(completedSkills: number): { progress: number; unlocked: boolean } {
  const totalSkills = getTotalSkills();
  return {
    progress: Math.min(completedSkills, totalSkills),
    unlocked: completedSkills >= totalSkills,
  };
}