import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Icon from '@mui/material/Icon';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import { getOverallStats } from '../data/nabhData';
import { useNABHStore } from '../store/nabhStore';

interface StatCardProps {
  title: string;
  value: number;
  total?: number;
  icon: string;
  color: string;
}

function StatCard({ title, value, total, icon, color }: StatCardProps) {
  const percentage = total ? Math.round((value / total) * 100) : 0;

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}.100`,
            mr: 2,
          }}
        >
          <Icon sx={{ color: `${color}.main` }}>{icon}</Icon>
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Box>
      {total && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              of {total} total
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {percentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={color as 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      )}
    </Paper>
  );
}

export default function Dashboard() {
  const { chapters, isLoadingFromSupabase } = useNABHStore();
  const stats = getOverallStats(chapters);

  if (isLoadingFromSupabase) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={40} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Loading NABH data from Supabase...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        NABH SHCO 3rd Edition Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Elements"
            value={stats.total}
            icon="list_alt"
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Completed"
            value={stats.completed}
            total={stats.total}
            icon="check_circle"
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            total={stats.total}
            icon="pending"
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Blocked"
            value={stats.blocked}
            total={stats.total}
            icon="block"
            color="error"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Element Categories (NABH SHCO 3rd Edition)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">CORE Requirements</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {stats.core}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.core / stats.total) * 100}
                  color="error"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Previous NC</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {stats.prevNC}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.prevNC / stats.total) * 100}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Commitment</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {stats.commitment}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.commitment / stats.total) * 100}
                  color="primary"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Achievement</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {stats.achievement}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.achievement / stats.total) * 100}
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Excellence</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {stats.excellence}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stats.excellence / stats.total) * 100}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Chapter Summary
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              {chapters.map((chapter) => {
                const completed = chapter.objectives.filter((o) => o.status === 'Completed').length;
                const total = chapter.objectives.length;
                const progress = total > 0 ? (completed / total) * 100 : 0;

                return (
                  <Box key={chapter.id} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">
                        {chapter.code} - {chapter.fullName}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {completed}/{total}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
