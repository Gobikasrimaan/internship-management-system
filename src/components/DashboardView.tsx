import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Mail,
  AlertCircle,
  FileSpreadsheet,
  TrendingUp,
  Filter,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Briefcase
} from 'lucide-react';
import { Intern, Task, Certificate, EmailLog, Mentor, UserRole } from '../types';

interface DashboardViewProps {
  interns: Intern[];
  tasks: Task[];
  certificates: Certificate[];
  emailLogs: EmailLog[];
  mentors: Mentor[];
  currentRole: UserRole;
  onNavigate: (tab: any) => void;
  onSelectIntern: (id: string) => void;
  onSelectTask: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  interns,
  tasks,
  certificates,
  emailLogs,
  mentors,
  currentRole,
  onNavigate,
  onSelectIntern,
  onSelectTask
}) => {
  // Filters state
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedMentor, setSelectedMentor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filtered interns
  const filteredInterns = useMemo(() => {
    return interns.filter(i => {
      if (selectedDept !== 'all' && i.department !== selectedDept) return false;
      if (selectedMentor !== 'all' && i.assignedMentorId !== selectedMentor) return false;
      if (selectedStatus !== 'all' && i.status !== selectedStatus) return false;
      return true;
    });
  }, [interns, selectedDept, selectedMentor, selectedStatus]);

  const internIdsSet = useMemo(() => new Set(filteredInterns.map(i => i.id)), [filteredInterns]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => internIdsSet.has(t.internId));
  }, [tasks, internIdsSet]);

  const today = new Date().toISOString().split('T')[0];

  // 11 Core Metrics calculations
  const totalInterns = filteredInterns.length;
  const activeInterns = filteredInterns.filter(i => i.status === 'Active').length;
  const completedInterns = filteredInterns.filter(i => i.status === 'Completed').length;
  
  const totalAssignedTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'Completed' || t.status === 'Approved').length;
  const pendingTasks = filteredTasks.filter(t => t.status === 'Assigned' || t.status === 'In Progress').length;
  const tasksAwaitingReview = filteredTasks.filter(t => t.status === 'Under Review' || t.status === 'Submitted').length;
  const overdueTasks = filteredTasks.filter(t => t.status !== 'Completed' && t.status !== 'Approved' && t.dueDate < today).length;

  // Filtered certificates
  const filteredCerts = useMemo(() => certificates.filter(c => internIdsSet.has(c.internId)), [certificates, internIdsSet]);
  const certificateEligible = filteredCerts.filter(c => c.isEligible).length;

  // Filtered emails
  const filteredEmails = useMemo(() => emailLogs.filter(e => internIdsSet.has(e.internId)), [emailLogs, internIdsSet]);
  const emailsSent = filteredEmails.filter(e => e.emailStatus === 'Sent').length;
  const emailsFailed = filteredEmails.filter(e => e.emailStatus === 'Failed').length;

  // Overall completion rate %
  const overallTaskCompRate = totalAssignedTasks > 0 ? Math.round((completedTasks / totalAssignedTasks) * 100) : 0;

  // Department counts
  const deptBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredInterns.forEach(i => {
      map[i.department] = (map[i.department] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredInterns]);

  // Task Status distribution
  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {
      'Assigned': 0,
      'In Progress': 0,
      'Submitted': 0,
      'Under Review': 0,
      'Changes Requested': 0,
      'Completed': 0
    };
    filteredTasks.forEach(t => {
      if (t.status === 'Approved') map['Completed'] = (map['Completed'] || 0) + 1;
      else if (map[t.status] !== undefined) map[t.status] = (map[t.status] || 0) + 1;
    });
    return map;
  }, [filteredTasks]);

  // Recent activity items
  const recentActivities = useMemo(() => {
    return filteredTasks
      .filter(t => t.submissionDate || t.completionDate)
      .slice(0, 7);
  }, [filteredTasks]);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                InternFlow Enterprise Hub
              </span>
              <span className="text-xs text-slate-400 font-mono">100 Cohort Milestone</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
              Internship Management Command Center
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Track 100 intern lifecycles, automate submission evaluations with Gemini 3.8 Flash, manage deadlines, issue verifiable completion certificates, and deliver email packages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('tasks')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4" />
              <span>Assign New Task</span>
            </button>
            <a
              href="/api/export/excel"
              download="Intern_Management.xlsx"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel</span>
            </a>
          </div>
        </div>

        {/* Live Filter Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Dashboard Filters:</span>
          </div>

          <select
            aria-label="Department Filter"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-800/90 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
          >
            <option value="all">All Departments ({interns.length})</option>
            {Array.from(new Set(interns.map(i => i.department))).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            aria-label="Mentor Filter"
            value={selectedMentor}
            onChange={(e) => setSelectedMentor(e.target.value)}
            className="text-xs bg-slate-800/90 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
          >
            <option value="all">All Mentors ({mentors.length})</option>
            {mentors.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.department})</option>
            ))}
          </select>

          <select
            aria-label="Status Filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-800/90 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Completed">Completed Only</option>
            <option value="On Leave">On Leave</option>
          </select>

          {(selectedDept !== 'all' || selectedMentor !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSelectedDept('all');
                setSelectedMentor('all');
                setSelectedStatus('all');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 11 Summary Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Key Performance Indicators (11 Core Metrics)</h2>
          <span className="text-xs text-slate-500">Updated in real-time</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          
          {/* 1. Total Interns */}
          <div 
            onClick={() => onNavigate('interns')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Total Interns</span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{totalInterns}</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Full cohort size</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* 2. Active Interns */}
          <div 
            onClick={() => onNavigate('interns')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Active Interns</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-blue-700">{activeInterns}</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>In-progress terms</span>
              <span className="text-blue-600 font-semibold">{totalInterns > 0 ? Math.round((activeInterns/totalInterns)*100) : 0}%</span>
            </div>
          </div>

          {/* 3. Completed Internships */}
          <div 
            onClick={() => onNavigate('certificates')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Completed</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-700">{completedInterns}</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Graduated terms</span>
              <span className="text-emerald-600 font-semibold">{totalInterns > 0 ? Math.round((completedInterns/totalInterns)*100) : 0}%</span>
            </div>
          </div>

          {/* 4. Total Assigned Tasks */}
          <div 
            onClick={() => onNavigate('tasks')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Total Tasks</span>
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{totalAssignedTasks}</div>
            <div className="text-[11px] text-slate-500 mt-1">Across all cohorts</div>
          </div>

          {/* 5. Completed Tasks */}
          <div 
            onClick={() => onNavigate('tasks')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Tasks Completed</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-700">{completedTasks}</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Rate: {overallTaskCompRate}%</span>
              <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${overallTaskCompRate}%` }}></div>
              </div>
            </div>
          </div>

          {/* 6. Pending Tasks */}
          <div 
            onClick={() => onNavigate('tasks')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Pending Tasks</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-600">{pendingTasks}</div>
            <div className="text-[11px] text-slate-500 mt-1">In progress or assigned</div>
          </div>

          {/* 7. Tasks Awaiting Review */}
          <div 
            onClick={() => onNavigate('reviews')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Awaiting Review</span>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-purple-700">{tasksAwaitingReview}</div>
            <div className="text-[11px] text-purple-600 font-semibold mt-1">Ready for AI Review</div>
          </div>

          {/* 8. Overdue Tasks */}
          <div 
            onClick={() => onNavigate('tasks')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Overdue Tasks</span>
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-rose-600">{overdueTasks}</div>
            <div className="text-[11px] text-rose-600 font-semibold mt-1">Requires follow-up</div>
          </div>

          {/* 9. Certificate Eligible */}
          <div 
            onClick={() => onNavigate('certificates')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Eligible Certificates</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-700">{certificateEligible}</div>
            <div className="text-[11px] text-slate-500 mt-1">Verified criteria met</div>
          </div>

          {/* 10. Emails Sent */}
          <div 
            onClick={() => onNavigate('emails')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Emails Sent</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-blue-700">{emailsSent}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Deliveries logged</div>
          </div>

          {/* 11. Failed Emails */}
          <div 
            onClick={() => onNavigate('emails')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Failed Emails</span>
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-rose-600">{emailsFailed}</div>
            <div className="text-[11px] text-slate-500 mt-1">{emailsFailed > 0 ? 'Retry available' : 'Zero failures'}</div>
          </div>

          {/* 12. Quick Action / Chatbot */}
          <div 
            onClick={() => onNavigate('chat')}
            className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-4 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-100">AI HR Chatbot</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-lg font-bold">Ask InternFlow</div>
            <div className="text-[11px] text-indigo-100 flex items-center justify-between">
              <span>Query live DB</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </div>

      {/* Charts & Analytics Visual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Distribution Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Department Distribution</h3>
              <p className="text-xs text-slate-500">100 Intern allocation across business units</p>
            </div>
            <Users className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {deptBreakdown.map(([dept, count]) => {
              const pct = totalInterns > 0 ? Math.round((count / totalInterns) * 100) : 0;
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-[190px]">{dept}</span>
                    <span className="text-slate-500 font-semibold">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Task Status Distribution</h3>
              <p className="text-xs text-slate-500">Active pipeline lifecycle status</p>
            </div>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2.5">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = totalAssignedTasks > 0 ? Math.round((count / totalAssignedTasks) * 100) : 0;
              let colorClass = 'bg-slate-500';
              if (status === 'Completed') colorClass = 'bg-emerald-500';
              if (status === 'Under Review') colorClass = 'bg-purple-500';
              if (status === 'Submitted') colorClass = 'bg-blue-500';
              if (status === 'Changes Requested') colorClass = 'bg-amber-500';

              return (
                <div key={status} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`}></span>
                    <span className="font-medium text-slate-800">{status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{count}</span>
                    <span className="text-slate-400 text-[10px]">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Internship Completion Stats & Quick Verification */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Program Completion Metrics</h3>
                <p className="text-xs text-slate-500">Cohort milestone progress</p>
              </div>
              <Award className="w-4 h-4 text-amber-500" />
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 via-white to-indigo-50 border border-amber-200/60 mb-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Overall Milestone Completion</span>
              <div className="text-3xl font-black text-slate-900 mt-1">{overallTaskCompRate}%</div>
              <p className="text-xs text-slate-600 mt-1">
                {completedTasks} tasks approved out of {totalAssignedTasks} assigned
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Certificate Eligible:</span>
                <span className="font-bold text-emerald-700">{certificateEligible} Interns</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Email Delivery Rate:</span>
                <span className="font-bold text-blue-700">
                  {emailsSent + emailsFailed > 0 ? `${Math.round((emailsSent / (emailsSent + emailsFailed)) * 100)}%` : '100%'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Overdue Task Ratio:</span>
                <span className={`font-bold ${overdueTasks > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                  {totalAssignedTasks > 0 ? `${Math.round((overdueTasks / totalAssignedTasks) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('certificates')}
            className="w-full mt-4 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Manage Certificates & Issuance</span>
          </button>
        </div>

      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Task Submissions & Activity</h3>
            <p className="text-xs text-slate-500">Latest milestone events recorded across the cohort</p>
          </div>
          <button
            onClick={() => onNavigate('tasks')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View All Tasks &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Task ID</th>
                <th className="py-3 px-4">Intern</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Task Title</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentActivities.map(task => {
                let badgeColor = 'bg-slate-100 text-slate-700';
                if (task.status === 'Completed') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (task.status === 'Under Review') badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
                if (task.status === 'Submitted') badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                if (task.status === 'Changes Requested') badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';

                return (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{task.id}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectIntern(task.internId)}
                        className="font-bold text-indigo-600 hover:underline text-left"
                      >
                        {task.internName}
                      </button>
                      <div className="text-[10px] text-slate-400">{task.internId}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{task.department}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 max-w-xs truncate">{task.title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColor}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {task.reviewScore !== undefined ? `${task.reviewScore}/100` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          onSelectTask(task.id);
                          onNavigate('reviews');
                        }}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        Inspect
                      </button>
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
