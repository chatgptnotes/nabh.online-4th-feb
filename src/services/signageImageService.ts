/**
 * Hospital Signage Image Generation Service
 * Uses Gemini 2.0 Flash for generating ISO-compliant hospital signage images
 */

// Sign categories with ISO 7010 compliance requirements
export type SignCategory =
  | 'prohibition'   // Red circle with diagonal bar (No Smoking, No Entry)
  | 'warning'       // Yellow triangle (Caution, Hazard)
  | 'mandatory'     // Blue circle (Wear Mask, Wash Hands)
  | 'safety'        // Green rectangle (Emergency Exit, First Aid)
  | 'fire'          // Red square (Fire Extinguisher, Fire Alarm)
  | 'information';  // Blue rectangle (General Info, Directions)

export interface SignageTemplate {
  id: string;
  labelEnglish: string;
  labelHindi: string;
  category: SignCategory;
  isoCode?: string;  // ISO 7010 code if applicable
  prompt: string;    // Detailed prompt for image generation
}

// Comprehensive signage templates with detailed prompts
export const signageTemplates: Record<string, SignageTemplate> = {
  // ============ PROHIBITION SIGNS (Red Circle with Diagonal Bar) ============
  noSmoking: {
    id: 'noSmoking',
    labelEnglish: 'NO SMOKING',
    labelHindi: 'धूम्रपान निषेध',
    category: 'prohibition',
    isoCode: 'P002',
    prompt: `Create a professional hospital "NO SMOKING" prohibition sign.

CRITICAL VISUAL REQUIREMENTS:
- Large RED circle (Pantone 485) with thick border
- WHITE background inside the circle
- BLACK cigarette icon with smoke wisps in the center
- RED diagonal bar (45 degrees, top-left to bottom-right) crossing through the cigarette
- The diagonal bar should be the same thickness as the circle border

TEXT REQUIREMENTS:
- Below the symbol: "NO SMOKING" in bold black uppercase letters
- Below English text: "धूम्रपान निषेध" in Devanagari script
- Small text at bottom: "As per COTPA Act" / "कोटपा अधिनियम के अनुसार"

DESIGN SPECIFICATIONS:
- ISO 7010 P002 compliant
- Clean white background
- High contrast for visibility from 10+ meters
- Professional hospital-grade quality
- Dimensions: Square format, suitable for A4 printing
- No decorative elements - strictly functional safety signage`
  },

  noEntry: {
    id: 'noEntry',
    labelEnglish: 'NO ENTRY',
    labelHindi: 'प्रवेश निषेध',
    category: 'prohibition',
    isoCode: 'P001',
    prompt: `Create a professional hospital "NO ENTRY / RESTRICTED AREA" prohibition sign.

CRITICAL VISUAL REQUIREMENTS:
- Large RED circle (Pantone 485) with thick border
- WHITE background inside the circle
- WHITE horizontal bar in the center (the universal "no entry" symbol)
- The horizontal bar should be thick and centered

TEXT REQUIREMENTS:
- Below the symbol: "NO ENTRY" in bold black uppercase letters
- Below that: "RESTRICTED AREA" in smaller text
- Hindi translation: "प्रवेश निषेध" and "प्रतिबंधित क्षेत्र"
- Optional: "Authorized Personnel Only / केवल अधिकृत व्यक्ति"

DESIGN SPECIFICATIONS:
- ISO 7010 P001 compliant
- Clean white background
- High contrast, visible from distance
- Professional hospital signage quality
- Square format for A4 printing`
  },

  noMobilePhone: {
    id: 'noMobilePhone',
    labelEnglish: 'NO MOBILE PHONES',
    labelHindi: 'मोबाइल फोन निषेध',
    category: 'prohibition',
    isoCode: 'P013',
    prompt: `Create a professional hospital "NO MOBILE PHONES" prohibition sign.

CRITICAL VISUAL REQUIREMENTS:
- Large RED circle with thick border
- WHITE background inside
- BLACK mobile phone icon in the center (simple smartphone shape)
- RED diagonal bar crossing through the phone
- Small signal waves near phone being crossed out

TEXT REQUIREMENTS:
- "NO MOBILE PHONES" in bold black text
- "SILENT ZONE" as subtitle
- Hindi: "मोबाइल फोन निषेध" and "शांत क्षेत्र"

DESIGN SPECIFICATIONS:
- ISO 7010 P013 compliant
- Clean, professional hospital signage
- High visibility
- Square format`
  },

  // ============ WARNING SIGNS (Yellow Triangle) ============
  cautionWetFloor: {
    id: 'cautionWetFloor',
    labelEnglish: 'CAUTION: WET FLOOR',
    labelHindi: 'सावधान: गीला फर्श',
    category: 'warning',
    isoCode: 'W011',
    prompt: `Create a professional hospital "CAUTION WET FLOOR" warning sign.

CRITICAL VISUAL REQUIREMENTS:
- Large YELLOW triangle (Pantone 109) with BLACK border
- BLACK icon inside showing: person slipping/falling figure
- The figure should show dynamic movement (one leg slipping)
- Water droplets or wet surface indication

TEXT REQUIREMENTS:
- "CAUTION" in bold BLACK text above
- "WET FLOOR" below the triangle
- Hindi: "सावधान" and "गीला फर्श"
- "Watch Your Step / अपने कदम संभालें"

DESIGN SPECIFICATIONS:
- ISO 7010 W011 compliant
- Yellow background creates high visibility
- Suitable for floor standing or wall mount
- Professional hospital quality`
  },

  cautionBiohazard: {
    id: 'cautionBiohazard',
    labelEnglish: 'BIOHAZARD',
    labelHindi: 'जैव खतरा',
    category: 'warning',
    isoCode: 'W009',
    prompt: `Create a professional hospital "BIOHAZARD" warning sign.

CRITICAL VISUAL REQUIREMENTS:
- Large YELLOW triangle with BLACK border
- BLACK biohazard symbol (three interlocking crescents forming the universal biohazard icon)
- The biohazard symbol must be accurate and recognizable

TEXT REQUIREMENTS:
- "BIOHAZARD" in bold BLACK uppercase
- "CAUTION: Infectious Materials"
- Hindi: "जैव खतरा" and "सावधान: संक्रामक सामग्री"

DESIGN SPECIFICATIONS:
- Standard biohazard warning
- High contrast yellow-black
- Professional medical facility quality`
  },

  // ============ MANDATORY SIGNS (Blue Circle) ============
  wearMask: {
    id: 'wearMask',
    labelEnglish: 'WEAR MASK',
    labelHindi: 'मास्क पहनें',
    category: 'mandatory',
    isoCode: 'M016',
    prompt: `Create a professional hospital "WEAR MASK" mandatory sign.

CRITICAL VISUAL REQUIREMENTS:
- Large BLUE circle (Pantone 300) - solid blue background
- WHITE icon showing: human face profile wearing a face mask
- The mask should be clearly visible covering nose and mouth
- Simple, clean icon design

TEXT REQUIREMENTS:
- "WEAR MASK" in bold text below
- "MANDATORY" as subtitle
- Hindi: "मास्क पहनें" and "अनिवार्य"
- "For Your Safety & Others / आपकी और दूसरों की सुरक्षा के लिए"

DESIGN SPECIFICATIONS:
- ISO 7010 M016 compliant
- Blue indicates mandatory action
- Professional hospital signage
- Clear from 5+ meters distance`
  },

  washHands: {
    id: 'washHands',
    labelEnglish: 'WASH YOUR HANDS',
    labelHindi: 'अपने हाथ धोएं',
    category: 'mandatory',
    isoCode: 'M011',
    prompt: `Create a professional hospital "WASH YOUR HANDS" mandatory sign.

CRITICAL VISUAL REQUIREMENTS:
- Large BLUE circle - solid blue background
- WHITE icon showing: two hands under water droplets
- Water tap or faucet symbol above the hands
- Soap bubbles around the hands

TEXT REQUIREMENTS:
- "WASH YOUR HANDS" in bold text
- "20 SECONDS MINIMUM"
- Hindi: "अपने हाथ धोएं" and "कम से कम 20 सेकंड"
- "Prevent Infection / संक्रमण रोकें"

DESIGN SPECIFICATIONS:
- ISO 7010 M011 compliant
- Healthcare hand hygiene standard
- Professional quality
- Suitable for placement near sinks`
  },

  sanitizeHands: {
    id: 'sanitizeHands',
    labelEnglish: 'SANITIZE HANDS',
    labelHindi: 'हाथ सैनिटाइज करें',
    category: 'mandatory',
    prompt: `Create a professional hospital "SANITIZE HANDS" mandatory sign.

CRITICAL VISUAL REQUIREMENTS:
- Large BLUE circle - solid blue background
- WHITE icon showing: hand with sanitizer bottle/dispenser
- Droplet falling onto palm
- Clean, simple icon

TEXT REQUIREMENTS:
- "SANITIZE HANDS" in bold text
- "Before Entry"
- Hindi: "हाथ सैनिटाइज करें" and "प्रवेश से पहले"

DESIGN SPECIFICATIONS:
- Hospital infection control standard
- Blue mandatory color scheme
- Professional quality`
  },

  // ============ SAFETY/EMERGENCY SIGNS (Green) ============
  emergencyExit: {
    id: 'emergencyExit',
    labelEnglish: 'EMERGENCY EXIT',
    labelHindi: 'आपातकालीन निकास',
    category: 'safety',
    isoCode: 'E001',
    prompt: `Create a professional hospital "EMERGENCY EXIT" safety sign.

CRITICAL VISUAL REQUIREMENTS:
- GREEN rectangle (Pantone 356) background
- WHITE icon showing: running person figure moving toward a door
- Arrow pointing in exit direction (pointing right)
- Door frame with person passing through

TEXT REQUIREMENTS:
- "EMERGENCY EXIT" in bold WHITE text
- Arrow direction indicator
- Hindi: "आपातकालीन निकास"
- "In Case of Emergency / आपातकाल में"

DESIGN SPECIFICATIONS:
- ISO 7010 E001/E002 compliant
- Green indicates safety/escape route
- Must be visible in low light (photoluminescent style)
- Professional hospital emergency signage`
  },

  firstAid: {
    id: 'firstAid',
    labelEnglish: 'FIRST AID',
    labelHindi: 'प्राथमिक चिकित्सा',
    category: 'safety',
    isoCode: 'E003',
    prompt: `Create a professional hospital "FIRST AID" safety sign.

CRITICAL VISUAL REQUIREMENTS:
- GREEN square/rectangle background
- WHITE cross symbol (medical/first aid cross)
- Cross should be bold and centered
- Clean, simple design

TEXT REQUIREMENTS:
- "FIRST AID" in bold WHITE text
- Hindi: "प्राथमिक चिकित्सा"
- Optional: Arrow indicating direction

DESIGN SPECIFICATIONS:
- ISO 7010 E003 compliant
- Universal first aid symbol
- High visibility green-white contrast
- Hospital standard signage`
  },

  assemblyPoint: {
    id: 'assemblyPoint',
    labelEnglish: 'ASSEMBLY POINT',
    labelHindi: 'एकत्रित स्थान',
    category: 'safety',
    isoCode: 'E007',
    prompt: `Create a professional hospital "ASSEMBLY POINT" safety sign.

CRITICAL VISUAL REQUIREMENTS:
- GREEN square background
- WHITE icon showing: group of people figures (4 people standing together)
- Location marker or gathering symbol

TEXT REQUIREMENTS:
- "ASSEMBLY POINT" in bold WHITE text
- "Emergency Gathering Area"
- Hindi: "एकत्रित स्थान" and "आपातकालीन सभा स्थल"

DESIGN SPECIFICATIONS:
- ISO 7010 E007 compliant
- Fire safety evacuation standard
- Visible from distance
- Professional quality`
  },

  // ============ FIRE SAFETY SIGNS (Red Square) ============
  fireExtinguisher: {
    id: 'fireExtinguisher',
    labelEnglish: 'FIRE EXTINGUISHER',
    labelHindi: 'अग्निशामक',
    category: 'fire',
    isoCode: 'F001',
    prompt: `Create a professional hospital "FIRE EXTINGUISHER" sign.

CRITICAL VISUAL REQUIREMENTS:
- RED square/rectangle background (Pantone 485)
- WHITE icon showing: fire extinguisher silhouette
- Extinguisher should show handle, nozzle, and cylinder clearly
- Flames icon optional (being extinguished)

TEXT REQUIREMENTS:
- "FIRE EXTINGUISHER" in bold WHITE text
- Hindi: "अग्निशामक"
- "Pull Pin, Aim, Squeeze, Sweep" instruction icons optional

DESIGN SPECIFICATIONS:
- ISO 7010 F001 compliant
- Fire safety equipment identification
- Red-white high contrast
- Professional hospital safety signage`
  },

  fireAlarm: {
    id: 'fireAlarm',
    labelEnglish: 'FIRE ALARM',
    labelHindi: 'अग्नि अलार्म',
    category: 'fire',
    isoCode: 'F005',
    prompt: `Create a professional hospital "FIRE ALARM CALL POINT" sign.

CRITICAL VISUAL REQUIREMENTS:
- RED square background
- WHITE icon showing: hand pressing alarm button
- Alarm bell or siren symbol
- "Break Glass" indicator

TEXT REQUIREMENTS:
- "FIRE ALARM" in bold WHITE text
- "BREAK GLASS - PRESS HERE"
- Hindi: "अग्नि अलार्म" and "कांच तोड़ें - यहां दबाएं"

DESIGN SPECIFICATIONS:
- ISO 7010 F005 compliant
- Fire alarm call point identification
- High visibility
- Professional quality`
  },

  // ============ INFORMATION SIGNS (Blue Rectangle) ============
  icuRestricted: {
    id: 'icuRestricted',
    labelEnglish: 'ICU - RESTRICTED ENTRY',
    labelHindi: 'आईसीयू - प्रतिबंधित प्रवेश',
    category: 'information',
    prompt: `Create a professional hospital "ICU RESTRICTED ENTRY" information sign.

CRITICAL VISUAL REQUIREMENTS:
- BLUE header bar with "ICU" prominently displayed
- WHITE background for main content
- Medical cross or heart monitor icon
- Subtle restriction indicator

TEXT REQUIREMENTS:
- "INTENSIVE CARE UNIT" as main heading
- "ICU" in large letters
- "RESTRICTED ENTRY"
- "Visitors by Permission Only"
- Hindi: "गहन चिकित्सा इकाई", "प्रतिबंधित प्रवेश", "केवल अनुमति से आगंतुक"

DESIGN SPECIFICATIONS:
- Professional hospital ward signage
- Blue-white color scheme
- Clear, readable from hallway
- Medical facility standard`
  },

  operationTheatre: {
    id: 'operationTheatre',
    labelEnglish: 'OPERATION THEATRE',
    labelHindi: 'ऑपरेशन थियेटर',
    category: 'information',
    prompt: `Create a professional hospital "OPERATION THEATRE" sign.

CRITICAL VISUAL REQUIREMENTS:
- BLUE or GREEN header (surgical green preferred)
- WHITE background
- Surgical lamp or scalpel icon
- "OT" abbreviation prominently shown

TEXT REQUIREMENTS:
- "OPERATION THEATRE" as main heading
- "OT" in large letters
- "STERILE ZONE - NO UNAUTHORIZED ENTRY"
- Hindi: "ऑपरेशन थियेटर", "रोगाणुमुक्त क्षेत्र", "अनधिकृत प्रवेश निषेध"

DESIGN SPECIFICATIONS:
- Surgical suite standard signage
- Professional medical facility quality
- Clean, sterile appearance
- High visibility`
  },

  visitorGuidelines: {
    id: 'visitorGuidelines',
    labelEnglish: 'VISITOR GUIDELINES',
    labelHindi: 'आगंतुक दिशानिर्देश',
    category: 'information',
    prompt: `Create a professional hospital "VISITOR GUIDELINES" information sign.

VISUAL REQUIREMENTS:
- BLUE header bar
- WHITE background with structured content
- Numbered list or bullet points
- Visitor/family icon

TEXT REQUIREMENTS (bilingual list):
1. Visiting Hours: 10 AM - 12 PM, 4 PM - 6 PM / भेंट समय
2. Maximum 2 visitors per patient / अधिकतम 2 आगंतुक
3. No children under 12 / 12 वर्ष से कम बच्चे नहीं
4. Maintain silence / शांति बनाए रखें
5. Sanitize hands before entry / प्रवेश से पहले हाथ साफ करें

DESIGN SPECIFICATIONS:
- Detailed information board style
- Readable A4 or A3 format
- Professional hospital information signage
- Clear typography`
  },

  patientRights: {
    id: 'patientRights',
    labelEnglish: 'PATIENT RIGHTS',
    labelHindi: 'रोगी के अधिकार',
    category: 'information',
    prompt: `Create a professional hospital "PATIENT RIGHTS" information board.

VISUAL REQUIREMENTS:
- BLUE header with hospital logo placeholder
- WHITE background
- Numbered list format
- Medical care/heart icon

TEXT REQUIREMENTS (key rights in bilingual):
- Right to Information / सूचना का अधिकार
- Right to Privacy / गोपनीयता का अधिकार
- Right to Consent / सहमति का अधिकार
- Right to Quality Care / गुणवत्ता देखभाल का अधिकार
- Right to Complain / शिकायत का अधिकार

DESIGN SPECIFICATIONS:
- NABH compliance standard
- Professional information board
- A3 poster format
- Clear, dignified presentation`
  },

  handHygieneSteps: {
    id: 'handHygieneSteps',
    labelEnglish: 'HAND HYGIENE - 5 MOMENTS',
    labelHindi: 'हाथ स्वच्छता - 5 क्षण',
    category: 'information',
    prompt: `Create a professional hospital "5 MOMENTS OF HAND HYGIENE" educational poster.

VISUAL REQUIREMENTS:
- WHO 5 Moments circular diagram
- Patient bed in center
- 5 numbered moments around the patient
- Hand washing icons for each moment

5 MOMENTS (with icons):
1. Before touching patient / रोगी को छूने से पहले
2. Before clean/aseptic procedure / स्वच्छ प्रक्रिया से पहले
3. After body fluid exposure / शारीरिक द्रव संपर्क के बाद
4. After touching patient / रोगी को छूने के बाद
5. After touching patient surroundings / रोगी के परिवेश को छूने के बाद

DESIGN SPECIFICATIONS:
- WHO/NABH hand hygiene standard
- Educational poster format
- Color-coded moments
- Professional healthcare quality
- A3 size suitable`
  },

  silenceZone: {
    id: 'silenceZone',
    labelEnglish: 'SILENCE PLEASE',
    labelHindi: 'कृपया शांति रखें',
    category: 'information',
    prompt: `Create a professional hospital "SILENCE PLEASE" sign.

VISUAL REQUIREMENTS:
- Soft BLUE or TEAL background
- WHITE "Shh" finger to lips icon
- Sound wave with cross/mute symbol
- Peaceful, calming design

TEXT REQUIREMENTS:
- "SILENCE PLEASE" in elegant text
- "QUIET ZONE"
- "Patient Rest Area"
- Hindi: "कृपया शांति रखें", "शांत क्षेत्र", "रोगी विश्राम क्षेत्र"

DESIGN SPECIFICATIONS:
- Hospital quiet zone standard
- Calming visual design
- Professional but gentle appearance`
  },
};

