import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Icon from '@mui/material/Icon';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import { useNABHStore } from '../store/nabhStore';
import { getHospitalInfo, NABH_TEAM } from '../config/hospitalConfig';

const features = [
  {
    icon: 'checklist',
    title: '408 Objective Elements',
    description: 'Complete NABH SHCO 3rd Edition standards with all 10 chapters and 71 standards.',
    color: '#1565C0',
  },
  {
    icon: 'verified',
    title: 'Accreditation Ready',
    description: 'Generate comprehensive, audit-ready evidence documents with proper formatting.',
    color: '#D32F2F',
  },
  {
    icon: 'upload_file',
    title: 'Evidence Upload',
    description: 'Upload and manage evidence documents including images and PDFs for each element.',
    color: '#2E7D32',
  },
  {
    icon: 'assignment_ind',
    title: 'Team Assignment',
    description: 'Assign tasks to team members and track progress across all departments.',
    color: '#ED6C02',
  },
  {
    icon: 'analytics',
    title: 'Progress Tracking',
    description: 'Real-time dashboard with chapter-wise progress and status indicators.',
    color: '#7B1FA2',
  },
  {
    icon: 'description',
    title: 'Document Templates',
    description: 'Professional SOPs, policies, registers, and CAPA documentation with hospital branding.',
    color: '#00838F',
  },
];

