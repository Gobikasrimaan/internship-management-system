import React from 'react';
import { X, Mail, FileText, Award, Send } from 'lucide-react';
import { Intern, SystemSettings } from '../../types';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  intern: Intern | null;
  settings: SystemSettings;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  intern,
  settings
}) => {
  if (!isOpen || !intern) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            <h2 className="font-extrabold text-slate-900 text-base">
              Email Preview: {intern.fullName}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Meta header */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-sans">
          <div>
            <span className="text-slate-400 font-semibold">To:</span>{' '}
            <span className="font-bold text-slate-900">{intern.fullName}</span> &lt;{intern.email}&gt;
          </div>
          <div>
            <span className="text-slate-400 font-semibold">From:</span>{' '}
            <span className="font-medium text-slate-700">HR Talent Team &lt;{settings.senderEmail}&gt;</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold">Subject:</span>{' '}
            <span className="font-bold text-indigo-900">
              Congratulations! Your Internship Completion Certificate and Final Feedback
            </span>
          </div>
        </div>

        {/* Email Body text */}
        <div className="p-4 rounded-xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed space-y-3 font-sans bg-white shadow-xs">
          <p>Dear {intern.fullName},</p>

          <p>Congratulations on successfully completing your internship!</p>

          <p>We are pleased to share your internship completion certificate and final performance feedback.</p>

          <p>Your dedication, contribution, and participation throughout the internship are appreciated.</p>

          <p>Please find your internship completion certificate and final performance feedback attached to this email.</p>

          <p>We wish you all the best in your future endeavors.</p>

          <div className="pt-2 text-slate-700">
            <p>Best regards,</p>
            <p className="font-bold">HR Team</p>
            <p className="font-medium text-indigo-700">{settings.companyName}</p>
          </div>
        </div>

        {/* Attached Files Box */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Verified Attachments (2 PDFs):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 text-slate-800">
              <Award className="w-4 h-4 text-amber-500" />
              <div className="truncate">
                <p className="font-bold truncate">Certificate_{intern.id}.pdf</p>
                <p className="text-[10px] text-slate-400">Official Landscape Certificate</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 text-slate-800">
              <FileText className="w-4 h-4 text-indigo-500" />
              <div className="truncate">
                <p className="font-bold truncate">Feedback_{intern.id}.pdf</p>
                <p className="text-[10px] text-slate-400">Final Performance Report</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
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