// Generate prompt for custom signage
export function generateCustomSignagePrompt(
  text: string,
  category: SignCategory,
  hindiText?: string
): string {
  const categoryStyles: Record<SignCategory, string> = {
    prohibition: 'RED circle with WHITE background and RED diagonal bar crossing through the symbol',
    warning: 'YELLOW triangle with BLACK border and BLACK symbol inside',
    mandatory: 'BLUE circle with WHITE symbol inside',
    safety: 'GREEN rectangle with WHITE symbol and text',
    fire: 'RED square/rectangle with WHITE symbol and text',
    information: 'BLUE header bar with WHITE background for content',
  };

  return `Create a professional hospital signage for: "${text}"

SIGN CATEGORY: ${category.toUpperCase()}
VISUAL STYLE: ${categoryStyles[category]}

TEXT REQUIREMENTS:
- Main text in English: "${text}"
- Hindi translation: "${hindiText || 'Please include appropriate Hindi translation'}"
- Bilingual format with English prominent, Hindi below

DESIGN SPECIFICATIONS:
- ISO 7010 compliant styling where applicable
- Professional hospital-grade quality
- High contrast for visibility
- Clean, simple, functional design
- Square or portrait format suitable for A4 printing
- No decorative flourishes - strictly professional safety/information signage
- Must be clearly readable from 5+ meters distance`;
}

