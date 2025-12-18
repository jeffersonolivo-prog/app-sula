import { GoogleGenAI, Type } from "@google/genai";
import { ConsolidatedData, AIAnalysisResult } from "../types";

// Declaração para satisfazer o compilador TS sobre o objeto process injetado pelo Vite
declare const process: {
  env: {
    API_KEY: string;
  };
};

/**
 * Analisa os dados consolidados utilizando a API do Gemini.
 * Segue rigorosamente as diretrizes do SDK @google/genai.
 */
export const analyzeConsolidatedData = async (data: ConsolidatedData[]): Promise<AIAnalysisResult> => {
  // Fix: Initialize GoogleGenAI using the correct named parameter and directly accessing process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const sampleData = data.slice(0, 100).map(d => d.value).join(", ");
  
  const prompt = `Analise os seguintes dados consolidados de uma planilha Excel (mostrando apenas os primeiros 100 itens se houver mais):
  
  Dados: ${sampleData}
  
  Por favor, forneça um resumo do que esses dados representam, 3 insights principais baseados nos valores e sugira categorias para organizar esses dados.`;

  // Fix: Call generateContent with the model name and prompt as per SDK requirements.
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
        // Adding propertyOrdering to match documentation examples for structured output.
        propertyOrdering: ["summary", "insights", "suggestedCategories"],
        required: ["summary", "insights", "suggestedCategories"]
      }
    }
  });

  // Fix: Access .text as a property (not a method) as required by the GenerateContentResponse object.
  const text = response.text;
  if (!text) {
    throw new Error("A IA não retornou uma resposta de texto válida.");
  }

  try {
    return JSON.parse(text.trim()) as AIAnalysisResult;
  } catch (e) {
    throw new Error("Erro ao processar a resposta da IA como JSON.");
  }
};