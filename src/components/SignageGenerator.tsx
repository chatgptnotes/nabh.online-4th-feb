import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Paper,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Create,
  Print,
  Download,
  Refresh,
  Block,
  Warning,
  CheckCircle,
  LocalFireDepartment,
  Info,
  Security,
} from '@mui/icons-material';
import {
  signageTemplates,
  generateSignageImage,
  generateSignageSVG,
  generateCustomSignagePrompt,
  getTemplatesByCategory,
  type SignCategory,
  type SignageTemplate,
} from '../services/signageImageService';

// Category icons and colors
const categoryConfig: Record<SignCategory, { icon: React.ReactElement; color: string; label: string }> = {
  prohibition: { icon: <Block />, color: '#D32F2F', label: 'Prohibition (Red)' },
  warning: { icon: <Warning />, color: '#FFC107', label: 'Warning (Yellow)' },
  mandatory: { icon: <Security />, color: '#1976D2', label: 'Mandatory (Blue)' },
  safety: { icon: <CheckCircle />, color: '#388E3C', label: 'Safety (Green)' },
  fire: { icon: <LocalFireDepartment />, color: '#D32F2F', label: 'Fire Safety (Red)' },
  information: { icon: <Info />, color: '#0288D1', label: 'Information (Blue)' },
};

