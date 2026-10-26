import React, { useState } from 'react';
import { X, ShieldCheck, Search, CheckCircle2, AlertTriangle, Award, Loader2 } from 'lucide-react';
import { api } from '../../utils/api';
import { Certificate } from '../../types';

interface VerifyCertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerifyCertModal: React.FC<VerifyCertModalProps> = ({ isOpen, onClose }) => {
  const [certId, setCertId] = useState('CERT-2026-INFLOW-001');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; certificate?: Certificate; error?: string } | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setIsVerifying(true);
    setResult(null);
    try {
      const res = await api.verifyCertificate(certId.trim());
      setResult(res);
    } catch (err: any) {
      setResult({ valid: false, error: err.message || 'Lookup failed' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="font-extrabold text-slate-900 text-base">Public Credential Verification</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Enter any InternFlow AI completion certificate identifier to authenticate credential legitimacy against verified database records.
        </p>

        <form onSubmit={handleVerify} className="mt-4 flex gap-2">
          <input
            type="text"
            required
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            placeholder="e.g. CERT-2026-INFLOW-001"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={isVerifying}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
          >
            {isVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Verify</span>
          </button>
        </form>

        {/* Verification Result Card */}
        {result && (
          <div className="mt-4">
            {result.valid && result.certificate ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-extrabold text-sm text-emerald-950">AUTHENTIC CREDENTIAL VERIFIED</span>
                </div>
                <div className="pt-2 border-t border-emerald-200/60 space-y-1">
                  <p><strong>Intern Name:</strong> {result.certificate.internName}</p>
                  <p><strong>Intern ID:</strong> {result.certificate.internId}</p>
                  <p><strong>Department:</strong> {result.certificate.department}</p>
                  <p><strong>Completion Duration:</strong> {result.certificate.startDate} to {result.certificate.endDate}</p>
                  <p><strong>Issue Date:</strong> {result.certificate.issueDate}</p>
                  <p><strong>Authorized Signatory:</strong> {result.certificate.signatoryName}</p>
                  <p className="text-[10px] text-emerald-700">Verification check recorded #{result.certificate.verifiedCount}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-bold text-rose-950">INVALID CERTIFICATE IDENTIFIER</span>
                </div>
                <p className="text-[11px] text-rose-700">
                  {result.error || 'The certificate ID provided does not match any official graduation record.'}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
