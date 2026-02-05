import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Tabs,
  Tab,
  Paper,
  Alert,
  Badge,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  Groups as GroupsIcon,
  Poll as PollIcon,
  Description as DescriptionIcon,
  Quiz as QuizIcon,
  Analytics as AnalyticsIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  OpenInNew as OpenInNewIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNABHStore } from '../store/nabhStore';

// Search interfaces
interface SearchResult {
  id: string;
  type: 'objective' | 'evidence' | 'committee' | 'survey' | 'department' | 'equipment' | 'cheatsheet' | 'manual' | 'kpi';
  title: string;
  subtitle?: string;
  description: string;
  content: string;
  chapter?: string;
  category?: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  lastUpdated?: string;
  url: string;
  matchedFields: string[];
  searchScore: number;
}

// Search categories configuration
const SEARCH_CATEGORIES = [
  { 
    id: 'all', 
    label: 'All Results', 
    icon: SearchIcon, 
    color: 'primary' 
  },
  { 
    id: 'objective', 
    label: 'Objectives & Standards', 
    icon: AssignmentIcon, 
    color: 'error',
    description: 'NABH objective elements, standards, and requirements' 
  },
  { 
    id: 'evidence', 
    label: 'Evidences', 
    icon: DescriptionIcon, 
    color: 'success',
    description: 'Generated evidence documents and proofs' 
  },
  { 
    id: 'committee', 
    label: 'Committees', 
    icon: GroupsIcon, 
    color: 'info',
    description: 'Hospital committees, members, and meeting minutes' 
  },
  { 
    id: 'survey', 
    label: 'Surveys', 
    icon: PollIcon, 
    color: 'warning',
    description: 'Patient and staff satisfaction surveys' 
  },
  { 
    id: 'cheatsheet', 
    label: 'Cheat Sheets', 
    icon: QuizIcon, 
    color: 'secondary',
    description: 'Chapter cheat sheets and quick references' 
  },
  { 
    id: 'kpi', 
    label: 'KPIs', 
    icon: AnalyticsIcon, 
    color: 'primary',
    description: 'Quality indicators and performance metrics' 
  },
];

