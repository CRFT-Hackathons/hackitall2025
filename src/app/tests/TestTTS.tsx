// app/components/TestTTSButton.tsx
"use client";

import { useState } from "react";
import { synthesizeSpeech } from "../backend/tts-integration";

export default function TestTTSButton() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTestTTS = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const testText =
        "This is a test of the text-to-speech functionality. Hello world!";

      // Call your TTS function
      //   await synthesizeSpeech(testText);

      // Create playable URL
      const url = `file://home/robert/Desktop/hackItAll2025/hackitall2025/output.mp3`;
      setAudioUrl(url);

      // Auto-play the audio
      new Audio(url).play();
    } catch (err) {
      console.error("TTS Test failed:", err);
      setError("Failed to generate speech. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 border rounded-lg max-w-md">
      <button
        onClick={handleTestTTS}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isLoading ? "Generating..." : "Test TTS"}
      </button>

      {error && (
        <div className="p-2 text-red-600 bg-red-100 rounded">
          Error: {error}
        </div>
      )}

      {audioUrl && !isLoading && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Generated audio:</p>
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}
    </div>
  );
}
