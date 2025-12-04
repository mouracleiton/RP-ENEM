/**
 * Curriculum Constants
 * Centralized constants for curriculum-related values
 */

export const CURRICULUM_CONSTANTS = {
  /**
   * Total number of atomic skills in the curriculum
   * Based on current curriculum data as of 2025-12-03
   * Calculated by counting all specificSkills across all disciplines
   */
  TOTAL_ATOMIC_SKILLS: 15507,

  /**
   * Number of curriculum files/disciplines
   */
  TOTAL_DISCIPLINES: 56,

  /**
   * Average number of skills per discipline
   */
  AVG_SKILLS_PER_DISCIPLINE: 277,
} as const;

/**
 * Get the total number of skills in the curriculum
 */
export function getTotalSkills(): number {
  return CURRICULUM_CONSTANTS.TOTAL_ATOMIC_SKILLS;
}

/**
 * Calculate completion percentage
 */
export function getCompletionPercentage(completedSkills: number): number {
  return Math.min((completedSkills / CURRICULUM_CONSTANTS.TOTAL_ATOMIC_SKILLS) * 100, 100);
}

/**
 * Get progress for achievements
 */
export function getAchievementProgress(completedSkills: number): { progress: number; unlocked: boolean } {
  return {
    progress: Math.min(completedSkills, CURRICULUM_CONSTANTS.TOTAL_ATOMIC_SKILLS),
    unlocked: completedSkills >= CURRICULUM_CONSTANTS.TOTAL_ATOMIC_SKILLS,
  };
}