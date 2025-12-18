import { GoogleGenAI, Type } from "@google/genai";
import { ConsolidatedData, AIAnalysisResult } from "../types";

// Avisa o TypeScript que o objeto process será injetado pelo ambiente de build (Vite/Vercel)
declare const process: {
  env: {
    API_KEY: string;
  };
};

/**
 * Analisa os dados consolidados utilizando a API do Gemini.
 */
export const analyzeConsolidatedData = async (data: ConsolidatedData[]): Promise<AIAnalysisResult> => {
  // Inicialização conforme as diretrizes do SDK @google/genai
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Amostra dos dados para evitar limites de tokens
  const sampleData = data.slice(0, 100).map(d => d.value).join(", ");
  
  const prompt = `Analise os seguintes dados consolidados de uma planilha Excel:
  
  Dados: ${sampleData}
  
  Forneça um resumo do que esses dados representam, 3 insights principais baseados nos valores e sugira categorias para organizar esses dados.`;

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
            description: "Lista de 3 insights." 
          },
          suggestedCategories: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Categorias sugeridas." 
          }
        },
        required: ["summary", "insights", "suggestedCategories"]
      }
    }
  });

  // Acessa a propriedade .text diretamente conforme as regras do SDK
  const text = response.text;
  
  if (!text) {
    throw new Error("A IA não retornou conteúdo.");
  }

  try {
    return JSON.parse(text.trim()) as AIAnalysisResult;
  } catch (e) {
    console.error("Erro ao processar JSON da IA:", text);
    throw new Error("Falha ao processar a análise inteligente.");
  }
};