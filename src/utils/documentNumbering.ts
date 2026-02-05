/**
 * Document Numbering Utility
 * Generates consistent document numbers across the application
 */

/**
 * Generates a document number based on the objective code
 * Format: DOC-{CHAPTER}-{SEQUENTIAL}
 * Example: COP.1 → DOC-COP-001
 */
export function generateDocumentNumber(objectiveCode: string): string {
  // Extract chapter code from objective (e.g., "COP.1" → "COP")
  const chapterCode = objectiveCode.split('.')[0].toUpperCase();

  // Generate a sequential number based on timestamp (last 3 digits)
  // In production, this should be fetched from database for true sequential numbering
  const timestamp = Date.now();
  const sequential = String(timestamp % 1000).padStart(3, '0');

  return `DOC-${chapterCode}-${sequential}`;
}

/**
 * Generates a patient ID in the hospital format
 * Format: HOP-{YEAR}-{SEQUENTIAL}
 * Example: HOP-2026-0042
 *
 * Note: In production, this should fetch the actual visit_id from the database
 */
export function generatePatientIdExample(): string {
  const year = new Date().getFullYear();
  const sequential = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `HOP-${year}-${sequential}`;
}

/**
 * Formats an actual visit_id from the database for display
 * If the visit_id doesn't have a prefix, adds the HOP- prefix
 */
export function formatVisitId(visitId: string): string {
  // If already has a prefix (contains hyphen), return as-is
  if (visitId.includes('-')) {
    return visitId;
  }
  // Otherwise, add HOP- prefix
  return `HOP-${visitId}`;
}

/**
 * Gets the current date in DD/MM/YYYY format
 */
export function getFormattedDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-GB');
}

/**
 * Gets a future date for review (1 year from now)
 */
export function getReviewDate(date: Date = new Date()): string {
  const reviewDate = new Date(date);
  reviewDate.setFullYear(reviewDate.getFullYear() + 1);
  return reviewDate.toLocaleDateString('en-GB');
}
