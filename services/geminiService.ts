
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function askPlantAdvice(prompt: string, context?: string) {
  const ai = getAI();
  const fullPrompt = `
    Context: You are a professional botanist and indoor plant care expert. 
    The user is asking about their specific plants: Dracaena 'Lemon Lime', Dieffenbachia 'Camille', or Fiddle Leaf Fig.
    Reference Material: ${context || 'General plant care knowledge.'}
    
    User Query: ${prompt}
    
    Response requirements:
    - Provide deep, expert-level botanical analysis.
    - Use Markdown for formatting.
    - If the user asks about window placement, explain based on North/South/East/West facing windows.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: fullPrompt,
  });

  return response.text;
}

export async function diagnosePlantPhoto(base64Image: string, plantName: string) {
  const ai = getAI();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: `This is a high-resolution photo of my ${plantName}. As a professional plant pathologist, please diagnose its health. Look for subtle signs of nutrient deficiency, pest infestation, or watering stress. Give me a detailed recovery plan.` }
      ]
    }
  });

  return response.text;
}
