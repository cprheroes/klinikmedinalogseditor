
import React, { useState } from 'react';
import { 
  Calendar, 
  FileUp, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Settings2,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { MONTHS, YEARS } from './constants';
import { AnalysisConfig } from './types';
import { analyzeExcel } from './services/excelProcessor';

const App: React.FC = () => {
  const [config, setConfig] = useState<AnalysisConfig>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Sila muat naik fail Excel untuk memulakan analisis.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await analyzeExcel(file, config);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ralat sistem dikesan semasa memproses data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-2xl">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold mb-4 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" /> Secure Data Processing
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Log Analyzer <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Pro</span>
          </h1>
          <p className="mt-4 text-slate-500 font-medium text-lg">
            Automasi pintar untuk pengurusan kehadiran kakitangan.
          </p>
        </div>

        {/* Main Interface */}
        <div className="glass-card rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 sm:p-10 transition-all border border-white/60">
          <div className="space-y-8">
            {/* Configuration Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  <Settings2 className="w-3 h-3" /> Tahun Analisis
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <select
                    value={config.year}
                    onChange={(e) => setConfig({ ...config, year: parseInt(e.target.value) })}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-2xl text-slate-900 font-bold appearance-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                   <Calendar className="w-3 h-3" /> Bulan Analisis
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <select
                    value={config.month}
                    onChange={(e) => setConfig({ ...config, month: parseInt(e.target.value) })}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-slate-200 rounded-2xl text-slate-900 font-bold appearance-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  >
                    {MONTHS.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Dropzone */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Upload Data Log (.xls / .xlsx)</label>
              <div 
                className={`relative group border-2 border-dashed rounded-[2rem] p-12 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
                  ${file ? 'bg-indigo-50/50 border-indigo-400 ring-4 ring-indigo-50' : 'bg-slate-50/50 border-slate-200 hover:border-indigo-400 hover:bg-white'}`}
                onClick={() => document.getElementById('file-upload-input')?.click()}
              >
                <div className={`mb-5 p-5 rounded-2xl transition-all duration-500 ${file ? 'bg-indigo-600 text-white shadow-xl rotate-0' : 'bg-white text-slate-400 shadow-sm border border-slate-100 group-hover:scale-110 group-hover:-rotate-3'}`}>
                  {file ? <FileSpreadsheet className="w-8 h-8" /> : <FileUp className="w-8 h-8" />}
                </div>
                <div className="text-center">
                  <p className={`text-xl font-extrabold ${file ? 'text-indigo-900' : 'text-slate-600'}`}>
                    {file ? file.name : 'Pilih atau Tarik Fail'}
                  </p>
                  <p className="text-sm text-slate-400 mt-2 font-medium">Sila pastikan sheet Log berada di kedudukan kedua</p>
                </div>
                <input
                  id="file-upload-input"
                  type="file"
                  className="hidden"
                  accept=".xls,.xlsx"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Action Area */}
            <div className="pt-2">
              <button
                onClick={handleAnalyze}
                disabled={loading || !file}
                className={`w-full group relative overflow-hidden flex items-center justify-center gap-3 py-5 px-8 rounded-2xl font-black text-lg transition-all shadow-2xl
                  ${loading || !file 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-200'}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Menjana Analisis...
                  </>
                ) : (
                  <>
                    MULAKAN ANALISIS
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>

            {/* Feedback Messages */}
            {(error || success) && (
              <div className={`p-4 rounded-2xl border flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500
                ${error ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                {error ? <AlertCircle className="w-6 h-6 flex-shrink-0" /> : <CheckCircle2 className="w-6 h-6 flex-shrink-0" />}
                <div>
                  <p className="font-bold text-sm leading-tight">
                    {error ? error : "Analisis Lengkap! Memuat turun fail yang telah ditanda secara automatik."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info / Legend */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Late (>4m)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-full shadow-sm"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saturday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded-full shadow-sm"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AF/AG Columns</span>
          </div>
        </div>

        <p className="mt-12 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">
          Engine Analysis v3.2 • Optimised for Professional Workflow
        </p>
      </div>
    </div>
  );
};

export default App;
