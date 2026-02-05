/**
 * Document Extraction Service
 * Handles text extraction from various document formats (images, PDFs, Word docs)
 * Uses Gemini Vision API for intelligent text extraction
 */

import { getGeminiApiKey } from '../lib/supabase';

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
 */
export const generateSOPFromContent = async (
  pdfContent: string,
  titlesInterpretation: string,
  chapterCode: string,
  chapterName: string,
  customPrompt?: string
): Promise<{ success: boolean; sop: string; error?: string }> => {
  console.log('[generateSOPFromContent] Starting SOP generation for chapter:', chapterCode);

  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) {
    console.error('[generateSOPFromContent] Gemini API key not configured');
    return { success: false, sop: '', error: 'Gemini API key not configured' };
  }

  try {
    const prompt = `You are a NABH Accreditation Expert. Generate a comprehensive Standard Operating Procedure (SOP) in professional HTML format.

## CONTEXT
Hospital Chapter: ${chapterCode} - ${chapterName}
SHCO 3rd Edition Interpretation & Objective: 
${titlesInterpretation}

Historical Data / Source Content:
${pdfContent}

User Specific Instructions:
${customPrompt || 'None'}

## OUTPUT REQUIREMENTS (MANDATORY)
1. Format: Complete HTML document with embedded CSS.
2. Header Table: Use <table> tags for the header including (Document No, Issue Date, Rev No, Hospital Name).
3. Section Headings: Use <h3> for sections: Purpose, Scope, Responsibility, Procedure, References, etc.
4. Language & Tone: Professional, formal, and strictly compliant with SHCO 3rd Edition standards.
5. Content Integration: Incorporate the interpretation and staff/historical data provided.
6. Print Readiness: Ensure proper margins and clear tabular structures.

Only return the HTML code, no introductory text.`;

    console.log('[generateSOPFromContent] Calling Gemini API...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.7, 
            maxOutputTokens: 8192,
            response_mime_type: "text/plain"
          },
        }),
      }
    );

    console.log('[generateSOPFromContent] Gemini API response status:', response.status);
    const data = await response.json();

    if (data.error) {
      console.error('[generateSOPFromContent] Gemini API error:', data.error);
      return { success: false, sop: '', error: data.error.message || 'Gemini API error' };
    }

    let sop = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean markdown code blocks if AI included them
    sop = sop.replace(/```html/g, '').replace(/```/g, '').trim();
    
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
