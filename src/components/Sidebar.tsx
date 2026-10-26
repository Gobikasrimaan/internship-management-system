import React from 'react';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Sparkles,
  Calendar,
  BarChart3,
  Award,
  Mail,
  Bot,
  Settings,
  FileSpreadsheet,
  FileCheck2
} from 'lucide-react';
import { UserRole } from '../types';

export type NavTab = 
  | 'dashboard'
  | 'interns'
  | 'tasks'
  | 'reviews'
  | 'calendar'
  | 'performance'
  | 'feedback'
  | 'certificates'
  | 'emails'
  | 'chat'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentRole: UserRole;
  counts: {
    totalInterns: number;
    pendingReviews: number;
    eligibleCerts: number;
    pendingEmails: number;
    overdueTasks: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  currentRole,
  counts
}) => {
  // Navigation items config
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Mentor', 'Intern']
    },
    {
      id: 'interns' as NavTab,
      label: 'Intern Management',
      icon: Users,
      badge: currentRole !== 'Intern' ? counts.totalInterns : undefined,
      badgeColor: 'bg-indigo-100 text-indigo-700',
      roles: ['Admin', 'Mentor']
    },
    {
      id: 'tasks' as NavTab,
      label: currentRole === 'Intern' ? 'My Assigned Tasks' : 'Task Assignment',
      icon: CheckSquare,
      badge: counts.overdueTasks > 0 ? `${counts.overdueTasks} Overdue` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700',
      roles: ['Admin', 'Mentor', 'Intern']
    },
    {
      id: 'reviews' as NavTab,
      label: currentRole === 'Intern' ? 'Submission & AI Review' : 'Task Review & AI',
      icon: Sparkles,
      badge: counts.pendingReviews > 0 && currentRole !== 'Intern' ? counts.pendingReviews : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
      roles: ['Admin', 'Mentor', 'Intern']
    },
    {
      id: 'calendar' as NavTab,
      label: currentRole === 'Intern' ? 'My Calendar' : 'Internship Calendar',
      icon: Calendar,
      roles: ['Admin', 'Mentor', 'Intern']
    },
    {
      id: 'performance' as NavTab,
      label: 'Performance Reports',
      icon: BarChart3,
      roles: ['Admin', 'Mentor', 'Intern']
    },
    {
      id: 'feedback' as NavTab,
      label: currentRole === 'Intern' ? 'Final Feedback' : 'Final Feedback Agent',
      icon: FileCheck2,
      roles: ['Admin', 'Mentor', 'Intern']
    },
    {
      id: 'certificates' as NavTab,
      label: currentRole === 'Intern' ? 'My Certificate' : 'Certificates',
      icon: Award,
      badge: counts.eligibleCerts > 0 && currentRole === 'Admin' ? counts.eligibleCerts : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800',
      roles: ['Admin', 'Mentor', 'Intern']
    },
    {
      id: 'emails' as NavTab,
      label: 'Email Automation',
      icon: Mail,
      badge: counts.pendingEmails > 0 ? counts.pendingEmails : undefined,
      badgeColor: 'bg-blue-100 text-blue-800',
      roles: ['Admin']
    },
    {
      id: 'chat' as NavTab,
      label: 'AI HR Assistant',
      icon: Bot,
      roles: ['Admin', 'Mentor', 'Intern']
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings & Excel',
      icon: Settings,
      roles: ['Admin', 'Mentor']
    }
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      
      {/* Current Mode Badge */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Role Mode</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-bold text-white">{currentRole} Portal</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {currentRole === 'Admin' ? 'Full administrative authority' : currentRole === 'Mentor' ? 'Department review authority' : 'Personal intern dashboard'}
          </p>
        </div>
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Download Excel Bar at Bottom of Sidebar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <a
          href="/api/export/excel"
          download="Intern_Management.xlsx"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors text-center"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Excel (6 Sheets)</span>
        </a>
      </div>

    </aside>
  );
};
