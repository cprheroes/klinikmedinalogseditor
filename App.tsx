
import React, { useState } from 'react';
import { 
  Calendar, 
  FileUp, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Settings2,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  Info
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
      setError("Sila pilih fail Excel (.xls / .xlsx) sebelum meneruskan.");
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
      setError(err.message || "Ralat berlaku semasa pemprosesan fail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-8 overflow-x-hidden">
      {/* Dynamic Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-2xl z-10">
        {/* Branding & Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-slate-200 shadow-sm text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <ShieldCheck className="w-3.5 h-3.5" /> High Precision Analysis
          </div>
          <h1 className="text-4xl sm:text-5xl font-[800] text-slate-900 tracking-tight leading-none">
            Attendance <span className="text-indigo-600 italic">Log</span> Analyzer
          </h1>
          <p className="mt-4 text-slate-500 font-medium text-lg max-w-md mx-auto">
            Sistem automasi pemprosesan log kehadiran mengikut jabatan untuk pengurusan yang lebih cekap.
          </p>
        </div>

        {/* Dashboard Card */}
        <div className="glass-card rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 p-8 sm:p-10 transition-all border border-white">
          <div className="space-y-8">
            {/* Period Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <Settings2 className="w-3 h-3" /> Tahun
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <select
                    value={config.year}
                    onChange={(e) => setConfig({ ...config, year: parseInt(e.target.value) })}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold appearance-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm cursor-pointer"
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2.5">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  <Calendar className="w-3 h-3" /> Bulan
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <select
                    value={config.month}
                    onChange={(e) => setConfig({ ...config, month: parseInt(e.target.value) })}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold appearance-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm cursor-pointer"
                  >
                    {MONTHS.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fail Sumber (Excel)</label>
              <div 
                className={`relative group border-2 border-dashed rounded-[2rem] p-10 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
                  ${file ? 'bg-indigo-50/50 border-indigo-400 ring-4 ring-indigo-500/5' : 'bg-slate-50/50 border-slate-200 hover:border-indigo-400 hover:bg-white'}`}
                onClick={() => document.getElementById('file-upload-input')?.click()}
              >
                <div className={`mb-4 p-5 rounded-2xl transition-all duration-500 ${file ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white text-slate-400 shadow-sm border border-slate-100 group-hover:scale-110'}`}>
                  {file ? <FileSpreadsheet className="w-8 h-8" /> : <FileUp className="w-8 h-8" />}
                </div>
                <div className="text-center">
                  <p className={`text-lg font-extrabold tracking-tight ${file ? 'text-indigo-900' : 'text-slate-600'}`}>
                    {file ? file.name : 'Muat Naik Fail Log'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-semibold flex items-center justify-center gap-1">
                    <Info className="w-3 h-3" /> Pastikan Log berada di Sheet Kedua
                  </p>
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

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={handleAnalyze}
                disabled={loading || !file}
                className={`w-full group relative flex items-center justify-center gap-3 py-5 px-8 rounded-[1.25rem] font-black text-lg transition-all shadow-2xl
                  ${loading || !file 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-200'}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Sedang Diproses...
                  </>
                ) : (
                  <>
                    PROSES & MUAT TURUN
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>

            {/* Notification */}
            {(error || success) && (
              <div className={`p-4 rounded-2xl border flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500
                ${error ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                {error ? <AlertCircle className="w-6 h-6 flex-shrink-0" /> : <CheckCircle2 className="w-6 h-6 flex-shrink-0" />}
                <p className="font-bold text-sm">
                  {error ? error : "Analisis Berjaya! Fail sedang dimuat turun secara automatik."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Legend / Key */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-200"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lewat (>4m)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-full shadow-sm"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sabtu</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded-full shadow-sm"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Summary (AF/AG)</span>
          </div>
        </div>

        <p className="mt-12 text-center text-slate-300 text-[9px] font-black uppercase tracking-[0.4em]">
          Engine 3.2.0 • Powered by React 19 • Enterprise Grade
        </p>
      </div>
    </div>
  );
};

export default App;
