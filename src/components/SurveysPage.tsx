import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  LinearProgress,
  Paper,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Poll as PollIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  Send as SendIcon,
  Share as ShareIcon,
  ContentCopy as ContentCopyIcon,
  QrCode as QrCodeIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

// Survey Interfaces
interface SurveyQuestion {
  id: string;
  question: string;
  type: 'rating' | 'multiple_choice' | 'text' | 'yes_no' | 'scale';
  options?: string[];
  required: boolean;
  category?: string;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  type: 'patient_satisfaction' | 'staff_satisfaction' | 'feedback' | 'quality_assessment' | 'custom';
  status: 'draft' | 'active' | 'completed';
  questions: SurveyQuestion[];
  targetAudience: string;
  startDate: string;
  endDate: string;
  responseCount: number;
  createdBy: string;
  createdAt: string;
  nabhRelevant: boolean;
  frequency: 'one_time' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
}

// SurveyResponse interface - for future use
// interface SurveyResponse {
//   id: string;
//   surveyId: string;
//   respondentId: string;
//   respondentType: 'patient' | 'staff' | 'visitor' | 'consultant';
//   responses: Record<string, any>;
//   submittedAt: string;
//   completionTime: number; // in minutes
// }

// Survey Templates
const SURVEY_TEMPLATES = [
  {
    title: 'Staff Satisfaction Survey',
    description: 'Comprehensive staff satisfaction assessment for NABH compliance',
    type: 'staff_satisfaction' as const,
    nabhRelevant: true,
    frequency: 'quarterly' as const,
    targetAudience: 'All hospital staff (doctors, nurses, admin, support)',
    questions: [
      {
        id: 'overall_satisfaction',
        question: 'How satisfied are you with your overall work experience at Hope Hospital?',
        type: 'rating' as const,
        required: true,
        category: 'General Satisfaction',
      },
      {
        id: 'work_environment',
        question: 'How would you rate the work environment and workplace culture?',
        type: 'rating' as const,
        required: true,
        category: 'Work Environment',
      },
      {
        id: 'management_support',
        question: 'How satisfied are you with the support provided by your immediate supervisor/manager?',
        type: 'rating' as const,
        required: true,
        category: 'Management',
      },
      {
        id: 'career_development',
        question: 'How satisfied are you with career development and training opportunities?',
        type: 'rating' as const,
        required: true,
        category: 'Professional Development',
      },
      {
        id: 'work_life_balance',
        question: 'How would you rate your work-life balance?',
        type: 'rating' as const,
        required: true,
        category: 'Work-Life Balance',
      },
      {
        id: 'communication',
        question: 'How effective is communication within your department and across departments?',
        type: 'rating' as const,
        required: true,
        category: 'Communication',
      },
      {
        id: 'resources_equipment',
        question: 'Do you have adequate resources and equipment to perform your job effectively?',
        type: 'yes_no' as const,
        required: true,
        category: 'Resources',
      },
      {
        id: 'safety_protocols',
        question: 'How satisfied are you with workplace safety protocols and infection control measures?',
        type: 'rating' as const,
        required: true,
        category: 'Safety & Quality',
      },
      {
        id: 'compensation_benefits',
        question: 'How satisfied are you with your compensation and benefits package?',
        type: 'rating' as const,
        required: false,
        category: 'Compensation',
      },
      {
        id: 'recognition',
        question: 'Do you feel your contributions are recognized and appreciated?',
        type: 'yes_no' as const,
        required: true,
        category: 'Recognition',
      },
      {
        id: 'recommend_workplace',
        question: 'Would you recommend Hope Hospital as a good place to work to others?',
        type: 'yes_no' as const,
        required: true,
        category: 'Overall Recommendation',
      },
      {
        id: 'biggest_challenge',
        question: 'What is the biggest challenge you face in your current role?',
        type: 'text' as const,
        required: false,
        category: 'Feedback',
      },
      {
        id: 'improvement_suggestions',
        question: 'What suggestions do you have for improving the workplace?',
        type: 'text' as const,
        required: false,
        category: 'Feedback',
      },
      {
        id: 'nabh_awareness',
        question: 'Are you aware of NABH quality standards and their importance to our hospital?',
        type: 'yes_no' as const,
        required: true,
        category: 'Quality Awareness',
      },
      {
        id: 'quality_commitment',
        question: 'How committed are you to maintaining and improving quality standards in your work?',
        type: 'rating' as const,
        required: true,
        category: 'Quality Commitment',
      },
    ],
  },
  {
    title: 'Patient Satisfaction Survey',
    description: 'Patient experience and satisfaction assessment',
    type: 'patient_satisfaction' as const,
    nabhRelevant: true,
    frequency: 'monthly' as const,
    targetAudience: 'All patients and their families',
    questions: [
      {
        id: 'overall_experience',
        question: 'How would you rate your overall experience at Hope Hospital?',
        type: 'rating' as const,
        required: true,
        category: 'Overall Experience',
      },
      {
        id: 'admission_process',
        question: 'How satisfied were you with the admission process?',
        type: 'rating' as const,
        required: true,
        category: 'Admission',
      },
      {
        id: 'doctor_care',
        question: 'How satisfied were you with the care provided by doctors?',
        type: 'rating' as const,
        required: true,
        category: 'Medical Care',
      },
      {
        id: 'nursing_care',
        question: 'How satisfied were you with the nursing care?',
        type: 'rating' as const,
        required: true,
        category: 'Nursing Care',
      },
      {
        id: 'cleanliness',
        question: 'How would you rate the cleanliness of the hospital?',
        type: 'rating' as const,
        required: true,
        category: 'Facilities',
      },
      {
        id: 'food_quality',
        question: 'If applicable, how satisfied were you with the food quality?',
        type: 'rating' as const,
        required: false,
        category: 'Food Service',
      },
      {
        id: 'communication',
        question: 'How well did staff communicate with you about your treatment?',
        type: 'rating' as const,
        required: true,
        category: 'Communication',
      },
      {
        id: 'discharge_process',
        question: 'How satisfied were you with the discharge process?',
        type: 'rating' as const,
        required: true,
        category: 'Discharge',
      },
      {
        id: 'recommend_hospital',
        question: 'Would you recommend Hope Hospital to others?',
        type: 'yes_no' as const,
        required: true,
        category: 'Recommendation',
      },
      {
        id: 'suggestions',
        question: 'Any suggestions for improvement?',
        type: 'text' as const,
        required: false,
        category: 'Feedback',
      },
    ],
  },
  {
    title: 'Quality Assessment Survey',
    description: 'Internal quality assessment and improvement feedback',
    type: 'quality_assessment' as const,
    nabhRelevant: true,
    frequency: 'monthly' as const,
    targetAudience: 'Department heads and quality coordinators',
    questions: [
      {
        id: 'quality_standards',
        question: 'How well are NABH quality standards being implemented in your department?',
        type: 'rating' as const,
        required: true,
        category: 'Quality Implementation',
      },
      {
        id: 'documentation',
        question: 'How satisfied are you with current documentation processes?',
        type: 'rating' as const,
        required: true,
        category: 'Documentation',
      },
      {
        id: 'training_adequacy',
        question: 'Is your team adequately trained on quality protocols?',
        type: 'yes_no' as const,
        required: true,
        category: 'Training',
      },
      {
        id: 'improvement_areas',
        question: 'What areas need the most improvement for NABH compliance?',
        type: 'text' as const,
        required: true,
        category: 'Improvement Areas',
      },
    ],
  },
];

// Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`survey-tabpanel-${index}`}
      aria-labelledby={`survey-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // New survey form state
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    type: 'custom' as Survey['type'],
    targetAudience: '',
    startDate: '',
    endDate: '',
    frequency: 'one_time' as Survey['frequency'],
    nabhRelevant: false,
  });

  // Load surveys on component mount
  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);

      // Fetch surveys from Supabase
      const { data: surveysData, error: surveysError } = await supabase
        .from('surveys')
        .select('*')
        .eq('is_active', true)
        .eq('hospital_id', 'hope')
        .order('created_at', { ascending: false });

      if (surveysError) throw surveysError;

      // Fetch all questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('survey_questions')
        .select('*')
        .order('sort_order', { ascending: true });

      if (questionsError) throw questionsError;

      // Map database data to component format
      const formattedSurveys: Survey[] = (surveysData || []).map(survey => ({
        id: survey.id,
        title: survey.title,
        description: survey.description || '',
        type: survey.survey_type as Survey['type'],
        status: survey.status as Survey['status'],
        questions: (questionsData || [])
          .filter(q => q.survey_id === survey.id)
          .map(q => ({
            id: q.id,
            question: q.question,
            type: q.question_type as SurveyQuestion['type'],
            options: q.options || [],
            required: q.required,
            category: q.category || '',
          })),
        targetAudience: survey.target_audience || '',
        startDate: survey.start_date || '',
        endDate: survey.end_date || '',
        responseCount: survey.response_count || 0,
        createdBy: survey.created_by || '',
        createdAt: survey.created_at,
        nabhRelevant: survey.nabh_relevant || false,
        frequency: survey.frequency as Survey['frequency'],
      }));

      setSurveys(formattedSurveys);
    } catch (error) {
      console.error('Error loading surveys:', error);
      setSnackbar({ open: true, message: 'Failed to load surveys', severity: 'error' });
      // Fallback to template data if database fails
      const defaultSurveys: Survey[] = SURVEY_TEMPLATES.map((template, index) => ({
        id: `survey_${Date.now()}_${index}`,
        ...template,
        status: 'draft' as const,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        responseCount: 0,
        createdBy: 'Dr. Shiraz (Quality Coordinator)',
        createdAt: new Date().toISOString(),
      }));
      setSurveys(defaultSurveys);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSurvey = async () => {
    if (!selectedTemplate) {
      setSnackbar({ open: true, message: 'Please select a survey template', severity: 'error' });
      return;
    }

    const template = SURVEY_TEMPLATES.find(t => t.title === selectedTemplate);
    if (!template) return;

    try {
      // Insert survey into database
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .insert({
          title: newSurvey.title || template.title,
          description: newSurvey.description || template.description,
          survey_type: template.type,
          status: 'draft',
          target_audience: newSurvey.targetAudience || template.targetAudience,
          start_date: newSurvey.startDate || null,
          end_date: newSurvey.endDate || null,
          response_count: 0,
          created_by: 'Dr. Shiraz (Quality Coordinator)',
          nabh_relevant: template.nabhRelevant,
          frequency: template.frequency,
          hospital_id: 'hope',
        })
        .select()
        .single();

      if (surveyError) throw surveyError;

      // Insert questions
      if (template.questions && template.questions.length > 0) {
        const questionsToInsert = template.questions.map((q, index) => ({
          survey_id: surveyData.id,
          question: q.question,
          question_type: q.type,
          options: q.options || [],
          required: q.required,
          category: q.category || '',
          sort_order: index + 1,
        }));

        const { error: questionsError } = await supabase
          .from('survey_questions')
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }

      setIsAddDialogOpen(false);
      setNewSurvey({
        title: '',
        description: '',
        type: 'custom',
        targetAudience: '',
        startDate: '',
        endDate: '',
        frequency: 'one_time',
        nabhRelevant: false,
      });
      setSelectedTemplate('');
      setSnackbar({ open: true, message: 'Survey created successfully', severity: 'success' });
      loadSurveys(); // Refresh data
    } catch (error) {
      console.error('Error creating survey:', error);
      setSnackbar({ open: true, message: 'Failed to create survey', severity: 'error' });
    }
  };

  const handleActivateSurvey = async (surveyId: string) => {
    try {
      const { error } = await supabase
        .from('surveys')
        .update({ status: 'active' })
        .eq('id', surveyId);

      if (error) throw error;

      setSnackbar({ open: true, message: 'Survey activated successfully', severity: 'success' });
      loadSurveys(); // Refresh data
    } catch (error) {
      console.error('Error activating survey:', error);
      setSnackbar({ open: true, message: 'Failed to activate survey', severity: 'error' });
    }
  };

  const handleDeleteSurvey = async (surveyId: string) => {
    try {
      // Questions will be deleted automatically due to CASCADE
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', surveyId);

      if (error) throw error;

      setIsDeleteDialogOpen(false);
      setSnackbar({ open: true, message: 'Survey deleted successfully', severity: 'success' });
      loadSurveys(); // Refresh data
    } catch (error) {
      console.error('Error deleting survey:', error);
      setSnackbar({ open: true, message: 'Failed to delete survey', severity: 'error' });
    }
  };

  const getSurveyStats = () => {
    const total = surveys.length;
    const active = surveys.filter(s => s.status === 'active').length;
    const draft = surveys.filter(s => s.status === 'draft').length;
    const completed = surveys.filter(s => s.status === 'completed').length;
    const totalResponses = surveys.reduce((acc, s) => acc + s.responseCount, 0);

    return { total, active, draft, completed, totalResponses };
  };

  const stats = getSurveyStats();

  const getStatusColor = (status: Survey['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'primary';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const getTypeColor = (type: Survey['type']) => {
    switch (type) {
      case 'staff_satisfaction': return 'info';
      case 'patient_satisfaction': return 'success';
      case 'quality_assessment': return 'error';
      case 'feedback': return 'warning';
      default: return 'default';
    }
  };

  // Survey sharing functions
  const generateSurveyURL = (surveyId: string) => {
    const baseURL = window.location.origin;
    return `${baseURL}/survey/${surveyId}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbar({ 
        open: true, 
        message: 'Survey link copied to clipboard!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to copy link. Please copy manually.', 
        severity: 'error' 
      });
    }
  };

  const shareViaWhatsApp = (surveyURL: string, surveyTitle: string) => {
    const message = `🏥 *Hope Hospital Survey*\n\n*${surveyTitle}*\n\nPlease take a few minutes to complete this survey. Your feedback is valuable to us.\n\n🔗 ${surveyURL}\n\nThank you for your participation!`;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  const shareViaEmail = (surveyURL: string, surveyTitle: string) => {
    const subject = `Survey: ${surveyTitle} - Hope Hospital`;
    const body = `Dear Team,

You are invited to participate in the following survey:

Survey: ${surveyTitle}

Please click on the link below to complete the survey:
${surveyURL}

Your feedback is important for our continuous improvement and NABH accreditation process.

Thank you for your time and participation.

Best regards,
Hope Hospital Quality Team
Dr. Shiraz (Quality Coordinator)`;

    const mailtoURL = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoURL, '_blank');
  };

  const handleShareSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setIsShareDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <PollIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Survey Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Patient & Staff satisfaction surveys for NABH compliance
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Create Survey
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Surveys
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {stats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Surveys
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {stats.draft}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Draft Surveys
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {stats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {stats.totalResponses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Responses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="All Surveys" />
          <Tab label="Active" />
          <Tab label="NABH Required" />
          <Tab label="Templates" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* All Surveys */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : surveys.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography color="text.secondary">No surveys found. Create your first survey to get started.</Typography>
          </Box>
        ) : (
        <Grid container spacing={3}>
          {surveys.map(survey => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={survey.id}>
              <Card elevation={2}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {survey.title}
                    </Typography>
                    <Chip
                      label={survey.status}
                      size="small"
                      color={getStatusColor(survey.status) as any}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" mb={2} 
                    sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                    {survey.description}
                  </Typography>

                  <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <Chip
                      label={survey.type.replace('_', ' ')}
                      size="small"
                      color={getTypeColor(survey.type) as any}
                      variant="outlined"
                    />
                    {survey.nabhRelevant && (
                      <Chip
                        label="NABH"
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    )}
                    <Chip
                      label={survey.frequency.replace('_', ' ')}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      Target: {survey.targetAudience}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      Questions: {survey.questions.length} | Responses: {survey.responseCount}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      Period: {new Date(survey.startDate).toLocaleDateString()} - {new Date(survey.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {/* Response Rate Progress */}
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      Response Rate
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((survey.responseCount / 100) * 100, 100)}
                      sx={{ mt: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {survey.responseCount} responses
                    </Typography>
                  </Box>

                  {/* Survey URL for Active Surveys */}
                  {survey.status === 'active' && (
                    <Box mb={2} p={1} bgcolor="primary.50" borderRadius={1} border="1px solid" borderColor="primary.200">
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinkIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="caption" fontWeight="bold" color="primary.main">
                            Survey Link:
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(generateSurveyURL(survey.id))}
                          sx={{ p: 0.25 }}
                        >
                          <ContentCopyIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                      <Typography 
                        variant="caption" 
                        color="primary.main" 
                        sx={{ 
                          wordBreak: 'break-all',
                          fontSize: '0.7rem',
                          fontFamily: 'monospace'
                        }}
                      >
                        {generateSurveyURL(survey.id)}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedSurvey(survey);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleShareSurvey(survey)}
                    >
                      <ShareIcon />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => {
                        setSelectedSurvey(survey);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Box>
                    {survey.status === 'draft' && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<SendIcon />}
                        onClick={() => handleActivateSurvey(survey.id)}
                      >
                        Activate
                      </Button>
                    )}
                    {survey.status === 'active' && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<ShareIcon />}
                          onClick={() => handleShareSurvey(survey)}
                          sx={{ mr: 1 }}
                        >
                          Share
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                        >
                          Download
                        </Button>
                      </>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Active Surveys */}
        <Grid container spacing={3}>
          {surveys.filter(s => s.status === 'active').map(survey => (
            <Grid size={{ xs: 12, md: 6 }} key={survey.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    {survey.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {survey.description}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Responses:</strong> {survey.responseCount}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Active Until:</strong> {new Date(survey.endDate).toLocaleDateString()}
                  </Typography>
                  <Box mt={2}>
                    <Typography variant="body2" color="primary.main" sx={{ wordBreak: 'break-all' }}>
                      <strong>Survey URL:</strong> {generateSurveyURL(survey.id)}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={() => handleShareSurvey(survey)}
                  >
                    Share
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => copyToClipboard(generateSurveyURL(survey.id))}
                  >
                    Copy Link
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* NABH Required Surveys */}
        <Grid container spacing={3}>
          {surveys.filter(s => s.nabhRelevant).map(survey => (
            <Grid size={{ xs: 12, md: 6 }} key={survey.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <AssignmentIcon color="error" />
                    <Typography variant="h6" fontWeight="bold">
                      {survey.title}
                    </Typography>
                    <Chip label="NABH Required" color="error" size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {survey.description}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Frequency:</strong> {survey.frequency.replace('_', ' ')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Last Conducted:</strong> {new Date(survey.startDate).toLocaleDateString()}
                  </Typography>
                  {survey.status === 'active' && (
                    <Box mt={2}>
                      <Typography variant="body2" color="primary.main" sx={{ wordBreak: 'break-all' }}>
                        <strong>Survey URL:</strong> {generateSurveyURL(survey.id)}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={() => handleShareSurvey(survey)}
                  >
                    Share
                  </Button>
                  {survey.status === 'active' && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => copyToClipboard(generateSurveyURL(survey.id))}
                    >
                      Copy Link
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Survey Templates */}
        <Grid container spacing={3}>
          {SURVEY_TEMPLATES.map((template, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={1}>
                    {template.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {template.description}
                  </Typography>
                  <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <Chip
                      label={template.type.replace('_', ' ')}
                      size="small"
                      color={getTypeColor(template.type) as any}
                      variant="outlined"
                    />
                    {template.nabhRelevant && (
                      <Chip
                        label="NABH"
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    )}
                    <Chip
                      label={`${template.questions.length} questions`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" mb={1}>
                    <strong>Target:</strong> {template.targetAudience}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Frequency:</strong> {template.frequency.replace('_', ' ')}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedTemplate(template.title);
                      setNewSurvey({ 
                        ...newSurvey, 
                        title: template.title,
                        description: template.description,
                        type: template.type,
                        targetAudience: template.targetAudience,
                        frequency: template.frequency,
                        nabhRelevant: template.nabhRelevant,
                      });
                      setIsAddDialogOpen(true);
                    }}
                  >
                    Use Template
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Create Survey Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Survey</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Template</InputLabel>
            <Select
              value={selectedTemplate}
              onChange={(e) => {
                const template = SURVEY_TEMPLATES.find(t => t.title === e.target.value);
                if (template) {
                  setSelectedTemplate(e.target.value);
                  setNewSurvey({
                    title: template.title,
                    description: template.description,
                    type: template.type,
                    targetAudience: template.targetAudience,
                    frequency: template.frequency,
                    nabhRelevant: template.nabhRelevant,
                    startDate: '',
                    endDate: '',
                  });
                }
              }}
            >
              {SURVEY_TEMPLATES.map(template => (
                <MenuItem key={template.title} value={template.title}>
                  {template.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Survey Title"
            value={newSurvey.title}
            onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
            margin="normal"
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={newSurvey.description}
            onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Target Audience"
            value={newSurvey.targetAudience}
            onChange={(e) => setNewSurvey({ ...newSurvey, targetAudience: e.target.value })}
            margin="normal"
          />

          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={newSurvey.startDate}
              onChange={(e) => setNewSurvey({ ...newSurvey, startDate: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={newSurvey.endDate}
              onChange={(e) => setNewSurvey({ ...newSurvey, endDate: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <FormControl fullWidth margin="normal">
            <InputLabel>Frequency</InputLabel>
            <Select
              value={newSurvey.frequency}
              onChange={(e) => setNewSurvey({ ...newSurvey, frequency: e.target.value as Survey['frequency'] })}
            >
              <MenuItem value="one_time">One Time</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="annually">Annually</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSurvey}>
            Create Survey
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Survey Dialog */}
      <Dialog 
        open={isViewDialogOpen} 
        onClose={() => setIsViewDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>{selectedSurvey?.title}</DialogTitle>
        <DialogContent>
          {selectedSurvey && (
            <Box>
              <Typography variant="body1" mb={2}>
                {selectedSurvey.description}
              </Typography>
              
              <Typography variant="h6" mb={2}>Survey Questions:</Typography>
              
              {selectedSurvey.questions.map((question, index) => (
                <Accordion key={question.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      {index + 1}. {question.question}
                      {question.required && <span style={{ color: 'red' }}> *</span>}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Type:</strong> {question.type.replace('_', ' ')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Category:</strong> {question.category || 'General'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Required:</strong> {question.required ? 'Yes' : 'No'}
                      </Typography>
                      
                      {question.type === 'rating' && (
                        <Box mt={1}>
                          <Typography variant="body2">Sample rating:</Typography>
                          <Rating value={4} readOnly />
                        </Box>
                      )}
                      
                      {question.type === 'multiple_choice' && question.options && (
                        <Box mt={1}>
                          <Typography variant="body2">Options:</Typography>
                          {question.options.map((option, idx) => (
                            <Typography key={idx} variant="body2" sx={{ ml: 2 }}>
                              • {option}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete Survey</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedSurvey?.title}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. All associated responses will also be deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={() => selectedSurvey && handleDeleteSurvey(selectedSurvey.id)}
          >
            Delete Survey
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Survey Dialog */}
      <Dialog open={isShareDialogOpen} onClose={() => setIsShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Share Survey: {selectedSurvey?.title}
        </DialogTitle>
        <DialogContent>
          {selectedSurvey && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Share this survey link with your team via WhatsApp, email, or copy the URL directly.
                </Typography>
              </Alert>

              {/* Survey URL Display */}
              <Box mb={3}>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  Survey URL:
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    wordBreak: 'break-all',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {generateSurveyURL(selectedSurvey.id)}
                  </Typography>
                </Box>
              </Box>

              {/* Quick Actions */}
              <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => copyToClipboard(generateSurveyURL(selectedSurvey.id))}
                  fullWidth
                >
                  Copy Link
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<QrCodeIcon />}
                  disabled
                  fullWidth
                >
                  QR Code (Coming Soon)
                </Button>
              </Box>

              {/* Share Options */}
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                Share via:
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    startIcon={<WhatsAppIcon />}
                    onClick={() => shareViaWhatsApp(generateSurveyURL(selectedSurvey.id), selectedSurvey.title)}
                    fullWidth
                    sx={{ 
                      bgcolor: '#25D366', 
                      '&:hover': { bgcolor: '#20B858' },
                      color: 'white' 
                    }}
                  >
                    WhatsApp
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    startIcon={<EmailIcon />}
                    onClick={() => shareViaEmail(generateSurveyURL(selectedSurvey.id), selectedSurvey.title)}
                    fullWidth
                    sx={{ 
                      bgcolor: '#1976d2', 
                      '&:hover': { bgcolor: '#1565c0' } 
                    }}
                  >
                    Email
                  </Button>
                </Grid>
              </Grid>

              {/* Survey Details */}
              <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                  Survey Details:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • <strong>Target:</strong> {selectedSurvey.targetAudience}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • <strong>Questions:</strong> {selectedSurvey.questions.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • <strong>Status:</strong> {selectedSurvey.status}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • <strong>Active Until:</strong> {new Date(selectedSurvey.endDate).toLocaleDateString()}
                </Typography>
                {selectedSurvey.nabhRelevant && (
                  <Typography variant="body2" color="error.main">
                    • <strong>NABH Required Survey</strong>
                  </Typography>
                )}
              </Box>

              {/* Instructions */}
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Pro Tip:</strong> Copy the link and paste it in your WhatsApp groups, email lists, or share directly with team members. 
                  The survey will automatically track responses for NABH audit evidence.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsShareDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={() => selectedSurvey && copyToClipboard(generateSurveyURL(selectedSurvey.id))}
          >
            Copy & Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}