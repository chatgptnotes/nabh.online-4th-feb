/**
 * Google Drive SOP Extractor
 * Extracts and converts Google Docs to HTML for storage in Supabase
 */

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
}

/**
 * Extract file ID from Google Drive URL
 */
export function extractFileIdFromUrl(url: string): string | null {
  // Pattern: https://docs.google.com/document/d/FILE_ID/edit
  const patterns = [
    /\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
    /\/file\/d\/([a-zA-Z0-9-_]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Extract chapter code from SOP filename
 * Examples: "AAC.1 - Registration SOP.pdf" -> "AAC"
 */
export function extractChapterFromFilename(filename: string): string | null {
  const chapterCodes = ['AAC', 'COP', 'MOM', 'PRE', 'HIC', 'CQI', 'PSQ', 'ROM', 'FMS', 'HRM', 'IMS'];

  for (const code of chapterCodes) {
    if (filename.toUpperCase().includes(code)) {
      return code;
    }
  }

  return null;
}

/**
 * Fetch Google Doc content as HTML
 * Uses Google Docs API export endpoint
 */
export async function fetchGoogleDocAsHTML(fileId: string): Promise<string> {
  try {
    // Google Docs export URL (works without auth for publicly shared docs)
    const exportUrl = `https://docs.google.com/document/d/${fileId}/export?format=html`;

    const response = await fetch(exportUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch Google Doc: ${response.statusText}`);
    }

    const html = await response.text();

    // Clean up the HTML
    return cleanGoogleDocHTML(html);
  } catch (error) {
    console.error('Error fetching Google Doc:', error);
    throw error;
  }
}

/**
 * Clean and format Google Docs exported HTML
 */
function cleanGoogleDocHTML(html: string): string {
  // Remove Google Docs wrapper elements
  let cleaned = html;

  // Extract body content
  const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    cleaned = bodyMatch[1];
  }

  // Remove inline styles that might conflict
  cleaned = cleaned.replace(/style="[^"]*"/gi, '');

  // Remove Google Docs specific classes
  cleaned = cleaned.replace(/class="c\d+"/gi, '');

  // Preserve headings, paragraphs, lists, tables
  // Add consistent styling classes
  cleaned = cleaned.replace(/<h1>/gi, '<h1 class="sop-heading-1">');
  cleaned = cleaned.replace(/<h2>/gi, '<h2 class="sop-heading-2">');
  cleaned = cleaned.replace(/<h3>/gi, '<h3 class="sop-heading-3">');
  cleaned = cleaned.replace(/<p>/gi, '<p class="sop-paragraph">');
  cleaned = cleaned.replace(/<table>/gi, '<table class="sop-table">');

  return cleaned.trim();
}

/**
 * List all files in a Google Drive folder
 * Requires Google Drive API access
 */
export async function listFilesInFolder(folderId: string, apiKey: string): Promise<GoogleDriveFile[]> {
  try {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,mimeType,webViewLink)`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

/**
 * Extract folder ID from Google Drive folder URL
 */
export function extractFolderIdFromUrl(url: string): string | null {
  // Pattern: https://drive.google.com/drive/folders/FOLDER_ID
  const match = url.match(/folders\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/**
 * Batch process multiple Google Docs from a folder
 */
export async function batchExtractSOPs(
  folderUrl: string,
  chapterMapping: Record<string, string> // filename pattern -> chapter code
): Promise<Array<{ fileId: string; fileName: string; content: string; chapterCode: string | null }>> {
  const folderId = extractFolderIdFromUrl(folderUrl);

  if (!folderId) {
    throw new Error('Invalid Google Drive folder URL');
  }

  // Note: This would require Google Drive API key
  // For now, return structure for manual processing
  console.log('Folder ID extracted:', folderId);
  console.log('Use Google Drive API or manual extraction');

  return [];
}
