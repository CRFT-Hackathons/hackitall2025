"use server";

import { SpeechClient } from "@google-cloud/speech";

export async function transcribeAudio(audioContent: string) {
  try {
    const client = new SpeechClient({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      projectId: process.env.GOOGLE_PROJECT_ID,
    });

    const audio = {
      content: audioContent, // Base64 encoded audio
    };

    const config = {
      encoding: "WEBM_OPUS" as const,
      sampleRateHertz: 48000,
      languageCode: "en-US",
      enableAutomaticPunctuation: true,
    };

    const [response] = await client.recognize({
      audio,
      config,
    });

    if (!response.results || response.results.length === 0) {
      throw new Error("No transcription results");
    }

    const transcription = response.results
      .map((result) => result.alternatives?.[0]?.transcript)
      .join("\n");

    return transcription;
  } catch (error) {
    console.error("STT Error:", error);
    return null;
  }
}
