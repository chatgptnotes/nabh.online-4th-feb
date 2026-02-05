/**
 * NABH Image Generation Utilities
 * Integration with Nano Banana Pro (Gemini 3 Pro Image)
 */

export interface ImageGenerationConfig {
  prompt: string;
  filename: string;
  resolution: '1K' | '2K' | '4K';
  category?: 'evidence' | 'training' | 'facility' | 'certificate';
}

export interface GeneratedImage {
  filename: string;
  path: string;
  category: string;
  timestamp: Date;
  resolution: string;
  dataUrl?: string; // Base64 data URL for preview and download
}

/**
 * NABH-specific image generation presets
 */
export const nabhImagePresets = {
  // Evidence Documentation
  hospitalCorridor: {
    prompt: "Professional hospital corridor with NABH accreditation certificate on wall, clean modern medical environment, bright lighting, Indian hospital setting",
    category: 'evidence' as const,
  },
  
  icuWard: {
    prompt: "Modern ICU ward with latest medical equipment, bright and sterile, NABH compliance standards, professional setup",
    category: 'evidence' as const,
  },
  
  pharmacy: {
    prompt: "Clean organized pharmacy department, modern equipment, NABH compliant medicine storage, professional Indian pharmacist",
    category: 'evidence' as const,
  },
  
  frontOffice: {
    prompt: "Professional hospital front office reception, modern design, patient registration area, NABH standards compliance",
    category: 'evidence' as const,
  },
  
  // Training Materials
  handHygiene: {
    prompt: "Professional hand hygiene 5-moment poster, colorful medical illustration, Indian healthcare workers, clear instructions",
    category: 'training' as const,
  },
  
  codeBlue: {
    prompt: "Code Blue emergency response flowchart, professional medical illustration, step-by-step process, hospital emergency procedures",
    category: 'training' as const,
  },
  
  bmwHandling: {
    prompt: "Bio Medical Waste segregation poster, color-coded waste categories, professional medical illustration, safety protocols",
    category: 'training' as const,
  },
  
  infectionControl: {
    prompt: "Infection control protocols poster, PPE usage guidelines, professional medical illustration, safety measures",
    category: 'training' as const,
  },
  
  // Certificates & Awards
  nabhCertificate: {
    prompt: "NABH accredited hospital certificate with Hope Hospital logo, professional design, official medical accreditation document",
    category: 'certificate' as const,
  },
  
  qualityAward: {
    prompt: "Hospital quality excellence award certificate, professional design, medical achievement recognition",
    category: 'certificate' as const,
  },
  
  // Facility Planning
  bedPlanLayout: {
    prompt: "Hospital bed arrangement floor plan, organized patient care layout, modern medical facility design, clear spacing",
    category: 'facility' as const,
  },
  
  emergencyExits: {
    prompt: "Hospital emergency exit route map, clear signage, safety pathway illustration, emergency evacuation plan",
    category: 'facility' as const,
  },
};

/**
 * Generate timestamp-based filename
 */
export function generateFilename(category: string, description: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '-');
  const cleanDesc = description.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
  return `${category}-${cleanDesc}-${timestamp}.png`;
}

/**
 * Execute image generation command
 */
export async function generateNabhImage(config: ImageGenerationConfig): Promise<GeneratedImage | null> {
  try {
    const command = `uv run /Users/murali/.npm-global/lib/node_modules/openclaw/skills/nano-banana-pro/scripts/generate_image.py --prompt "${config.prompt}" --filename "${config.filename}" --resolution ${config.resolution}`;
    
    // In a real implementation, this would execute the command
    // For now, return a mock response
    console.log('Executing:', command);
    
    return {
      filename: config.filename,
      path: `/assets/generated/${config.filename}`,
      category: config.category || 'general',
      timestamp: new Date(),
      resolution: config.resolution,
    };
  } catch (error) {
    console.error('Image generation failed:', error);
    return null;
  }
}

/**
 * Batch generate multiple NABH images
 */
export async function generateNabhImageBatch(presetKeys: (keyof typeof nabhImagePresets)[], resolution: '1K' | '2K' | '4K' = '2K'): Promise<GeneratedImage[]> {
  const results: GeneratedImage[] = [];
  
  for (const key of presetKeys) {
    const preset = nabhImagePresets[key];
    const filename = generateFilename(preset.category, key);
    
    const config: ImageGenerationConfig = {
      prompt: preset.prompt,
      filename,
      resolution,
      category: preset.category,
    };
    
    const result = await generateNabhImage(config);
    if (result) {
      results.push(result);
    }
    
    // Add delay between generations to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return results;
}

/**
 * Quick generation functions for common NABH use cases
 */
export const nabhQuickGenerate = {
  evidencePhotos: () => generateNabhImageBatch(['hospitalCorridor', 'icuWard', 'pharmacy', 'frontOffice']),
  trainingMaterials: () => generateNabhImageBatch(['handHygiene', 'codeBlue', 'bmwHandling', 'infectionControl']),
  certificates: () => generateNabhImageBatch(['nabhCertificate', 'qualityAward']),
  facilityPlans: () => generateNabhImageBatch(['bedPlanLayout', 'emergencyExits']),
  
  // Emergency: Generate all critical images for audit
  auditEmergencyKit: () => generateNabhImageBatch([
    'hospitalCorridor', 'icuWard', 'pharmacy', 'frontOffice',
    'handHygiene', 'codeBlue', 'nabhCertificate'
  ], '2K'),
};

export default nabhImagePresets;