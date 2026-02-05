import type { Chapter } from '../types/nabh';

/**
 * NABH Data - Now completely fetched from Supabase
 * This file only provides empty fallback structure
 */

// Empty chapter array - all data now comes from Supabase
export const nabhData: Chapter[] = [];

// Calculate overall stats from chapters data
export const getOverallStats = (chapters: Chapter[]) => {
  let total = 0;
  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;
  let blocked = 0;
  let core = 0;
  let prevNC = 0;
  let commitment = 0;
  let achievement = 0;
  let excellence = 0;

  chapters.forEach(chapter => {
    chapter.objectives.forEach(obj => {
      total++;
      
      // Status counts
      if (obj.status === 'Completed') completed++;
      else if (obj.status === 'In progress') inProgress++;
      else if (obj.status === 'Blocked') blocked++;
      else notStarted++;
      
      // Category counts
      if (obj.isCore) core++;
      if (obj.priority === 'Prev NC') prevNC++;
      if (obj.category === 'Commitment') commitment++;
      else if (obj.category === 'Achievement') achievement++;
      else if (obj.category === 'Excellence') excellence++;
    });
  });

  return {
    total,
    completed,
    inProgress,
    notStarted,
    blocked,
    core,
    prevNC,
    commitment,
    achievement,
    excellence,
  };
};

// Chapter stats calculator for a single chapter
export const getChapterStats = (chapter: Chapter) => {
  const total = chapter.objectives.length;
  const completed = chapter.objectives.filter(obj => obj.status === 'Completed').length;
  const inProgress = chapter.objectives.filter(obj => obj.status === 'In progress').length;
  const blocked = chapter.objectives.filter(obj => obj.status === 'Blocked').length;
  const notStarted = chapter.objectives.filter(obj => !obj.status || obj.status === 'Not started').length;
  const core = chapter.objectives.filter(obj => obj.isCore).length;
  const prevNC = chapter.objectives.filter(obj => obj.priority === 'Prev NC').length;

  return {
    id: chapter.id,
    code: chapter.code,
    name: chapter.name,
    fullName: chapter.fullName,
    total,
    completed,
    inProgress,
    blocked,
    notStarted,
    core,
    prevNC,
    completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};