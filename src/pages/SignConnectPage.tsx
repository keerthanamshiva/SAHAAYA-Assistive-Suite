import { useEffect, useRef, useState } from "react";
import "./SignConnectPage.css";

type Gesture = {
  id: string;
  label: string;
  emoji: string;
  description: string;
};

const GESTURES: Gesture[] = [
  { id: "hello", label: "Hello", emoji: "👋", description: "Greeting gesture" },
  { id: "thankyou", label: "Thank you", emoji: "🙏", description: "Gratitude gesture" },
  { id: "help", label: "Help me", emoji: "🆘", description: "Request for help" },
  { id: "yes", label: "Yes", emoji: "👍", description: "Agreement gesture" },
  { id: "no", label: "No", emoji: "🙅", description: "Negative response" },
  { id: "water", label: "Water", emoji: "💧", description: "Water gesture" },
  { id: "please", label: "Please", emoji: "🤲", description: "Polite request" },
  { id: "goodbye", label: "Goodbye", emoji: "👋", description: "Farewell gesture" },
];

const PHRASES: { phrase: string; gestures: string[] }[] = [
  { phrase: "hello", gestures: ["hello"] },
  { phrase: "hi", gestures: ["hello"] },
  { phrase: "thank you", gestures: ["thankyou"] },
  { phrase: "thanks", gestures: ["thankyou"] },
  { phrase: "help me", gestures: ["help"] },
  { phrase: "i need help", gestures: ["help"] },
  { phrase: "yes", gestures: ["yes"] },
  { phrase: "no", gestures: ["no"] },
  { phrase: "water", gestures: ["water"] },
  { phrase: "i need water", gestures: ["water"] },
  { phrase: "please", gestures: ["please"] },
  { phrase: "goodbye", gestures: ["goodbye"] },
  { phrase: "bye", gestures: ["goodbye"] },
];

