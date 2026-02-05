import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Info as InfoIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Storage as StorageIcon,
  Remove as RemoveIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

export interface UserInputData {
  additionalInfo: string;
  specificData: string[];
  staffInvolved: string[];
  existingDocuments: string[];
  dates: {
    implementationDate?: string;
    reviewDate?: string;
    auditDate?: string;
  };
  departments: string[];
  compliance: {
    currentStatus: string;
    challenges: string;
    improvements: string;
  };
  context: string;
}

interface UserInputDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserInputData) => void;
  objectiveTitle?: string;
  objectiveCode?: string;
  evidenceType?: string;
}

// Common NABH staff members
const COMMON_STAFF = [
  'Dr. Shiraz (Quality Coordinator)',
  'Sonali (Clinical Audit Coordinator)', 
  'Gaurav (NABH Coordination Lead)',
  'Diksha (Front Office Manager)',
  'Abhishek (Pharmacist)',
  'Shilpi (Infection Control Nurse)',
  'Farsana (Head Nurse)',
  'K J Shashank (Quality Manager/HR)',
  'Azhar (NABH Champion/MRD)',
  'Dr. Sachin (Senior Doctor)',
  'Neesha (Patient Experience Coordinator)',
  'Nitin Bawane (Radiology Technician)',
];

// Hospital departments
const HOSPITAL_DEPARTMENTS = [
  'Quality Department',
  'Medical Department', 
  'Nursing Department',
  'Pharmacy',
  'Laboratory',
  'Radiology',
  'Operation Theater',
  'ICU/NICU',
  'Emergency Department',
  'Front Office',
  'Medical Records',
  'Housekeeping',
  'Administration',
  'Human Resources',
  'Finance',
];

