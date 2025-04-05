// app/components/TestSTTButton.tsx
"use client";

import { useState, useRef } from "react";
import { transcribeAudio } from "../backend/stt-integration";

export default function TestSTTButton() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        setIsLoading(true);
        try {
          const audioBlob = new Blob(audioChunks.current, {
            type: "audio/webm; codecs=opus",
          });
          const reader = new FileReader();

          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(",")[1];
            const transcription = await transcribeAudio(base64Audio);

            if (transcription) {
              setTranscript(transcription);
            } else {
              setError("No transcription received");
            }
          };

          reader.readAsDataURL(audioBlob);
          audioChunks.current = [];
        } catch (err) {
          console.error("Transcription error:", err);
          setError("Transcription failed. Check console for details.");
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error("Microphone access error:", err);
      setError(
        "Microphone access denied. Please allow microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="p-4 space-y-4 border rounded-lg max-w-md">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isLoading}
        className={`px-4 py-2 text-white rounded ${
          isRecording
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isLoading
          ? "Processing..."
          : isRecording
          ? "Stop Recording"
          : "Start Recording"}
      </button>

      {error && (
        <div className="p-2 text-red-600 bg-red-100 rounded">
          Error: {error}
        </div>
      )}

      {transcript && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="font-semibold mb-2">Transcription:</p>
          <p className="whitespace-pre-wrap">{transcript}</p>
        </div>
      )}

      {!transcript && !error && !isLoading && (
        <p className="text-gray-500 text-sm">
          Click "Start Recording" to test speech-to-text (speak after clicking)
        </p>
      )}
    </div>
  );
}
