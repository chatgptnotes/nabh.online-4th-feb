import { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionActions from '@mui/material/AccordionActions';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CardMedia from '@mui/material/CardMedia';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useNABHStore } from '../store/nabhStore';
import { getHospitalInfo, getNABHCoordinator, NABH_ASSESSOR_PROMPT } from '../config/hospitalConfig';
import { getClaudeApiKey, callGeminiAPI, getGeminiApiKey } from '../lib/supabase';
import { generateDocumentNumber, getFormattedDate, getReviewDate } from '../utils/documentNumbering';
import {
  generateInfographic,
  svgToDataUrl,
  availableColorSchemes,
  type InfographicTemplate,
  type ColorScheme,
} from '../services/infographicGenerator';
import { getRelevantData } from '../services/hopeHospitalDatabase';
import { saveGeneratedEvidence, loadEvidenceById } from '../services/objectiveStorage';

// Expandable TextField styles
const expandableTextFieldSx = {
  '& .MuiInputBase-root': {
    resize: 'vertical',
    overflow: 'auto',
    minHeight: '120px',
  },
  '& .MuiInputBase-inputMultiline': {
    resize: 'vertical',
    overflow: 'auto !important',
  },
};

// Hospital configuration interface
interface HospitalConfig {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  qualityCoordinator: string;
  qualityCoordinatorDesignation: string;
  logo: string;
}

// Signatory data interface
interface SignatoryData {
  preparedBy: { name: string; designation: string; date: string };
  reviewedBy: { name: string; designation: string; date: string };
  approvedBy: { name: string; designation: string; date: string };
}

const nabhCoordinator = getNABHCoordinator();

// NOTE: We don't initialize this statically anymore because the selected hospital can change.
// Instead, we initialize state in the component.

const defaultListPrompt = NABH_ASSESSOR_PROMPT;

const getContentPrompt = (config: HospitalConfig, objectiveCode: string) => `You are an expert in NABH (National Accreditation Board for Hospitals and Healthcare Providers) accreditation documentation for ${config.name}.

Generate a complete HTML document for the selected evidence item in ENGLISH ONLY (internal document).

IMPORTANT: Generate the output as a complete, valid HTML document with embedded CSS styling. The document must be modern, professional, and print-ready.

Use this HTML template structure:

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>[Document Title] - ${config.name}</title>
  <style>
    html { height: 100%; overflow-y: auto; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; line-height: 1.6; color: #333; padding: 2px 20px 20px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px solid #1565C0; padding-bottom: 2px; margin-bottom: 5px; }
    .logo-area { width: 350px; height: 80px; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; }
    .logo-area img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .hospital-name { font-size: 24px; font-weight: bold; color: #1565C0; margin: 10px 0 5px; }
    .hospital-address { font-size: 11px; color: #666; }
    .doc-title { background: #1565C0; color: white; padding: 12px; font-size: 16px; font-weight: bold; text-align: center; margin: 20px 0; border-radius: 5px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .info-table th, .info-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .info-table th { background: #f5f5f5; font-weight: 600; width: 25%; }
    .auth-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .auth-table th { background: #1565C0; color: white; padding: 10px; text-align: center; }
    .auth-table td { border: 1px solid #ddd; padding: 10px; text-align: center; vertical-align: top; min-height: 80px; }
    .section { margin: 20px 0; }
    .section-title { background: #e3f2fd; padding: 8px 12px; font-weight: bold; color: #1565C0; border-left: 4px solid #1565C0; margin-bottom: 10px; }
    .section-content { padding: 10px 15px; }
    .procedure-step { margin: 10px 0; padding: 10px; background: #fafafa; border-radius: 5px; }
    .step-number { display: inline-block; width: 25px; height: 25px; background: #1565C0; color: white; border-radius: 50%; text-align: center; line-height: 25px; margin-right: 10px; font-weight: bold; }
    .data-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    .data-table th { background: #1565C0; color: white; padding: 10px; text-align: left; }
    .data-table td { border: 1px solid #ddd; padding: 8px; }
    .data-table tr:nth-child(even) { background: #f9f9f9; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #1565C0; text-align: center; font-size: 10px; color: #666; }
    .revision-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; }
    .revision-table th { background: #455a64; color: white; padding: 8px; }
    .revision-table td { border: 1px solid #ddd; padding: 8px; }
    .stamp-area { border: 2px dashed #ccc; padding: 20px; text-align: center; margin: 20px 0; color: #999; }
    .objective-line { font-size: 12px; color: #333; margin: 15px 0; font-weight: 500; }
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-area"><img src="https://www.nabh.online/assets/hope-hospital-logo.png" alt="${config.name} Logo" /></div>
  </div>

  <div class="objective-line">[OBJECTIVE_CODE_AND_TITLE]</div>

  <div class="doc-title">[DOCUMENT TITLE]</div>

  <table class="info-table">
    <tr><th>Document No</th><td>${generateDocumentNumber(objectiveCode)}</td><th>Version</th><td>1.0</td></tr>
    <tr><th>Department</th><td>[Department]</td><th>Category</th><td>[Policy/SOP/Record]</td></tr>
    <tr><th>Effective Date</th><td>${getFormattedDate()}</td><th>Review Date</th><td>${getReviewDate()}</td></tr>
  </table>

  <table class="auth-table">
    <tr><th>PREPARED BY</th><th>REVIEWED BY</th><th>APPROVED BY</th></tr>
    <tr>
      <td>Name: Sonali Kakde<br>Designation: Clinical Audit Coordinator<br>Date: 29/12/2025<br><br>Signature:<br><img src="/Sonali's signature.png" alt="Sonali Kakde Signature" style="height: 50px; max-width: 120px; object-fit: contain;"></td>
      <td>Name: Gaurav Agrawal<br>Designation: Hospital Administrator<br>Date: 29/12/2025<br><br>Signature:<br><img src="/Gaurav's signature.png" alt="Gaurav Agrawal Signature" style="height: 50px; max-width: 120px; object-fit: contain;"></td>
      <td>Name: Dr. Shiraz Khan<br>Designation: NABH Coordinator / Administrator<br>Date: 29/12/2025<br><br>Signature:<br><img src="/Dr shiraz's signature.png" alt="Dr. Shiraz Khan Signature" style="height: 50px; max-width: 120px; object-fit: contain;"></td>
    </tr>
  </table>

  [MAIN CONTENT - Use sections with .section, .section-title, .section-content classes]
  [Use .data-table for any tables]
  [Use .procedure-step and .step-number for procedures]

  <table class="revision-table">
    <tr><th>Version</th><th>Date</th><th>Description</th><th>Changed By</th></tr>
    <tr><td>1.0</td><td>[Date]</td><td>Initial Release</td><td>[Name]</td></tr>
  </table>

  <div class="stamp-area">[HOSPITAL STAMP AREA]</div>

  <div class="footer">
    <strong>${config.name}</strong> | ${config.address}<br>
    Phone: ${config.phone} | Email: ${config.email} | Website: ${config.website}<br>
    This is a controlled document. Unauthorized copying or distribution is prohibited.
  </div>
</body>
</html>

Generate the complete HTML with all sections filled in based on the evidence item provided.`;

// Check if evidence is training-related
const isTrainingEvidence = (evidenceText: string): boolean => {
  const lowerText = evidenceText.toLowerCase();
  const trainingKeywords = [
    'training', 'trained', 'education', 'orientation', 'induction',
    'workshop', 'session', 'awareness program', 'skill development',
    'capacity building', 'competency', 'cme', 'cne', 'cpd'
  ];
  return trainingKeywords.some(keyword => lowerText.includes(keyword));
};

