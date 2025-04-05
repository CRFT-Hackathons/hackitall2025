"use server";

import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function synthesizeSpeech(
  text: string,
  languageCode: string,
  speed: number
) {
  try {
    console.log("TTS Request:", { text, languageCode, speed });

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
      throw new Error("Failed to generate audio content");
    }

    console.log("Audio content generated successfully");

    // Generate a unique filename
    const uniqueId = randomUUID();
    const fileName = `speech-${uniqueId}.mp3`;

    // Ensure we're using the correct public directory path
    const publicDir = join(process.cwd(), "public");
    const filePath = join(publicDir, fileName);

    console.log("Writing audio file to:", filePath);

    // Write the file
    await writeFile(filePath, response.audioContent as Buffer, "binary");

    // Return the public URL path to the file
    const publicUrl = `/${fileName}`;
    console.log("Generated public URL:", publicUrl);

    return publicUrl;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}
