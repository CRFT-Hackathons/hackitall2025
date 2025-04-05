"use server";
import { GoogleGenAI } from "@google/genai";

const formalizationPrompt = `
<task>
  <instruction>
    Please formalize the following text written in the language specified by the LANG_CODE parameter while maintaining its original meaning, style, and content. Additionally, ensure that any vulgar language—especially language that might be associated with conditions such as Tourette syndrome or other disabilities—is removed or replaced with respectful language, considering the needs of users with disabilities.
  </instruction>
  <improvements>
    <improvement>Correct any grammatical errors.</improvement>
    <improvement>Add proper punctuation where needed.</improvement>
    <improvement>Fix capitalization errors.</improvement>
    <improvement>Improve readability.</improvement>
    <improvement>Preserve all original ideas, terminology, and the overall tone.</improvement>
    <improvement>Do NOT add new information, change the meaning, or remove any content beyond making the text more accessible.</improvement>
    <improvement>Do NOT translate the text.</improvement>
  </improvements>
  <parameters>
    <language>Input language: {LANG_CODE}</language>
    <text>Input text: {TEXT}</text>
  </parameters>
  <output>
    Return only the modified/verified text in no XML format just plain text, without any additional commentary.
  </output>
</task>
`;

export async function formalizeText(
  rawText: string,
  languageCode: string
): Promise<string | null> {
  try {
    console.log(process.env.GEMINI_API_KEY);
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const fullPrompt = formalizationPrompt
      .replace("{TEXT}", rawText)
      .replace("{LANG_CODE}", languageCode);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullPrompt,
    });
    return response.text ?? "UNDEFINED OUTPUT";
  } catch (error) {
    console.error("Text formalization failed:", error);
    return null;
  }
}
