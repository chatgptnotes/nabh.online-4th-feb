import type { InfographicConfig } from './infographicGenerator';

/**
 * Generate SVG infographic using Claude API via backend proxy
 * This keeps the API key secure on the server side
 */
export const generateClaudeInfographic = async (config: InfographicConfig): Promise<string> => {
  const prompt = `
    You are an expert graphic designer and SVG artist.
    Create a modern, stylish, professional SVG infographic for a hospital accreditation objective.
    
    Data:
    - Title: ${config.title}
    - Objective Code: ${config.code}
    - Description: ${config.description}
    - Hospital Name: ${config.hospitalName || 'Hospital'}
    - Key Points: ${config.keyPoints?.join(', ') || 'N/A'}

    CRITICAL REQUIREMENTS:
    1. **BILINGUAL (English + Hindi)**: You MUST translate the Title, Description, and all Key Points into Hindi. Display English text prominently, with Hindi translation immediately below or beside it for every section.
    2. **VISUAL FLOW**: Break down the Description/Key Points into a clear Step-by-Step flow or Process Diagram. Use arrows or dotted lines to connect steps.
    3. **ICONS**: You MUST include embedded SVG path icons for every step (e.g., documents, safety shield, doctor, patient, hygiene, checklist). Do not use external images; draw the icons with <path> tags.

    Design Specifications:
    - Output ONLY valid SVG code.
    - Dimensions: ${config.width || 800}x${config.height || 1200} (Portrait).
    - Style: Modern, clean, flat design with gradients and soft shadows (using SVG defs/filters).
    - Color Palette: Professional Healthcare (Teals, Blues, Clean Greens). Use 'Red' only for "Core" compliance alerts.
    - Typography: Use standard sans-serif fonts (Arial, Roboto, Segoe UI). Ensure text is readable.
    
    Structure:
    - **Header**: Hospital Name (Bilingual), Objective Code (Badge style).
    - **Main Title**: Bilingual Title.
    - **Visual Body**: 3-5 distinct steps/cards showing the process or requirements. Each card must have an Icon + English Text + Hindi Text.
    - **Footer**: Compliance tagline in English & Hindi.
  `;

  try {
    // Use backend proxy in production, fallback to direct API in development if proxy fails
    const backendUrl = import.meta.env.VITE_SITE_URL
      ? `${import.meta.env.VITE_SITE_URL}/api/generate-infographic`
      : '/api/generate-infographic';

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error || response.statusText}`);
    }

    const data = await response.json();
    const text = data.content[0].text;

    // Extract SVG
    const svgStart = text.indexOf('<svg');
    const svgEnd = text.lastIndexOf('</svg>');

    if (svgStart !== -1 && svgEnd !== -1) {
      return text.substring(svgStart, svgEnd + 6);
    } else {
      throw new Error('Claude did not return valid SVG code.');
    }
  } catch (error) {
    console.error('Error generating Claude infographic:', error);
    throw error;
  }
};