export default function SignConnectPage() {
  const [input, setInput] = useState("");
  const [sequence, setSequence] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState(
    "Enter a phrase or use the microphone."
  );

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<any>(null);
  const indexRef = useRef(0);
  const sequenceRef = useRef<string[]>([]);

  const currentGesture = GESTURES.find(
    (gesture) => gesture.id === sequence[currentIndex]
  );

  function stopPlayback() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
  }

  function playSequence(items: string[], startIndex = 0) {
    if (items.length === 0) return;

    stopPlayback();

    sequenceRef.current = items;
    indexRef.current = startIndex;

    setSequence(items);
    setCurrentIndex(startIndex);
    setPlaying(true);
    setMessage("Playing gesture sequence...");

    function playNext(index: number) {
      if (index >= items.length) {
        setPlaying(false);
        setMessage("Gesture sequence completed.");
        return;
      }

      indexRef.current = index;
      setCurrentIndex(index);

      timerRef.current = setTimeout(() => {
        playNext(index + 1);
      }, 2200);
    }

    playNext(startIndex);
  }

  function convertText() {
    const normalized = input.toLowerCase().trim();

    if (!normalized) {
      setMessage("Please enter a phrase first.");
      return;
    }

    const exact = PHRASES.find(
      (item) => item.phrase === normalized
    );

    let matched = exact?.gestures ?? [];

    if (matched.length === 0) {
      const words = normalized
        .replace(/[.,!?]/g, "")
        .split(/\s+/);

      matched = words
        .map((word) => {
          const match = PHRASES.find(
            (item) => item.phrase === word
          );
          return match?.gestures[0];
        })
        .filter((id): id is string => Boolean(id));
    }

    const unique = [...new Set(matched)];

    if (unique.length === 0) {
      setMessage(
        "This phrase is not in the current demonstration vocabulary. Try Hello, Thank you, Help me, Yes, No, Water, Please or Goodbye."
      );
      stopPlayback();
      setSequence([]);
      return;
    }

    playSequence(unique);
  }

  function startVoiceInput() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessage(
        "Speech recognition is not supported in this browser. Please use text input."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      setMessage("Listening... Speak your phrase.");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);

      setListening(false);

      const normalized = transcript.toLowerCase().trim();
      const match = PHRASES.find(
        (item) => item.phrase === normalized
      );

      if (match) {
        playSequence(match.gestures);
      } else {
        setMessage(
          `You said: "${transcript}". Click Convert to Sign to process it.`
        );
      }
    };

    recognition.onerror = () => {
      setListening(false);
      setMessage("Microphone error. Please try again or type your phrase.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function pausePlayback() {
    stopPlayback();
    setMessage("Paused. Press Play to continue.");
  }

  function resumePlayback() {
    if (sequenceRef.current.length > 0) {
      playSequence(sequenceRef.current, indexRef.current);
    }
  }

  function resetPlayer() {
    stopPlayback();
    setSequence([]);
    setCurrentIndex(0);
    setMessage("Enter a phrase or use the microphone.");
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="sc-page">
      <div className="sc-header">
        <div>
          <span className="sc-eyebrow">SAHAAYA ACCESSIBILITY</span>
          <h1>SignConnect</h1>
          <p>Convert words and phrases into gesture demonstrations.</p>
        </div>
        <span className="sc-status">● Gesture simulator</span>
      </div>

      <section className="sc-input-card">
        <h2>Text or Voice to Gesture</h2>
        <p>Enter one of the supported phrases below.</p>

        <div className="sc-input-row">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") convertText();
            }}
            placeholder="Example: Hello, Thank you, Help me..."
          />

          <button className="sc-convert" onClick={convertText}>
            Convert to Sign
          </button>

          <button
            className={`sc-mic ${listening ? "listening" : ""}`}
            onClick={startVoiceInput}
            disabled={listening}
            title="Speak a phrase"
          >
            {listening ? "Listening..." : "🎙 Speak"}
          </button>
        </div>

        <div className="sc-status-message" aria-live="polite">
          {message}
        </div>

        <div className="sc-supported">
          {GESTURES.map((gesture) => (
            <button
              key={gesture.id}
              onClick={() => {
                setInput(gesture.label);
                playSequence([gesture.id]);
              }}
            >
              {gesture.emoji} {gesture.label}
            </button>
          ))}
        </div>
      </section>

      <section className="sc-player-card">
        <div className="sc-player-heading">
          <div>
            <span className="sc-eyebrow">LIVE DEMONSTRATION</span>
            <h2>Gesture Player</h2>
          </div>

          <span className="sc-counter">
            {sequence.length > 0
              ? `${currentIndex + 1} / ${sequence.length}`
              : "Ready"}
          </span>
        </div>

        <div className="sc-stage">
          {currentGesture ? (
            <>
              <div
                key={`${currentGesture.id}-${currentIndex}`}
                className={`sc-avatar gesture-${currentGesture.id} ${
                  playing ? "sc-animate" : ""
                }`}
              >
                <div className="sc-head">
                  <div className="sc-eyes">
                    <span />
                    <span />
                  </div>
                  <div className="sc-smile" />
                </div>

                <div className="sc-neck" />

                <div className="sc-body">
                  <div className="sc-arm sc-left-arm">
                    <span className="sc-hand">✋</span>
                  </div>

                  <div className="sc-arm sc-right-arm">
                    <span className="sc-hand">✋</span>
                  </div>
                </div>
              </div>

              <div className="sc-gesture-label">
                <span>{currentGesture.emoji}</span>
                <h3>{currentGesture.label}</h3>
                <p>{currentGesture.description}</p>
              </div>
            </>
          ) : (
            <div className="sc-empty">
              <div className="sc-empty-icon">👤</div>
              <h3>Ready for a gesture</h3>
              <p>Enter a phrase above to start the demonstration.</p>
            </div>
          )}
        </div>

        <div className="sc-controls">
          <button onClick={() => {
            if (sequence.length) playSequence(sequence, 0);
          }}>
            ↺ Replay
          </button>

          {playing ? (
            <button className="sc-primary" onClick={pausePlayback}>
              ⏸ Pause
            </button>
          ) : (
            <button
              className="sc-primary"
              onClick={resumePlayback}
              disabled={sequence.length === 0}
            >
              ▶ Play
            </button>
          )}

          <button onClick={resetPlayer}>■ Stop</button>
        </div>

        {sequence.length > 1 && (
          <div className="sc-sequence">
            {sequence.map((id, index) => {
              const gesture = GESTURES.find((item) => item.id === id);

              return (
                <span
                  key={`${id}-${index}`}
                  className={index === currentIndex ? "active" : ""}
                >
                  {gesture?.label}
                </span>
              );
            })}
          </div>
        )}
      </section>

      <div className="sc-disclaimer">
        <strong>Prototype notice:</strong> These are illustrative avatar
        animations for demonstrating the interaction flow. They are not
        validated Indian Sign Language translations. The current vocabulary
        supports only the phrases listed above.
      </div>
    </div>
  );
}