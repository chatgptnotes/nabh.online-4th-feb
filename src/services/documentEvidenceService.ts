/**
 * Document Evidence Service
 * Handles document extraction and evidence generation from uploaded files
 */

import * as XLSX from 'xlsx';
import { getGeminiApiKey } from '../lib/supabase';
import { getRelevantData } from './hopeHospitalDatabase';
import type {
  UploadedDocument,
  DocumentExtractedData,
  DocumentEvidenceRequest,
  DocumentEvidenceResult,
  FormatDocumentRequest,
  GoogleDriveDocType,
  ParsedExcelData,
  ExcelRow,
  DocumentFileType,
  SourceDocumentRecord,
  SavedDocumentEvidence,
} from '../types/documentEvidence';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
 * Get file type from file
 */
export const getFileType = (file: File): DocumentFileType | null => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const validTypes: DocumentFileType[] = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'xlsx', 'xls'];

  if (extension && validTypes.includes(extension as DocumentFileType)) {
    return extension as DocumentFileType;
  }

  // Check MIME type as fallback
  const mimeMap: Record<string, DocumentFileType> = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  };

  return mimeMap[file.type] || null;
};

/**
 * Extract text from image/PDF/DOC using Gemini Vision API
 */
export const extractWithGeminiVision = async (
  file: File,
  customPrompt?: string
): Promise<DocumentExtractedData> => {
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  const base64 = await fileToBase64(file);
  const prompt = customPrompt || `Extract all text content from this document.

Identify and organize:
1. Document title/heading
2. All text fields and their labels
3. Table contents (if any) - format as structured data
4. Form fields and their values
5. Any dates, signatures, or stamps mentioned
6. Key-value pairs (like "Name: John", "Date: 01/01/2024")

Return the extracted content in a structured format with clear sections.
If you find tables, describe them with headers and rows.
If you find form fields, list them as key-value pairs.`;

  const mimeType = file.type || 'application/octet-stream';

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: base64.split(',')[1] } }
          ]
        }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return parseExtractedText(text);
};

/**
 * Parse extracted text into structured data
 */
const parseExtractedText = (text: string): DocumentExtractedData => {
  const result: DocumentExtractedData = {
    rawText: text,
  };

  // Try to extract title (first line or line with "Title:")
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length > 0) {
    const titleLine = lines.find(l => l.toLowerCase().includes('title:'));
    if (titleLine) {
      result.title = titleLine.replace(/title:/i, '').trim();
    } else {
      result.title = lines[0].replace(/^#+\s*/, '').trim();
    }
  }

  // Try to extract key-value pairs
  const kvPairs: Record<string, string> = {};
  const kvRegex = /^([^:]+):\s*(.+)$/gm;
  let match;
  while ((match = kvRegex.exec(text)) !== null) {
    const key = match[1].trim();
    const value = match[2].trim();
    if (key && value && key.length < 50) {
      kvPairs[key] = value;
    }
  }
  if (Object.keys(kvPairs).length > 0) {
    result.keyValuePairs = kvPairs;
  }

  // Try to extract dates
  const dateRegex = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/gi;
  const dates = text.match(dateRegex);
  if (dates && dates.length > 0) {
    result.dates = [...new Set(dates)];
  }

  return result;
};

/**
 * Extract data from Excel file using xlsx library
 */
