/**
 * Shared SOP Page
 * Public view of a single SOP document via shareable URL
 * Route: /sop/:sopId
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Icon,
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import type { SOPDocument } from '../types/sop';
import { loadSOPById } from '../services/sopStorage';
import { getHospitalInfo } from '../config/hospitalConfig';

export default function SharedSOPPage() {
  const { sopId } = useParams<{ sopId: string }>();
  const [sop, setSOP] = useState<SOPDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sopId) {
      loadSOPData(sopId);
    }
  }, [sopId]);

  const loadSOPData = async (id: string) => {
    setLoading(true);
    const result = await loadSOPById(id);

    if (result.success && result.data) {
      // Check if SOP is public
      if (!result.data.is_public) {
        setError('This SOP is not publicly accessible.');
      } else {
        setSOP(result.data);
      }
    } else {
      setError(result.error || 'SOP not found');
    }

    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  const handleDownload = () => {
    if (!sop) return;

    // Create HTML document
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${sop.title}</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.6;
          }
          .header {
            border-bottom: 2px solid #1976d2;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .sop-heading-1 {
            font-size: 2rem;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          .sop-heading-2 {
            font-size: 1.5rem;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          .sop-heading-3 {
            font-size: 1.25rem;
            font-weight: bold;
            margin-top: 10px;
            margin-bottom: 10px;
          }
          .sop-paragraph {
            margin-bottom: 10px;
          }
          .sop-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .sop-table td, .sop-table th {
            border: 1px solid #ddd;
            padding: 8px;
          }
          .sop-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${sop.title}</h1>
          <p><strong>Chapter:</strong> ${sop.chapter_code} - ${sop.chapter_name}</p>
          <p><strong>Version:</strong> ${sop.version}</p>
          <p><strong>Status:</strong> ${sop.status}</p>
          ${sop.effective_date ? `<p><strong>Effective Date:</strong> ${new Date(sop.effective_date).toLocaleDateString()}</p>` : ''}
        </div>
        ${sop.description ? `<p><strong>Description:</strong> ${sop.description}</p>` : ''}
        <div class="content">
          ${sop.extracted_content}
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.9rem; color: #666;">
          <p>Generated from NABH Evidence Creator</p>
          <p>Hospital: ${getHospitalInfo('hope').name}</p>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sop.title.replace(/[^a-z0-9]/gi, '_')}_${sop.version}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box textAlign="center">
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading SOP...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !sop) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'SOP not found'}
        </Alert>
        <Button variant="contained" href="/">
          Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Box>
      {/* Print-friendly header */}
      <Box
        className="no-print"
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 2,
          '@media print': { display: 'none' },
        }}
      >
        <Container maxWidth="md">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">NABH SOP - {getHospitalInfo('hope').name}</Typography>
            <Box display="flex" gap={1}>
              <Button color="inherit" startIcon={<ShareIcon />} onClick={handleShare}>
                Share
              </Button>
              <Button color="inherit" startIcon={<DownloadIcon />} onClick={handleDownload}>
                Download
              </Button>
              <Button color="inherit" startIcon={<PrintIcon />} onClick={handlePrint}>
                Print
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          {/* SOP Header */}
          <Box mb={3}>
            <Box display="flex" gap={1} mb={2}>
              <Chip label={sop.chapter_code} color="primary" />
              <Chip label={sop.status} color={sop.status === 'Active' ? 'success' : 'default'} />
              <Chip label={`v${sop.version}`} variant="outlined" />
              {sop.category && <Chip label={sop.category} variant="outlined" />}
            </Box>

            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {sop.title}
            </Typography>

            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {sop.chapter_name}
            </Typography>

            {sop.description && (
              <Typography variant="body1" color="text.secondary" paragraph>
                {sop.description}
              </Typography>
            )}

            <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
              {sop.effective_date && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Effective Date
                  </Typography>
                  <Typography variant="body2">{new Date(sop.effective_date).toLocaleDateString()}</Typography>
                </Box>
              )}
              {sop.review_date && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Review Date
                  </Typography>
                  <Typography variant="body2">{new Date(sop.review_date).toLocaleDateString()}</Typography>
                </Box>
              )}
              {sop.department && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Department
                  </Typography>
                  <Typography variant="body2">{sop.department}</Typography>
                </Box>
              )}
              {sop.author && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Author
                  </Typography>
                  <Typography variant="body2">{sop.author}</Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* SOP Content */}
          <Box
            dangerouslySetInnerHTML={{ __html: sop.extracted_content }}
            sx={{
              '& .sop-heading-1': {
                fontSize: '2rem',
                fontWeight: 'bold',
                marginTop: '24px',
                marginBottom: '16px',
                color: 'primary.main',
              },
              '& .sop-heading-2': {
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginTop: '20px',
                marginBottom: '12px',
                color: 'primary.dark',
              },
              '& .sop-heading-3': {
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginTop: '16px',
                marginBottom: '8px',
              },
              '& .sop-paragraph': {
                marginBottom: '12px',
                lineHeight: 1.7,
              },
              '& .sop-table': {
                width: '100%',
                borderCollapse: 'collapse',
                my: 3,
                '& td, & th': {
                  border: '1px solid #e0e0e0',
                  padding: '12px',
                },
                '& th': {
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold',
                },
              },
              '& ul, & ol': {
                marginBottom: '16px',
                paddingLeft: '24px',
              },
              '& li': {
                marginBottom: '8px',
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                my: 2,
              },
            }}
          />

          <Divider sx={{ my: 3 }} />

          {/* Footer */}
          <Box mt={4} pt={2} borderTop="1px solid" borderColor="divider">
            <Typography variant="caption" color="text.secondary" display="block">
              {getHospitalInfo('hope').name}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              NABH SHCO 3rd Edition Standard Operating Procedure
            </Typography>
            {sop.google_drive_url && (
              <Typography variant="caption" color="text.secondary" display="block">
                <a href={sop.google_drive_url} target="_blank" rel="noopener noreferrer">
                  View Original Document
                </a>
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Print instructions */}
        <Box className="no-print" mt={2} sx={{ '@media print': { display: 'none' } }}>
          <Alert severity="info">
            <Typography variant="body2">
              This SOP can be printed or downloaded as HTML. Use the buttons above to share, download, or print this document.
            </Typography>
          </Alert>
        </Box>
      </Container>
    </Box>
  );
}
