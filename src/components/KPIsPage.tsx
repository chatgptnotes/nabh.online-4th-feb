import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Icon from '@mui/material/Icon';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import { HOSPITAL_INFO, getHospitalInfo } from '../config/hospitalConfig';
import { NABH_KPIS, NABH_KPI_CATEGORIES, generateSampleKPIData } from '../data/kpiData';
import type { KPIDefinition } from '../data/kpiData';
import { extractFromDocument, extractKPIData, generateImprovedDocument } from '../services/documentExtractor';
import { generateAllKPIDataWithScenario } from '../services/kpiDataGenerator';
import { saveKPIGraph, loadAllKPIGraphs } from '../services/kpiStorage';
import type { KPIGraphRecord } from '../services/kpiStorage';
import { useNABHStore } from '../store/nabhStore';

interface KPIEntry {
  month: string;
  value: number;
  target: number;
  remarks?: string;
}

const UPLOAD_WORKFLOW_STEPS = ['Upload Document', 'Extract KPIs', 'Review & Edit', 'Generate Report'];

export default function KPIsPage() {
  const navigate = useNavigate();
  const { selectedHospital } = useNABHStore();
  const hospitalConfig = getHospitalInfo(selectedHospital);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'graphs'>('cards');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  // Graph generation states
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [savedGraphs, setSavedGraphs] = useState<Record<string, KPIGraphRecord>>({});
  const [isLoadingGraphs, setIsLoadingGraphs] = useState(false);

  // Upload workflow states
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadWorkflowStep, setUploadWorkflowStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [extractedKPIs, setExtractedKPIs] = useState<{ name: string; category: string; target: number; unit: string; formula: string }[]>([]);
  const [userSuggestions, setUserSuggestions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState('');
  const [activeUploadTab, setActiveUploadTab] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved graphs on mount
  useEffect(() => {
    loadSavedGraphs();
  }, []);

  const loadSavedGraphs = async () => {
    setIsLoadingGraphs(true);
    try {
      const result = await loadAllKPIGraphs();
      if (result.success && result.data) {
        setSavedGraphs(result.data);
      }
    } catch (error) {
      console.error('Error loading saved graphs:', error);
    } finally {
      setIsLoadingGraphs(false);
    }
  };

  // Generate all dummy data and save graphs
  const handleGenerateAllData = async () => {
    setIsGeneratingData(true);
    setGenerationProgress(0);

    try {
      // Step 1: Generate data for all KPIs
      setSnackbar({ open: true, message: 'Generating dummy data for all 16 KPIs...', severity: 'info' });
      const allData = generateAllKPIDataWithScenario('improving');

      // Save to localStorage
      Object.entries(allData).forEach(([kpiId, data]) => {
        localStorage.setItem(`kpi_data_${kpiId}`, JSON.stringify(data));
      });

      setGenerationProgress(30);

      // Step 2: Generate and save graphs for each KPI
      setSnackbar({ open: true, message: 'Saving graphs to Supabase...', severity: 'info' });

      for (let i = 0; i < NABH_KPIS.length; i++) {
        const kpi = NABH_KPIS[i];
        const data = allData[kpi.id];

        // Create a temporary canvas to draw the chart
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        if (ctx && data) {
          // Draw full chart
          drawFullChart(ctx, canvas.width, canvas.height, data, kpi);

          // Convert to data URL and save
          const dataUrl = canvas.toDataURL('image/png');
          await saveKPIGraph(
            kpi.id,
            kpi.number,
            kpi.name,
            dataUrl,
            data,
            'Auto-generated dummy data',
            'Improving trend scenario'
          );
        }

        setGenerationProgress(30 + Math.round(((i + 1) / NABH_KPIS.length) * 70));
      }

      // Reload saved graphs
      await loadSavedGraphs();

      setSnackbar({ open: true, message: 'All 16 KPIs generated and saved to Supabase!', severity: 'success' });
    } catch (error) {
      console.error('Error generating data:', error);
      setSnackbar({ open: true, message: 'Error generating data', severity: 'error' });
    } finally {
      setIsGeneratingData(false);
      setGenerationProgress(0);
    }
  };

  // Draw a full chart on a canvas context
  const drawFullChart = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    data: KPIEntry[],
    kpi: KPIDefinition
  ) => {
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Calculate bounds
    const values = data.map(d => d.value);
    const targets = data.map(d => d.target);
    const allValues = [...values, ...targets];
    const minValue = Math.min(...allValues) * 0.9;
    const maxValue = Math.max(...allValues) * 1.1;

    // Draw grid
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight * i / gridLines);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const value = maxValue - ((maxValue - minValue) * i / gridLines);
      ctx.fillStyle = '#64748B';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(value.toFixed(1), padding.left - 10, y + 4);
    }

    // Draw target line
    const targetY = padding.top + chartHeight - ((kpi.suggestedTarget - minValue) / (maxValue - minValue) * chartHeight);
    ctx.strokeStyle = '#D32F2F';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left, targetY);
    ctx.lineTo(width - padding.right, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#D32F2F';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Target: ${kpi.suggestedTarget}`, width - padding.right + 5, targetY + 4);

    // Draw line
    const pointWidth = chartWidth / (data.length - 1 || 1);
    ctx.strokeStyle = '#1565C0';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    data.forEach((d, i) => {
      const x = padding.left + (i * pointWidth);
      const y = padding.top + chartHeight - ((d.value - minValue) / (maxValue - minValue) * chartHeight);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw area
    ctx.fillStyle = 'rgba(21, 101, 192, 0.15)';
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding.left + (i * pointWidth);
      const y = padding.top + chartHeight - ((d.value - minValue) / (maxValue - minValue) * chartHeight);
      if (i === 0) {
        ctx.moveTo(x, height - padding.bottom);
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(padding.left + ((data.length - 1) * pointWidth), height - padding.bottom);
    ctx.closePath();
    ctx.fill();

    // Draw points
    data.forEach((d, i) => {
      const x = padding.left + (i * pointWidth);
      const y = padding.top + chartHeight - ((d.value - minValue) / (maxValue - minValue) * chartHeight);
      const isGood = kpi.targetDirection === 'lower' ? d.value <= d.target : d.value >= d.target;

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = isGood ? '#2E7D32' : '#D32F2F';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // X-axis labels
      ctx.fillStyle = '#64748B';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      const monthLabel = new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      ctx.fillText(monthLabel, x, height - padding.bottom + 20);
    });

    // Title
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`KPI ${kpi.number}: ${kpi.shortName} - Trend Analysis`, width / 2, 20);

    // Unit label
    ctx.fillStyle = '#64748B';
    ctx.font = '12px Inter, sans-serif';
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(kpi.unit, 0, 0);
    ctx.restore();
  };

  // Get latest values for each KPI
  const getLatestKPIValue = (kpiId: string): { value: number; target: number } | null => {
    const savedData = localStorage.getItem(`kpi_data_${kpiId}`);
    if (savedData) {
      const data: KPIEntry[] = JSON.parse(savedData);
      if (data.length > 0) {
        return data[data.length - 1];
      }
    }
    // Generate sample data if none exists
    const sampleData = generateSampleKPIData(kpiId, 12);
    if (sampleData.length > 0) {
      return sampleData[sampleData.length - 1];
    }
    return null;
  };

  const getPerformanceStatus = (kpi: KPIDefinition) => {
    const latest = getLatestKPIValue(kpi.id);
    if (!latest) return { status: 'no_data', color: 'default', label: 'No Data' };

    const isGood = kpi.targetDirection === 'lower' ? latest.value <= latest.target : latest.value >= latest.target;
    const threshold = kpi.targetDirection === 'lower' ? latest.target * 1.2 : latest.target * 0.8;
    const isNear = kpi.targetDirection === 'lower' ? latest.value <= threshold : latest.value >= threshold;

    if (isGood) return { status: 'good', color: 'success', label: 'On Target' };
    if (isNear) return { status: 'warning', color: 'warning', label: 'Near Target' };
    return { status: 'bad', color: 'error', label: 'Off Target' };
  };

  const filteredKPIs = selectedCategory === 'all'
    ? NABH_KPIS
    : NABH_KPIS.filter(k => k.category === selectedCategory);

  // Calculate stats
  const totalKPIs = NABH_KPIS.length;
  const kpisOnTarget = NABH_KPIS.filter(k => getPerformanceStatus(k).status === 'good').length;
  const kpisNearTarget = NABH_KPIS.filter(k => getPerformanceStatus(k).status === 'warning').length;
  const kpisOffTarget = NABH_KPIS.filter(k => getPerformanceStatus(k).status === 'bad').length;

  // Upload workflow handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUploadWorkflowStep(1);
      handleExtractFromFile(file);
    }
  };

  const handleExtractFromFile = async (file: File) => {
    setIsExtracting(true);
    try {
      const result = await extractFromDocument(file, 'kpi');
      if (result.success && result.text) {
        setExtractedText(result.text);

        const kpiData = await extractKPIData(result.text);
        setExtractedKPIs(kpiData.kpis || []);
        setUploadWorkflowStep(2);
        setSnackbar({ open: true, message: `Extracted ${kpiData.kpis?.length || 0} KPIs`, severity: 'success' });
      } else {
        setSnackbar({ open: true, message: result.error || 'Failed to extract text', severity: 'error' });
      }
    } catch (error) {
      console.error('Error extracting from file:', error);
      setSnackbar({ open: true, message: 'Error processing document', severity: 'error' });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateKPIReport = async () => {
    if (!extractedText) {
      setSnackbar({ open: true, message: 'No extracted text to generate from', severity: 'error' });
      return;
    }

    setIsGenerating(true);
    try {
      const report = await generateImprovedDocument(
        extractedText,
        'kpi',
        userSuggestions,
        hospitalConfig.name
      );
      setGeneratedReport(report);
      setUploadWorkflowStep(3);
      setSnackbar({ open: true, message: 'KPI Report generated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error generating report:', error);
      setSnackbar({ open: true, message: 'Error generating report', severity: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetUploadWorkflow = () => {
    setIsUploadDialogOpen(false);
    setUploadWorkflowStep(0);
    setUploadedFile(null);
    setExtractedText('');
    setExtractedKPIs([]);
    setUserSuggestions('');
    setGeneratedReport('');
    setActiveUploadTab(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadReport = () => {
    if (!generatedReport) return;

    const blob = new Blob([generatedReport], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'KPI_Report.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    if (!generatedReport) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatedReport);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateMasterReport = () => {
    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>NABH KPI Dashboard - ${hospitalConfig.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', serif; padding: 15mm; line-height: 1.5; }
          .header { text-align: center; border-bottom: 3px solid #1565C0; padding-bottom: 15px; margin-bottom: 20px; }
          .hospital-name { font-size: 24px; font-weight: bold; color: #1565C0; }
          .report-title { font-size: 18px; margin-top: 10px; background: #1565C0; color: white; padding: 10px; }
          .section { margin-bottom: 20px; page-break-inside: avoid; }
          .section-title { font-size: 14px; font-weight: bold; background: #f5f5f5; padding: 8px; margin-bottom: 10px; border-left: 4px solid #1565C0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background: #1565C0; color: white; }
          .status-good { background: #e8f5e9; color: #2E7D32; font-weight: bold; }
          .status-warning { background: #fff3e0; color: #ED6C02; font-weight: bold; }
          .status-bad { background: #ffebee; color: #D32F2F; font-weight: bold; }
          .stats-box { display: inline-block; width: 24%; text-align: center; padding: 15px; border: 1px solid #ddd; margin: 0.5%; }
          .stats-value { font-size: 28px; font-weight: bold; }
          .category-header { background: #f0f7ff; padding: 10px; margin: 15px 0 10px 0; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
          @media print { .page-break { page-break-before: always; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="hospital-name">${hospitalConfig.name}</div>
          <div style="font-size: 12px;">${hospitalConfig.address} | ${hospitalConfig.phone}</div>
          <div class="report-title">NABH KEY PERFORMANCE INDICATORS DASHBOARD</div>
          <div style="font-size: 12px; margin-top: 10px;">Report Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>

        <div class="section">
          <div class="section-title">Executive Summary</div>
          <div style="text-align: center; margin: 20px 0;">
            <div class="stats-box">
              <div class="stats-value" style="color: #1565C0;">${totalKPIs}</div>
              <div>Total KPIs</div>
            </div>
            <div class="stats-box">
              <div class="stats-value" style="color: #2E7D32;">${kpisOnTarget}</div>
              <div>On Target</div>
            </div>
            <div class="stats-box">
              <div class="stats-value" style="color: #ED6C02;">${kpisNearTarget}</div>
              <div>Near Target</div>
            </div>
            <div class="stats-box">
              <div class="stats-value" style="color: #D32F2F;">${kpisOffTarget}</div>
              <div>Off Target</div>
            </div>
          </div>
        </div>

        ${NABH_KPI_CATEGORIES.map(cat => {
          const categoryKPIs = NABH_KPIS.filter(k => k.category === cat.id);
          return `
            <div class="section">
              <div class="category-header">${cat.label} (${categoryKPIs.length} KPIs)</div>
              <table>
                <tr>
                  <th style="width: 5%">#</th>
                  <th style="width: 8%">Standard</th>
                  <th style="width: 30%">Indicator</th>
                  <th style="width: 15%">Formula</th>
                  <th style="width: 10%">Unit</th>
                  <th style="width: 8%">Target</th>
                  <th style="width: 10%">Current</th>
                  <th style="width: 14%">Status</th>
                </tr>
                ${categoryKPIs.map(kpi => {
                  const latest = getLatestKPIValue(kpi.id);
                  const status = getPerformanceStatus(kpi);
                  return `
                    <tr>
                      <td>${kpi.number}</td>
                      <td>${kpi.standard}</td>
                      <td><strong>${kpi.shortName}</strong></td>
                      <td style="font-size: 10px;">${kpi.formula}</td>
                      <td>${kpi.unit}</td>
                      <td>${kpi.suggestedTarget}</td>
                      <td>${latest ? latest.value.toFixed(2) : 'N/A'}</td>
                      <td class="status-${status.status === 'good' ? 'good' : status.status === 'warning' ? 'warning' : 'bad'}">${status.label}</td>
                    </tr>
                  `;
                }).join('')}
              </table>
            </div>
          `;
        }).join('')}

        <div class="section page-break">
          <div class="section-title">KPI Definitions Reference</div>
          ${NABH_KPIS.map(kpi => `
            <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; page-break-inside: avoid;">
              <div style="font-weight: bold; color: #1565C0;">KPI ${kpi.number}: ${kpi.name}</div>
              <div style="font-size: 11px; margin-top: 5px;"><strong>Definition:</strong> ${kpi.definition}</div>
              <div style="font-size: 11px;"><strong>Formula:</strong> ${kpi.formula}</div>
              <div style="font-size: 11px;"><strong>Frequency:</strong> ${kpi.frequency} | <strong>Sampling:</strong> ${kpi.sampling ? 'Yes (' + kpi.samplingMethodology + ')' : 'No'}</div>
            </div>
          `).join('')}
        </div>

        <div class="footer">
          <p>This report is generated as per NABH SHCO Standards 3rd Edition, August 2022</p>
          <p>${hospitalConfig.name} | Quality Management System | Controlled Document</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NABH_KPI_Dashboard_${HOSPITAL_INFO.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: 'Master KPI report downloaded successfully', severity: 'success' });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary">
            NABH Key Performance Indicators
          </Typography>
          <Typography variant="body2" color="text.secondary">
            16 Official KPIs as per NABH SHCO Standards 3rd Edition (August 2022)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Cards View">
            <IconButton
              onClick={() => setViewMode('cards')}
              color={viewMode === 'cards' ? 'primary' : 'default'}
            >
              <Icon>grid_view</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Table View">
            <IconButton
              onClick={() => setViewMode('table')}
              color={viewMode === 'table' ? 'primary' : 'default'}
            >
              <Icon>table_rows</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Graphs Gallery">
            <IconButton
              onClick={() => setViewMode('graphs')}
              color={viewMode === 'graphs' ? 'primary' : 'default'}
            >
              <Icon>bar_chart</Icon>
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={isGeneratingData ? <CircularProgress size={20} /> : <Icon>auto_fix_high</Icon>}
            onClick={handleGenerateAllData}
            disabled={isGeneratingData}
            color="secondary"
          >
            {isGeneratingData ? `Generating (${generationProgress}%)` : 'Generate All Data'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Icon>upload_file</Icon>}
            onClick={() => setIsUploadDialogOpen(true)}
          >
            Upload Doc
          </Button>
          <Button
            variant="contained"
            startIcon={<Icon>download</Icon>}
            onClick={generateMasterReport}
          >
            Report
          </Button>
        </Box>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.xls"
          onChange={handleFileUpload}
        />
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
            <Typography variant="h4" color="primary" fontWeight={700}>{totalKPIs}</Typography>
            <Typography variant="body2" color="text.secondary">Total KPIs</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
            <Typography variant="h4" color="success.main" fontWeight={700}>{kpisOnTarget}</Typography>
            <Typography variant="body2" color="text.secondary">On Target</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
            <Typography variant="h4" color="warning.main" fontWeight={700}>{kpisNearTarget}</Typography>
            <Typography variant="body2" color="text.secondary">Near Target</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50' }}>
            <Typography variant="h4" color="error.main" fontWeight={700}>{kpisOffTarget}</Typography>
            <Typography variant="body2" color="text.secondary">Off Target</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Category Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedCategory}
          onChange={(_, value) => setSelectedCategory(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab value="all" label="All KPIs (16)" icon={<Icon>dashboard</Icon>} iconPosition="start" />
          {NABH_KPI_CATEGORIES.map(cat => (
            <Tab
              key={cat.id}
              value={cat.id}
              label={`${cat.label} (${NABH_KPIS.filter(k => k.category === cat.id).length})`}
              icon={<Icon>{cat.icon}</Icon>}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* KPIs Display */}
      {viewMode === 'cards' ? (
        <Grid container spacing={2}>
          {filteredKPIs.map(kpi => {
            const latest = getLatestKPIValue(kpi.id);
            const status = getPerformanceStatus(kpi);
            const category = NABH_KPI_CATEGORIES.find(c => c.id === kpi.category);

            return (
              <Grid key={kpi.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardActionArea onClick={() => navigate(`/kpi/${kpi.id}`)} sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={`KPI ${kpi.number}`}
                          size="small"
                          sx={{ bgcolor: category?.color, color: 'white', fontWeight: 600 }}
                        />
                        <Chip label={kpi.standard} size="small" variant="outlined" />
                      </Box>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, minHeight: 48 }}>
                        {kpi.shortName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Icon sx={{ color: category?.color }}>{kpi.icon}</Icon>
                        <Typography variant="h5" fontWeight={700}>
                          {latest ? latest.value.toFixed(1) : 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{kpi.unit}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Target: {kpi.suggestedTarget}
                        </Typography>
                        <Chip
                          label={status.label}
                          size="small"
                          color={status.color as any}
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, latest ? (kpi.targetDirection === 'lower'
                          ? Math.max(0, 100 - ((latest.value - kpi.suggestedTarget) / kpi.suggestedTarget * 100))
                          : (latest.value / kpi.suggestedTarget * 100)) : 0)}
                        color={status.color as any}
                        sx={{ mt: 1, height: 6, borderRadius: 1 }}
                      />
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : viewMode === 'table' ? (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Standard</TableCell>
                  <TableCell>Indicator</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell align="center">Target</TableCell>
                  <TableCell align="center">Current</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredKPIs.map(kpi => {
                  const latest = getLatestKPIValue(kpi.id);
                  const status = getPerformanceStatus(kpi);
                  const category = NABH_KPI_CATEGORIES.find(c => c.id === kpi.category);

                  return (
                    <TableRow key={kpi.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/kpi/${kpi.id}`)}>
                      <TableCell>
                        <Chip
                          label={kpi.number}
                          size="small"
                          sx={{ bgcolor: category?.color, color: 'white', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>{kpi.standard}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Icon sx={{ color: category?.color, fontSize: 20 }}>{kpi.icon}</Icon>
                          <Box>
                            <Typography fontWeight={600}>{kpi.shortName}</Typography>
                            <Typography variant="caption" color="text.secondary">{kpi.name}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{kpi.unit}</TableCell>
                      <TableCell align="center">
                        <Typography fontWeight={600}>{kpi.suggestedTarget}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight={600} color={`${status.color}.main`}>
                          {latest ? latest.value.toFixed(2) : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={status.label} size="small" color={status.color as any} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Icon>chevron_right</Icon>
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        /* Graphs Gallery View */
        <Box>
          {isLoadingGraphs ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={48} />
              <Typography sx={{ mt: 2 }}>Loading saved graphs...</Typography>
            </Box>
          ) : Object.keys(savedGraphs).length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Icon sx={{ fontSize: 64, color: 'text.secondary' }}>image_not_supported</Icon>
              <Typography variant="h6" sx={{ mt: 2 }}>No Saved Graphs Yet</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Click "Generate All Data" to create dummy data and save graphs for all 16 KPIs
              </Typography>
              <Button
                variant="contained"
                startIcon={<Icon>auto_fix_high</Icon>}
                onClick={handleGenerateAllData}
                disabled={isGeneratingData}
                color="secondary"
              >
                Generate All Data
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredKPIs.map(kpi => {
                const graph = savedGraphs[kpi.id];
                const category = NABH_KPI_CATEGORIES.find(c => c.id === kpi.category);
                const latest = getLatestKPIValue(kpi.id);
                const status = getPerformanceStatus(kpi);

                return (
                  <Grid key={kpi.id} size={{ xs: 12, md: 6, lg: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                      }}
                      onClick={() => navigate(`/kpi/${kpi.id}`)}
                    >
                      <CardContent sx={{ pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip
                            label={`KPI ${kpi.number}`}
                            size="small"
                            sx={{ bgcolor: category?.color, color: 'white', fontWeight: 600 }}
                          />
                          <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1 }} noWrap>
                            {kpi.shortName}
                          </Typography>
                          <Chip label={status.label} size="small" color={status.color as any} />
                        </Box>
                      </CardContent>

                      {/* Graph Image */}
                      {graph?.graph_url ? (
                        <Box
                          component="img"
                          src={graph.graph_url}
                          alt={`${kpi.shortName} Graph`}
                          sx={{
                            width: '100%',
                            height: 200,
                            objectFit: 'contain',
                            bgcolor: '#fafafa',
                            borderTop: '1px solid',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                          }}
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: 200,
                            bgcolor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderTop: '1px solid',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Box sx={{ textAlign: 'center' }}>
                            <Icon sx={{ fontSize: 40, color: 'text.secondary' }}>show_chart</Icon>
                            <Typography variant="caption" color="text.secondary" display="block">
                              No graph saved
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      <CardContent sx={{ pt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Current</Typography>
                            <Typography fontWeight={700} color={`${status.color}.main`}>
                              {latest ? latest.value.toFixed(2) : 'N/A'} {kpi.unit}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">Target</Typography>
                            <Typography fontWeight={600}>{kpi.suggestedTarget} {kpi.unit}</Typography>
                          </Box>
                        </Box>
                        {graph?.created_at && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Saved: {new Date(graph.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* Upload KPI Document Dialog */}
      <Dialog
        open={isUploadDialogOpen}
        onClose={resetUploadWorkflow}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { minHeight: '70vh' } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon color="primary">upload_file</Icon>
            Upload & Extract KPI Data
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Stepper */}
          <Stepper activeStep={uploadWorkflowStep} sx={{ mb: 3, pt: 2 }}>
            {UPLOAD_WORKFLOW_STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 0: Upload Document */}
          {uploadWorkflowStep === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 6,
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.100' }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon sx={{ fontSize: 64, color: 'primary.main' }}>cloud_upload</Icon>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Click to Upload KPI Document
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports PDF, Word, Excel, and Images
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Step 1: Extracting */}
          {uploadWorkflowStep === 1 && isExtracting && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Extracting KPIs from {uploadedFile?.name}
              </Typography>
              <LinearProgress sx={{ mt: 3, maxWidth: 400, mx: 'auto' }} />
            </Box>
          )}

          {/* Step 2: Review */}
          {uploadWorkflowStep === 2 && (
            <Box>
              <Tabs value={activeUploadTab} onChange={(_, v) => setActiveUploadTab(v)} sx={{ mb: 2 }}>
                <Tab label={`Extracted KPIs (${extractedKPIs.length})`} icon={<Icon>analytics</Icon>} iconPosition="start" />
                <Tab label="Raw Text" icon={<Icon>text_snippet</Icon>} iconPosition="start" />
              </Tabs>

              {activeUploadTab === 0 && (
                <Box>
                  {extractedKPIs.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 350 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>KPI Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Target</TableCell>
                            <TableCell>Unit</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {extractedKPIs.map((kpi, i) => (
                            <TableRow key={i}>
                              <TableCell>{kpi.name}</TableCell>
                              <TableCell>{kpi.category}</TableCell>
                              <TableCell align="right">{kpi.target}</TableCell>
                              <TableCell>{kpi.unit}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                      <Icon sx={{ fontSize: 48, color: 'text.secondary' }}>search_off</Icon>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        No KPIs could be extracted.
                      </Typography>
                    </Paper>
                  )}

                  <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'warning.50' }}>
                    <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                      <Icon sx={{ verticalAlign: 'middle', mr: 1 }}>lightbulb</Icon>
                      Improvement Suggestions
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Add specific improvements..."
                      value={userSuggestions}
                      onChange={(e) => setUserSuggestions(e.target.value)}
                    />
                  </Paper>
                </Box>
              )}

              {activeUploadTab === 1 && (
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {extractedText}
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* Step 3: Generated Report */}
          {uploadWorkflowStep === 3 && generatedReport && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
                <Button size="small" startIcon={<Icon>print</Icon>} onClick={handlePrintReport}>
                  Print
                </Button>
                <Button size="small" startIcon={<Icon>download</Icon>} onClick={handleDownloadReport}>
                  Download HTML
                </Button>
              </Box>
              <Paper variant="outlined" sx={{ maxHeight: 500, overflow: 'auto', bgcolor: 'white' }}>
                <div dangerouslySetInnerHTML={{ __html: generatedReport }} />
              </Paper>
            </Box>
          )}

          {/* Generating indicator */}
          {isGenerating && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>Generating KPI Report</Typography>
              <LinearProgress sx={{ mt: 3, maxWidth: 400, mx: 'auto' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={resetUploadWorkflow}>Cancel</Button>
          {uploadWorkflowStep === 2 && (
            <Button
              variant="contained"
              startIcon={<Icon>auto_awesome</Icon>}
              onClick={handleGenerateKPIReport}
              disabled={isGenerating}
            >
              Generate Report
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
