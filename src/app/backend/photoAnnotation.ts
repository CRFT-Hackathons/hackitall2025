"use server";

import { ImageAnnotatorClient } from "@google-cloud/vision";

// Initialize the client with credentials from environment variables
const client = new ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    // Replace newline characters in private key if necessary
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

/**
 * Describe a photo using Google Cloud Vision API.
 *
 * @param base64Image - The base64 encoded image string (without data URI prefix)
 * @returns A string description of what is likely in the image or null if failed.
 */
export async function describePhoto(base64Image: string): Promise<string | null> {
  try {
    // Construct the request with label detection
    const request = {
      image: { content: base64Image },
      features: [{ type: "LABEL_DETECTION", maxResults: 5 }],
    };

    const [result] = await client.annotateImage(request);
    const labels = result.labelAnnotations;

    if (labels && labels.length > 0) {
      // Extract descriptions from the labels and join them
      const descriptions = labels.map((label) => label.description).join(", ");
      return `This image likely contains: ${descriptions}.`;
    }

    return "No prominent labels detected in the image.";
  } catch (error) {
    console.error("Photo description failed:", error);
    return null;
  }
}
