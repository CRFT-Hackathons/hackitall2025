"use server";
import { GoogleGenAI } from "@google/genai";

const formalizationPrompt = `
Task: Enhance the formality and readability of the provided text while preserving its original meaning, tone, and content.

Guidelines:
- Correct all grammatical errors.
- Apply proper and consistent punctuation.
- Fix capitalization issues.
- Improve sentence structure and readability.
- Identify and replace any profane, insensitive, or offensive language with respectful alternatives,
  ensuring that the text remains inclusive and considerate of users with disabilities.
- Do NOT add new information or alter any factual content.
- Do NOT translate the text; maintain its original language.
- Retain all original ideas, expressions, and terminology.

Input:
  - Language Code: {LANG_CODE}
  - Text: {TEXT}

Output:
Return the revised text as plain text only. Do not include any additional commentary, formatting marks, or metadata.
`;

export async function formalizeText(
  rawText: string,
  languageCode: string
): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const fullPrompt = formalizationPrompt
      .replace("{TEXT}", rawText)
      .replace("{LANG_CODE}", languageCode);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullPrompt,
    });
    return response.text?.trim() || "UNDEFINED OUTPUT";
  } catch (error) {
    console.error("Text formalization failed:", error);
    return null;
  }
}
