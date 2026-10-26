export type InternStatus = 'Active' | 'Completed' | 'Terminated' | 'On Leave';

export type TaskStatus = 
  | 'Assigned' 
  | 'In Progress' 
  | 'Submitted' 
  | 'Under Review' 
  | 'Changes Requested' 
  | 'Approved' 
  | 'Completed';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type UserRole = 'Admin' | 'Mentor' | 'Intern';

export interface Mentor {
  id: string;
  name: string;
  email: string;
  department: string;
  title: string;
  avatar?: string;
}

export interface Intern {
  id: string; // e.g. INT001
  fullName: string;
  email: string;
  phone: string;
  department: string;
  collegeName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  assignedMentorId: string;
  assignedMentorName: string;
  status: InternStatus;
  avatarUrl?: string;
  createdAt: string;
}

export interface Task {
  id: string; // e.g. TSK-001
  internId: string;
  internName?: string;
  department?: string;
  title: string;
  description: string;
  requirements: string[]; // specific bullet points/criteria
  assignedDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  priority: TaskPriority;
  mentorId: string;
  mentorName?: string;
  status: TaskStatus;
  isMandatory: boolean;
  submissionDate?: string;
  submissionDescription?: string;
  submissionSolutionText?: string;
  submissionAttachmentName?: string;
  submissionAttachmentUrl?: string;
  completionDate?: string;
  reviewScore?: number; // 0-100
  mentorComments?: string;
  aiReviewId?: string;
}

export interface AIReviewResult {
  id: string;
  taskId: string;
  internId: string;
  generatedAt: string;
  completedRequirements: string[];
  missingRequirements: string[];
  strengths: string[];
  areasForImprovement: string[];
  recommendedScore: number;
  constructiveFeedback: string;
  recommendedStatus: TaskStatus;
}

export interface FinalFeedback {
  id: string;
  internId: string;
  internName: string;
  department: string;
  duration: string; // e.g. "Jun 1, 2026 - Aug 31, 2026"
  totalTasks: number;
  completedTasks: number;
  avgReviewScore: number;
  onTimeCompletionRate: number;
  finalScore: number;
  strengths: string[];
  areasForImprovement: string[];
  summary: string;
  finalRecommendation: 'Highly Recommended' | 'Recommended' | 'Conditional' | 'Not Recommended';
  mentorApprovalStatus: 'Pending' | 'Approved' | 'Revision Requested';
  mentorApprovedBy?: string;
  approvedAt?: string;
  generatedAt: string;
}

export interface Certificate {
  id: string; // e.g. CERT-2026-INFLOW-001
  internId: string;
  internName: string;
  department: string;
  startDate: string;
  endDate: string;
  issueDate: string;
  signatoryName: string;
  signatoryTitle: string;
  isEligible: boolean;
  ineligibilityReason?: string;
  fileReference: string;
  verifiedCount: number;
}

export interface EmailLog {
  id: string;
  internId: string;
  internName: string;
  recipientEmail: string;
  emailSubject: string;
  certificateFile: string;
  feedbackFile: string;
  sentDateTime: string;
  emailStatus: 'Sent' | 'Failed' | 'Pending';
  errorMessage?: string;
  deliveryMode: 'Live' | 'Test Mode';
}

export interface PerformanceMetrics {
  internId: string;
  totalAssignedTasks: number;
  totalCompletedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  avgReviewScore: number;
  onTimeCompletionRate: number; // 0-100%
  taskCompletionRate: number; // 0-100%
  finalCalculatedScore: number; // formula: 40% task comp + 40% avg score + 20% on-time
  eligibilityStatus: boolean;
  eligibilityIssues: string[];
}

export interface SystemSettings {
  companyName: string;
  companyLogoUrl: string;
  authorizedSignatory: string;
  signatoryTitle: string;
  testMode: boolean; // default true for safe demo
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  senderEmail: string;
  weights: {
    taskCompletionRate: number; // 40
    averageReviewScore: number; // 40
    onTimeCompletionRate: number; // 20
  };
  eligibilityRules: {
    requireAllMandatoryTasks: boolean;
    requireMinScore: number; // e.g. 70
    requireMentorApproval: boolean;
  };
}
