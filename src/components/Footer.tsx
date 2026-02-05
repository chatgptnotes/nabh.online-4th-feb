import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const VERSION = '1.4';
const LAST_UPDATED = '2026-01-29';
const REPO_NAME = 'nabh-evidence-creator';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        mt: 'auto',
        textAlign: 'center',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: 'text.disabled',
          fontSize: '0.7rem',
        }}
      >
        v{VERSION} | {LAST_UPDATED} | {REPO_NAME}
      </Typography>
    </Box>
  );
}
