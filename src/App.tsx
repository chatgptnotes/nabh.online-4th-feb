import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ObjectiveList from './components/ObjectiveList';
import ObjectiveDetailPage from './components/ObjectiveDetailPage';
import AIEvidenceGenerator from './components/AIEvidenceGenerator';
import LandingPage from './components/LandingPage';
import SharedEvidencePage from './components/SharedEvidencePage';
import StationeryPage from './components/StationeryPage';
import CommitteesPage from './components/CommitteesPage';
import KPIsPage from './components/KPIsPage';
import KPIDetailPage from './components/KPIDetailPage';
import SlideDeckPage from './components/SlideDeckPage';
import DataMigrationPage from './components/DataMigrationPage';
import NABHMasterPage from './components/NABHMasterPage';
import PatientsPage from './components/PatientsPage';
import EmployeesPage from './components/EmployeesPage';
import VisitingConsultantsPage from './components/VisitingConsultantsPage';
import DoctorsPage from './components/DoctorsPage';
import DepartmentsMasterPage from './components/DepartmentsMasterPage';
import EquipmentMasterPage from './components/EquipmentMasterPage';
import EvidencePromptMasterPage from './components/EvidencePromptMasterPage';
import SOPPromptMasterPage from './components/SOPPromptMasterPage';
import HospitalProgramsMasterPage from './components/HospitalProgramsMasterPage';
import ClinicalAuditsMasterPage from './components/ClinicalAuditsMasterPage';
import HospitalManualsMasterPage from './components/HospitalManualsMasterPage';
import LicensesMasterPage from './components/LicensesMasterPage';
import MOUsMasterPage from './components/MOUsMasterPage';
import SurveysPage from './components/SurveysPage';
import CheatSheetsPage from './components/CheatSheetsPage';
import SearchPage from './components/SearchPage';
import EmergencyCodesPage from './components/EmergencyCodesPage';
import SignageGenerator from './components/SignageGenerator';
import ImageGenerator from './components/ImageGenerator';
import TwilioCallCenter from './components/TwilioCallCenter';
import SOPsPage from './components/SOPsPage';
import RecentSOPsPage from './components/RecentSOPsPage';
import SharedSOPPage from './components/SharedSOPPage';
import DocumentLevelsPage from './components/DocumentLevelsPage';
import OldExtractedSOPsPage from './components/OldExtractedSOPsPage';
import Footer from './components/Footer';
import { useNABHStore } from './store/nabhStore';

// Modern theme with Hope Hospital colors (from logo: red and blue)
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565C0', // Deep blue from logo
      light: '#42A5F5',
      dark: '#0D47A1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#D32F2F', // Red from logo
      light: '#EF5350',
      dark: '#B71C1C',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    warning: {
      main: '#ED6C02',
      light: '#FF9800',
      dark: '#E65100',
    },
    error: {
      main: '#D32F2F',
      light: '#EF5350',
      dark: '#C62828',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          '&:hover': {
            transform: 'translateY(-1px)',
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
            },
            '&.Mui-focused': {
              boxShadow: `0px 0px 0px 3px ${alpha('#1565C0', 0.2)}`,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #E2E8F0',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            backgroundColor: '#F8FAFC',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: '#F8FAFC',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
        },
      },
    },
  },
});

const drawerWidth = 280;