// Training-specific prompt for 5-document package
const getTrainingPrompt = (config: HospitalConfig) => `You are an expert in NABH training documentation for ${config.name}.

Generate a COMPLETE TRAINING EVIDENCE PACKAGE as a SINGLE HTML document with 5 sections (use page-break-after: always between sections).

IMPORTANT: The output must contain ALL 5 documents in ONE HTML file.

Use this structure:

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Training Evidence - ${config.name}</title>
  <style>
    @page { margin: 15mm; size: A4; }
    body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #000; max-width: 800px; margin: 0 auto; padding: 20px; }
    .page { page-break-after: always; padding-bottom: 20px; }
    .page:last-child { page-break-after: auto; }
    .header { text-align: center; margin-bottom: 15px; }
    .logo { max-width: 220px; margin: 0 auto 10px; display: block; }
    .title { font-size: 20px; font-weight: bold; text-align: center; margin: 20px 0; }
    .subtitle { font-size: 16px; text-decoration: underline; text-align: center; margin: 10px 0; }
    .date-line { text-align: right; margin: 15px 0; }
    .message { margin: 20px 0; line-height: 1.8; }
    .info-block { margin: 15px 0; }
    .info-block p { margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; font-weight: bold; }
    .signature-block { text-align: right; margin-top: 40px; line-height: 1.8; }
    .footer { margin-top: 25px; padding-top: 10px; border-top: 1px solid #000; font-size: 10px; text-align: center; color: #333; }
    .section-title { font-weight: bold; font-size: 14px; margin: 20px 0 10px; color: #1565C0; border-bottom: 2px solid #1565C0; padding-bottom: 5px; }
    .highlight-box { background: #e3f2fd; padding: 12px; border-left: 4px solid #1565C0; margin: 15px 0; }
    .question { margin: 15px 0; padding: 10px; background: #fafafa; }
    .correct { color: #4caf50; font-weight: bold; }
    .pass { color: #4caf50; font-weight: bold; }
    .fail { color: #f44336; font-weight: bold; }
    .summary-box { background: #e8f5e9; padding: 12px; margin: 15px 0; }
    .doc-label { background: #1565C0; color: white; padding: 8px 15px; font-weight: bold; margin: 20px 0 15px; display: inline-block; }
  </style>
</head>
<body>

<!-- DOCUMENT 1: TRAINING CIRCULAR -->
<div class="page">
  <div class="doc-label">DOCUMENT 1: TRAINING CIRCULAR</div>
  <div class="header"><img src="https://www.nabh.online/assets/hope-hospital-logo.png" alt="Hope Hospital Logo" class="logo"></div>
  <div class="title">Circular For Training</div>
  <div class="subtitle">[TRAINING TOPIC]</div>
  <div class="date-line">Date: [CIRCULAR DATE - 1 day before training]</div>
  <div class="message">This is to inform all staff that the following training for <strong>[TRAINING TOPIC]</strong> will be conducted on <strong>[TRAINING DATE]</strong></div>
  <table>
    <tr><th>Sr.No.</th><th>Topics</th><th>Trainer</th><th>Training Time</th></tr>
    <tr><td>1.</td><td>[TRAINING TOPIC]</td><td>Dr. B.K. Murali</td><td>11:30 AM</td></tr>
  </table>
  <div class="signature-block">Gaurav Agrawal<br><strong>Administrator</strong></div>
  <div class="footer"><strong>${config.name}</strong> ${config.address}<br>Phone: ${config.phone} | E-mail: ${config.email} | Website: ${config.website}</div>
</div>

<!-- DOCUMENT 2: ATTENDANCE SHEET -->
<div class="page">
  <div class="doc-label">DOCUMENT 2: ATTENDANCE SHEET</div>
  <div class="header"><img src="https://www.nabh.online/assets/hope-hospital-logo.png" alt="Hope Hospital Logo" class="logo"></div>
  <div class="title">Attendance sheet</div>
  <div class="info-block">
    <p><strong>Date:</strong> [TRAINING DATE] &nbsp;&nbsp; <strong>Time:</strong> 11:30 AM</p>
    <p><strong>Topics:</strong> [TRAINING TOPIC] &nbsp;&nbsp; <strong>Trainer:</strong> Dr. B.K. Murali</p>
  </div>
  <table>
    <tr><th style="width:40px">Sr.</th><th>Name</th><th>Designation</th><th>Department</th><th style="width:80px">Signature</th></tr>
    <tr><td>1</td><td>Dr. B.K. Murali</td><td>CMD</td><td>Admin</td><td></td></tr>
    <tr><td>2</td><td>Dr. Shiraz Khan</td><td>Quality Co-ordinator</td><td>ICU</td><td></td></tr>
    <tr><td>3</td><td>Gaurav Agrawal</td><td>Administrator</td><td>Admin</td><td></td></tr>
    <tr><td>4</td><td>Dr. Afzal Sheikh</td><td>RMO</td><td>ICU</td><td></td></tr>
    <tr><td>5</td><td>Dr. Suhash Tiple</td><td>Consultant</td><td>ICU</td><td></td></tr>
    <tr><td>6</td><td>Dr. Sachin Gathibande</td><td>RMO</td><td>ICU</td><td></td></tr>
    <tr><td>7</td><td>Dr. Swapnil Charpe</td><td>RMO</td><td>Casualty</td><td></td></tr>
    <tr><td>8</td><td>Dr. Sharad Kawale</td><td>RMO</td><td>General Ward</td><td></td></tr>
    <tr><td>9</td><td>Brother Chandraprakash Bisen</td><td>ICN</td><td>ICU</td><td></td></tr>
    <tr><td>10</td><td>Sister Farzana Khan</td><td>Head Nurse</td><td>ICU</td><td></td></tr>
    <tr><td>11</td><td>Brother Ajay Meshram</td><td>Nursing Staff</td><td>Casualty</td><td></td></tr>
    <tr><td>12</td><td>Shashank Upgade</td><td>HR Attendant</td><td>Admin</td><td></td></tr>
    <tr><td>13</td><td>Aman Rajak</td><td>Fire Safety Officer</td><td>Safety</td><td></td></tr>
    <tr><td>14</td><td>Roma Kangwani</td><td>Physiotherapist</td><td>Physiotherapy</td><td></td></tr>
    <tr><td>15</td><td>Nitin Bawane</td><td>X-Ray Technician</td><td>Radiology</td><td></td></tr>
    <tr><td>16</td><td>Apeksha Wandre</td><td>OT Technician</td><td>OT</td><td></td></tr>
    <tr><td>17</td><td>Shruti Uikey</td><td>OT Technician</td><td>OT</td><td></td></tr>
    <tr><td>18</td><td>Digesh Bisen</td><td>Lab Technician</td><td>Laboratory</td><td></td></tr>
    <tr><td>19</td><td>Rachana Rathore</td><td>Lab Technician</td><td>Laboratory</td><td></td></tr>
    <tr><td>20</td><td>Nisha Sharma</td><td>Receptionist</td><td>Front Office</td><td></td></tr>
    <tr><td>21</td><td>Ruchika Jambhulkar</td><td>Pharmacist</td><td>Pharmacy</td><td></td></tr>
    <tr><td>22</td><td>Tejash Akhare</td><td>Pharmacist</td><td>Pharmacy</td><td></td></tr>
    <tr><td>23</td><td>Jagruti Tembhare</td><td>Billing Staff</td><td>Billing</td><td></td></tr>
    <tr><td>24</td><td>Azhar Khan</td><td>Billing Staff</td><td>Billing</td><td></td></tr>
    <tr><td>25</td><td>Asha Sakhare</td><td>Aya</td><td>Housekeeping</td><td></td></tr>
    <tr><td>26</td><td>Urmila Lautkar</td><td>Aya</td><td>Housekeeping</td><td></td></tr>
    <tr><td>27</td><td>Kartik Jangade</td><td>Wardboy</td><td>Ward</td><td></td></tr>
    <tr><td>28</td><td>Afroz Khan</td><td>Security Guard</td><td>Security</td><td></td></tr>
  </table>
  <div class="footer"><strong>${config.name}</strong> ${config.address}<br>Phone: ${config.phone} | E-mail: ${config.email} | Website: ${config.website}</div>
</div>

<!-- DOCUMENT 3: TRAINING CONTENT -->
<div class="page">
  <div class="doc-label">DOCUMENT 3: TRAINING CONTENT</div>
  <div class="header"><img src="https://www.nabh.online/assets/hope-hospital-logo.png" alt="Hope Hospital Logo" class="logo"></div>
  <div class="title">Training Content</div>
  <div class="info-block">
    <p><strong>Topic:</strong> [TRAINING TOPIC] | <strong>Date:</strong> [TRAINING DATE] | <strong>Duration:</strong> 1.5 Hours</p>
  </div>
  <div class="section-title">Learning Objectives</div>
  <ul>
    <li>[Objective 1 - specific to the training topic]</li>
    <li>[Objective 2]</li>
    <li>[Objective 3]</li>
    <li>[Objective 4]</li>
    <li>[Objective 5]</li>
  </ul>
  <div class="section-title">Key Concepts</div>
  <div class="highlight-box">
    [Key points related to training topic - bullet points or summary]
  </div>
  <div class="section-title">Key Takeaways</div>
  <ol>
    <li>[Takeaway 1]</li>
    <li>[Takeaway 2]</li>
    <li>[Takeaway 3]</li>
    <li>[Takeaway 4]</li>
    <li>[Takeaway 5]</li>
  </ol>
  <div class="signature-block">Prepared By: <strong>Dr. B.K. Murali</strong>, CMD</div>
  <div class="footer"><strong>${config.name}</strong> ${config.address}<br>Phone: ${config.phone} | E-mail: ${config.email} | Website: ${config.website}</div>
</div>

<!-- DOCUMENT 4: ASSESSMENT -->
<div class="page">
  <div class="doc-label">DOCUMENT 4: TRAINING ASSESSMENT</div>
  <div class="header"><img src="https://www.nabh.online/assets/hope-hospital-logo.png" alt="Hope Hospital Logo" class="logo"></div>
  <div class="title">Training Assessment</div>
  <div class="info-block">
    <p><strong>Topic:</strong> [TRAINING TOPIC] | <strong>Date:</strong> [TRAINING DATE] | <strong>Pass Criteria:</strong> ≥70% (7/10)</p>
  </div>

  [Generate 5 MCQ questions relevant to the training topic with correct answers marked]

  <div class="section-title">Assessment Results</div>
  <table>
    <tr><th>Sr.</th><th>Name</th><th>Designation</th><th>Score</th><th>%</th><th>Result</th></tr>
    <tr><td>1</td><td>Dr. Shiraz Khan</td><td>Quality Co-ordinator</td><td>10/10</td><td>100%</td><td class="pass">Pass</td></tr>
    <tr><td>2</td><td>Gaurav Agrawal</td><td>Administrator</td><td>9/10</td><td>90%</td><td class="pass">Pass</td></tr>
    <tr><td>3</td><td>Sister Farzana Khan</td><td>Head Nurse</td><td>9/10</td><td>90%</td><td class="pass">Pass</td></tr>
    <tr><td>4</td><td>Apeksha Wandre</td><td>OT Technician</td><td>8/10</td><td>80%</td><td class="pass">Pass</td></tr>
    <tr><td>5</td><td>Digesh Bisen</td><td>Lab Technician</td><td>7/10</td><td>70%</td><td class="pass">Pass</td></tr>
    <tr><td>6</td><td>Ruchika Jambhulkar</td><td>Pharmacist</td><td>8/10</td><td>80%</td><td class="pass">Pass</td></tr>
    <tr><td>7</td><td>Nisha Sharma</td><td>Receptionist</td><td>7/10</td><td>70%</td><td class="pass">Pass</td></tr>
    <tr><td>8</td><td>Kartik Jangade</td><td>Wardboy</td><td>7/10</td><td>70%</td><td class="pass">Pass</td></tr>
  </table>
  <div class="summary-box"><strong>Summary:</strong> Total Assessed: 8 | Average: 8.1/10 (81%) | Pass Rate: 100%</div>
  <div class="footer"><strong>${config.name}</strong> ${config.address}<br>Phone: ${config.phone} | E-mail: ${config.email} | Website: ${config.website}</div>
</div>

<!-- DOCUMENT 5: COMPLETION REPORT -->
<div class="page">
  <div class="doc-label">DOCUMENT 5: TRAINING COMPLETION REPORT</div>
  <div class="header"><img src="https://www.nabh.online/assets/hope-hospital-logo.png" alt="Hope Hospital Logo" class="logo"></div>
  <div class="title">Training Completion Report</div>
  <div class="date-line"><strong>Report Date:</strong> [1 day after training date]</div>
  <div class="highlight-box">
    <strong>Executive Summary:</strong> Training on "[TRAINING TOPIC]" was successfully conducted on [TRAINING DATE] with 93% attendance and 100% pass rate in assessment.
  </div>
  <div class="section-title">Training Details</div>
  <table>
    <tr><th>Topic</th><td>[TRAINING TOPIC]</td></tr>
    <tr><th>Date & Time</th><td>[TRAINING DATE], 11:30 AM - 1:00 PM</td></tr>
    <tr><th>Venue</th><td>Conference Room, ${config.name}</td></tr>
    <tr><th>Trainer</th><td>Dr. B.K. Murali, CMD</td></tr>
    <tr><th>Duration</th><td>1.5 Hours</td></tr>
  </table>
  <div class="section-title">Statistics</div>
  <table>
    <tr><th>Total Invited</th><td>28</td><th>Present</th><td>26 (93%)</td><th>Absent</th><td>2 (7%)</td></tr>
  </table>
  <table>
    <tr><th>Assessed</th><td>8</td><th>Avg Score</th><td>8.1/10</td><th>Pass Rate</th><td>100%</td></tr>
  </table>
  <div class="section-title">Recommendations</div>
  <ol>
    <li>Conduct training for absent staff within 7 days</li>
    <li>Schedule quarterly refresher training</li>
    <li>[Additional recommendation based on topic]</li>
  </ol>
  <div class="section-title">Approval</div>
  <table>
    <tr>
      <td style="text-align:center; border:none;"><strong>Prepared By</strong><br>Dr. Shiraz Khan<br>Quality Co-ordinator</td>
      <td style="text-align:center; border:none;"><strong>Reviewed By</strong><br>Dr. B.K. Murali<br>CMD</td>
      <td style="text-align:center; border:none;"><strong>Approved By</strong><br>Gaurav Agrawal<br>Administrator</td>
    </tr>
  </table>
  <div class="footer"><strong>${config.name}</strong> ${config.address}<br>Phone: ${config.phone} | E-mail: ${config.email} | Website: ${config.website}</div>
</div>

</body>
</html>

Generate this COMPLETE 5-document training package. Fill in all [BRACKETS] with appropriate content based on the training topic provided. Use realistic dates (3-6 months ago). Generate relevant MCQ questions for the specific training topic.`;

