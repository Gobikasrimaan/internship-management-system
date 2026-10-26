import React, { useState } from 'react';
import { X, User, Mail, Phone, Building, GraduationCap, Calendar, UserCheck } from 'lucide-react';
import { Intern, Mentor } from '../../types';

interface InternModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (internData: any) => Promise<void>;
  mentors: Mentor[];
  initialData?: Intern;
}

export const InternModal: React.FC<InternModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mentors,
  initialData
}) => {
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [department, setDepartment] = useState(initialData?.department || 'Artificial Intelligence & ML');
  const [collegeName, setCollegeName] = useState(initialData?.collegeName || '');
  const [startDate, setStartDate] = useState(initialData?.startDate || '2026-06-01');
  const [endDate, setEndDate] = useState(initialData?.endDate || '2026-09-30');
  const [assignedMentorId, setAssignedMentorId] = useState(initialData?.assignedMentorId || mentors[0]?.id || '');
  const [status, setStatus] = useState<Intern['status']>(initialData?.status || 'Active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !collegeName.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const mentor = mentors.find(m => m.id === assignedMentorId);

    setIsSubmitting(true);
    try {
      await onSave({
        fullName,
        email,
        phone,
        department,
        collegeName,
        startDate,
        endDate,
        assignedMentorId,
        assignedMentorName: mentor ? mentor.name : 'Dr. Evelyn Vance',
        status
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save intern');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="font-extrabold text-slate-900 text-base">
              {initialData ? `Edit Intern: ${initialData.id}` : 'Register Individual Intern'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Maya Lin"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maya.lin@university.edu"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Department *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                <option value="Full-Stack Engineering">Full-Stack Engineering</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="Data Science & Analytics">Data Science & Analytics</option>
                <option value="UI/UX Design">UI/UX Design</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">College / University *</label>
              <input
                type="text"
                required
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="MIT / Stanford / UC Berkeley"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Internship Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Internship End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Assigned Mentor</label>
              <select
                value={assignedMentorId}
                onChange={(e) => setAssignedMentorId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
              >
                {mentors.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.department})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Cohort Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
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
              {isSubmitting ? 'Saving...' : initialData ? 'Update Record' : 'Register Intern'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
