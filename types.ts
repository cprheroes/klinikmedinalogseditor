
export enum Department {
  ADMIN = 'ADMIN',
  DOKTOR = 'DOKTOR',
  KLINIKAL = 'KLINIKAL'
}

export interface StaffMapping {
  row: number;
  name: string;
  dept: Department;
}

export interface AnalysisConfig {
  year: number;
  month: number;
}
