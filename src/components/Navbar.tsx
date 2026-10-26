import React from 'react';
import { 
  Sparkles, 
  UserCheck, 
  ShieldCheck, 
  GraduationCap, 
  ChevronDown, 
  HelpCircle, 
  Database,
  Building2
} from 'lucide-react';
import { UserRole, Mentor, Intern } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  mentors: Mentor[];
  interns: Intern[];
  activeMentorId: string;
  onMentorSelect: (id: string) => void;
  activeInternId: string;
  onInternSelect: (id: string) => void;
  onOpenDemoGuide: () => void;
  onOpenVerifyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  mentors,
  interns,
  activeMentorId,
  onMentorSelect,
  activeInternId,
  onInternSelect,
  onOpenDemoGuide,
  onOpenVerifyModal
}) => {
  const selectedIntern = interns.find(i => i.id === activeInternId) || interns[0];
  const selectedMentor = mentors.find(m => m.id === activeMentorId) || mentors[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">InternFlow <span className="text-indigo-600">AI</span></span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                100 Interns Live
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">Smart Internship Management & Performance Evaluation</p>
          </div>
        </div>

        {/* Center / Right Control Panel: Role Switching & Quick Tools */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Quick Demo Tour Button */}
          <button
            onClick={onOpenDemoGuide}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            12-Step Demo Flow
          </button>

          {/* Public Certificate Verification Tool shortcut */}
          <button
            onClick={onOpenVerifyModal}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verify Certificate
          </button>

          {/* Role Selector Pill */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onRoleChange('Admin')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'Admin'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Admin / HR</span>
            </button>
            <button
              onClick={() => onRoleChange('Mentor')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'Mentor'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Mentor</span>
            </button>
            <button
              onClick={() => onRoleChange('Intern')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'Intern'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Intern</span>
            </button>
          </div>

          {/* Role context dropdown (select which Mentor or which Intern) */}
          {currentRole === 'Mentor' && mentors.length > 0 && (
            <div className="relative">
              <select
                aria-label="Active Mentor"
                value={activeMentorId}
                onChange={(e) => onMentorSelect(e.target.value)}
                className="text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 pr-6 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {mentors.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.department})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          )}

          {currentRole === 'Intern' && interns.length > 0 && (
            <div className="relative max-w-[200px]">
              <select
                aria-label="Active Intern"
                value={activeInternId}
                onChange={(e) => onInternSelect(e.target.value)}
                className="text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 pr-6 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer truncate"
              >
                {interns.slice(0, 30).map(i => (
                  <option key={i.id} value={i.id}>
                    {i.id}: {i.fullName} ({i.status})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          )}

          {/* Active User Avatar / Pill */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 text-left">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
              {currentRole === 'Admin' ? 'HR' : currentRole === 'Mentor' ? (selectedMentor?.name?.charAt(0) || 'M') : (selectedIntern?.fullName?.charAt(0) || 'I')}
            </div>
            <div className="hidden xl:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {currentRole === 'Admin' ? 'HR Director' : currentRole === 'Mentor' ? selectedMentor?.name : selectedIntern?.fullName}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                {currentRole === 'Admin' ? 'Super Admin' : currentRole === 'Mentor' ? selectedMentor?.title : `${selectedIntern?.id} • ${selectedIntern?.department}`}
              </p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
