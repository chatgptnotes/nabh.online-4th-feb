import { useState, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Icon from '@mui/material/Icon';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import * as XLSX from 'xlsx';
import type { Patient, PatientImportRow } from '../../types/patient';
import { bulkImportPatients, deleteAllPatients } from '../../services/patientStorage';

interface ImportPatientsModalProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

const IMPORT_STEPS = ['Upload File', 'Preview Data', 'Import'];

export default function ImportPatientsModal({
  open,
  onClose,
  onImportComplete,
}: ImportPatientsModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [parsedData, setParsedData] = useState<Patient[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    imported: number;
    failed: number;
    errors?: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setError(null);
    setIsProcessing(true);

    try {
      const data = await parseExcelFile(selectedFile);
      setParsedData(data);
      setActiveStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseExcelFile = async (file: File): Promise<Patient[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });

          // Get the first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON (raw data first)
          let jsonData: PatientImportRow[] = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            dateNF: 'yyyy-mm-dd',
          });

          // Debug: Log the first row's keys to see actual column names
          if (jsonData.length > 0) {
            console.log('Excel column names:', Object.keys(jsonData[0]));
            console.log('First row data:', jsonData[0]);
          }

          // Check if this is a web-exported Excel with __EMPTY columns
          // In this case, first row contains actual headers as VALUES, not as keys
          const firstRowKeys = Object.keys(jsonData[0] || {});
          const hasEmptyColumns = firstRowKeys.some(k => k.startsWith('__EMPTY'));

          if (hasEmptyColumns && jsonData.length > 1) {
            console.log('Detected web-exported Excel format, remapping columns...');

            // First row values are the actual headers
            const headerRow = jsonData[0];
            const headerValues = Object.values(headerRow) as string[];
            console.log('Header values:', headerValues);

            // Remap subsequent rows using these headers
            jsonData = jsonData.slice(1).map(row => {
              const values = Object.values(row);
              const remappedRow: PatientImportRow = {};
              headerValues.forEach((header, idx) => {
                if (header && values[idx] !== undefined) {
                  remappedRow[String(header).trim()] = values[idx];
                }
              });
              return remappedRow;
            });

            console.log('Remapped first row:', jsonData[0]);
          }

          // Helper function to parse and validate dates with OCR error handling
          const parseDate = (dateStr: string | number | Date | undefined): string | undefined => {
            if (!dateStr) return undefined;

            // If already a Date object
            if (dateStr instanceof Date) {
              if (isNaN(dateStr.getTime())) return undefined;
              return dateStr.toISOString().split('T')[0];
            }

            let str = String(dateStr).trim();
            if (!str || str === '-' || str === '—') return undefined;

            // Clean up common OCR artifacts
            str = str
              .replace(/^[|\\\/]+/, '')   // Remove leading pipe, slash characters
              .replace(/[|\\\/]+$/, '')   // Remove trailing pipe, slash characters
              .replace(/\s+/g, ' ')       // Normalize spaces
              .trim();

            // Fix common OCR errors in digits (after extracting from month context)
            const fixDigitOCR = (s: string): string => {
              return s
                .replace(/O/g, '0')   // O -> 0
                .replace(/o/g, '0')   // o -> 0
                .replace(/l/g, '1')   // l -> 1
                .replace(/I/g, '1')   // I -> 1
                .replace(/i/g, '1')   // i -> 1
                .replace(/fi/g, '1')  // fi ligature -> 1
                .replace(/f/g, '1')   // f -> 1 (partial fi)
                .replace(/g/g, '9')   // g -> 9
                .replace(/Y/g, '9')   // Y -> 9 (in day context)
                .replace(/y/g, '9')   // y -> 9
                .replace(/s/g, '5')   // s -> 5 (in year context)
                .replace(/S/g, '5')   // S -> 5
                .replace(/#/g, '8')   // # -> 8
                .replace(/\?/g, '7')  // ? -> 7
                .replace(/Z/g, '2')   // Z -> 2
                .replace(/z/g, '2')   // z -> 2
                .replace(/b/g, '6')   // b -> 6
                .replace(/B/g, '8')   // B -> 8
                .replace(/e/g, '8')   // e -> 8 (looks like 8)
                .replace(/E/g, '8')   // E -> 8
                .replace(/j/g, '1')   // j -> 1
                .replace(/J/g, '1')   // J -> 1
                .replace(/t/g, '1')   // t -> 1
                .replace(/T/g, '1')   // T -> 1
                .replace(/q/g, '9')   // q -> 9
                .replace(/Q/g, '9')   // Q -> 9
                .replace(/D/g, '0')   // D -> 0
                .replace(/a/g, '4')   // a -> 4
                .replace(/A/g, '4')   // A -> 4
                .replace(/[^0-9]/g, ''); // Remove any remaining non-digits
            };

            // Month name mapping (including common OCR errors)
            const monthMap: Record<string, string> = {
              // Standard months
              'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
              'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
              'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12',
              // OCR errors - J variants (January)
              'jen': '01', 'jan0': '01', 'jano': '01', 'jan9': '01',
              'jang': '01', 'ja': '01', 'jn': '01', 'jai': '01',
              // OCR errors - J variants (June/July)
              'ju': '06',   // Could be Jun (prefer Jun over Jul)
              'jun0': '06', 'jun9': '06', 'juny': '06',
              'jut': '07',  // JuT -> Jul
              'jui': '07', 'juli': '07', 'jl': '07',
              'jiji': '07', 'jij': '07', // JiJI -> Jul (I looks like l)
              // OCR errors - other months
              'fe': '02', 'feo': '02', 'feb0': '02',
              'ma': '03', 'mar0': '03', 'maro': '03',  // Mar
              'a9r': '04', 'a0r': '04', 'agr': '04', 'ap': '04', 'arp': '04', 'apr0': '04',
              'mav': '05', 'maw': '05', 'may0': '05',  // May
              'augo': '08', 'aug0': '08', 'au9': '08', 'au': '08',
              'se': '09', 'se9': '09', 'sep9': '09', 'sep0': '09', 'sepo': '09',
              // October OCR errors (0 looks like O, c looks like o)
              '0ct': '10', 'oct0': '10', '0c': '10', '0o': '10', 'oc': '10',
              '0d': '10', '0m': '10', 'od': '10', 'om': '10',  // OCR of "Oct"
              // November
              'n0v': '11', 'nov0': '11', 'no': '11',
              // December OCR errors
              'oec': '12', '0ec': '12', 'dec1': '12', 'decl': '12', 'decle': '12',
              'de': '12', 'dec0': '12', 'deco': '12',
            };

            // Try multiple patterns
            // Pattern 1: "MMM DD, YYYY" or "MMM DD YYYY" with space (Jan 31, 2026)
            let match = str.match(/^([a-zA-Z0-9]+)\s+(\d{1,2}),?\s*(\d{4})$/i);

            // Pattern 2: "MMMDD,YYYY" without space (Jul25,2025)
            if (!match) {
              match = str.match(/^([a-zA-Z]+)(\d{1,2}),?\s*(\d{4})$/i);
            }

            // Pattern 3: With OCR-corrupted day like "Aug0#,2025" or "Jun0Y,2025"
            if (!match) {
              match = str.match(/^([a-zA-Z]+)\s*(\d[a-zA-Z0-9#?]+),?\s*(\d{4})$/i);
            }

            if (match) {
              const [, monthStr, dayRaw, yearRaw] = match;

              // Fix OCR in day and year
              const day = fixDigitOCR(dayRaw);
              const year = fixDigitOCR(yearRaw);

              // Validate that day and year are numeric after OCR fix
              if (!day || !year || !/^\d+$/.test(day) || !/^\d{4}$/.test(year)) {
                console.warn('Invalid day/year after OCR fix:', { dayRaw, day, yearRaw, year });
                return undefined;
              }

              // Look up month (try progressively shorter prefixes)
              let month: string | undefined;
              const monthLower = monthStr.toLowerCase();
              for (let len = monthLower.length; len >= 2 && !month; len--) {
                month = monthMap[monthLower.substring(0, len)];
              }
              // Also try full string for specific OCR errors
              if (!month) {
                month = monthMap[monthLower];
              }

              const dayNum = parseInt(day, 10);
              const yearNum = parseInt(year, 10);

              // Validate day (1-31) and year (reasonable range)
              if (month && dayNum >= 1 && dayNum <= 31 && yearNum >= 1900 && yearNum <= 2100) {
                const result = `${year}-${month}-${day.padStart(2, '0')}`;
                // Final validation: ensure result is valid ISO date format
                if (/^\d{4}-\d{2}-\d{2}$/.test(result)) {
                  return result;
                }
              }
            }

            // Try ISO format directly (YYYY-MM-DD) - must be strictly numeric
            if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
              const [y, m, d] = str.split('-').map(Number);
              if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
                return str;
              }
            }

            // Try native Date parsing as fallback (only for clean-looking strings)
            // Avoid parsing strings with obvious OCR artifacts
            if (!/[a-zA-Z]{2,}/.test(str.replace(/^[A-Za-z]{3,4}/, ''))) {
              try {
                const parsed = new Date(str);
                if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 1900 && parsed.getFullYear() <= 2100) {
                  const result = parsed.toISOString().split('T')[0];
                  // Final validation
                  if (/^\d{4}-\d{2}-\d{2}$/.test(result)) {
                    return result;
                  }
                }
              } catch {
                // Ignore parsing errors
              }
            }

            // Return undefined for invalid dates instead of crashing
            console.warn('Could not parse date:', dateStr);
            return undefined;
          };

          // Helper function to get value by normalized key
          const getValue = (row: PatientImportRow, possibleKeys: string[]): string | number | Date | undefined => {
            // First try exact match
            for (const key of possibleKeys) {
              if (row[key] !== undefined) return row[key];
            }
            // Then try case-insensitive match with trimmed keys
            const rowKeys = Object.keys(row);
            for (const possibleKey of possibleKeys) {
              const normalizedPossible = possibleKey.toLowerCase().replace(/[.\s]+/g, '');
              for (const rowKey of rowKeys) {
                const normalizedRow = rowKey.toLowerCase().replace(/[.\s]+/g, '');
                if (normalizedRow === normalizedPossible && row[rowKey] !== undefined) {
                  return row[rowKey];
                }
              }
            }
            return undefined;
          };

          // Map to Patient type
          const patients: Patient[] = jsonData.map((row, index) => {
            // Handle different column name formats with flexible matching
            const srNo = getValue(row, ['Sr No', 'Sr. No', 'sr_no', 'SrNo', 'SR NO', 'srno', 'Srno']) ?? index + 1;
            const visitId = getValue(row, ['Visit ID', 'visit_id', 'VisitID', 'VISIT ID', 'visitid', 'Visitid']) ?? `VISIT-${index + 1}`;
            const patientName = getValue(row, ['Patient Name', 'patient_name', 'PatientName', 'PATIENT NAME', 'patientname', 'Name', 'name']) ?? 'Unknown';
            const diagnosis = getValue(row, ['Diagnosis', 'diagnosis', 'DIAGNOSIS']) ?? '';
            const status = getValue(row, ['Status', 'status', 'STATUS']) ?? 'Active';

            // Handle date fields - get raw values
            const admissionDateRaw = getValue(row, ['Admission Date', 'admission_date', 'AdmissionDate', 'ADMISSION DATE', 'admissiondate']);
            const dischargeDateRaw = getValue(row, ['Discharge Date', 'discharge_date', 'DischargeDate', 'DISCHARGE DATE', 'dischargedate']);

            // Parse and validate dates (handles OCR errors, returns undefined for invalid dates)
            const admissionDate = parseDate(admissionDateRaw);
            const dischargeDate = parseDate(dischargeDateRaw);

            return {
              srNo: typeof srNo === 'number' ? srNo : parseInt(String(srNo), 10) || index + 1,
              visitId: String(visitId).trim(),
              patientName: String(patientName).trim(),
              diagnosis: diagnosis ? String(diagnosis).trim() : undefined,
              admissionDate: admissionDate,
              dischargeDate: dischargeDate,
              status: dischargeDate ? 'Discharged' : ((String(status).trim() as Patient['status']) || 'Active'),
            };
          });

          // Filter out rows without required fields
          const validPatients = patients.filter(
            (p) => p.visitId && p.patientName && p.visitId !== 'undefined'
          );

          // Deduplicate by Visit ID (keep last occurrence)
          const visitIdMap = new Map<string, Patient>();
          for (const patient of validPatients) {
            visitIdMap.set(patient.visitId, patient);
          }
          const deduplicatedPatients = Array.from(visitIdMap.values());

          if (deduplicatedPatients.length < validPatients.length) {
            console.log(`Deduplicated: ${validPatients.length - deduplicatedPatients.length} duplicate Visit IDs removed`);
          }

          if (deduplicatedPatients.length === 0) {
            reject(new Error('No valid patient records found in file'));
            return;
          }

          resolve(deduplicatedPatients);
        } catch (err) {
          reject(new Error(`Failed to parse Excel file: ${err instanceof Error ? err.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);
    setError(null);
    setActiveStep(2);

    try {
      // Delete existing data first
      setImportProgress(10);
      await deleteAllPatients();

      // Import new data
      setImportProgress(20);
      const result = await bulkImportPatients(parsedData);
      setImportProgress(100);

      setImportResult(result);

      if (result.success) {
        onImportComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setParsedData([]);
    setError(null);
    setImportResult(null);
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { minHeight: '60vh' } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon color="primary">upload_file</Icon>
          Import Patients from Excel
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3, pt: 2 }}>
          {IMPORT_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Step 0: Upload File */}
        {activeStep === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Paper
              variant="outlined"
              sx={{
                p: 6,
                border: '2px dashed',
                borderColor: 'primary.main',
                bgcolor: 'primary.50',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'primary.100' },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {isProcessing ? (
                <>
                  <CircularProgress size={64} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Processing file...
                  </Typography>
                </>
              ) : (
                <>
                  <Icon sx={{ fontSize: 64, color: 'primary.main' }}>cloud_upload</Icon>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Click to Upload Excel File
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supports .xlsx, .xls, and .csv files
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Expected columns: Sr. No, Visit ID, Patient Name, Diagnosis, Admission Date, Discharge Date, Status
                  </Typography>
                </>
              )}
            </Paper>
          </Box>
        )}

        {/* Step 1: Preview Data */}
        {activeStep === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Preview ({parsedData.length} records)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={`Active: ${parsedData.filter((p) => p.status === 'Active').length}`}
                  color="success"
                  size="small"
                />
                <Chip
                  label={`Discharged: ${parsedData.filter((p) => p.status === 'Discharged').length}`}
                  color="default"
                  size="small"
                />
              </Box>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sr No</TableCell>
                    <TableCell>Visit ID</TableCell>
                    <TableCell>Patient Name</TableCell>
                    <TableCell>Diagnosis</TableCell>
                    <TableCell>Admission</TableCell>
                    <TableCell>Discharge</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedData.slice(0, 100).map((patient, index) => (
                    <TableRow key={index}>
                      <TableCell>{patient.srNo}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {patient.visitId}
                        </Typography>
                      </TableCell>
                      <TableCell>{patient.patientName}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                          {patient.diagnosis || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>{patient.admissionDate || '-'}</TableCell>
                      <TableCell>{patient.dischargeDate || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={patient.status}
                          size="small"
                          color={patient.status === 'Active' ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {parsedData.length > 100 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Showing first 100 of {parsedData.length} records
              </Typography>
            )}

            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Warning:</strong> Importing will replace all existing patient records.
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Step 2: Import Progress/Result */}
        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            {isImporting ? (
              <>
                <CircularProgress size={64} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Importing {parsedData.length} patients...
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={importProgress}
                  sx={{ mt: 3, maxWidth: 400, mx: 'auto' }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {importProgress}% complete
                </Typography>
              </>
            ) : importResult ? (
              <>
                <Icon
                  sx={{
                    fontSize: 64,
                    color: importResult.failed === 0 ? 'success.main' : 'warning.main',
                  }}
                >
                  {importResult.failed === 0 ? 'check_circle' : 'warning'}
                </Icon>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Import Complete
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                  <Chip
                    label={`${importResult.imported} imported`}
                    color="success"
                    icon={<Icon>check</Icon>}
                  />
                  {importResult.failed > 0 && (
                    <Chip
                      label={`${importResult.failed} failed`}
                      color="error"
                      icon={<Icon>error</Icon>}
                    />
                  )}
                </Box>
                {importResult.errors && importResult.errors.length > 0 && (
                  <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
                    <Typography variant="subtitle2">Errors:</Typography>
                    {importResult.errors.map((err, i) => (
                      <Typography key={i} variant="caption" display="block">
                        {err}
                      </Typography>
                    ))}
                  </Alert>
                )}
              </>
            ) : null}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={handleClose}>
          {importResult ? 'Close' : 'Cancel'}
        </Button>
        {activeStep === 1 && (
          <>
            <Button onClick={handleReset}>Back</Button>
            <Button
              variant="contained"
              startIcon={<Icon>upload</Icon>}
              onClick={handleImport}
              disabled={parsedData.length === 0}
            >
              Import {parsedData.length} Patients
            </Button>
          </>
        )}
        {activeStep === 2 && importResult && (
          <Button variant="contained" onClick={handleClose}>
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
