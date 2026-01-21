
import { Department, StaffMapping } from './types';

export const STAFF_MAP: StaffMapping[] = [
  // ADMIN
  { row: 9, name: 'harizan', dept: Department.ADMIN },
  { row: 24, name: 'mimi', dept: Department.ADMIN },
  { row: 27, name: 'azhar', dept: Department.ADMIN },
  { row: 81, name: 'amirah', dept: Department.ADMIN },
  { row: 84, name: 'aisyah', dept: Department.ADMIN },
  { row: 87, name: 'ain', dept: Department.ADMIN },
  { row: 126, name: 'rosabrina', dept: Department.ADMIN },
  { row: 132, name: 'nabila', dept: Department.ADMIN },
  { row: 228, name: 'arif', dept: Department.ADMIN },
  { row: 243, name: 'halvina', dept: Department.ADMIN },
  { row: 255, name: 'nadia', dept: Department.ADMIN },
  { row: 264, name: 'amni', dept: Department.ADMIN },
  { row: 276, name: 'aireen', dept: Department.ADMIN },
  // DOKTOR
  { row: 54, name: 'farhana', dept: Department.DOKTOR },
  { row: 69, name: 'najihah', dept: Department.DOKTOR },
  { row: 99, name: 'liyana', dept: Department.DOKTOR },
  { row: 150, name: 'hazwani', dept: Department.DOKTOR },
  { row: 204, name: 'hanifa', dept: Department.DOKTOR },
  { row: 231, name: 'mashi', dept: Department.DOKTOR },
  // KLINIKAL
  { row: 15, name: 'hajar', dept: Department.KLINIKAL },
  { row: 36, name: 'farah', dept: Department.KLINIKAL },
  { row: 51, name: 'aimi', dept: Department.KLINIKAL },
  { row: 183, name: 'anis', dept: Department.KLINIKAL },
  { row: 189, name: 'nazurah', dept: Department.KLINIKAL },
  { row: 195, name: 'faidatul', dept: Department.KLINIKAL },
  { row: 213, name: 'hidayah', dept: Department.KLINIKAL },
  { row: 216, name: 'yana', dept: Department.KLINIKAL },
  { row: 222, name: 'siti', dept: Department.KLINIKAL },
  { row: 225, name: 'yama', dept: Department.KLINIKAL },
  { row: 234, name: 'aziemah', dept: Department.KLINIKAL },
  { row: 237, name: 'syafiqa', dept: Department.KLINIKAL },
  { row: 240, name: 'syafika', dept: Department.KLINIKAL },
  { row: 246, name: 'puteri', dept: Department.KLINIKAL },
  { row: 282, name: 'dilla', dept: Department.KLINIKAL }
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