// Gemini API call for image generation using Nano Banana 2.0 (gemini-2.5-flash-image)
export async function generateSignageImage(
  templateId: string,
  customPrompt?: string
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Get the prompt - either from template or custom
  let prompt: string;

  if (templateId && signageTemplates[templateId]) {
    const template = signageTemplates[templateId];
    prompt = template.prompt;
  } else if (customPrompt) {
    prompt = customPrompt;
  } else {
    throw new Error('No template or custom prompt provided');
  }

  // Simplified prompt for image generation - FLAT PRINT-READY SIGNAGE
  const template = templateId ? signageTemplates[templateId] : null;
  const imagePrompt = template
    ? `Generate a FLAT, PRINT-READY hospital safety sign.

CRITICAL: This must be the sign ONLY - NO background, NO wall, NO environment, NO shadows, NO 3D perspective. Just the flat rectangular sign graphic on a pure white background, ready to print and cut out.

Sign Type: ${template.labelEnglish}
Category: ${template.category}

Visual Design:
- Pure WHITE rectangular background (the sign itself)
- Thin border around the sign edge
${template.category === 'prohibition' ? '- Large RED circle with RED diagonal bar, BLACK symbol inside (like no-smoking symbol)' :
  template.category === 'warning' ? '- Large YELLOW triangle with BLACK border, BLACK warning symbol' :
  template.category === 'mandatory' ? '- Large BLUE filled circle with WHITE symbol inside' :
  template.category === 'safety' ? '- Large GREEN rectangle/square with WHITE symbol' :
  template.category === 'fire' ? '- Large RED rectangle with WHITE fire safety symbol' :
  '- Clean informational layout with blue accents'}

TEXT (EXACT SPELLING REQUIRED):
- "${template.labelEnglish}" in bold letters below symbol
- "${template.labelHindi}" in Devanagari script below English
- Centered text alignment

OUTPUT REQUIREMENTS:
- Flat 2D graphic design only
- No photorealistic rendering
- No wall or mounting shown
- No shadows or 3D effects
- Clean vector-style appearance
- White background fills entire image
- Ready to print on A4 paper`
    : prompt;

  try {
    // Use Nano Banana Pro (gemini-3-pro-image-preview) as PRIMARY for better text rendering
    console.log('Generating image with gemini-3-pro-image-preview (Nano Banana Pro)');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: imagePrompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Nano Banana Pro API error:', errorData);

      // If Nano Banana Pro fails, try Nano Banana 2.0 as fallback
      console.log('Trying fallback: gemini-2.5-flash-image (Nano Banana 2.0)');
      return await generateSignageImageFallback(imagePrompt, apiKey);
    }

    const data = await response.json();
    console.log('Nano Banana Pro response:', data.candidates?.length, 'candidates');

    // Extract image from response
    const parts = data.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        console.log('Image generated successfully with Nano Banana Pro');
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error('No image in response from Nano Banana Pro');

  } catch (error: any) {
    console.error('Signage image generation error:', error);
    // Try Nano Banana 2.0 as fallback
    try {
      return await generateSignageImageFallback(imagePrompt, apiKey);
    } catch (altError) {
      throw error;
    }
  }
}

