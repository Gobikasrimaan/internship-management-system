import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Layers,
  Download,
  CalendarDays
} from 'lucide-react';
import { Task, Intern, Certificate, UserRole, Mentor } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  interns: Intern[];
  certificates: Certificate[];
  mentors: Mentor[];
  currentRole: UserRole;
  activeInternId: string;
  onSelectTask: (taskId: string) => void;
  onOpenCreateTaskModal: () => void;
}

export type CalendarViewMode = 'month' | 'week' | 'day';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'deadline' | 'assigned' | 'submitted' | 'completed' | 'certificate' | 'internship_start' | 'internship_end';
  status?: Task['status'];
  internName?: string;
  department?: string;
  taskId?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  interns,
  certificates,
  mentors,
  currentRole,
  activeInternId,
  onSelectTask,
  onOpenCreateTaskModal
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 26)); // Oct 2026 default matching mock data
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Filters
  const [selectedIntern, setSelectedIntern] = useState<string>(currentRole === 'Intern' ? activeInternId : 'all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEventModal, setSelectedEventModal] = useState<CalendarEvent | null>(null);

  // Compile all calendar events
  const allEvents = useMemo(() => {
    const list: CalendarEvent[] = [];

    // Filter interns
    const filteredInterns = interns.filter(i => {
      if (selectedIntern !== 'all' && i.id !== selectedIntern) return false;
      if (selectedDept !== 'all' && i.department !== selectedDept) return false;
      return true;
    });

    const internIds = new Set(filteredInterns.map(i => i.id));

    // Tasks events
    tasks.filter(t => internIds.has(t.internId)).forEach(t => {
      if (selectedStatus !== 'all' && t.status !== selectedStatus) return;

      // Due date deadline event
      list.push({
        id: `ev-due-${t.id}`,
        title: `Due: ${t.title}`,
        date: t.dueDate,
        type: 'deadline',
        status: t.status,
        internName: t.internName,
        department: t.department,
        taskId: t.id
      });

      // If submitted
      if (t.submissionDate) {
        list.push({
          id: `ev-sub-${t.id}`,
          title: `Submitted: ${t.title}`,
          date: t.submissionDate,
          type: 'submitted',
          status: t.status,
          internName: t.internName,
          department: t.department,
          taskId: t.id
        });
      }

      // If completed
      if (t.completionDate) {
        list.push({
          id: `ev-comp-${t.id}`,
          title: `Completed: ${t.title}`,
          date: t.completionDate,
          type: 'completed',
          status: t.status,
          internName: t.internName,
          department: t.department,
          taskId: t.id
        });
      }
    });

    // Certificates events
    certificates.filter(c => internIds.has(c.internId)).forEach(c => {
      list.push({
        id: `ev-cert-${c.id}`,
        title: `Certificate Issued: ${c.internName}`,
        date: c.issueDate,
        type: 'certificate',
        internName: c.internName,
        department: c.department
      });
    });

    return list;
  }, [tasks, interns, certificates, selectedIntern, selectedDept, selectedStatus]);

  // Calendar matrix calculations for Month view
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonthDays = new Date(year, month, 0).getDate();

  // Export calendar .ics
  const handleExportIcs = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//InternFlow AI//Intern Calendar//EN\n";
    allEvents.slice(0, 50).forEach(ev => {
      const cleanDate = ev.date.replace(/-/g, '');
      icsContent += `BEGIN:VEVENT\nSUMMARY:${ev.title}\nDTSTART;VALUE=DATE:${cleanDate}\nDTEND;VALUE=DATE:${cleanDate}\nDESCRIPTION:${ev.internName || ''} - ${ev.department || ''}\nEND:VEVENT\n`;
    });
    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InternFlow_Calendar_${year}_${month + 1}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Internship Schedule & Milestones Calendar
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {allEvents.length} Events Logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track assignment dates, deadlines, submissions, approvals, and certificate ceremonies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          {/* View Mode switch */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'month' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'week' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'day' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}
            >
              Day
            </button>
          </div>

          <button
            onClick={handleExportIcs}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-300"
            title="Download .ics calendar file for Google Calendar or Outlook"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .ics</span>
          </button>

          {currentRole !== 'Intern' && (
            <button
              onClick={onOpenCreateTaskModal}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Task</span>
            </button>
          )}

        </div>
      </div>

      {/* Filter and Date Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Month Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-base font-extrabold text-slate-900">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={() => setCurrentDate(new Date(2026, 9, 26))}
            className="text-xs text-indigo-600 hover:underline font-semibold ml-2"
          >
            Current Term
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {currentRole !== 'Intern' && (
            <select
              aria-label="Filter Intern"
              value={selectedIntern}
              onChange={(e) => setSelectedIntern(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[170px] truncate"
            >
              <option value="all">All Interns ({interns.length})</option>
              {interns.slice(0, 30).map(i => (
                <option key={i.id} value={i.id}>{i.id}: {i.fullName}</option>
              ))}
            </select>
          )}

          <select
            aria-label="Filter Department"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Departments</option>
            {Array.from(new Set(interns.map(i => i.department))).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            aria-label="Filter Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Event Types</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Completed">Completed</option>
          </select>

        </div>

      </div>

      {/* Calendar Grid View (Month Mode) */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Day of Week headers */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2.5 text-xs font-bold text-slate-600">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {/* Blank cells for previous month */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => {
              const dayNum = prevMonthDays - firstDayIndex + idx + 1;
              return (
                <div key={`prev-${idx}`} className="min-h-[110px] p-1.5 bg-slate-50/40 text-slate-400 text-xs">
                  <span className="font-medium">{dayNum}</span>
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = allEvents.filter(e => e.date === dateStr);
              const isToday = dateStr === '2026-10-26';

              return (
                <div 
                  key={`day-${dayNum}`} 
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors hover:bg-slate-50/80 ${
                    isToday ? 'bg-indigo-50/30 ring-1 ring-inset ring-indigo-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-indigo-600 text-white' : 'text-slate-800'
                    }`}>
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {dayEvents.length} item{dayEvents.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="mt-1.5 space-y-1 overflow-y-auto max-h-[85px]">
                    {dayEvents.map(event => {
                      let badgeBg = 'bg-slate-100 text-slate-800 border-slate-200';
                      if (event.type === 'deadline') badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
                      if (event.type === 'submitted') badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
                      if (event.type === 'completed') badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      if (event.type === 'certificate') badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';

                      return (
                        <div
                          key={event.id}
                          onClick={() => {
                            if (event.taskId) onSelectTask(event.taskId);
                            setSelectedEventModal(event);
                          }}
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate cursor-pointer hover:shadow-xs transition-all ${badgeBg}`}
                          title={`${event.title} (${event.internName})`}
                        >
                          {event.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Week / Day mode simple list view */}
      {viewMode !== 'month' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-3">
            {viewMode === 'week' ? 'Weekly Milestone Breakdown' : 'Daily Agenda'}
          </h3>
          <div className="divide-y divide-slate-100">
            {allEvents.slice(0, 15).map(event => (
              <div 
                key={event.id} 
                className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer"
                onClick={() => event.taskId && onSelectTask(event.taskId)}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{event.title}</div>
                  <div className="text-[11px] text-slate-500">
                    Date: {event.date} • {event.internName} ({event.department})
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {event.type.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Details Quick Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base">{selectedEventModal.title}</h3>
            <div className="mt-3 space-y-2 text-xs text-slate-600">
              <p><strong>Scheduled Date:</strong> {selectedEventModal.date}</p>
              <p><strong>Intern:</strong> {selectedEventModal.internName || 'All Cohort'}</p>
              <p><strong>Department:</strong> {selectedEventModal.department || 'General'}</p>
              <p><strong>Category:</strong> {selectedEventModal.type.replace('_', ' ').toUpperCase()}</p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setSelectedEventModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
