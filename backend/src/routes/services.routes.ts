import { Router, Request, Response } from 'express';
import { otherServices } from '../services/otherServices.js';

export const servicesRouter = Router();

/**
 * POST /api/ocr
 * Real Gemini image understanding
 *
 * Supports:
 * - Prescriptions
 * - Medical reports
 * - Government forms
 * - Notices
 * - Signboards
 * - Photographs
 * - Screenshots
 */
servicesRouter.post('/ocr', async (req: Request, res: Response) => {
  try {
    const {
      imageBase64,
      documentType,
      language,
    } = req.body || {};

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Please upload a valid image.',
      });
      return;
    }

    const allowedTypes = [
      'prescription',
      'sign',
      'general',
      'medical_report',
      'form',
      'notice',
      'photo',
    ];

    if (
      documentType &&
      !allowedTypes.includes(documentType)
    ) {
      res.status(400).json({
        success: false,
        message: 'Unsupported document type.',
      });
      return;
    }

    const result = await otherServices.processOCR({
      imageBase64,
      documentType,
      language,
    });

    res.status(200).json(result);

  } catch (error) {
    console.error('Gemini image analysis error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Unable to analyze the uploaded image.';

    const status = message.includes('API key is missing')
      ? 503
      : message.includes('Please upload') ||
        message.includes('invalid') ||
        message.includes('Unsupported') ||
        message.includes('too large')
      ? 400
      : 502;

    res.status(status).json({
      success: false,
      demo: false,
      message,
    });
  }
});


/**
 * POST /api/emergency/alert
 * Emergency SOS notification
 *
 * Currently simulated. No real SMS is sent.
 */
servicesRouter.post(
  '/emergency/alert',
  async (req: Request, res: Response) => {
    try {
      const {
        contactName,
        contactPhone,
        message,
        location,
      } = req.body || {};

      if (
        !contactName ||
        typeof contactName !== 'string' ||
        !contactPhone ||
        typeof contactPhone !== 'string'
      ) {
        res.status(400).json({
          success: false,
          message: 'Valid emergency contact name and phone are required.',
        });
        return;
      }

      const result =
        await otherServices.dispatchEmergencyAlert({
          contactName,
          contactPhone,
          message:
            message ||
            'Emergency SOS alert from SAHAAYA user.',
          location,
        });

      res.status(200).json(result);

    } catch (error) {
      console.error('Emergency alert error:', error);

      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Emergency alert failed.',
      });
    }
  }
);


/**
 * GET /api/places
 * Sample hospital and public transit directory
 */
servicesRouter.get('/places', (_req: Request, res: Response) => {
  try {
    const places = otherServices.getPlaces();

    res.status(200).json({
      success: true,
      demo: true,
      count: places.length,
      places,
    });

  } catch (error) {
    console.error('Places error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to retrieve places.',
    });
  }
});


/**
 * POST /api/healthcare/analyze
 * Real Gemini medical document explanation
 */
servicesRouter.post(
  '/healthcare/analyze',
  async (req: Request, res: Response) => {
    try {
      const {
        documentText,
        language,
      } = req.body || {};

      if (
        !documentText ||
        typeof documentText !== 'string' ||
        !documentText.trim()
      ) {
        res.status(400).json({
          success: false,
          message: 'Please provide document text.',
        });
        return;
      }

      const result =
        await otherServices.analyzeHealthcareDocument({
          documentText,
          language,
        });

      res.status(200).json(result);

    } catch (error) {
      console.error('Healthcare analysis error:', error);

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to analyze the medical document.';

      res.status(
        message.includes('API key is missing') ? 503 : 502
      ).json({
        success: false,
        demo: false,
        message,
      });
    }
  }
);