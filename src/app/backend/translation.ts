"use server";

import { GoogleGenAI } from "@google/genai";

const translationPrompt = `
<task>
  <instruction>
    Please translate the following text from the source language to the target language. Maintain all the meaning, nuance, and tone of the original.
  </instruction>
  <parameters>
    <sourceLanguage>The source language: {SOURCE_LANG}</sourceLanguage>
    <targetLanguage>The target language: {TARGET_LANG}</targetLanguage>
    <text>Text to translate: {TEXT}</text>
  </parameters>
  <o>
    Return only the translated text in the target language, without any additional commentary or XML formatting. Just plain text.
  </o>
</task>
`;

export async function translateText(
  text: string,
  sourceLanguage: string = "en",
  targetLanguage: string = "ro"
): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const fullPrompt = translationPrompt
      .replace("{TEXT}", text)
      .replace("{SOURCE_LANG}", sourceLanguage)
      .replace("{TARGET_LANG}", targetLanguage);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullPrompt,
    });
    
    console.log("Translation completed successfully");
    return response.text ?? null;
  } catch (error) {
    console.error("Text translation failed:", error);
    return null;
  }
} 