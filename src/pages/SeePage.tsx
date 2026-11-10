import { useState } from 'react';
import {
  Eye,
  Camera,
  Upload,
  Volume2,
  Square,
  Copy,
  Check,
  RotateCw,
  FileText,
  MapPin,
  Sparkles,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Disclaimer from '../components/ui/Disclaimer';
import { SAMPLE_SIGN_RECOGNITIONS } from '../data/mockData';
import { createWorker } from 'tesseract.js';
import { ttsService } from '../services/textToSpeech';
import { useApp } from '../context/AppContext';
import type { OCRResult } from '../services/ocr';

const PRESET_SAMPLES = [
  {
    id: 'sample-prescription',
    title: 'Hospital Prescription',
    badge: 'Medical',
    preview: 'Dr. Anand Mehta, MD — Rx: Amoxicillin 500mg, Pantoprazole 40mg...',
    text: `Dr. Anand Mehta, MD\nDate: 31/10/2026\nPatient: Demo Patient\n\nRx:\n1. Amoxicillin 500mg — 1 tablet three times daily after meals, 5 days\n2. Pantoprazole 40mg — 1 tablet once daily before breakfast\n\nPlease complete full course of antibiotics.\nFollow up after 5 days if symptoms persist.`,
  },
  {
    id: 'sample-sign',
    title: 'Station Platform Sign',
    badge: 'Transit',
    preview: 'Platform 3 — Rajdhani Express 12431 to New Delhi Departure 14:30',
    text: `PLATFORM 3\nNORTHBOUND EXPRESS\nTRAIN 12431: RAJDHANI EXPRESS\nDEPARTURE: 14:30 HRS\nCOACHES: A1 - B6, GEN 1-4\nACCESSIBLE RAMP LOCATED AT MIDDLE BAY`,
  },
  {
    id: 'sample-counter',
    title: 'Hospital OPD Counter',
    badge: 'Guidance',
    preview: 'Registration Counter 3 — Senior Citizens & Persons with Disabilities',
    text: `VICTORIA HOSPITAL OPD\nCOUNTER NUMBER 3\nPRIORITY QUEUE: SENIOR CITIZENS & PERSONS WITH DISABILITIES\nPLEASE HAVE YOUR AADHAAR / REGISTRATION CARD READY\nWORKING HOURS: 08:30 AM TO 04:00 PM`,
  },
];
function generateDocumentSummary(text: string) {
  const clean = text.replace(/\r/g, '').trim();
  const upper = clean.toUpperCase();

  const isMedicalReport =
    /LABORATORY TEST REPORT|TEST PARAMETER|CLINICAL PATHOLOGY|REFERENCE RANGE/.test(upper);

  const isPrescription =
    /\b(PRESCRIPTION|RX|MEDICATION|TABLET|CAPSULE|SYRUP)\b/.test(upper);

  const extract = (pattern: RegExp) =>
    clean.match(pattern)?.[1]?.trim() || 'Not clearly identified';

  if (isMedicalReport) {
    return {
      type: 'Medical Laboratory Report',
      items: [
        {
          label: 'Test',
          value: extract(/(?:STOOL FOR PH|TEST NAME|TEST PARAMETER)\s*:?\s*([^\n]+)/i),
        },
        {
          label: 'Result',
          value: extract(/STOOL FOR PH\s*\n?\s*([0-9]+(?:\.[0-9]+)?)/i),
        },
        {
          label: 'Reference range',
          value: extract(/([0-9]+(?:\.[0-9]+)?\s*[-–]\s*[0-9]+(?:\.[0-9]+)?)/),
        },
        {
          label: 'Sample type',
          value: extract(/SAMPLE TYPE\s*\n?\s*([A-Z]+)/i),
        },
        {
          label: 'Report status',
          value: extract(/REPORT STATUS\s*:?\s*([A-Z]+)/i),
        },
      ],
      summary:
        'This is a laboratory test report. Review the extracted test result and reference range with your healthcare professional. This summary is not a medical diagnosis.',
      warning:
        'Please verify all extracted values against the original report.',
    };
  }

  if (isPrescription) {
    const medicineLines = clean
      .split('\n')
      .map((line) => line.trim())
      .filter((line) =>
        /\b(rx|tablet|tab\.?|capsule|cap\.?|syrup|mg|mcg|ml|medicine)\b/i.test(line)
      )
      .slice(0, 10);

    return {
      type: 'Medical Prescription',
      items: medicineLines.map((line, index) => ({
        label: `Medicine detail ${index + 1}`,
        value: line,
      })),
      summary:
        medicineLines.length > 0
          ? 'Possible medicine instructions were detected. Please verify every medicine name, dosage, and instruction with a pharmacist or doctor.'
          : 'A prescription was detected, but medicine details could not be reliably extracted.',
      warning:
        'Do not use OCR output alone to decide medicine names or dosages.',
    };
  }

  return {
    type: 'Document',
    items: [],
    summary:
      'The document was scanned, but its type could not be confidently identified.',
    warning: 'Please check the original document.',
  };
}
export default function SeePage() {
  const { preferences } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESET_SAMPLES[0].id);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null); 
  const [reportQuestion, setReportQuestion] = useState('');
  const [reportAnswer, setReportAnswer] = useState('');   

 const handleFileUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please select an image file.');
    return;
  }

  setUploadedFileName(file.name);
  setIsScanning(true);
  setOcrResult(null);

  let worker: Awaited<ReturnType<typeof createWorker>> | undefined;
  let image: ImageBitmap | undefined;

  try {
    image = await createImageBitmap(file);

    // Resize while preserving the original aspect ratio.
    const scale = Math.min(
      3,
      3200 / Math.max(image.width, image.height)
    );

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Unable to process the uploaded image.');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Create two additional image versions for OCR.
    const originalCanvas = document.createElement('canvas');
    originalCanvas.width = canvas.width;
    originalCanvas.height = canvas.height;

    const originalCtx = originalCanvas.getContext('2d');

    if (!originalCtx) {
      throw new Error('Unable to prepare original image.');
    }

    originalCtx.drawImage(canvas, 0, 0);

    const enhancedCanvas = document.createElement('canvas');
    enhancedCanvas.width = canvas.width;
    enhancedCanvas.height = canvas.height;

    const enhancedCtx = enhancedCanvas.getContext('2d');

    if (!enhancedCtx) {
      throw new Error('Unable to enhance image.');
    }

    enhancedCtx.drawImage(canvas, 0, 0);

    const imageData = enhancedCtx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const pixels = imageData.data;

    // Grayscale and contrast enhancement.
    for (let i = 0; i < pixels.length; i += 4) {
      const gray =
        0.299 * pixels[i] +
        0.587 * pixels[i + 1] +
        0.114 * pixels[i + 2];

      const enhanced = Math.max(
        0,
        Math.min(255, (gray - 120) * 1.3 + 128)
      );

      pixels[i] = enhanced;
      pixels[i + 1] = enhanced;
      pixels[i + 2] = enhanced;
    }

    enhancedCtx.putImageData(imageData, 0, 0);

    // Third version: black-and-white threshold.
    const thresholdCanvas = document.createElement('canvas');
    thresholdCanvas.width = canvas.width;
    thresholdCanvas.height = canvas.height;

    const thresholdCtx = thresholdCanvas.getContext('2d');

    if (!thresholdCtx) {
      throw new Error('Unable to prepare threshold image.');
    }

    thresholdCtx.drawImage(enhancedCanvas, 0, 0);

    const thresholdData = thresholdCtx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const thresholdPixels = thresholdData.data;

    for (let i = 0; i < thresholdPixels.length; i += 4) {
      const gray = thresholdPixels[i];
      const value = gray > 175 ? 255 : 0;

      thresholdPixels[i] = value;
      thresholdPixels[i + 1] = value;
      thresholdPixels[i + 2] = value;
    }

    thresholdCtx.putImageData(thresholdData, 0, 0);

    // Run multiple OCR attempts.
    worker = await createWorker('eng');

    const attempts = [
      { image: originalCanvas, mode: '6' },
      { image: enhancedCanvas, mode: '6' },
      { image: enhancedCanvas, mode: '11' },
      { image: thresholdCanvas, mode: '6' },
      { image: originalCanvas, mode: '11' },
    ];

    let bestText = '';
    let bestConfidence = 0;
    let bestScore = -1;

    for (const attempt of attempts) {
      await worker.setParameters({
        preserve_interword_spaces: '1',
        tessedit_pageseg_mode: attempt.mode as any,
      });

      const result = await worker.recognize(attempt.image);

      const text = result.data.text.trim();
      const confidence = result.data.confidence / 100;

      // Prefer readable text with useful content.
      const words = text.match(/[A-Za-z0-9]+/g) || [];
      const readableWords = words.filter(
        (word) => /[A-Za-z]/.test(word) && word.length > 1
      );

      const readability =
        words.length > 0
          ? readableWords.length / words.length
          : 0;

      const score =
        confidence * 0.65 +
        readability * 0.20 +
        Math.min(words.length / 100, 1) * 0.15;

      console.log('OCR attempt:', {
        mode: attempt.mode,
        confidence,
        score,
        text,
      });

      if (text && score > bestScore) {
        bestScore = score;
        bestText = text;
        bestConfidence = confidence;
      }
    }

    setOcrResult({
      text: bestText || 'No readable text detected. Please try a clearer image.',
      confidence: bestText ? bestConfidence : 0,
      blocks: [],
    });

  } catch (error) {
    console.error('OCR error:', error);

    setOcrResult({
      text: 'Unable to extract text. Please try another image.',
      confidence: 0,
      blocks: [],
    });

  } finally {
    if (worker) {
      await worker.terminate();
    }

    if (image) {
      image.close();
    }

    setIsScanning(false);
    e.target.value = '';
  }
}; 

  const handleScanSample = (
    sampleText: string,
    sampleTitle: string
  ) => {
    setIsScanning(true);
    setOcrResult(null);

    console.log(`Scanning sample: ${sampleTitle}`);

    setTimeout(() => {
      setOcrResult({
        text: sampleText,
        confidence: 1,
        blocks: [],
      });

      setIsScanning(false);
    }, 500);
  };

  const handleSpeak = async (text: string) => {
    if (!text) return;
    if (isPlaying) {
      ttsService.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    try {
      await ttsService.speak(text, {
        language: 'en-US',
        rate: preferences.speechSpeed || 1.0,
        volume: 1.0,
      });
    } finally {
      setIsPlaying(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
// ADD THE NEW FUNCTION HERE
const handleReportQuestion = () => {
  const question = reportQuestion.trim().toLowerCase();
  const reportText = ocrResult?.text || '';

  if (!question) return;

  if (!reportText) {
    setReportAnswer('Please scan a document first.');
    return;
  }

  const lines = reportText.split('\n').filter(line => line.trim());

  if (question.includes('result') || question.includes('value')) {
    const results = lines.filter(line => /\d/.test(line));

    setReportAnswer(
      results.length
        ? `Here are some extracted lines containing values:\n${results.slice(0, 5).join('\n')}`
        : 'No clear numerical results were found.'
    );
  } else if (question.includes('range') || question.includes('reference')) {
    const matches = lines.filter(line => /reference|range/i.test(line));

    setReportAnswer(
      matches.length
        ? matches.join('\n')
        : 'I could not identify a clear reference range.'
    );
  } else if (question.includes('summary') || question.includes('explain')) {
    setReportAnswer(reportText.slice(0, 700));
  } else {
    setReportAnswer(
      'I could not confidently find an answer in the scanned text.'
    );
  }
};

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Understand My Surroundings"
        subtitle="Visual OCR reader for prescription slips, platform boards, and hospital room signs."
        showBack
      />
      

      

      {/* Input / Scanner Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Upload Box */}
        <div className="card p-5 bg-white border flex flex-col items-center justify-center text-center relative hover:border-[#176B67] transition-colors" style={{ borderColor: 'var(--color-border)' }}>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-3">
            <Camera size={24} className="text-[#176B67]" />
          </div>
          <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>
            Upload or Capture
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Select an image of a sign, document or prescription
          </p>
          <label className="btn-secondary text-xs py-2 px-4 cursor-pointer inline-flex items-center gap-1.5">
            <Upload size={14} />
            <span>Choose Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {uploadedFileName && (
            <span className="text-[11px] text-teal-700 mt-2 truncate max-w-full font-medium">
              Loaded: {uploadedFileName}
            </span>
          )}
        </div>

        {/* Preset Selector */}
        <div className="md:col-span-2 card p-5 bg-white border flex flex-col justify-between" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>
              Or choose a demo sample document:
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Test instant OCR reading and text-to-speech with realistic public records.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => {
                    setSelectedPreset(sample.id);
                    handleScanSample(sample.text, sample.title);
                  }}
                  className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    selectedPreset === sample.id
                      ? 'bg-[#E8F4F3] border-[#176B67] text-teal-900 font-medium ring-1 ring-[#176B67]'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[11px]">{sample.title}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-2">{sample.preview}</p>
                </button>
              ))}
              <div className="rounded-xl border border-teal-200 bg-white p-4 space-y-3">
  <h4 className="font-semibold text-sm text-gray-900">
    Ask about this report
  </h4>

  <div className="flex gap-2">
    <input
      type="text"
      value={reportQuestion}
      onChange={(e) => setReportQuestion(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleReportQuestion();
      }}
      placeholder="Ask something about your report..."
      className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm"
    />

    <button
      onClick={handleReportQuestion}
      disabled={!reportQuestion.trim()}
      className="rounded-lg bg-[#176B67] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
    >
      Ask
    </button>
  </div>

  {reportAnswer && (
    <div className="rounded-lg bg-teal-50 p-3">
      <p className="text-xs font-semibold text-teal-800 mb-1">Answer</p>
      <p className="text-sm text-gray-700 whitespace-pre-line">
        {reportAnswer}
      </p>
    </div>
  )}

  <p className="text-xs text-amber-700">
    Please verify medical information with a healthcare professional.
  </p>
