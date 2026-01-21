
import React, { useState } from 'react';
import { Calendar, FileUp, Download, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
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
      setError("Sila upload fail .xls atau .xlsx terlebih dahulu.");
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
      setError(err.message || "Berlaku ralat semasa memproses fail. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Log Attendance Analyzer
          </h1>
          <p className="mt-2 text-slate-500 font-medium">
            Sistem automatik penandaan lewat & penyusunan log kehadiran.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100 overflow-hidden relative">
          <div className="space-y-6">
            {/* Setting Box */}
            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
              <h2 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Info className="w-4 h-4" /> Tetapan Analisis
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">TAHUN</label>
                  <select
                    value={config.year}
                    onChange={(e) => setConfig({ ...config, year: parseInt(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none shadow-sm"
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">BULAN</label>
                  <select
                    value={config.month}
                    onChange={(e) => setConfig({ ...config, month: parseInt(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none shadow-sm"
                  >
                    {MONTHS.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Muat Naik Fail Log</label>
              <div 
                className={`relative group border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4
                  ${file ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-white'}`}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <div className={`p-5 rounded-full ${file ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-400'} shadow-md group-hover:scale-110 transition-transform`}>
                  <FileUp className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className={`text-lg font-bold ${file ? 'text-indigo-700' : 'text-slate-600'}`}>
                    {file ? file.name : 'Pilih Fail .xls atau .xlsx'}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">Pastikan Sheet kedua adalah 'Logs'</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".xls,.xlsx"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Notifications */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-700 rounded-2xl text-sm font-semibold border border-rose-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-semibold border border-emerald-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <p>Analisis selesai! Fail telah ditanda (Merah: Lewat, Biru: Sabtu) dan dimuat turun.</p>
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !file}
              className={`w-full flex items-center justify-center gap-3 py-5 px-6 rounded-2xl font-black text-xl transition-all shadow-xl
                ${loading || !file 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-200 hover:shadow-indigo-300'}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Menganalisis...
                </>
              ) : (
                <>
                  <Download className="w-6 h-6" />
                  PROSES LOGS
                </>
              )}
            </button>
          </div>
        </div>

        {/* Legend / Info */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="w-6 h-6 bg-red-500 rounded-md mx-auto mb-2" />
            <p className="text-[10px] font-bold text-slate-500 uppercase">Lewat (>4m)</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
            <div className="w-6 h-6 bg-blue-100 border border-blue-200 rounded-md mx-auto mb-2" />
            <p className="text-[10px] font-bold text-slate-500 uppercase">Hari Sabtu</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col justify-center items-center">
             <span className="text-lg font-black text-indigo-600 leading-none mb-1">AF/AG</span>
             <p className="text-[10px] font-bold text-slate-500 uppercase">Summary & Label</p>
          </div>
        </div>

        <p className="mt-12 text-center text-slate-400 text-xs font-medium">
          Dikuasakan oleh Analysis Engine v2.0 • Sesuai untuk format .xls standard
        </p>
      </div>
    </div>
  );
};

export default App;
