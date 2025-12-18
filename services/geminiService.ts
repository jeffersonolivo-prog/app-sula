
import { GoogleGenAI, Type } from "@google/genai";
import { ConsolidatedData, AIAnalysisResult } from "../types";

export const analyzeConsolidatedData = async (data: ConsolidatedData[]): Promise<AIAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // We send a sample if the data is too large to avoid token limits
  const sampleData = data.slice(0, 100).map(d => d.value).join(", ");
  
  const prompt = `Analise os seguintes dados consolidados de uma planilha Excel (mostrando apenas os primeiros 100 itens se houver mais):
  
  Dados: ${sampleData}
  
  Por favor, forneça um resumo do que esses dados representam, 3 insights principais baseados nos valores e sugira categorias para organizar esses dados.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Um resumo breve dos dados." },
          insights: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Uma lista de 3 insights principais." 
          },
          suggestedCategories: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Sugestões de categorias para classificar os dados." 
          }
        },
        required: ["summary", "insights", "suggestedCategories"]
      }
    }
  });

  return JSON.parse(response.text);
};
