import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { InternsView } from './components/InternsView';
import { TasksView } from './components/TasksView';
import { ReviewView } from './components/ReviewView';
import { CalendarView } from './components/CalendarView';
import { PerformanceView } from './components/PerformanceView';
import { FeedbackView } from './components/FeedbackView';
import { CertificatesView } from './components/CertificatesView';
import { EmailAutomationView } from './components/EmailAutomationView';
import { HRAssistantChatView } from './components/HRAssistantChatView';
import { SettingsView } from './components/SettingsView';

import { InternModal } from './components/modals/InternModal';
import { BulkImportModal } from './components/modals/BulkImportModal';
import { TaskModal } from './components/modals/TaskModal';
import { SubmitTaskModal } from './components/modals/SubmitTaskModal';
import { CertificateModal } from './components/modals/CertificateModal';
import { VerifyCertModal } from './components/modals/VerifyCertModal';
import { EmailPreviewModal } from './components/modals/EmailPreviewModal';
import { DemoGuideModal } from './components/modals/DemoGuideModal';
import { InternProfileModal } from './components/modals/InternProfileModal';

import {
  Intern,
  Task,
  Certificate,
  FinalFeedback,
  EmailLog,
  Mentor,
  SystemSettings,
  UserRole
} from './types';
import { api } from './utils/api';
import {
  SEED_INTERNS,
  SEED_TASKS,
  SEED_CERTIFICATES,
  SEED_FEEDBACK,
  SEED_EMAIL_LOGS,
  SEED_MENTORS,
  SEED_SETTINGS
} from './data/seedData';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('Admin');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Initialize with seed data immediately so preview is NEVER blank
  const [interns, setInterns] = useState<Intern[]>(() => {
    try {
      const saved = localStorage.getItem('internflow_interns');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SEED_INTERNS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('internflow_tasks');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SEED_TASKS;
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    try {
      const saved = localStorage.getItem('internflow_certs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SEED_CERTIFICATES;
  });

  const [feedbacks, setFeedbacks] = useState<FinalFeedback[]>(() => {
    try {
      const saved = localStorage.getItem('internflow_feedback');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SEED_FEEDBACK;
  });

  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => {
    try {
      const saved = localStorage.getItem('internflow_emails');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SEED_EMAIL_LOGS;
  });

  const [mentors, setMentors] = useState<Mentor[]>(() => {
    try {
      const saved = localStorage.getItem('internflow_mentors');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SEED_MENTORS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('internflow_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SEED_SETTINGS;
  });

  const [activeMentorId, setActiveMentorId] = useState<string>('MTR-001');
  const [activeInternId, setActiveInternId] = useState<string>('INT001');

  // Modals state
  const [isAddInternOpen, setIsAddInternOpen] = useState(false);
  const [editingIntern, setEditingIntern] = useState<Intern | undefined>(undefined);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [submittingTask, setSubmittingTask] = useState<Task | null>(null);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [previewEmailIntern, setPreviewEmailIntern] = useState<Intern | null>(null);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);
  const [profileInternId, setProfileInternId] = useState<string | null>(null);

  // Selected contexts for reviews and feedback
  const [selectedReviewTaskId, setSelectedReviewTaskId] = useState<string | undefined>(undefined);
  const [selectedFeedbackInternId, setSelectedFeedbackInternId] = useState<string | undefined>(undefined);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('internflow_interns', JSON.stringify(interns));
      localStorage.setItem('internflow_tasks', JSON.stringify(tasks));
      localStorage.setItem('internflow_certs', JSON.stringify(certificates));
      localStorage.setItem('internflow_feedback', JSON.stringify(feedbacks));
      localStorage.setItem('internflow_emails', JSON.stringify(emailLogs));
      localStorage.setItem('internflow_mentors', JSON.stringify(mentors));
      localStorage.setItem('internflow_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [interns, tasks, certificates, feedbacks, emailLogs, mentors, settings]);

  // Background Data Synchronization with backend API
  const syncWithBackend = async () => {
    try {
      const [fetchedInterns, fetchedTasks, fetchedCerts, fetchedFeedbacks, fetchedEmails, fetchedMentors, fetchedSettings] = await Promise.all([
        api.getInterns().catch(() => null),
        api.getTasks().catch(() => null),
        api.getCertificates().catch(() => null),
        api.getFeedbacks().catch(() => null),
        api.getEmailLogs().catch(() => null),
        api.getMentors().catch(() => null),
        api.getSettings().catch(() => null)
      ]);

      if (fetchedInterns && fetchedInterns.length > 0) setInterns(fetchedInterns);
      if (fetchedTasks && fetchedTasks.length > 0) setTasks(fetchedTasks);
      if (fetchedCerts && fetchedCerts.length > 0) setCertificates(fetchedCerts);
      if (fetchedFeedbacks && fetchedFeedbacks.length > 0) setFeedbacks(fetchedFeedbacks);
      if (fetchedEmails && fetchedEmails.length > 0) setEmailLogs(fetchedEmails);
      if (fetchedMentors && fetchedMentors.length > 0) setMentors(fetchedMentors);
      if (fetchedSettings) setSettings(fetchedSettings);
    } catch (err) {
      console.warn('Backend sync note:', err);
    }
  };

  useEffect(() => {
    syncWithBackend();
  }, []);

  // Navigation helper
  const handleNavigate = (tab: NavTab) => {
    setCurrentTab(tab);
  };

  // Intern CRUD actions
  const handleSaveIntern = async (internData: any) => {
    if (editingIntern) {
      try {
        const updated = await api.updateIntern(editingIntern.id, internData);
        setInterns(prev => prev.map(i => i.id === updated.id ? updated : i));
      } catch (err) {
        // Fallback local update
        const updatedLocal = { ...editingIntern, ...internData };
        setInterns(prev => prev.map(i => i.id === updatedLocal.id ? updatedLocal : i));
      }
      setEditingIntern(undefined);
    } else {
      try {
        const created = await api.createIntern(internData);
        setInterns(prev => [created, ...prev]);
      } catch (err) {
        // Fallback local create
        const maxNum = interns.reduce((max, i) => {
          const num = parseInt(i.id.replace('INT', ''), 10);
          return !isNaN(num) && num > max ? num : max;
        }, 0);
        const newId = `INT${String(maxNum + 1).padStart(3, '0')}`;
        const newIntern: Intern = {
          ...internData,
          id: newId,
          createdAt: new Date().toISOString()
        };
        setInterns(prev => [newIntern, ...prev]);
      }
    }
  };

  const handleDeleteIntern = async (id: string) => {
    try {
      await api.deleteIntern(id);
    } catch (e) {}
    setInterns(prev => prev.filter(i => i.id !== id));
    setTasks(prev => prev.filter(t => t.internId !== id));
  };

  // Task submit action
  const handleTaskSubmitted = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  // Reset to default sample 100 interns
  const handleResetToDefault = () => {
    localStorage.removeItem('internflow_interns');
    localStorage.removeItem('internflow_tasks');
    localStorage.removeItem('internflow_certs');
    localStorage.removeItem('internflow_feedback');
    localStorage.removeItem('internflow_emails');
    localStorage.removeItem('internflow_mentors');
    localStorage.removeItem('internflow_settings');

    setInterns(SEED_INTERNS);
    setTasks(SEED_TASKS);
    setCertificates(SEED_CERTIFICATES);
    setFeedbacks(SEED_FEEDBACK);
    setEmailLogs(SEED_EMAIL_LOGS);
    setMentors(SEED_MENTORS);
    setSettings(SEED_SETTINGS);

    api.resetData().catch(() => {});
  };

  // Badge counts
  const today = new Date().toISOString().split('T')[0];
  const pendingReviews = tasks.filter(t => t.status === 'Under Review' || t.status === 'Submitted').length;
  const overdueTasks = tasks.filter(t => t.status !== 'Completed' && t.status !== 'Approved' && t.dueDate < today).length;
  const eligibleCerts = certificates.filter(c => c.isEligible).length;
  const pendingEmails = Math.max(0, eligibleCerts - emailLogs.filter(e => e.emailStatus === 'Sent').length);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Navbar with Role Switching & Quick Tools */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          if (role === 'Intern' && (currentTab === 'interns' || currentTab === 'emails' || currentTab === 'settings')) {
            setCurrentTab('dashboard');
          }
        }}
        mentors={mentors}
        interns={interns}
        activeMentorId={activeMentorId}
        onMentorSelect={setActiveMentorId}
        activeInternId={activeInternId}
        onInternSelect={setActiveInternId}
        onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
        onOpenVerifyModal={() => setIsVerifyOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          currentRole={currentRole}
          counts={{
            totalInterns: interns.length,
            pendingReviews,
            eligibleCerts,
            pendingEmails,
            overdueTasks
          }}
        />

        {/* Dynamic View Main Container (All 10 Pages) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {/* 1. Admin Dashboard */}
          {currentTab === 'dashboard' && (
            <DashboardView
              interns={interns}
              tasks={tasks}
              certificates={certificates}
              emailLogs={emailLogs}
              mentors={mentors}
              currentRole={currentRole}
              onNavigate={handleNavigate}
              onSelectIntern={(id) => setProfileInternId(id)}
              onSelectTask={(id) => {
                setSelectedReviewTaskId(id);
                setCurrentTab('reviews');
              }}
            />
          )}

          {/* 2. Intern Management */}
          {currentTab === 'interns' && (
            <InternsView
              interns={interns}
              mentors={mentors}
              currentRole={currentRole}
              onOpenAddModal={() => {
                setEditingIntern(undefined);
                setIsAddInternOpen(true);
              }}
              onOpenBulkImportModal={() => setIsBulkImportOpen(true)}
              onSelectIntern={(id) => setProfileInternId(id)}
              onEditIntern={(intern) => {
                setEditingIntern(intern);
                setIsAddInternOpen(true);
              }}
              onDeleteIntern={handleDeleteIntern}
            />
          )}

          {/* 3. Task Assignment */}
          {currentTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              interns={interns}
              mentors={mentors}
              currentRole={currentRole}
              activeInternId={activeInternId}
              onOpenCreateTaskModal={() => setIsCreateTaskOpen(true)}
              onSelectTask={(id) => {
                setSelectedReviewTaskId(id);
                setCurrentTab('reviews');
              }}
              onOpenSubmitModal={(task) => setSubmittingTask(task)}
              onNavigateToReviews={(taskId) => {
                setSelectedReviewTaskId(taskId);
                setCurrentTab('reviews');
              }}
            />
          )}

          {/* 4. Task Review */}
          {currentTab === 'reviews' && (
            <ReviewView
              tasks={tasks}
              interns={interns}
              currentRole={currentRole}
              activeInternId={activeInternId}
              selectedTaskId={selectedReviewTaskId}
              onTaskUpdated={(updated) => {
                setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
              }}
            />
          )}

          {/* 5. Calendar */}
          {currentTab === 'calendar' && (
            <CalendarView
              tasks={tasks}
              interns={interns}
              certificates={certificates}
              mentors={mentors}
              currentRole={currentRole}
              activeInternId={activeInternId}
              onSelectTask={(id) => {
                setSelectedReviewTaskId(id);
                setCurrentTab('reviews');
              }}
              onOpenCreateTaskModal={() => setIsCreateTaskOpen(true)}
            />
          )}

          {/* 6. Performance Evaluation */}
          {currentTab === 'performance' && (
            <PerformanceView
              interns={interns}
              tasks={tasks}
              settings={settings}
              currentRole={currentRole}
              activeInternId={activeInternId}
              onSelectIntern={(id) => setProfileInternId(id)}
              onOpenFeedback={(id) => {
                setSelectedFeedbackInternId(id);
                setCurrentTab('feedback');
              }}
            />
          )}

          {/* 7. Final Feedback */}
          {currentTab === 'feedback' && (
            <FeedbackView
              interns={interns}
              feedbacks={feedbacks}
              mentors={mentors}
              currentRole={currentRole}
              activeInternId={activeInternId}
              selectedInternId={selectedFeedbackInternId}
              onFeedbackSaved={(fb) => {
                setFeedbacks(prev => {
                  const idx = prev.findIndex(f => f.internId === fb.internId);
                  if (idx !== -1) {
                    const copy = [...prev];
                    copy[idx] = fb;
                    return copy;
                  }
                  return [fb, ...prev];
                });
              }}
            />
          )}

          {/* 8. Certificate Generation */}
          {currentTab === 'certificates' && (
            <CertificatesView
              certificates={certificates}
              interns={interns}
              tasks={tasks}
              feedbacks={feedbacks}
              settings={settings}
              currentRole={currentRole}
              activeInternId={activeInternId}
              onCertificateIssued={(cert) => {
                setCertificates(prev => [cert, ...prev]);
                setPreviewCert(cert);
              }}
              onOpenVerifyModal={() => setIsVerifyOpen(true)}
              onPreviewCertificate={(cert) => setPreviewCert(cert)}
            />
          )}

          {/* 9. Email Automation */}
          {currentTab === 'emails' && (
            <EmailAutomationView
              emailLogs={emailLogs}
              interns={interns}
              certificates={certificates}
              feedbacks={feedbacks}
              settings={settings}
              onLogsUpdated={setEmailLogs}
              onOpenPreviewEmail={(intern) => setPreviewEmailIntern(intern)}
            />
          )}

          {/* 10. AI HR Assistant */}
          {currentTab === 'chat' && (
            <HRAssistantChatView />
          )}

          {/* Settings & Excel Export */}
          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSettingsUpdated={setSettings}
              onDataReset={handleResetToDefault}
            />
          )}

        </main>
      </div>

      {/* Global Interactive Modals */}
      <InternModal
        isOpen={isAddInternOpen}
        onClose={() => {
          setIsAddInternOpen(false);
          setEditingIntern(undefined);
        }}
        onSave={handleSaveIntern}
        mentors={mentors}
        initialData={editingIntern}
      />

      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImportComplete={syncWithBackend}
      />

      <TaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        interns={interns}
        mentors={mentors}
        onTaskCreated={syncWithBackend}
      />

      {submittingTask && (
        <SubmitTaskModal
          isOpen={Boolean(submittingTask)}
          onClose={() => setSubmittingTask(null)}
          task={submittingTask}
          onSubmitted={handleTaskSubmitted}
        />
      )}

      <CertificateModal
        isOpen={Boolean(previewCert)}
        onClose={() => setPreviewCert(null)}
        certificate={previewCert}
        settings={settings}
      />

      <VerifyCertModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
      />

      <EmailPreviewModal
        isOpen={Boolean(previewEmailIntern)}
        onClose={() => setPreviewEmailIntern(null)}
        intern={previewEmailIntern}
        settings={settings}
      />

      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onNavigate={handleNavigate}
      />

      <InternProfileModal
        isOpen={Boolean(profileInternId)}
        onClose={() => setProfileInternId(null)}
        internId={profileInternId}
        companyName={settings.companyName}
      />

    </div>
  );
}
