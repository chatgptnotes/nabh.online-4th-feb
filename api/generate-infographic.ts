import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Secure backend proxy for Claude API (Anthropic)
 * This keeps the API key hidden from the client
 * Used for generating infographics
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the API key from environment variables (server-side only, no VITE_ prefix)
    const apiKey = process.env.CLAUDE_API_KEY;

    if (!apiKey) {
      console.error('CLAUDE_API_KEY not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Get the prompt and parameters from request body
    const { prompt, model = 'claude-3-5-sonnet-20241022', maxTokens = 4096, temperature = 0.7 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Log request (for debugging)
    console.log('Generating infographic with Claude API');
    console.log('Prompt length:', prompt.length);
    console.log('Model:', model);

    // Call Claude API from backend
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      return res.status(response.status).json({
        error: `Claude API error: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();

    // Log success
    console.log('Claude API response received successfully');

    // Return the response to the client
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in generate-infographic API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
