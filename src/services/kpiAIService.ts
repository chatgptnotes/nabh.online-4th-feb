// KPI AI Service for graph editing
// Uses Gemini API to interpret user prompts and modify KPI data

import { getGeminiApiKey } from '../lib/supabase';
import type { KPIDefinition } from '../data/kpiData';

interface KPIDataEntry {
  month: string;
  value: number;
  target: number;
  numeratorValue?: number;
  denominatorValue?: number;
  remarks?: string;
}

interface AIModificationResult {
  success: boolean;
  modifiedData?: KPIDataEntry[];
  explanation?: string;
  error?: string;
}

/**
 * Process user prompt to modify KPI graph data
 */
export async function processKPIEditPrompt(
  prompt: string,
  currentData: KPIDataEntry[],
  kpi: KPIDefinition
): Promise<AIModificationResult> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.',
    };
  }

  const systemPrompt = buildSystemPrompt(kpi, currentData);
  const userMessage = prompt;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Request: ${userMessage}` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return {
        success: false,
        error: `API Error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return {
        success: false,
        error: 'No response from AI model',
      };
    }

    // Parse the AI response to extract modified data
    return parseAIResponse(content, currentData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing KPI edit prompt:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Build system prompt for AI
 */
function buildSystemPrompt(kpi: KPIDefinition, currentData: KPIDataEntry[]): string {
  return `You are a healthcare KPI data analyst assistant. You help modify KPI graph data based on user requests.

KPI Information:
- Name: ${kpi.name}
- Short Name: ${kpi.shortName}
- Definition: ${kpi.definition}
- Formula: ${kpi.formula}
- Unit: ${kpi.unit}
- Target: ${kpi.suggestedTarget} ${kpi.unit}
- Target Direction: ${kpi.targetDirection === 'lower' ? 'Lower is better' : 'Higher is better'}
- Benchmark Range: ${kpi.benchmarkRange.min} - ${kpi.benchmarkRange.max}

Current Data (JSON format):
${JSON.stringify(currentData, null, 2)}

IMPORTANT INSTRUCTIONS:
1. Analyze the user's request and determine what changes to make to the data
2. Ensure all values stay within realistic ranges (benchmark: ${kpi.benchmarkRange.min} - ${kpi.benchmarkRange.max})
3. Maintain data consistency and realistic trends
4. Return your response in the following JSON format:

{
  "explanation": "Brief explanation of what changes were made and why",
  "modifiedData": [
    {
      "month": "YYYY-MM",
      "value": number,
      "target": number,
      "remarks": "optional remarks"
    }
  ]
}

Examples of requests you might receive:
- "Show improvement trend over the last 6 months"
- "Set all values to target"
- "Add more variation to the data"
- "Show a declining trend"
- "Increase values by 10%"
- "Add data for 3 more months"
- "Remove outliers"
- "Show seasonal pattern"

Respond ONLY with valid JSON. Do not include any other text before or after the JSON.`;
}

/**
 * Parse AI response and extract modified data
 */
function parseAIResponse(
  content: string,
  currentData: KPIDataEntry[]
): AIModificationResult {
  try {
    // Try to extract JSON from the response
    let jsonContent = content;

    // Handle markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    } else {
      // Try to find JSON object directly
      const objectMatch = content.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonContent = objectMatch[0];
      }
    }

    const parsed = JSON.parse(jsonContent);

    if (!parsed.modifiedData || !Array.isArray(parsed.modifiedData)) {
      return {
        success: false,
        error: 'Invalid response format: missing modifiedData array',
      };
    }

    // Validate and clean the modified data
    const cleanedData: KPIDataEntry[] = parsed.modifiedData.map((entry: Partial<KPIDataEntry>) => ({
      month: entry.month || '',
      value: typeof entry.value === 'number' ? entry.value : 0,
      target: typeof entry.target === 'number' ? entry.target : currentData[0]?.target || 0,
      numeratorValue: entry.numeratorValue,
      denominatorValue: entry.denominatorValue,
      remarks: entry.remarks || '',
    }));

    // Filter out entries with invalid months
    const validData = cleanedData.filter(entry => /^\d{4}-\d{2}$/.test(entry.month));

    if (validData.length === 0) {
      return {
        success: false,
        error: 'No valid data entries in response',
      };
    }

    return {
      success: true,
      modifiedData: validData,
      explanation: parsed.explanation || 'Data modified successfully',
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.error('Raw content:', content);
    return {
      success: false,
      error: `Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Generate sample prompts for user guidance
 */
export function getKPISamplePrompts(kpi: KPIDefinition): string[] {
  const basePrompts = [
    'Show gradual improvement over the last 6 months',
    'Set all values to meet the target',
    'Add realistic variation to the data',
    'Show a seasonal pattern with peak in summer',
    'Increase all values by 15%',
    'Decrease all values by 10%',
    'Smooth out the data to show a steady trend',
    'Add 3 more months of projected data',
    'Remove the worst performing month',
    'Set values to just above target level',
  ];

  // Add KPI-specific prompts based on target direction
  if (kpi.targetDirection === 'lower') {
    return [
      `Show improvement (decreasing trend) towards target of ${kpi.suggestedTarget}`,
      'Reduce infection rates by 20% over the period',
      'Show gradual decrease in incidents over time',
      ...basePrompts.slice(0, 7),
    ];
  } else {
    return [
      `Show improvement (increasing trend) towards target of ${kpi.suggestedTarget}%`,
      'Increase compliance rates to above 90%',
      'Show gradual improvement in satisfaction scores',
      ...basePrompts.slice(0, 7),
    ];
  }
}

/**
 * Quick modification presets
 */
export interface QuickPreset {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

export function getQuickPresets(kpi: KPIDefinition): QuickPreset[] {
  const isLowerBetter = kpi.targetDirection === 'lower';

  return [
    {
      id: 'improve',
      label: 'Show Improvement',
      icon: 'trending_up',
      prompt: isLowerBetter
        ? `Show a gradual decreasing trend over the last 6 months, ending near the target of ${kpi.suggestedTarget}`
        : `Show a gradual increasing trend over the last 6 months, ending near the target of ${kpi.suggestedTarget}`,
    },
    {
      id: 'meet-target',
      label: 'Meet Target',
      icon: 'flag',
      prompt: `Set all values to slightly better than the target (${kpi.suggestedTarget}) with small natural variation`,
    },
    {
      id: 'stable',
      label: 'Stable Performance',
      icon: 'trending_flat',
      prompt: 'Show consistent performance with minimal variation, staying close to the average value',
    },
    {
      id: 'seasonal',
      label: 'Seasonal Pattern',
      icon: 'calendar_month',
      prompt: 'Create a realistic seasonal pattern with better performance in summer months and slightly worse in winter',
    },
    {
      id: 'variation',
      label: 'Add Variation',
      icon: 'show_chart',
      prompt: 'Add realistic month-to-month variation while maintaining the overall trend',
    },
    {
      id: 'smooth',
      label: 'Smooth Data',
      icon: 'auto_fix_high',
      prompt: 'Smooth out any outliers and create a more consistent trend line',
    },
  ];
}
