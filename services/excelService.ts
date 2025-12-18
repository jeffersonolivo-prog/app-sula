
import * as XLSX from 'xlsx';
import { ConsolidationResult, ConsolidatedData } from '../types';

/**
 * Converts Excel column letter (A, B, C...) to a 0-based index.
 * Handles single and double letters (e.g., A -> 0, Z -> 25, AA -> 26).
 */
const columnLetterToNumber = (column: string): number => {
  let columnNumber = 0;
  const uppercaseColumn = column.toUpperCase();
  for (let i = 0; i < uppercaseColumn.length; i++) {
    columnNumber *= 26;
    columnNumber += uppercaseColumn.charCodeAt(i) - 64;
  }
  return columnNumber - 1;
};

export const consolidateExcelData = async (file: File, columnLetter: string): Promise<ConsolidationResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const consolidated: ConsolidatedData[] = [];
        let totalRows = 0;
        const colIndex = columnLetterToNumber(columnLetter);

        if (colIndex < 0) {
          throw new Error("Coluna inválida especificada.");
        }

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          // Convert to 2D array for easy access
          const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Row 4 is index 3
          for (let i = 3; i < jsonData.length; i++) {
            const row = jsonData[i];
            const val = row[colIndex]; 

            if (val !== undefined && val !== null && val !== '') {
              consolidated.push({
                sourceSheet: sheetName,
                value: val,
                rowNumber: i + 1
              });
              totalRows++;
            }
          }
        });

        resolve({
          fileName: file.name,
          totalSheets: workbook.SheetNames.length,
          totalRows: totalRows,
          data: consolidated
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const exportToExcel = (data: ConsolidatedData[], fileName: string) => {
  const worksheetData = data.map(item => ({
    'Valor Consolidado': item.value,
    'Aba de Origem': item.sourceSheet,
    'Linha Original': item.rowNumber
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Consolidado");
  
  XLSX.writeFile(workbook, `Consolidado_${fileName}`);
};
