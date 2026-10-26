import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { Task } from '../../types';
import { api } from '../../utils/api';

interface SubmitTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onSubmitted: (updatedTask: Task) => void;
}

export const SubmitTaskModal: React.FC<SubmitTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onSubmitted
}) => {
  const [description, setDescription] = useState(task.submissionDescription || '');
  const [solutionText, setSolutionText] = useState(task.submissionSolutionText || '');
  const [attachmentName, setAttachmentName] = useState(task.submissionAttachmentName || 'deliverable-solution.zip');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !solutionText.trim()) {
      setErrorMsg('Please provide a brief description and your technical solution details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await api.submitTask(task.id, {
        submissionDescription: description,
        submissionSolutionText: solutionText,
        submissionAttachmentName: attachmentName
      });
      onSubmitted(updated);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit solution');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" />
            <h2 className="font-extrabold text-slate-900 text-base">
              Submit Task Deliverable: {task.id}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <p className="font-bold text-slate-900">{task.title}</p>
          <p className="text-slate-600 mt-0.5">{task.description}</p>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Task Completion Description / Overview *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Implemented REST endpoints, verified unit tests with 92% coverage."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Text-based Solution / Code Snippet / Architectural Findings *
            </label>
            <textarea
              rows={6}
              required
              value={solutionText}
              onChange={(e) => setSolutionText(e.target.value)}
              placeholder="Paste code, PR link, verification logs, or architectural decisions here..."
              className="w-full font-mono bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-3 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Attachment Reference (Optional):
            </label>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <input
                type="text"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder="project-bundle.zip"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span>AI Task Review Integration</span>
            </p>
            <p className="text-[11px] text-purple-700 mt-0.5">
              Upon submission, your department mentor will review your solution with AI-assisted verification using Gemini 3.8 Flash.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-md"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
