
import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  BrainCircuit,
  Database,
  Layers,
  Settings2
} from 'lucide-react';
import { consolidateExcelData, exportToExcel } from './services/excelService';
import { analyzeConsolidatedData } from './services/geminiService';
import { ConsolidationResult, AIAnalysisResult } from './types';

const App: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ConsolidationResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetColumn, setTargetColumn] = useState<string>('B');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!targetColumn || !/^[A-Z]+$/i.test(targetColumn)) {
      setError("Por favor, especifique uma letra de coluna válida (Ex: A, B, C, AA).");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setAiAnalysis(null);

    try {
      const data = await consolidateExcelData(file, targetColumn.toUpperCase());
      setResult(data);
    } catch (err) {
      setError("Erro ao processar a planilha. Verifique se o arquivo e a coluna são válidos.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const runAIAnalysis = async () => {
    if (!result) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeConsolidatedData(result.data);
      setAiAnalysis(analysis);
    } catch (err) {
      console.error("Erro na análise de IA:", err);
      setError("Não foi possível gerar a análise de IA no momento.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      exportToExcel(result.data, result.fileName);
    }
  };

  const reset = () => {
    setResult(null);
    setAiAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <FileSpreadsheet className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">ExcelConsolidator <span className="text-emerald-600">Pro</span></h1>
          </div>
          {result && (
            <button 
              onClick={reset}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" /> Novo Upload
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {!result && !isProcessing && (
          <div className="max-w-2xl mx-auto mt-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Consolide suas abas em segundos</h2>
              <p className="text-slate-600 text-lg">
                Selecione uma planilha Excel. Vamos percorrer todas as abas e coletar os dados da sua coluna escolhida.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
              <div className="flex items-center gap-4 mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <Settings2 className="w-6 h-6 text-emerald-600" />
                <div className="flex-grow">
                  <label htmlFor="col-input" className="block text-sm font-bold text-emerald-900 mb-1 uppercase tracking-wider">
                    Coluna para consolidar
                  </label>
                  <input 
                    id="col-input"
                    type="text" 
                    value={targetColumn}
                    onChange={(e) => setTargetColumn(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                    placeholder="Ex: B"
                    className="w-full bg-white border border-emerald-200 rounded-lg px-4 py-2 text-xl font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="text-xs text-emerald-600 font-medium max-w-[150px]">
                  Coletando dados da <span className="font-bold underline">Linha 4</span> em diante.
                </div>
              </div>

              <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center transition-all hover:border-emerald-400 hover:bg-emerald-50/30 group">
                <div className="bg-slate-100 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10 text-slate-400 group-hover:text-emerald-500" />
                </div>
                <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all active:scale-95">
                  Selecionar Planilha
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".xlsx, .xls" 
                    onChange={handleFileUpload} 
                  />
                </label>
                <p className="mt-4 text-sm text-slate-400 font-medium">Suporta .xlsx e .xls</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Layers, title: "Multi-Abas", desc: "Percorre automaticamente todas as abas do seu arquivo." },
                { icon: Database, title: "Configurável", desc: "Escolha qualquer coluna para extrair seus dados." },
                { icon: BrainCircuit, title: "IA Integrada", desc: "Análise inteligente dos dados consolidados." }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                  <feature.icon className="w-6 h-6 text-emerald-500 mb-3" />
                  <h3 className="font-bold text-slate-800 mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileSpreadsheet className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
            <h3 className="mt-8 text-xl font-semibold text-slate-800">Processando planilha...</h3>
            <p className="mt-2 text-slate-500">Extraindo dados da Coluna {targetColumn.toUpperCase()}...</p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-8 bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-800">Ocorreu um problema</h4>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {result && !isProcessing && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-xl">
                  <FileSpreadsheet className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Arquivo</p>
                  <p className="text-sm font-semibold text-slate-700 truncate max-w-[150px]">{result.fileName}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-purple-50 p-3 rounded-xl">
                  <Layers className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Abas Lidas</p>
                  <p className="text-lg font-bold text-slate-800">{result.totalSheets}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="bg-emerald-50 p-3 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registros (Col {targetColumn.toUpperCase()})</p>
                  <p className="text-lg font-bold text-slate-800">{result.totalRows}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDownload}
                  className="flex-grow bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                >
                  <Download className="w-5 h-5" /> Baixar Consolidado
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Table */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Database className="w-4 h-4 text-slate-400" /> Dados Consolidados (Coluna {targetColumn.toUpperCase()})
                    </h3>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-bold">Visualizando Primeiros 50</span>
                  </div>
                  <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <th className="px-6 py-3 border-b border-slate-100">Valor Extraído</th>
                          <th className="px-6 py-3 border-b border-slate-100">Aba de Origem</th>
                          <th className="px-6 py-3 border-b border-slate-100 text-center">Linha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result.data.slice(0, 50).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-700">{String(row.value)}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                {row.sourceSheet}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-slate-500">{row.rowNumber}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.data.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                      Nenhum dado encontrado na coluna {targetColumn.toUpperCase()} a partir da linha 4.
                    </div>
                  )}
                  {result.data.length > 50 && (
                    <div className="p-4 text-center bg-slate-50 border-t border-slate-100">
                      <p className="text-sm text-slate-500 italic">E mais {result.data.length - 50} registros...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar / AI Analysis */}
              <div className="space-y-6">
                {!aiAnalysis ? (
                  <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-2xl shadow-xl text-white">
                    <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                      <BrainCircuit className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Análise Inteligente</h3>
                    <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                      Deixe nossa IA analisar os dados consolidados da coluna {targetColumn.toUpperCase()} para encontrar padrões.
                    </p>
                    <button 
                      onClick={runAIAnalysis}
                      disabled={isAnalyzing || result.data.length === 0}
                      className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                          Analisando...
                        </>
                      ) : (
                        <>Gerar Insights com IA</>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold">
                      <BrainCircuit className="w-5 h-5" />
                      <h3>Insights da IA</h3>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Resumo</h4>
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                        "{aiAnalysis.summary}"
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Principais Insights</h4>
                      <ul className="space-y-2">
                        {aiAnalysis.insights.map((insight, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Categorias Sugeridas</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiAnalysis.suggestedCategories.map((cat, i) => (
                          <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md border border-indigo-100">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => setAiAnalysis(null)}
                      className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Limpar Análise
                    </button>
                  </div>
                )}

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-slate-400" /> Notas Técnicas
                  </h3>
                  <div className="space-y-3 text-sm text-slate-500">
                    <p>• Coletando coluna: <span className="font-bold text-emerald-600">{targetColumn.toUpperCase()}</span>.</p>
                    <p>• Começando da linha: <span className="font-bold text-emerald-600">4</span>.</p>
                    <p>• Ignora células vazias na coluna alvo.</p>
                    <p>• Processa sheets ocultas se presentes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} ExcelConsolidator Pro. Desenvolvido para eficiência máxima em processamento de planilhas.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
