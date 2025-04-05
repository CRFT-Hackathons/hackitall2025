"use server";
import { generatePhotoDescription } from "./generatePhotoDescription";
import { rephraseText } from "./rephraseText";

export const generateAnnotate = async ({
  title,
  description,
  image,
  disabilities_list,
  languageCode = "en",
}: {
  title: string;
  description: string;
  image?: string;
  disabilities_list: string[];
  languageCode?: string;
}) => {
  let imageCaption = "";

  // 1. Fetch image from URL and convert to base64, then generate photo description with task context.
  if (image) {
    try {
      const imageRes = await fetch(image);
      const buffer = await imageRes.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString("base64");

      // Pass the question description as context to generate a relevant image description.
      const photoDesc = await generatePhotoDescription(
        base64Image,
        description
      );
      console.log(imageCaption);
      if (photoDesc) {
        imageCaption = photoDesc;
      }
    } catch (error) {
      console.error("Image processing failed:", error);
    }
  }

  return imageCaption;
};
