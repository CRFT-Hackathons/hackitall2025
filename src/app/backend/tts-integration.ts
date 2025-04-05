"use server";

import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { writeFile } from "fs/promises";

export async function synthesizeSpeech(
  text: string,
  languageCode: string,
  speed: number
) {
  try {
    const client = new TextToSpeechClient({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      projectId: process.env.GOOGLE_PROJECT_ID,
    });

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: languageCode,
        ssmlGender: "NEUTRAL",
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: speed,
      },
    });

    if (!response.audioContent) {
      throw new Error("Failed to generate audio");
    }

    await writeFile("output.mp3", response.audioContent, "binary");
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}