// Fallback: Nano Banana 2.0 (gemini-2.5-flash-image)
async function generateSignageImageFallback(
  prompt: string,
  apiKey: string
): Promise<string> {
  console.log('Using fallback: gemini-2.5-flash-image');
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Nano Banana 2.0 fallback error:', errorData);
    throw new Error(errorData.error?.message || 'Failed to generate image with Nano Banana 2.0');
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      console.log('Image generated with fallback (Nano Banana 2.0)');
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error('No image generated by Nano Banana 2.0 fallback');
}

// Alternative: Generate SVG signage (fallback if image generation fails)
export async function generateSignageSVG(
  templateId: string
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const template = signageTemplates[templateId];
  if (!template) {
    throw new Error('Template not found');
  }

  // Get category-specific SVG instructions
  const categoryInstructions = getSVGInstructionsForCategory(template.category, template.id);

  const svgPrompt = `You are an expert SVG designer specializing in safety signage. Create a professional, ISO 7010 compliant hospital sign.

SIGN SPECIFICATIONS:
- Type: ${template.labelEnglish}
- Hindi: ${template.labelHindi}
- Category: ${template.category.toUpperCase()}
- ISO Code: ${template.isoCode || 'Standard'}

${categoryInstructions}

CRITICAL SVG REQUIREMENTS:
1. Output ONLY valid SVG code - no markdown, no explanation
2. Dimensions: viewBox="0 0 400 500" (portrait orientation)
3. White background rectangle as first element
4. Use exact colors: ${getColorForCategory(template.category)}
5. Symbol must be large and centered (at least 200px)
6. Text positioning:
   - English text: bold, 24-32px, centered below symbol
   - Hindi text: 18-22px, centered below English
   - Footer text: 12px at bottom
7. Use font-family="Arial, sans-serif"
8. Ensure 10px padding from edges

START YOUR RESPONSE WITH <svg AND END WITH </svg>`;

  // Use gemini-1.5-flash for SVG text generation (widely available)
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: svgPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('SVG generation API error:', errorData);
    throw new Error(errorData.error?.message || 'Failed to generate SVG');
  }

  const data = await response.json();
  console.log('SVG API response received:', data.candidates?.length, 'candidates');

  let svgText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!svgText) {
    console.error('No text in response:', data);
    throw new Error('No SVG content in response');
  }

  // Clean up SVG
  svgText = svgText.replace(/```svg/gi, '').replace(/```xml/gi, '').replace(/```/g, '').trim();

  // Extract SVG if wrapped in other text
  const svgMatch = svgText.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch) {
    console.log('SVG extracted successfully, length:', svgMatch[0].length);
    return svgMatch[0];
  }

  console.error('Could not extract SVG from response:', svgText.substring(0, 200));
  throw new Error('Invalid SVG response - no valid SVG found');
}

function getColorForCategory(category: SignCategory): string {
  const colors: Record<SignCategory, string> = {
    prohibition: 'Red #D32F2F for circle and bar, white background, black symbol',
    warning: 'Yellow #FFC107 fill, black #000000 border and symbol',
    mandatory: 'Blue #1976D2 circle fill, white #FFFFFF symbol',
    safety: 'Green #388E3C background, white #FFFFFF symbol and text',
    fire: 'Red #D32F2F background, white #FFFFFF symbol and text',
    information: 'Blue #1976D2 header, white #FFFFFF background for content',
  };
  return colors[category];
}

function getSVGInstructionsForCategory(category: SignCategory, templateId: string): string {
  const instructions: Record<SignCategory, string> = {
    prohibition: `PROHIBITION SIGN STRUCTURE:
- Draw a large RED circle (stroke-width="20", fill="none", stroke="#D32F2F")
- Inside: WHITE filled circle as background
- Center: BLACK symbol (cigarette for no-smoking, person for no-entry, phone for no-mobile)
- RED diagonal bar from top-left to bottom-right crossing the symbol (stroke-width="20")
- The bar should be at 45 degrees

SYMBOL DETAILS FOR ${templateId}:
${templateId === 'noSmoking' ? '- Draw a cigarette shape: rectangle with rounded end, small smoke wisps' : ''}
${templateId === 'noEntry' ? '- Draw a horizontal white bar inside red circle (no diagonal bar needed)' : ''}
${templateId === 'noMobilePhone' ? '- Draw a smartphone outline with signal waves' : ''}`,

    warning: `WARNING SIGN STRUCTURE:
- Draw a large YELLOW triangle pointing up (fill="#FFC107")
- BLACK border on triangle (stroke="#000000", stroke-width="8")
- CENTER: BLACK warning symbol
- Triangle should have rounded corners

SYMBOL FOR ${templateId}:
${templateId === 'cautionWetFloor' ? '- Draw a stick figure slipping (one leg forward, arms out)' : ''}
${templateId === 'cautionBiohazard' ? '- Draw the biohazard symbol (three interlocking crescents)' : ''}`,

    mandatory: `MANDATORY SIGN STRUCTURE:
- Draw a large BLUE filled circle (fill="#1976D2")
- CENTER: WHITE symbol

SYMBOL FOR ${templateId}:
${templateId === 'wearMask' ? '- Draw a face profile with mask covering nose and mouth' : ''}
${templateId === 'washHands' ? '- Draw two hands under water droplets with soap bubbles' : ''}
${templateId === 'sanitizeHands' ? '- Draw a hand with sanitizer bottle dispensing liquid' : ''}`,

    safety: `SAFETY/EMERGENCY SIGN STRUCTURE:
- GREEN rectangle background (fill="#388E3C")
- WHITE symbol and text

SYMBOL FOR ${templateId}:
${templateId === 'emergencyExit' ? '- Draw running person figure moving toward door with arrow' : ''}
${templateId === 'firstAid' ? '- Draw a white cross (first aid symbol)' : ''}
${templateId === 'assemblyPoint' ? '- Draw 4 person figures grouped together with location marker' : ''}`,

    fire: `FIRE SAFETY SIGN STRUCTURE:
- RED square/rectangle background (fill="#D32F2F")
- WHITE symbol

SYMBOL FOR ${templateId}:
${templateId === 'fireExtinguisher' ? '- Draw fire extinguisher silhouette (cylinder with handle and nozzle)' : ''}
${templateId === 'fireAlarm' ? '- Draw alarm bell with hand pressing button' : ''}`,

    information: `INFORMATION SIGN STRUCTURE:
- BLUE header bar at top (fill="#1976D2", height ~80px)
- WHITE main content area
- Structured text layout

LAYOUT FOR ${templateId}:
- Title in header (white text)
- Numbered list or bullet points in content area
- Footer with hospital info`,
  };

  return instructions[category] || '';
}

// Get all templates grouped by category
export function getTemplatesByCategory(): Record<SignCategory, SignageTemplate[]> {
  const grouped: Record<SignCategory, SignageTemplate[]> = {
    prohibition: [],
    warning: [],
    mandatory: [],
    safety: [],
    fire: [],
    information: [],
  };

  for (const template of Object.values(signageTemplates)) {
    grouped[template.category].push(template);
  }

  return grouped;
}

export default signageTemplates;
