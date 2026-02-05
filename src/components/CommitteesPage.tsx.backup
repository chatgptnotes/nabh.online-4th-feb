import { useState, useEffect, useRef } from 'react';
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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { NABH_TEAM, getHospitalInfo } from '../config/hospitalConfig';
import { extractFromDocument, extractCommitteeData, generateImprovedDocument } from '../services/documentExtractor';
import { useNABHStore } from '../store/nabhStore';

interface CommitteeMember {
  name: string;
  role: string;
  designation: string;
}

interface Meeting {
  id: string;
  date: string;
  agenda: string;
  minutes: string;
  attendees: string[];
  decisions: string[];
}

interface Committee {
  id: string;
  name: string;
  type: 'mandatory' | 'recommended' | 'custom';
  description: string;
  chairperson: string;
  members: CommitteeMember[];
  meetingFrequency: string;
  meetings: Meeting[];
  objectives: string[];
  createdAt: string;
}

const NABH_MANDATORY_COMMITTEES = [
  {
    name: 'Hospital Quality Committee',
    description: 'Oversees all quality improvement activities and monitors quality indicators',
    objectives: ['Monitor quality indicators', 'Review quality improvement projects', 'Ensure NABH compliance'],
    meetingFrequency: 'Monthly',
  },
  {
    name: 'Hospital Infection Control Committee',
    description: 'Monitors and controls hospital-acquired infections',
    objectives: ['Surveillance of HAIs', 'Antibiotic stewardship', 'Infection prevention training'],
    meetingFrequency: 'Monthly',
  },
  {
    name: 'Hospital Safety Committee',
    description: 'Ensures patient and staff safety across the hospital',
    objectives: ['Patient safety rounds', 'Incident analysis', 'Safety training'],
    meetingFrequency: 'Monthly',
  },
  {
    name: 'Medical Records Committee',
    description: 'Oversees medical records management and documentation standards',
    objectives: ['Medical records audit', 'Documentation standards', 'Record retention'],
    meetingFrequency: 'Quarterly',
  },
  {
    name: 'Pharmacy & Therapeutics Committee',
    description: 'Manages formulary and medication safety',
    objectives: ['Formulary management', 'Medication safety', 'ADR monitoring'],
    meetingFrequency: 'Quarterly',
  },
  {
    name: 'Blood Transfusion Committee',
    description: 'Oversees blood bank operations and transfusion practices',
    objectives: ['Blood utilization review', 'Transfusion reactions', 'Blood safety'],
    meetingFrequency: 'Quarterly',
  },
  {
    name: 'Ethics Committee',
    description: 'Addresses ethical issues in patient care',
    objectives: ['Ethics consultations', 'Policy development', 'Staff education'],
    meetingFrequency: 'As needed',
  },
  {
    name: 'Grievance Redressal Committee',
    description: 'Handles patient and staff complaints',
    objectives: ['Complaint resolution', 'Trend analysis', 'Service improvement'],
    meetingFrequency: 'Weekly',
  },
];

const UPLOAD_WORKFLOW_STEPS = ['Upload Document', 'Extract Data', 'Review & Edit', 'Generate SOP'];