// Visual evidence types for image generation
const visualEvidenceTypes = [
  { value: 'signage', label: 'Signage / Display Board', icon: 'signpost' },
  { value: 'poster', label: 'Awareness Poster', icon: 'image' },
  { value: 'flyer', label: 'Information Flyer', icon: 'description' },
  { value: 'banner', label: 'Banner / Standee', icon: 'view_day' },
  { value: 'infographic', label: 'Infographic', icon: 'analytics' },
  { value: 'checklist', label: 'Visual Checklist', icon: 'checklist' },
];

interface EvidenceItem {
  id: string;
  text: string;
  selected: boolean;
}

interface GeneratedContent {
  evidenceItem: string;
  content: string;
  editableText: string;
}

interface GeneratedImage {
  prompt: string;
  imageUrl: string;
  type: string;
}

// Helper function to extract editable text from HTML content
function extractTextFromHTML(html: string): string {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Remove script and style elements
  const scripts = tempDiv.querySelectorAll('script, style');
  scripts.forEach(el => el.remove());

  // Get text content with structure preserved
  const sections: string[] = [];

  // Extract title
  const title = tempDiv.querySelector('.doc-title, h1, title');
  if (title) {
    sections.push(`TITLE: ${title.textContent?.trim() || ''}`);
    sections.push('');
  }

  // Extract document info table
  const infoTable = tempDiv.querySelector('.info-table');
  if (infoTable) {
    sections.push('DOCUMENT INFORMATION:');
    const rows = infoTable.querySelectorAll('tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('th, td');
      const rowText: string[] = [];
      cells.forEach((cell, i) => {
        if (i % 2 === 0) {
          rowText.push(`${cell.textContent?.trim()}: `);
        } else {
          rowText[rowText.length - 1] += cell.textContent?.trim();
        }
      });
      sections.push(rowText.join(' | '));
    });
    sections.push('');
  }

  // Extract sections
  const sectionElements = tempDiv.querySelectorAll('.section');
  sectionElements.forEach(section => {
    const sectionTitle = section.querySelector('.section-title');
    const sectionContent = section.querySelector('.section-content');

    if (sectionTitle) {
      sections.push(`## ${sectionTitle.textContent?.trim()}`);
    }
    if (sectionContent) {
      sections.push(sectionContent.textContent?.trim() || '');
    }
    sections.push('');
  });

  // Extract tables
  const tables = tempDiv.querySelectorAll('.data-table');
  tables.forEach(table => {
    const headers = table.querySelectorAll('th');
    const headerRow = Array.from(headers).map(h => h.textContent?.trim()).join(' | ');
    if (headerRow) {
      sections.push(headerRow);
      sections.push('-'.repeat(headerRow.length));
    }

    const rows = table.querySelectorAll('tbody tr, tr:not(:first-child)');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length > 0) {
        sections.push(Array.from(cells).map(c => c.textContent?.trim()).join(' | '));
      }
    });
    sections.push('');
  });

  // If no structured content found, get all text
  if (sections.length < 3) {
    return tempDiv.textContent?.trim() || html;
  }

  return sections.join('\n');
}

// Signatory data interface
interface SignatoryData {
  preparedBy: { name: string; designation: string; date: string };
  reviewedBy: { name: string; designation: string; date: string };
  approvedBy: { name: string; designation: string; date: string };
}

// Helper function to update HTML content with edited text
function updateHTMLWithText(
  _originalHTML: string,
  editedText: string,
  hospitalConfig: { name: string; address: string; qualityCoordinator: string; qualityCoordinatorDesignation: string; phone: string; email: string; website: string },
  _signatories?: SignatoryData
): string {
  // Parse the edited text to extract sections
  const lines = editedText.split('\n');

  let title = '';
  const sections: { title: string; content: string }[] = [];
  let currentSection = { title: '', content: '' };
  let inSection = false;

  lines.forEach(line => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('TITLE:')) {
      title = trimmedLine.replace('TITLE:', '').trim();
    } else if (trimmedLine.startsWith('## ')) {
      if (inSection && currentSection.title) {
        sections.push({ ...currentSection });
      }
      currentSection = { title: trimmedLine.replace('## ', ''), content: '' };
      inSection = true;
    } else if (inSection && trimmedLine) {
      currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
    }
  });

  if (inSection && currentSection.title) {
    sections.push(currentSection);
  }

  // Generate updated HTML
  const sectionHTML = sections.map(s => `
    <div class="section">
      <div class="section-title">${s.title}</div>
      <div class="section-content">${s.content.split('\n').map(p => `<p>${p}</p>`).join('')}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title || 'Evidence Document'} - ${hospitalConfig.name}</title>
  <style>
    html { height: 100%; overflow-y: auto; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; line-height: 1.6; color: #333; padding: 2px 20px 20px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px solid #1565C0; padding-bottom: 2px; margin-bottom: 5px; }
    .logo-area { width: 350px; height: 80px; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; }
    .logo-area img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .hospital-name { font-size: 24px; font-weight: bold; color: #1565C0; margin: 10px 0 5px; }
    .hospital-address { font-size: 11px; color: #666; }
    .doc-title { background: #1565C0; color: white; padding: 12px; font-size: 16px; font-weight: bold; text-align: center; margin: 20px 0; border-radius: 5px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .info-table th, .info-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .info-table th { background: #f5f5f5; font-weight: 600; width: 25%; }
    .section { margin: 20px 0; }
    .section-title { background: #e3f2fd; padding: 8px 12px; font-weight: bold; color: #1565C0; border-left: 4px solid #1565C0; margin-bottom: 10px; }
    .section-content { padding: 10px 15px; }
    .section-content p { margin-bottom: 8px; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #1565C0; text-align: center; font-size: 10px; color: #666; }
    .auth-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .auth-table th { background: #1565C0; color: white; padding: 10px; text-align: center; }
    .auth-table td { border: 1px solid #ddd; padding: 10px; text-align: center; vertical-align: top; min-height: 80px; }
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-area">HOSPITAL<br>LOGO</div>
    <div class="hospital-name">${hospitalConfig.name}</div>
    <div class="hospital-address">${hospitalConfig.address}</div>
  </div>

  <div class="doc-title">${title || 'Evidence Document'}</div>

  <table class="info-table">
    <tr><th>Document No</th><td>DOC-001</td><th>Version</th><td>1.0</td></tr>
    <tr><th>Effective Date</th><td>29/12/2025</td><th>Review Date</th><td>29/12/2025</td></tr>
  </table>

  ${sectionHTML}

  <table class="auth-table">
    <tr><th>PREPARED BY</th><th>REVIEWED BY</th><th>APPROVED BY</th></tr>
    <tr>
      <td>Name: Sonali Kakde<br>Designation: Clinical Audit Coordinator<br>Date: 29/12/2025<br><br>Signature:<br><img src="/Sonali's signature.png" alt="Sonali Kakde Signature" style="height: 50px; max-width: 120px; object-fit: contain;"></td>
      <td>Name: Gaurav Agrawal<br>Designation: Hospital Administrator<br>Date: 29/12/2025<br><br>Signature:<br><img src="/Gaurav's signature.png" alt="Gaurav Agrawal Signature" style="height: 50px; max-width: 120px; object-fit: contain;"></td>
      <td>Name: Dr. Shiraz Khan<br>Designation: NABH Coordinator / Administrator<br>Date: 29/12/2025<br><br>Signature:<br><img src="/Dr shiraz's signature.png" alt="Dr. Shiraz Khan Signature" style="height: 50px; max-width: 120px; object-fit: contain;"></td>
    </tr>
  </table>

  <div class="footer">
    <strong>${hospitalConfig.name}</strong> | ${hospitalConfig.address}<br>
    Phone: ${hospitalConfig.phone} | Email: ${hospitalConfig.email} | Website: ${hospitalConfig.website}<br>
    This is a controlled document. Unauthorized copying or distribution is prohibited.
  </div>
</body>
</html>`;
}

