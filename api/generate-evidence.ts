import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Secure backend proxy for Gemini API
 * This keeps the API key hidden from the client
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the API key from environment variables (server-side only, no VITE_ prefix)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Get the prompt from request body
    const { prompt, temperature = 0.7, maxOutputTokens = 8192 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Log request (for debugging)
    console.log('Generating evidence with Gemini API');
    console.log('Prompt length:', prompt.length);

    // Call Gemini API from backend
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return res.status(response.status).json({
        error: `Gemini API error: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();

    // Log success
    console.log('Gemini API response received successfully');

    // Return the response to the client
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in generate-evidence API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
