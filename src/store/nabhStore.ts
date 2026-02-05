import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Chapter, ObjectiveElement, Status, ElementCategory, ChapterType } from '../types/nabh';
import { loadAllObjectiveEditsFromSupabase, loadChaptersFromSupabase, loadAllNormalizedData } from '../services/objectiveStorage';
import { getCorrectCategory, getIsCore } from '../utils/enhanceWithOriginalCategories';

// Natural sort for objective codes like "COP.1.a", "COP.10.b"
// Handles numeric parts correctly: COP.1 < COP.2 < COP.10
function naturalSortObjectiveCode(a: string, b: string): number {
  const partsA = a.split('.');
  const partsB = b.split('.');

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const partA = partsA[i] || '';
    const partB = partsB[i] || '';

    const numA = parseInt(partA, 10);
    const numB = parseInt(partB, 10);

    // Both are numbers - compare numerically
    if (!isNaN(numA) && !isNaN(numB)) {
      if (numA !== numB) return numA - numB;
    } else {
      // At least one is not a number - compare alphabetically
      const cmp = partA.localeCompare(partB);
      if (cmp !== 0) return cmp;
    }
  }
  return 0;
}

// Helper function for chapter type (can be removed if not needed)
// Note: Chapter types could also be stored in nabh_chapters table if needed

const getChapterType = (code: string): string => {
  const types: Record<string, string> = {
    'AAC': 'Clinical',
    'COP': 'Clinical',
    'MOM': 'Clinical',
    'PRE': 'Administrative',
    'HIC': 'Clinical',
    'PSQ': 'Quality',
    'ROM': 'Administrative',
    'FMS': 'Infrastructure',
    'HRM': 'Administrative',
    'IMS': 'Technology',
  };
  return types[code] || 'Clinical';
};

interface NABHStore {
  chapters: Chapter[];
  selectedChapter: string | null;
  selectedObjective: string | null;
  searchQuery: string;
  filterStatus: Status | 'all';
  filterPriority: string;
  filterCategory: ElementCategory | 'all';
  showCoreOnly: boolean;
  selectedHospital: string; // New state for selected hospital
  isLoadingFromSupabase: boolean;
  selectedEvidenceForCreation: { id: string; text: string; selected: boolean }[];
  selectedEvidenceObjectiveCode: string | null; // Store the objective code for evidence items

  setSelectedChapter: (chapterId: string | null) => void;
  setSelectedObjective: (objectiveId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: Status | 'all') => void;
  setFilterPriority: (priority: string) => void;
  setFilterCategory: (category: ElementCategory | 'all') => void;
  setShowCoreOnly: (show: boolean) => void;
  setSelectedHospital: (hospitalId: string) => void; // New action
  setSelectedEvidenceForCreation: (items: { id: string; text: string; selected: boolean }[], objectiveCode?: string) => void;
  clearSelectedEvidenceForCreation: () => void;
  updateObjective: (chapterId: string, objectiveId: string, updates: Partial<ObjectiveElement>) => void;
  getFilteredObjectives: (chapterId: string) => ObjectiveElement[];
  loadDataFromSupabase: () => Promise<void>;
  loadFromNormalizedSchema: () => Promise<void>;
  loadDataFromLegacy: () => Promise<void>;
}