export const extractFromExcel = async (file: File): Promise<DocumentExtractedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Get raw JSON data
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          dateNF: 'yyyy-mm-dd',
        });

        // Handle web-exported Excel with __EMPTY columns
        let processedData = jsonData;
        const firstRowKeys = Object.keys(jsonData[0] || {});
        const hasEmptyColumns = firstRowKeys.some(k => k.startsWith('__EMPTY'));

        if (hasEmptyColumns && jsonData.length > 1) {
          const headerRow = jsonData[0];
          const headerValues = Object.values(headerRow) as string[];

          processedData = jsonData.slice(1).map(row => {
            const values = Object.values(row);
            const remappedRow: ExcelRow = {};
            headerValues.forEach((header, idx) => {
              if (header && values[idx] !== undefined) {
                remappedRow[String(header).trim()] = values[idx];
              }
            });
            return remappedRow;
          });
        }

        // Build headers from first row
        const headers = processedData.length > 0 ? Object.keys(processedData[0]) : [];

        // Convert to table format
        const tableRows = processedData.map(row =>
          headers.map(h => String(row[h] ?? ''))
        );

        // Build raw text representation
        const rawTextLines = [
          `Sheet: ${sheetName}`,
          `Total Rows: ${processedData.length}`,
          '',
          headers.join(' | '),
          '-'.repeat(headers.join(' | ').length),
          ...tableRows.slice(0, 50).map(row => row.join(' | ')),
          processedData.length > 50 ? `... and ${processedData.length - 50} more rows` : '',
        ];

        const result: DocumentExtractedData = {
          rawText: rawTextLines.join('\n'),
          documentType: 'spreadsheet',
          title: sheetName,
          tables: [{
            headers,
            rows: tableRows,
          }],
        };

        // Try to extract key-value pairs from single-column or two-column data
        if (headers.length === 2) {
          const kvPairs: Record<string, string> = {};
          processedData.forEach(row => {
            const key = String(row[headers[0]] ?? '').trim();
            const value = String(row[headers[1]] ?? '').trim();
            if (key && value) {
              kvPairs[key] = value;
            }
          });
          if (Object.keys(kvPairs).length > 0) {
            result.keyValuePairs = kvPairs;
          }
        }

        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse Google Drive URL to extract document ID and type
 */
export const parseGoogleDriveUrl = (url: string): { documentId: string; docType: GoogleDriveDocType } | null => {
  try {
    // Patterns for different Google Drive URLs
    const patterns = [
      // Google Docs: https://docs.google.com/document/d/DOCUMENT_ID/edit
      { regex: /docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/, type: 'document' as GoogleDriveDocType },
      // Google Sheets: https://docs.google.com/spreadsheets/d/DOCUMENT_ID/edit
      { regex: /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/, type: 'spreadsheet' as GoogleDriveDocType },
      // Google Slides: https://docs.google.com/presentation/d/DOCUMENT_ID/edit
      { regex: /docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/, type: 'presentation' as GoogleDriveDocType },
      // Google Drive file: https://drive.google.com/file/d/DOCUMENT_ID/view
      { regex: /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/, type: 'unknown' as GoogleDriveDocType },
      // Google Drive open: https://drive.google.com/open?id=DOCUMENT_ID
      { regex: /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/, type: 'unknown' as GoogleDriveDocType },
    ];

    for (const { regex, type } of patterns) {
      const match = url.match(regex);
      if (match) {
        return { documentId: match[1], docType: type };
      }
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Fetch content from public Google Drive document
 */
export const extractFromGoogleDrive = async (url: string): Promise<DocumentExtractedData> => {
  const parsed = parseGoogleDriveUrl(url);
  if (!parsed) {
    throw new Error('Invalid Google Drive URL. Please use a valid Google Docs, Sheets, or Drive link.');
  }

  const { documentId, docType } = parsed;

  // Build export URL based on document type
  let exportUrl: string;
  let format: string;

  switch (docType) {
    case 'document':
      exportUrl = `https://docs.google.com/document/d/${documentId}/export?format=txt`;
      format = 'text';
      break;
    case 'spreadsheet':
      exportUrl = `https://docs.google.com/spreadsheets/d/${documentId}/export?format=csv`;
      format = 'csv';
      break;
    case 'presentation':
      exportUrl = `https://docs.google.com/presentation/d/${documentId}/export?format=txt`;
      format = 'text';
      break;
    default:
      throw new Error('Unsupported Google Drive file type. Please use Google Docs, Sheets, or Slides links.');
  }

  try {
    const response = await fetch(exportUrl);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Document is not publicly accessible. Please share the document with "Anyone with the link can view" permission.');
      }
      throw new Error(`Failed to fetch document: ${response.status}`);
    }

    const text = await response.text();

    if (format === 'csv') {
      // Parse CSV into table format
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0]?.split(',').map(h => h.trim().replace(/^"|"$/g, '')) || [];
      const rows = lines.slice(1).map(line =>
        line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
      );

      return {
        rawText: text,
        documentType: 'spreadsheet',
        tables: [{ headers, rows }],
      };
    }

    return parseExtractedText(text);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch Google Drive document. Please ensure the document is publicly accessible.');
  }
};

