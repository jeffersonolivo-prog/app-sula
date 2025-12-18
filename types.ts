
export interface ConsolidatedData {
  sourceSheet: string;
  value: any;
  rowNumber: number;
}

export interface ConsolidationResult {
  fileName: string;
  totalSheets: number;
  totalRows: number;
  data: ConsolidatedData[];
}

export interface AIAnalysisResult {
  summary: string;
  insights: string[];
  suggestedCategories: string[];
}
