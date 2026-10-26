import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Eye,
  FileText,
  UploadCloud,
  Sparkles
} from 'lucide-react';
import { Task, Intern, Mentor, UserRole } from '../types';

interface TasksViewProps {
  tasks: Task[];
  interns: Intern[];
  mentors: Mentor[];
  currentRole: UserRole;
  activeInternId: string;
  onOpenCreateTaskModal: () => void;
  onSelectTask: (id: string) => void;
  onOpenSubmitModal: (task: Task) => void;
  onNavigateToReviews: (taskId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  interns,
  mentors,
  currentRole,
  activeInternId,
  onOpenCreateTaskModal,
  onSelectTask,
  onOpenSubmitModal,
  onNavigateToReviews
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [showOverdueOnly, setShowOverdueOnly] = useState<boolean>(false);

  const today = new Date().toISOString().split('T')[0];

  const visibleTasks = useMemo(() => {
    let list = tasks;
    if (currentRole === 'Intern') {
      list = list.filter(t => t.internId === activeInternId);
    }

    return list.filter(t => {
      const matchSearch = 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.internName && t.internName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = selectedStatus === 'all' || t.status === selectedStatus;
      const matchPriority = selectedPriority === 'all' || t.priority === selectedPriority;
      const matchDept = selectedDept === 'all' || t.department === selectedDept;

      const isOverdue = t.status !== 'Completed' && t.status !== 'Approved' && t.dueDate < today;
      const matchOverdue = showOverdueOnly ? isOverdue : true;

      return matchSearch && matchStatus && matchPriority && matchDept && matchOverdue;
    });
  }, [tasks, currentRole, activeInternId, searchTerm, selectedStatus, selectedPriority, selectedDept, showOverdueOnly, today]);

  const overdueCount = useMemo(() => {
    const list = currentRole === 'Intern' ? tasks.filter(t => t.internId === activeInternId) : tasks;
    return list.filter(t => t.status !== 'Completed' && t.status !== 'Approved' && t.dueDate < today).length;
  }, [tasks, currentRole, activeInternId, today]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {currentRole === 'Intern' ? 'My Assigned Milestones & Tasks' : 'Task Assignment & Deadline Management'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {visibleTasks.length} Visible
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {currentRole === 'Intern' 
              ? 'View deliverables, track due dates, submit your completed solutions, and view AI feedback.'
              : 'Assign individual or batch milestones to cohorts/departments, monitor SLAs, and detect overdue items.'}
          </p>
        </div>

        {currentRole !== 'Intern' && (
          <button
            onClick={onOpenCreateTaskModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Task</span>
          </button>
        )}
      </div>

      {/* Filter and Overdue Alert Banner */}
      {overdueCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-900">
                {overdueCount} task{overdueCount > 1 ? 's' : ''} have surpassed their scheduled completion deadline!
              </p>
              <p className="text-[11px] text-rose-700">Immediate mentor follow-up required to ensure cohort pace.</p>
            </div>
          </div>
          <button
            onClick={() => setShowOverdueOnly(!showOverdueOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              showOverdueOnly ? 'bg-rose-600 text-white' : 'bg-rose-200 text-rose-800 hover:bg-rose-300'
            }`}
          >
            {showOverdueOnly ? 'Show All Tasks' : 'Filter Overdue Only'}
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title, task ID (e.g. TSK-0001), or intern name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          <select
            aria-label="Status Filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Changes Requested">Changes Requested</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            aria-label="Priority Filter"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {currentRole !== 'Intern' && (
            <select
              aria-label="Department Filter"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Departments</option>
              {Array.from(new Set(tasks.map(t => t.department || 'General'))).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}

        </div>
      </div>

      {/* Task List Cards / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleTasks.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">No tasks match your filter</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the search or assign a new milestone.</p>
          </div>
        ) : (
          visibleTasks.map(task => {
            const isOverdue = task.status !== 'Completed' && task.status !== 'Approved' && task.dueDate < today;

            let priorityColor = 'bg-slate-100 text-slate-700';
            if (task.priority === 'Urgent') priorityColor = 'bg-rose-100 text-rose-800 border-rose-300';
            if (task.priority === 'High') priorityColor = 'bg-orange-100 text-orange-800 border-orange-300';
            if (task.priority === 'Medium') priorityColor = 'bg-blue-100 text-blue-800 border-blue-300';

            let statusColor = 'bg-slate-100 text-slate-700';
            if (task.status === 'Completed' || task.status === 'Approved') statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            if (task.status === 'Under Review') statusColor = 'bg-purple-50 text-purple-700 border-purple-200';
            if (task.status === 'Submitted') statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
            if (task.status === 'Changes Requested') statusColor = 'bg-amber-50 text-amber-800 border-amber-200';

            return (
              <div 
                key={task.id} 
                className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                  isOverdue ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                }`}
              >
                <div>
                  
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {task.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColor}`}>
                        {task.priority}
                      </span>
                      {task.isMandatory && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          Mandatory
                        </span>
                      )}
                    </div>
                    
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusColor}`}>
                      {task.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 mt-1">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {task.description}
                  </p>

                  {/* Requirements Checklist Preview */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Requirements ({task.requirements.length})
                    </span>
                    <ul className="mt-1 space-y-1">
                      {task.requirements.slice(0, 2).map((r, i) => (
                        <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                          <span className="text-indigo-500 font-bold">•</span>
                          <span className="truncate">{r}</span>
                        </li>
                      ))}
                      {task.requirements.length > 2 && (
                        <li className="text-[10px] text-indigo-600 font-medium pl-3">
                          +{task.requirements.length - 2} more criteria
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Intern & Mentor Info */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div>
                      <span className="text-slate-400">Assigned:</span> <span className="font-semibold text-slate-800">{task.internName || task.internId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Dept:</span> <span className="font-medium text-slate-700">{task.department}</span>
                    </div>
                  </div>

                  {/* Due Date & Overdue Tag */}
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Due: <strong className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}>{task.dueDate}</strong></span>
                    </div>
                    {isOverdue && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        OVERDUE
                      </span>
                    )}
                  </div>

                  {/* If scored */}
                  {task.reviewScore !== undefined && (
                    <div className="mt-3 p-2 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
                      <span className="font-semibold">Mentor Review Score:</span>
                      <span className="font-extrabold text-sm">{task.reviewScore}/100</span>
                    </div>
                  )}

                </div>

                {/* Card Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  
                  {/* Intern Submit button */}
                  {currentRole === 'Intern' && task.status !== 'Completed' && task.status !== 'Approved' && (
                    <button
                      onClick={() => onOpenSubmitModal(task)}
                      className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{task.status === 'Submitted' ? 'Update Submission' : 'Submit Solution'}</span>
                    </button>
                  )}

                  {/* Mentor / Admin Review button */}
                  {currentRole !== 'Intern' && (
                    <>
                      <button
                        onClick={() => onNavigateToReviews(task.id)}
                        className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>AI Review & Score</span>
                      </button>
                      <button
                        onClick={() => onSelectTask(task.id)}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                        title="View Task Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Intern view details */}
                  {currentRole === 'Intern' && (task.status === 'Completed' || task.status === 'Approved') && (
                    <button
                      onClick={() => onNavigateToReviews(task.id)}
                      className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>View Approved Evaluation</span>
                    </button>
                  )}

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
