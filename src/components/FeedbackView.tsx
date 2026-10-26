import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Sparkles,
  Download,
  CheckCircle2,
  Edit2,
  Save,
  User,
  Award,
  AlertCircle,
  FileText,
  Loader2,
  Calendar,
  Briefcase
} from 'lucide-react';
import { Intern, FinalFeedback, UserRole, Mentor } from '../types';
import { api } from '../utils/api';
import { generateFeedbackPdf } from '../utils/feedbackPdf';

interface FeedbackViewProps {
  interns: Intern[];
  feedbacks: FinalFeedback[];
  mentors: Mentor[];
  currentRole: UserRole;
  activeInternId: string;
  selectedInternId?: string;
  onFeedbackSaved: (feedback: FinalFeedback) => void;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({
  interns,
  feedbacks,
  mentors,
  currentRole,
  activeInternId,
  selectedInternId,
  onFeedbackSaved
}) => {
  const [currentInternId, setCurrentInternId] = useState<string>(
    selectedInternId || (currentRole === 'Intern' ? activeInternId : (interns[0]?.id || 'INT001'))
  );

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);

  // Edit fields
  const [editedSummary, setEditedSummary] = useState<string>('');
  const [editedRecommendation, setEditedRecommendation] = useState<FinalFeedback['finalRecommendation']>('Highly Recommended');

  const selectedIntern = useMemo(() => {
    return interns.find(i => i.id === currentInternId) || interns[0];
  }, [interns, currentInternId]);

  const activeFeedback = useMemo(() => {
    return feedbacks.find(f => f.internId === currentInternId) || null;
  }, [feedbacks, currentInternId]);

  React.useEffect(() => {
    if (activeFeedback) {
      setEditedSummary(activeFeedback.summary);
      setEditedRecommendation(activeFeedback.finalRecommendation);
    }
    setIsEditing(false);
  }, [activeFeedback]);

  // Generate AI Feedback via Gemini 3.8 Flash
  const handleGenerateFeedback = async () => {
    if (!selectedIntern) return;
    setIsGenerating(true);
    try {
      const generated = await api.generateFinalFeedback(selectedIntern.id);
      onFeedbackSaved(generated);
    } catch (err: any) {
      alert(err.message || 'Failed to generate feedback');
    } finally {
      setIsGenerating(false);
    }
  };

