"use server";

import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { writeFile } from "fs/promises";
import { GoogleAuth } from "google-auth-library";

export async function synthesizeSpeech(text: string) {
  try {
    const auth = new GoogleAuth({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    });

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
        languageCode: "en-US",
        ssmlGender: "NEUTRAL",
      },
      audioConfig: {
        audioEncoding: "MP3",
      },
    });

    if (!response.audioContent) {
      throw new Error("Failed to generate audio");
    }

    await writeFile("output.mp3", response.audioContent, "binary");

    // return response.audioContent.toString();
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}
