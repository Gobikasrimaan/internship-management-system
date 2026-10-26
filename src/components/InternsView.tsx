import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Award,
  CheckCircle2,
  Phone,
  Mail,
  Building,
  GraduationCap,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Intern, Mentor, UserRole } from '../types';
import { downloadSampleExcelTemplate } from '../utils/sampleExcelTemplate';

interface InternsViewProps {
  interns: Intern[];
  mentors: Mentor[];
  currentRole: UserRole;
  onOpenAddModal: () => void;
  onOpenBulkImportModal: () => void;
  onSelectIntern: (id: string) => void;
  onEditIntern: (intern: Intern) => void;
  onDeleteIntern: (id: string) => void;
}

export const InternsView: React.FC<InternsViewProps> = ({
  interns,
  mentors,
  currentRole,
  onOpenAddModal,
  onOpenBulkImportModal,
  onSelectIntern,
  onEditIntern,
  onDeleteIntern
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState('all');

  const filteredInterns = useMemo(() => {
    return interns.filter(i => {
      const matchSearch = 
        i.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.collegeName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchDept = selectedDept === 'all' || i.department === selectedDept;
      const matchStatus = selectedStatus === 'all' || i.status === selectedStatus;
      const matchMentor = selectedMentor === 'all' || i.assignedMentorId === selectedMentor;

      return matchSearch && matchDept && matchStatus && matchMentor;
    });
  }, [interns, searchTerm, selectedDept, selectedStatus, selectedMentor]);

  const departments = useMemo(() => Array.from(new Set(interns.map(i => i.department))), [interns]);

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Intern Directory & Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {interns.length} Total Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage records, assign mentors, view verified performance milestones, and import 100 interns from Excel.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={downloadSampleExcelTemplate}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-300"
            title="Download sample Excel template for bulk import"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Sample Template</span>
          </button>

          <button
            onClick={onOpenBulkImportModal}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-emerald-300"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bulk Import (Excel)</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Register Intern</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, ID (e.g. INT001), email, or college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            aria-label="Department Filter"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Departments ({departments.length})</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            aria-label="Status Filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="On Leave">On Leave</option>
          </select>

          <select
            aria-label="Mentor Filter"
            value={selectedMentor}
            onChange={(e) => setSelectedMentor(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Mentors</option>
            {mentors.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

        </div>

      </div>

      {/* Interns Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3.5 px-4">Intern ID</th>
                <th className="py-3.5 px-4">Full Name & Contact</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">College / University</th>
                <th className="py-3.5 px-4">Assigned Mentor</th>
                <th className="py-3.5 px-4">Dates</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInterns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No interns found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search criteria or register a new intern.</p>
                  </td>
                </tr>
              ) : (
                filteredInterns.map(intern => {
                  let statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
                  if (intern.status === 'Completed') statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (intern.status === 'On Leave') statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';

                  return (
                    <tr key={intern.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {intern.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer" onClick={() => onSelectIntern(intern.id)}>
                          {intern.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" />{intern.email}</span>
                          <span className="flex items-center gap-1 hidden sm:inline-flex"><Phone className="w-3 h-3 text-slate-400" />{intern.phone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                          {intern.department}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{intern.collegeName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {intern.assignedMentorName}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <div>{intern.startDate}</div>
                        <div className="text-slate-400 text-[10px]">to {intern.endDate}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge}`}>
                          {intern.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectIntern(intern.id)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View Full Performance Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {currentRole !== 'Intern' && (
                            <>
                              <button
                                onClick={() => onEditIntern(intern)}
                                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                                title="Edit Intern Details"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete intern ${intern.fullName} (${intern.id})?`)) {
                                    onDeleteIntern(intern.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                title="Delete Intern"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Showing {filteredInterns.length} of {interns.length} registered interns</span>
          <span>Primary database source of truth synchronized</span>
        </div>
      </div>

    </div>
  );
};