  // Mentor Approve & Signoff
  const handleApproveFeedback = async () => {
    if (!selectedIntern || !activeFeedback) return;
    setIsApproving(true);
    try {
      const approved = await api.approveFeedback(selectedIntern.id, {
        summary: editedSummary || activeFeedback.summary,
        finalRecommendation: editedRecommendation || activeFeedback.finalRecommendation,
        mentorApprovedBy: selectedIntern.assignedMentorName
      });
      onFeedbackSaved(approved);
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || 'Failed to approve feedback');
    } finally {
      setIsApproving(false);
    }
  };

  // Download PDF Report
  const handleDownloadPdf = () => {
    if (!activeFeedback) return;
    const doc = generateFeedbackPdf(activeFeedback, selectedIntern);
    doc.save(`Performance_Report_${activeFeedback.internId}_${activeFeedback.internName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {currentRole === 'Intern' ? 'My Official Final Performance Feedback' : 'AI Final Performance Feedback Agent'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Personalized comprehensive technical assessments, strengths identification, career growth directions, and official signoffs.
          </p>
        </div>

        {/* Intern Selector for Admin / Mentor */}
        {currentRole !== 'Intern' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Select Intern:</span>
            <select
              aria-label="Select Intern for Feedback"
              value={currentInternId}
              onChange={(e) => setCurrentInternId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-xs truncate"
            >
              {interns.map(i => (
                <option key={i.id} value={i.id}>
                  {i.id}: {i.fullName} ({i.department})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Feedback Layout */}
      {selectedIntern && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Intern Profile Card (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-lg">
                  {selectedIntern.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{selectedIntern.fullName}</h3>
                  <span className="font-mono text-xs text-indigo-600 font-bold">{selectedIntern.id}</span>
                  <p className="text-[11px] text-slate-500">{selectedIntern.collegeName}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-bold text-slate-800">{selectedIntern.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mentor:</span>
                  <span className="font-medium text-slate-800">{selectedIntern.assignedMentorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Internship Period:</span>
                  <span className="font-medium text-slate-700">{selectedIntern.startDate} to {selectedIntern.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cohort Status:</span>
                  <span className="font-bold text-emerald-700">{selectedIntern.status}</span>
                </div>
              </div>

              {/* Action: Generate or Regenerate Feedback */}
              {currentRole !== 'Intern' && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleGenerateFeedback}
                    disabled={isGenerating}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Synthesizing Evaluation...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>{activeFeedback ? 'Regenerate AI Feedback' : 'Generate AI Final Feedback'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* If approved status badge */}
            {activeFeedback && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Mentor Approval Status:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    activeFeedback.mentorApprovalStatus === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {activeFeedback.mentorApprovalStatus}
                  </span>
                </div>
                {activeFeedback.mentorApprovedBy && (
                  <p className="text-slate-500 text-[11px]">
                    Signed by: <strong>{activeFeedback.mentorApprovedBy}</strong>
                  </p>
                )}
                {activeFeedback.approvedAt && (
                  <p className="text-slate-400 text-[10px]">
                    Timestamp: {activeFeedback.approvedAt}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Feedback Document Content (8 cols) */}
          <div className="lg:col-span-8">
            {activeFeedback ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                
                {/* Document Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">
                      Official Talent Evaluation Record
                    </span>
                    <h2 className="text-lg font-black text-slate-900 mt-0.5">
                      Internship Performance & Capability Report
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadPdf}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF Report</span>
                    </button>
                    {currentRole !== 'Intern' && !isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Score Matrix Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Tasks Completed</span>
                    <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                      {activeFeedback.completedTasks} / {activeFeedback.totalTasks}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Avg Review Score</span>
                    <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                      {activeFeedback.avgReviewScore} / 100
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">On-Time Rate</span>
                    <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                      {activeFeedback.onTimeCompletionRate}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-indigo-600">Final Score</span>
                    <div className="text-xl font-black text-indigo-700 mt-0.5">
                      {activeFeedback.finalScore} / 100
                    </div>
                  </div>
                </div>

                {/* Section 1: Executive Summary */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Executive Performance Summary
                  </h3>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={editedSummary}
                      onChange={(e) => setEditedSummary(e.target.value)}
                      className="w-full text-xs p-3 border border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50/20"
                    />
                  ) : (
                    <p className="text-xs leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                      {activeFeedback.summary}
                    </p>
                  )}
                </div>

                {/* Section 2: Core Strengths */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
                    Identified Strengths & Key Achievements (3)
                  </h3>
                  <div className="space-y-2">
                    {activeFeedback.strengths.map((str, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Areas for Improvement */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
                    Targeted Growth & Improvement Areas (2)
                  </h3>
                  <div className="space-y-2">
                    {activeFeedback.areasForImprovement.map((area, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Final Recommendation Category */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Talent Board Recommendation:</span>
                    {isEditing ? (
                      <select
                        aria-label="Recommendation Category"
                        value={editedRecommendation}
                        onChange={(e) => setEditedRecommendation(e.target.value as any)}
                        className="mt-1 block text-xs border border-indigo-300 rounded-lg p-1.5 bg-white font-bold text-indigo-700"
                      >
                        <option value="Highly Recommended">Highly Recommended</option>
                        <option value="Recommended">Recommended</option>
                        <option value="Conditional">Conditional</option>
                        <option value="Not Recommended">Not Recommended</option>
                      </select>
                    ) : (
                      <div className="text-sm font-extrabold text-indigo-700 mt-0.5">
                        {activeFeedback.finalRecommendation}
                      </div>
                    )}
                  </div>

                  {currentRole !== 'Intern' && (
                    <div className="flex items-center gap-2">
                      {isEditing && (
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={handleApproveFeedback}
                        disabled={isApproving}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{activeFeedback.mentorApprovalStatus === 'Approved' ? 'Update & Re-Approve' : 'Approve Feedback'}</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
                <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                <h3 className="font-extrabold text-slate-900 text-base">No Final Feedback Generated Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Click the <strong>Generate AI Final Feedback</strong> button to synthesize verified metrics into an official evaluation report using Gemini 3.8 Flash.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
