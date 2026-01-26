
import XLSX from 'xlsx-js-style';
import { Department, AnalysisConfig } from '../types';
import { STAFF_MAP } from '../constants';

const getMinutes = (timeStr: string): number | null => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const match = timeStr.match(/(\d{1,2})[:.-](\d{2})/);
  if (!match) return null;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
};

const STYLES = {
  LATE: {
    fill: { fgColor: { rgb: "FFFF0000" } }, // Red
    font: { color: { rgb: "FFFFFFFF" }, bold: true },
    alignment: { wrapText: true, vertical: "center", horizontal: "center" },
    border: {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" }
    }
  },
  SATURDAY: {
    fill: { fgColor: { rgb: "FFCCEAFF" } }, // Soft Blue
    alignment: { wrapText: true, vertical: "center", horizontal: "center" },
    border: {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" }
    }
  },
  DEFAULT: {
    alignment: { wrapText: true, vertical: "center", horizontal: "center" },
    border: {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" }
    }
  },
  HEADER: {
    font: { bold: true, color: { rgb: "FFFFFFFF" } },
    fill: { fgColor: { rgb: "FF1E293B" } }, // Slate 800
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" }
    }
  },
  SUMMARY: {
    font: { bold: true },
    fill: { fgColor: { rgb: "FFFFF2CC" } }, // Pastel Yellow
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" }
    }
  }
};

export const analyzeExcel = async (file: File, config: AnalysisConfig): Promise<void> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { cellStyles: true });

  const logSheetName = workbook.SheetNames[1]; // Target: Sheet ke-2 (Logs)
  if (!logSheetName) throw new Error("Format fail tidak sah. Sheet kedua (Log) tidak dijumpai.");

  const logSheet = workbook.Sheets[logSheetName];
  
  // Define working range
  const range = XLSX.utils.decode_range(logSheet['!ref'] || "A1:AE300");
  const maxRowIndex = Math.max(range.e.r, 290);
  
  logSheet['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: maxRowIndex, c: 32 } // Up to AG (Column 32)
  });

  // Write Headers for AF (31) and AG (32) at Row 8 (Index 7)
  const headerIdx = 7;
  logSheet[XLSX.utils.encode_cell({ r: headerIdx, c: 31 })] = { v: "LEWAT", t: 's', s: STYLES.HEADER };
  logSheet[XLSX.utils.encode_cell({ r: headerIdx, c: 32 })] = { v: "LABEL (ROW-NAME)", t: 's', s: STYLES.HEADER };

  const daysInMonth = new Date(config.year, config.month, 0).getDate();

  // Primary Staff Analysis
  for (const staff of STAFF_MAP) {
    const r = staff.row - 1; // 1-based row from constant to 0-based
    let lateCount = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const colIdx = d - 1; 
      const cellRef = XLSX.utils.encode_cell({ r, c: colIdx });
      
      if (!logSheet[cellRef]) logSheet[cellRef] = { v: "", t: "s" };
      const cell = logSheet[cellRef];
      const dateObj = new Date(config.year, config.month - 1, d);
      const dayOfWeek = dateObj.getDay();

      // Saturday styling
      if (dayOfWeek === 6) {
        cell.s = STYLES.SATURDAY;
      } else if (!cell.s) {
        cell.s = STYLES.DEFAULT;
      }

      const cellValue = String(cell.v || "").trim();
      if (cellValue !== "") {
        const lines = cellValue.split(/[\r\n]+/);
        const clockInStr = lines[0].trim();
        const minutesIn = getMinutes(clockInStr);

        if (minutesIn !== null) {
          let limitMinutes = -1;

          // Department Rules
          if (staff.dept === Department.ADMIN) {
            if (dayOfWeek >= 0 && dayOfWeek <= 4) limitMinutes = 8 * 60 + 30; // 08:30
            else if (dayOfWeek === 6) limitMinutes = 14 * 60; // 14:00
          } else if (staff.dept === Department.KLINIKAL) {
            limitMinutes = (minutesIn < 12 * 60) ? 8 * 60 : 16 * 60;
          } else if (staff.dept === Department.DOKTOR) {
            const shifts = (dayOfWeek === 5) ? [9 * 60, 15 * 60] : [9 * 60, 14 * 60 + 30, 20 * 60];
            limitMinutes = shifts.reduce((prev, curr) => Math.abs(curr - minutesIn) < Math.abs(prev - minutesIn) ? curr : prev);
          }

          // Marked Late (> 4 mins grace)
          if (limitMinutes !== -1 && minutesIn > limitMinutes + 4) {
            lateCount++;
            cell.s = STYLES.LATE;
          }
        }
      }
    }

    // Write Column AF: Total Late
    logSheet[XLSX.utils.encode_cell({ r, c: 31 })] = { 
      v: lateCount, t: 'n', s: STYLES.SUMMARY 
    };

    // Write Column AG: Format (Row-Name)
    logSheet[XLSX.utils.encode_cell({ r, c: 32 })] = { 
      v: `${staff.row}-${staff.name}`, t: 's', s: STYLES.SUMMARY 
    };
  }

  // Column Widths
  if (!logSheet['!cols']) logSheet['!cols'] = [];
  logSheet['!cols'][31] = { wch: 10 };
  logSheet['!cols'][32] = { wch: 20 };

  // Generate Clean Output Workbook
  const outWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(outWorkbook, logSheet, "Logs Analyzed");
  
  XLSX.writeFile(outWorkbook, `Analisis_Log_${config.month}_${config.year}.xlsx`);
};
