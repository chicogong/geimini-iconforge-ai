import { GoogleGenAI, Type } from "@google/genai";
import { IconStyle } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize the client only if the key exists to avoid runtime crashes before check
let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

/**
 * Step 1: Brainstorm creative variations using a text model.
 * This represents the "Thinking" phase.
 */
export const generateIconPrompts = async (
  basePrompt: string, 
  style: IconStyle, 
  count: number = 4
): Promise<string[]> => {
  if (!ai) {
    throw new Error("API Key is missing.");
  }

  const systemInstruction = `You are a professional AI Art Director and Prompt Engineer specializing in Mobile App Icon Design. 
  Your task is to take a user's raw concept and brainstorm ${count} distinct, high-fidelity image generation prompts.
  
  User Concept: "${basePrompt}"
  Target Style: "${style}"
  
  Instructions:
  1. Analyze the concept. Think about how to represent it visually in an icon format (simple, recognizable, scalable).
  2. Create ${count} unique variations. For example:
     - Variation 1: Literal interpretation.
     - Variation 2: Abstract or symbolic representation.
     - Variation 3: Focus on a specific feature or character.
     - Variation 4: A different composition or perspective (e.g., isometric vs front-facing).
  3. Formulate the prompts in ENGLISH.
  4. Incorporate style-specific visual keywords:
     - 3D Render: "3D render, blender, clay material, soft studio lighting, cute, isometric, octane render".
     - Flat: "flat design, vector art, minimalism, solid colors, clean shapes, no gradients".
     - Gradient: "vibrant gradients, holographic, modern UI, fluid shapes".
     - Pixel: "pixel art, 8-bit, grid aligned, retro game style".
     - Glass: "glassmorphism, transparency, blur, frosted glass, soft shadows".
     - Metal/Chrome: "metallic, chrome, reflection, shiny, futuristic".
  5. Format: Return ONLY a JSON array of strings. Do not include markdown formatting.
  
  Example Output Format:
  [
    "A mobile app icon of a cute robot, 3D render, clay material, soft pink background, high fidelity...",
    "A mobile app icon of a robot head, flat design, minimalist vector, blue and white..."
  ]`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate ${count} distinct icon prompts for "${basePrompt}" in "${style}" style.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    let text = response.text;
    if (!text) {
      return Array(count).fill(`${style} icon of ${basePrompt}`);
    }
    
    // Cleanup potential markdown
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.warn("Prompt brainstorming failed, falling back to basic prompt.", error);
    // Fallback to original prompt repeated if JSON parsing or API fails
    return Array(count).fill(`${style} icon of ${basePrompt}`);
  }
};

/**
 * Step 2: Generate a single icon based on a specific prompt.
 */
export const generateSingleIcon = async (prompt: string, style: IconStyle): Promise<string> => {
  if (!ai) {
    throw new Error("API Key is missing.");
  }

  // The prompt usually comes from the brainstormer, so it's already detailed.
  // We wrap it to ensure technical icon constraints.
  const finalPrompt = `
    ${prompt}
    
    Constraints:
    - Format: Square mobile app icon with rounded corners.
    - Background: Solid or simple gradient (unless style specifies transparency).
    - Composition: Centered, balanced, with clear padding from edges.
    - Quality: 4k, highly detailed, professional UI/UX design, trending on Dribbble.
    - Negative prompt: text, words, watermark, blurry, low quality, cropped, complex background.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [
          {
            text: finalPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    // Parse the response for the image
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            }
        }
    }
    
    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};