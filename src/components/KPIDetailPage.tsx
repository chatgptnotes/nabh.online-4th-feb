import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { NABH_KPIS, NABH_KPI_CATEGORIES, getKPIById, generateSampleKPIData } from '../data/kpiData';
import type { KPIDefinition } from '../data/kpiData';
import { getHospitalInfo } from '../config/hospitalConfig';
import { useNABHStore } from '../store/nabhStore';
import { saveKPIGraph, loadKPIGraphHistory, restoreKPIGraph, deleteKPIGraph } from '../services/kpiStorage';
import type { KPIGraphRecord } from '../services/kpiStorage';
import { processKPIEditPrompt, getQuickPresets, getKPISamplePrompts } from '../services/kpiAIService';
import type { QuickPreset } from '../services/kpiAIService';

interface KPIDataEntry {
  month: string;
  value: number;
  target: number;
  numeratorValue?: number;
  denominatorValue?: number;
  remarks?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function KPIDetailPage() {
  const { kpiId } = useParams<{ kpiId: string }>();
  const navigate = useNavigate();
  const { selectedHospital } = useNABHStore();
  const hospitalConfig = getHospitalInfo(selectedHospital);
  
  const [kpi, setKpi] = useState<KPIDefinition | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [kpiData, setKpiData] = useState<KPIDataEntry[]>([]);
  const [isAddEntryDialogOpen, setIsAddEntryDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState<KPIDataEntry>({
    month: new Date().toISOString().slice(0, 7),
    value: 0,
    target: 0,
    numeratorValue: 0,
    denominatorValue: 0,
    remarks: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const chartRef = useRef<HTMLCanvasElement>(null);

  // AI Edit and Graph Storage states
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [graphHistory, setGraphHistory] = useState<KPIGraphRecord[]>([]);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [quickPresets, setQuickPresets] = useState<QuickPreset[]>([]);
  const [samplePrompts, setSamplePrompts] = useState<string[]>([]);
  const [lastAIModification, setLastAIModification] = useState<string | null>(null);

  useEffect(() => {
    if (kpiId) {
      const foundKpi = getKPIById(kpiId);
      if (foundKpi) {
        setKpi(foundKpi);
        setNewEntry(prev => ({ ...prev, target: foundKpi.suggestedTarget }));

        // Initialize quick presets and sample prompts
        setQuickPresets(getQuickPresets(foundKpi));
        setSamplePrompts(getKPISamplePrompts(foundKpi));

        // Load saved data or generate sample data
        const savedData = localStorage.getItem(`kpi_data_${kpiId}`);
        if (savedData) {
          setKpiData(JSON.parse(savedData));
        } else {
          // Generate sample data for demonstration
          const sampleData = generateSampleKPIData(kpiId, 12);
          setKpiData(sampleData);
        }

        // Load graph history from Supabase
        loadKPIGraphHistory(kpiId).then(result => {
          if (result.success && result.data) {
            setGraphHistory(result.data);
          }
        });
      }
    }
  }, [kpiId]);

  useEffect(() => {
    if (kpiId && kpiData.length > 0) {
      localStorage.setItem(`kpi_data_${kpiId}`, JSON.stringify(kpiData));
    }
  }, [kpiData, kpiId]);

  // Draw chart
  useEffect(() => {
    if (chartRef.current && kpiData.length > 0 && kpi && tabValue === 0) {
      // Small delay to ensure the element is rendered
      const timer = setTimeout(() => {
        drawChart();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [kpiData, kpi, tabValue]);

  const drawChart = (forceWidth?: number, forceHeight?: number) => {
    if (!chartRef.current || !kpi || kpiData.length === 0) return;

    const canvas = chartRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size - use forced dimensions or getBoundingClientRect
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Use forced dimensions or fall back to rect (with minimum size)
    const width = forceWidth || Math.max(rect.width, 800);
    const height = forceHeight || Math.max(rect.height, 400);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate data bounds
    const values = kpiData.map(d => d.value);
    const targets = kpiData.map(d => d.target);
    const allValues = [...values, ...targets];
    const minValue = Math.min(...allValues) * 0.9;
    const maxValue = Math.max(...allValues) * 1.1;

    // Draw grid lines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight * i / gridLines);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Y-axis labels
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

    // Target label
    ctx.fillStyle = '#D32F2F';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Target: ${kpi.suggestedTarget}`, width - padding.right + 5, targetY + 4);

    // Draw data line
    const pointWidth = chartWidth / (kpiData.length - 1 || 1);

    // Line gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, '#1565C0');
    gradient.addColorStop(1, '#42A5F5');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    kpiData.forEach((d, i) => {
      const x = padding.left + (i * pointWidth);
      const y = padding.top + chartHeight - ((d.value - minValue) / (maxValue - minValue) * chartHeight);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw area under line
    const areaGradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    areaGradient.addColorStop(0, 'rgba(21, 101, 192, 0.3)');
    areaGradient.addColorStop(1, 'rgba(21, 101, 192, 0.05)');

    ctx.fillStyle = areaGradient;
    ctx.beginPath();
    kpiData.forEach((d, i) => {
      const x = padding.left + (i * pointWidth);
      const y = padding.top + chartHeight - ((d.value - minValue) / (maxValue - minValue) * chartHeight);

      if (i === 0) {
        ctx.moveTo(x, height - padding.bottom);
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(padding.left + ((kpiData.length - 1) * pointWidth), height - padding.bottom);
    ctx.closePath();
    ctx.fill();

    // Draw data points
    kpiData.forEach((d, i) => {
      const x = padding.left + (i * pointWidth);
      const y = padding.top + chartHeight - ((d.value - minValue) / (maxValue - minValue) * chartHeight);

      // Determine point color based on target
      const isGood = kpi.targetDirection === 'lower' ? d.value <= d.target : d.value >= d.target;

      // Point circle
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = isGood ? '#2E7D32' : '#D32F2F';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // X-axis labels (month)
      ctx.fillStyle = '#64748B';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      const monthLabel = new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      ctx.fillText(monthLabel, x, height - padding.bottom + 20);
    });

    // Draw title
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${kpi.shortName} - Trend Analysis`, width / 2, 20);

    // Draw unit label
    ctx.fillStyle = '#64748B';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(kpi.unit, 0, 0);
    ctx.restore();
  };

  const handleAddEntry = () => {
    if (!kpi) return;

    // Calculate value from numerator/denominator if provided
    let calculatedValue = newEntry.value;
    if (newEntry.numeratorValue && newEntry.denominatorValue && newEntry.denominatorValue > 0) {
      if (kpi.unit === 'Percentage') {
        calculatedValue = (newEntry.numeratorValue / newEntry.denominatorValue) * 100;
      } else if (kpi.unit.includes('1000')) {
        calculatedValue = (newEntry.numeratorValue / newEntry.denominatorValue) * 1000;
      } else if (kpi.unit.includes('100')) {
        calculatedValue = (newEntry.numeratorValue / newEntry.denominatorValue) * 100;
      } else {
        calculatedValue = newEntry.numeratorValue / newEntry.denominatorValue;
      }
      calculatedValue = Math.round(calculatedValue * 100) / 100;
    }

    const entry: KPIDataEntry = {
      month: newEntry.month,
      value: calculatedValue,
      target: newEntry.target || kpi.suggestedTarget,
      numeratorValue: newEntry.numeratorValue,
      denominatorValue: newEntry.denominatorValue,
      remarks: newEntry.remarks
    };

    setKpiData(prev => {
      const filtered = prev.filter(d => d.month !== entry.month);
      return [...filtered, entry].sort((a, b) => a.month.localeCompare(b.month));
    });

    setIsAddEntryDialogOpen(false);
    setNewEntry({
      month: new Date().toISOString().slice(0, 7),
      value: 0,
      target: kpi.suggestedTarget,
      numeratorValue: 0,
      denominatorValue: 0,
      remarks: ''
    });
    setSnackbar({ open: true, message: 'Data entry added successfully', severity: 'success' });
  };

  const handleDeleteEntry = (month: string) => {
    setKpiData(prev => prev.filter(d => d.month !== month));
    setSnackbar({ open: true, message: 'Entry deleted', severity: 'success' });
  };

  const getPerformanceStatus = (value: number, target: number) => {
    if (!kpi) return { status: 'unknown', color: 'default', label: 'Unknown' };

    const isGood = kpi.targetDirection === 'lower' ? value <= target : value >= target;
    const threshold = kpi.targetDirection === 'lower' ? target * 1.2 : target * 0.8;
    const isNear = kpi.targetDirection === 'lower' ? value <= threshold : value >= threshold;

    if (isGood) return { status: 'good', color: 'success', label: 'On Target' };
    if (isNear) return { status: 'warning', color: 'warning', label: 'Near Target' };
    return { status: 'bad', color: 'error', label: 'Off Target' };
  };

  const getLatestEntry = () => kpiData.length > 0 ? kpiData[kpiData.length - 1] : null;

  const calculateTrend = () => {
    if (kpiData.length < 2) return { direction: 'neutral', value: 0 };
    const recent = kpiData.slice(-3);
    if (recent.length < 2) return { direction: 'neutral', value: 0 };

    const change = recent[recent.length - 1].value - recent[0].value;
    const percentChange = (change / recent[0].value) * 100;

    // For lower-is-better KPIs, negative change is good
    const isImproving = kpi?.targetDirection === 'lower' ? change < 0 : change > 0;

    return {
      direction: isImproving ? 'improving' : change === 0 ? 'neutral' : 'declining',
      value: Math.abs(percentChange)
    };
  };

  const generateReport = () => {
    if (!kpi) return;

    const latest = getLatestEntry();
    const trend = calculateTrend();
    const status = latest ? getPerformanceStatus(latest.value, latest.target) : null;

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${kpi.name} - KPI Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', serif; padding: 20mm; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #1565C0; padding-bottom: 15px; margin-bottom: 20px; }
          .hospital-name { font-size: 24px; font-weight: bold; color: #1565C0; }
          .report-title { font-size: 18px; margin-top: 10px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 14px; font-weight: bold; background: #f5f5f5; padding: 8px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          .status-good { color: #2E7D32; font-weight: bold; }
          .status-warning { color: #ED6C02; font-weight: bold; }
          .status-bad { color: #D32F2F; font-weight: bold; }
          .formula-box { background: #f0f7ff; padding: 15px; border-radius: 8px; margin: 10px 0; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
          .stamp { border: 2px solid #1565C0; padding: 10px; text-align: center; width: 200px; margin: 20px auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="hospital-name">${hospitalConfig.name}</div>
          <div style="font-size: 12px;">${hospitalConfig.address}</div>
          <div class="report-title">KEY PERFORMANCE INDICATOR REPORT</div>
          <div style="font-size: 12px;">KPI ${kpi.number}: ${kpi.name}</div>
        </div>

        <div class="section">
          <div class="section-title">KPI Definition</div>
          <p>${kpi.definition}</p>
        </div>

        <div class="section">
          <div class="section-title">Formula</div>
          <div class="formula-box">
            <strong>Numerator:</strong> ${kpi.numerator}<br/>
            <strong>Denominator:</strong> ${kpi.denominator}<br/>
            <strong>Formula:</strong> ${kpi.formula}<br/>
            <strong>Unit:</strong> ${kpi.unit}<br/>
            <strong>Target:</strong> ${kpi.suggestedTarget} ${kpi.unit}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Current Performance</div>
          <table>
            <tr>
              <th>Latest Value</th>
              <th>Target</th>
              <th>Status</th>
              <th>Trend</th>
            </tr>
            <tr>
              <td>${latest ? latest.value.toFixed(2) + ' ' + kpi.unit : 'N/A'}</td>
              <td>${kpi.suggestedTarget} ${kpi.unit}</td>
              <td class="status-${status?.status || 'unknown'}">${status?.label || 'N/A'}</td>
              <td>${trend.direction === 'improving' ? 'Improving' : trend.direction === 'declining' ? 'Declining' : 'Stable'} (${trend.value.toFixed(1)}%)</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Monthly Data</div>
          <table>
            <tr>
              <th>Month</th>
              <th>Value</th>
              <th>Target</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
            ${kpiData.slice(-12).map(d => {
              const s = getPerformanceStatus(d.value, d.target);
              return `
                <tr>
                  <td>${new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
                  <td>${d.value.toFixed(2)}</td>
                  <td>${d.target}</td>
                  <td class="status-${s.status}">${s.label}</td>
                  <td>${d.remarks || '-'}</td>
                </tr>
              `;
            }).join('')}
          </table>
        </div>

        <div class="section">
          <div class="section-title">Remarks</div>
          <p>${kpi.remarks}</p>
          ${kpi.sampling ? `<p><strong>Sampling:</strong> Yes (${kpi.samplingMethodology})</p>` : '<p><strong>Sampling:</strong> No</p>'}
        </div>

        <div class="stamp">
          <div style="font-weight: bold;">${hospitalConfig.name.toUpperCase()}</div>
          <div style="font-size: 10px;">QUALITY MANAGEMENT SYSTEM</div>
          <div style="font-size: 10px;">Controlled Document</div>
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          <p>NABH Standard: ${kpi.standard} | Frequency: ${kpi.frequency}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KPI_${kpi.number}_${kpi.shortName.replace(/\s+/g, '_')}_Report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: 'Report downloaded successfully', severity: 'success' });
  };

  const printChart = () => {
    if (!chartRef.current || !kpi) return;

    // Force redraw chart with explicit dimensions before capturing
    drawChart(800, 400);

    // Small delay to ensure the chart is fully rendered
    setTimeout(() => {
      if (!chartRef.current) return;
      const dataUrl = chartRef.current.toDataURL('image/png');
      openPrintWindow(dataUrl);
    }, 200);
  };

  const openPrintWindow = (dataUrl: string) => {
    if (!kpi) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${kpi.name} - Chart</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'Times New Roman', serif;
                text-align: center;
                padding: 20mm;
              }
              .header {
                border-bottom: 2px solid #1565C0;
                padding-bottom: 15px;
                margin-bottom: 20px;
              }
              .hospital-name {
                font-size: 24px;
                font-weight: bold;
                color: #1565C0;
              }
              .kpi-name {
                font-size: 18px;
                margin-top: 10px;
                color: #333;
              }
              .chart-container {
                margin: 20px auto;
                max-width: 800px;
              }
              .chart-img {
                max-width: 100%;
                height: auto;
                border: 1px solid #ddd;
                border-radius: 8px;
              }
              .footer {
                margin-top: 30px;
                font-size: 11px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 10px;
              }
              .stats-row {
                display: flex;
                justify-content: center;
                gap: 40px;
                margin: 20px 0;
              }
              .stat-item {
                text-align: center;
              }
              .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #1565C0;
              }
              .stat-label {
                font-size: 12px;
                color: #666;
              }
              @media print {
                body { padding: 10mm; }
                .chart-img { max-width: 100%; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="hospital-name">${hospitalConfig.name}</div>
              <div style="font-size: 12px;">${hospitalConfig.address}</div>
              <div class="kpi-name">KPI ${kpi.number}: ${kpi.name}</div>
            </div>

            <div class="stats-row">
              <div class="stat-item">
                <div class="stat-value">${kpi.suggestedTarget}</div>
                <div class="stat-label">Target (${kpi.unit})</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${kpiData.length > 0 ? kpiData[kpiData.length - 1].value.toFixed(2) : 'N/A'}</div>
                <div class="stat-label">Current Value</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${kpi.frequency}</div>
                <div class="stat-label">Frequency</div>
              </div>
            </div>

            <div class="chart-container">
              <img id="chartImage" class="chart-img" src="${dataUrl}" alt="KPI Trend Chart" />
            </div>

            <div class="footer">
              <p><strong>Formula:</strong> ${kpi.formula}</p>
              <p style="margin-top: 5px;">Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p>${hospitalConfig.name} | Quality Management System</p>
            </div>

            <script>
              // Wait for image to load before printing
              const img = document.getElementById('chartImage');
              if (img.complete) {
                setTimeout(function() { window.print(); }, 100);
              } else {
                img.onload = function() {
                  setTimeout(function() { window.print(); }, 100);
                };
                img.onerror = function() {
                  alert('Error loading chart image');
                };
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Save graph to Supabase
  const handleSaveGraph = async () => {
    if (!chartRef.current || !kpi) return;

    setIsSaving(true);
    try {
      // Force redraw chart for capture
      drawChart(800, 400);

      // Small delay to ensure the chart is fully rendered
      await new Promise(resolve => setTimeout(resolve, 200));

      const dataUrl = chartRef.current.toDataURL('image/png');

      const result = await saveKPIGraph(
        kpi.id,
        kpi.number,
        kpi.name,
        dataUrl,
        kpiData,
        lastAIModification || undefined,
        lastAIModification ? 'AI Modified' : undefined
      );

      if (result.success) {
        setSnackbar({ open: true, message: 'Graph saved to Supabase successfully', severity: 'success' });
        // Reload graph history
        const historyResult = await loadKPIGraphHistory(kpi.id);
        if (historyResult.success && historyResult.data) {
          setGraphHistory(historyResult.data);
        }
        setLastAIModification(null);
      } else {
        setSnackbar({ open: true, message: result.error || 'Failed to save graph', severity: 'error' });
      }
    } catch (error) {
      console.error('Error saving graph:', error);
      setSnackbar({ open: true, message: 'Error saving graph', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Process AI prompt to modify data
  const handleAIEdit = async () => {
    if (!aiPrompt.trim() || !kpi) return;

    setIsAIProcessing(true);
    try {
      const result = await processKPIEditPrompt(aiPrompt, kpiData, kpi);

      if (result.success && result.modifiedData) {
        setKpiData(result.modifiedData);
        setLastAIModification(aiPrompt);
        setSnackbar({
          open: true,
          message: result.explanation || 'Data modified successfully',
          severity: 'success'
        });
        setAiPrompt('');
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Failed to process request',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error processing AI prompt:', error);
      setSnackbar({ open: true, message: 'Error processing AI request', severity: 'error' });
    } finally {
      setIsAIProcessing(false);
    }
  };

  // Apply quick preset
  const handleQuickPreset = async (preset: QuickPreset) => {
    if (!kpi) return;

    setIsAIProcessing(true);
    try {
      const result = await processKPIEditPrompt(preset.prompt, kpiData, kpi);

      if (result.success && result.modifiedData) {
        setKpiData(result.modifiedData);
        setLastAIModification(`Quick Preset: ${preset.label}`);
        setSnackbar({
          open: true,
          message: `Applied "${preset.label}" preset`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Failed to apply preset',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error applying preset:', error);
      setSnackbar({ open: true, message: 'Error applying preset', severity: 'error' });
    } finally {
      setIsAIProcessing(false);
    }
  };

  // Restore a previous graph version
  const handleRestoreGraph = async (graph: KPIGraphRecord) => {
    if (!kpi) return;

    try {
      // Restore the data from the graph record
      if (graph.graph_data) {
        setKpiData(graph.graph_data);
      }

      // Update the current flag in database
      await restoreKPIGraph(kpi.id, graph.id);

      // Reload history
      const historyResult = await loadKPIGraphHistory(kpi.id);
      if (historyResult.success && historyResult.data) {
        setGraphHistory(historyResult.data);
      }

      setIsHistoryDrawerOpen(false);
      setSnackbar({ open: true, message: 'Graph version restored', severity: 'success' });
    } catch (error) {
      console.error('Error restoring graph:', error);
      setSnackbar({ open: true, message: 'Error restoring graph version', severity: 'error' });
    }
  };

  // Delete a graph from history
  const handleDeleteGraph = async (graphId: string) => {
    if (!kpi) return;

    try {
      const result = await deleteKPIGraph(graphId);

      if (result.success) {
        // Reload history
        const historyResult = await loadKPIGraphHistory(kpi.id);
        if (historyResult.success && historyResult.data) {
          setGraphHistory(historyResult.data);
        }
        setSnackbar({ open: true, message: 'Graph deleted from history', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: result.error || 'Failed to delete graph', severity: 'error' });
      }
    } catch (error) {
      console.error('Error deleting graph:', error);
      setSnackbar({ open: true, message: 'Error deleting graph', severity: 'error' });
    }
  };

  if (!kpi) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>KPI not found</Typography>
        <Button onClick={() => navigate('/kpis')} sx={{ mt: 2 }}>Back to KPIs</Button>
      </Box>
    );
  }

  const category = NABH_KPI_CATEGORIES.find(c => c.id === kpi.category);
  const latest = getLatestEntry();
  const status = latest ? getPerformanceStatus(latest.value, latest.target) : null;
  const trend = calculateTrend();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/kpis')}>
          <Icon>arrow_back</Icon>
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`KPI ${kpi.number}`}
              size="small"
              sx={{ bgcolor: category?.color, color: 'white' }}
            />
            <Chip label={kpi.standard} size="small" variant="outlined" />
          </Box>
          <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
            {kpi.name}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View saved graph versions">
            <Button
              variant="outlined"
              startIcon={<Icon>history</Icon>}
              onClick={() => setIsHistoryDrawerOpen(true)}
              disabled={graphHistory.length === 0}
            >
              History ({graphHistory.length})
            </Button>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={isSaving ? <CircularProgress size={20} /> : <Icon>cloud_upload</Icon>}
            onClick={handleSaveGraph}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Graph'}
          </Button>
          <Button variant="outlined" startIcon={<Icon>print</Icon>} onClick={printChart}>
            Print
          </Button>
          <Button variant="outlined" startIcon={<Icon>download</Icon>} onClick={generateReport}>
            Report
          </Button>
          <Button variant="contained" startIcon={<Icon>add</Icon>} onClick={() => setIsAddEntryDialogOpen(true)}>
            Add Data
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon sx={{ color: category?.color }}>speed</Icon>
                <Typography variant="body2" color="text.secondary">Current Value</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                {latest ? latest.value.toFixed(2) : 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">{kpi.unit}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon sx={{ color: '#D32F2F' }}>flag</Icon>
                <Typography variant="body2" color="text.secondary">Target</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                {kpi.suggestedTarget}
              </Typography>
              <Typography variant="caption" color="text.secondary">{kpi.unit}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon sx={{ color: status?.color === 'success' ? '#2E7D32' : status?.color === 'warning' ? '#ED6C02' : '#D32F2F' }}>
                  {status?.status === 'good' ? 'check_circle' : status?.status === 'warning' ? 'warning' : 'error'}
                </Icon>
                <Typography variant="body2" color="text.secondary">Status</Typography>
              </Box>
              <Chip
                label={status?.label || 'No Data'}
                color={status?.color as any || 'default'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon sx={{ color: trend.direction === 'improving' ? '#2E7D32' : trend.direction === 'declining' ? '#D32F2F' : '#64748B' }}>
                  {trend.direction === 'improving' ? 'trending_up' : trend.direction === 'declining' ? 'trending_down' : 'trending_flat'}
                </Icon>
                <Typography variant="body2" color="text.secondary">Trend</Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ mt: 1, textTransform: 'capitalize' }}>
                {trend.direction}
              </Typography>
              <Typography variant="caption" color="text.secondary">{trend.value.toFixed(1)}% change</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab icon={<Icon>show_chart</Icon>} label="Chart" iconPosition="start" />
          <Tab icon={<Icon>table_chart</Icon>} label="Data Table" iconPosition="start" />
          <Tab icon={<Icon>info</Icon>} label="Definition" iconPosition="start" />
          <Tab icon={<Icon>calculate</Icon>} label="Formula" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 3, minHeight: 450 }}>
          <canvas
            ref={chartRef}
            id="kpi-chart-canvas"
            style={{
              width: '100%',
              minWidth: 600,
              height: 400,
              display: 'block',
              backgroundColor: '#fafafa'
            }}
          />
        </Paper>

        {/* AI Edit Panel */}
        <Paper sx={{ p: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Icon color="primary">auto_awesome</Icon>
            <Typography variant="h6">AI Graph Editor</Typography>
            {lastAIModification && (
              <Chip
                label={`Last: ${lastAIModification.substring(0, 30)}...`}
                size="small"
                color="info"
                onDelete={() => setLastAIModification(null)}
              />
            )}
          </Box>

          {/* Quick Presets */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Quick Presets:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {quickPresets.map(preset => (
                <Chip
                  key={preset.id}
                  icon={<Icon sx={{ fontSize: '16px !important' }}>{preset.icon}</Icon>}
                  label={preset.label}
                  onClick={() => handleQuickPreset(preset)}
                  disabled={isAIProcessing}
                  sx={{ cursor: 'pointer' }}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          {/* Custom Prompt Input */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Enter a prompt to modify the graph data. Examples: 'Show improvement trend', 'Add more variation', 'Set values to target'"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              disabled={isAIProcessing}
              helperText={
                <Box component="span" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  Try:
                  {samplePrompts.slice(0, 3).map((prompt, idx) => (
                    <Chip
                      key={idx}
                      label={prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt}
                      size="small"
                      onClick={() => setAiPrompt(prompt)}
                      sx={{ cursor: 'pointer', fontSize: '11px', height: 20 }}
                    />
                  ))}
                </Box>
              }
            />
            <Button
              variant="contained"
              onClick={handleAIEdit}
              disabled={!aiPrompt.trim() || isAIProcessing}
              startIcon={isAIProcessing ? <CircularProgress size={20} /> : <Icon>smart_toy</Icon>}
              sx={{ minWidth: 140, height: 56 }}
            >
              {isAIProcessing ? 'Processing...' : 'Apply'}
            </Button>
          </Box>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell align="right">Target</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell>Remarks</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {kpiData.slice().reverse().map((entry) => {
                  const s = getPerformanceStatus(entry.value, entry.target);
                  return (
                    <TableRow key={entry.month}>
                      <TableCell>
                        {new Date(entry.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600}>{entry.value.toFixed(2)} {kpi.unit}</Typography>
                      </TableCell>
                      <TableCell align="right">{entry.target}</TableCell>
                      <TableCell align="center">
                        <Chip label={s.label} size="small" color={s.color as any} />
                      </TableCell>
                      <TableCell>{entry.remarks || '-'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDeleteEntry(entry.month)}>
                            <Icon>delete</Icon>
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
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Definition</Typography>
          <Typography paragraph>{kpi.definition}</Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>Remarks</Typography>
          <Typography paragraph>{kpi.remarks}</Typography>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="text.secondary">Standard</Typography>
              <Typography fontWeight={600}>{kpi.standard}</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="text.secondary">Frequency</Typography>
              <Typography fontWeight={600}>{kpi.frequency}</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="body2" color="text.secondary">Sampling Required</Typography>
              <Typography fontWeight={600}>{kpi.sampling ? 'Yes' : 'No'}</Typography>
            </Grid>
            {kpi.sampling && (
              <Grid size={{ xs: 6, md: 3 }}>
                <Typography variant="body2" color="text.secondary">Sampling Method</Typography>
                <Typography fontWeight={600}>{kpi.samplingMethodology}</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Formula Components</Typography>

          <Box sx={{ bgcolor: 'primary.50', p: 3, borderRadius: 2, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">Numerator</Typography>
                <Typography variant="h6">{kpi.numerator}</Typography>
              </Grid>
              <Grid size={12}>
                <Divider />
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">Denominator</Typography>
                <Typography variant="h6">{kpi.denominator}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ bgcolor: 'success.50', p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="body2" color="text.secondary">Complete Formula</Typography>
            <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>{kpi.formula}</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 4 }}>
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">Unit</Typography>
                <Typography fontWeight={600}>{kpi.unit}</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">Target Direction</Typography>
                <Typography fontWeight={600}>
                  {kpi.targetDirection === 'lower' ? 'Lower is Better' : 'Higher is Better'}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">Benchmark Range</Typography>
                <Typography fontWeight={600}>{kpi.benchmarkRange.min} - {kpi.benchmarkRange.max}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>

      {/* Navigation to other KPIs */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Other KPIs</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {NABH_KPIS.map(k => (
            <Chip
              key={k.id}
              label={`${k.number}. ${k.shortName}`}
              size="small"
              variant={k.id === kpi.id ? 'filled' : 'outlined'}
              color={k.id === kpi.id ? 'primary' : 'default'}
              onClick={() => navigate(`/kpi/${k.id}`)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Paper>

      {/* Add Entry Dialog */}
      <Dialog open={isAddEntryDialogOpen} onClose={() => setIsAddEntryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon color="primary">add_chart</Icon>
            Add Data Entry - {kpi.shortName}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                type="month"
                label="Month"
                value={newEntry.month}
                onChange={(e) => setNewEntry({ ...newEntry, month: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                type="number"
                label={kpi.numerator}
                value={newEntry.numeratorValue}
                onChange={(e) => setNewEntry({ ...newEntry, numeratorValue: Number(e.target.value) })}
                helperText="Numerator value"
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                type="number"
                label={kpi.denominator}
                value={newEntry.denominatorValue}
                onChange={(e) => setNewEntry({ ...newEntry, denominatorValue: Number(e.target.value) })}
                helperText="Denominator value"
              />
            </Grid>
            <Grid size={12}>
              <Divider>OR enter calculated value directly</Divider>
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                type="number"
                label={`Value (${kpi.unit})`}
                value={newEntry.value}
                onChange={(e) => setNewEntry({ ...newEntry, value: Number(e.target.value) })}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                type="number"
                label="Target"
                value={newEntry.target}
                onChange={(e) => setNewEntry({ ...newEntry, target: Number(e.target.value) })}
                helperText={`Default: ${kpi.suggestedTarget}`}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Remarks"
                value={newEntry.remarks}
                onChange={(e) => setNewEntry({ ...newEntry, remarks: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddEntryDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddEntry}>Add Entry</Button>
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

      {/* Graph History Drawer */}
      <Drawer
        anchor="right"
        open={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        PaperProps={{ sx: { width: 400 } }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              <Icon sx={{ verticalAlign: 'middle', mr: 1 }}>history</Icon>
              Graph History
            </Typography>
            <IconButton onClick={() => setIsHistoryDrawerOpen(false)}>
              <Icon>close</Icon>
            </IconButton>
          </Box>

          {graphHistory.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Icon sx={{ fontSize: 48, color: 'text.secondary' }}>image_not_supported</Icon>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                No saved graphs yet.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click "Save Graph" to store the current graph.
              </Typography>
            </Box>
          ) : (
            <List>
              {graphHistory.map((graph) => (
                <Paper key={graph.id} sx={{ mb: 2, overflow: 'hidden' }}>
                  <Box
                    component="img"
                    src={graph.graph_url}
                    alt={`KPI Graph - ${new Date(graph.created_at).toLocaleDateString()}`}
                    sx={{
                      width: '100%',
                      height: 150,
                      objectFit: 'contain',
                      bgcolor: '#f5f5f5',
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {new Date(graph.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {graph.is_current && (
                            <Chip label="Current" size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          {graph.prompt_used && (
                            <Typography variant="caption" component="div" sx={{ fontStyle: 'italic' }}>
                              "{graph.prompt_used.substring(0, 50)}..."
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {graph.graph_data?.length || 0} data points
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Restore this version">
                          <IconButton
                            size="small"
                            onClick={() => handleRestoreGraph(graph)}
                            disabled={graph.is_current}
                          >
                            <Icon fontSize="small">restore</Icon>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteGraph(graph.id)}
                          >
                            <Icon fontSize="small">delete</Icon>
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Paper>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
