"use server";

import { GoogleGenAI } from "@google/genai";

const captionPrompt = `
<task>
  <instruction>
    Based on the following image labels, create a clear, natural, and concise descriptive sentence about the image. The sentence should be written in plain English and may include a subject and an action that ties the labels together.
  </instruction>
  <parameters>
    <labels>Image labels: {LABELS}</labels>
  </parameters>
  <output>
    Return only the generated sentence in plain text, without additional commentary.
  </output>
</task>
`;

/**
 * Generates a descriptive sentence from image labels.
 *
 * @param labels - An array of label strings, e.g., ["kitten", "snow", "animal"].
 * @returns A descriptive sentence, or null if generation failed.
 */
export async function generateImageCaption(
  labels: string[]
): Promise<string | null> {
  try {
    // Initialize the AI client with your API key from environment variables
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Join labels into a comma-separated string
    const labelsText = labels.join(", ");

    // Replace the placeholder in the prompt with the actual labels
    const fullPrompt = captionPrompt.replace("{LABELS}", labelsText);

    // Generate content using the AI model
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullPrompt,
    });

    // Return the generated sentence or a fallback message
    return response.text ?? "UNDEFINED OUTPUT";
  } catch (error) {
    console.error("Caption generation failed:", error);
    return null;
  }
}
