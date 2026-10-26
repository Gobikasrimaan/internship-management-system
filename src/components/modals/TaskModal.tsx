import React, { useState } from 'react';
import { X, CheckSquare, Plus, Trash2, Users, Building, Calendar, AlertCircle } from 'lucide-react';
import { Intern, Mentor, Task } from '../../types';
import { api } from '../../utils/api';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  interns: Intern[];
  mentors: Mentor[];
  onTaskCreated: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  interns,
  mentors,
  onTaskCreated
}) => {
  const [assignmentMode, setAssignmentMode] = useState<'individual' | 'department' | 'selected'>('individual');
  const [selectedInternId, setSelectedInternId] = useState<string>(interns[0]?.id || '');
  const [selectedDept, setSelectedDept] = useState<string>('Artificial Intelligence & ML');
  const [selectedInternIds, setSelectedInternIds] = useState<string[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>([
    'Complete core deliverable implementation',
    'Verify against unit test suite',
    'Document steps in repository README'
  ]);
  const [newReq, setNewReq] = useState('');

  const [assignedDate, setAssignedDate] = useState('2026-10-26');
  const [dueDate, setDueDate] = useState('2026-11-15');
  const [priority, setPriority] = useState<Task['priority']>('High');
  const [isMandatory, setIsMandatory] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddRequirement = () => {
    if (!newReq.trim()) return;
    setRequirements([...requirements, newReq.trim()]);
    setNewReq('');
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !description.trim() || requirements.length === 0) {
      setErrorMsg('Please enter a title, description, and at least 1 requirement.');
      return;
    }

    let targetInternIds: string[] = [];

    if (assignmentMode === 'individual') {
      targetInternIds = [selectedInternId];
    } else if (assignmentMode === 'department') {
      targetInternIds = interns.filter(i => i.department === selectedDept).map(i => i.id);
    } else {
      targetInternIds = selectedInternIds;
    }

    if (targetInternIds.length === 0) {
      setErrorMsg('No interns selected for this assignment.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.bulkAssignTask({
        internIds: targetInternIds,
        title,
        description,
        requirements,
        assignedDate,
        dueDate,
        priority,
        isMandatory
      });
      onTaskCreated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to assign tasks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const departments = Array.from(new Set(interns.map(i => i.department)));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="font-extrabold text-slate-900 text-base">Assign New Milestone / Task</h2>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          
          {/* Target Scope Pill */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Target Scope:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAssignmentMode('individual')}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                  assignmentMode === 'individual'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Individual Intern
              </button>
              <button
                type="button"
                onClick={() => setAssignmentMode('department')}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                  assignmentMode === 'department'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Entire Department
              </button>
              <button
                type="button"
                onClick={() => setAssignmentMode('selected')}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                  assignmentMode === 'selected'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Select Cohort
              </button>
            </div>
          </div>

          {/* Scope Dropdown */}
          {assignmentMode === 'individual' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Intern:</label>
              <select
                value={selectedInternId}
                onChange={(e) => setSelectedInternId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
              >
                {interns.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.id}: {i.fullName} ({i.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          {assignmentMode === 'department' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Department (All Interns):</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
              >
                {departments.map(d => (
                  <option key={d} value={d}>
                    {d} ({interns.filter(i => i.department === d).length} Interns)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Task Details */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Database Query Optimization & Profiling"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Task Description *</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the milestone deliverables, goals, and technical context..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
            />
          </div>

          {/* Requirements Builder */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Verifiable Requirements (Analyzed by AI Task Review Agent):
            </label>
            <div className="space-y-1.5 mb-2">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-800">{idx + 1}. {req}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newReq}
                onChange={(e) => setNewReq(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
                placeholder="Add specific criterion (e.g. Test coverage > 85%)..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddRequirement}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Dates & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Assigned Date</label>
              <input
                type="date"
                value={assignedDate}
                onChange={(e) => setAssignedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Due Deadline</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Mandatory Checkbox */}
          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/60 cursor-pointer">
            <input
              type="checkbox"
              checked={isMandatory}
              onChange={(e) => setIsMandatory(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
            <span className="font-bold text-amber-900">
              Mandatory Milestone (Required for Certificate Eligibility)
            </span>
          </label>

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
              {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
