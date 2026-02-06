/**
 * Document Extraction Service
 * Handles text extraction from various document formats (images, PDFs, Word docs)
 * Uses Gemini Vision API for intelligent text extraction
 */

import { callGeminiAPI, callGeminiVisionAPI } from '../lib/supabase';

export interface ExtractionResult {
  success: boolean;
  text: string;
  documentType?: string;
  structuredData?: Record<string, unknown>;
  error?: string;
}

export interface DocumentAnalysis {
  documentType: string;
  title?: string;
  sections: { heading: string; content: string }[];
  tables?: { headers: string[]; rows: string[][] }[];
  keyValuePairs?: Record<string, string>;
  signatures?: string[];
  dates?: string[];
  suggestions?: string[];
}

/**
 * Convert file to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

/**
 * Extract text from image using Gemini Vision
 */
export const extractTextFromImage = async (
  file: File,
  prompt?: string
): Promise<ExtractionResult> => {
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) {
    return { success: false, text: '', error: 'Gemini API key not configured' };
  }

  try {
    const base64 = await fileToBase64(file);
    const defaultPrompt = `Extract all text content from this document image.

Identify and organize:
1. Document title/heading
2. All text fields and their labels
3. Table contents (if any)
4. Signatures and dates
5. Any stamps or seals text

Format the output as structured text with clear sections.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt || defaultPrompt },
              { inline_data: { mime_type: file.type, data: base64.split(',')[1] } }
            ]
          }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return { success: true, text, documentType: 'image' };
  } catch (error) {
    console.error('Error extracting text from image:', error);
    return { success: false, text: '', error: 'Failed to extract text from image' };
  }
};

/**
 * Extract text from PDF using Gemini Vision (for scanned PDFs)
 * For text-based PDFs, we'll use a simple approach
 */
export const extractTextFromPDF = async (
  file: File,
  prompt?: string
): Promise<ExtractionResult> => {
  console.log('[extractTextFromPDF] Starting PDF extraction, file size:', file.size);

  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) {
    console.error('[extractTextFromPDF] Gemini API key not configured');
    return { success: false, text: '', error: 'Gemini API key not configured' };
  }
  console.log('[extractTextFromPDF] Gemini API key found');

  try {
    // For PDFs, we'll convert first page to image and extract
    // In a production app, you'd use a proper PDF parsing library
    console.log('[extractTextFromPDF] Converting file to base64...');
    const base64 = await fileToBase64(file);
    console.log('[extractTextFromPDF] Base64 length:', base64.length);

    const defaultPrompt = `This is a PDF document. Extract all text content, organizing it by:
1. Document title and headers
2. Body content with section headings
3. Tables (format as structured data)
4. Footer information
5. Any form fields and their values

Provide a comprehensive extraction of all visible text.`;

    console.log('[extractTextFromPDF] Calling Gemini API...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt || defaultPrompt },
              { inline_data: { mime_type: 'application/pdf', data: base64.split(',')[1] } }
            ]
          }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
        }),
      }
    );

    console.log('[extractTextFromPDF] Gemini API response status:', response.status);
    const data = await response.json();
    console.log('[extractTextFromPDF] Gemini API response:', JSON.stringify(data).substring(0, 500));

    if (data.error) {
      console.error('[extractTextFromPDF] Gemini API error:', data.error);
      return { success: false, text: '', error: data.error.message || 'Gemini API error' };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('[extractTextFromPDF] Extracted text length:', text.length);

    return { success: true, text, documentType: 'pdf' };
  } catch (error) {
    console.error('[extractTextFromPDF] Error:', error);
    return { success: false, text: '', error: 'Failed to extract text from PDF' };
  }
};

/**
 * Analyze document structure and extract structured data
 */
export const analyzeDocument = async (
  text: string,
  documentCategory: string
): Promise<DocumentAnalysis> => {
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) {
    return { documentType: 'unknown', sections: [] };
  }

  const prompts: Record<string, string> = {
    stationery: `Analyze this hospital stationery/form text and extract:
1. Document type (form, register, certificate, letterhead, etc.)
2. Title of the document
3. All sections with their headings and content
4. Table structures if any
5. Form fields and their labels
6. Suggestions for improvement (formatting, missing fields, NABH compliance)

Text to analyze:
${text}

Return as JSON with keys: documentType, title, sections[], tables[], keyValuePairs{}, suggestions[]`,

    committee: `Analyze this committee document/SOP and extract:
1. Committee name
2. Committee objectives/purpose
3. Members list with roles
4. Meeting frequency
5. Key responsibilities
6. Recent meeting details if mentioned
7. Suggestions for improvement

Text to analyze:
${text}

Return as JSON with keys: committeeName, objectives[], members[], meetingFrequency, responsibilities[], meetings[], suggestions[]`,

    kpi: `Analyze this KPI/quality indicator document and extract:
1. KPI names and definitions
2. Target values
3. Current values if mentioned
4. Calculation formulas
5. Data sources
6. Trends or historical data
7. Suggestions for additional KPIs

Text to analyze:
${text}

Return as JSON with keys: kpis[{name, target, current, formula, category}], suggestions[]`,

    presentation: `Analyze this presentation/slide content and extract:
1. Presentation title
2. Slide titles and content
3. Key points and data
4. Charts/graphs descriptions
5. Suggestions for improvement

Text to analyze:
${text}

Return as JSON with keys: title, slides[{title, content, keyPoints[]}], suggestions[]`,
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompts[documentCategory] || prompts.stationery }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
        }),
      }
    );

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Try to parse JSON from response
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
                       responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        return {
          documentType: parsed.documentType || documentCategory,
          title: parsed.title || parsed.committeeName,
          sections: parsed.sections || [],
          keyValuePairs: parsed.keyValuePairs,
          suggestions: parsed.suggestions || [],
        };
      }
    } catch {
      // If JSON parsing fails, return basic structure
    }

    return {
      documentType: documentCategory,
      sections: [{ heading: 'Extracted Content', content: responseText }],
    };
  } catch (error) {
    console.error('Error analyzing document:', error);
    return { documentType: 'unknown', sections: [] };
  }
};

/**
 * Generate improved document from extracted content
 */
export const generateImprovedDocument = async (
  extractedText: string,
  documentCategory: string,
  userSuggestions: string,
  hospitalName: string = 'Hope Hospital'
): Promise<string> => {
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) {
    return '';
  }

  const prompts: Record<string, string> = {
    stationery: `Create an improved, professionally formatted hospital document based on this extracted content.

Original Document Content:
${extractedText}

User's Improvement Suggestions:
${userSuggestions || 'Make it NABH compliant and professional'}

Requirements:
1. Hospital: ${hospitalName}
2. Create a complete HTML document with embedded CSS
3. Include professional header with hospital name and logo placeholder
4. Use proper typography and spacing
5. Add all necessary fields for NABH compliance
6. Include proper footer with document control information
7. Make it print-ready (A4 size)
8. Use professional color scheme (blue: #1565C0)

Generate complete, ready-to-use HTML document.`,

    committee: `Create a professional Committee SOP/Charter document based on this extracted content.

Original Document Content:
${extractedText}

User's Improvement Suggestions:
${userSuggestions || 'Make it NABH compliant'}

Requirements:
1. Hospital: ${hospitalName}
2. Create a complete HTML document
3. Include: Purpose, Scope, Composition, Responsibilities, Meeting Frequency, Reporting
4. Add proper header and footer
5. Include signature blocks for Chairperson and Members
6. NABH compliant format
7. Document control number and version

Generate complete HTML document for the committee SOP.`,

    kpi: `Create a professional KPI Dashboard/Report based on this extracted content.

Original Document Content:
${extractedText}

User's Improvement Suggestions:
${userSuggestions || 'Create a comprehensive KPI tracking document'}

Requirements:
1. Hospital: ${hospitalName}
2. Create HTML document with tables for KPI tracking
3. Include: KPI Name, Formula, Target, Actual, Variance, Trend
4. Add sections for different KPI categories
5. Include space for monthly data entry
6. Professional formatting
7. Print-ready format

Generate complete HTML KPI tracking document.`,

    presentation: `Create professional presentation slides based on this extracted content.

Original Document Content:
${extractedText}

User's Improvement Suggestions:
${userSuggestions || 'Make it suitable for NABH auditor presentation'}

Requirements:
1. Hospital: ${hospitalName}
2. Create HTML slides with proper styling
3. Include title slide with hospital branding
4. Clear, concise bullet points
5. Professional color scheme
6. Each slide should fit one screen
7. Add speaker notes sections

Generate complete HTML presentation with multiple slides.`,
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompts[documentCategory] || prompts.stationery }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
        }),
      }
    );

    const data = await response.json();
    let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract HTML from response
    const htmlMatch = content.match(/```html\n?([\s\S]*?)\n?```/);
    if (htmlMatch) {
      content = htmlMatch[1];
    }

    return content;
  } catch (error) {
    console.error('Error generating improved document:', error);
    return '';
  }
};

/**
 * Extract committee data from uploaded SOP
 */
export const extractCommitteeData = async (text: string): Promise<{
  name: string;
  description: string;
  objectives: string[];
  members: { name: string; role: string; designation: string }[];
  meetingFrequency: string;
  responsibilities: string[];
}> => {
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) {
    return { name: '', description: '', objectives: [], members: [], meetingFrequency: '', responsibilities: [] };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Extract committee information from this document:

${text}

Return JSON with:
{
  "name": "Committee Name",
  "description": "Brief description",
  "objectives": ["objective1", "objective2"],
  "members": [{"name": "Name", "role": "Chairperson/Member", "designation": "Job Title"}],
  "meetingFrequency": "Monthly/Quarterly/etc",
  "responsibilities": ["responsibility1", "responsibility2"]
}

Only return the JSON, no other text.` }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
        }),
      }
    );

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Return empty if parsing fails
    }

    return { name: '', description: '', objectives: [], members: [], meetingFrequency: '', responsibilities: [] };
  } catch (error) {
    console.error('Error extracting committee data:', error);
    return { name: '', description: '', objectives: [], members: [], meetingFrequency: '', responsibilities: [] };
  }
};

