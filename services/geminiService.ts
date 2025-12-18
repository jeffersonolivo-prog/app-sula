import { GoogleGenAI, Type } from "@google/genai";
import { ConsolidatedData, AIAnalysisResult } from "../types";

// Minimal type declaration for process to satisfy the TypeScript compiler in a browser context.
declare var process: any;

/**
 * Analisa os dados consolidados utilizando a API do Gemini.
 * Segue rigorosamente as diretrizes do SDK @google/genai.
 */
export const analyzeConsolidatedData = async (data: ConsolidatedData[]): Promise<AIAnalysisResult> => {
  // Use process.env.API_KEY directly as required.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
          summary: { 
            type: Type.STRING, 
            description: "Um resumo breve dos dados." 
          },
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
        propertyOrdering: ["summary", "insights", "suggestedCategories"],
        required: ["summary", "insights", "suggestedCategories"]
      }
    }
  });

  const text = response.text;
  
  // Explicit narrowing to string to satisfy tsc
  if (typeof text !== 'string' || text.length === 0) {
    throw new Error("A IA não retornou uma resposta de texto válida.");
  }

  try {
    return JSON.parse(text.trim()) as AIAnalysisResult;
  } catch (e) {
    throw new Error("Erro ao processar a resposta da IA como JSON.");
  }
};