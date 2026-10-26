import React, { useState, useMemo } from 'react';
import {
  Award,
  ShieldCheck,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Sparkles,
  Printer,
  FileCheck2,
  RotateCw,
  AlertTriangle
} from 'lucide-react';
import { Certificate, Intern, Task, FinalFeedback, SystemSettings, UserRole } from '../types';
import { api } from '../utils/api';
import { generateCertificatePdf } from '../utils/certificatePdf';

interface CertificatesViewProps {
  certificates: Certificate[];
  interns: Intern[];
  tasks: Task[];
  feedbacks: FinalFeedback[];
  settings: SystemSettings;
  currentRole: UserRole;
  activeInternId: string;
  onCertificateIssued: (cert: Certificate) => void;
  onOpenVerifyModal: () => void;
  onPreviewCertificate: (cert: Certificate) => void;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  certificates,
  interns,
  tasks,
  feedbacks,
  settings,
  currentRole,
  activeInternId,
  onCertificateIssued,
  onOpenVerifyModal,
  onPreviewCertificate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [issuingInternId, setIssuingInternId] = useState<string | null>(null);

  // Compute eligibility matrix for all interns
  const eligibilityList = useMemo(() => {
    let list = interns;
    if (currentRole === 'Intern') {
      list = list.filter(i => i.id === activeInternId);
    }

    return list.map(intern => {
      const internTasks = tasks.filter(t => t.internId === intern.id);
      const existingCert = certificates.find(c => c.internId === intern.id);
      const feedback = feedbacks.find(f => f.internId === intern.id);

      // Check rules:
      // 1. All mandatory tasks approved
      const mandatoryTasks = internTasks.filter(t => t.isMandatory);
      const uncompletedMandatory = mandatoryTasks.filter(t => t.status !== 'Completed' && t.status !== 'Approved');
      const mandatoryPassed = mandatoryTasks.length > 0 && uncompletedMandatory.length === 0;

      // 2. Final mentor evaluation approved
      const feedbackApproved = Boolean(feedback && feedback.mentorApprovalStatus === 'Approved');

      // 3. Minimum score threshold
      const scoredTasks = internTasks.filter(t => typeof t.reviewScore === 'number');
      const avgScore = scoredTasks.length > 0 ? Math.round(scoredTasks.reduce((s, t) => s + (t.reviewScore || 0), 0) / scoredTasks.length) : 0;
      const scorePassed = avgScore >= settings.eligibilityRules.requireMinScore;

      // Overall eligible
      const isEligible = mandatoryPassed && feedbackApproved && scorePassed;

      return {
        intern,
        existingCert,
        mandatoryTotal: mandatoryTasks.length,
        mandatoryUncompleted: uncompletedMandatory.length,
        feedbackApproved,
        avgScore,
        isEligible
      };
    });
  }, [interns, tasks, certificates, feedbacks, settings, currentRole, activeInternId]);

  const filteredList = useMemo(() => {
    return eligibilityList.filter(item => {
      const matchSearch =
        item.intern.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.intern.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = selectedDept === 'all' || item.intern.department === selectedDept;
      return matchSearch && matchDept;
    });
  }, [eligibilityList, searchTerm, selectedDept]);

  // Issue Certificate Handler
  const handleIssueCertificate = async (internId: string) => {
    setIssuingInternId(internId);
    try {
      const newCert = await api.issueCertificate(internId);
      onCertificateIssued(newCert);
    } catch (err: any) {
      alert(err.message || 'Failed to issue certificate');
    } finally {
      setIssuingInternId(null);
    }
  };

  // Download PDF Handler
  const handleDownloadPdf = (cert: Certificate) => {
    const doc = generateCertificatePdf(cert, settings.companyName);
    doc.save(`${cert.id}_${cert.internName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {currentRole === 'Intern' ? 'My Official Certificate of Completion' : 'Completion Certificate Issuance & Verification'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              {certificates.length} Issued
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated eligibility verification, unique cryptographically styled IDs, tamper-proof audit trails, and PDF generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVerifyModal}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Public Certificate Lookup Tool</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by intern name, ID, or certificate ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Filter Department"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Departments</option>
            {Array.from(new Set(interns.map(i => i.department))).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Certificate Eligibility & Issuance Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3.5 px-4">Intern ID & Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Mandatory Tasks</th>
                <th className="py-3.5 px-4">Mentor Evaluation</th>
                <th className="py-3.5 px-4">Score Threshold</th>
                <th className="py-3.5 px-4">Eligibility Status</th>
                <th className="py-3.5 px-4">Certificate ID</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map(item => {
                const cert = item.existingCert;

                return (
                  <tr key={item.intern.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.intern.fullName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{item.intern.id}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {item.intern.department}
                    </td>

                    <td className="py-3.5 px-4">
                      {item.mandatoryUncompleted === 0 ? (
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>All {item.mandatoryTotal} Passed</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-600 font-semibold">
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span>{item.mandatoryUncompleted} Unresolved</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {item.feedbackApproved ? (
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Approved</span>
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium">Pending Signoff</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {item.avgScore} / 100 {item.avgScore >= settings.eligibilityRules.requireMinScore ? '✓' : '✗'}
                    </td>

                    <td className="py-3.5 px-4">
                      {item.isEligible || cert ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Eligible
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          Incomplete
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {cert ? (
                        <span className="text-indigo-700">{cert.id}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {cert ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPreviewCertificate(cert)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Preview Certificate Design"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(cert)}
                            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Download Official PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ) : currentRole !== 'Intern' ? (
                        <button
                          onClick={() => handleIssueCertificate(item.intern.id)}
                          disabled={!item.isEligible || issuingInternId === item.intern.id}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Issue Certificate</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending completion</span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
