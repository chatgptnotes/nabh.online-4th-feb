import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Backend proxy for fetching Google Drive files
 * This bypasses CORS restrictions by fetching the file server-side
 * Supports PDFs, Word docs, images, Excel files, etc.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'fileId is required' });
    }

    console.log('Fetching Google Drive file:', fileId);

    // Use the direct download URL with confirm parameter to bypass virus scan warning
    const downloadUrl = `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}`;

    const response = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      if (response.status === 403) {
        return res.status(403).json({
          error: 'Access denied. Please make sure the file is shared as "Anyone with the link can view".',
        });
      }
      if (response.status === 404) {
        return res.status(404).json({
          error: 'File not found. Please check the Google Drive link.',
        });
      }
      return res.status(response.status).json({
        error: `Failed to fetch file: ${response.status} ${response.statusText}`,
      });
    }

    // Get content type from response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // Get filename from content-disposition header if available
    let filename = 'downloaded-file';
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
      // Try to extract filename from header
      // Format: attachment; filename="example.pdf" or filename*=UTF-8''example.pdf
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '').trim();
      }
    }

    // Read the file content as ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to base64
    const base64Data = buffer.toString('base64');

    // Check if we got an HTML page instead of the file (Google's sharing/download page)
    if (contentType.includes('text/html') && base64Data.length < 50000) {
      const htmlContent = buffer.toString('utf-8');
      if (htmlContent.includes('Google Drive') || htmlContent.includes('Sign in')) {
        return res.status(403).json({
          error: 'File is not publicly accessible. Please share the file with "Anyone with the link can view" permission.',
        });
      }
    }

    console.log('Successfully fetched file:', {
      filename,
      contentType,
      size: buffer.length,
    });

    return res.status(200).json({
      success: true,
      data: base64Data,
      mimeType: contentType,
      filename,
      size: buffer.length,
    });
  } catch (error) {
    console.error('Error fetching Google Drive file:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
