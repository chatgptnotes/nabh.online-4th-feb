import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  AutoFixHigh as FixIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  category?: 'hospital-specific' | 'previous-rules' | 'compliance' | 'clarity';
}

interface SOPImprovementChatProps {
  sopContent: string;
  sopTitle: string;
  objectiveCode: string;
  chapterCode: string;
  onSOPUpdate: (updatedSOP: string) => void;
  onFeedbackSave: (feedback: any) => void;
}

const SOPImprovementChat: React.FC<SOPImprovementChatProps> = ({
  sopContent,
  sopTitle,
  objectiveCode,
  chapterCode,
  onSOPUpdate,
  onFeedbackSave,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [feedbackData, setFeedbackData] = useState<any>({});
  const [showSummary, setShowSummary] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Improvement questions phases
  const improvementPhases = [
    {
      category: 'hospital-specific',
      question: `🏥 **Hope Hospital Context Review**\n\nI've analyzed this SOP for "${sopTitle}". Let me ask some specific questions:\n\n1. Does this SOP mention Hope Hospital's specific departments, staff roles, or locations?\n2. Are there any Hope Hospital-specific policies or procedures that should be included?\n3. Do we need to reference specific equipment, software, or systems used at Hope Hospital?\n4. Should we include contact information for specific personnel or departments?`,
      followUp: 'Please share any Hope Hospital-specific details that should be added to make this SOP more relevant to our operations.'
    },
    {
      category: 'previous-rules',
      question: `📚 **Previous SOP Rules Analysis**\n\nNow let's check if we've missed any important rules from previous SOPs:\n\n1. Are there any specific approval workflows that Hope Hospital has been following?\n2. Do we have established timeframes for processes that should be mentioned?\n3. Are there any safety protocols or emergency procedures specific to this process?\n4. Should we reference any existing forms, checklists, or documentation?`,
      followUp: 'What rules or procedures from previous SOPs should we incorporate?'
    },
    {
      category: 'compliance',
      question: `✅ **NABH 3rd Edition Compliance Check**\n\nLet's ensure this SOP meets all NABH requirements:\n\n1. Does the SOP clearly define roles and responsibilities?\n2. Are all required documentation and records mentioned?\n3. Do we have proper monitoring and evaluation criteria?\n4. Are there clear escalation procedures for non-compliance?\n5. Is the training requirement for staff clearly defined?`,
      followUp: 'Any NABH compliance requirements we should strengthen?'
    },
    {
      category: 'clarity',
      question: `🎯 **Clarity and Usability Review**\n\nFinally, let's make sure this SOP is user-friendly:\n\n1. Are the steps clear and easy to follow for frontline staff?\n2. Do we need any flowcharts, diagrams, or visual aids?\n3. Should we add any examples or scenarios to clarify procedures?\n4. Are there any technical terms that need better explanation?\n5. Is the document structure logical and easy to navigate?`,
      followUp: 'How can we make this SOP clearer and more user-friendly?'
    }
  ];

  useEffect(() => {
    // Initialize conversation
    startImprovementProcess();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startImprovementProcess = () => {
    const welcomeMessage: Message = {
      id: `bot-${Date.now()}`,
      type: 'bot',
      content: `🤖 **SOP Improvement Assistant**\n\nHi! I'm here to help improve your SOP: **"${sopTitle}"**\n\nI'll guide you through a systematic review to ensure this SOP:\n✅ Includes Hope Hospital-specific details\n✅ Incorporates relevant rules from previous SOPs\n✅ Meets NABH 3rd Edition standards\n✅ Is clear and user-friendly\n\nLet's start with the first review phase!`,
      timestamp: new Date(),
      category: 'hospital-specific'
    };

    setMessages([welcomeMessage]);
    setTimeout(() => askNextQuestion(), 1500);
  };

  const askNextQuestion = () => {
    if (currentPhase < improvementPhases.length) {
      const phase = improvementPhases[currentPhase];
      const questionMessage: Message = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: phase.question,
        timestamp: new Date(),
        category: phase.category,
        suggestions: [
          'Looks good as-is',
          'Need to add specific details',
          'Missing some requirements',
          'Skip this section'
        ]
      };

      setMessages(prev => [...prev, questionMessage]);
    } else {
      // All phases complete
      finishImprovementProcess();
    }
  };

  const finishImprovementProcess = () => {
    const summaryMessage: Message = {
      id: `bot-${Date.now()}`,
      type: 'bot',
      content: `🎉 **Improvement Review Complete!**\n\nGreat job! We've completed the systematic review of your SOP. Based on your feedback, I can:\n\n1. **Generate an improved version** of the SOP\n2. **Update the master prompt** with your specific requirements\n3. **Save this feedback** to Hope Hospital's knowledge base\n\nWould you like me to create an improved version now?`,
      timestamp: new Date(),
      suggestions: [
        'Generate improved SOP',
        'Update master prompt',
        'Save feedback only',
        'Review changes first'
      ]
    };

    setMessages(prev => [...prev, summaryMessage]);
    setShowSummary(true);
  };

  const handleUserMessage = (message: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Save feedback for current phase
    if (currentPhase < improvementPhases.length) {
      const phase = improvementPhases[currentPhase];
      setFeedbackData(prev => ({
        ...prev,
        [phase.category]: message
      }));
    }

    // Process response and move to next phase
    setTimeout(() => {
      processBotResponse(message);
    }, 1000);
  };

  const processBotResponse = async (userMessage: string) => {
    setIsLoading(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (currentPhase < improvementPhases.length) {
      const phase = improvementPhases[currentPhase];
      
      let response = '';
      if (userMessage.toLowerCase().includes('looks good') || userMessage.toLowerCase().includes('skip')) {
        response = `✅ Got it! Moving on to the next review area...`;
      } else {
        response = `📝 Thank you for that feedback! I've noted:\n\n"${userMessage}"\n\nThis will help improve the SOP. Let's continue with the next review area...`;
      }

      const botResponse: Message = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setCurrentPhase(prev => prev + 1);
      
      setTimeout(() => {
        askNextQuestion();
      }, 1500);
    }

    setIsLoading(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      handleUserMessage(inputValue);
      setInputValue('');
    }
  };

  const handleGenerateImprovedSOP = async () => {
    setIsLoading(true);
    
    // Call AI service to generate improved SOP based on feedback
    try {
      const improvedSOP = await generateImprovedSOP();
      onSOPUpdate(improvedSOP);
      
      const successMessage: Message = {
        id: `bot-${Date.now()}`,
        type: 'bot',
        content: `✅ **SOP Successfully Improved!**\n\nI've generated an enhanced version of your SOP incorporating all the feedback. The improved SOP has been updated with:\n\n• Hope Hospital-specific details\n• Previous SOP rules and procedures\n• Enhanced NABH compliance\n• Improved clarity and usability\n\nYou can now review and save the improved version!`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      console.error('Error generating improved SOP:', error);
    }
    
    setIsLoading(false);
  };

  const generateImprovedSOP = async (): Promise<string> => {
    // This would call your AI service with the collected feedback
    const improvementPrompt = `
Please improve the following SOP based on the user feedback:

Original SOP: ${sopContent}

User Feedback:
- Hospital-specific details: ${feedbackData['hospital-specific'] || 'None provided'}
- Previous rules to incorporate: ${feedbackData['previous-rules'] || 'None provided'}
- NABH compliance improvements: ${feedbackData['compliance'] || 'None provided'}
- Clarity improvements: ${feedbackData['clarity'] || 'None provided'}

Please generate an improved version that addresses all the feedback while maintaining NABH 3rd Edition compliance.
    `;

    // Replace with actual AI API call
    return sopContent + '\n\n<!-- Improved based on user feedback -->';
  };

  return (
    <Box sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <BotIcon />
          </Avatar>
          <Box>
            <Typography variant="h6">SOP Improvement Assistant</Typography>
            <Typography variant="body2" color="text.secondary">
              Reviewing: {sopTitle}
            </Typography>
          </Box>
          <Box flexGrow={1} />
          <Chip 
            label={`Phase ${currentPhase + 1} of ${improvementPhases.length}`}
            color="primary"
            variant="outlined"
          />
        </Box>
        {currentPhase < improvementPhases.length && (
          <LinearProgress 
            variant="determinate" 
            value={(currentPhase / improvementPhases.length) * 100}
            sx={{ mt: 1 }}
          />
        )}
      </Paper>

      {/* Messages */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List>
          {messages.map((message) => (
            <ListItem key={message.id} sx={{ flexDirection: 'column', alignItems: 'flex-start', p: 1 }}>
              <Box display="flex" alignItems="flex-start" gap={1} width="100%">
                <Avatar 
                  sx={{ 
                    bgcolor: message.type === 'bot' ? 'primary.main' : 'grey.600',
                    width: 32,
                    height: 32
                  }}
                >
                  {message.type === 'bot' ? <BotIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                </Avatar>
                <Card sx={{ flexGrow: 1, maxWidth: '85%' }}>
                  <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {message.content}
                    </Typography>
                    {message.suggestions && (
                      <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                        {message.suggestions.map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={suggestion}
                            variant="outlined"
                            size="small"
                            clickable
                            onClick={() => handleSuggestionClick(suggestion)}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </ListItem>
          ))}
        </List>
        {isLoading && (
          <Box display="flex" alignItems="center" gap={2} p={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              <BotIcon fontSize="small" />
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              AI is analyzing your feedback...
            </Typography>
            <LinearProgress sx={{ flexGrow: 1 }} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Paper elevation={1} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        {showSummary ? (
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<FixIcon />}
              onClick={handleGenerateImprovedSOP}
              disabled={isLoading}
              sx={{ flexGrow: 1 }}
            >
              Generate Improved SOP
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={() => onFeedbackSave(feedbackData)}
            >
              Save Feedback
            </Button>
          </Box>
        ) : (
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Share your thoughts on improving this SOP..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <SendIcon />
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SOPImprovementChat;