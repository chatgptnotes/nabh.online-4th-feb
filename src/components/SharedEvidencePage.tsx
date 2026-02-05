import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Icon from '@mui/material/Icon';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { loadEvidenceById, type GeneratedEvidence } from '../services/objectiveStorage';

export default function SharedEvidencePage() {
  const { evidenceId } = useParams<{ evidenceId: string }>();
  const [evidence, setEvidence] = useState<GeneratedEvidence | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvidence = async () => {
      if (!evidenceId) {
        setError('No evidence ID provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const result = await loadEvidenceById(evidenceId);
      if (result.success && result.data) {
        setEvidence(result.data);
      } else {
        setError(result.error || 'Evidence not found');
      }
      setIsLoading(false);
    };

    loadEvidence();
  }, [evidenceId]);

  const handlePrint = () => {
    if (!evidence) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(evidence.html_content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadPDF = () => {
    if (!evidence) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(evidence.html_content);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading evidence document...
        </Typography>
      </Box>
    );
  }

  if (error || !evidence) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Icon sx={{ fontSize: 64, color: 'error.main', mb: 2 }}>error_outline</Icon>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Evidence Not Found
        </Typography>
        <Alert severity="error" sx={{ maxWidth: 400, mt: 2 }}>
          {error || 'The requested evidence document could not be found.'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<Icon>home</Icon>}
          href="/"
          sx={{ mt: 3 }}
        >
          Go to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header Bar */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          borderRadius: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Icon color="primary" sx={{ fontSize: 28 }}>description</Icon>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {evidence.evidence_title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={evidence.objective_code}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary">
                Generated: {new Date(evidence.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Icon>print</Icon>}
            onClick={handlePrint}
            size="small"
          >
            Print
          </Button>
          <Button
            variant="contained"
            startIcon={<Icon>picture_as_pdf</Icon>}
            onClick={handleDownloadPDF}
            size="small"
          >
            Download PDF
          </Button>
        </Box>
      </Paper>

      {/* Document Content */}
      <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
        <Paper
          elevation={2}
          sx={{
            overflow: 'hidden',
            bgcolor: 'white',
          }}
        >
          {/* Render the HTML content in an iframe for isolation */}
          <Box
            sx={{
              '& iframe': {
                width: '100%',
                minHeight: '800px',
                border: 'none',
                backgroundColor: 'white',
              },
            }}
          >
            <iframe
              srcDoc={evidence.html_content}
              title={evidence.evidence_title}
              sandbox="allow-same-origin allow-popups"
              style={{ display: 'block' }}
            />
          </Box>
        </Paper>

        {/* Hospital Info Footer */}
        <Paper sx={{ mt: 3, p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            This document was generated for <strong>{evidence.hospital_config?.name || 'Hospital'}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {evidence.hospital_config?.address}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip
              icon={<Icon sx={{ fontSize: 16 }}>verified</Icon>}
              label="NABH Compliant Document"
              size="small"
              color="success"
              variant="outlined"
            />
          </Box>
        </Paper>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          textAlign: 'center',
          py: 2,
          borderTop: 1,
          borderColor: 'divider',
          mt: 4,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          NABH.online - Hope Hospital
        </Typography>
      </Box>
    </Box>
  );
}
