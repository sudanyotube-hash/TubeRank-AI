import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GenerateParams, SEOResponse } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-build' });

const seoSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    titles: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 5 high-CTR, click-worthy video titles optimized for YouTube search and recommendations.",
    },
    description: {
      type: Type.STRING,
      description: "A highly engaging, professionally formatted YouTube video description. It must include a strong hook in the first 2 lines, a 'Question of the Day' to drive comments, a clear 'Subscribe' CTA, and placeholders for timestamps and social links.",
    },
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 20-30 high-volume, low-competition tags/keywords separated by commas.",
    },
    hashtags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 5-10 trending and relevant hashtags including the # symbol.",
    },
    category: {
      type: Type.STRING,
      description: "The most appropriate YouTube category for this video (e.g., Education, Entertainment, Tech).",
    },
    algorithmStrategy: {
      type: Type.STRING,
      description: "A brief analysis of why this content works with the current algorithm (focus on retention, click-through rate, and engagement signals).",
    },
    thumbnailIdeas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "Detailed visual description of the thumbnail image (scene, facial expression, colors, background)." },
          text: { type: Type.STRING, description: "Short, punchy text overlay (max 3-5 words) to be placed on the image." }
        },
        required: ["description", "text"]
      },
      description: "List of 3 distinct, high-click-through-rate thumbnail concepts that complement the titles."
    }
  },
  required: ["titles", "description", "keywords", "hashtags", "category", "algorithmStrategy", "thumbnailIdeas"],
};

export const generateSEO = async (params: GenerateParams): Promise<SEOResponse> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Act as a world-class YouTube SEO Expert and Content Strategist.
    I need you to generate a publishing strategy and metadata for a NEW YouTube video idea based on the following:
    
    - Video Idea: ${params.topic}
    - Niche/Category: ${params.category}
    - Target Audience: ${params.audience}
    - Language: Arabic (Output must be in Arabic)

    Please strictly follow the latest YouTube Algorithm best practices (2024/2025):
    1. Titles: Generate 5 click-worthy titles (under 60 chars) that evoke curiosity or promise value.
    2. Description: Write a highly engaging, professional description optimized for retention and conversion.
       - **First 2 lines**: Must be a strong hook/summary for high CTR in search results.
       - **Body**: Explain the value of the video using the AIDA framework.
       - **Engagement**: Include a specific "Question of the Day" (سؤال الحلقة) to encourage comments.
       - **CTA**: Include a compelling call-to-action to subscribe and like the video.
       - **Structure**: Use emojis, bullet points, and clear spacing. Include a "Timestamps" (فواصل زمنية) placeholder.
    3. Keywords: Mix broad and specific long-tail tags relevant to the specific Category.
    4. Provide a strategy on how to classify this content for the algorithm.
    5. Suggest 3 high-CTR thumbnail ideas with text overlays.
    
    Output strictly in JSON format matching the schema provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: seoSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from Gemini.");
    }

    return JSON.parse(text) as SEOResponse;
  } catch (error) {
    console.error("Error generating SEO data:", error);
    throw error;
  }
};