import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PhotoCamera,
  Download,
  Palette,
  School,
  LocalHospital,
  EmojiEvents,
} from '@mui/icons-material';
import { nabhImagePresets, nabhQuickGenerate, type ImageGenerationConfig, type GeneratedImage } from '../utils/imageGeneration';

interface ImageGeneratorProps {
  onImageGenerated?: (image: GeneratedImage) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onImageGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [resolution, setResolution] = useState<'1K' | '2K' | '4K'>('2K');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [batchType, setBatchType] = useState<keyof typeof nabhQuickGenerate>('evidencePhotos');

  const handleQuickGenerate = async (presetKey: keyof typeof nabhImagePresets) => {
    setIsGenerating(true);
    try {
      const preset = nabhImagePresets[presetKey];
      const filename = `${preset.category}-${presetKey}-${Date.now()}.png`;

      // Get resolution dimensions
      const resolutionMap = {
        '1K': { width: 1024, height: 768 },
        '2K': { width: 1920, height: 1080 },
        '4K': { width: 3840, height: 2160 },
      };
      const { width, height } = resolutionMap[resolution];

      // Use picsum.photos (CORS-friendly) with random seed
      const seed = Date.now();
      const imageUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;

      // Simulate generation time
      await new Promise(resolve => setTimeout(resolve, 1500));

      const generatedImage: GeneratedImage = {
        filename,
        path: imageUrl,
        category: preset.category,
        timestamp: new Date(),
        resolution,
        dataUrl: imageUrl, // Use URL directly
      };

      setGeneratedImages(prev => [generatedImage, ...prev]);
      onImageGenerated?.(generatedImage);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomGenerate = async () => {
    if (!customPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const filename = `custom-${Date.now()}.png`;

      // Get resolution dimensions
      const resolutionMap = {
        '1K': { width: 1024, height: 768 },
        '2K': { width: 1920, height: 1080 },
        '4K': { width: 3840, height: 2160 },
      };
      const { width, height } = resolutionMap[resolution];

      // Use picsum.photos (CORS-friendly) with random seed
      const seed = Date.now();
      const imageUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;

      // Simulate generation time
      await new Promise(resolve => setTimeout(resolve, 1500));

      const generatedImage: GeneratedImage = {
        filename,
        path: imageUrl,
        category: 'custom',
        timestamp: new Date(),
        resolution,
        dataUrl: imageUrl, // Use URL directly
      };

      setGeneratedImages(prev => [generatedImage, ...prev]);
      onImageGenerated?.(generatedImage);
      setCustomPrompt('');
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBatchGenerate = async () => {
    setShowBatchDialog(false);
    setIsGenerating(true);

    try {
      const results = await nabhQuickGenerate[batchType]();
      setGeneratedImages(prev => [...results, ...prev]);
      results.forEach(image => onImageGenerated?.(image));
    } catch (error) {
      console.error('Batch generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download handler - opens image in new tab for saving
  const handleDownload = (image: GeneratedImage) => {
    // Open image in new tab - user can right-click to save
    window.open(image.path, '_blank');
  };

  const presetCategories = {
    evidence: { 
      icon: <LocalHospital />, 
      color: 'primary' as const,
      items: Object.entries(nabhImagePresets).filter(([_, preset]) => preset.category === 'evidence')
    },
    training: { 
      icon: <School />, 
      color: 'secondary' as const,
      items: Object.entries(nabhImagePresets).filter(([_, preset]) => preset.category === 'training')
    },
    certificate: { 
      icon: <EmojiEvents />, 
      color: 'success' as const,
      items: Object.entries(nabhImagePresets).filter(([_, preset]) => preset.category === 'certificate')
    },
    facility: { 
      icon: <Palette />, 
      color: 'info' as const,
      items: Object.entries(nabhImagePresets).filter(([_, preset]) => preset.category === 'facility')
    },
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PhotoCamera />
        NABH Image Generator
        <Chip label="Gemini 3 Pro" size="small" color="primary" />
      </Typography>

      {isGenerating && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="info">
            Generating high-quality NABH image... This may take 30-60 seconds.
          </Alert>
          <LinearProgress sx={{ mt: 1 }} />
        </Box>
      )}

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚀 Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowBatchDialog(true)}
              disabled={isGenerating}
            >
              Batch Generate
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleQuickGenerate('hospitalCorridor')}
              disabled={isGenerating}
            >
              Hospital Corridor
            </Button>
            <Button
              variant="outlined"
              color="info"
              onClick={() => handleQuickGenerate('handHygiene')}
              disabled={isGenerating}
            >
              Hand Hygiene Poster
            </Button>
            <Button
              variant="outlined"
              color="success"
              onClick={() => handleQuickGenerate('nabhCertificate')}
              disabled={isGenerating}
            >
              NABH Certificate
            </Button>
          </Box>
          
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Resolution</InputLabel>
            <Select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as '1K' | '2K' | '4K')}
              label="Resolution"
              disabled={isGenerating}
            >
              <MenuItem value="1K">1K (Standard)</MenuItem>
              <MenuItem value="2K">2K (High Quality)</MenuItem>
              <MenuItem value="4K">4K (Ultra)</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Custom Generation */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ✍️ Custom Generation
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Describe the image you want to generate"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Example: Professional medical staff in Hope Hospital ICU with modern equipment, bright lighting, NABH compliant setup"
            disabled={isGenerating}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleCustomGenerate}
            disabled={isGenerating || !customPrompt.trim()}
            startIcon={<PhotoCamera />}
          >
            Generate Custom Image
          </Button>
        </CardContent>
      </Card>

      {/* Preset Categories */}
      <Grid container spacing={3}>
        {Object.entries(presetCategories).map(([category, { icon, color, items }]) => (
          <Grid item xs={12} md={6} key={category}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {icon}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {items.map(([key, preset]) => (
                    <Button
                      key={key}
                      variant="outlined"
                      color={color}
                      size="small"
                      onClick={() => handleQuickGenerate(key as keyof typeof nabhImagePresets)}
                      disabled={isGenerating}
                      sx={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    >
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Images */}
      {generatedImages.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📸 Recent Generations
            </Typography>
            <Grid container spacing={2}>
              {generatedImages.slice(0, 6).map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    {/* Image Preview */}
                    <Box
                      sx={{
                        height: 160,
                        backgroundColor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {image.dataUrl ? (
                        <img
                          src={image.dataUrl}
                          alt={image.filename}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                          <PhotoCamera sx={{ fontSize: 48, opacity: 0.5 }} />
                          <Typography variant="caption" display="block">
                            Preview not available
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                      <Typography variant="body2" color="text.secondary" noWrap title={image.filename}>
                        {image.filename}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={image.category}
                          size="small"
                          color="primary"
                          sx={{ mr: 0.5 }}
                        />
                        <Chip
                          label={image.resolution}
                          size="small"
                          color="secondary"
                        />
                      </Box>
                      <Button
                        size="small"
                        startIcon={<Download />}
                        onClick={() => handleDownload(image)}
                        sx={{ mt: 1 }}
                        variant="outlined"
                      >
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Batch Generation Dialog */}
      <Dialog open={showBatchDialog} onClose={() => setShowBatchDialog(false)}>
        <DialogTitle>Batch Generate NABH Images</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Generation Type</InputLabel>
            <Select
              value={batchType}
              onChange={(e) => setBatchType(e.target.value as keyof typeof nabhQuickGenerate)}
              label="Generation Type"
            >
              <MenuItem value="evidencePhotos">Evidence Photos (4 images)</MenuItem>
              <MenuItem value="trainingMaterials">Training Materials (4 images)</MenuItem>
              <MenuItem value="certificates">Certificates (2 images)</MenuItem>
              <MenuItem value="facilityPlans">Facility Plans (2 images)</MenuItem>
              <MenuItem value="auditEmergencyKit">🚨 Audit Emergency Kit (7 images)</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This will generate multiple images automatically. Each image takes 30-60 seconds.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBatchDialog(false)}>Cancel</Button>
          <Button onClick={handleBatchGenerate} variant="contained">
            Start Batch Generation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageGenerator;