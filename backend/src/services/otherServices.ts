import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

export interface OCRRequest {
  imageBase64?: string;
  documentType?:
    | 'prescription'
    | 'sign'
    | 'general'
    | 'medical_report'
    | 'form'
    | 'notice'
    | 'photo';
  language?: string;
}

export interface EmergencyAlertRequest {
  contactName: string;
  contactPhone: string;
  message: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

export interface HealthcareAnalysisRequest {
  documentText: string;
  language?: string;
}

export class OtherServices {
  private getGeminiClient(): GoogleGenAI {
    if (!env.GEMINI_API_KEY) {
      throw new Error(
        'Gemini API key is missing. Configure GEMINI_API_KEY in backend/.env.'
      );
    }

    return new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });
  }

  /**
   * Real image understanding using Gemini.
   * Supports documents, photographs, screenshots and signs.
   */
  async processOCR(req: OCRRequest) {
    if (!req.imageBase64) {
      throw new Error('Please upload an image to analyze.');
    }

    const match = req.imageBase64.match(
      /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
    );

    const mimeType = match ? match[1] : 'image/jpeg';
    const imageData = match ? match[2] : req.imageBase64;

    if (!/^image\/(jpeg|png|webp|gif)$/.test(mimeType)) {
      throw new Error('Unsupported image format. Use JPEG, PNG or WEBP.');
    }

    if (!imageData || !/^[A-Za-z0-9+/=\s]+$/.test(imageData)) {
      throw new Error('The uploaded image data is invalid.');
    }

    const normalizedImage = imageData.replace(/\s/g, '');

    if (normalizedImage.length > 15 * 1024 * 1024) {
      throw new Error('Image is too large. Please upload a smaller image.');
    }

    const ai = this.getGeminiClient();

    const documentType = req.documentType || 'general';
    const language = req.language || 'simple English';

    const prompt = `
You are SAHAAYA, an accessibility assistant.

Analyze the actual uploaded image.

Possible image types:
- Medical prescriptions
- Medical reports and laboratory results
- Government forms
- Notices and announcements
- Signboards and directions
- Ordinary photographs
- Website and mobile application screenshots
- Other documents and images

The selected category from the application is: ${documentType}.

Your tasks:

1. Identify what the image contains.
2. Read and extract all clearly visible text.
3. Explain the image in simple ${language}.
4. Identify important names, dates, numbers, instructions and deadlines.
5. Organize the information using readable headings.
6. If it is a photograph, describe the visible scene and important objects.
7. If it is a screenshot, explain the visible interface and important elements.
8. If it is a signboard, explain its directions or instructions.
9. If it is a form, explain its purpose and important fields.

MEDICAL SAFETY:
- Never invent medicine names, strengths or dosages.
- Clearly mark unclear or unreadable handwriting.
- Do not recommend starting, stopping or changing medicines.
- Do not diagnose diseases.
- Explain laboratory values without claiming a diagnosis.
- Advise the user to verify unclear medical instructions with a doctor or pharmacist.

IMPORTANT:
- Analyze only what is actually visible.
- Do not assume every uploaded image is a prescription.
- If something cannot be read, say so.
- Do not invent missing information.

Return the result in this structure:

IMAGE TYPE:
[Identified image category]

EXTRACTED TEXT:
[Visible text from the image]

SIMPLE EXPLANATION:
[Easy-to-understand explanation]

IMPORTANT INFORMATION:
[Important dates, numbers, names and instructions]

ACCESSIBILITY DESCRIPTION:
[A concise description suitable for reading aloud]

CAUTION:
[Relevant warning, or state that no special caution was identified.]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType,
            data: normalizedImage,
          },
        },
        prompt,
      ],
    });

    const resultText = response.text?.trim();

    if (!resultText) {
      throw new Error('Gemini did not return an analysis. Please try again.');
    }

    return {
      success: true,
      configured: true,
      demo: false,
      provider: 'Google Gemini',
      documentType,
      extractedText: resultText,
      analysis: resultText,
      confidence: null,
      blocks: [],
      message: 'Image successfully analyzed using Gemini AI.',
    };
  }

  /**
   * Emergency alert.
   *
   * This remains a simulation until a real SMS provider
   * and verified emergency workflow are implemented.
   */
  async dispatchEmergencyAlert(req: EmergencyAlertRequest) {
    if (!req.contactName || !req.contactPhone) {
      throw new Error('Emergency contact details are required.');
    }

    return {
      success: true,
      configured: false,
      demo: true,
      alertId: `sos-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipient: {
        name: req.contactName,
        phone: req.contactPhone,
      },
      coordinates: req.location || null,
      message:
        'Demo emergency alert created. No SMS has actually been sent.',
      status: 'simulated',
    };
  }

  /**
   * Real plain-language analysis of extracted medical text.
   */
  async analyzeHealthcareDocument(req: HealthcareAnalysisRequest) {
    if (!req.documentText?.trim()) {
      throw new Error('No document text was provided.');
    }

    const ai = this.getGeminiClient();

    const prompt = `
You are SAHAAYA, an accessibility assistant.

Explain the following medical document in simple ${
      req.language || 'English'
    }.

DOCUMENT:
${req.documentText}

Instructions:

1. Explain the document in simple language.
2. Identify medicine names and strengths only when clearly present.
3. Explain written instructions without changing them.
4. Explain medical report values without diagnosing.
5. Identify unclear or missing information.
6. Never invent medicine dosages or medical instructions.
7. Never recommend changing prescribed treatment.
8. Recommend checking uncertain instructions with a qualified doctor
   or pharmacist.

Return:
- Document summary
- Important findings or instructions
- Medicine information, if present
- Unclear information
- Safety note
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const analysis = response.text?.trim();

    if (!analysis) {
      throw new Error('Unable to analyze the medical document.');
    }

    return {
      success: true,
      configured: true,
      demo: false,
      provider: 'Google Gemini',
      message: 'Medical document analyzed.',
      analysis,
    };
  }

  /**
   * Navigation directory.
   *
   * These are sample locations, not live nearby results.
   */
  getPlaces() {
    return [
      {
        id: 'pl1',
        name: 'Victoria Hospital',
        category: 'hospital',
        address: 'K.R. Market, Bengaluru - 560002',
        distance: '1.2 km',
        accessible: true,
        destinations: [
          'Reception',
          'Registration',
          'Emergency',
          'Pharmacy',
          'Radiology',
        ],
      },
      {
        id: 'pl2',
        name: 'Bowring & Lady Curzon Hospital',
        category: 'hospital',
        address: 'Shivaji Nagar, Bengaluru - 560001',
        distance: '2.8 km',
        accessible: true,
        destinations: [
          'Reception',
          'Emergency',
          'Pharmacy',
          'OPD',
        ],
      },
      {
        id: 'pl3',
        name: 'KSR Bengaluru City Railway Station',
        category: 'railway',
        address: 'Gubbi Thotadappa Road, Bengaluru - 560023',
        distance: '3.1 km',
        accessible: true,
        destinations: [
          'Platform 1',
          'Platform 2',
          'Platform 3',
          'Ticket Counter',
          'Enquiry',
        ],
      },
      {
        id: 'pl4',
        name: 'Kempegowda Bus Station (Majestic)',
        category: 'bus',
        address: 'Gubbi Thotadappa Road, Bengaluru',
        distance: '3.4 km',
        accessible: true,
        destinations: [
          'KSRTC Booking',
          'Platform Bay 1-5',
          'Information Desk',
        ],
      },
    ];
  }
}

export const otherServices = new OtherServices();