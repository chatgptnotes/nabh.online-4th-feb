/**
 * Enhance database elements with original NABH category information
 * Maps objective codes to their correct categories from NABH SHCO 3rd Edition
 */

import type { ElementCategory } from '../types/nabh';

// Load original standards data for category mapping
import { nabhShcoStandards } from '../data/nabhShcoStandards';

// Create a map of objective codes to their categories
const categoryMap = new Map<string, ElementCategory>();

// Build the category map from original standards
nabhShcoStandards.forEach(chapter => {
  chapter.standards.forEach(standard => {
    standard.objectiveElements.forEach(element => {
      categoryMap.set(element.code, element.category);
    });
  });
});

/**
 * Get the correct category for an objective code from original NABH standards
 * @param code The objective code (e.g., "AAC.1.a")
 * @returns The correct category or 'Commitment' as default
 */
export function getCorrectCategory(code: string): ElementCategory {
  return categoryMap.get(code) || 'Commitment';
}

/**
 * Check if an objective is Core from original NABH standards
 * @param code The objective code
 * @returns true if the objective is Core
 */
export function getIsCore(code: string): boolean {
  return categoryMap.get(code) === 'Core';
}

/**
 * Get statistics about category distribution
 */
export function getCategoryStats() {
  const stats = {
    total: categoryMap.size,
    core: 0,
    commitment: 0,
    achievement: 0,
    excellence: 0,
  };

  categoryMap.forEach(category => {
    if (category === 'Core') stats.core++;
    else if (category === 'Commitment') stats.commitment++;
    else if (category === 'Achievement') stats.achievement++;
    else if (category === 'Excellence') stats.excellence++;
  });

  return stats;
}
