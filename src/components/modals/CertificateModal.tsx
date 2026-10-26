import React from 'react';
import { X, Download, Printer, ShieldCheck, Award } from 'lucide-react';
import { Certificate, SystemSettings } from '../../types';
import { generateCertificatePdf } from '../../utils/certificatePdf';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate | null;
  settings: SystemSettings;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificate,
  settings
}) => {
  if (!isOpen || !certificate) return null;

  const handleDownload = () => {
    const doc = generateCertificatePdf(certificate, settings.companyName);
    doc.save(`${certificate.id}_${certificate.internName.replace(/\s+/g, '_')}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="font-extrabold text-slate-900 text-base">
              Certificate Preview: {certificate.id}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Landscape Artboard */}
        <div className="relative aspect-[1.414/1] w-full bg-[#fdfcf8] rounded-xl border-8 border-[#182b49] p-6 sm:p-10 shadow-lg flex flex-col justify-between text-center overflow-hidden">
          
          {/* Inner Gold Inset Border */}
          <div className="absolute inset-2 border-2 border-[#c5a059] pointer-events-none"></div>

          {/* Header */}
          <div className="relative z-10 pt-2">
            <p className="text-[11px] sm:text-xs font-black tracking-widest text-[#c5a059] uppercase font-sans">
              {settings.companyName.toUpperCase()}
            </p>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-serif font-black text-[#182b49] mt-2 tracking-tight">
              CERTIFICATE OF INTERNSHIP COMPLETION
            </h1>
            <p className="text-xs sm:text-sm font-serif italic text-slate-500 mt-2">
              This credential is officially conferred upon
            </p>
          </div>

          {/* Intern Name & Recognition */}
          <div className="relative z-10 my-auto py-2">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-slate-900 tracking-tight">
              {certificate.internName}
            </h2>
            <div className="w-48 sm:w-64 h-0.5 bg-[#c5a059] mx-auto mt-2 mb-4"></div>
            
            <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed">
              In official recognition of successfully fulfilling all academic and professional milestone requirements as an Intern in the
              <strong className="text-[#182b49] font-bold block mt-1 text-sm sm:text-base">
                Department of {certificate.department}
              </strong>
              from {certificate.startDate} to {certificate.endDate}, demonstrating exemplary technical proficiency and dedication.
            </p>
          </div>

          {/* Footer with Gold Seal & Signatures */}
          <div className="relative z-10 grid grid-cols-3 items-end pt-4 border-t border-slate-200/60">
            
            {/* Left: Signatory */}
            <div className="text-left pl-4">
              <p className="font-serif italic text-base sm:text-lg text-[#182b49] font-bold">
                {certificate.signatoryName}
              </p>
              <div className="w-36 h-px bg-slate-400 mt-1 mb-1"></div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-900">{certificate.signatoryName}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 leading-tight">{certificate.signatoryTitle}</p>
            </div>

            {/* Center: Gold Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#b8860b] via-[#ffd700] to-[#b8860b] p-1 shadow-md flex items-center justify-center">
                <div className="w-full h-full rounded-full border border-amber-800/40 flex flex-col items-center justify-center text-[8px] font-black uppercase text-amber-950">
                  <Award className="w-4 h-4 text-amber-900" />
                  <span>SEAL OF</span>
                  <span>MERIT</span>
                </div>
              </div>
            </div>

            {/* Right: Validation & Issue Date */}
            <div className="text-right pr-4">
              <p className="text-[10px] sm:text-xs font-bold text-slate-900">Credential Verification</p>
              <div className="w-36 h-px bg-slate-400 mt-1 mb-1 ml-auto"></div>
              <p className="text-[9px] sm:text-[10px] font-mono font-bold text-[#182b49]">{certificate.id}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-500">Issued: {certificate.issueDate}</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
