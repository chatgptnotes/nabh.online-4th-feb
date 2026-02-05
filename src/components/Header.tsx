import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import { useNABHStore } from '../store/nabhStore';
import { HOSPITALS, getHospitalInfo } from '../config/hospitalConfig';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedChapter, selectedHospital, setSelectedHospital } = useNABHStore();
  const isGeneratorPage = location.pathname === '/ai-generator';
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleHomeClick = () => {
    setSelectedChapter(null);
    navigate('/');
  };

  const handleGeneratorClick = () => {
    navigate('/ai-generator');
  };

  const handleSearchClick = () => {
    navigate('/search');
  };

  const handleHospitalMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleHospitalMenuClose = () => {
    setAnchorEl(null);
  };

  const handleHospitalSelect = (hospitalId: string) => {
    setSelectedHospital(hospitalId);
    handleHospitalMenuClose();
  };

  const currentHospital = getHospitalInfo(selectedHospital);

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <Icon>menu</Icon>
        </IconButton>
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={handleHomeClick}
        >
          <Icon sx={{ mr: 2 }}>local_hospital</Icon>
          <Typography variant="h6" noWrap component="div">
            NABH Evidences
          </Typography>
        </Box>
        
        {/* Hospital Switcher */}
        <Box sx={{ ml: 4, display: 'flex', alignItems: 'center' }}>
          <Button
            color="inherit"
            onClick={handleHospitalMenuOpen}
            endIcon={<Icon>arrow_drop_down</Icon>}
            sx={{
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              px: 2
            }}
          >
            {currentHospital.name}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleHospitalMenuClose}
            PaperProps={{
              elevation: 4,
              sx: { mt: 1.5, minWidth: 200 }
            }}
          >
            {Object.values(HOSPITALS).map((hospital) => (
              <MenuItem
                key={hospital.id}
                selected={selectedHospital === hospital.id}
                onClick={() => handleHospitalSelect(hospital.id)}
              >
                <Icon sx={{ mr: 1, fontSize: 20, color: selectedHospital === hospital.id ? 'primary.main' : 'text.secondary' }}>
                  {selectedHospital === hospital.id ? 'check_circle' : 'radio_button_unchecked'}
                </Icon>
                {hospital.name}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Prominent Search Button */}
          <Tooltip title="Global Search - Find anything across the NABH system">
            <Button
              color="inherit"
              startIcon={<Icon sx={{ fontSize: 24 }}>search</Icon>}
              onClick={handleSearchClick}
              variant="outlined"
              sx={{
                bgcolor: location.pathname === '/search' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1rem',
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.25)',
                  border: '2px solid rgba(255,255,255,0.5)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
                boxShadow: location.pathname === '/search' ? '0 0 10px rgba(255,255,255,0.3)' : 'none'
              }}
            >
              SEARCH
            </Button>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: 1 }} />
          <Tooltip title="Dashboard">
            <Button
              color="inherit"
              startIcon={<Icon>dashboard</Icon>}
              onClick={handleHomeClick}
              sx={{
                bgcolor: !isGeneratorPage && location.pathname !== '/search' ? 'rgba(255,255,255,0.15)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              }}
            >
              Dashboard
            </Button>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: 1 }} />
          <Tooltip title="Quality Documentation Assistant">
            <Button
              color="inherit"
              startIcon={<Icon>auto_awesome</Icon>}
              onClick={handleGeneratorClick}
              sx={{
                bgcolor: isGeneratorPage ? 'rgba(255,255,255,0.15)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              }}
            >
              Documents
            </Button>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: 1 }} />
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            SHCO 3rd Edition
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
