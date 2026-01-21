
import XLSX from 'xlsx-js-style';
import { Department, AnalysisConfig } from '../types';
import { STAFF_MAP } from '../constants';

/**
 * Utility to parse HH:MM string to total minutes
 */
const getMinutes = (timeStr: string): number | null => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  // Menangani format jam seperti 08:30, 08.30 atau 08-30
  const match = timeStr.match(/(\d{1,2})[:.-](\d{2})/);
  if (!match) return null;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
};

/**
 * Styles for the Excel sheet
 */
const STYLES = {
  LATE: {
    fill: { fgColor: { rgb: "FFFF0000" } }, // Merah
    font: { color: { rgb: "FFFFFFFF" }, bold: true },
    alignment: { wrapText: true, vertical: "center", horizontal: "center" },
    border: {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" }
    }
  },
  SATURDAY: {
    fill: { fgColor: { rgb: "FFCCEAFF" } }, // Biru Cair
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
    fill: { fgColor: { rgb: "FF333333" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" }
    }
  },
  SUMMARY: {
    font: { bold: true },
    fill: { fgColor: { rgb: "FFFFF2CC" } }, // Kuning cair
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

  const logSheetName = workbook.SheetNames[1]; // Ambil sheet kedua (Logs)
  if (!logSheetName) {
    throw new Error("Sheet Log (sheet kedua) tidak dijumpai.");
  }

  const logSheet = workbook.Sheets[logSheetName];
  
  // Dapatkan range asal dan tentukan range baru (sehingga AG / index 32)
  const range = XLSX.utils.decode_range(logSheet['!ref'] || "A1:AE300");
  const maxRow = Math.max(range.e.r, 300); // Pastikan cover semua baris staf
  
  // Set range baru untuk membolehkan kolum AF dan AG kelihatan
  logSheet['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: maxRow, c: 32 } // C=31 adalah AF, C=32 adalah AG
  });

  // Tambah Header di Baris 1 (r:0) untuk AF dan AG
  const headerRow = 0;
  logSheet[XLSX.utils.encode_cell({ r: headerRow, c: 31 })] = { v: "JUMLAH LEWAT", t: 's', s: STYLES.HEADER };
  logSheet[XLSX.utils.encode_cell({ r: headerRow, c: 32 })] = { v: "NAMA & JABATAN", t: 's', s: STYLES.HEADER };

  const daysInMonth = new Date(config.year, config.month, 0).getDate();

  // Proses setiap staf dalam STAFF_MAP
  for (const staff of STAFF_MAP) {
    const r = staff.row - 1; // Baris Excel ke index 0
    let lateCount = 0;

    // 1. Semak setiap hari (Kolum A hingga AE...)
    for (let d = 1; d <= daysInMonth; d++) {
      const colIdx = d - 1; 
      const cellRef = XLSX.utils.encode_cell({ r, c: colIdx });
      
      if (!logSheet[cellRef]) {
        logSheet[cellRef] = { v: "", t: "s" };
      }
      const cell = logSheet[cellRef];
      
      const dateObj = new Date(config.year, config.month - 1, d);
      const dayOfWeek = dateObj.getDay(); // 0:Sun, 6:Sat

      // Tanda Biru untuk Sabtu (Hanya pada baris staf)
      if (dayOfWeek === 6) {
        cell.s = STYLES.SATURDAY;
      } else if (!cell.s) {
        cell.s = STYLES.DEFAULT;
      }

      const cellValue = String(cell.v || "").trim();
      if (cellValue !== "") {
        const lines = cellValue.split(/[\r\n]+/);
        const clockInStr = lines[0].trim(); // Ambil waktu pertama
        const minutesIn = getMinutes(clockInStr);

        if (minutesIn !== null) {
          let limitMinutes = -1;

          // Peraturan Shift
          if (staff.dept === Department.ADMIN) {
            if (dayOfWeek >= 0 && dayOfWeek <= 4) limitMinutes = 8 * 60 + 30; // 08:30
            else if (dayOfWeek === 6) limitMinutes = 14 * 60; // 14:00
          } else if (staff.dept === Department.KLINIKAL) {
            limitMinutes = (minutesIn < 12 * 60) ? 8 * 60 : 16 * 60; // 08:00 / 16:00
          } else if (staff.dept === Department.DOKTOR) {
            const shifts = (dayOfWeek === 5) ? [9 * 60, 15 * 60] : [9 * 60, 14 * 60 + 30, 20 * 60];
            limitMinutes = shifts.reduce((prev, curr) => Math.abs(curr - minutesIn) < Math.abs(prev - minutesIn) ? curr : prev);
          }

          // Lewat jika lebih 4 minit
          if (limitMinutes !== -1 && minutesIn > limitMinutes + 4) {
            lateCount++;
            cell.s = STYLES.LATE; // Tanda Merah
          }
        }
      }
    }

    // 2. Isi Column AF (Index 31): JUMLAH LEWAT
    const afRef = XLSX.utils.encode_cell({ r, c: 31 });
    logSheet[afRef] = { 
      v: lateCount, 
      t: 'n', 
      s: { ...STYLES.SUMMARY, font: { bold: true, color: { rgb: lateCount > 0 ? "FF0000" : "000000" } } }
    };

    // 3. Isi Column AG (Index 32): NAMA & JABATAN
    const agRef = XLSX.utils.encode_cell({ r, c: 32 });
    logSheet[agRef] = { 
      v: `${staff.name.toUpperCase()} (${staff.dept})`, 
      t: 's', 
      s: { ...STYLES.SUMMARY, alignment: { horizontal: "left" } }
    };
  }

  // Set lebar kolum AF dan AG
  if (!logSheet['!cols']) logSheet['!cols'] = [];
  logSheet['!cols'][31] = { wch: 15 };
  logSheet['!cols'][32] = { wch: 30 };

  // Bina Workbook baru (Hanya sheet Logs yang diubah)
  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, logSheet, "Logs Analyzed");
  
  // Download fail
  XLSX.writeFile(newWorkbook, `Analisis_Kehadiran_${config.month}_${config.year}.xlsx`);
};
