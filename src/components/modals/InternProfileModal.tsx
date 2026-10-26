import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  FileText,
  Download,
  Loader2
} from 'lucide-react';
import { Intern, Task, PerformanceMetrics, Certificate, FinalFeedback } from '../../types';
import { api } from '../../utils/api';
import { generateCertificatePdf } from '../../utils/certificatePdf';
import { generateFeedbackPdf } from '../../utils/feedbackPdf';

interface InternProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  internId: string | null;
  companyName: string;
}

export const InternProfileModal: React.FC<InternProfileModalProps> = ({
  isOpen,
  onClose,
  internId,
  companyName
}) => {
  const [data, setData] = useState<{
    intern: Intern;
    metrics: PerformanceMetrics;
    tasks: Task[];
    certificate?: Certificate;
    feedback?: FinalFeedback;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !internId) {
      setData(null);
      return;
    }

    setIsLoading(true);
    api.getInternDetails(internId)
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [isOpen, internId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="font-extrabold text-slate-900 text-base">
              Intern Performance Profile: {internId}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading || !data ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            <p>Loading intern records and verified performance metrics...</p>
          </div>
        ) : (
          <div className="space-y-5 text-xs">
            
            {/* Profile Overview Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-slate-900">{data.intern.fullName}</span>
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {data.intern.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {data.intern.status}
                  </span>
                </div>
                <p className="text-slate-500 mt-1">
                  {data.intern.collegeName} • {data.intern.department}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-slate-500 text-[11px]">
                  <span>Email: {data.intern.email}</span>
                  <span>Mentor: {data.intern.assignedMentorName}</span>
                </div>
              </div>

              {/* Calculated Score pill */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-center shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400">Calculated Score</span>
                <div className="text-2xl font-black text-indigo-700">{data.metrics.finalCalculatedScore} / 100</div>
                <span className="text-[10px] text-emerald-600 font-bold">
                  {data.metrics.eligibilityStatus ? 'Eligible for Cert' : 'In Progress'}
                </span>
              </div>
            </div>

            {/* Performance KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tasks Completed</span>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {data.metrics.totalCompletedTasks} / {data.metrics.totalAssignedTasks}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Avg Review Score</span>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {data.metrics.avgReviewScore} / 100
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">On-Time Rate</span>
                <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {data.metrics.onTimeCompletionRate}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Overdue Tasks</span>
                <div className={`text-lg font-extrabold mt-0.5 ${data.metrics.overdueTasks > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {data.metrics.overdueTasks}
                </div>
              </div>
            </div>

            {/* Milestone Deliverables History */}
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                Assigned Milestones ({data.tasks.length})
              </h3>
              <div className="space-y-2">
                {data.tasks.map(t => (
                  <div key={t.id} className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-600">{t.id}</span>
                        <span className="font-bold text-slate-900">{t.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Due: {t.dueDate} • Status: <strong className="text-indigo-600">{t.status}</strong>
                        {t.reviewScore !== undefined && ` • Score: ${t.reviewScore}/100`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Credentials & Documents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {data.certificate ? (
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Certificate Issued</span>
                    </span>
                    <p className="font-mono text-[11px] text-amber-800 mt-0.5">{data.certificate.id}</p>
                  </div>
                  <button
                    onClick={() => {
                      const doc = generateCertificatePdf(data.certificate!, companyName);
                      doc.save(`${data.certificate!.id}.pdf`);
                    }}
                    className="p-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg"
                    title="Download Certificate PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                  <span className="font-bold block text-slate-700">Completion Certificate</span>
                  <span className="text-[11px]">Not issued yet</span>
                </div>
              )}

              {data.feedback ? (
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-indigo-900 flex items-center gap-1">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Final Feedback ({data.feedback.mentorApprovalStatus})</span>
                    </span>
                    <p className="text-[11px] text-indigo-700 mt-0.5">{data.feedback.finalRecommendation}</p>
                  </div>
                  <button
                    onClick={() => {
                      const doc = generateFeedbackPdf(data.feedback!, data.intern, companyName);
                      doc.save(`Feedback_${data.intern.id}.pdf`);
                    }}
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
                    title="Download Feedback PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                  <span className="font-bold block text-slate-700">Final Feedback Report</span>
                  <span className="text-[11px]">Not generated yet</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Close
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
