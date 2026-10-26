import React, { useState } from 'react';
import { X, FileSpreadsheet, Upload, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { downloadSampleExcelTemplate } from '../../utils/sampleExcelTemplate';
import { api } from '../../utils/api';
import * as XLSX from 'xlsx';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<{ imported: number; errors: any[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setErrorMsg('');
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(sheet);
        setParsedRows(json);
      } catch (err) {
        setErrorMsg('Failed to parse Excel workbook. Please ensure it is a valid .xlsx or .xls file.');
      }
    };
    reader.readAsArrayBuffer(selected);
  };

  const handleUpload = async () => {
    if (!file || parsedRows.length === 0) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      // Map rows
      const formatted = parsedRows.map(r => ({
        fullName: r['Full Name'] || r['Name'] || r['fullName'] || '',
        email: r['Email Address'] || r['Email'] || r['email'] || '',
        phone: r['Phone Number'] || r['Phone'] || r['phone'] || '+1 (555) 000-0000',
        department: r['Department'] || r['department'] || 'Artificial Intelligence & ML',
        collegeName: r['College Name'] || r['College'] || r['collegeName'] || 'University',
        startDate: r['Internship Start Date'] || r['Start Date'] || '2026-06-01',
        endDate: r['Internship End Date'] || r['End Date'] || '2026-09-30',
        status: r['Status'] || 'Active'
      }));

      const res = await api.bulkImportInterns({ interns: formatted });
      setImportResult(res);
      onImportComplete();
    } catch (err: any) {
      setErrorMsg(err.message || 'Import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h2 className="font-extrabold text-slate-900 text-base">Bulk Import Interns from Excel</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="mt-4 space-y-4 text-xs">
          
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">Need the formatted spreadsheet template?</p>
              <p className="text-[11px] text-slate-500">Download the pre-configured sample Excel file.</p>
            </div>
            <button
              onClick={downloadSampleExcelTemplate}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-400 transition-colors">
            <input
              type="file"
              id="excel-file-input"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="excel-file-input" className="cursor-pointer block">
              <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-xs">
                {file ? file.name : 'Click to browse or drag & drop Excel workbook'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Supports .xlsx and .xls formats</p>
            </label>
          </div>

          {parsedRows.length > 0 && !importResult && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-indigo-900 font-medium">
              <span>Detected {parsedRows.length} intern records ready to import</span>
              <button
                onClick={handleUpload}
                disabled={isProcessing}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Execute Bulk Import</span>
                )}
              </button>
            </div>
          )}

          {/* Import Results & Validation Errors summary */}
          {importResult && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Successfully imported {importResult.imported} interns!</span>
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Unique sequential intern IDs assigned automatically with assigned department mentors.
                </p>
              </div>

              {importResult.errors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl max-h-36 overflow-y-auto">
                  <p className="font-bold text-rose-900 mb-1">Validation Warnings / Skipped Rows ({importResult.errors.length}):</p>
                  <ul className="space-y-1 text-[11px]">
                    {importResult.errors.map((err, idx) => (
                      <li key={idx}>Row {err.row}: {err.email} - {err.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
            >
              {importResult ? 'Done' : 'Cancel'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
