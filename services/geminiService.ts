import { GoogleGenAI, Type } from "@google/genai";
import { ConsolidatedData, AIAnalysisResult } from "../types";

// Declaração necessária para o compilador TypeScript (tsc) ignorar o erro de 'process' não definido no browser
declare const process: any;

/**
 * Analisa os dados consolidados utilizando a API do Gemini.
 */
export const analyzeConsolidatedData = async (data: ConsolidatedData[]): Promise<AIAnalysisResult> => {
  // Inicializa o SDK usando a variável de ambiente process.env.API_KEY
  // O Vite substituirá este texto pela chave real durante o build.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Amostra de dados para evitar exceder limites de contexto da IA
  const sampleData = data.slice(0, 100).map(d => String(d.value)).join(", ");
  
  const prompt = `Analise os seguintes dados consolidados de uma planilha Excel:
  
  Dados: ${sampleData}
  
  Por favor, forneça um resumo do que esses dados representam, 3 insights principais baseados nos valores e sugira categorias para organizar esses dados.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            insights: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            suggestedCategories: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["summary", "insights", "suggestedCategories"]
        }
      }
    });

    const text = response.text;
    
    if (!text) {
      throw new Error("A resposta da IA está vazia.");
    }

    return JSON.parse(text.trim()) as AIAnalysisResult;
  } catch (err) {
    console.error("Erro na comunicação com Gemini:", err);
    throw new Error("Não foi possível processar a análise inteligente.");
  }
};