/**
 * Extract KPI data from uploaded document
 */
export const extractKPIData = async (text: string): Promise<{
  kpis: { name: string; category: string; target: number; unit: string; formula: string }[];
}> => {
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) {
    return { kpis: [] };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Extract KPI/Quality Indicator information from this document:

${text}

Return JSON with:
{
  "kpis": [
    {
      "name": "KPI Name",
      "category": "clinical/patient_safety/infection/nursing/laboratory/operational/patient_experience",
      "target": 5,
      "unit": "%",
      "formula": "Calculation formula"
    }
  ]
}

Only return the JSON, no other text.` }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
        }),
      }
    );

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Return empty if parsing fails
    }

    return { kpis: [] };
  } catch (error) {
    console.error('Error extracting KPI data:', error);
    return { kpis: [] };
  }
};

/**
 * Extract text from PDF using URL (fetches the PDF first)
 */
export const extractTextFromPDFUrl = async (
  pdfUrl: string,
  prompt?: string
): Promise<ExtractionResult> => {
  console.log('[extractTextFromPDFUrl] Starting extraction for:', pdfUrl);

  try {
    // Fetch PDF from URL
    console.log('[extractTextFromPDFUrl] Fetching PDF...');
    const response = await fetch(pdfUrl);
    console.log('[extractTextFromPDFUrl] Fetch response status:', response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    console.log('[extractTextFromPDFUrl] Blob size:', blob.size, 'type:', blob.type);

    const file = new File([blob], 'document.pdf', { type: 'application/pdf' });
    console.log('[extractTextFromPDFUrl] File created, calling extractTextFromPDF...');

    // Use existing extraction function
    const result = await extractTextFromPDF(file, prompt);
    console.log('[extractTextFromPDFUrl] Extraction result:', result.success ? 'SUCCESS' : 'FAILED', result.error || '');

    return result;
  } catch (error) {
    console.error('[extractTextFromPDFUrl] Error:', error);
    return {
      success: false,
      text: '',
      error: error instanceof Error ? error.message : 'Failed to extract text from PDF URL',
    };
  }
};

/**
 * Generate SOP from extracted PDF content and user interpretation
 * Uses EXACT same format as evidence generation with Hope Hospital branding
 */
export const generateSOPFromContent = async (
  pdfContent: string,
  titlesInterpretation: string,
  chapterCode: string,
  chapterName: string,
  customPrompt?: string,
  objectiveCode?: string
): Promise<{ success: boolean; sop: string; error?: string }> => {
  console.log('[generateSOPFromContent] Starting SOP generation for chapter:', chapterCode);

  // Using secure backend proxy - no API key needed in frontend

  const today = new Date();
  const effectiveDate = new Date(2025, 8, 9); // Fixed: 09 Sept 2025
  const reviewDate = new Date(effectiveDate.getFullYear() + 1, effectiveDate.getMonth(), effectiveDate.getDate()); // effectiveDate + 1 year
  const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const objectiveTitle = titlesInterpretation.split('\n')[0] || '';

  const docNo = `SOP-${chapterCode}-${objectiveCode ? objectiveCode.replace(/\./g, '-') : '001'}`;

  // Use actual Hope Hospital logo and signature images - relative paths work in iframe
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const logoUrl = `${baseUrl}/assets/hope-hospital-logo.png`;
  const sonaliSignature = `${baseUrl}/Sonali's signature.png`;
  const gauravSignature = `${baseUrl}/Gaurav's signature.png`;
  const shirazSignature = `${baseUrl}/Dr shiraz's signature.png`;

  try {
    const prompt = `You are an expert in NABH (National Accreditation Board for Hospitals and Healthcare Providers) accreditation documentation for Hope Hospital.

Generate a complete Standard Operating Procedure (SOP) HTML document in ENGLISH ONLY.

## CONTEXT
- Hospital Chapter: ${chapterCode} - ${chapterName}
- Objective Code: ${objectiveCode || chapterCode}
- SHCO 3rd Edition Interpretation & Objective:
${titlesInterpretation}

## Historical Data / Source Content:
${pdfContent}

## User Specific Instructions:
${customPrompt || 'Generate a comprehensive SOP based on NABH 3rd Edition guidelines.'}

IMPORTANT: Generate the output as a complete, valid HTML document with embedded CSS styling. The document must be modern, professional, and print-ready.

Use EXACTLY this HTML template structure (fill in the content sections):

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SOP - ${objectiveCode || chapterCode} - Hope Hospital</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 1.6; color: #333; padding: 0 15px 15px; width: 100%; max-width: 800px; margin-left: auto !important; margin-right: auto !important; }
    .header { text-align: center; border-bottom: 3px solid #1565C0; padding-bottom: 5px; margin-bottom: 15px; margin-top: 0 !important; padding-top: 0 !important; line-height: 1; }
    .logo { width: 180px; height: auto; margin: 0 auto !important; padding: 0 !important; display: block; vertical-align: top; }
    .hospital-address { font-size: 13px; color: #666; margin: 0 !important; padding: 0 !important; line-height: 1.2; }
    .doc-title { background: linear-gradient(135deg, #1565C0, #0D47A1); color: white; padding: 12px; font-size: 20px; font-weight: bold; text-align: center; margin: 20px 0; border-radius: 5px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .info-table th, .info-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .info-table th { background: #f5f5f5; font-weight: 600; width: 25%; }
    .auth-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .auth-table th { background: linear-gradient(135deg, #1565C0, #0D47A1); color: white; padding: 10px; text-align: center; }
    .auth-table td { border: 1px solid #ddd; padding: 15px; text-align: center; vertical-align: top; }
    .signature-box { margin-top: 10px; padding: 8px; border: 1px solid #1565C0; border-radius: 5px; background: #f8f9fa; }
    .signature-name { font-weight: bold; color: #1565C0; font-size: 16px; }
    .signature-line { font-family: 'Brush Script MT', cursive; font-size: 22px; color: #0D47A1; margin: 5px 0; }
    .section { margin: 20px 0; page-break-inside: avoid; }
    .section-title { background: #e3f2fd; padding: 8px 12px; font-weight: bold; color: #1565C0; border-left: 4px solid #1565C0; margin-bottom: 10px; }
    .section-content { padding: 10px 15px; page-break-inside: avoid; }
    .section-content ul { margin-left: 20px; }
    .section-content li { margin: 5px 0; page-break-inside: avoid; }
    .procedure-step { margin: 10px 0; padding: 10px; background: #fafafa; border-radius: 5px; border-left: 3px solid #1565C0; page-break-inside: avoid; }
    .step-number { display: inline-block; width: 25px; height: 25px; background: #1565C0; color: white; border-radius: 50%; text-align: center; line-height: 25px; margin-right: 10px; font-weight: bold; }
    .data-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    .data-table th { background: #1565C0; color: white; padding: 10px; text-align: left; }
    .data-table td { border: 1px solid #ddd; padding: 8px; }
    .data-table tr:nth-child(even) { background: #f9f9f9; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #1565C0; text-align: center; font-size: 12px; color: #666; }
    .revision-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    .revision-table th { background: #455a64; color: white; padding: 8px; }
    .revision-table td { border: 1px solid #ddd; padding: 8px; }
    .stamp-area { border: 2px dashed #1565C0; border-radius: 10px; padding: 15px; text-align: center; margin: 20px 0; background: #f8f9fa; }
    .stamp-text { font-weight: bold; color: #1565C0; font-size: 16px; }
    @media print { body { padding: 0; max-width: 100%; margin: 0 auto; } .no-print { display: none; } @page { margin: 20mm; size: A4; } .section, .section-content, .procedure-step, .info-table, .auth-table, .data-table, tr { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div style="font-size: 28px; font-weight: bold; color: #1565C0; margin-bottom: 10px;">SOP</div>
  <div class="header">
    <img src="${logoUrl}" alt="Dr. Murali's Hope Hospital" class="logo" style="width: 180px; height: auto; display: block; margin: 0 auto !important; padding: 0 !important; vertical-align: top;">
    <div class="hospital-address">2, Teka Naka, Nagpur, Maharashtra 440022 | Phone: +91 9823555053 | Email: info@hopehospital.com</div>
  </div>

  <div class="doc-title">SOP-${objectiveCode || chapterCode} - ${objectiveTitle}</div>

  <table class="info-table">
    <tr><th>Document No</th><td>${docNo}</td><th>Version</th><td>1.0</td></tr>
    <tr><th>Department</th><td>Quality Department</td><th>Category</th><td>SOP</td></tr>
    <tr><th>Effective Date</th><td>${formatDate(effectiveDate)}</td><th>Review Date</th><td>${formatDate(reviewDate)}</td></tr>
    <tr><th>Objective Code</th><td colspan="3">${objectiveCode || chapterCode} - [Objective Title from content]</td></tr>
  </table>

  <table class="auth-table">
    <tr><th>PREPARED BY</th><th>REVIEWED BY</th><th>APPROVED BY</th></tr>
    <tr>
      <td>
        <div>Name: Sonali Kakde</div>
        <div>Designation: Clinical Audit Coordinator</div>
        <div>Date: ${formatDate(effectiveDate)}</div>
        <div style="margin-top: 10px;">Signature:</div>
        <img src="${sonaliSignature}" alt="Sonali Signature" style="height: 50px; max-width: 120px; object-fit: contain;">
      </td>
      <td>
        <div>Name: Gaurav Agrawal</div>
        <div>Designation: Hospital Administrator</div>
        <div>Date: ${formatDate(effectiveDate)}</div>
        <div style="margin-top: 10px;">Signature:</div>
        <img src="${gauravSignature}" alt="Gaurav Signature" style="height: 50px; max-width: 120px; object-fit: contain;">
      </td>
      <td>
        <div>Name: Dr. Shiraz Khan</div>
        <div>Designation: Quality Coordinator / Administrator</div>
        <div>Date: ${formatDate(effectiveDate)}</div>
        <div style="margin-top: 10px;">Signature:</div>
        <img src="${shirazSignature}" alt="Dr. Shiraz Signature" style="height: 50px; max-width: 120px; object-fit: contain;">
      </td>
    </tr>
  </table>

  [GENERATE THESE SECTIONS WITH DETAILED CONTENT:]

  <div class="section">
    <div class="section-title">1. Purpose</div>
    <div class="section-content">[Generate detailed purpose based on the objective and interpretation]</div>
  </div>

  <div class="section">
    <div class="section-title">2. Scope</div>
    <div class="section-content">[Generate scope and applicability]</div>
  </div>

  <div class="section">
    <div class="section-title">3. Responsibility</div>
    <div class="section-content">[List responsible personnel and their roles]</div>
  </div>

  <div class="section">
    <div class="section-title">4. Definitions</div>
    <div class="section-content">[Define key terms used in this SOP]</div>
  </div>

  <div class="section">
    <div class="section-title">5. Procedure</div>
    <div class="section-content">
      [Generate detailed step-by-step procedure using procedure-step divs:
      <div class="procedure-step"><span class="step-number">1</span> Step description...</div>
      ]
    </div>
  </div>

  <div class="section">
    <div class="section-title">6. Documentation</div>
    <div class="section-content">[List required documents, forms, and records]</div>
  </div>

  <div class="section">
    <div class="section-title">7. References</div>
    <div class="section-content">[Reference NABH standards, guidelines, and related documents]</div>
  </div>

  <table class="revision-table">
    <tr><th>Version</th><th>Date</th><th>Description</th><th>Author</th></tr>
    <tr><td>1.0</td><td>${formatDate(effectiveDate)}</td><td>Initial Release</td><td>Sonali Kakde</td></tr>
  </table>

  <div class="stamp-area">
    <div class="stamp-text">[HOSPITAL STAMP AREA]</div>
  </div>

  <div class="footer">
    <strong>Hope Hospital</strong> | 2, Teka Naka, Nagpur | Phone: +91 9823555053 | Email: info@hopehospital.com<br>
    This is a controlled document. Unauthorized copying is prohibited.
  </div>
</body>
</html>

Generate the complete HTML document with all sections filled with relevant, professional content based on the provided interpretation and source content. Return ONLY the HTML, no markdown or explanations.`;

    console.log('[generateSOPFromContent] Calling secure backend proxy...');
    const data = await callGeminiAPI(prompt, 0.7, 8192);

    let sop = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean markdown code blocks if AI included them
    sop = sop.replace(/```html/gi, '').replace(/```/g, '').trim();

    // Ensure it starts with proper DOCTYPE
    if (!sop.toLowerCase().startsWith('<!doctype')) {
      sop = '<!DOCTYPE html>\n<html lang="en">\n' + sop;
    }

    console.log('[generateSOPFromContent] Generated SOP length:', sop.length);

    return { success: true, sop };
  } catch (error) {
    console.error('[generateSOPFromContent] Error:', error);
    return {
      success: false,
      sop: '',
      error: error instanceof Error ? error.message : 'Failed to generate SOP',
    };
  }
};