export default function CommitteesPage() {
  const { selectedHospital } = useNABHStore();
  const hospitalConfig = getHospitalInfo(selectedHospital);
  
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);
  const [newCommittee, setNewCommittee] = useState({
    name: '',
    description: '',
    chairperson: '',
    meetingFrequency: 'Monthly',
    objectives: '',
  });
  const [newMeeting, setNewMeeting] = useState({
    date: new Date().toISOString().split('T')[0],
    agenda: '',
    minutes: '',
    attendees: [] as string[],
    decisions: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Upload workflow states
  const [uploadWorkflowStep, setUploadWorkflowStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [extractedCommitteeData, setExtractedCommitteeData] = useState<{
    name: string;
    description: string;
    objectives: string[];
    members: { name: string; role: string; designation: string }[];
    meetingFrequency: string;
    responsibilities: string[];
  } | null>(null);
  const [userSuggestions, setUserSuggestions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSOP, setGeneratedSOP] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load committees from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nabh_committees');
    if (saved) {
      setCommittees(JSON.parse(saved));
    } else {
      // Initialize with mandatory committees
      const initialCommittees: Committee[] = NABH_MANDATORY_COMMITTEES.map((c, i) => ({
        id: `committee_${i}`,
        name: c.name,
        type: 'mandatory' as const,
        description: c.description,
        chairperson: '',
        members: [],
        meetingFrequency: c.meetingFrequency,
        meetings: [],
        objectives: c.objectives,
        createdAt: new Date().toISOString(),
      }));
      setCommittees(initialCommittees);
    }
  }, []);

  // Save committees to localStorage
  useEffect(() => {
    if (committees.length > 0) {
      localStorage.setItem('nabh_committees', JSON.stringify(committees));
    }
  }, [committees]);

  const handleAddCommittee = () => {
    if (!newCommittee.name.trim()) {
      setSnackbar({ open: true, message: 'Please enter committee name', severity: 'error' });
      return;
    }

    const committee: Committee = {
      id: `committee_${Date.now()}`,
      name: newCommittee.name,
      type: 'custom',
      description: newCommittee.description,
      chairperson: newCommittee.chairperson,
      members: [],
      meetingFrequency: newCommittee.meetingFrequency,
      meetings: [],
      objectives: newCommittee.objectives.split('\n').filter(o => o.trim()),
      createdAt: new Date().toISOString(),
    };

    setCommittees([...committees, committee]);
    setIsAddDialogOpen(false);
    setNewCommittee({ name: '', description: '', chairperson: '', meetingFrequency: 'Monthly', objectives: '' });
    setSnackbar({ open: true, message: 'Committee added successfully', severity: 'success' });
  };

  const handleAddMeeting = () => {
    if (!selectedCommittee || !newMeeting.agenda.trim()) {
      setSnackbar({ open: true, message: 'Please enter meeting agenda', severity: 'error' });
      return;
    }

    const meeting: Meeting = {
      id: `meeting_${Date.now()}`,
      date: newMeeting.date,
      agenda: newMeeting.agenda,
      minutes: newMeeting.minutes,
      attendees: newMeeting.attendees,
      decisions: newMeeting.decisions.split('\n').filter(d => d.trim()),
    };

    setCommittees(prev => prev.map(c =>
      c.id === selectedCommittee.id
        ? { ...c, meetings: [...c.meetings, meeting] }
        : c
    ));

    setIsMeetingDialogOpen(false);
    setNewMeeting({ date: new Date().toISOString().split('T')[0], agenda: '', minutes: '', attendees: [], decisions: '' });
    setSnackbar({ open: true, message: 'Meeting added successfully', severity: 'success' });
  };

  const handleUpdateChairperson = (committeeId: string, chairperson: string) => {
    setCommittees(prev => prev.map(c =>
      c.id === committeeId ? { ...c, chairperson } : c
    ));
  };

  const handleAddMember = (committeeId: string, member: CommitteeMember) => {
    setCommittees(prev => prev.map(c =>
      c.id === committeeId
        ? { ...c, members: [...c.members, member] }
        : c
    ));
  };

  const handleDeleteCommittee = (id: string) => {
    setCommittees(prev => prev.filter(c => c.id !== id));
    setSnackbar({ open: true, message: 'Committee deleted', severity: 'success' });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mandatory': return 'error';
      case 'recommended': return 'warning';
      default: return 'default';
    }
  };

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
      // First extract text from the document
      const result = await extractFromDocument(file, 'committee');
      if (result.success && result.text) {
        setExtractedText(result.text);

        // Then extract structured committee data
        const committeeData = await extractCommitteeData(result.text);
        setExtractedCommitteeData(committeeData);
        setUploadWorkflowStep(2);
        setSnackbar({ open: true, message: 'Data extracted successfully', severity: 'success' });
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

  const handleGenerateSOP = async () => {
    if (!extractedText) {
      setSnackbar({ open: true, message: 'No extracted text to generate from', severity: 'error' });
      return;
    }

    setIsGenerating(true);
    try {
      const sop = await generateImprovedDocument(
        extractedText,
        'committee',
        userSuggestions,
        hospitalConfig.name
      );
      setGeneratedSOP(sop);
      setUploadWorkflowStep(3);
      setSnackbar({ open: true, message: 'SOP generated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error generating SOP:', error);
      setSnackbar({ open: true, message: 'Error generating SOP', severity: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateCommitteeFromExtracted = () => {
    if (!extractedCommitteeData?.name) {
      setSnackbar({ open: true, message: 'No committee data extracted', severity: 'error' });
      return;
    }

    const committee: Committee = {
      id: `committee_${Date.now()}`,
      name: extractedCommitteeData.name,
      type: 'custom',
      description: extractedCommitteeData.description || '',
      chairperson: extractedCommitteeData.members.find(m => m.role.toLowerCase().includes('chair'))?.name || '',
      members: extractedCommitteeData.members,
      meetingFrequency: extractedCommitteeData.meetingFrequency || 'Monthly',
      meetings: [],
      objectives: extractedCommitteeData.objectives || [],
      createdAt: new Date().toISOString(),
    };

    setCommittees([...committees, committee]);
    resetUploadWorkflow();
    setSnackbar({ open: true, message: 'Committee created from extracted data', severity: 'success' });
  };

  const resetUploadWorkflow = () => {
    setIsUploadDialogOpen(false);
    setUploadWorkflowStep(0);
    setUploadedFile(null);
    setExtractedText('');
    setExtractedCommitteeData(null);
    setUserSuggestions('');
    setGeneratedSOP('');
    setActiveTab(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadSOP = () => {
    if (!generatedSOP) return;

    const blob = new Blob([generatedSOP], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${extractedCommitteeData?.name || 'Committee'}_SOP.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintSOP = () => {
    if (!generatedSOP) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatedSOP);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary">
            Hospital Committees
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage NABH mandatory and hospital committees
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Icon>upload_file</Icon>}
            onClick={() => setIsUploadDialogOpen(true)}
          >
            Upload SOP
          </Button>
          <Button
            variant="contained"
            startIcon={<Icon>add</Icon>}
            onClick={() => setIsAddDialogOpen(true)}
          >
            Add Committee
          </Button>
        </Box>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={handleFileUpload}
        />
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
            <Typography variant="h4" color="primary" fontWeight={700}>{committees.length}</Typography>
            <Typography variant="body2" color="text.secondary">Total Committees</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50' }}>
            <Typography variant="h4" color="error" fontWeight={700}>
              {committees.filter(c => c.type === 'mandatory').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Mandatory</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
            <Typography variant="h4" color="success.main" fontWeight={700}>
              {committees.reduce((acc, c) => acc + c.meetings.length, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">Total Meetings</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
            <Typography variant="h4" color="warning.main" fontWeight={700}>
              {committees.filter(c => !c.chairperson).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Need Chairperson</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Committees List */}
      {committees.map(committee => (
        <Accordion key={committee.id} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Icon color="primary">groups</Icon>
              <Box sx={{ flexGrow: 1 }}>
                <Typography fontWeight={600}>{committee.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {committee.chairperson || 'No chairperson assigned'} | {committee.meetingFrequency} meetings
                </Typography>
              </Box>
              <Chip label={committee.type} size="small" color={getTypeColor(committee.type)} />
              <Chip label={`${committee.meetings.length} meetings`} size="small" variant="outlined" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Description</Typography>
                  <Typography variant="body2" color="text.secondary">{committee.description}</Typography>

                  <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Objectives</Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {committee.objectives.map((obj, i) => (
                      <li key={i}><Typography variant="body2">{obj}</Typography></li>
                    ))}
                  </ul>

                  <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Chairperson</Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={committee.chairperson}
                    onChange={(e) => handleUpdateChairperson(committee.id, e.target.value)}
                    slotProps={{ select: { native: true } }}
                  >
                    <option value="">Select Chairperson</option>
                    {NABH_TEAM.filter(m => m.role !== 'Department Staff').map(m => (
                      <option key={m.name} value={m.name}>{m.name} - {m.role}</option>
                    ))}
                  </TextField>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">Members ({committee.members.length})</Typography>
                    <Button
                      size="small"
                      startIcon={<Icon>person_add</Icon>}
                      onClick={() => {
                        const name = NABH_TEAM[Math.floor(Math.random() * NABH_TEAM.length)];
                        handleAddMember(committee.id, { name: name.name, role: 'Member', designation: name.designation });
                      }}
                    >
                      Add Member
                    </Button>
                  </Box>
                  {committee.members.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No members added yet</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {committee.members.map((m, i) => (
                        <Chip key={i} label={`${m.name} (${m.role})`} size="small" />
                      ))}
                    </Box>
                  )}
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">Recent Meetings</Typography>
                    <Button
                      size="small"
                      startIcon={<Icon>add</Icon>}
                      onClick={() => { setSelectedCommittee(committee); setIsMeetingDialogOpen(true); }}
                    >
                      Add Meeting
                    </Button>
                  </Box>
                  {committee.meetings.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No meetings recorded yet</Typography>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Agenda</TableCell>
                            <TableCell>Attendees</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {committee.meetings.slice(-3).map(meeting => (
                            <TableRow key={meeting.id}>
                              <TableCell>{new Date(meeting.date).toLocaleDateString()}</TableCell>
                              <TableCell>{meeting.agenda.substring(0, 50)}...</TableCell>
                              <TableCell>{meeting.attendees.length}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Paper>
              </Grid>
              <Grid size={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  {committee.type === 'custom' && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Icon>delete</Icon>}
                      onClick={() => handleDeleteCommittee(committee.id)}
                    >
                      Delete
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Add Committee Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon color="primary">group_add</Icon>
            Add New Committee
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Committee Name"
            value={newCommittee.name}
            onChange={(e) => setNewCommittee({ ...newCommittee, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description"
            value={newCommittee.description}
            onChange={(e) => setNewCommittee({ ...newCommittee, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            select
            label="Chairperson"
            value={newCommittee.chairperson}
            onChange={(e) => setNewCommittee({ ...newCommittee, chairperson: e.target.value })}
            sx={{ mb: 2 }}
            slotProps={{ select: { native: true } }}
          >
            <option value="">Select Chairperson</option>
            {NABH_TEAM.filter(m => m.role !== 'Department Staff').map(m => (
              <option key={m.name} value={m.name}>{m.name} - {m.role}</option>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Meeting Frequency"
            value={newCommittee.meetingFrequency}
            onChange={(e) => setNewCommittee({ ...newCommittee, meetingFrequency: e.target.value })}
            sx={{ mb: 2 }}
            slotProps={{ select: { native: true } }}
          >
            <option value="Weekly">Weekly</option>
            <option value="Bi-weekly">Bi-weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="As needed">As needed</option>
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Objectives (one per line)"
            value={newCommittee.objectives}
            onChange={(e) => setNewCommittee({ ...newCommittee, objectives: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCommittee}>Add Committee</Button>
        </DialogActions>
      </Dialog>

      {/* Add Meeting Dialog */}
      <Dialog open={isMeetingDialogOpen} onClose={() => setIsMeetingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon color="primary">event</Icon>
            Add Meeting - {selectedCommittee?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="date"
            label="Meeting Date"
            value={newMeeting.date}
            onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Agenda"
            value={newMeeting.agenda}
            onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Minutes of Meeting"
            value={newMeeting.minutes}
            onChange={(e) => setNewMeeting({ ...newMeeting, minutes: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Key Decisions (one per line)"
            value={newMeeting.decisions}
            onChange={(e) => setNewMeeting({ ...newMeeting, decisions: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle2" gutterBottom>Attendees</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {NABH_TEAM.map(m => (
              <Chip
                key={m.name}
                label={m.name}
                size="small"
                variant={newMeeting.attendees.includes(m.name) ? 'filled' : 'outlined'}
                color={newMeeting.attendees.includes(m.name) ? 'primary' : 'default'}
                onClick={() => {
                  setNewMeeting(prev => ({
                    ...prev,
                    attendees: prev.attendees.includes(m.name)
                      ? prev.attendees.filter(a => a !== m.name)
                      : [...prev.attendees, m.name]
                  }));
                }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsMeetingDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddMeeting}>Add Meeting</Button>
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

      {/* Upload SOP Dialog */}
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
            Upload & Extract Committee SOP
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
                  Click to Upload Committee SOP Document
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports PDF, Word (DOC/DOCX), and Images (PNG/JPG)
                </Typography>
              </Paper>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Upload your existing committee SOP, charter, or any committee-related document to extract and improve it.
              </Typography>
            </Box>
          )}

          {/* Step 1: Extracting */}
          {uploadWorkflowStep === 1 && isExtracting && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Extracting data from {uploadedFile?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This may take a moment...
              </Typography>
              <LinearProgress sx={{ mt: 3, maxWidth: 400, mx: 'auto' }} />
            </Box>
          )}

          {/* Step 2: Review & Edit Extracted Data */}
          {uploadWorkflowStep === 2 && extractedCommitteeData && (
            <Box>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                <Tab label="Extracted Data" icon={<Icon>data_object</Icon>} iconPosition="start" />
                <Tab label="Raw Text" icon={<Icon>text_snippet</Icon>} iconPosition="start" />
              </Tabs>

              {activeTab === 0 && (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>Committee Name</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={extractedCommitteeData.name}
                        onChange={(e) => setExtractedCommitteeData({ ...extractedCommitteeData, name: e.target.value })}
                      />

                      <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }} gutterBottom>Description</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        value={extractedCommitteeData.description}
                        onChange={(e) => setExtractedCommitteeData({ ...extractedCommitteeData, description: e.target.value })}
                      />

                      <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }} gutterBottom>Meeting Frequency</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        select
                        slotProps={{ select: { native: true } }}
                        value={extractedCommitteeData.meetingFrequency}
                        onChange={(e) => setExtractedCommitteeData({ ...extractedCommitteeData, meetingFrequency: e.target.value })}
                      >
                        <option value="Weekly">Weekly</option>
                        <option value="Bi-weekly">Bi-weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="As needed">As needed</option>
                      </TextField>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Objectives ({extractedCommitteeData.objectives.length})
                      </Typography>
                      <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                        {extractedCommitteeData.objectives.map((obj, i) => (
                          <Chip key={i} label={obj} size="small" sx={{ m: 0.5 }} onDelete={() => {
                            const newObjs = [...extractedCommitteeData.objectives];
                            newObjs.splice(i, 1);
                            setExtractedCommitteeData({ ...extractedCommitteeData, objectives: newObjs });
                          }} />
                        ))}
                      </Box>

                      <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }} gutterBottom>
                        Members ({extractedCommitteeData.members.length})
                      </Typography>
                      <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                        {extractedCommitteeData.members.map((m, i) => (
                          <Chip
                            key={i}
                            label={`${m.name} - ${m.role}`}
                            size="small"
                            sx={{ m: 0.5 }}
                            color={m.role.toLowerCase().includes('chair') ? 'primary' : 'default'}
                          />
                        ))}
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid size={12}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'warning.50' }}>
                      <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                        <Icon sx={{ verticalAlign: 'middle', mr: 1 }}>lightbulb</Icon>
                        Improvement Suggestions (Optional)
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Add any specific improvements you want in the generated SOP (e.g., 'Add infection control responsibilities', 'Include quarterly review procedures')"
                        value={userSuggestions}
                        onChange={(e) => setUserSuggestions(e.target.value)}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && (
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {extractedText}
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* Step 3: Generated SOP */}
          {uploadWorkflowStep === 3 && generatedSOP && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
                <Button size="small" startIcon={<Icon>print</Icon>} onClick={handlePrintSOP}>
                  Print
                </Button>
                <Button size="small" startIcon={<Icon>download</Icon>} onClick={handleDownloadSOP}>
                  Download HTML
                </Button>
              </Box>
              <Paper
                variant="outlined"
                sx={{ maxHeight: 500, overflow: 'auto', bgcolor: 'white' }}
              >
                <div dangerouslySetInnerHTML={{ __html: generatedSOP }} />
              </Paper>
            </Box>
          )}

          {/* Generating indicator */}
          {isGenerating && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Generating Improved Committee SOP
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Creating NABH-compliant committee documentation...
              </Typography>
              <LinearProgress sx={{ mt: 3, maxWidth: 400, mx: 'auto' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={resetUploadWorkflow}>Cancel</Button>
          {uploadWorkflowStep === 2 && (
            <>
              <Button
                variant="outlined"
                startIcon={<Icon>group_add</Icon>}
                onClick={handleCreateCommitteeFromExtracted}
              >
                Create Committee
              </Button>
              <Button
                variant="contained"
                startIcon={<Icon>auto_awesome</Icon>}
                onClick={handleGenerateSOP}
                disabled={isGenerating}
              >
                Generate Improved SOP
              </Button>
            </>
          )}
          {uploadWorkflowStep === 3 && (
            <Button
              variant="contained"
              startIcon={<Icon>group_add</Icon>}
              onClick={handleCreateCommitteeFromExtracted}
            >
              Create Committee & Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
