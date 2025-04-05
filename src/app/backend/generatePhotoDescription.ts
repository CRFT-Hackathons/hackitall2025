"use server";
"use server";

import { GoogleGenAI } from "@google/genai";

const photoDescriptionPrompt = `
<task>  
  <instruction>  
    Describe {IMAGE_BASE64} content in 1 plain sentence (<30 words). Focus ONLY on clear main objects/scenes from {TASK_DESCRIPTION}. Return "" if no image/task provided.  
  </instruction>  
  <improvements>  
    <improvement>Prioritize key visual elements.</improvement>  
    <improvement>Omit unclear/uncertain details.</improvement>  
    <improvement>Strict 20-word maximum.</improvement>  
    <improvement>No speculation beyond visible content.</improvement>  
  </improvements>  
  <parameters>  
    <required_input>  
      * Returns empty string if {TASK_DESCRIPTION} or {IMAGE_BASE64} missing  
    </required_input>  
    <task_context>{TASK_DESCRIPTION}</task_context>  
    <image_data>{IMAGE_BASE64}</image_data>  
  </parameters>  
  <output>  
    Empty string OR 1 plain-text sentence (strict <20 words). No formatting, no explanations.  
  </output>  
</task>  

`;

/**
 * Generates a detailed description of an image using the Gemini API.
 *
 * @param base64Image - The base64-encoded string of the image.
 * @param taskDescription - The context (i.e. the question description) to inform the image description.
 * @returns A descriptive sentence about the image, or null if the generation fails.
 */
export async function generatePhotoDescription(
  base64Image: string,
  taskDescription: string
): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    let fullPrompt = photoDescriptionPrompt
      .replace("{IMAGE_BASE64}", base64Image)
      .replace("{TASK_DESCRIPTION}", taskDescription);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullPrompt,
    });

    return response.text ?? "UNDEFINED OUTPUT";
  } catch (error) {
    console.error("Photo description generation failed:", error);
    return null;
  }
}