export const useNABHStore = create<NABHStore>()(
  persist(
    (set, get) => ({
      chapters: [],
      selectedChapter: null,
      selectedObjective: null,
      searchQuery: '',
      filterStatus: 'all',
      filterPriority: 'all',
      filterCategory: 'all',
      showCoreOnly: false,
      selectedHospital: 'hope', // Default hospital
      isLoadingFromSupabase: false,
      selectedEvidenceForCreation: [],
      selectedEvidenceObjectiveCode: null,

      setSelectedChapter: (chapterId) => set({ selectedChapter: chapterId, selectedObjective: null }),
      setSelectedObjective: (objectiveId) => set({ selectedObjective: objectiveId }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterStatus: (status) => set({ filterStatus: status }),
      setFilterPriority: (priority) => set({ filterPriority: priority }),
      setFilterCategory: (category) => set({ filterCategory: category }),
      setShowCoreOnly: (show) => set({ showCoreOnly: show }),
      setSelectedHospital: (hospitalId) => set({ selectedHospital: hospitalId }), // New action implementation
      setSelectedEvidenceForCreation: (items, objectiveCode) => set({
        selectedEvidenceForCreation: items,
        selectedEvidenceObjectiveCode: objectiveCode || null
      }),
      clearSelectedEvidenceForCreation: () => set({
        selectedEvidenceForCreation: [],
        selectedEvidenceObjectiveCode: null
      }),

      updateObjective: (chapterId, objectiveId, updates) =>
        set((state) => ({
          chapters: state.chapters.map((chapter) =>
            chapter.id === chapterId
              ? {
                  ...chapter,
                  objectives: chapter.objectives.map((obj) =>
                    obj.id === objectiveId ? { ...obj, ...updates } : obj
                  ),
                }
              : chapter
          ),
        })),

      getFilteredObjectives: (chapterId) => {
        const state = get();
        const chapter = state.chapters.find((c) => c.id === chapterId);
        if (!chapter) return [];

        return chapter.objectives.filter((obj) => {
          const matchesSearch =
            state.searchQuery === '' ||
            obj.code.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            obj.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            obj.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            obj.evidencesList.toLowerCase().includes(state.searchQuery.toLowerCase());

          const matchesStatus =
            state.filterStatus === 'all' || obj.status === state.filterStatus;

          const matchesPriority =
            state.filterPriority === 'all' || obj.priority === state.filterPriority;

          const matchesCategory =
            state.filterCategory === 'all' || obj.category === state.filterCategory;

          const matchesCoreFilter =
            !state.showCoreOnly || obj.isCore;

          return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesCoreFilter;
        });
      },

      loadDataFromSupabase: async () => {
        // Try normalized schema first, fallback to old method if no data found
        await get().loadFromNormalizedSchema();
        
        // If no data found in normalized schema, try legacy method
        const currentChapters = get().chapters;
        if (currentChapters.length === 0) {
          console.log('No data found in normalized schema, trying legacy method...');
          await get().loadDataFromLegacy();
        }
      },

      loadDataFromLegacy: async () => {
        set({ isLoadingFromSupabase: true });
        try {
          // First, load allowed chapters from nabh_chapters table
          const chaptersResult = await loadChaptersFromSupabase();
          if (!chaptersResult.success || !chaptersResult.data) {
            console.error('Failed to load chapters from nabh_chapters table:', chaptersResult.error);
            set({ chapters: [], isLoadingFromSupabase: false });
            return;
          }

          // Create map of chapter codes to chapter data from nabh_chapters table
          const allowedChaptersMap = new Map();
          chaptersResult.data.forEach(chapter => {
            allowedChaptersMap.set(chapter.name.toUpperCase(), chapter);
          });

          // Then load objectives data
          const objectivesResult = await loadAllObjectiveEditsFromSupabase();
          if (objectivesResult.success && objectivesResult.data) {
            // Build chapters structure only for allowed chapters
            const chaptersMap = new Map<string, Chapter>();
            
            // Process each objective from Supabase
            for (const [objectiveCode, supabaseData] of Object.entries(objectivesResult.data)) {
              if (supabaseData.title && supabaseData.description) {
                const chapterCode = objectiveCode.split('.')[0];
                
                // Skip if this chapter is not allowed
                if (!allowedChaptersMap.has(chapterCode)) {
                  continue;
                }
                
                const chapterId = chapterCode.toLowerCase();
                
                // Create chapter if it doesn't exist
                if (!chaptersMap.has(chapterId)) {
                  const chapterData = allowedChaptersMap.get(chapterCode);
                  chaptersMap.set(chapterId, {
                    id: chapterId,
                    code: chapterCode,
                    name: chapterCode,
                    fullName: chapterData?.description || chapterCode,
                    type: getChapterType(chapterCode) as any,
                    objectives: [],
                  });
                }
                
                // Create objective element
                const objective: ObjectiveElement = {
                  id: objectiveCode.toLowerCase().replace(/\./g, '-'),
                  code: objectiveCode,
                  title: supabaseData.title || '',
                  description: supabaseData.description,
                  interpretation: '',
                  hindiExplanation: supabaseData.hindiExplanation || '',
                  category: getCorrectCategory(objectiveCode),
                  isCore: getIsCore(objectiveCode),
                  evidencesList: supabaseData.evidencesList || '',
                  evidenceLinks: supabaseData.evidenceLinks || '',
                  evidenceFiles: supabaseData.evidenceFiles || [],
                  youtubeVideos: supabaseData.youtubeVideos || [],
                  trainingMaterials: supabaseData.trainingMaterials || [],
                  sopDocuments: supabaseData.sopDocuments || [],
                  priority: supabaseData.priority || '',
                  assignee: supabaseData.assignee || '',
                  status: supabaseData.status || '',
                  startDate: supabaseData.startDate || '',
                  endDate: supabaseData.endDate || '',
                  deliverable: supabaseData.deliverable || '',
                  notes: supabaseData.notes || '',
                  auditorPriorityItems: supabaseData.auditorPriorityItems || [],
                };
                
                // Add objective to chapter
                chaptersMap.get(chapterId)!.objectives.push(objective);
              }
            }
            
            // Convert map to array and sort by chapter_number from nabh_chapters table
            const chapters = Array.from(chaptersMap.values()).sort((a, b) => {
              const chapterDataA = allowedChaptersMap.get(a.code);
              const chapterDataB = allowedChaptersMap.get(b.code);
              return (chapterDataA?.chapter_number || 0) - (chapterDataB?.chapter_number || 0);
            });
            
            set({ chapters, isLoadingFromSupabase: false });
          } else {
            console.error('Failed to load objectives from Supabase:', objectivesResult.error);
            set({ chapters: [], isLoadingFromSupabase: false });
          }
        } catch (error) {
          console.error('Error loading data from Supabase:', error);
          set({ chapters: [], isLoadingFromSupabase: false });
        }
      },

      loadFromNormalizedSchema: async () => {
        set({ isLoadingFromSupabase: true });
        try {
          // Load normalized schema data and edits in parallel
          const [result, editsResult] = await Promise.all([
            loadAllNormalizedData(),
            loadAllObjectiveEditsFromSupabase()
          ]);

          if (!result.success || !result.data) {
            console.error('Failed to load normalized data:', result.error);
            set({ chapters: [], isLoadingFromSupabase: false });
            return;
          }

          const { chapters: nabhChapters, standards, elements } = result.data;

          // Create a map of edits by objective code for quick lookup
          const editsMap = editsResult.success && editsResult.data ? editsResult.data : {};

          // Build chapters structure from normalized data
          const chapters: Chapter[] = nabhChapters.map(nabhChapter => {
            // Get standards for this chapter
            const chapterStandards = standards.filter(s => s.chapter_id === nabhChapter.id);

            // Get all elements for this chapter (across all standards)
            const chapterElements: ObjectiveElement[] = [];

            chapterStandards.forEach(standard => {
              const standardElements = elements.filter(e => e.standard_id === standard.id);

              standardElements.forEach(element => {
                const objectiveCode = `${nabhChapter.name}.${standard.standard_number}.${element.element_number}`;
                // Get any edits for this objective from nabh_objective_edits
                const edits = editsMap[objectiveCode] || {};

                const objective: ObjectiveElement = {
                  id: element.id,
                  code: objectiveCode,
                  title: element.description || '',
                  description: element.description,
                  interpretation: element.interpretation || '',
                  // Prefer edits.interpretations2 over element.interpretations2
                  interpretations2: edits.interpretations2 || element.interpretations2 || '',
                  hindiExplanation: edits.hindiExplanation || '',
                  category: getCorrectCategory(objectiveCode),
                  isCore: getIsCore(objectiveCode),
                  evidencesList: edits.evidencesList || element.evidence_links || '',
                  evidenceLinks: edits.evidenceLinks || element.evidence_links || '',
                  evidenceFiles: edits.evidenceFiles || [],
                  youtubeVideos: edits.youtubeVideos || (element as any).youtube_videos || [],
                  trainingMaterials: edits.trainingMaterials || (element as any).training_materials || [],
                  sopDocuments: edits.sopDocuments || (element as any).sop_documents || [],
                  auditorPriorityItems: edits.auditorPriorityItems || [],
                  priority: element.is_core ? 'CORE' : (edits.priority || ''),
                  assignee: edits.assignee || element.assignee || '',
                  status: edits.status || (element.status === 'Not Started' ? 'Not started' : element.status === 'In Progress' ? 'In progress' : element.status as Status),
                  startDate: edits.startDate || '',
                  endDate: edits.endDate || '',
                  deliverable: edits.deliverable || '',
                  notes: edits.notes || element.notes || '',
                  infographicSvg: edits.infographicSvg || element.infographic_svg,
                  infographicDataUrl: edits.infographicDataUrl || element.infographic_data_url,
                };

                chapterElements.push(objective);
              });
            });

            return {
              id: nabhChapter.name.toLowerCase(),
              code: nabhChapter.name,
              name: nabhChapter.name,
              fullName: nabhChapter.description,
              type: getChapterType(nabhChapter.name) as ChapterType,
              objectives: chapterElements.sort((a, b) => naturalSortObjectiveCode(a.code, b.code)),
              standards: chapterStandards.map(s => ({
                code: s.standard_number,
                title: s.name,
                intent: s.description,
                elements: chapterElements.filter(e => e.code.includes(s.standard_number)),
              })),
            };
          });

          // Sort chapters by chapter_number
          chapters.sort((a, b) => {
            const aChapter = nabhChapters.find(c => c.name === a.code);
            const bChapter = nabhChapters.find(c => c.name === b.code);
            return (aChapter?.chapter_number || 0) - (bChapter?.chapter_number || 0);
          });

          set({ chapters, isLoadingFromSupabase: false });
        } catch (error) {
          console.error('Error loading normalized data:', error);
          set({ chapters: [], isLoadingFromSupabase: false });
        }
      },
    }),
    {
      name: 'nabh-user-preferences',
      version: 2,
      // Only persist user preferences, NOT the chapters data (too large for localStorage)
      partialize: (state: NABHStore) => ({
        selectedChapter: state.selectedChapter,
        selectedObjective: state.selectedObjective,
        searchQuery: state.searchQuery,
        filterStatus: state.filterStatus,
        filterPriority: state.filterPriority,
        filterCategory: state.filterCategory,
        showCoreOnly: state.showCoreOnly,
        selectedHospital: state.selectedHospital,
        // Do NOT persist: chapters, isLoadingFromSupabase, selectedEvidenceForCreation
      }),
      migrate: (persistedState: any, version: number) => {
        // Migration from old storage
        if (version < 2) {
          // Clear old large storage
          localStorage.removeItem('nabh-chapters-controlled');
        }
        return persistedState;
      },
    }
  )
);
