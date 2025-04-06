"use server";

import { transcribeAudio } from "../backend/stt-integration";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

// Initialize FFmpeg
const ffmpeg = new FFmpeg();

async function convertVideoToAudio(videoBlob: Blob): Promise<Blob> {
  // Load FFmpeg
  await ffmpeg.load();

  // Create a unique filename for the input video
  const inputFileName = "input.webm";
  const outputFileName = "output.mp3";

  // Write the video blob to FFmpeg's filesystem
  await ffmpeg.writeFile(inputFileName, await fetchFile(videoBlob));

  // Convert the video to audio (MP3 format)
  await ffmpeg.exec(["-i", inputFileName, outputFileName]);

  // Read the output audio file from FFmpeg's filesystem
  const audioData = await ffmpeg.readFile(outputFileName);

  // Create a Blob from the audio data
  const audioBlob = new Blob([audioData], { type: "audio/mp3" });

  return audioBlob;
}

export async function transcribeVideo(videoBlob: Blob, languageCode: string) {
  try {
    // Convert the video blob to audio (e.g., MP3)
    const audioBlob = await convertVideoToAudio(videoBlob);

    // Read the audio blob as a Base64 string
    const audioContent = await blobToBase64(audioBlob);

    // Call the transcribeAudio function with the Base64 audio content
    const transcription = await transcribeAudio(audioContent, languageCode);

    return transcription;
  } catch (error) {
    console.error("Error in transcribing video:", error);
    return null;
  }
}

// Helper function to convert Blob to Base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data.split(",")[1]); // Return only the Base64 part
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