export default function SignageGenerator() {
  const [selectedCategory, setSelectedCategory] = useState<SignCategory>('prohibition');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customText, setCustomText] = useState('');
  const [customHindiText, setCustomHindiText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationType, setGenerationType] = useState<'image' | 'svg'>('image');
  const [signSize, setSignSize] = useState<'A5' | 'A4' | 'A3'>('A4');

  const templatesByCategory = getTemplatesByCategory();

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setCustomText('');
    setCustomHindiText('');
    setGeneratedImage(null);
    setError('');
  };

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError('');
    setGeneratedImage(null);

    try {
      let result: string;

      if (selectedTemplate) {
        // Always use SVG for templates (more reliable)
        if (generationType === 'svg') {
          console.log('Generating SVG for template:', selectedTemplate);
          result = await generateSignageSVG(selectedTemplate);
        } else {
          // Try image generation first
          try {
            console.log('Trying image generation for:', selectedTemplate);
            result = await generateSignageImage(selectedTemplate);
          } catch (imgErr) {
            console.log('Image generation failed, falling back to SVG');
            // Fallback to SVG
            result = await generateSignageSVG(selectedTemplate);
            setGenerationType('svg');
          }
        }
      } else if (customText.trim()) {
        // For custom text, use SVG generation with custom prompt
        const customPrompt = generateCustomSignagePrompt(
          customText,
          selectedCategory,
          customHindiText || undefined
        );
        // For custom, try image first then SVG
        if (generationType === 'image') {
          try {
            result = await generateSignageImage('', customPrompt);
          } catch {
            // Fallback: generate a simple SVG for custom text
            result = generateSimpleCustomSVG(customText, customHindiText, selectedCategory);
            setGenerationType('svg');
          }
        } else {
          result = generateSimpleCustomSVG(customText, customHindiText, selectedCategory);
        }
      } else {
        throw new Error('Please select a template or enter custom text');
      }

      setGeneratedImage(result);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate signage. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedTemplate, customText, customHindiText, selectedCategory, generationType]);

  // Simple SVG generator for custom text
  const generateSimpleCustomSVG = (english: string, hindi: string | undefined, category: SignCategory): string => {
    const colors: Record<SignCategory, { bg: string; text: string }> = {
      prohibition: { bg: '#D32F2F', text: '#FFFFFF' },
      warning: { bg: '#FFC107', text: '#000000' },
      mandatory: { bg: '#1976D2', text: '#FFFFFF' },
      safety: { bg: '#388E3C', text: '#FFFFFF' },
      fire: { bg: '#D32F2F', text: '#FFFFFF' },
      information: { bg: '#1976D2', text: '#FFFFFF' },
    };
    const { bg, text } = colors[category];

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">
      <rect width="400" height="500" fill="white"/>
      <rect x="10" y="10" width="380" height="100" rx="8" fill="${bg}"/>
      <text x="200" y="70" text-anchor="middle" fill="${text}" font-family="Arial, sans-serif" font-size="24" font-weight="bold">HOSPITAL SIGNAGE</text>
      <rect x="40" y="150" width="320" height="200" rx="10" fill="${bg}" opacity="0.1" stroke="${bg}" stroke-width="3"/>
      <text x="200" y="240" text-anchor="middle" fill="#333" font-family="Arial, sans-serif" font-size="28" font-weight="bold">${english.toUpperCase()}</text>
      <text x="200" y="290" text-anchor="middle" fill="#666" font-family="Arial, sans-serif" font-size="22">${hindi || ''}</text>
      <text x="200" y="450" text-anchor="middle" fill="#999" font-family="Arial, sans-serif" font-size="14">Hospital Safety Signage</text>
      <text x="200" y="475" text-anchor="middle" fill="#999" font-family="Arial, sans-serif" font-size="12">ISO Compliant</text>
    </svg>`;
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');

    if (generatedImage.startsWith('data:image/')) {
      // Download as image
      link.href = generatedImage;
      link.download = `hospital-signage-${selectedTemplate || 'custom'}-${Date.now()}.png`;
    } else if (generatedImage.startsWith('<svg')) {
      // Download as SVG
      const blob = new Blob([generatedImage], { type: 'image/svg+xml' });
      link.href = URL.createObjectURL(blob);
      link.download = `hospital-signage-${selectedTemplate || 'custom'}-${Date.now()}.svg`;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !generatedImage) return;

    const template = selectedTemplate ? signageTemplates[selectedTemplate] : null;
    const title = template?.labelEnglish || customText || 'Hospital Signage';

    let imageContent: string;
    if (generatedImage.startsWith('data:image/')) {
      imageContent = `<img src="${generatedImage}" style="max-width: 100%; height: auto;" />`;
    } else {
      imageContent = generatedImage;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Hospital Signage</title>
          <style>
            @page { size: ${signSize}; margin: 10mm; }
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .signage-container {
              max-width: 100%;
              text-align: center;
            }
            img, svg {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="signage-container">
            ${imageContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const renderTemplateChips = (templates: SignageTemplate[]) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {templates.map((template) => (
        <Tooltip
          key={template.id}
          title={`${template.labelHindi}${template.isoCode ? ` (ISO ${template.isoCode})` : ''}`}
        >
          <Chip
            label={template.labelEnglish}
            onClick={() => handleTemplateSelect(template.id)}
            color={selectedTemplate === template.id ? 'primary' : 'default'}
            variant={selectedTemplate === template.id ? 'filled' : 'outlined'}
            sx={{
              cursor: 'pointer',
              borderColor: categoryConfig[template.category].color,
              '&:hover': {
                backgroundColor: `${categoryConfig[template.category].color}20`,
              },
            }}
          />
        </Tooltip>
      ))}
    </Box>
  );

  const renderPreview = () => {
    if (!generatedImage) return null;

    const isSVG = generatedImage.startsWith('<svg');
    const sizeStyles = {
      A5: { maxWidth: 420, maxHeight: 595 },
      A4: { maxWidth: 595, maxHeight: 842 },
      A3: { maxWidth: 842, maxHeight: 1191 },
    };

    return (
      <Paper
        elevation={3}
        sx={{
          p: 2,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
          ...sizeStyles[signSize],
          mx: 'auto',
        }}
      >
        {isSVG ? (
          <Box
            dangerouslySetInnerHTML={{ __html: generatedImage }}
            sx={{
              '& svg': {
                maxWidth: '100%',
                height: 'auto',
              },
            }}
          />
        ) : (
          <img
            src={generatedImage}
            alt="Generated Signage"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        )}
      </Paper>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Hospital Signage Generator
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Create ISO-compliant bilingual hospital signs with AI (Gemini)
          </Typography>
        </Box>
        <Chip label="Nano Banana Pro" color="primary" size="small" />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Panel - Controls */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              {/* Category Tabs */}
              <Typography variant="subtitle2" gutterBottom>
                Select Category:
              </Typography>
              <Tabs
                value={selectedCategory}
                onChange={(_, newValue) => {
                  setSelectedCategory(newValue);
                  setSelectedTemplate('');
                }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 2 }}
              >
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <Tab
                    key={key}
                    value={key}
                    icon={config.icon}
                    label={config.label}
                    sx={{
                      minHeight: 64,
                      '&.Mui-selected': {
                        color: config.color,
                      },
                    }}
                  />
                ))}
              </Tabs>

              {/* Template Selection */}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Quick Templates - {categoryConfig[selectedCategory].label}:
              </Typography>
              <Box sx={{ mb: 3 }}>
                {renderTemplateChips(templatesByCategory[selectedCategory])}
              </Box>

              {/* Selected Template Info */}
              {selectedTemplate && signageTemplates[selectedTemplate] && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>{signageTemplates[selectedTemplate].labelEnglish}</strong>
                    <br />
                    {signageTemplates[selectedTemplate].labelHindi}
                    {signageTemplates[selectedTemplate].isoCode && (
                      <Chip
                        label={`ISO ${signageTemplates[selectedTemplate].isoCode}`}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                </Alert>
              )}

              {/* Custom Text Input */}
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Or Enter Custom Text:
              </Typography>
              <TextField
                fullWidth
                label="English Text"
                value={customText}
                onChange={(e) => {
                  setCustomText(e.target.value);
                  setSelectedTemplate('');
                }}
                placeholder="e.g., Staff Only, MRI Room, Pharmacy"
                sx={{ mb: 2 }}
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Hindi Text (optional - will auto-translate if empty)"
                value={customHindiText}
                onChange={(e) => setCustomHindiText(e.target.value)}
                placeholder="e.g., केवल कर्मचारी, एमआरआई कक्ष"
                sx={{ mb: 2 }}
                disabled={loading}
              />

              {/* Options */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Output Type</InputLabel>
                  <Select
                    value={generationType}
                    onChange={(e) => setGenerationType(e.target.value as 'image' | 'svg')}
                    label="Output Type"
                    disabled={loading}
                  >
                    <MenuItem value="image">AI Image (Nano Banana Pro)</MenuItem>
                    <MenuItem value="svg">SVG Vector (Gemini 1.5)</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Print Size</InputLabel>
                  <Select
                    value={signSize}
                    onChange={(e) => setSignSize(e.target.value as 'A5' | 'A4' | 'A3')}
                    label="Print Size"
                    disabled={loading}
                  >
                    <MenuItem value="A5">A5 (Small)</MenuItem>
                    <MenuItem value="A4">A4 (Standard)</MenuItem>
                    <MenuItem value="A3">A3 (Large)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Generate Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleGenerate}
                disabled={loading || (!selectedTemplate && !customText.trim())}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Create />}
                sx={{
                  py: 1.5,
                  backgroundColor: categoryConfig[selectedCategory].color,
                  '&:hover': {
                    backgroundColor: categoryConfig[selectedCategory].color,
                    filter: 'brightness(0.9)',
                  },
                }}
              >
                {loading ? 'Generating Signage...' : 'Generate Signage'}
              </Button>

              {loading && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  AI is creating your hospital signage... This may take 10-30 seconds.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Preview */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ minHeight: 500 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Signage Preview
                </Typography>
                {generatedImage && (
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Regenerate">
                      <IconButton onClick={handleGenerate} disabled={loading}>
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={handleDownload}
                      size="small"
                    >
                      Download
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Print />}
                      onClick={handlePrint}
                      size="small"
                      color="secondary"
                    >
                      Print
                    </Button>
                  </Stack>
                )}
              </Box>

              {/* Preview Area */}
              {generatedImage ? (
                renderPreview()
              ) : (
                <Paper
                  sx={{
                    p: 4,
                    minHeight: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#fafafa',
                    border: '2px dashed #ddd',
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Select a template or enter custom text
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Your AI-generated hospital signage will appear here.
                    <br />
                    Signs will include proper ISO symbols and bilingual text.
                  </Typography>
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <Tooltip key={key} title={config.label}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: key === 'warning' ? 0 : key === 'prohibition' || key === 'mandatory' ? '50%' : 1,
                            backgroundColor: config.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: key === 'warning' ? 'black' : 'white',
                            transform: key === 'warning' ? 'rotate(45deg)' : 'none',
                          }}
                        >
                          <Box sx={{ transform: key === 'warning' ? 'rotate(-45deg)' : 'none' }}>
                            {config.icon}
                          </Box>
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Info about the sign types */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>ISO 7010 Color Codes:</strong> Red = Prohibition/Fire | Yellow = Warning | Blue = Mandatory/Info | Green = Safety/Emergency
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
