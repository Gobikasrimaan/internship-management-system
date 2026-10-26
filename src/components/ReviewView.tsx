import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Check,
  Send,
  Loader2,
  MessageSquare,
  Award,
  Layers,
  Calendar
} from 'lucide-react';
import { Task, Intern, AIReviewResult, UserRole } from '../types';
import { api } from '../utils/api';

interface ReviewViewProps {
  tasks: Task[];
  interns: Intern[];
  currentRole: UserRole;
  activeInternId: string;
  selectedTaskId?: string;
  onTaskUpdated: (updatedTask: Task) => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  tasks,
  interns,
  currentRole,
  activeInternId,
  selectedTaskId,
  onTaskUpdated
}) => {
  // Find current active task to review
  const [currentTaskId, setCurrentTaskId] = useState<string>(
    selectedTaskId || (tasks.find(t => t.status === 'Under Review' || t.status === 'Submitted')?.id || tasks[0]?.id || '')
  );

  const [isRunningAI, setIsRunningAI] = useState<boolean>(false);
  const [currentAIReview, setCurrentAIReview] = useState<AIReviewResult | null>(null);

  // Mentor decision inputs
  const [mentorScore, setMentorScore] = useState<number>(85);
  const [mentorComments, setMentorComments] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const currentTask = useMemo(() => {
    return tasks.find(t => t.id === currentTaskId) || tasks[0];
  }, [tasks, currentTaskId]);

  const intern = useMemo(() => {
    if (!currentTask) return null;
    return interns.find(i => i.id === currentTask.internId) || null;
  }, [currentTask, interns]);

  // Update defaults when currentTask changes
  React.useEffect(() => {
    if (currentTask) {
      setMentorScore(currentTask.reviewScore ?? 85);
      setMentorComments(currentTask.mentorComments || '');
      setSuccessMessage('');
      setCurrentAIReview(null);
    }
  }, [currentTask]);

  // Handle Run AI Review
  const handleRunAIReview = async () => {
    if (!currentTask) return;
    setIsRunningAI(true);
    setSuccessMessage('');
    try {
      const review = await api.runAITaskReview(currentTask.id);
      setCurrentAIReview(review);
      setMentorScore(review.recommendedScore);
      setMentorComments(`[AI Evaluated]: ${review.constructiveFeedback}`);
      setSuccessMessage('AI Task Review completed successfully via Gemini 3.8 Flash!');
    } catch (err: any) {
      alert(err.message || 'Failed to run AI review');
    } finally {
      setIsRunningAI(false);
    }
  };

  // Handle Mentor Decision
  const handleMentorDecision = async (action: 'Approve' | 'Request Changes' | 'Reject') => {
    if (!currentTask) return;
    setIsSubmittingReview(true);
    try {
      const updated = await api.mentorReviewTask(currentTask.id, {
        action,
        reviewScore: mentorScore,
        mentorComments
      });
      onTaskUpdated(updated);
      setSuccessMessage(`Milestone review saved: Marked as ${updated.status} with score ${updated.reviewScore}/100.`);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Reviewable tasks queue
  const reviewQueue = useMemo(() => {
    let list = tasks;
    if (currentRole === 'Intern') {
      list = list.filter(t => t.internId === activeInternId);
    }
    return list;
  }, [tasks, currentRole, activeInternId]);

  if (!currentTask) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
        <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-slate-800">No tasks currently queued for review</h3>
        <p className="text-xs text-slate-500 mt-1">Assign tasks or submit solutions to begin AI-assisted evaluation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              AI-Assisted Task Review & Mentor Decision
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Powered by Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated structured requirement verification, score recommendation, and mentor review authority.
          </p>
        </div>

        {/* Task Selection Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Reviewing:</span>
          <select
            aria-label="Select Task to Review"
            value={currentTaskId}
            onChange={(e) => setCurrentTaskId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-xs truncate"
          >
            {reviewQueue.map(t => (
              <option key={t.id} value={t.id}>
                {t.id}: {t.title} [{t.status}] - {t.internName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Review Grid: Left Submission Details, Right AI Agent & Mentor Scoring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Task & Intern Submission (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Milestone Details Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                {currentTask.id}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-700">
                Status: {currentTask.status}
              </span>
            </div>

            <h2 className="text-base font-bold text-slate-900">{currentTask.title}</h2>
            <p className="text-xs text-slate-600 mt-1">{currentTask.description}</p>

            {/* Intern Profile Snippet */}
            {intern && (
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{intern.fullName}</p>
                    <p className="text-[11px] text-slate-500">{intern.id} • {intern.collegeName}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium text-[10px]">
                    {intern.department}
                  </span>
                </div>
              </div>
            )}

            {/* Stated Requirements */}
            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Stated Requirements ({currentTask.requirements.length})
              </h3>
              <div className="mt-2 space-y-1.5">
                {currentTask.requirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Intern Submission Deliverable Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Intern Deliverable Submission</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {currentTask.submissionDate || 'Not submitted yet'}
              </span>
            </div>

            {currentTask.submissionSolutionText || currentTask.submissionDescription ? (
              <div className="space-y-3">
                {currentTask.submissionDescription && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Submission Note:</span>
                    <p className="text-xs text-slate-700 mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      {currentTask.submissionDescription}
                    </p>
                  </div>
                )}

                {currentTask.submissionSolutionText && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Code / Solution Text:</span>
                    <pre className="text-xs font-mono text-slate-800 bg-slate-900 text-slate-200 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap mt-0.5 max-h-56">
                      {currentTask.submissionSolutionText}
                    </pre>
                  </div>
                )}

                {currentTask.submissionAttachmentName && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50/50 border border-indigo-200/60 text-xs text-indigo-900">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium truncate">{currentTask.submissionAttachmentName}</span>
                    <span className="text-[10px] text-indigo-600 font-bold ml-auto">Simulated Deliverable</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 border-dashed text-slate-500 text-xs">
                <AlertCircle className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p>No solution submitted by intern yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Switch role to Intern to submit a completed solution.</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: AI Task Review Agent & Mentor Decision (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* AI Review Agent Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">AI Task Review Agent</h3>
                  <p className="text-[11px] text-slate-300">Automated verification against task criteria with Gemini</p>
                </div>
              </div>

              {currentRole !== 'Intern' && (
                <button
                  onClick={handleRunAIReview}
                  disabled={isRunningAI}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
                >
                  {isRunningAI ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing Deliverable...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Run AI Task Review</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* AI Results breakdown */}
            {currentAIReview ? (
              <div className="space-y-4 bg-slate-900/80 p-4 rounded-xl border border-slate-700/80 text-xs">
                
                {/* Recommended Score and Status Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-indigo-950/70 border border-indigo-500/30">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-300">Recommended Score:</span>
                    <div className="text-2xl font-black text-amber-300">{currentAIReview.recommendedScore}/100</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-indigo-300">Suggested Action:</span>
                    <div className="text-sm font-bold text-emerald-400">{currentAIReview.recommendedStatus}</div>
                  </div>
                </div>

                {/* Completed Requirements */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Verified Completed Requirements ({currentAIReview.completedRequirements.length})
                  </span>
                  <div className="mt-1 space-y-1">
                    {currentAIReview.completedRequirements.map((cr, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-slate-200">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{cr}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Requirements */}
                {currentAIReview.missingRequirements.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Identified Gaps / Missing Items ({currentAIReview.missingRequirements.length})
                    </span>
                    <div className="mt-1 space-y-1">
                      {currentAIReview.missingRequirements.map((mr, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-amber-200">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{mr}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths & Improvement */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-400">Key Strengths:</span>
                    <ul className="mt-1 space-y-0.5 text-slate-300 list-disc list-inside">
                      {currentAIReview.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-sky-400">Improvement Targets:</span>
                    <ul className="mt-1 space-y-0.5 text-slate-300 list-disc list-inside">
                      {currentAIReview.areasForImprovement.map((a, idx) => (
                        <li key={idx}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Constructive Feedback Paragraph */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Constructive Feedback:</span>
                  <p className="text-slate-200 italic mt-0.5">"{currentAIReview.constructiveFeedback}"</p>
                </div>

              </div>
            ) : (
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs">
                <Sparkles className="w-6 h-6 text-indigo-400 mx-auto mb-1.5" />
                <p className="font-semibold text-slate-200">AI Review has not been triggered for this task yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click <strong className="text-indigo-300">Run AI Task Review</strong> above to get automated requirement verification and score recommendations.
                </p>
              </div>
            )}
          </div>

          {/* Mentor Decision & Scoring Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Official Mentor Evaluation & Approval</h3>
                <p className="text-xs text-slate-500">Human mentor retains final authority. AI does not independently approve.</p>
              </div>
              <Award className="w-5 h-5 text-indigo-600" />
            </div>

            {/* Score Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-bold text-slate-800">Performance Score (0 - 100):</label>
                <span className="text-base font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                  {mentorScore} / 100
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={mentorScore}
                disabled={currentRole === 'Intern'}
                onChange={(e) => setMentorScore(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0 (Unsatisfactory)</span>
                <span>70 (Passing Threshold)</span>
                <span>100 (Exemplary)</span>
              </div>
            </div>

            {/* Mentor Comments Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Official Mentor Feedback & Comments:
              </label>
              <textarea
                rows={3}
                disabled={currentRole === 'Intern'}
                value={mentorComments}
                onChange={(e) => setMentorComments(e.target.value)}
                placeholder="Enter detailed feedback, code review notes, or guidance for the intern..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Mentor Approval Actions */}
            {currentRole !== 'Intern' ? (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                
                <button
                  onClick={() => handleMentorDecision('Approve')}
                  disabled={isSubmittingReview}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Complete Milestone</span>
                </button>

                <button
                  onClick={() => handleMentorDecision('Request Changes')}
                  disabled={isSubmittingReview}
                  className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Request Changes</span>
                </button>

                <button
                  onClick={() => handleMentorDecision('Reject')}
                  disabled={isSubmittingReview}
                  className="py-2.5 px-3 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Reject
                </button>

              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Current Status:</span> {currentTask.status}.
                {currentTask.completionDate && (
                  <span className="ml-2 text-emerald-700 font-bold">Completed on {currentTask.completionDate}</span>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