function MainContent() {
  const location = useLocation();
  const { selectedChapter } = useNABHStore();
  const isAIPage = location.pathname === '/ai-generator';
  const isObjectiveDetailPage = location.pathname.startsWith('/objective/');
  const isStationeryPage = location.pathname === '/stationery';
  const isCommitteesPage = location.pathname === '/committees';
  const isSurveysPage = location.pathname === '/surveys';
  const isCheatSheetsPage = location.pathname === '/cheat-sheets';
  const isSearchPage = location.pathname === '/search';
  const isKPIsPage = location.pathname === '/kpis';
  const isKPIDetailPage = location.pathname.startsWith('/kpi/');
  const isPresentationsPage = location.pathname === '/presentations';
  const isNABHMasterPage = location.pathname === '/nabh-master';
  const isMigrationPage = location.pathname === '/migration';
  const isPatientsPage = location.pathname === '/patients';
  const isEmployeesPage = location.pathname === '/employees';
  const isConsultantsPage = location.pathname === '/consultants';
  const isDoctorsPage = location.pathname === '/doctors';
  const isDepartmentsPage = location.pathname === '/departments';
  const isEquipmentPage = location.pathname === '/equipment';
  const isEvidencePromptPage = location.pathname === '/evidence-prompt';
  const isSOPPromptPage = location.pathname === '/sop-prompt';
  const isProgramsPage = location.pathname === '/programs';
  const isClinicalAuditsPage = location.pathname === '/clinical-audits';
  const isManualsPage = location.pathname === '/manuals';
  const isLicensesPage = location.pathname === '/licenses';
  const isMOUsPage = location.pathname === '/mous';
  const isEmergencyCodesPage = location.pathname === '/emergency-codes';
  const isSignageGeneratorPage = location.pathname === '/signage-generator';
  const isImageGeneratorPage = location.pathname === '/image-generator';
  const isCallCenterPage = location.pathname === '/call-center';
  const isSOPsPage = location.pathname === '/sops';
  const isRecentSOPsPage = location.pathname === '/recent-sops';
  const isDocumentLevelsPage = location.pathname === '/document-levels';
  const isOldExtractedSOPsPage = location.pathname === '/old-extracted-sops';
  const isDashboardPage = location.pathname === '/dashboard';
  const isLandingPage = location.pathname === '/' && !selectedChapter;

  if (isAIPage) {
    return <AIEvidenceGenerator />;
  }

  if (isObjectiveDetailPage) {
    return <ObjectiveDetailPage />;
  }

  if (isStationeryPage) {
    return <StationeryPage />;
  }

  if (isCommitteesPage) {
    return <CommitteesPage />;
  }

  if (isSurveysPage) {
    return <SurveysPage />;
  }

  if (isCheatSheetsPage) {
    return <CheatSheetsPage />;
  }

  if (isSearchPage) {
    return <SearchPage />;
  }

  if (isKPIsPage) {
    return <KPIsPage />;
  }

  if (isKPIDetailPage) {
    return <KPIDetailPage />;
  }

  if (isPresentationsPage) {
    return <SlideDeckPage />;
  }

  if (isNABHMasterPage) {
    return <NABHMasterPage />;
  }

  if (isMigrationPage) {
    return <DataMigrationPage />;
  }

  if (isPatientsPage) {
    return <PatientsPage />;
  }

  if (isEmployeesPage) {
    return <EmployeesPage />;
  }

  if (isConsultantsPage) {
    return <VisitingConsultantsPage />;
  }

  if (isDoctorsPage) {
    return <DoctorsPage />;
  }

  if (isDepartmentsPage) {
    return <DepartmentsMasterPage />;
  }

  if (isEquipmentPage) {
    return <EquipmentMasterPage />;
  }

  if (isEvidencePromptPage) {
    return <EvidencePromptMasterPage />;
  }

  if (isSOPPromptPage) {
    return <SOPPromptMasterPage />;
  }

  if (isProgramsPage) {
    return <HospitalProgramsMasterPage />;
  }

  if (isClinicalAuditsPage) {
    return <ClinicalAuditsMasterPage />;
  }

  if (isManualsPage) {
    return <HospitalManualsMasterPage />;
  }

  if (isLicensesPage) {
    return <LicensesMasterPage />;
  }

  if (isMOUsPage) {
    return <MOUsMasterPage />;
  }

  if (isEmergencyCodesPage) {
    return <EmergencyCodesPage />;
  }

  if (isSignageGeneratorPage) {
    return <SignageGenerator />;
  }

  if (isImageGeneratorPage) {
    return <ImageGenerator />;
  }

  if (isCallCenterPage) {
    return <TwilioCallCenter />;
  }

  if (isSOPsPage) {
    return <SOPsPage />;
  }

  if (isRecentSOPsPage) {
    return <RecentSOPsPage />;
  }

  if (isDocumentLevelsPage) {
    return <DocumentLevelsPage />;
  }

  if (isOldExtractedSOPsPage) {
    return <OldExtractedSOPsPage />;
  }

  if (isDashboardPage) {
    return <Dashboard />;
  }

  if (isLandingPage) {
    return <LandingPage />;
  }

  return selectedChapter ? <ObjectiveList /> : <Dashboard />;
}

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { selectedChapter, loadDataFromSupabase } = useNABHStore();

  // Load data from Supabase on app start
  useEffect(() => {
    loadDataFromSupabase();
  }, [loadDataFromSupabase]);

  // Scroll to top when route changes or chapter selection changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [location.pathname, selectedChapter]);

  const isAIPage = location.pathname === '/ai-generator';
  const isObjectiveDetailPage = location.pathname.startsWith('/objective/');
  const isKPIDetailPage = location.pathname.startsWith('/kpi/');
  const isManagementPage = ['/stationery', '/committees', '/surveys', '/cheat-sheets', '/search', '/kpis', '/presentations', '/nabh-master', '/migration', '/patients', '/employees', '/consultants', '/doctors', '/departments', '/equipment', '/programs', '/clinical-audits', '/manuals', '/licenses', '/mous', '/evidence-prompt', '/sop-prompt', '/emergency-codes', '/signage-generator', '/image-generator', '/call-center', '/sops', '/recent-sops', '/old-extracted-sops', '/dashboard'].includes(location.pathname) || isKPIDetailPage;
  const isLandingPage = location.pathname === '/' && !selectedChapter;
  const showSidebar = !isAIPage && !isLandingPage && !isObjectiveDetailPage || isManagementPage;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header onMenuClick={handleDrawerToggle} />
      {showSidebar && <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />}
      <Box
        component="main"
        ref={scrollContainerRef}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: showSidebar 
            ? { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` }
            : '100%',
          minWidth: 0, // Prevent flex item from overflowing
          transition: 'all 0.3s ease-in-out',
          overflow: 'auto',
          height: '100vh',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            p: isLandingPage ? 0 : 3,
            flexGrow: 1,
            animation: 'fadeIn 0.5s ease-in-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(10px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <MainContent />
        </Box>
        {!isLandingPage && <Footer />}
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/evidence/:evidenceId" element={<SharedEvidencePage />} />
          <Route path="/sop/:sopId" element={<SharedSOPPage />} />
          <Route path="/objective/:chapterId/:objectiveId" element={<AppContent />} />
          <Route path="/kpi/:kpiId" element={<AppContent />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