// Gemini API call for text generation using secure backend proxy
async function callGeminiText(apiKey: string, prompt: string, userMessage: string): Promise<string> {
  try {
    const data = await callGeminiAPI(`${prompt}\n\n${userMessage}`, 0.7, 8192);
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (err: any) {
    throw new Error(err.message || 'Failed to generate content');
  }
}

// Claude API call for text generation
async function callClaudeText(apiKey: string, prompt: string, userMessage: string): Promise<string> {
  // Validate API key
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Claude API key is not configured. Please add VITE_CLAUDE_API_KEY to your .env file and restart the development server.');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\n${userMessage}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;

      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your VITE_CLAUDE_API_KEY in the .env file.');
      } else if (response.status === 403) {
        throw new Error('API access forbidden. The API key may not have the required permissions or CORS may be blocking the request.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to Claude API. Please check your internet connection.');
    }
    throw err;
  }
}

export default function AIEvidenceGenerator() {
  const { chapters, selectedHospital, selectedEvidenceForCreation, selectedEvidenceObjectiveCode, clearSelectedEvidenceForCreation } = useNABHStore();
  const currentHospital = getHospitalInfo(selectedHospital);
  
  const [activeTab, setActiveTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedObjective, setSelectedObjective] = useState('');
  const [description, setDescription] = useState('');
  const [listPrompt, setListPrompt] = useState(defaultListPrompt);
  
  // Initialize config from store instead of static default
  const [hospitalConfig, setHospitalConfig] = useState<HospitalConfig>({
    name: currentHospital.name,
    address: currentHospital.address,
    phone: currentHospital.phone,
    email: currentHospital.email,
    website: currentHospital.website,
    qualityCoordinator: nabhCoordinator.name,
    qualityCoordinatorDesignation: nabhCoordinator.designation,
    logo: currentHospital.logo,
  });

  // Update local state when global hospital selection changes
  // But only if user hasn't manually edited the local config
  const [hasManualConfigEdits, setHasManualConfigEdits] = useState(false);
  
  if (hospitalConfig.name !== currentHospital.name && !hasManualConfigEdits) {
     setHospitalConfig({
      name: currentHospital.name,
      address: currentHospital.address,
      phone: currentHospital.phone,
      email: currentHospital.email,
      website: currentHospital.website,
      qualityCoordinator: nabhCoordinator.name,
      qualityCoordinatorDesignation: nabhCoordinator.designation,
      logo: currentHospital.logo,
    });
  }

  // API keys from environment variables
  const claudeApiKey = getClaudeApiKey();
  const geminiApiKey = getGeminiApiKey();
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [generatedContents, setGeneratedContents] = useState<GeneratedContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [error, setError] = useState('');
  const [contentProgress, setContentProgress] = useState({ current: 0, total: 0 });
  const [showHospitalConfig, setShowHospitalConfig] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Visual evidence state
  const [visualType, setVisualType] = useState('signage');
  const [visualTopic, setVisualTopic] = useState('');
  const [visualLanguage, setVisualLanguage] = useState('English');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedVisualColorScheme, setSelectedVisualColorScheme] = useState<ColorScheme>('healthcare-blue');

  // Document view mode state (for each document: 0 = HTML preview, 1 = Edit text)
  const [documentViewModes, setDocumentViewModes] = useState<Record<number, number>>({});

  // Save document state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  // Track saved documents: index -> saved document ID
  const [savedDocuments, setSavedDocuments] = useState<Record<number, string>>({});

  // Editable preview dialog state
  const [editablePreviewOpen, setEditablePreviewOpen] = useState(false);
  const [editablePreviewIndex, setEditablePreviewIndex] = useState<number | null>(null);
  const editableIframeRef = useRef<HTMLIFrameElement>(null);

  // Fixed static signatories for all documents - Date: 29 December 2025
  const fixedDate = '29/12/2025';
  const preparedBy = { name: 'Sonali Kakde', designation: 'Clinical Audit Coordinator', date: fixedDate };
  const reviewedBy = { name: 'Gaurav Agrawal', designation: 'Hospital Administrator', date: fixedDate };
  const approvedBy = { name: 'Dr. Shiraz Khan', designation: 'Quality Coordinator', date: fixedDate };

  // Auto-populate from store if navigated from ObjectiveDetailPage
  useEffect(() => {
    if (selectedEvidenceForCreation && selectedEvidenceForCreation.length > 0) {
      const items: EvidenceItem[] = selectedEvidenceForCreation.map((item, index) => ({
        id: item.id || `evidence-${index + 1}`,
        text: item.text,
        selected: item.selected,
      }));
      setEvidenceItems(items);
      setActiveStep(1); // Skip to Step 2 (Select Evidences)

      // CRITICAL: Auto-select the objective based on the stored objective code
      if (selectedEvidenceObjectiveCode) {
        // Find the objective ID from the code
        let foundObjectiveId: string | null = null;
        for (const chapter of chapters) {
          const matchingObjective = chapter.objectives.find(obj => obj.code === selectedEvidenceObjectiveCode);
          if (matchingObjective) {
            foundObjectiveId = matchingObjective.id;
            setSelectedChapter(chapter.id);
            break;
          }
        }
        if (foundObjectiveId) {
          setSelectedObjective(foundObjectiveId);
          console.log('[AI Generator] Auto-selected objective:', selectedEvidenceObjectiveCode);
        }
      }

      clearSelectedEvidenceForCreation(); // Clear after use
    }
  }, [selectedEvidenceForCreation, selectedEvidenceObjectiveCode, clearSelectedEvidenceForCreation, chapters]);

  const selectedChapterData = chapters.find(c => c.id === selectedChapter);
  const objectives = selectedChapterData?.objectives || [];

  const steps = ['Generate Evidence List', 'Select Evidences', 'Generate Evidence Content'];

  const handleChapterChange = (chapterId: string) => {
    setSelectedChapter(chapterId);
    setSelectedObjective('');
    setDescription('');
  };

  const handleObjectiveChange = (objectiveId: string) => {
    setSelectedObjective(objectiveId);
    const objective = objectives.find(o => o.id === objectiveId);
    if (objective) {
      setDescription(objective.description);
    }
  };

  const handleHospitalConfigChange = (field: keyof HospitalConfig, value: string) => {
    const newConfig = { ...hospitalConfig, [field]: value };
    setHospitalConfig(newConfig);
    setHasManualConfigEdits(true);
    // Removed local storage persistence to prefer store-based context switching
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      handleHospitalConfigChange('logo', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const parseEvidenceList = (text: string): EvidenceItem[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const items: EvidenceItem[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.match(/^(\d+[.):]|-|\*|•)/)) {
        items.push({
          id: `evidence-${index}`,
          text: trimmed,
          selected: false,
        });
      }
    });

    return items;
  };

  const handleGenerateList = async () => {
    if (!description.trim()) {
      setError('Please enter the objective element description');
      return;
    }

    setIsLoading(true);
    setError('');
    setEvidenceItems([]);
    setGeneratedContents([]);

    try {
      let generatedText: string;

      // Try Gemini first, fallback to Claude
      if (geminiApiKey) {
        try {
          generatedText = await callGeminiText(
            geminiApiKey,
            listPrompt,
            `Objective Element Description:\n\n${description}`
          );
        } catch (geminiErr) {
          console.warn('Gemini failed, trying Claude:', geminiErr);
          if (claudeApiKey) {
            generatedText = await callClaudeText(
              claudeApiKey,
              listPrompt,
              `Objective Element Description:\n\n${description}`
            );
          } else {
            throw geminiErr;
          }
        }
      } else if (claudeApiKey) {
        generatedText = await callClaudeText(
          claudeApiKey,
          listPrompt,
          `Objective Element Description:\n\n${description}`
        );
      } else {
        throw new Error('No API key configured. Please configure either Gemini or Claude API key.');
      }

      const items = parseEvidenceList(generatedText);
      setEvidenceItems(items);

      if (items.length > 0) {
        setActiveStep(1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating evidence list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEvidence = (id: string) => {
    setEvidenceItems(items =>
      items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleSelectAll = () => {
    const allSelected = evidenceItems.every(item => item.selected);
    setEvidenceItems(items =>
      items.map(item => ({ ...item, selected: !allSelected }))
    );
  };

  const selectedCount = evidenceItems.filter(item => item.selected).length;

  const handleGenerateContent = async () => {
    const selectedItems = evidenceItems.filter(item => item.selected);

    if (selectedItems.length === 0) {
      setError('Please select at least one evidence item');
      return;
    }

    // Get objective code for document numbering
    const selectedObj = objectives.find(o => o.id === selectedObjective);
    const objectiveCode = selectedObj?.code || 'GENERAL';

    setIsGeneratingContent(true);
    setError('');
    setGeneratedContents([]);
    setContentProgress({ current: 0, total: selectedItems.length });
    setActiveStep(2);

    const contents: GeneratedContent[] = [];

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      setContentProgress({ current: i + 1, total: selectedItems.length });

      // Use training-specific prompt for training-related evidence
      const contentPrompt = isTrainingEvidence(item.text)
        ? getTrainingPrompt(hospitalConfig)
        : getContentPrompt(hospitalConfig, objectiveCode);

      // Fetch real patient/staff data from nabh_patients table
      const relevantData = await getRelevantData(item.text);

      // Build data context with real patient data
      let dataContext = '';

      if (relevantData.patients && relevantData.patients.length > 0) {
        dataContext += '\n\n=== REAL PATIENT DATA FROM DATABASE (Use these EXACT values) ===\n';
        relevantData.patients.forEach((p: { visit_id: string; patient_name: string; diagnosis?: string | null; admission_date?: string | null; discharge_date?: string | null; status: string }, idx: number) => {
          dataContext += `Patient ${idx + 1}:\n`;
          dataContext += `  - Visit ID/UHID: ${p.visit_id}\n`;
          dataContext += `  - Patient Name: ${p.patient_name}\n`;
          dataContext += `  - Diagnosis: ${p.diagnosis || 'General'}\n`;
          dataContext += `  - Admission Date: ${p.admission_date || 'N/A'}\n`;
          dataContext += `  - Discharge Date: ${p.discharge_date || 'N/A'}\n`;
          dataContext += `  - Status: ${p.status}\n\n`;
        });
      }

      if (relevantData.staff && relevantData.staff.length > 0) {
        dataContext += '\n=== REAL STAFF DATA FROM DATABASE (Use these EXACT values) ===\n';
        relevantData.staff.forEach((s: { name: string; role: string; designation: string; department: string }, idx: number) => {
          dataContext += `Staff ${idx + 1}:\n`;
          dataContext += `  - Name: ${s.name}\n`;
          dataContext += `  - Role: ${s.role}\n`;
          dataContext += `  - Designation: ${s.designation}\n`;
          dataContext += `  - Department: ${s.department}\n\n`;
        });
      }

      // Add consultant/doctor data to prompt
      if (relevantData.consultants && relevantData.consultants.length > 0) {
        dataContext += '\n=== VISITING CONSULTANTS / DOCTORS (Use ONLY these names for doctors) ===\n';
        dataContext += 'CRITICAL: Do NOT invent doctor names. ONLY use doctors from this list:\n\n';
        relevantData.consultants.forEach((c: { sr_no: number; name: string; department: string; qualification?: string | null; registration_no?: string | null }, idx: number) => {
          dataContext += `Doctor ${idx + 1}:\n`;
          dataContext += `  - Name: ${c.name}\n`;
          dataContext += `  - Department: ${c.department}\n`;
          dataContext += `  - Qualification: ${c.qualification || 'N/A'}\n`;
          dataContext += `  - Registration No: ${c.registration_no || 'N/A'}\n\n`;
        });
        dataContext += 'DO NOT create fake doctor names like "Dr. Sharma", "Dr. Verma", "Dr. Gupta", "Dr. Khan", "Dr. Patel", "Dr. Singh".\n';
        dataContext += 'DO NOT create fake nurse names like "Nurse Patel", "Nurse Kumar", "Nurse Singh", "Nurse Yadav".\n';
        dataContext += 'Only use the doctor names listed above.\n';
      }

      // Always add signatory and date instructions
      dataContext += '\n\nCRITICAL SIGNATORY & DATE INSTRUCTIONS:';
      dataContext += '\n1. For PREPARED BY section: ALWAYS use "Sonali Kakde" with designation "Clinical Audit Coordinator" and date "29/12/2025".';
      dataContext += '\n2. For REVIEWED BY section: ALWAYS use "Gaurav Agrawal" with designation "Hospital Administrator" and date "29/12/2025".';
      dataContext += '\n3. For APPROVED BY section: ALWAYS use "Dr. Shiraz Khan" with designation "Quality Coordinator / Administrator" and date "29/12/2025".';
      dataContext += '\n4. For Effective Date: ALWAYS use "29/12/2025". For Review Date: ALWAYS use "29/12/2025".';
      dataContext += '\n5. Do NOT use placeholder text like "[PREPARED BY NAME]", "[REVIEWED BY NAME]", "[DD/MM/YYYY]", or "John Doe".';
      dataContext += '\n6. Do NOT use any other names or dates for signatories - only use the exact names and dates specified above.';
      dataContext += '\n7. IMPORTANT: Any register, log, record, or data table MUST have AT LEAST 15 ROWS of realistic sample data. Generate complete filled data, not just 3-4 rows.';
      if (relevantData.patients && relevantData.patients.length > 0) {
        dataContext += '\n8. Use EXACT patient names, Visit IDs, admission dates, and discharge dates from the patient data above.';
      }

      // Build NABH objective info for the document header
      const selectedObj = objectives.find(o => o.id === selectedObjective);
      const objectiveInfo = selectedObj
        ? `${selectedObj.code} - ${selectedObj.title}`
        : description.substring(0, 100);

      const userMessage = `NABH OBJECTIVE (Include this EXACT value in the objective-line section of the HTML):
${objectiveInfo}

Objective Element: ${description}

Evidence Item to Generate:
${item.text}${dataContext}

Generate complete, ready-to-use content/template for this evidence in ENGLISH ONLY (internal document) with the hospital header, footer, signature and stamp sections as specified. Make sure to fill in the objective-line with the NABH Objective value provided above.`;

      try {
        let content: string;

        // Try Gemini first, fallback to Claude
        if (geminiApiKey) {
          try {
            content = await callGeminiText(geminiApiKey, contentPrompt, userMessage);
          } catch (geminiErr) {
            console.warn('Gemini failed for content generation, trying Claude:', geminiErr);
            if (claudeApiKey) {
              content = await callClaudeText(claudeApiKey, contentPrompt, userMessage);
            } else {
              throw geminiErr;
            }
          }
        } else if (claudeApiKey) {
          content = await callClaudeText(claudeApiKey, contentPrompt, userMessage);
        } else {
          throw new Error('No API key configured.');
        }

        // Extract editable text from the generated HTML content
        const editableText = extractTextFromHTML(content);

        contents.push({
          evidenceItem: item.text,
          content,
          editableText,
        });

        setGeneratedContents([...contents]);
      } catch (err) {
        const errorContent = `Error generating content: ${err instanceof Error ? err.message : 'Unknown error'}`;
        contents.push({
          evidenceItem: item.text,
          content: errorContent,
          editableText: errorContent,
        });
        setGeneratedContents([...contents]);
      }
    }

    setIsGeneratingContent(false);
  };

  const handleGenerateVisualEvidence = async () => {
    if (!visualTopic.trim()) {
      setError('Please enter the topic for visual evidence');
      return;
    }

    setIsGeneratingImage(true);
    setError('');

    const typeLabel = visualEvidenceTypes.find(t => t.value === visualType)?.label || visualType;

    try {
      // Map visual type to infographic template
      const templateMap: Record<string, InfographicTemplate> = {
        'signage': 'minimal-signage',
        'poster': 'modern-poster',
        'flyer': 'gradient-card',
        'banner': 'modern-poster',
        'infographic': 'healthcare-steps',
        'checklist': 'compliance-checklist',
      };
      
      const template = templateMap[visualType] || 'modern-poster';
      
      // Generate professional SVG infographic
      const svgContent = generateInfographic({
        title: visualTopic,
        titleHindi: visualLanguage.includes('Hindi') ? `${visualTopic} (हिंदी)` : undefined,
        subtitle: typeLabel,
        description: `${typeLabel} for ${hospitalConfig.name}. This visual aid is designed for hospital display areas to support NABH accreditation compliance.`,
        descriptionHindi: visualLanguage.includes('Hindi') ? 'यह विज़ुअल एड NABH मान्यता अनुपालन का समर्थन करने के लिए अस्पताल प्रदर्शन क्षेत्रों के लिए डिज़ाइन किया गया है।' : undefined,
        keyPoints: [
          'Follow standard protocols',
          'Maintain documentation',
          'Ensure patient safety',
          'Report any deviations',
          'Continuous improvement',
        ],
        keyPointsHindi: visualLanguage.includes('Hindi') ? [
          'मानक प्रोटोकॉल का पालन करें',
          'दस्तावेज़ीकरण बनाए रखें',
          'रोगी सुरक्षा सुनिश्चित करें',
          'किसी भी विचलन की रिपोर्ट करें',
          'निरंतर सुधार',
        ] : undefined,
        hospitalName: hospitalConfig.name,
        hospitalAddress: hospitalConfig.address,
        template: template,
        colorScheme: selectedVisualColorScheme,
        showIcons: true,
      });

      // Convert to data URL
      const imageUrl = svgToDataUrl(svgContent);

      setGeneratedImages(prev => [
        {
          prompt: visualTopic,
          imageUrl,
          type: typeLabel,
        },
        ...prev,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate visual. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle text editing and update HTML
  const handleTextEdit = (index: number, newText: string) => {
    const signatories: SignatoryData = { preparedBy, reviewedBy, approvedBy };
    setGeneratedContents(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        editableText: newText,
        content: updateHTMLWithText(updated[index].content, newText, hospitalConfig, signatories),
      };
      return updated;
    });
  };

  // Toggle document view mode (reserved for future use)
  const _toggleDocumentViewMode = (index: number) => {
    setDocumentViewModes(prev => ({
      ...prev,
      [index]: prev[index] === 1 ? 0 : 1,
    }));
  };
  void _toggleDocumentViewMode; // Suppress unused variable warning

  // Make HTML content editable by adding contentEditable attribute and styles
  const makeEditable = (html: string): string => {
    if (!html) return '';
    let editableHtml = html.replace(
      '<body',
      `<body contenteditable="true" style="outline: none; cursor: text;"`
    );
    editableHtml = editableHtml.replace(
      '</head>',
      `<style>
        body[contenteditable="true"]:focus { outline: 2px solid #1565C0; outline-offset: 2px; }
        body[contenteditable="true"] *:hover { background: rgba(21, 101, 192, 0.05); }
        body[contenteditable="true"] *:focus { outline: 1px dashed #1565C0; }
      </style></head>`
    );
    return editableHtml;
  };

  // Open editable preview dialog
  const handleEditablePreview = (index: number) => {
    setEditablePreviewIndex(index);
    setEditablePreviewOpen(true);
  };

  // Save changes from editable preview iframe
  const handleSaveEditablePreview = () => {
    const iframe = editableIframeRef.current;
    if (iframe && editablePreviewIndex !== null) {
      const iframeDoc = iframe.contentDocument;
      if (iframeDoc) {
        const body = iframeDoc.body;
        if (body) {
          body.removeAttribute('contenteditable');
          body.style.removeProperty('outline');
          body.style.removeProperty('cursor');
        }
        const editingStyles = iframeDoc.querySelectorAll('style');
        editingStyles.forEach(style => {
          if (style.textContent?.includes('contenteditable')) {
            style.remove();
          }
        });

        const newHTML = iframeDoc.documentElement.outerHTML || '';
        setGeneratedContents(prev => {
          const updated = [...prev];
          updated[editablePreviewIndex] = {
            ...updated[editablePreviewIndex],
            content: '<!DOCTYPE html>\n' + newHTML,
            editableText: extractTextFromHTML(newHTML),
          };
          return updated;
        });
      }
      setEditablePreviewOpen(false);
      setEditablePreviewIndex(null);
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleCopyAllContents = () => {
    const allContent = generatedContents
      .map(gc => `=== ${gc.evidenceItem} ===\n\n${gc.content}`)
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(allContent);
  };

  // Check if content is HTML - more robust detection
  const isHTMLContent = (content: string): boolean => {
    const trimmed = content.trim();
    return trimmed.includes('<!DOCTYPE html>') ||
           trimmed.includes('<html') ||
           (trimmed.includes('<head>') && trimmed.includes('<body>')) ||
           (trimmed.includes('<style>') && trimmed.includes('</style>'));
  };

  // Extract HTML content from mixed response
  const extractHTMLContent = (content: string): string => {
    const trimmed = content.trim();

    // If starts with DOCTYPE or html tag, return as is
    if (trimmed.startsWith('<!DOCTYPE html>') || trimmed.startsWith('<html')) {
      return trimmed;
    }

    // Try to find the HTML document in the response
    const doctypeIndex = trimmed.indexOf('<!DOCTYPE html>');
    if (doctypeIndex !== -1) {
      return trimmed.substring(doctypeIndex);
    }

    const htmlIndex = trimmed.indexOf('<html');
    if (htmlIndex !== -1) {
      return trimmed.substring(htmlIndex);
    }

    // If no full document, wrap content in basic HTML structure
    if (trimmed.includes('<style>') || trimmed.includes('<div') || trimmed.includes('<table')) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    html { height: 100%; overflow-y: auto; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; line-height: 1.6; color: #333; padding: 20px; max-width: 800px; margin: 0 auto; }
  </style>
</head>
<body>
${trimmed}
</body>
</html>`;
    }

    return trimmed;
  };

  // Download as PDF handler
  const handleDownloadPDF = (content: string, filename: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      if (isHTMLContent(content)) {
        printWindow.document.write(extractHTMLContent(content));
      } else {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${filename}</title>
              <style>
                body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.5; padding: 20px; white-space: pre-wrap; }
                @page { margin: 1cm; }
              </style>
            </head>
            <body>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
          </html>
        `);
      }
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  // Preview HTML content in new window with print button
  const handlePreviewContent = (content: string, title: string) => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      const toolbarHTML = `
        <div id="preview-toolbar" style="position: fixed; top: 0; left: 0; right: 0; background: #1976d2; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
          <span style="color: white; font-family: Arial, sans-serif; font-size: 14px; font-weight: 500;">${title.substring(0, 60)}${title.length > 60 ? '...' : ''}</span>
          <button onclick="document.getElementById('preview-toolbar').style.display='none'; window.print(); document.getElementById('preview-toolbar').style.display='flex';" style="background: white; color: #1976d2; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 14px; display: flex; align-items: center; gap: 6px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1976d2"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
            Print
          </button>
        </div>
        <div style="margin-top: 60px;"></div>
      `;
      if (isHTMLContent(content)) {
        const htmlContent = extractHTMLContent(content);
        // Insert toolbar after <body> tag
        const modifiedContent = htmlContent.replace(/<body[^>]*>/i, (match) => match + toolbarHTML);
        previewWindow.document.write(modifiedContent);
      } else {
        previewWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title} - ${hospitalConfig.name}</title>
              <style>
                body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.5; padding: 20px; white-space: pre-wrap; background: #f5f5f5; }
                @media print { #preview-toolbar { display: none !important; } body { margin-top: 0 !important; } }
              </style>
            </head>
            <body>${toolbarHTML}${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
          </html>
        `);
      }
      previewWindow.document.close();
    }
  };

  // Save document to database
  const handleSaveDocument = async (content: string, evidenceTitle: string, evidencePrompt: string, documentIndex: number) => {
    try {
      setSaveStatus('saving');
      setSaveMessage('Saving document...');

      // Get selected objective code
      const selectedObj = objectives.find(obj => obj.id === selectedObjective);
      const objectiveCode = selectedObj?.code || 'GENERAL';

      // Extract HTML and text content
      const htmlContent = isHTMLContent(content) ? extractHTMLContent(content) : content;
      const textContent = extractTextFromHTML(htmlContent);

      // Save to database
      const result = await saveGeneratedEvidence({
        objective_code: objectiveCode,
        evidence_title: evidenceTitle,
        prompt: evidencePrompt,
        generated_content: textContent,
        html_content: htmlContent,
        evidence_type: 'document',
        hospital_config: {
          name: hospitalConfig.name,
          address: hospitalConfig.address,
          phone: hospitalConfig.phone,
          email: hospitalConfig.email,
          website: hospitalConfig.website,
          qualityCoordinator: hospitalConfig.qualityCoordinator,
          qualityCoordinatorDesignation: hospitalConfig.qualityCoordinatorDesignation,
        },
      });

      if (result.success && result.id) {
        // Store the saved document ID
        setSavedDocuments(prev => ({ ...prev, [documentIndex]: result.id! }));

        setSaveStatus('success');
        setSaveMessage('Document saved successfully!');

        // Reset status after 3 seconds
        setTimeout(() => {
          setSaveStatus('idle');
          setSaveMessage('');
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to save document');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setSaveStatus('error');
      setSaveMessage(error instanceof Error ? error.message : 'Failed to save document');

      // Reset status after 5 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 5000);
    }
  };

  // View saved document in new tab
  const handleViewSavedDocument = async (documentId: string) => {
    try {
      // Load the saved document from database by ID
      const result = await loadEvidenceById(documentId);

      if (result.success && result.data && result.data.html_content) {
        // Open in new tab
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(result.data.html_content);
          newWindow.document.close();
        }
      } else {
        console.error('Error loading saved document:', result.error);
      }
    } catch (error) {
      console.error('Error loading saved document:', error);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setEvidenceItems([]);
    setGeneratedContents([]);
    setError('');
  };

  const handleBackToSelection = () => {
    setActiveStep(1);
    setGeneratedContents([]);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Icon color="primary" sx={{ fontSize: 32 }}>description</Icon>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" fontWeight={600}>
              Evidence Document Creator
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create professional NABH evidence documents for {hospitalConfig.name}
            </Typography>
          </Box>
          <Chip
            icon={<Icon>verified</Icon>}
            label="NABH Compliant"
            color="success"
            variant="outlined"
          />
          {geminiApiKey && (
            <Chip
              icon={<Icon>check_circle</Icon>}
              label="Gemini"
              color="success"
              variant="outlined"
              size="small"
            />
          )}
          {claudeApiKey && (
            <Chip
              icon={<Icon>check_circle</Icon>}
              label="Claude"
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
          {!geminiApiKey && !claudeApiKey && (
            <Chip
              icon={<Icon>warning</Icon>}
              label="API Key Missing"
              color="error"
              variant="outlined"
              size="small"
            />
          )}
          <Button
            variant="outlined"
            startIcon={<Icon>settings</Icon>}
            onClick={() => setShowHospitalConfig(!showHospitalConfig)}
          >
            Hospital Settings
          </Button>
        </Box>

        {/* API Key Warning */}
        {!geminiApiKey && !claudeApiKey && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>No API keys configured.</strong> Add <code>VITE_GEMINI_API_KEY</code> or <code>VITE_CLAUDE_API_KEY</code> to your <code>.env</code> file.
            </Typography>
          </Alert>
        )}
        {geminiApiKey && !claudeApiKey && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Using <strong>Gemini</strong> for content generation. Claude available as backup if configured.
            </Typography>
          </Alert>
        )}

        {/* Tabs for Document vs Visual Evidence */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<Icon>description</Icon>}
            iconPosition="start"
            label="Document Evidence"
          />
          <Tab
            icon={<Icon>image</Icon>}
            iconPosition="start"
            label="Visual Evidence (Signage, Posters, Flyers)"
          />
        </Tabs>

        {/* Hospital Configuration */}
        {showHospitalConfig && (
          <Card variant="outlined" sx={{ mb: 3, bgcolor: 'primary.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Icon color="primary">business</Icon>
                <Typography variant="subtitle1" fontWeight={600}>
                  Hospital Branding Configuration
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Hospital Name"
                    value={hospitalConfig.name}
                    onChange={(e) => handleHospitalConfigChange('name', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Quality Coordinator Name"
                    value={hospitalConfig.qualityCoordinator}
                    onChange={(e) => handleHospitalConfigChange('qualityCoordinator', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Quality Coordinator Designation"
                    value={hospitalConfig.qualityCoordinatorDesignation}
                    onChange={(e) => handleHospitalConfigChange('qualityCoordinatorDesignation', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Phone"
                    value={hospitalConfig.phone}
                    onChange={(e) => handleHospitalConfigChange('phone', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Hospital Address"
                    value={hospitalConfig.address}
                    onChange={(e) => handleHospitalConfigChange('address', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email"
                    value={hospitalConfig.email}
                    onChange={(e) => handleHospitalConfigChange('email', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Website"
                    value={hospitalConfig.website}
                    onChange={(e) => handleHospitalConfigChange('website', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Icon>upload</Icon>}
                      onClick={() => logoInputRef.current?.click()}
                    >
                      Upload Hospital Logo
                    </Button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                    {hospitalConfig.logo && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <img
                          src={hospitalConfig.logo}
                          alt="Hospital Logo"
                          style={{ height: 40, objectFit: 'contain' }}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleHospitalConfigChange('logo', '')}
                        >
                          <Icon fontSize="small">delete</Icon>
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Tab 0: Document Evidence */}
        {activeTab === 0 && (
          <>
            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Divider sx={{ mb: 3 }} />

            {/* Step 1: Generate Evidence List */}
            {activeStep === 0 && (
              <>
                {/* Objective Selection */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Icon color="primary">list_alt</Icon>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Select Objective Element (Optional)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Chapter</InputLabel>
                        <Select
                          value={selectedChapter}
                          label="Chapter"
                          onChange={(e) => handleChapterChange(e.target.value)}
                        >
                          <MenuItem value="">Select Chapter</MenuItem>
                          {chapters.map((chapter) => (
                            <MenuItem key={chapter.id} value={chapter.id}>
                              {chapter.code} - {chapter.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 300, flexGrow: 1 }}>
                        <InputLabel>Objective Element</InputLabel>
                        <Select
                          value={selectedObjective}
                          label="Objective Element"
                          onChange={(e) => handleObjectiveChange(e.target.value)}
                          disabled={!selectedChapter}
                        >
                          <MenuItem value="">Select Objective</MenuItem>
                          {objectives.map((obj) => (
                            <MenuItem key={obj.id} value={obj.id}>
                              {obj.code} - {obj.title}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </CardContent>
                </Card>

                {/* Description Input */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Icon color="primary">description</Icon>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Objective Element Description
                    </Typography>
                    {selectedObjective && (
                      <Chip label="Auto-filled" size="small" color="success" variant="outlined" />
                    )}
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter or paste the NABH objective element description here..."
                    sx={expandableTextFieldSx}
                  />
                </Box>

                {/* List Prompt Input */}
                <Accordion sx={{ mb: 3 }}>
                  <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon color="secondary">psychology</Icon>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Advanced Prompt (Advanced)
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      value={listPrompt}
                      onChange={(e) => setListPrompt(e.target.value)}
                      sx={expandableTextFieldSx}
                    />
                    <Button
                      size="small"
                      startIcon={<Icon>refresh</Icon>}
                      onClick={() => setListPrompt(defaultListPrompt)}
                      sx={{ mt: 1 }}
                    >
                      Reset to Default
                    </Button>
                  </AccordionDetails>
                </Accordion>

                {/* Generate Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Icon>list_alt</Icon>}
                    onClick={handleGenerateList}
                    disabled={isLoading || !description.trim()}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    {isLoading ? 'Creating Evidence List...' : 'Step 1: Create Evidence List'}
                  </Button>
                </Box>
              </>
            )}

            {/* Step 2: Select Evidences */}
            {activeStep === 1 && (
              <>
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon color="primary">checklist</Icon>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Select Evidences to Generate Content For
                        </Typography>
                        <Chip
                          label={`${selectedCount} of ${evidenceItems.length} selected`}
                          size="small"
                          color={selectedCount > 0 ? 'primary' : 'default'}
                        />
                      </Box>
                      <Button
                        size="small"
                        startIcon={<Icon>select_all</Icon>}
                        onClick={handleSelectAll}
                      >
                        {evidenceItems.every(item => item.selected) ? 'Deselect All' : 'Select All'}
                      </Button>
                    </Box>

                    <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto', bgcolor: 'grey.50' }}>
                      <FormGroup>
                        {evidenceItems.map((item) => (
                          <FormControlLabel
                            key={item.id}
                            control={
                              <Checkbox
                                checked={item.selected}
                                onChange={() => handleToggleEvidence(item.id)}
                                color="primary"
                              />
                            }
                            label={
                              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                                {item.text}
                              </Typography>
                            }
                            sx={{
                              alignItems: 'flex-start',
                              mb: 1,
                              p: 1,
                              borderRadius: 1,
                              bgcolor: item.selected ? 'primary.50' : 'transparent',
                              '&:hover': { bgcolor: item.selected ? 'primary.100' : 'grey.100' },
                            }}
                          />
                        ))}
                      </FormGroup>
                    </Paper>
                  </CardContent>
                </Card>

                {/* Branding Preview */}
                <Card variant="outlined" sx={{ mb: 3, bgcolor: 'success.50' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Icon color="success">verified</Icon>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Document Branding Preview
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Each generated document will include:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      <Chip icon={<Icon>image</Icon>} label={`${hospitalConfig.name} Logo`} size="small" />
                      <Chip icon={<Icon>location_on</Icon>} label="Hospital Address in Footer" size="small" />
                      <Chip icon={<Icon>draw</Icon>} label={`Digital Signature: ${hospitalConfig.qualityCoordinator}`} size="small" />
                      <Chip icon={<Icon>verified</Icon>} label="Hospital Attestation Stamp" size="small" />
                    </Box>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Icon>arrow_back</Icon>}
                    onClick={handleReset}
                  >
                    Back to Start
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Icon>auto_awesome</Icon>}
                    onClick={handleGenerateContent}
                    disabled={selectedCount === 0}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Step 2: Generate Branded Documents ({selectedCount})
                  </Button>
                </Box>
              </>
            )}

            {/* Step 3: Generated Content */}
            {activeStep === 2 && (
              <>
                {isGeneratingContent && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress size={48} sx={{ mb: 2 }} />
                    <Typography variant="h6">
                      Creating Documents...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {contentProgress.current} of {contentProgress.total} completed
                    </Typography>
                  </Box>
                )}

                {generatedContents.length > 0 && (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        <Icon sx={{ verticalAlign: 'middle', mr: 1 }}>description</Icon>
                        Evidence Documents ({generatedContents.length})
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<Icon>content_copy</Icon>}
                          onClick={handleCopyAllContents}
                        >
                          Copy All
                        </Button>
                      </Box>
                    </Box>

                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        All documents created with {hospitalConfig.name} branding. Review and customize as needed.
                      </Typography>
                    </Alert>

                    {saveStatus === 'success' && (
                      <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSaveStatus('idle')}>
                        <Typography variant="body2">{saveMessage}</Typography>
                      </Alert>
                    )}

                    {saveStatus === 'error' && (
                      <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveStatus('idle')}>
                        <Typography variant="body2">{saveMessage}</Typography>
                      </Alert>
                    )}

                    {generatedContents.map((gc, index) => (
                      <Accordion key={index} defaultExpanded={index === 0} sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip label={index + 1} size="small" color="primary" />
                            <Typography variant="subtitle2">
                              {gc.evidenceItem.substring(0, 100)}...
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          {/* View mode tabs and action buttons */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Tabs
                              value={documentViewModes[index] || 0}
                              onChange={(_, newValue) => setDocumentViewModes(prev => ({ ...prev, [index]: newValue }))}
                              sx={{ minHeight: 36 }}
                            >
                              <Tab
                                icon={<Icon sx={{ fontSize: 18 }}>article</Icon>}
                                iconPosition="start"
                                label="HTML Preview"
                                sx={{ minHeight: 36, py: 0.5 }}
                              />
                              <Tab
                                icon={<Icon sx={{ fontSize: 18 }}>edit_note</Icon>}
                                iconPosition="start"
                                label="Edit Text"
                                sx={{ minHeight: 36, py: 0.5 }}
                              />
                            </Tabs>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Icon>visibility</Icon>}
                                onClick={() => handlePreviewContent(gc.content, gc.evidenceItem.substring(0, 50))}
                              >
                                Preview
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="secondary"
                                startIcon={<Icon>edit_document</Icon>}
                                onClick={() => handleEditablePreview(index)}
                                disabled={!isHTMLContent(gc.content)}
                              >
                                Edit in Preview
                              </Button>
                              {savedDocuments[index] ? (
                                <>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={<Icon>check_circle</Icon>}
                                    disabled
                                  >
                                    Saved
                                  </Button>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleViewSavedDocument(savedDocuments[index])}
                                    sx={{ ml: -0.5 }}
                                  >
                                    <Tooltip title="View saved document">
                                      <Icon>visibility</Icon>
                                    </Tooltip>
                                  </IconButton>
                                </>
                              ) : (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  startIcon={saveStatus === 'saving' ? <CircularProgress size={16} color="inherit" /> : <Icon>save</Icon>}
                                  onClick={() => handleSaveDocument(gc.content, gc.evidenceItem, gc.evidenceItem, index)}
                                  disabled={saveStatus === 'saving'}
                                >
                                  {saveStatus === 'saving' ? 'Saving...' : 'Save Document'}
                                </Button>
                              )}
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<Icon>picture_as_pdf</Icon>}
                                onClick={() => handleDownloadPDF(gc.content, `Evidence-${index + 1}-${hospitalConfig.name}`)}
                              >
                                Download PDF
                              </Button>
                            </Box>
                          </Box>

                          {/* Tab 0: HTML Preview */}
                          {(documentViewModes[index] || 0) === 0 && (
                            <>
                              {isHTMLContent(gc.content) ? (
                                <Paper
                                  variant="outlined"
                                  sx={{
                                    p: 0,
                                    bgcolor: 'white',
                                    maxHeight: 600,
                                    overflow: 'auto',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      '& iframe': {
                                        width: '100%',
                                        height: '500px',
                                        border: 'none',
                                        backgroundColor: 'white',
                                      },
                                    }}
                                  >
                                    <iframe
                                      srcDoc={extractHTMLContent(gc.content)}
                                      title={`Evidence ${index + 1}`}
                                      sandbox="allow-same-origin allow-popups"
                                      style={{ display: 'block' }}
                                    />
                                  </Box>
                                </Paper>
                              ) : (
                                <>
                                  <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1, textAlign: 'center' }}>
                                    {hospitalConfig.logo ? (
                                      <img
                                        src={hospitalConfig.logo}
                                        alt="Hospital Logo"
                                        style={{ height: 60, objectFit: 'contain', marginBottom: 8 }}
                                      />
                                    ) : (
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                                        <Icon color="primary">local_hospital</Icon>
                                        <Typography variant="body2" color="text.secondary">[Hospital Logo]</Typography>
                                      </Box>
                                    )}
                                    <Typography variant="h6" fontWeight={600}>{hospitalConfig.name}</Typography>
                                  </Box>
                                  <Paper
                                    variant="outlined"
                                    sx={{
                                      p: 2,
                                      bgcolor: 'grey.50',
                                      maxHeight: 500,
                                      overflow: 'auto',
                                      whiteSpace: 'pre-wrap',
                                      fontFamily: 'monospace',
                                      fontSize: '0.875rem',
                                      lineHeight: 1.6,
                                    }}
                                  >
                                    {gc.content}
                                  </Paper>
                                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">
                                      {hospitalConfig.address}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                                      <Chip
                                        size="small"
                                        icon={<Icon fontSize="small">draw</Icon>}
                                        label={`Signed: ${hospitalConfig.qualityCoordinator}`}
                                        variant="outlined"
                                      />
                                      <Chip
                                        size="small"
                                        icon={<Icon fontSize="small">verified</Icon>}
                                        label="Official Hospital Stamp"
                                        color="primary"
                                        variant="outlined"
                                      />
                                    </Box>
                                  </Box>
                                </>
                              )}
                            </>
                          )}

                          {/* Tab 1: Edit Text */}
                          {(documentViewModes[index] || 0) === 1 && (
                            <Box>
                              <Alert severity="info" sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                  Edit the text below. Changes will automatically update the HTML document.
                                  Use <strong>## Section Title</strong> format to create sections.
                                </Typography>
                              </Alert>
                              <TextField
                                fullWidth
                                multiline
                                minRows={15}
                                maxRows={25}
                                value={gc.editableText}
                                onChange={(e) => handleTextEdit(index, e.target.value)}
                                sx={{
                                  '& .MuiInputBase-root': {
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                    lineHeight: 1.6,
                                  },
                                }}
                                placeholder="Edit document text here..."
                              />
                              <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Icon>content_copy</Icon>}
                                  onClick={() => handleCopyContent(gc.editableText)}
                                >
                                  Copy Text
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  startIcon={<Icon>article</Icon>}
                                  onClick={() => setDocumentViewModes(prev => ({ ...prev, [index]: 0 }))}
                                >
                                  View Updated HTML
                                </Button>
                              </Box>
                            </Box>
                          )}
                        </AccordionDetails>
                        <AccordionActions sx={{ px: 2, pb: 2 }}>
                          <Tooltip title="Preview">
                            <IconButton
                              size="small"
                              onClick={() => handlePreviewContent(gc.content, gc.evidenceItem.substring(0, 50))}
                            >
                              <Icon fontSize="small">visibility</Icon>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download PDF">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadPDF(gc.content, `Evidence-${index + 1}-${hospitalConfig.name}`)}
                            >
                              <Icon fontSize="small">picture_as_pdf</Icon>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Copy">
                            <IconButton
                              size="small"
                              onClick={() => handleCopyContent(gc.content)}
                            >
                              <Icon fontSize="small">content_copy</Icon>
                            </IconButton>
                          </Tooltip>
                        </AccordionActions>
                      </Accordion>
                    ))}

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Icon>arrow_back</Icon>}
                        onClick={handleBackToSelection}
                      >
                        Back to Selection
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Icon>refresh</Icon>}
                        onClick={handleReset}
                      >
                        Start Over
                      </Button>
                    </Box>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* Tab 1: Visual Evidence */}
        {activeTab === 1 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Create professional signages, posters, flyers, and other visual evidences for {hospitalConfig.name}.
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      <Icon sx={{ verticalAlign: 'middle', mr: 1 }}>add_photo_alternate</Icon>
                      Generate Visual Evidence
                    </Typography>

                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Visual Type</InputLabel>
                      <Select
                        value={visualType}
                        label="Visual Type"
                        onChange={(e) => setVisualType(e.target.value)}
                      >
                        {visualEvidenceTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Icon fontSize="small">{type.icon}</Icon>
                              {type.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      size="small"
                      label="Topic / Content"
                      value={visualTopic}
                      onChange={(e) => setVisualTopic(e.target.value)}
                      placeholder="e.g., Hand Hygiene Steps, Fire Safety Instructions, Patient Rights..."
                      multiline
                      rows={3}
                      sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={visualLanguage}
                        label="Language"
                        onChange={(e) => setVisualLanguage(e.target.value)}
                      >
                        <MenuItem value="English">English</MenuItem>
                        <MenuItem value="Hindi">Hindi</MenuItem>
                        <MenuItem value="Marathi">Marathi</MenuItem>
                        <MenuItem value="English and Hindi">English and Hindi (Bilingual)</MenuItem>
                      </Select>
                    </FormControl>
                    
                    {/* Color Scheme Selector */}
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      Color Scheme
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                      {availableColorSchemes.map((scheme) => (
                        <Tooltip key={scheme.value} title={scheme.label}>
                          <Box
                            onClick={() => setSelectedVisualColorScheme(scheme.value)}
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 1,
                              bgcolor: scheme.preview,
                              cursor: 'pointer',
                              border: '3px solid',
                              borderColor: selectedVisualColorScheme === scheme.value ? 'common.white' : 'transparent',
                              boxShadow: selectedVisualColorScheme === scheme.value 
                                ? `0 0 0 2px ${scheme.preview}, 0 4px 8px rgba(0,0,0,0.2)` 
                                : '0 2px 4px rgba(0,0,0,0.1)',
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                boxShadow: `0 4px 12px rgba(0,0,0,0.2)`,
                              },
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={isGeneratingImage ? <CircularProgress size={20} color="inherit" /> : <Icon>auto_awesome</Icon>}
                      onClick={handleGenerateVisualEvidence}
                      disabled={isGeneratingImage || !visualTopic.trim()}
                      sx={{
                        background: `linear-gradient(135deg, ${availableColorSchemes.find(s => s.value === selectedVisualColorScheme)?.preview || '#1565C0'} 0%, ${availableColorSchemes.find(s => s.value === selectedVisualColorScheme)?.preview || '#1565C0'}dd 100%)`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${availableColorSchemes.find(s => s.value === selectedVisualColorScheme)?.preview || '#1565C0'}dd 0%, ${availableColorSchemes.find(s => s.value === selectedVisualColorScheme)?.preview || '#1565C0'} 100%)`,
                        },
                      }}
                    >
                      {isGeneratingImage ? 'Generating...' : 'Generate Visual Evidence'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Templates */}
                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Quick Templates
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {[
                        'Hand Hygiene - 5 Moments',
                        'Fire Safety Instructions',
                        'Patient Rights',
                        'Biomedical Waste Segregation',
                        'Code Blue Protocol',
                        'Visitor Guidelines',
                        'No Smoking Zone',
                        'Emergency Exit',
                        'Infection Control',
                        'Fall Prevention',
                      ].map((template) => (
                        <Chip
                          key={template}
                          label={template}
                          size="small"
                          onClick={() => setVisualTopic(template)}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%', minHeight: 400 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      <Icon sx={{ verticalAlign: 'middle', mr: 1 }}>collections</Icon>
                      Generated Images ({generatedImages.length})
                    </Typography>

                    {generatedImages.length === 0 ? (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 300,
                          bgcolor: 'grey.50',
                          borderRadius: 2,
                        }}
                      >
                        <Icon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }}>image</Icon>
                        <Typography color="text.secondary">
                          Generated images will appear here
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                        {generatedImages.map((img, index) => (
                          <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                            <CardMedia
                              component="img"
                              image={img.imageUrl}
                              alt={img.prompt}
                              sx={{ maxHeight: 300, objectFit: 'contain', bgcolor: 'grey.100' }}
                            />
                            <CardContent sx={{ py: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                  <Chip label={img.type} size="small" color="primary" sx={{ mr: 1 }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {img.prompt}
                                  </Typography>
                                </Box>
                                <Tooltip title="Download">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDownloadImage(img.imageUrl, `${img.type}-${img.prompt.substring(0, 20)}`)}
                                  >
                                    <Icon fontSize="small">download</Icon>
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
      </Paper>

      {/* Instructions Card */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          <Icon sx={{ verticalAlign: 'middle', mr: 1 }}>help_outline</Icon>
          How to Use
        </Typography>
        <Box component="ol" sx={{ pl: 2, '& li': { mb: 1 } }}>
          <li>Click "Hospital Settings" to configure branding (name, logo, address, quality coordinator)</li>
          <li><strong>Document Evidence:</strong> Create SOPs, policies, registers with hospital branding</li>
          <li><strong>Visual Evidence:</strong> Create signages, posters, flyers for display</li>
          <li>Review and customize the generated content before printing or filing</li>
        </Box>
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            All documents are professionally formatted with {hospitalConfig.name} branding and NABH compliance standards.
          </Typography>
        </Alert>
      </Paper>

      {/* Editable Preview Dialog */}
      <Dialog
        open={editablePreviewOpen}
        onClose={() => setEditablePreviewOpen(false)}
        fullScreen
        PaperProps={{
          sx: { bgcolor: 'grey.100' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon>edit_document</Icon>
            <Typography variant="h6">
              Edit Document in Preview
            </Typography>
          </Box>
          <IconButton
            onClick={() => setEditablePreviewOpen(false)}
            sx={{ color: 'white' }}
          >
            <Icon>close</Icon>
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Click directly on the document to edit text. Changes are made directly in the formatted preview.
              Use the <strong>Save Changes</strong> button below to save your edits.
            </Typography>
          </Alert>
          <Paper
            variant="outlined"
            sx={{
              height: 'calc(100vh - 220px)',
              overflow: 'hidden',
              bgcolor: 'white',
            }}
          >
            {editablePreviewIndex !== null && generatedContents[editablePreviewIndex] && (
              <iframe
                ref={editableIframeRef}
                srcDoc={makeEditable(extractHTMLContent(generatedContents[editablePreviewIndex].content))}
                title="Editable Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: 'white',
                }}
              />
            )}
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            variant="outlined"
            startIcon={<Icon>close</Icon>}
            onClick={() => setEditablePreviewOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon>save</Icon>}
            onClick={handleSaveEditablePreview}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