</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t flex items-center justify-between">
            <span className="text-xs text-gray-400">Sample text ready for instant parsing</span>
            <button
              onClick={() => {
                const sample = PRESET_SAMPLES.find((s) => s.id === selectedPreset) || PRESET_SAMPLES[0];
                handleScanSample(sample.text, sample.title);
              }}
              disabled={isScanning}
              className="btn-primary text-xs py-1.5 px-4 cursor-pointer flex items-center gap-1.5"
            >
              {isScanning ? <RotateCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>{isScanning ? 'Extracting Text...' : 'Scan Selected'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* OCR Result View */}
      {isScanning ? (
        <div className="card p-12 bg-white border text-center flex flex-col items-center justify-center space-y-3" style={{ borderColor: 'var(--color-border)' }}>
          <RotateCw size={32} className="animate-spin text-[#176B67]" />
          <p className="text-sm font-semibold text-gray-700">Analyzing image and extracting characters...</p>
          <p className="text-xs text-gray-400">Simulating computer vision pipeline & bounding-box detection</p>
        </div>
      ) : ocrResult ? (
        <div className="card p-5 sm:p-6 bg-white border space-y-4" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-[#176B67]" />
              <h3 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                Extracted Text Output
              </h3>
              <span
                className={`badge text-xs ${
                  ocrResult.confidence >= 0.75
                    ? 'bg-emerald-100 text-emerald-800'
                    : ocrResult.confidence >= 0.45
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {Math.round(ocrResult.confidence * 100)}% Recognition Confidence
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(ocrResult.text)}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-medium flex items-center gap-1 cursor-pointer"
                title="Copy extracted text"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleSpeak(ocrResult.text)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isPlaying ? 'bg-red-600 text-white' : 'bg-[#176B67] text-white hover:bg-[#135652]'
                }`}
              >
                {isPlaying ? <Square size={14} /> : <Volume2 size={14} />}
                <span>{isPlaying ? 'Stop Reading' : 'Read Aloud'}</span>
              </button>
            </div>
          </div>
{/* Document Summary */}
{(() => {
  const summary = generateDocumentSummary(ocrResult.text);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-teal-50 p-4">
        <p className="text-xs text-teal-700 font-semibold uppercase">
          Document type
        </p>
        <h3 className="text-lg font-bold text-teal-900 mt-1">
          {summary.type}
        </h3>
      </div>

      {summary.items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {summary.items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 p-4 bg-white"
            >
              <p className="text-xs text-gray-500 mb-1">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-gray-800 break-words">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 p-4">
        <h4 className="font-semibold text-sm mb-2">
          Simple Summary
        </h4>
        <p className="text-sm text-gray-700 leading-relaxed">
          {summary.summary}
        </p>
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
        <p className="text-xs text-amber-800">
          ⚠️ {summary.warning}
        </p>
      </div>

      <button
        onClick={() =>
          handleSpeak(
            `${summary.type}. ${summary.items
              .map((item) => `${item.label}: ${item.value}`)
              .join('. ')}. ${summary.summary}`
          )
        }
        className="btn-primary px-4 py-2 rounded-lg text-sm"
      >
        <Volume2 size={15} className="inline mr-2" />
        Listen to Summary
      </button>
    </div>
  );
})()}
        </div>
      ) : (
        <div className="card p-8 bg-white border text-center text-gray-400" style={{ borderColor: 'var(--color-border)' }}>
          <Eye size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Select a sample or upload a document above to begin OCR extraction.</p>
        </div>
      )}

      {/* Surroundings Quick Signs Recognition Feed */}
      <div className="card p-5 bg-white border" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
              Detected Public Signposts
            </h3>
            <p className="text-xs text-gray-500">
              Surrounding direction markers and facility boards automatically detected in range
            </p>
          </div>
          <span className="badge">Surroundings</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_SIGN_RECOGNITIONS.map((sign) => (
            <div
              key={sign.id}
              className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-gray-50 flex items-start justify-between gap-3"
            >
              <div>
                <p className="text-sm font-semibold text-gray-800">{sign.text}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPin size={12} className="text-[#176B67]" />
                  <span>{sign.location}</span>
                </div>
              </div>
              <button
                onClick={() => handleSpeak(`${sign.text}, located at ${sign.location}`)}
                className="p-2 rounded-lg border border-gray-200 hover:bg-white text-gray-600 flex-shrink-0 cursor-pointer"
                title="Read sign aloud"
                aria-label={`Read sign: ${sign.text}`}
              >
                <Volume2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Disclaimer message="OCR outputs depend on document lighting, camera angle, and handwriting legibility. For prescription drugs, always verify dosage with the attending pharmacist." />
    </div>
  );
}