// Mock search data - In real implementation, this would come from Supabase/API
const generateMockSearchData = (): SearchResult[] => [
  // Objective Elements
  {
    id: 'aac_1_1',
    type: 'objective',
    title: 'AAC.1.1 - Admission Process',
    subtitle: 'Access, Assessment & Continuity of Care',
    description: 'Hospital has established admission process for patients',
    content: 'The hospital shall have an established admission process. The admission process shall be patient-centered, efficient and sensitive to patient needs. The admission process shall include pre-admission activities.',
    chapter: 'AAC',
    category: 'Patient Care',
    tags: ['admission', 'patient-centered', 'pre-admission', 'process'],
    priority: 'high' as const,
    lastUpdated: '2024-02-02',
    url: '/objective/aac_1_1',
    matchedFields: [],
    searchScore: 0,
  },
  {
    id: 'cop_2_3',
    type: 'objective',
    title: 'COP.2.3 - Pain Assessment',
    subtitle: 'Care of Patients',
    description: 'Regular pain assessment and management protocols',
    content: 'The hospital shall have a policy for pain assessment and management. Pain assessment shall be done for all patients. Pain management protocols shall be evidence-based.',
    chapter: 'COP',
    category: 'Pain Management',
    tags: ['pain', 'assessment', 'management', 'protocol', 'evidence-based'],
    priority: 'high' as const,
    lastUpdated: '2024-02-01',
    url: '/objective/cop_2_3',
    matchedFields: [],
    searchScore: 0,
  },
  {
    id: 'hic_4_2',
    type: 'objective',
    title: 'HIC.4.2 - Hand Hygiene Compliance',
    subtitle: 'Hospital Infection Control',
    description: 'Hand hygiene compliance monitoring and improvement',
    content: 'The hospital shall monitor hand hygiene compliance. Hand hygiene audits shall be conducted regularly. Staff training on hand hygiene shall be provided.',
    chapter: 'HIC',
    category: 'Infection Control',
    tags: ['hand hygiene', 'compliance', 'monitoring', 'audit', 'training'],
    priority: 'high' as const,
    lastUpdated: '2024-02-03',
    url: '/objective/hic_4_2',
    matchedFields: [],
    searchScore: 0,
  },

  // Committees
  {
    id: 'quality_committee',
    type: 'committee',
    title: 'Hospital Quality Committee',
    subtitle: 'Quality Management',
    description: 'Oversees all quality improvement activities and monitors quality indicators',
    content: 'The Hospital Quality Committee meets monthly to review quality indicators, discuss quality improvement projects, and ensure NABH compliance. Members include Dr. Shiraz (Chairperson), Sonali (Clinical Audit), and department heads.',
    category: 'Quality',
    tags: ['quality', 'improvement', 'indicators', 'nabh', 'compliance', 'monthly'],
    priority: 'high' as const,
    lastUpdated: '2024-02-02',
    url: '/committees',
    matchedFields: [],
    searchScore: 0,
  },
  {
    id: 'infection_committee',
    type: 'committee',
    title: 'Hospital Infection Control Committee',
    subtitle: 'Infection Prevention',
    description: 'Monitors and controls hospital-acquired infections',
    content: 'Hospital Infection Control Committee focuses on surveillance of HAIs, antibiotic stewardship, and infection prevention training. Led by Shilpi (Infection Control Nurse) with monthly meetings.',
    category: 'Infection Control',
    tags: ['infection', 'control', 'hai', 'antibiotic', 'stewardship', 'surveillance'],
    priority: 'high' as const,
    lastUpdated: '2024-02-01',
    url: '/committees',
    matchedFields: [],
    searchScore: 0,
  },

  // Surveys with Enhanced Link Metadata
  {
    id: 'staff_satisfaction',
    type: 'survey',
    title: 'Hope Hospital Staff Satisfaction Survey 2026',
    subtitle: 'NABH Required Employee Feedback Assessment',
    description: 'Comprehensive quarterly staff satisfaction survey covering work environment, management support, career development, safety protocols, and NABH awareness. Required for NABH accreditation audit evidence.',
    content: 'Staff satisfaction survey with 15 detailed questions covering work environment assessment, management support evaluation, career development opportunities, work-life balance, internal communication effectiveness, resource adequacy, safety protocols compliance, compensation satisfaction, recognition programs, and NABH quality awareness. Distribution via WhatsApp and email to all hospital departments. Enhanced metadata for search: employee engagement, workplace satisfaction, NABH compliance, quality culture, staff feedback, hospital management.',
    category: 'NABH Survey',
    tags: ['staff satisfaction', 'employee feedback', 'nabh survey', 'work environment', 'management support', 'career development', 'safety protocols', 'quality awareness', 'employee engagement', 'hospital culture', 'audit evidence'],
    priority: 'high' as const,
    lastUpdated: '2024-02-03',
    url: '/surveys',
    matchedFields: [],
    searchScore: 0,
  },
  {
    id: 'patient_satisfaction',
    type: 'survey',
    title: 'Patient Satisfaction Survey',
    subtitle: 'Patient Experience',
    description: 'Patient experience and satisfaction assessment',
    content: 'Patient satisfaction survey evaluates overall experience, admission process, doctor care, nursing care, cleanliness, food quality, communication, discharge process, and recommendation likelihood.',
    category: 'Patient Experience',
    tags: ['patient', 'satisfaction', 'experience', 'care', 'cleanliness', 'communication'],
    priority: 'medium' as const,
    lastUpdated: '2024-02-02',
    url: '/surveys',
    matchedFields: [],
    searchScore: 0,
  },

  // Evidence Documents
  {
    id: 'evidence_aac_1_1',
    type: 'evidence',
    title: 'Admission Process Evidence',
    subtitle: 'AAC.1.1 Supporting Documents',
    description: 'Evidence documentation for admission process compliance',
    content: 'Admission process policy, patient flow charts, pre-admission checklist, staff training records, and patient feedback on admission experience. Updated procedures and compliance audit reports.',
    chapter: 'AAC',
    category: 'Process Evidence',
    tags: ['admission', 'policy', 'flowchart', 'checklist', 'training', 'audit'],
    priority: 'high' as const,
    lastUpdated: '2024-02-02',
    url: '/evidence/aac_1_1',
    matchedFields: [],
    searchScore: 0,
  },

  // Cheat Sheets with Enhanced Metadata
  {
    id: 'aac_cheatsheet',
    type: 'cheatsheet',
    title: 'AAC Chapter Quick Reference Guide',
    subtitle: 'Access, Assessment & Continuity of Care',
    description: 'Comprehensive quick reference for AAC chapter with admission criteria, assessment protocols, and care coordination guidelines for NABH audit preparation',
    content: 'AAC chapter covers patient admission, assessment, care planning, continuity of care, and discharge planning. Key standards include admission criteria, assessment protocols, and care coordination. Enhanced with searchable keywords: nabh audit, patient admission process, assessment documentation, care planning templates, continuity protocols.',
    chapter: 'AAC',
    category: 'NABH Cheat Sheet',
    tags: ['aac', 'admission', 'assessment', 'continuity', 'reference', 'standards', 'nabh audit', 'patient admission', 'care planning', 'protocols'],
    priority: 'high' as const,
    lastUpdated: '2024-02-03',
    url: '/cheat-sheets',
    matchedFields: [],
    searchScore: 0,
  },

  // Committee Documents with Metadata
  {
    id: 'quality_committee_docs',
    type: 'committee',
    title: 'Quality Committee Meeting Minutes & Documentation',
    subtitle: 'Hospital Quality Committee',
    description: 'Comprehensive documentation including meeting minutes, quality indicators review, NABH compliance tracking, and continuous improvement initiatives',
    content: 'Quality committee documents contain monthly meeting minutes, quality indicator analysis, NABH compliance reports, patient safety discussions, quality improvement projects, and audit preparation materials. Enhanced searchable content for NABH audit evidence.',
    category: 'Committee Documentation',
    tags: ['quality committee', 'meeting minutes', 'nabh compliance', 'quality indicators', 'patient safety', 'continuous improvement', 'audit documentation', 'quality management'],
    priority: 'high' as const,
    lastUpdated: '2024-02-03',
    url: '/committees',
    matchedFields: [],
    searchScore: 0,
  },

  // KPIs
  {
    id: 'infection_rate_kpi',
    type: 'kpi',
    title: 'Hospital Acquired Infection Rate',
    subtitle: 'Quality Indicator',
    description: 'Monitoring hospital-acquired infection rates',
    content: 'Hospital-acquired infection rate KPI tracks infections per 1000 patient days. Target: <5 per 1000 patient days. Monthly monitoring with trend analysis and corrective actions.',
    category: 'Safety',
    tags: ['hai', 'infection', 'rate', 'patient days', 'safety', 'quality'],
    priority: 'high' as const,
    lastUpdated: '2024-02-03',
    url: '/kpis',
    matchedFields: [],
    searchScore: 0,
  },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const { chapters } = useNABHStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Build searchable data from real chapters and objectives
  const searchableData = useMemo(() => {
    const data: SearchResult[] = [];

    // Add all objectives from chapters
    chapters.forEach(chapter => {
      chapter.objectives.forEach(objective => {
        data.push({
          id: objective.id,
          type: 'objective',
          title: `${objective.code} - ${objective.title}`,
          subtitle: chapter.fullName,
          description: objective.description,
          content: `${objective.description} ${objective.interpretation || ''} ${objective.hindiExplanation || ''}`,
          chapter: chapter.code,
          category: objective.category,
          tags: [
            objective.code.toLowerCase(),
            chapter.code.toLowerCase(),
            objective.category.toLowerCase(),
            ...(objective.isCore ? ['core', 'priority'] : ['commitment']),
            ...(objective.evidencesList ? objective.evidencesList.split(',').map(e => e.trim().toLowerCase()) : []),
          ],
          priority: objective.isCore ? 'high' : objective.priority === 'CORE' ? 'high' : 'medium',
          lastUpdated: new Date().toISOString().split('T')[0],
          url: `/objective/${chapter.id}/${objective.id}`,
          matchedFields: [],
          searchScore: 0,
        });
      });
    });

    // Add surveys, committees, and other content from mock data
    const additionalContent = generateMockSearchData().filter(item =>
      item.type !== 'objective' // Don't duplicate objectives
    );
    data.push(...additionalContent);

    return data;
  }, [chapters]);

  // Perform search
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Search through real data with debounce
    setTimeout(() => {
      const results = searchableData
        .map(item => {
          const searchScore = calculateSearchScore(item, query);
          return {
            ...item,
            searchScore,
            matchedFields: getMatchedFields(item, query)
          };
        })
        .filter(item => item.searchScore > 0)
        .sort((a, b) => b.searchScore - a.searchScore);

      setSearchResults(results);
      setIsSearching(false);

      // Add to recent searches
      if (query && !recentSearches.includes(query)) {
        setRecentSearches([query, ...recentSearches.slice(0, 4)]);
      }
    }, 300);
  }, [searchableData, recentSearches]);

  // Auto-search when searchQuery changes
  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  // Calculate search score based on query matching
  const calculateSearchScore = (item: SearchResult, query: string): number => {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(word => word.length > 1);
    
    let score = 0;

    // Title match (highest weight)
    if (item.title.toLowerCase().includes(queryLower)) {
      score += 100;
    }

    // Description match (high weight)
    if (item.description.toLowerCase().includes(queryLower)) {
      score += 75;
    }

    // Content match (medium weight)
    if (item.content.toLowerCase().includes(queryLower)) {
      score += 50;
    }

    // Tags match (high weight)
    item.tags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        score += 60;
      }
    });

    // Individual word matches
    queryWords.forEach(word => {
      if (item.title.toLowerCase().includes(word)) score += 25;
      if (item.description.toLowerCase().includes(word)) score += 15;
      if (item.content.toLowerCase().includes(word)) score += 10;
      item.tags.forEach(tag => {
        if (tag.toLowerCase().includes(word)) score += 20;
      });
    });

    // Priority bonus
    if (item.priority === 'high') score += 10;
    else if (item.priority === 'medium') score += 5;

    return score;
  };

  // Get matched fields for highlighting
  const getMatchedFields = (item: SearchResult, query: string): string[] => {
    const queryLower = query.toLowerCase();
    const matchedFields: string[] = [];

    if (item.title.toLowerCase().includes(queryLower)) matchedFields.push('title');
    if (item.description.toLowerCase().includes(queryLower)) matchedFields.push('description');
    if (item.content.toLowerCase().includes(queryLower)) matchedFields.push('content');
    if (item.tags.some(tag => tag.toLowerCase().includes(queryLower))) matchedFields.push('tags');

    return matchedFields;
  };

  // Filter results based on selected category
  const filteredResults = useMemo(() => {
    let results = searchResults;

    // Category filter
    if (selectedCategory !== 'all') {
      results = results.filter(result => result.type === selectedCategory);
    }

    return results;
  }, [searchResults, selectedCategory]);

  // Handle search input
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    // performSearch will be called by useEffect
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Get category count
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return searchResults.length;
    return searchResults.filter(result => result.type === categoryId).length;
  };

  // Get category icon
  const getCategoryIcon = (type: string) => {
    const category = SEARCH_CATEGORIES.find(cat => cat.id === type);
    return category?.icon || DescriptionIcon;
  };

  // Navigate to result
  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <SearchIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Global Search
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Search across all evidences, objectives, committees, and masters
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Search Input */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box p={3}>
          <TextField
            fullWidth
            placeholder="Search for NABH objectives, evidence, committees, surveys, or any keyword..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '1.1rem',
                borderRadius: 3,
              }
            }}
          />

          {/* Recent Searches */}
          {recentSearches.length > 0 && !searchQuery && (
            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Recent Searches:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {recentSearches.map((search, index) => (
                  <Chip
                    key={index}
                    label={search}
                    variant="outlined"
                    size="small"
                    onClick={() => setSearchQuery(search)}
                    clickable
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Quick Search Suggestions */}
          {!searchQuery && (
            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Popular Searches:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {['hand hygiene', 'admission process', 'quality committee', 'patient satisfaction', 'infection control', 'pain assessment', 'staff survey'].map((suggestion) => (
                  <Chip
                    key={suggestion}
                    label={suggestion}
                    variant="outlined"
                    size="small"
                    onClick={() => setSearchQuery(suggestion)}
                    clickable
                    color="primary"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Search Results */}
      {searchQuery && (
        <Box>
          {/* Results Categories */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={selectedCategory}
              onChange={(_: React.SyntheticEvent, newValue: string) => setSelectedCategory(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {SEARCH_CATEGORIES.map(category => (
                <Tab
                  key={category.id}
                  value={category.id}
                  label={
                    <Badge badgeContent={getCategoryCount(category.id)} color="primary">
                      <Box display="flex" alignItems="center" gap={1}>
                        <category.icon sx={{ fontSize: 18 }} />
                        {category.label}
                      </Box>
                    </Badge>
                  }
                />
              ))}
            </Tabs>
          </Paper>

          {/* Results Summary */}
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Found {filteredResults.length} results for "{searchQuery}"
              {selectedCategory !== 'all' && ` in ${SEARCH_CATEGORIES.find(cat => cat.id === selectedCategory)?.label}`}
            </Typography>
          </Box>

          {/* No Results */}
          {filteredResults.length === 0 && !isSearching && (
            <Alert severity="info">
              <Typography variant="body1">
                No results found for "{searchQuery}". Try different keywords or check spelling.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Search Tips:</strong>
                <br />• Use specific terms like "hand hygiene", "admission", "quality committee"
                <br />• Try chapter codes like "AAC", "COP", "HIC"
                <br />• Search for NABH requirements, evidence, or committee names
              </Typography>
            </Alert>
          )}

          {/* Search Results List */}
          {filteredResults.length > 0 && (
            <Grid container spacing={3}>
              {filteredResults.map((result) => {
                const IconComponent = getCategoryIcon(result.type);
                
                return (
                  <Grid item xs={12} key={result.id}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          elevation: 3,
                          transform: 'translateY(-1px)',
                        },
                        border: result.priority === 'high' ? '2px solid' : '1px solid',
                        borderColor: result.priority === 'high' ? 'error.main' : 'grey.200',
                      }}
                      onClick={() => handleResultClick(result)}
                    >
                      <CardContent>
                        {/* Result Header */}
                        <Box display="flex" alignItems="start" justifyContent="space-between" mb={2}>
                          <Box display="flex" alignItems="center" gap={2} flex={1}>
                            <IconComponent 
                              sx={{ 
                                color: SEARCH_CATEGORIES.find(cat => cat.id === result.type)?.color + '.main' || 'primary.main',
                                fontSize: 28 
                              }} 
                            />
                            <Box flex={1}>
                              <Typography variant="h6" fontWeight="bold" mb={0.5}>
                                {result.title}
                                {result.priority === 'high' && (
                                  <StarIcon sx={{ ml: 1, color: 'error.main', fontSize: 18 }} />
                                )}
                              </Typography>
                              {result.subtitle && (
                                <Typography variant="subtitle2" color="text.secondary">
                                  {result.subtitle}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={result.type.replace('_', ' ')}
                              size="small"
                              color={SEARCH_CATEGORIES.find(cat => cat.id === result.type)?.color as any || 'default'}
                              variant="outlined"
                            />
                            {result.priority === 'high' && (
                              <Chip
                                label="High Priority"
                                size="small"
                                color="error"
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Result Description */}
                        <Typography variant="body2" color="text.secondary" mb={2}
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}>
                          {result.description}
                        </Typography>

                        {/* Tags and Metadata */}
                        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            {result.tags.slice(0, 5).map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  fontSize: '0.7rem', 
                                  height: 24,
                                  bgcolor: result.matchedFields.includes('tags') ? 'primary.50' : 'transparent'
                                }}
                              />
                            ))}
                            {result.tags.length > 5 && (
                              <Chip
                                label={`+${result.tags.length - 5} more`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 24 }}
                              />
                            )}
                          </Box>

                          {result.lastUpdated && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(result.lastUpdated).toLocaleDateString()}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Chapter Info */}
                        {result.chapter && (
                          <Box mt={1}>
                            <Chip
                              label={`Chapter: ${result.chapter}`}
                              size="small"
                              color="secondary"
                              variant="filled"
                            />
                          </Box>
                        )}
                      </CardContent>

                      <CardActions>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResultClick(result);
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          size="small"
                          startIcon={<OpenInNewIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(result.url, '_blank');
                          }}
                        >
                          Open in New Tab
                        </Button>
                        <Box flexGrow={1} />
                        <Typography variant="caption" color="text.secondary">
                          Relevance: {Math.round((result.searchScore / Math.max(...searchResults.map(r => r.searchScore))) * 100)}%
                        </Typography>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* No Search Query */}
      {!searchQuery && (
        <Box textAlign="center" py={8}>
          <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" mb={1}>
            Search NABH System
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Find objective elements, evidences, committees, surveys, and more across the entire NABH system
          </Typography>
          
          {/* Search Categories Overview */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {SEARCH_CATEGORIES.filter(cat => cat.id !== 'all').map(category => (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'grey.50' },
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => setSearchQuery(category.id === 'committee' ? 'quality committee' : category.label.toLowerCase())}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <category.icon sx={{ fontSize: 32, color: category.color + '.main', mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      {category.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      {category.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}