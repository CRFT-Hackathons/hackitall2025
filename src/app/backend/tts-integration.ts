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

    const publicDir = "./public";
    const fileName = `output-${Date.now()}.mp3`;
    const filePath = `${publicDir}/${fileName}`;

    await writeFile(filePath, response.audioContent as Buffer, "binary");

    return `/output-${Date.now()}.mp3`; // Return the public URL path to the file
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}