/**
 * Extract content from any supported document type
 */
export const extractDocumentContent = async (doc: UploadedDocument): Promise<DocumentExtractedData> => {
  const { file, fileType } = doc;

  switch (fileType) {
    case 'xlsx':
    case 'xls':
      return extractFromExcel(file);

    case 'pdf':
    case 'doc':
    case 'docx':
    case 'png':
    case 'jpg':
    case 'jpeg':
      return extractWithGeminiVision(file);

    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
};

/**
 * Generate evidence HTML from extracted document data
 */
export const generateEvidenceFromDocuments = async (
  request: DocumentEvidenceRequest
): Promise<DocumentEvidenceResult> => {
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) {
    return { success: false, error: 'Gemini API key not configured' };
  }

  try {
    // Fetch real patient/staff data
    const relevantData = await getRelevantData(request.evidenceItemText);

    // Build context from extracted documents
    const documentContext = request.documentData.map((doc, idx) => {
      let context = `\n--- DOCUMENT ${idx + 1} ---\n`;
      if (doc.title) context += `Title: ${doc.title}\n`;
      if (doc.documentType) context += `Type: ${doc.documentType}\n`;

      if (doc.keyValuePairs) {
        context += '\nKey Information:\n';
        Object.entries(doc.keyValuePairs).forEach(([key, value]) => {
          context += `  ${key}: ${value}\n`;
        });
      }

      if (doc.tables && doc.tables.length > 0) {
        doc.tables.forEach((table, tIdx) => {
          context += `\nTable ${tIdx + 1}:\n`;
          context += `Headers: ${table.headers.join(' | ')}\n`;
          table.rows.slice(0, 20).forEach(row => {
            context += `  ${row.join(' | ')}\n`;
          });
          if (table.rows.length > 20) {
            context += `  ... and ${table.rows.length - 20} more rows\n`;
          }
        });
      }

      context += `\nRaw Content Preview:\n${doc.rawText.substring(0, 2000)}${doc.rawText.length > 2000 ? '...' : ''}\n`;

      return context;
    }).join('\n');

    // Build data context from database
    let dataContext = '';
    if (relevantData.patients && relevantData.patients.length > 0) {
      dataContext += '\n--- REAL PATIENT DATA ---\n';
      relevantData.patients.forEach(p => {
        dataContext += `Patient: ${p.patient_name}, Visit ID: ${p.visit_id}, Diagnosis: ${p.diagnosis || 'N/A'}\n`;
      });
    }
    if (relevantData.staff && relevantData.staff.length > 0) {
      dataContext += '\n--- REAL STAFF DATA ---\n';
      relevantData.staff.forEach(s => {
        dataContext += `Staff: ${s.name}, Role: ${s.role}, Designation: ${s.designation}, Dept: ${s.department}\n`;
      });
    }
    if (relevantData.consultants && relevantData.consultants.length > 0) {
      dataContext += '\n--- VISITING CONSULTANTS ---\n';
      relevantData.consultants.slice(0, 10).forEach(c => {
        dataContext += `Dr. ${c.name}, ${c.department}, ${c.qualification || ''}\n`;
      });
    }

    const { hospitalConfig, objectiveCode, objectiveTitle, evidenceItemText } = request;

    const prompt = `You are an expert in NABH (National Accreditation Board for Hospitals and Healthcare Providers) accreditation documentation for ${hospitalConfig.name}.

Generate a complete HTML document for the evidence item based on the UPLOADED DOCUMENTS DATA provided below.

EVIDENCE TO GENERATE:
${evidenceItemText}

OBJECTIVE: ${objectiveCode} - ${objectiveTitle}

UPLOADED DOCUMENTS DATA:
${documentContext}

REAL DATABASE DATA (use these names for staff and patients):
${dataContext}

IMPORTANT INSTRUCTIONS:
1. Use the data from the uploaded documents to fill in the evidence document
2. Use ONLY the real staff and patient names provided above
3. Generate a professional NABH-compliant document
4. The document must be print-ready with proper formatting
5. Include signatures from: Sonali Kakde (Clinical Audit Coordinator), Gaurav Agrawal (Hospital Administrator), Dr. Shiraz Khan (NABH Coordinator)

Use this HTML template structure:

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>[Document Title] - ${hospitalConfig.name}</title>
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
    <div class="logo-area"><img src="https://www.nabh.online/assets/hope-hospital-logo.png" alt="${hospitalConfig.name} Logo" /></div>
  </div>

  <div class="objective-line">${objectiveCode} - ${objectiveTitle}</div>

  <div class="doc-title">[DOCUMENT TITLE]</div>

  <table class="info-table">
    <tr><th>Document No</th><td>[DOC-XXX-001]</td><th>Version</th><td>1.0</td></tr>
    <tr><th>Department</th><td>[Department]</td><th>Category</th><td>[Policy/SOP/Record]</td></tr>
    <tr><th>Effective Date</th><td>${new Date().toLocaleDateString('en-GB')}</td><th>Review Date</th><td>${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('en-GB')}</td></tr>
  </table>

  <table class="auth-table">
    <tr><th>PREPARED BY</th><th>REVIEWED BY</th><th>APPROVED BY</th></tr>
    <tr>
      <td>Name: Sonali Kakde<br>Designation: Clinical Audit Coordinator<br>Date: ${new Date().toLocaleDateString('en-GB')}<br><br>Signature:<br><img src="/Sonali's signature.png" alt="Sonali Kakde Signature" style="height: 50px; max-width: 120px; object-fit: contain;"></td>
      <td>Name: Gaurav Agrawal<br>Designation: Hospital Administrator<br>Date: ${new Date().toLocaleDateString('en-GB')}<br><br>Signature:<br><img src="/Gaurav's signature.png" alt="Gaurav Agrawal Signature" style="height: 50px; max-width: 120px; object-fit: contain;"></td>
      <td>Name: Dr. Shiraz Khan<br>Designation: NABH Coordinator / Administrator<br>Date: ${new Date().toLocaleDateString('en-GB')}<br><br>Signature:<br><img src="/Dr shiraz's signature.png" alt="Dr. Shiraz Khan Signature" style="height: 50px; max-width: 120px; object-fit: contain;"></td>
    </tr>
  </table>

  [MAIN CONTENT - Use the data from uploaded documents to create relevant sections]

  <table class="revision-table">
    <tr><th>Version</th><th>Date</th><th>Description</th><th>Changed By</th></tr>
    <tr><td>1.0</td><td>${new Date().toLocaleDateString('en-GB')}</td><td>Initial Release</td><td>Sonali Kakde</td></tr>
  </table>

  <div class="stamp-area">[HOSPITAL STAMP AREA]</div>

  <div class="footer">
    <strong>${hospitalConfig.name}</strong> | ${hospitalConfig.address}<br>
    Phone: ${hospitalConfig.phone} | Email: ${hospitalConfig.email} | Website: ${hospitalConfig.website}<br>
    This is a controlled document. Unauthorized copying or distribution is prohibited.
  </div>
</body>
</html>

Generate the complete HTML document using the data from the uploaded documents. Fill in all sections appropriately based on the evidence requirement and the document data provided.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 16384 },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let htmlContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract HTML from markdown code blocks if present
    const htmlMatch = htmlContent.match(/```html\n?([\s\S]*?)\n?```/);
    if (htmlMatch) {
      htmlContent = htmlMatch[1];
    }

    // Extract title from the generated HTML
    const titleMatch = htmlContent.match(/<div class="doc-title">([^<]+)<\/div>/);
    const title = titleMatch ? titleMatch[1] : evidenceItemText.substring(0, 50);

    return {
      success: true,
      htmlContent,
      title,
    };
  } catch (error) {
    console.error('Error generating evidence from documents:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate evidence',
    };
  }
};

/**
 * Format uploaded document content as professional NABH evidence document
 * This function directly formats and displays the extracted data without requiring
 * the user to select an evidence item - it auto-detects the title and preserves all data.
 */
export const formatDocumentAsEvidence = async (
  request: FormatDocumentRequest
): Promise<DocumentEvidenceResult> => {
  const geminiApiKey = getGeminiApiKey();
  if (!geminiApiKey) {
    return { success: false, error: 'Gemini API key not configured' };
  }

  try {
    const { documentData, objectiveCode, objectiveTitle, fileNames, hospitalConfig } = request;

    // Build detailed content from extracted documents
    const documentSections: string[] = [];
    let detectedTitle = '';

    documentData.forEach((doc, idx) => {
      let section = `\n=== DOCUMENT ${idx + 1}: ${fileNames[idx] || 'Uploaded Document'} ===\n`;

      // Capture title from first document or filename
      if (!detectedTitle && doc.title) {
        detectedTitle = doc.title;
      }
      if (!detectedTitle && fileNames[idx]) {
        // Extract title from filename (remove extension)
        detectedTitle = fileNames[idx].replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      }

      // Add tables
      if (doc.tables && doc.tables.length > 0) {
        doc.tables.forEach((table, tIdx) => {
          section += `\n[TABLE ${tIdx + 1}]\n`;
          section += `Headers: ${table.headers.join(' | ')}\n`;
          section += 'Data rows:\n';
          table.rows.forEach((row, rIdx) => {
            section += `  Row ${rIdx + 1}: ${row.join(' | ')}\n`;
          });
        });
      }

      // Add key-value pairs
      if (doc.keyValuePairs && Object.keys(doc.keyValuePairs).length > 0) {
        section += '\n[KEY-VALUE DATA]\n';
        Object.entries(doc.keyValuePairs).forEach(([key, value]) => {
          section += `  ${key}: ${value}\n`;
        });
      }

      // Add raw text (for non-table content)
      if (doc.rawText) {
        section += '\n[RAW CONTENT]\n';
        section += doc.rawText.substring(0, 3000);
        if (doc.rawText.length > 3000) {
          section += '\n... (content truncated)';
        }
      }

      documentSections.push(section);
    });

    // Fallback title
    if (!detectedTitle) {
      detectedTitle = 'Document Report';
    }

    const prompt = `You are an expert in creating professional NABH (National Accreditation Board for Hospitals) documentation for ${hospitalConfig.name}.

TASK: Format the uploaded document content into a professional NABH evidence document.

IMPORTANT INSTRUCTIONS:
1. **PRESERVE ALL DATA**: Keep ALL tables, values, and text from the uploaded documents exactly as provided
2. **DO NOT CREATE NEW CONTENT**: Only format and enhance the existing data - don't add fictional data
3. **DETECT APPROPRIATE TITLE**: Use "${detectedTitle}" as the base title, but improve it if you can detect a better title from the content
4. **FORMAT PROFESSIONALLY**: Convert tables to proper HTML tables, organize sections clearly
5. **KEEP STANDARD NABH STRUCTURE**: Header, document info, signatures, content, footer

OBJECTIVE CONTEXT: ${objectiveCode} - ${objectiveTitle}

UPLOADED DOCUMENT CONTENT TO FORMAT:
${documentSections.join('\n\n')}

Generate a complete, print-ready HTML document using this template structure:

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>[Auto-detected Title] - ${hospitalConfig.name}</title>
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
    .data-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    .data-table th { background: #1565C0; color: white; padding: 10px; text-align: left; }
    .data-table td { border: 1px solid #ddd; padding: 8px; }
    .data-table tr:nth-child(even) { background: #f9f9f9; }
    .kv-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    .kv-table th { background: #455a64; color: white; padding: 8px; text-align: left; width: 30%; }
    .kv-table td { border: 1px solid #ddd; padding: 8px; }
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
    <div class="logo-area"><img src="https://www.nabh.online/assets/hope-hospital-logo.png" alt="${hospitalConfig.name} Logo" /></div>
  </div>

  <div class="objective-line">${objectiveCode} - ${objectiveTitle}</div>

  <div class="doc-title">[AUTO-DETECTED TITLE FROM CONTENT]</div>

  <table class="info-table">
    <tr><th>Document No</th><td>[Generate appropriate code]</td><th>Version</th><td>1.0</td></tr>
    <tr><th>Department</th><td>[Detect from content or use "General"]</td><th>Category</th><td>Record/Report</td></tr>
    <tr><th>Effective Date</th><td>${new Date().toLocaleDateString('en-GB')}</td><th>Review Date</th><td>${new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('en-GB')}</td></tr>
  </table>

  <table class="auth-table">
    <tr><th>PREPARED BY</th><th>REVIEWED BY</th><th>APPROVED BY</th></tr>
    <tr>
      <td>Name: Sonali Kakde<br>Designation: Clinical Audit Coordinator<br>Date: ${new Date().toLocaleDateString('en-GB')}<br><br>Signature:<br><img src="/Sonali's signature.png" alt="Sonali Kakde Signature" style="height: 50px; max-width: 120px; object-fit: contain;"></td>
      <td>Name: Gaurav Agrawal<br>Designation: Hospital Administrator<br>Date: ${new Date().toLocaleDateString('en-GB')}<br><br>Signature:<br><img src="/Gaurav's signature.png" alt="Gaurav Agrawal Signature" style="height: 50px; max-width: 120px; object-fit: contain;"></td>
      <td>Name: Dr. Shiraz Khan<br>Designation: NABH Coordinator / Administrator<br>Date: ${new Date().toLocaleDateString('en-GB')}<br><br>Signature:<br><img src="/Dr shiraz's signature.png" alt="Dr. Shiraz Khan Signature" style="height: 50px; max-width: 120px; object-fit: contain;"></td>
    </tr>
  </table>

  <!-- MAIN CONTENT: Format all extracted data here -->
  <!-- Convert tables to proper <table class="data-table"> elements -->
  <!-- Convert key-value pairs to <table class="kv-table"> elements -->
  <!-- Format text content in <div class="section"> elements -->

  <table class="revision-table">
    <tr><th>Version</th><th>Date</th><th>Description</th><th>Changed By</th></tr>
    <tr><td>1.0</td><td>${new Date().toLocaleDateString('en-GB')}</td><td>Initial Release</td><td>Sonali Kakde</td></tr>
  </table>

  <div class="stamp-area">[HOSPITAL STAMP AREA]</div>

  <div class="footer">
    <strong>${hospitalConfig.name}</strong> | ${hospitalConfig.address}<br>
    Phone: ${hospitalConfig.phone} | Email: ${hospitalConfig.email} | Website: ${hospitalConfig.website}<br>
    This is a controlled document. Unauthorized copying or distribution is prohibited.
  </div>
</body>
</html>

CRITICAL: Output ONLY the complete HTML document. Preserve ALL data from the uploaded documents - format tables as proper HTML tables, key-value pairs as info tables, and text content in sections.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 16384 },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let htmlContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract HTML from markdown code blocks if present
    const htmlMatch = htmlContent.match(/```html\n?([\s\S]*?)\n?```/);
    if (htmlMatch) {
      htmlContent = htmlMatch[1];
    }

    // Extract title from the generated HTML
    const titleMatch = htmlContent.match(/<div class="doc-title">([^<]+)<\/div>/);
    const title = titleMatch ? titleMatch[1] : detectedTitle;

    return {
      success: true,
      htmlContent,
      title,
    };
  } catch (error) {
    console.error('Error formatting document as evidence:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to format document',
    };
  }
};

/**
 * Generate unique ID for uploaded documents
 */
export const generateDocumentId = (): string => {
  return `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Create UploadedDocument object from File
 */
export const createUploadedDocument = (file: File): UploadedDocument | null => {
  const fileType = getFileType(file);
  if (!fileType) return null;

  return {
    id: generateDocumentId(),
    file,
    fileName: file.name,
    fileType,
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
    status: 'pending',
  };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ============================================
// Source Document Persistence Functions
// ============================================

/**
 * Upload a file to Supabase Storage
 */
export const uploadFileToStorage = async (
  objectiveCode: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const sanitizedCode = objectiveCode.replace(/\./g, '_');
    const fileName = `source-documents/${sanitizedCode}/${Date.now()}_${file.name}`;

    // Convert file to blob for upload
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer]);

    const uploadResponse = await fetch(
      `${SUPABASE_URL}/storage/v1/object/nabh-evidence/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'x-upsert': 'true',
        },
        body: blob,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Storage upload failed:', uploadResponse.status, errorText);
      return { success: false, error: `Upload failed: ${errorText}` };
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/nabh-evidence/${fileName}`;
    return { success: true, url: publicUrl };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error uploading file to storage:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Delete a file from Supabase Storage
 */
export const deleteFileFromStorage = async (storageUrl: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Extract the file path from the public URL
    const publicPrefix = `${SUPABASE_URL}/storage/v1/object/public/nabh-evidence/`;
    if (!storageUrl.startsWith(publicPrefix)) {
      return { success: false, error: 'Invalid storage URL' };
    }
    const filePath = storageUrl.replace(publicPrefix, '');

    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/nabh-evidence/${filePath}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Storage delete failed:', response.status, errorText);
      return { success: false, error: `Delete failed: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting file from storage:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Save a source document record to the database
 */
export const saveSourceDocument = async (
  objectiveCode: string,
  file: File,
  extractedData?: DocumentExtractedData,
  extractionError?: string
): Promise<{ success: boolean; record?: SourceDocumentRecord; error?: string }> => {
  try {
    // First, upload the file to storage
    const uploadResult = await uploadFileToStorage(objectiveCode, file);
    if (!uploadResult.success || !uploadResult.url) {
      return { success: false, error: uploadResult.error || 'Failed to upload file' };
    }

    const fileType = getFileType(file);
    if (!fileType) {
      return { success: false, error: 'Unsupported file type' };
    }

    const record = {
      objective_code: objectiveCode,
      file_name: file.name,
      file_type: fileType,
      file_size: file.size,
      storage_url: uploadResult.url,
      extraction_status: extractedData ? 'extracted' : (extractionError ? 'error' : 'pending'),
      extracted_data: extractedData || null,
      extraction_error: extractionError || null,
      source_type: 'upload',
    };

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_evidence_source_documents`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(record),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error saving source document:', response.status, errorText);
      // Try to clean up the uploaded file
      await deleteFileFromStorage(uploadResult.url);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    return { success: true, record: data[0] as SourceDocumentRecord };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving source document:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Update extraction data for a source document
 */
export const updateSourceDocumentExtraction = async (
  documentId: string,
  extractedData?: DocumentExtractedData,
  extractionError?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (extractedData) {
      updates.extraction_status = 'extracted';
      updates.extracted_data = extractedData;
      updates.extraction_error = null;
    } else if (extractionError) {
      updates.extraction_status = 'error';
      updates.extraction_error = extractionError;
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_evidence_source_documents?id=eq.${documentId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error updating source document:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating source document:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Load all source documents for an objective
 */
export const loadSourceDocuments = async (
  objectiveCode: string
): Promise<{ success: boolean; data?: SourceDocumentRecord[]; error?: string }> => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_evidence_source_documents?objective_code=eq.${encodeURIComponent(objectiveCode)}&order=created_at.desc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error loading source documents:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    return { success: true, data: data as SourceDocumentRecord[] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading source documents:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Delete a source document (removes from both storage and database)
 */
export const deleteSourceDocument = async (
  documentId: string,
  storageUrl: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // First, delete from storage
    const storageResult = await deleteFileFromStorage(storageUrl);
    if (!storageResult.success) {
      console.warn('Failed to delete from storage:', storageResult.error);
      // Continue with database deletion even if storage deletion fails
    }

    // Then, delete from database
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_evidence_source_documents?id=eq.${documentId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error deleting source document:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting source document:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Convert a SourceDocumentRecord back to UploadedDocument format for UI
 */
export const recordToUploadedDocument = (record: SourceDocumentRecord): UploadedDocument => {
  // Create a mock File object since we can't reconstruct the original file
  // The file property won't be usable for re-extraction, but that's okay since data is already extracted
  const mockFile = new File([], record.file_name, { type: getMimeType(record.file_type) });

  return {
    id: record.id,
    file: mockFile,
    fileName: record.file_name,
    fileType: record.file_type,
    fileSize: record.file_size,
    uploadedAt: record.created_at,
    status: record.extraction_status === 'extracted' ? 'extracted' :
            record.extraction_status === 'error' ? 'error' : 'pending',
    extractedData: record.extracted_data,
    error: record.extraction_error,
  };
};

/**
 * Get MIME type from file extension
 */
const getMimeType = (fileType: DocumentFileType): string => {
  const mimeTypes: Record<DocumentFileType, string> = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return mimeTypes[fileType] || 'application/octet-stream';
};

// ============================================
// Saved Document Evidence Functions
// ============================================

/**
 * Save or update a generated document evidence to the database (upsert by objective_code)
 */
export const saveDocumentEvidence = async (
  objectiveCode: string,
  htmlContent: string,
  title?: string,
  hospitalId?: string,
  sourceFilename?: string
): Promise<{ success: boolean; data?: SavedDocumentEvidence; error?: string }> => {
  try {
    // First check if a document already exists for this objective
    const existingResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_document_evidence?objective_code=eq.${encodeURIComponent(objectiveCode)}&select=id`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!existingResponse.ok) {
      const errorText = await existingResponse.text();
      console.error('Error checking existing document:', existingResponse.status, errorText);
      return { success: false, error: `${existingResponse.status}: ${errorText}` };
    }

    const existingData = await existingResponse.json();
    const existingId = existingData.length > 0 ? existingData[0].id : null;

    if (existingId) {
      // Update existing document
      const updateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/nabh_document_evidence?id=eq.${existingId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            html_content: htmlContent,
            title: title || null,
            hospital_id: hospitalId || null,
            source_filename: sourceFilename || null,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('Error updating document evidence:', updateResponse.status, errorText);
        return { success: false, error: `${updateResponse.status}: ${errorText}` };
      }

      const updatedData = await updateResponse.json();
      return { success: true, data: updatedData[0] as SavedDocumentEvidence };
    } else {
      // Insert new document
      const insertResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/nabh_document_evidence`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            objective_code: objectiveCode,
            html_content: htmlContent,
            title: title || null,
            hospital_id: hospitalId || null,
            source_filename: sourceFilename || null,
          }),
        }
      );

      if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        console.error('Error inserting document evidence:', insertResponse.status, errorText);
        return { success: false, error: `${insertResponse.status}: ${errorText}` };
      }

      const insertedData = await insertResponse.json();
      return { success: true, data: insertedData[0] as SavedDocumentEvidence };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving document evidence:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Load saved document evidence for an objective
 */
export const loadDocumentEvidence = async (
  objectiveCode: string
): Promise<{ success: boolean; data?: SavedDocumentEvidence | null; error?: string }> => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_document_evidence?objective_code=eq.${encodeURIComponent(objectiveCode)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error loading document evidence:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    return { success: true, data: data.length > 0 ? (data[0] as SavedDocumentEvidence) : null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading document evidence:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

/**
 * Delete saved document evidence for an objective
 */
export const deleteDocumentEvidence = async (
  objectiveCode: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_document_evidence?objective_code=eq.${encodeURIComponent(objectiveCode)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error deleting document evidence:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting document evidence:', errorMessage);
    return { success: false, error: errorMessage };
  }
};
