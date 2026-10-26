import {
  Intern,
  Task,
  AIReviewResult,
  FinalFeedback,
  Certificate,
  EmailLog,
  Mentor,
  SystemSettings,
  PerformanceMetrics
} from '../types';

export const api = {
  // Settings & Mentors
  getSettings: async (): Promise<SystemSettings> => {
    const res = await fetch('/api/settings');
    return res.json();
  },
  updateSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },
  getMentors: async (): Promise<Mentor[]> => {
    const res = await fetch('/api/mentors');
    return res.json();
  },

  // Interns
  getInterns: async (): Promise<Intern[]> => {
    const res = await fetch('/api/interns');
    return res.json();
  },
  getInternDetails: async (id: string): Promise<{
    intern: Intern;
    metrics: PerformanceMetrics;
    tasks: Task[];
    certificate?: Certificate;
    feedback?: FinalFeedback;
  }> => {
    const res = await fetch(`/api/interns/${id}`);
    if (!res.ok) throw new Error('Intern not found');
    return res.json();
  },
  createIntern: async (data: Omit<Intern, 'id' | 'createdAt'>): Promise<Intern> => {
    const res = await fetch('/api/interns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create intern');
    }
    return res.json();
  },
  updateIntern: async (id: string, updates: Partial<Intern>): Promise<Intern> => {
    const res = await fetch(`/api/interns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update intern');
    }
    return res.json();
  },
  deleteIntern: async (id: string): Promise<void> => {
    const res = await fetch(`/api/interns/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete intern');
  },
  bulkImportInterns: async (data: { interns?: any[]; base64File?: string }) => {
    const res = await fetch('/api/interns/bulk-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Bulk import failed');
    }
    return res.json();
  },

  // Tasks
  getTasks: async (filters?: { internId?: string; status?: string; department?: string; mentorId?: string }): Promise<Task[]> => {
    const query = new URLSearchParams(filters as any).toString();
    const res = await fetch(`/api/tasks?${query}`);
    return res.json();
  },
  createTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create task');
    }
    return res.json();
  },
  bulkAssignTask: async (payload: {
    internIds: string[];
    title: string;
    description: string;
    requirements: string[];
    assignedDate: string;
    dueDate: string;
    priority: Task['priority'];
    isMandatory: boolean;
  }) => {
    const res = await fetch('/api/tasks/bulk-assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to bulk assign');
    }
    return res.json();
  },
  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update task');
    }
    return res.json();
  },
  submitTask: async (id: string, payload: {
    submissionDescription: string;
    submissionSolutionText: string;
    submissionAttachmentName?: string;
  }): Promise<Task> => {
    const res = await fetch(`/api/tasks/${id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit task');
    }
    return res.json();
  },
  runAITaskReview: async (id: string): Promise<AIReviewResult> => {
    const res = await fetch(`/api/tasks/${id}/ai-review`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to run AI Task Review');
    }
    return res.json();
  },
  mentorReviewTask: async (id: string, payload: {
    action: 'Approve' | 'Request Changes' | 'Reject';
    reviewScore: number;
    mentorComments: string;
  }): Promise<Task> => {
    const res = await fetch(`/api/tasks/${id}/mentor-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record mentor review');
    }
    return res.json();
  },

  // Performance
  getPerformanceMetrics: async (internId: string): Promise<PerformanceMetrics> => {
    const res = await fetch(`/api/performance/${internId}`);
    if (!res.ok) throw new Error('Failed to fetch performance');
    return res.json();
  },

  // Feedback
  getFeedbacks: async (): Promise<FinalFeedback[]> => {
    const res = await fetch('/api/feedback');
    return res.json();
  },
  getFeedbackByInternId: async (internId: string): Promise<FinalFeedback | null> => {
    const res = await fetch(`/api/feedback/${internId}`);
    return res.json();
  },
  generateFinalFeedback: async (internId: string): Promise<FinalFeedback> => {
    const res = await fetch(`/api/feedback/generate/${internId}`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate feedback');
    }
    return res.json();
  },
  approveFeedback: async (internId: string, payload: Partial<FinalFeedback>): Promise<FinalFeedback> => {
    const res = await fetch(`/api/feedback/${internId}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to approve feedback');
    }
    return res.json();
  },

  // Certificates
  getCertificates: async (): Promise<Certificate[]> => {
    const res = await fetch('/api/certificates');
    return res.json();
  },
  issueCertificate: async (internId: string): Promise<Certificate> => {
    const res = await fetch(`/api/certificates/issue/${internId}`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to issue certificate');
    }
    return res.json();
  },
  verifyCertificate: async (certId: string): Promise<{ valid: boolean; certificate?: Certificate; error?: string }> => {
    const res = await fetch(`/api/certificates/verify/${certId}`);
    return res.json();
  },

  // Email Automation
  getEmailLogs: async (): Promise<EmailLog[]> => {
    const res = await fetch('/api/emails');
    return res.json();
  },
  sendEmailToIntern: async (internId: string, customSubject?: string) => {
    const res = await fetch('/api/emails/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internId, customSubject })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send email');
    }
    return res.json();
  },
  sendTestEmail: async (recipientEmail: string) => {
    const res = await fetch('/api/emails/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientEmail })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send test email');
    }
    return res.json();
  },
  bulkSendEmails: async (internIds?: string[]) => {
    const res = await fetch('/api/emails/bulk-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internIds })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed bulk send');
    }
    return res.json();
  },
  retryEmail: async (id: string) => {
    const res = await fetch(`/api/emails/retry/${id}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to retry email');
    return res.json();
  },

  // AI Chatbot
  chatWithAI: async (message: string, history: Array<{ role: 'user' | 'model'; text: string }>) => {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'AI Chatbot error');
    }
    return res.json();
  },

  // Reset Dataset
  resetData: async () => {
    const res = await fetch('/api/reset-data', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset dataset');
    return res.json();
  }
};