function TabPanel(props: { children?: React.ReactNode; value: number; index: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`input-tabpanel-${index}`}
      aria-labelledby={`input-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export default function UserInputDialog({
  open,
  onClose,
  onSubmit,
  objectiveTitle,
  objectiveCode,
  evidenceType,
}: UserInputDialogProps) {
  const [tabValue, setTabValue] = useState(0);
  const [inputData, setInputData] = useState<UserInputData>({
    additionalInfo: '',
    specificData: [],
    staffInvolved: [],
    existingDocuments: [],
    dates: {},
    departments: [],
    compliance: {
      currentStatus: '',
      challenges: '',
      improvements: '',
    },
    context: '',
  });

  const [newDataPoint, setNewDataPoint] = useState('');
  const [newDocument, setNewDocument] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setInputData({
        additionalInfo: '',
        specificData: [],
        staffInvolved: [],
        existingDocuments: [],
        dates: {},
        departments: [],
        compliance: {
          currentStatus: '',
          challenges: '',
          improvements: '',
        },
        context: '',
      });
      setNewDataPoint('');
      setNewDocument('');
      setTabValue(0);
    }
  }, [open]);

  const handleAddDataPoint = () => {
    if (newDataPoint.trim()) {
      setInputData({
        ...inputData,
        specificData: [...inputData.specificData, newDataPoint.trim()],
      });
      setNewDataPoint('');
    }
  };

  const handleRemoveDataPoint = (index: number) => {
    setInputData({
      ...inputData,
      specificData: inputData.specificData.filter((_, i) => i !== index),
    });
  };

  const handleAddDocument = () => {
    if (newDocument.trim()) {
      setInputData({
        ...inputData,
        existingDocuments: [...inputData.existingDocuments, newDocument.trim()],
      });
      setNewDocument('');
    }
  };

  const handleRemoveDocument = (index: number) => {
    setInputData({
      ...inputData,
      existingDocuments: inputData.existingDocuments.filter((_, i) => i !== index),
    });
  };

  const handleStaffToggle = (staff: string) => {
    const isSelected = inputData.staffInvolved.includes(staff);
    if (isSelected) {
      setInputData({
        ...inputData,
        staffInvolved: inputData.staffInvolved.filter(s => s !== staff),
      });
    } else {
      setInputData({
        ...inputData,
        staffInvolved: [...inputData.staffInvolved, staff],
      });
    }
  };

  const handleDepartmentToggle = (dept: string) => {
    const isSelected = inputData.departments.includes(dept);
    if (isSelected) {
      setInputData({
        ...inputData,
        departments: inputData.departments.filter(d => d !== dept),
      });
    } else {
      setInputData({
        ...inputData,
        departments: [...inputData.departments, dept],
      });
    }
  };

  const handleSubmit = () => {
    onSubmit(inputData);
    onClose();
  };

  const hasAnyInput = () => {
    return (
      inputData.additionalInfo.trim() ||
      inputData.specificData.length > 0 ||
      inputData.staffInvolved.length > 0 ||
      inputData.existingDocuments.length > 0 ||
      Object.values(inputData.dates).some(date => date) ||
      inputData.departments.length > 0 ||
      inputData.compliance.currentStatus.trim() ||
      inputData.compliance.challenges.trim() ||
      inputData.compliance.improvements.trim() ||
      inputData.context.trim()
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <InfoIcon sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h6">Add Your Information to Evidence</Typography>
            {objectiveTitle && (
              <Typography variant="subtitle2" color="text.secondary">
                {objectiveCode ? `${objectiveCode}: ` : ''}{objectiveTitle}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Alert severity="info" sx={{ m: 2, mb: 0 }}>
          <Typography variant="body2">
            <strong>Enhance your evidence:</strong> Add any specific information, data, documents, or context you have 
            that should be incorporated into the evidence generation. This will make your evidence more accurate and personalized.
          </Typography>
        </Alert>

        {/* Tabs for different input categories */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="General Info" />
            <Tab label="Staff & Departments" />
            <Tab label="Data & Documents" />
            <Tab label="Compliance Status" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* General Information */}
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Additional Information"
              value={inputData.additionalInfo}
              onChange={(e) => setInputData({ ...inputData, additionalInfo: e.target.value })}
              placeholder="Any specific details, procedures, or information you want included in the evidence..."
              helperText="Describe any specific practices, procedures, or details unique to your hospital"
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Context & Background"
              value={inputData.context}
              onChange={(e) => setInputData({ ...inputData, context: e.target.value })}
              placeholder="Background context, current practices, or specific circumstances..."
              helperText="Provide context that will help generate more relevant evidence"
            />

            {/* Important Dates */}
            <Box>
              <Typography variant="subtitle1" mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon sx={{ fontSize: 18 }} />
                Important Dates
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Implementation Date"
                    value={inputData.dates.implementationDate || ''}
                    onChange={(e) => setInputData({
                      ...inputData,
                      dates: { ...inputData.dates, implementationDate: e.target.value }
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Last Review Date"
                    value={inputData.dates.reviewDate || ''}
                    onChange={(e) => setInputData({
                      ...inputData,
                      dates: { ...inputData.dates, reviewDate: e.target.value }
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Audit Date"
                    value={inputData.dates.auditDate || ''}
                    onChange={(e) => setInputData({
                      ...inputData,
                      dates: { ...inputData.dates, auditDate: e.target.value }
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Staff and Departments */}
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Staff Selection */}
            <Box>
              <Typography variant="subtitle1" mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon sx={{ fontSize: 18 }} />
                Staff Involved ({inputData.staffInvolved.length} selected)
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                <Grid container spacing={1}>
                  {COMMON_STAFF.map((staff) => (
                    <Grid item xs={12} sm={6} key={staff}>
                      <Chip
                        label={staff}
                        onClick={() => handleStaffToggle(staff)}
                        color={inputData.staffInvolved.includes(staff) ? 'primary' : 'default'}
                        variant={inputData.staffInvolved.includes(staff) ? 'filled' : 'outlined'}
                        size="small"
                        sx={{ width: '100%', justifyContent: 'flex-start' }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Box>

            {/* Department Selection */}
            <Box>
              <Typography variant="subtitle1" mb={1}>
                Departments Involved ({inputData.departments.length} selected)
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                <Grid container spacing={1}>
                  {HOSPITAL_DEPARTMENTS.map((dept) => (
                    <Grid item xs={12} sm={6} key={dept}>
                      <Chip
                        label={dept}
                        onClick={() => handleDepartmentToggle(dept)}
                        color={inputData.departments.includes(dept) ? 'secondary' : 'default'}
                        variant={inputData.departments.includes(dept) ? 'filled' : 'outlined'}
                        size="small"
                        sx={{ width: '100%', justifyContent: 'flex-start' }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Data and Documents */}
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Specific Data Points */}
            <Box>
              <Typography variant="subtitle1" mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StorageIcon sx={{ fontSize: 18 }} />
                Specific Data Points
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Add data point"
                  value={newDataPoint}
                  onChange={(e) => setNewDataPoint(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDataPoint()}
                  placeholder="e.g., 95% compliance rate, 24/7 availability, monthly reviews..."
                />
                <Button
                  variant="outlined"
                  onClick={handleAddDataPoint}
                  disabled={!newDataPoint.trim()}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              {inputData.specificData.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 150, overflow: 'auto' }}>
                  <List dense>
                    {inputData.specificData.map((data, index) => (
                      <ListItem key={index} secondaryAction={
                        <IconButton size="small" onClick={() => handleRemoveDataPoint(index)}>
                          <Remove />
                        </IconButton>
                      }>
                        <ListItemText primary={data} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>

            {/* Existing Documents */}
            <Box>
              <Typography variant="subtitle1" mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon sx={{ fontSize: 18 }} />
                Existing Documents/References
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Add document name"
                  value={newDocument}
                  onChange={(e) => setNewDocument(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDocument()}
                  placeholder="e.g., SOP-001 Admission Process, Quality Manual v2.1..."
                />
                <Button
                  variant="outlined"
                  onClick={handleAddDocument}
                  disabled={!newDocument.trim()}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              {inputData.existingDocuments.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 150, overflow: 'auto' }}>
                  <List dense>
                    {inputData.existingDocuments.map((doc, index) => (
                      <ListItem key={index} secondaryAction={
                        <IconButton size="small" onClick={() => handleRemoveDocument(index)}>
                          <Remove />
                        </IconButton>
                      }>
                        <ListItemText primary={doc} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Compliance Status */}
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Current Compliance Status"
              value={inputData.compliance.currentStatus}
              onChange={(e) => setInputData({
                ...inputData,
                compliance: { ...inputData.compliance, currentStatus: e.target.value }
              })}
              placeholder="Describe the current status of compliance for this objective..."
              helperText="What is currently being done? What systems are in place?"
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Challenges & Issues"
              value={inputData.compliance.challenges}
              onChange={(e) => setInputData({
                ...inputData,
                compliance: { ...inputData.compliance, challenges: e.target.value }
              })}
              placeholder="Any challenges, issues, or gaps that need to be addressed..."
              helperText="What obstacles have you encountered?"
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Improvements & Plans"
              value={inputData.compliance.improvements}
              onChange={(e) => setInputData({
                ...inputData,
                compliance: { ...inputData.compliance, improvements: e.target.value }
              })}
              placeholder="What improvements have been made or are planned..."
              helperText="What steps are being taken to improve compliance?"
            />
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose}>
          Skip & Use Default
        </Button>
        <Box display="flex" alignItems="center" gap={2}>
          {hasAnyInput() && (
            <Typography variant="caption" color="text.secondary">
              Information added will enhance your evidence
            </Typography>
          )}
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            startIcon={<AssignmentIcon />}
          >
            {hasAnyInput() ? 'Generate with My Info' : 'Generate Default Evidence'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}