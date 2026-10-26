import React from 'react';
import { X, CheckCircle2, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: any) => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  if (!isOpen) return null;

  const steps = [
    { num: 1, title: 'Register an Intern', desc: 'Use Add Intern or Bulk Import (Excel) to register candidates.', tab: 'interns' },
    { num: 2, title: 'Assign a Task', desc: 'Assign individual or batch milestones with criteria and deadlines.', tab: 'tasks' },
    { num: 3, title: 'Submit the Task', desc: 'Switch role to Intern, paste code/solution text, and submit deliverable.', tab: 'tasks' },
    { num: 4, title: 'Generate AI Review', desc: 'Click "Run AI Task Review" with Gemini 3.8 Flash for structured scoring.', tab: 'reviews' },
    { num: 5, title: 'Approve the Task', desc: 'Mentor approves or requests revisions and records official score.', tab: 'reviews' },
    { num: 6, title: 'Update the Calendar', desc: 'Deadlines, submissions, and completions appear on the interactive calendar.', tab: 'calendar' },
    { num: 7, title: 'Calculate Performance', desc: 'Verified 40% completion, 40% review, 20% on-time weighted formula.', tab: 'performance' },
    { num: 8, title: 'Generate Final Feedback', desc: 'Synthesize personalized capability assessment with Gemini 3.8 Flash.', tab: 'feedback' },
    { num: 9, title: 'Generate Certificate', desc: 'Verify eligibility standards and issue unique credential with official seal.', tab: 'certificates' },
    { num: 10, title: 'Preview the Email', desc: 'Review personalized message with attached Certificate and Feedback PDFs.', tab: 'emails' },
    { num: 11, title: 'Send a Test Email', desc: 'Dispatch simulated test email to gobikasrimaan1234@gmail.com.', tab: 'emails' },
    { num: 12, title: 'Update the Email Log', desc: 'Review Sheet 6 delivery history and download full Intern_Management.xlsx.', tab: 'emails' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h2 className="font-extrabold text-slate-900 text-base">
              Complete 12-Step Demonstration Lifecycle
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          InternFlow AI automates the complete 100-intern pipeline from registration to final certificate and email dispatch:
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {steps.map(step => (
            <div
              key={step.num}
              onClick={() => {
                onNavigate(step.tab);
                onClose();
              }}
              className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-start gap-2.5 group"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {step.num}
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>{step.title}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Click any step to jump directly to its interface</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
