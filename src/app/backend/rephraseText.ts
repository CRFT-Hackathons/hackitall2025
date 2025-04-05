"use server";
import { GoogleGenAI } from "@google/genai";

const summarizationPrompt = `<task>  
<task>  
  <instruction>  
    Rephrase the question **"{QUESTION}"** in **{LANG_CODE}** for users with **{disabilities_list}**. Maintain original length and core meaning. Use simple, direct language and accessible structure.  
  </instruction>  
  <improvements>  
    <improvement>Simplify complex phrases, and keep the meaning of the initial question!</improvement>  
    <improvement>Break long sentences.</improvement>  
    <improvement>Avoid non-essential jargon.</improvement>  
    <improvement>Ensure screen-reader compatibility.</improvement>  
    <improvement>Preserve core intent exactly.</improvement>  
  </improvements>  
  <parameters>  
    <disabilities>Disabilities: {disabilities_list}</disabilities>  
    <language>Original language: {LANG_CODE}</language>  
    <question>Input: {QUESTION}</question>  
  </parameters>  
  <output>  
    Return **ONLY** the rephrased question in plain text. No extras.  
  </output>  
</task>  `;

export async function rephraseText(
  rawText: string,
  languageCode: string,
  disabilities_list: string[]
): Promise<string | null> {
  try {
    console.log(process.env.GEMINI_API_KEY);
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const fullPrompt = summarizationPrompt
      .replace("{QUESTION}", rawText)
      .replace("{LANG_CODE}", languageCode)
      .replace("{disabilities_list}", JSON.stringify(disabilities_list));

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullPrompt,
    });
    return response.text ?? "UNDEFINED OUTPUT";
  } catch (error) {
    console.error("Text summarization failed:", error);
    return null;
  }
}