/**
 * Filter relevant content from old SOP text based on objective
 * Used in the new 3rd Edition NABH workflow
 */
export const filterRelevantContent = async (
  oldSOPText: string,
  objectiveCode: string,
  objectiveTitle: string,
  interpretation: string,
  customFilterPrompt?: string
): Promise<{ success: boolean; filteredText?: string; error?: string }> => {
  console.log('[filterRelevantContent] Starting filter for objective:', objectiveCode);

  // Using secure backend proxy - no API key needed in frontend

  if (!oldSOPText || oldSOPText.trim().length === 0) {
    return { success: false, error: 'No old SOP text provided to filter' };
  }

  try {
    const defaultPrompt = `You are a Hospital Information Extractor for NABH SOP Documentation.

## YOUR TASK
Extract ONLY 4-5 sentences of HOSPITAL-SPECIFIC information from the Old SOP Text (F1) that is related to the given objective element.

## OBJECTIVE DETAILS
- Code: ${objectiveCode}
- Title: ${objectiveTitle}
- Interpretation: ${interpretation}

## OLD SOP TEXT (F1):
${oldSOPText}

## WHAT TO EXTRACT (Pick only 4-5 most relevant):
✅ Staff names with designations (e.g., "Dr. Murali BK - Chief Orthopedic Surgeon")
✅ Department names (e.g., "Orthopedic Department", "OPD Wing", "ICU")
✅ Hospital-specific policies/rules (e.g., "Hand hygiene audit every Monday")
✅ Equipment with brand names (e.g., "Digital X-Ray Machine - Siemens")
✅ Location details (e.g., "Building A, 2nd Floor", "Ground Floor Reception")
✅ Contact information (e.g., "Emergency: +91-9823555053")
✅ Timings/schedules (e.g., "OPD hours: 9 AM - 5 PM")
✅ Specific forms/registers used (e.g., "Form F-101 for patient consent")

## WHAT NOT TO EXTRACT:
❌ Generic healthcare statements ("We provide quality care...")
❌ Template text ("The hospital ensures patient safety...")
❌ NABH standard definitions
❌ Any content that could apply to ANY hospital
❌ Lengthy paragraphs - only short specific facts

## OUTPUT FORMAT
• [Hospital-specific fact 1]
• [Hospital-specific fact 2]
• [Hospital-specific fact 3]
• [Hospital-specific fact 4]
• [Hospital-specific fact 5]

## IMPORTANT RULES
1. Maximum 5 bullet points - no more
2. Each bullet = 1 specific fact about THIS hospital
3. If no hospital-specific data found, write: "No hospital-specific information found in F1."
4. Do NOT add any information not present in F1
5. Do NOT explain or elaborate - just extract facts
6. NEVER write commentary, analysis, or explanations
7. NEVER start with phrases like "This is...", "Here's...", "Great prompt...", "Excellent..."
8. ONLY output bullet points - absolutely nothing else
9. Start your response DIRECTLY with • (bullet point) - no introduction text`;

    // If custom prompt provided, combine it with the data
    let finalPrompt = defaultPrompt;
    if (customFilterPrompt && customFilterPrompt.trim()) {
      finalPrompt = `${customFilterPrompt}

## OBJECTIVE DETAILS
- Code: ${objectiveCode}
- Title: ${objectiveTitle}
- Interpretation: ${interpretation}

## OLD SOP TEXT (F1) TO FILTER:
${oldSOPText}

## OUTPUT
Start directly with bullet points. No commentary or analysis.`;
    }

    const prompt = finalPrompt;

    console.log('[filterRelevantContent] Calling secure backend proxy...');
    const data = await callGeminiAPI(prompt, 0.3, 8192);

    let filteredText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Clean AI response - remove any commentary before bullet points
    // Find first bullet point and keep only from there
    const bulletIndex = filteredText.indexOf('•');
    const dashIndex = filteredText.indexOf('- ');
    const starIndex = filteredText.indexOf('* ');

    // Find the earliest bullet point marker
    const indices = [bulletIndex, dashIndex, starIndex].filter(i => i !== -1);
    if (indices.length > 0) {
      const firstBullet = Math.min(...indices);
      if (firstBullet > 0) {
        // Remove everything before the first bullet
        filteredText = filteredText.substring(firstBullet);
        console.log('[filterRelevantContent] Cleaned commentary, starting from bullet point');
      }
    }

    console.log('[filterRelevantContent] Filtered text length:', filteredText.length);

    return { success: true, filteredText };
  } catch (error) {
    console.error('[filterRelevantContent] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to filter content',
    };
  }
};

/**
 * Unified document extraction based on file type
 */
export const extractFromDocument = async (
  file: File,
  _category: string,
  customPrompt?: string
): Promise<ExtractionResult> => {
  const fileType = file.type;

  if (fileType.startsWith('image/')) {
    return extractTextFromImage(file, customPrompt);
  } else if (fileType === 'application/pdf') {
    return extractTextFromPDF(file, customPrompt);
  } else if (
    fileType === 'application/msword' ||
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    // For Word documents, we'll try to extract via Gemini
    // In production, you'd use a proper library like mammoth.js
    return extractTextFromPDF(file, customPrompt);
  } else {
    return { success: false, text: '', error: 'Unsupported file type' };
  }
};
