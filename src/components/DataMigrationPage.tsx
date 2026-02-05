import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Icon from '@mui/material/Icon';
import { supabase } from '../lib/supabase';

interface ChapterStats {
  name: string;
  description: string;
  standardCount: number;
  elementCount: number;
  coreCount: number;
  withInterpretation: number;
}

interface DatabaseStats {
  totalChapters: number;
  totalStandards: number;
  totalElements: number;
  totalCore: number;
  totalWithInterpretation: number;
  chapters: ChapterStats[];
}

export default function DataMigrationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch chapters with their standards and elements
      const { data: chapters, error: chaptersError } = await supabase
        .from('nabh_chapters')
        .select(`
          id,
          name,
          description,
          nabh_standards (
            id,
            nabh_objective_elements (
              id,
              is_core,
              interpretation
            )
          )
        `)
        .order('chapter_number');

      if (chaptersError) throw chaptersError;

      // Define types for the nested response
      interface ElementData {
        id: string;
        is_core: boolean;
        interpretation: string | null;
      }
      interface StandardData {
        id: string;
        nabh_objective_elements: ElementData[];
      }
      interface ChapterData {
        id: string;
        name: string;
        description: string;
        nabh_standards: StandardData[];
      }

      // Calculate stats
      const chapterStats: ChapterStats[] = ((chapters || []) as ChapterData[]).map(ch => {
        const elements = ch.nabh_standards?.flatMap(s => s.nabh_objective_elements || []) || [];
        return {
          name: ch.name,
          description: ch.description,
          standardCount: ch.nabh_standards?.length || 0,
          elementCount: elements.length,
          coreCount: elements.filter(e => e.is_core).length,
          withInterpretation: elements.filter(e => e.interpretation && e.interpretation.trim() !== '').length,
        };
      });

      const totalStats: DatabaseStats = {
        totalChapters: chapterStats.length,
        totalStandards: chapterStats.reduce((sum, ch) => sum + ch.standardCount, 0),
        totalElements: chapterStats.reduce((sum, ch) => sum + ch.elementCount, 0),
        totalCore: chapterStats.reduce((sum, ch) => sum + ch.coreCount, 0),
        totalWithInterpretation: chapterStats.reduce((sum, ch) => sum + ch.withInterpretation, 0),
        chapters: chapterStats,
      };

      setStats(totalStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds to track interpretation progress
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const interpretationProgress = stats ? (stats.totalWithInterpretation / stats.totalElements) * 100 : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
        Database Status & Migration
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        NABH SHCO 3rd Edition Standards - Database Overview
      </Typography>

      {isLoading && !stats ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : stats && (
        <>
          {/* Summary Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.50' }}>
              <Icon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }}>menu_book</Icon>
              <Typography variant="h3" fontWeight={700} color="primary.main">
                {stats.totalChapters}
              </Typography>
              <Typography variant="body2" color="text.secondary">Chapters</Typography>
            </Paper>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.50' }}>
              <Icon sx={{ fontSize: 40, color: 'success.main', mb: 1 }}>assignment</Icon>
              <Typography variant="h3" fontWeight={700} color="success.main">
                {stats.totalStandards}
              </Typography>
              <Typography variant="body2" color="text.secondary">Standards</Typography>
            </Paper>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.50' }}>
              <Icon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }}>checklist</Icon>
              <Typography variant="h3" fontWeight={700} color="warning.main">
                {stats.totalElements}
              </Typography>
              <Typography variant="body2" color="text.secondary">Objective Elements</Typography>
            </Paper>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'error.50' }}>
              <Icon sx={{ fontSize: 40, color: 'error.main', mb: 1 }}>priority_high</Icon>
              <Typography variant="h3" fontWeight={700} color="error.main">
                {stats.totalCore}
              </Typography>
              <Typography variant="body2" color="text.secondary">Core Elements</Typography>
            </Paper>
          </Box>

          {/* Interpretation Progress */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  <Icon sx={{ verticalAlign: 'middle', mr: 1 }}>auto_awesome</Icon>
                  AI Interpretations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  AI-generated practical guidance for each objective element
                </Typography>
              </Box>
              <Chip 
                label={`${stats.totalWithInterpretation} / ${stats.totalElements}`}
                color={interpretationProgress === 100 ? 'success' : 'warning'}
                icon={<Icon>{interpretationProgress === 100 ? 'check_circle' : 'pending'}</Icon>}
              />
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={interpretationProgress} 
              sx={{ height: 10, borderRadius: 5, mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary" textAlign="right">
              {interpretationProgress.toFixed(1)}% complete
              {interpretationProgress < 100 && ' (auto-refreshing every 30s)'}
            </Typography>
          </Paper>

          {/* Chapter Details Table */}
          <Paper sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              Chapter-wise Breakdown
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Chapter</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Standards</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Elements</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Core</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Interpretations</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.chapters.map((ch) => (
                    <TableRow key={ch.name} hover>
                      <TableCell>
                        <Chip label={ch.name} size="small" color="primary" />
                      </TableCell>
                      <TableCell>{ch.description}</TableCell>
                      <TableCell align="center">{ch.standardCount}</TableCell>
                      <TableCell align="center">{ch.elementCount}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={ch.coreCount} 
                          size="small" 
                          color="error" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={(ch.withInterpretation / ch.elementCount) * 100}
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption">
                            {ch.withInterpretation}/{ch.elementCount}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Refresh Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="outlined" 
              startIcon={<Icon>refresh</Icon>}
              onClick={fetchStats}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh Stats'}
            </Button>
          </Box>
        </>
      )}

      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>NABH SHCO 3rd Edition</strong> contains 10 chapters, 71 standards, and 408 objective elements.
          <br />
          <strong>Core elements (99)</strong> are mandatory and assessed during every assessment.
          <br />
          <strong>AI Interpretations</strong> provide practical guidance for compliance, including documents to maintain, 
          what assessors look for, and Indian regulatory context.
        </Typography>
      </Alert>
    </Box>
  );
}
