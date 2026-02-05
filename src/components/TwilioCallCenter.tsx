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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Phone,
  VoiceChat,
  Campaign,
  Person,
  Group,
  Emergency,
  RecordVoiceOver,
  PlayArrow,
  Stop,
} from '@mui/icons-material';

interface CallRecord {
  id: string;
  to: string;
  message: string;
  voice: string;
  status: 'queued' | 'calling' | 'completed' | 'failed';
  timestamp: Date;
  callSid?: string;
}

interface TeamMember {
  name: string;
  phone: string;
  role: string;
  priority: 'high' | 'medium' | 'low';
}

const TwilioCallCenter: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('woman');
  const [targetNumber, setTargetNumber] = useState('');
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [isCalling, setIsCalling] = useState(false);

  // NABH Team Members (from USER.md)
  const nabhTeam: TeamMember[] = [
    { name: 'Dr. Murali BK', phone: '+919373111709', role: 'CMD', priority: 'high' },
    { name: 'Isaac (NABH Consultant)', phone: '+917276510845', role: 'NABH Consultant', priority: 'high' },
    { name: 'Gaurav Agrawal', phone: '+919822202396', role: 'NABH Coordination', priority: 'high' },
    { name: 'Dr. Shiraz Khan', phone: '+919370914454', role: 'Quality Coordinator', priority: 'high' },
    { name: 'Dr. Sachin', phone: '+917208252712', role: 'Senior Doctor', priority: 'high' },
    { name: 'K J Shashank', phone: '+917620456896', role: 'Quality Manager/HR', priority: 'medium' },
    { name: 'Diksha', phone: '+918605300668', role: 'Front Office Manager', priority: 'medium' },
    { name: 'Neesha', phone: '+918007241707', role: 'Patient Experience', priority: 'medium' },
    { name: 'Shilpi', phone: '+916268716635', role: 'Infection Control', priority: 'medium' },
    { name: 'Abhishek', phone: '+919529991074', role: 'Pharmacist', priority: 'medium' },
    { name: 'Azhar', phone: '+919595585788', role: 'NABH Champion/MRD', priority: 'medium' },
    { name: 'Sonali', phone: '+917218750394', role: 'Clinical Audit', priority: 'medium' },
    { name: 'Viji Murali', phone: '+919158887857', role: 'Hospital Director', priority: 'high' },
    { name: 'Suraj Rajput', phone: '+919890230165', role: 'Infrastructure', priority: 'low' },
  ];

  const voiceOptions = [
    { value: 'woman', label: 'Woman (Standard)', description: 'Basic female voice (trial-friendly)' },
    { value: 'Polly.Raveena', label: 'Raveena (Indian)', description: 'Indian English female (premium)' },
    { value: 'Polly.Aditi', label: 'Aditi (Hindi+English)', description: 'Hindi + English female (premium)' },
    { value: 'man', label: 'Man (Standard)', description: 'Basic male voice (trial-friendly)' },
  ];

  const messageTemplates = {
    nabhReminder: {
      title: 'NABH Audit Reminder',
      message: 'Hello! This is your AI assistant with an important NABH preparation reminder. The audit is in 10 days. Please check WhatsApp for today\'s updates. Tomorrow 9 AM huddle is critical. Thank you!',
    },
    meetingAlert: {
      title: 'Meeting Alert',
      message: 'Good evening! Reminder for tomorrow\'s 9 AM morning huddle at Directors chamber. Please be on time for NABH preparation coordination. Good night!',
    },
    urgentUpdate: {
      title: 'Urgent NABH Update',
      message: 'Urgent NABH update! Critical objective element requires immediate attention. Please check the dashboard and respond immediately.',
    },
    trainingReminder: {
      title: 'Training Reminder',
      message: 'Important reminder: Please complete your pending NABH training modules. Code Blue, BMW, and Hand Hygiene training must be finished by tomorrow.',
    },
    evidenceRequest: {
      title: 'Evidence Upload Request',
      message: 'Hello! Please upload the pending evidence documents for your department. NABH audit is in 10 days and all evidence must be complete.',
    },
  };

  const makeCall = async (phone: string, message: string, voice: string = 'woman') => {
    setIsCalling(true);
    try {
      // Simulate API call to Twilio
      const callRecord: CallRecord = {
        id: Date.now().toString(),
        to: phone,
        message,
        voice,
        status: 'queued',
        timestamp: new Date(),
        callSid: `CA${Math.random().toString(36).substring(2, 15)}`,
      };

      setCallRecords(prev => [callRecord, ...prev]);

      // Simulate call progress
      setTimeout(() => {
        setCallRecords(prev => prev.map(record => 
          record.id === callRecord.id ? { ...record, status: 'calling' } : record
        ));
      }, 1000);

      setTimeout(() => {
        setCallRecords(prev => prev.map(record => 
          record.id === callRecord.id ? { ...record, status: 'completed' } : record
        ));
      }, 5000);

      console.log('Making call:', { phone, message, voice });
    } catch (error) {
      console.error('Call failed:', error);
    } finally {
      setIsCalling(false);
    }
  };

  const handleTemplateCall = async (templateKey: keyof typeof messageTemplates, phone?: string) => {
    const template = messageTemplates[templateKey];
    const targetPhone = phone || targetNumber;
    
    if (!targetPhone) {
      alert('Please select a team member or enter a phone number');
      return;
    }

    await makeCall(targetPhone, template.message, selectedVoice);
  };

  const handleCustomCall = async () => {
    if (!customMessage.trim() || !targetNumber) {
      alert('Please enter both message and phone number');
      return;
    }

    await makeCall(targetNumber, customMessage, selectedVoice);
    setCustomMessage('');
    setIsDialogOpen(false);
  };

  const broadcastToTeam = async (templateKey: keyof typeof messageTemplates, priority: 'all' | 'high' | 'medium' = 'all') => {
    const template = messageTemplates[templateKey];
    const targetMembers = priority === 'all' 
      ? nabhTeam 
      : nabhTeam.filter(member => priority === 'high' ? member.priority === 'high' : member.priority !== 'low');

    for (const member of targetMembers) {
      await makeCall(member.phone, template.message, selectedVoice);
      // Add delay between calls
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const getStatusColor = (status: CallRecord['status']) => {
    switch (status) {
      case 'queued': return 'warning';
      case 'calling': return 'info';
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Phone />
        NABH Call Center
        <Chip label="Twilio Powered" size="small" color="primary" />
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        🎯 <strong>10 days to NABH audit!</strong> Use voice calls for urgent coordination with department heads.
      </Alert>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚀 Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<Campaign />}
                onClick={() => handleTemplateCall('nabhReminder')}
                disabled={isCalling}
                sx={{ mb: 1 }}
              >
                Call Dr. Murali - NABH Reminder
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                startIcon={<RecordVoiceOver />}
                onClick={() => broadcastToTeam('meetingAlert', 'high')}
                disabled={isCalling}
                sx={{ mb: 1 }}
              >
                Broadcast Meeting Alert (High Priority)
              </Button>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<Emergency />}
                onClick={() => broadcastToTeam('urgentUpdate', 'all')}
                disabled={isCalling}
              >
                Emergency Broadcast (All Team)
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Voice Selection</InputLabel>
                <Select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  label="Voice Selection"
                >
                  {voiceOptions.map((voice) => (
                    <MenuItem key={voice.value} value={voice.value}>
                      {voice.label} - {voice.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<VoiceChat />}
                onClick={() => setIsDialogOpen(true)}
                disabled={isCalling}
              >
                Custom Call
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Team Directory */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Group />
                NABH Team Directory
              </Typography>
              <List dense>
                {nabhTeam.filter(member => member.priority === 'high').map((member, index) => (
                  <React.Fragment key={member.phone}>
                    <ListItem
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleTemplateCall('nabhReminder', member.phone)}
                          disabled={isCalling}
                          size="small"
                        >
                          <Phone />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={member.name}
                        secondary={`${member.role} • ${member.phone}`}
                      />
                      <Chip
                        label={member.priority}
                        size="small"
                        color={member.priority === 'high' ? 'error' : 'default'}
                        sx={{ mr: 1 }}
                      />
                    </ListItem>
                    {index < nabhTeam.filter(m => m.priority === 'high').length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📞 Recent Calls
              </Typography>
              {callRecords.length === 0 ? (
                <Typography color="text.secondary">No calls made yet</Typography>
              ) : (
                <List dense>
                  {callRecords.slice(0, 5).map((record, index) => (
                    <React.Fragment key={record.id}>
                      <ListItem>
                        <ListItemText
                          primary={record.to}
                          secondary={`${record.message.slice(0, 50)}... • ${record.voice}`}
                        />
                        <Chip
                          label={record.status}
                          size="small"
                          color={getStatusColor(record.status)}
                        />
                      </ListItem>
                      {index < Math.min(callRecords.length, 5) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Message Templates */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📝 Message Templates
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(messageTemplates).map(([key, template]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      {template.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                      {template.message.slice(0, 100)}...
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      onClick={() => handleTemplateCall(key as keyof typeof messageTemplates)}
                      disabled={isCalling}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Custom Call Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Make Custom Call</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Phone Number"
            value={targetNumber}
            onChange={(e) => setTargetNumber(e.target.value)}
            placeholder="+919373111709"
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Enter your custom message here..."
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Voice</InputLabel>
            <Select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              label="Voice"
            >
              {voiceOptions.map((voice) => (
                <MenuItem key={voice.value} value={voice.value}>
                  {voice.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCustomCall}
            variant="contained"
            disabled={isCalling || !customMessage.trim() || !targetNumber}
          >
            Make Call
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TwilioCallCenter;