const stats = [
  { value: '10', label: 'Chapters' },
  { value: '71', label: 'Standards' },
  { value: '408', label: 'Objective Elements' },
  { value: '100', label: 'Core Elements' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { chapters, setSelectedChapter, selectedHospital } = useNABHStore();
  const hospitalConfig = getHospitalInfo(selectedHospital);

  const handleGetStarted = () => {
    if (chapters.length > 0) {
      setSelectedChapter(chapters[0].id);
      navigate('/dashboard');
    } else {
      // If chapters not loaded yet, navigate to dashboard anyway
      navigate('/dashboard');
    }
  };

  const handleGenerator = () => {
    navigate('/ai-generator');
  };

  // Use Ayushman logo if selected, otherwise default
  const logoUrl = hospitalConfig.id === 'ayushman' ? '/ayushman-logo.png' : '/hospital-logo.png';

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 50%, #1A237E 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          px: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.5,
            animation: 'backgroundMove 20s linear infinite',
            '@keyframes backgroundMove': {
              '0%': { backgroundPosition: '0 0' },
              '100%': { backgroundPosition: '60px 60px' },
            },
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '40%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'rotate 30s linear infinite',
            '@keyframes rotate': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  animation: 'slideInLeft 0.8s ease-out',
                  '@keyframes slideInLeft': {
                    from: { opacity: 0, transform: 'translateX(-50px)' },
                    to: { opacity: 1, transform: 'translateX(0)' },
                  },
                }}
              >
                <Chip
                  label="NABH SHCO 3rd Edition"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    mb: 2,
                    fontWeight: 600,
                  }}
                />
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                  }}
                >
                  NABH.online
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 1,
                    opacity: 0.95,
                    fontWeight: 500,
                    lineHeight: 1.6,
                  }}
                >
                  Evidence Management System
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 4,
                    opacity: 0.85,
                    fontWeight: 400,
                    lineHeight: 1.6,
                  }}
                >
                  Your complete solution for NABH accreditation preparation. Manage evidence, track progress, and generate professional documentation for {hospitalConfig.name}.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                    startIcon={<Icon>play_arrow</Icon>}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleGenerator}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderColor: 'white',
                      },
                    }}
                    startIcon={<Icon>description</Icon>}
                  >
                    Quality Documentation Assistant
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  position: 'relative',
                  animation: 'float 6s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                  },
                }}
              >
                {/* Decorative circles */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '10%',
                    right: '10%',
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                    animation: 'pulse 4s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
                      '50%': { transform: 'scale(1.1)', opacity: 0.8 },
                    },
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '5%',
                    left: '5%',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
                    animation: 'pulse 3s ease-in-out infinite 1s',
                  }}
                />
                {/* Main feature showcase */}
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <Grid container spacing={2} sx={{ maxWidth: 400 }}>
                    {/* Feature cards */}
                    <Grid size={{ xs: 6 }}>
                      <Box
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.95)',
                          borderRadius: 3,
                          p: 2.5,
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                          },
                        }}
                      >
                        <Icon sx={{ fontSize: 40, color: '#1565C0', mb: 1 }}>checklist</Icon>
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                          408
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Objective Elements
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.95)',
                          borderRadius: 3,
                          p: 2.5,
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          transition: 'all 0.3s ease',
                          animation: 'slideInRight 0.8s ease-out 0.2s both',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                          },
                          '@keyframes slideInRight': {
                            from: { opacity: 0, transform: 'translateX(50px)' },
                            to: { opacity: 1, transform: 'translateX(0)' },
                          },
                        }}
                      >
                        <Icon sx={{ fontSize: 40, color: '#D32F2F', mb: 1 }}>verified</Icon>
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                          AI-Powered
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Evidence Generation
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.95)',
                          borderRadius: 3,
                          p: 2.5,
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          transition: 'all 0.3s ease',
                          animation: 'slideInRight 0.8s ease-out 0.4s both',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                          },
                        }}
                      >
                        <Icon sx={{ fontSize: 40, color: '#2E7D32', mb: 1 }}>analytics</Icon>
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                          Real-time
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Progress Tracking
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.95)',
                          borderRadius: 3,
                          p: 2.5,
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          transition: 'all 0.3s ease',
                          animation: 'slideInRight 0.8s ease-out 0.6s both',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                          },
                        }}
                      >
                        <Icon sx={{ fontSize: 40, color: '#ED6C02', mb: 1 }}>description</Icon>
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                          Professional
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Documentation
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
                <Box
                  sx={{
                    textAlign: 'center',
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                    '@keyframes fadeInUp': {
                      from: { opacity: 0, transform: 'translateY(20px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #1565C0 0%, #D32F2F 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              Comprehensive Features
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Everything you need to prepare for NABH accreditation, all in one place
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid key={feature.title} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${alpha(feature.color, 0)} 0%, ${alpha(feature.color, 0.05)} 100%)`,
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: `0 20px 40px ${alpha(feature.color, 0.2)}`,
                      '&::before': {
                        opacity: 1,
                      },
                      '& .feature-icon': {
                        transform: 'rotate(10deg) scale(1.1)',
                      },
                    },
                  }}
                  onClick={handleGetStarted}
                >
                  <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                    <Box
                      className="feature-icon"
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        bgcolor: alpha(feature.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <Icon sx={{ fontSize: 28, color: feature.color }}>{feature.icon}</Icon>
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              NABH Team
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Dedicated professionals driving accreditation excellence
            </Typography>
          </Box>
          <Grid container spacing={3} justifyContent="center">
            {NABH_TEAM.filter(m => m.role !== 'Department Staff').map((member, index) => (
              <Grid key={member.name} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card
                  sx={{
                    textAlign: 'center',
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        fontSize: '2rem',
                        fontWeight: 700,
                      }}
                    >
                      {member.name.charAt(0)}
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {member.name}
                    </Typography>
                    <Chip
                      label={member.role}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {member.department}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            animation: 'backgroundSlide 20s linear infinite',
            '@keyframes backgroundSlide': {
              '0%': { transform: 'translate(0, 0)' },
              '100%': { transform: 'translate(50px, 50px)' },
            },
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              animation: 'fadeInScale 0.8s ease-out',
              '@keyframes fadeInScale': {
                from: { opacity: 0, transform: 'scale(0.95)' },
                to: { opacity: 1, transform: 'scale(1)' },
              },
            }}
          >
            <Typography
              variant="h3"
              fontWeight={700}
              gutterBottom
              sx={{
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              Ready to Start?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
              Begin your NABH accreditation journey with our comprehensive evidence management system
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleGetStarted}
                sx={{
                  bgcolor: 'white',
                  color: 'secondary.main',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.95)',
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                  },
                }}
                startIcon={<Icon>rocket_launch</Icon>}
              >
                Start Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleGenerator}
                sx={{
                  borderColor: 'white',
                  borderWidth: 2,
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                    borderColor: 'white',
                    borderWidth: 2,
                    transform: 'translateY(-3px) scale(1.05)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                  },
                }}
                startIcon={<Icon>description</Icon>}
              >
                Quality Documentation Assistant
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, bgcolor: '#1E293B', color: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <img
                src={logoUrl}
                alt={hospitalConfig.name}
                style={{ height: 40, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              />
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  {hospitalConfig.name}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {hospitalConfig.address}
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              v2.1 | NABH.online
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
