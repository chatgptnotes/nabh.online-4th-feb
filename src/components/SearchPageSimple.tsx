import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';

export default function SearchPageSimple() {
  const [searchQuery, setSearchQuery] = useState('');

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
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
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

          {/* Quick Search Suggestions */}
          {!searchQuery && (
            <Box mt={2}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Popular Searches:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {['hand hygiene', 'admission process', 'quality committee', 'patient satisfaction', 'infection control', 'pain assessment', 'staff survey'].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outlined"
                    size="small"
                    onClick={() => setSearchQuery(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Search Results */}
      {searchQuery && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body1">
              Search functionality is currently being implemented. 
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              You searched for: "{searchQuery}"
            </Typography>
          </Alert>

          {/* Placeholder Results */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sample Result: NABH Objective Element
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This is where search results would appear. The search functionality 
                will include objectives, evidence, committees, and other NABH content.
              </Typography>
            </CardContent>
          </Card>
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
          
          <Typography variant="body2" color="text.secondary">
            Search functionality is being implemented for the NABH audit preparation.
          </Typography>
        </Box>
      )}
    </Box>
  );
}