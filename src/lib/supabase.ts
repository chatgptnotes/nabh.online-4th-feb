import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to get Claude API key
export const getClaudeApiKey = () => {
  return import.meta.env.VITE_CLAUDE_API_KEY || '';
};

// Helper function to get Gemini API key (for direct frontend calls)
export const getGeminiApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

// Call our secure backend proxy for Gemini API (with local dev fallback)
export const callGeminiAPI = async (prompt: string, temperature = 0.7, maxOutputTokens = 8192) => {
  // Try backend proxy first (works in production on Vercel)
  try {
    const response = await fetch('/api/generate-evidence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        temperature,
        maxOutputTokens,
      }),
    });

    if (response.ok) {
      return response.json();
    }

    // If 404, fall through to direct API call for local dev
    if (response.status !== 404) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate evidence');
    }
  } catch (err) {
    // Network error or 404 - try direct API call
    console.log('Backend proxy unavailable, using direct Gemini API call');
  }

  // Fallback: Direct Gemini API call for local development
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('No Gemini API key available. Set VITE_GEMINI_API_KEY in .env');
  }

  const directResponse = await fetch(
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

  if (!directResponse.ok) {
    const errorText = await directResponse.text();
    throw new Error(`Gemini API error: ${directResponse.status} - ${errorText}`);
  }

  return directResponse.json();
};
