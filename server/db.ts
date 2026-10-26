import fs from 'fs';
import path from 'path';
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
} from './types';

const DATA_DIR = path.resolve(process.cwd(), 'server');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

export interface DatabaseSchema {
  interns: Intern[];
  tasks: Task[];
  reviews: AIReviewResult[];
  feedback: FinalFeedback[];
  certificates: Certificate[];
  emailLogs: EmailLog[];
  mentors: Mentor[];
  settings: SystemSettings;
}

const DEFAULT_MENTORS: Mentor[] = [
  {
    id: 'MTR-001',
    name: 'Dr. Evelyn Vance',
    email: 'evelyn.vance@internflow.ai',
    department: 'Artificial Intelligence & ML',
    title: 'Lead AI Research Scientist'
  },
  {
    id: 'MTR-002',
    name: 'Marcus Brody',
    email: 'marcus.brody@internflow.ai',
    department: 'Full-Stack Engineering',
    title: 'Principal Software Architect'
  },
  {
    id: 'MTR-003',
    name: 'Sarah Chen',
    email: 'sarah.chen@internflow.ai',
    department: 'Cloud & DevOps',
    title: 'Senior Infrastructure Director'
  },
  {
    id: 'MTR-004',
    name: 'David Miller',
    email: 'david.miller@internflow.ai',
    department: 'Data Science & Analytics',
    title: 'Head of Data Science'
  },
  {
    id: 'MTR-005',
    name: 'Priya Sharma',
    email: 'priya.sharma@internflow.ai',
    department: 'UI/UX Design',
    title: 'Staff Product Designer'
  }
];

const DEFAULT_SETTINGS: SystemSettings = {
  companyName: 'InternFlow Technologies Inc.',
  companyLogoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80',
  authorizedSignatory: 'Victoria Sterling',
  signatoryTitle: 'Vice President of Engineering & Talent Development',
  testMode: true,
  smtpHost: 'smtp.sendgrid.net',
  smtpPort: 587,
  smtpUser: 'apikey',
  senderEmail: 'hr-talent@internflow.ai',
  weights: {
    taskCompletionRate: 40,
    averageReviewScore: 40,
    onTimeCompletionRate: 20
  },
  eligibilityRules: {
    requireAllMandatoryTasks: true,
    requireMinScore: 70,
    requireMentorApproval: true
  }
};

const FIRST_NAMES = [
  'Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Charlotte', 'James', 'Amelia', 'William', 'Sophia',
  'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Evelyn', 'Alexander', 'Harper', 'Sebastian', 'Camila',
  'Daniel', 'Gianna', 'Matthew', 'Abigail', 'Samuel', 'Emily', 'David', 'Elizabeth', 'Joseph', 'Sofia',
  'Carter', 'Avery', 'Owen', 'Ella', 'Wyatt', 'Scarlett', 'John', 'Grace', 'Jack', 'Chloe',
  'Luke', 'Victoria', 'Jayden', 'Riley', 'Dylan', 'Aria', 'Grayson', 'Lily', 'Levi', 'Aubrey',
  'Isaac', 'Zoey', 'Gabriel', 'Penelope', 'Julian', 'Lillian', 'Mateo', 'Addison', 'Anthony', 'Layla',
  'Jaxon', 'Natalie', 'Lincoln', 'Camilla', 'Joshua', 'Hannah', 'Christopher', 'Brooklyn', 'Andrew', 'Zoe',
  'Theodore', 'Nora', 'Caleb', 'Leah', 'Ryan', 'Savannah', 'Asher', 'Audrey', 'Nathan', 'Claire',
  'Thomas', 'Eleanor', 'Leo', 'Skylar', 'Isaiah', 'Ellie', 'Charles', 'Stella', 'Josiah', 'Paisley',
  'Hudson', 'Violet', 'Christian', 'Mila', 'Hunter', 'Allison', 'Connor', 'Alexa', 'Eli', 'Anna'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const COLLEGES = [
  'Stanford University', 'Massachusetts Institute of Technology', 'UC Berkeley', 'Carnegie Mellon University',
  'Georgia Tech', 'University of Washington', 'UT Austin', 'Harvard University', 'University of Michigan',
  'Cornell University', 'Columbia University', 'UCLA', 'Purdue University', 'University of Illinois Urbana-Champaign',
  'University of Toronto', 'Waterloo University'
];

const DEPARTMENTS = [
  'Artificial Intelligence & ML',
  'Full-Stack Engineering',
  'Cloud & DevOps',
  'Data Science & Analytics',
  'UI/UX Design'
];

function generate100Interns(): Intern[] {
  const interns: Intern[] = [];
  for (let i = 1; i <= 100; i++) {
    const id = `INT${String(i).padStart(3, '0')}`;
    const firstName = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[((i * 3) - 1) % LAST_NAMES.length];
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@university.edu`;
    const phone = `+1 (555) ${String(100 + (i * 7)).padStart(3, '0')}-${String(2000 + (i * 13)).padStart(4, '0')}`;
    const dept = DEPARTMENTS[(i - 1) % DEPARTMENTS.length];
    const college = COLLEGES[(i - 1) % COLLEGES.length];
    
    // Mentor assignment
    const mentor = DEFAULT_MENTORS.find(m => m.department === dept) || DEFAULT_MENTORS[0];

    // Status: First 25 are completed (graduated internship cohort), rest are active, 2 on leave
    let status: 'Active' | 'Completed' | 'On Leave' = 'Active';
    if (i <= 25) {
      status = 'Completed';
    } else if (i === 42 || i === 87) {
      status = 'On Leave';
    }

    const startDate = i <= 25 ? '2026-06-01' : '2026-08-15';
    const endDate = i <= 25 ? '2026-09-30' : '2026-12-15';

    interns.push({
      id,
      fullName,
      email,
      phone,
      department: dept,
      collegeName: college,
      startDate,
      endDate,
      assignedMentorId: mentor.id,
      assignedMentorName: mentor.name,
      status,
      createdAt: '2026-06-01T09:00:00Z'
    });
  }
  return interns;
}

function generateInitialTasks(interns: Intern[]): Task[] {
  const tasks: Task[] = [];
  let taskIdCounter = 1;

  const TASK_TEMPLATES = [
    {
      title: 'Environment Setup and Architecture Baseline',
      desc: 'Clone the core repository, configure Docker containers, run local tests, and document setup steps in README.',
      reqs: ['Docker compose setup verified', 'Unit tests passing 100%', 'Environment variables documented', 'Clean commit history'],
      isMandatory: true,
      priority: 'High' as const
    },
    {
      title: 'REST API & Data Model Implementation',
      desc: 'Implement the database schema migrations, repository layer, and REST endpoints for the assigned service feature.',
      reqs: ['Valid OpenAPI specification', 'Input payload validation with zod', 'Database indexes applied', 'Integration tests included'],
      isMandatory: true,
      priority: 'High' as const
    },
    {
      title: 'Performance Profiling and Query Optimization',
      desc: 'Benchmark query latency on sample dataset of 50k rows, identify N+1 query bottlenecks, and implement Redis caching.',
      reqs: ['Flamegraph benchmark report', 'P99 latency under 80ms', 'Cache eviction policy configured', 'Zero regressions in test suite'],
      isMandatory: false,
      priority: 'Medium' as const
    },
    {
      title: 'Unit & End-to-End Test Suite Coverage',
      desc: 'Increase test coverage for edge cases, authentication failure modes, and automated CI pipeline verification.',
      reqs: ['Line coverage above 85%', 'Mocked 3P API failure tests', 'E2E workflow passing on CI', 'Coverage badge added'],
      isMandatory: true,
      priority: 'High' as const
    },
    {
      title: 'Production Documentation & Final Project Demo',
      desc: 'Compile comprehensive engineering handbook, architecture diagrams, and prepare 15-minute live demo deck.',
      reqs: ['System architecture diagram (C4 model)', 'Runbook for alert resolution', 'Demo slide deck with video demo', 'Peer code review signoff'],
      isMandatory: true,
      priority: 'Medium' as const
    }
  ];

  interns.forEach((intern, idx) => {
    // Each intern gets 3-4 tasks
    const count = intern.status === 'Completed' ? 5 : 3;
    for (let t = 0; t < count; t++) {
      const template = TASK_TEMPLATES[t];
      const taskId = `TSK-${String(taskIdCounter++).padStart(4, '0')}`;
      
      let status: Task['status'] = 'Assigned';
      let submissionDate: string | undefined;
      let submissionDescription: string | undefined;
      let submissionSolutionText: string | undefined;
      let completionDate: string | undefined;
      let reviewScore: number | undefined;
      let mentorComments: string | undefined;

      const assignedDate = intern.startDate;
      const dueDate = intern.status === 'Completed' 
        ? '2026-09-15' 
        : (t === 0 ? '2026-10-15' : (t === 1 ? '2026-10-28' : '2026-11-20'));

      if (intern.status === 'Completed') {
        // Completed cohort has all tasks approved/completed
        status = 'Completed';
        submissionDate = '2026-09-10';
        submissionDescription = 'Successfully completed all deliverables and verified in staging environment.';
        submissionSolutionText = `Completed comprehensive implementation of ${template.title}. All requirements met according to specifications. Unit tests: 42 passed. Docker container runs cleanly.`;
        completionDate = '2026-09-12';
        reviewScore = 88 + ((idx + t) % 12);
        mentorComments = 'Exceptional work. Clean architecture, robust documentation, and met all specifications on time.';
      } else {
        // Active cohort has varied statuses
        if (t === 0) {
          status = 'Completed';
          submissionDate = '2026-10-10';
          submissionDescription = 'Initial repository onboarding and environment setup complete.';
          submissionSolutionText = 'Configured .env, verified node v22, all test containers booted successfully.';
          completionDate = '2026-10-12';
          reviewScore = 92;
          mentorComments = 'Prompt and disciplined onboarding. Good attention to security guidelines.';
        } else if (t === 1) {
          if (idx % 4 === 0) {
            status = 'Under Review';
            submissionDate = '2026-10-24';
            submissionDescription = 'API layer built and tested against local Postgres instance.';
            submissionSolutionText = 'Built /api/v1 endpoints with schema validations and unit tests for CRUD operations.';
          } else if (idx % 4 === 1) {
            status = 'Changes Requested';
            submissionDate = '2026-10-22';
            submissionDescription = 'First pass of API endpoints.';
            submissionSolutionText = 'Endpoints work but error responses need standard JSON envelope formatting.';
            reviewScore = 65;
            mentorComments = 'Please follow the JSON API spec for error codes and add validation for edge cases.';
          } else if (idx % 4 === 2) {
            status = 'In Progress';
          } else {
            status = 'Assigned';
          }
        } else {
          status = 'Assigned';
        }
      }

      tasks.push({
        id: taskId,
        internId: intern.id,
        internName: intern.fullName,
        department: intern.department,
        title: template.title,
        description: template.desc,
        requirements: template.reqs,
        assignedDate,
        dueDate,
        priority: template.priority,
        mentorId: intern.assignedMentorId,
        mentorName: intern.assignedMentorName,
        status,
        isMandatory: template.isMandatory,
        submissionDate,
        submissionDescription,
        submissionSolutionText,
        submissionAttachmentName: submissionSolutionText ? 'deliverable-bundle.zip' : undefined,
        completionDate,
        reviewScore,
        mentorComments
      });
    }
  });

  return tasks;
}

function generateInitialCertificates(interns: Intern[], tasks: Task[]): Certificate[] {
  const certs: Certificate[] = [];
  // Interns 1 to 25 are completed and get certificates
  for (let i = 0; i < 25; i++) {
    const intern = interns[i];
    const certId = `CERT-2026-INFLOW-${String(i + 1).padStart(3, '0')}`;
    certs.push({
      id: certId,
      internId: intern.id,
      internName: intern.fullName,
      department: intern.department,
      startDate: intern.startDate,
      endDate: intern.endDate,
      issueDate: '2026-10-01',
      signatoryName: DEFAULT_SETTINGS.authorizedSignatory,
      signatoryTitle: DEFAULT_SETTINGS.signatoryTitle,
      isEligible: true,
      fileReference: `${certId}.pdf`,
      verifiedCount: Math.floor(Math.random() * 5) + 1
    });
  }
  return certs;
}

function generateInitialFeedback(interns: Intern[]): FinalFeedback[] {
  const feedbacks: FinalFeedback[] = [];
  for (let i = 0; i < 25; i++) {
    const intern = interns[i];
    feedbacks.push({
      id: `FDB-${String(i + 1).padStart(3, '0')}`,
      internId: intern.id,
      internName: intern.fullName,
      department: intern.department,
      duration: `${intern.startDate} to ${intern.endDate}`,
      totalTasks: 5,
      completedTasks: 5,
      avgReviewScore: 94,
      onTimeCompletionRate: 100,
      finalScore: 95,
      strengths: [
        'Proactive architectural decision making',
        'Consistently delivered robust test coverage above 90%',
        'Excellent cross-functional communication during sprint demos'
      ],
      areasForImprovement: [
        'Deepen knowledge of distributed caching edge cases',
        'Continue participating in open-source engineering groups'
      ],
      summary: `${intern.fullName} exhibited remarkable technical leadership and consistency throughout the ${intern.department} internship program. Their contributions materially improved our core service reliability.`,
      finalRecommendation: 'Highly Recommended',
      mentorApprovalStatus: 'Approved',
      mentorApprovedBy: intern.assignedMentorName,
      approvedAt: '2026-09-28T14:30:00Z',
      generatedAt: '2026-09-27T10:00:00Z'
    });
  }
  return feedbacks;
}

function generateInitialEmailLogs(interns: Intern[]): EmailLog[] {
  const logs: EmailLog[] = [];
  for (let i = 0; i < 20; i++) {
    const intern = interns[i];
    logs.push({
      id: `EML-${String(i + 1).padStart(4, '0')}`,
      internId: intern.id,
      internName: intern.fullName,
      recipientEmail: intern.email,
      emailSubject: 'Congratulations! Your Internship Completion Certificate and Final Feedback',
      certificateFile: `CERT-2026-INFLOW-${String(i + 1).padStart(3, '0')}.pdf`,
      feedbackFile: `FEEDBACK-${intern.id}.pdf`,
      sentDateTime: '2026-10-02T16:20:00Z',
      emailStatus: i === 18 ? 'Failed' : 'Sent',
      errorMessage: i === 18 ? 'Recipient mail server connection timeout (simulated)' : undefined,
      deliveryMode: 'Test Mode'
    });
  }
  return logs;
}

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading data file, re-seeding:', err);
    }
    return this.seedDefaultData();
  }

  public saveData(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save data.json:', err);
    }
  }

  public seedDefaultData(): DatabaseSchema {
    const interns = generate100Interns();
    const tasks = generateInitialTasks(interns);
    const certificates = generateInitialCertificates(interns, tasks);
    const feedback = generateInitialFeedback(interns);
    const emailLogs = generateInitialEmailLogs(interns);

    this.data = {
      interns,
      tasks,
      reviews: [],
      feedback,
      certificates,
      emailLogs,
      mentors: DEFAULT_MENTORS,
      settings: DEFAULT_SETTINGS
    };
    this.saveData();
    return this.data;
  }

  // Intern methods
  public getInterns(): Intern[] {
    return this.data.interns;
  }

  public getInternById(id: string): Intern | undefined {
    return this.data.interns.find(i => i.id === id);
  }

  public createIntern(internData: Omit<Intern, 'id' | 'createdAt'>): Intern {
    // Generate next INT number
    const maxNum = this.data.interns.reduce((max, i) => {
      const num = parseInt(i.id.replace('INT', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const id = `INT${String(maxNum + 1).padStart(3, '0')}`;
    
    // Check duplicate email
    if (this.data.interns.some(i => i.email.toLowerCase() === internData.email.toLowerCase())) {
      throw new Error(`Email ${internData.email} is already registered.`);
    }

    const mentor = this.data.mentors.find(m => m.id === internData.assignedMentorId);

    const newIntern: Intern = {
      ...internData,
      id,
      assignedMentorName: mentor ? mentor.name : internData.assignedMentorName,
      createdAt: new Date().toISOString()
    };

    this.data.interns.unshift(newIntern);
    this.saveData();
    return newIntern;
  }

  public updateIntern(id: string, updates: Partial<Intern>): Intern {
    const idx = this.data.interns.findIndex(i => i.id === id);
    if (idx === -1) throw new Error(`Intern ${id} not found.`);

    if (updates.email) {
      const duplicate = this.data.interns.find(
        i => i.id !== id && i.email.toLowerCase() === updates.email?.toLowerCase()
      );
      if (duplicate) throw new Error(`Email ${updates.email} is already in use by another intern.`);
    }

    if (updates.assignedMentorId) {
      const mentor = this.data.mentors.find(m => m.id === updates.assignedMentorId);
      if (mentor) {
        updates.assignedMentorName = mentor.name;
      }
    }

    this.data.interns[idx] = { ...this.data.interns[idx], ...updates };
    this.saveData();
    return this.data.interns[idx];
  }

  public deleteIntern(id: string): void {
    this.data.interns = this.data.interns.filter(i => i.id !== id);
    this.data.tasks = this.data.tasks.filter(t => t.internId !== id);
    this.data.certificates = this.data.certificates.filter(c => c.internId !== id);
    this.data.feedback = this.data.feedback.filter(f => f.internId !== id);
    this.saveData();
  }

  public bulkImportInterns(incomingList: Array<Omit<Intern, 'id' | 'createdAt'>>): { 
    imported: number; 
    errors: Array<{ row: number; email: string; message: string }>; 
  } {
    const errors: Array<{ row: number; email: string; message: string }> = [];
    let importedCount = 0;

    let maxNum = this.data.interns.reduce((max, i) => {
      const num = parseInt(i.id.replace('INT', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);

    incomingList.forEach((row, index) => {
      const rowNum = index + 1;
      if (!row.fullName || !row.email || !row.department) {
        errors.push({ row: rowNum, email: row.email || 'N/A', message: 'Missing required fields (fullName, email, department).' });
        return;
      }
      if (this.data.interns.some(i => i.email.toLowerCase() === row.email.toLowerCase())) {
        errors.push({ row: rowNum, email: row.email, message: `Duplicate email: ${row.email}` });
        return;
      }

      maxNum++;
      const id = `INT${String(maxNum).padStart(3, '0')}`;
      const mentor = this.data.mentors.find(m => m.department === row.department) || this.data.mentors[0];

      const newIntern: Intern = {
        ...row,
        id,
        assignedMentorId: mentor.id,
        assignedMentorName: mentor.name,
        status: row.status || 'Active',
        createdAt: new Date().toISOString()
      };

      this.data.interns.push(newIntern);
      importedCount++;
    });

    this.saveData();
    return { imported: importedCount, errors };
  }

  // Task methods
  public getTasks(): Task[] {
    return this.data.tasks;
  }

  public getTaskById(id: string): Task | undefined {
    return this.data.tasks.find(t => t.id === id);
  }

  public createTask(taskData: Omit<Task, 'id'>): Task {
    const maxNum = this.data.tasks.reduce((max, t) => {
      const num = parseInt(t.id.replace('TSK-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const id = `TSK-${String(maxNum + 1).padStart(4, '0')}`;
    
    const intern = this.getInternById(taskData.internId);
    const mentor = this.data.mentors.find(m => m.id === taskData.mentorId);

    const newTask: Task = {
      ...taskData,
      id,
      internName: intern ? intern.fullName : taskData.internName,
      department: intern ? intern.department : taskData.department,
      mentorName: mentor ? mentor.name : taskData.mentorName
    };

    this.data.tasks.unshift(newTask);
    this.saveData();
    return newTask;
  }

  public bulkAssignTask(taskData: {
    internIds: string[];
    title: string;
    description: string;
    requirements: string[];
    assignedDate: string;
    dueDate: string;
    priority: Task['priority'];
    isMandatory: boolean;
  }): Task[] {
    const created: Task[] = [];
    let maxNum = this.data.tasks.reduce((max, t) => {
      const num = parseInt(t.id.replace('TSK-', ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);

    taskData.internIds.forEach(internId => {
      const intern = this.getInternById(internId);
      if (!intern) return;

      maxNum++;
      const id = `TSK-${String(maxNum).padStart(4, '0')}`;
      const mentor = this.data.mentors.find(m => m.id === intern.assignedMentorId) || this.data.mentors[0];

      const newTask: Task = {
        id,
        internId,
        internName: intern.fullName,
        department: intern.department,
        title: taskData.title,
        description: taskData.description,
        requirements: taskData.requirements,
        assignedDate: taskData.assignedDate,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        mentorId: mentor.id,
        mentorName: mentor.name,
        status: 'Assigned',
        isMandatory: taskData.isMandatory
      };

      this.data.tasks.unshift(newTask);
      created.push(newTask);
    });

    this.saveData();
    return created;
  }

  public updateTask(id: string, updates: Partial<Task>): Task {
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx === -1) throw new Error(`Task ${id} not found.`);

    this.data.tasks[idx] = { ...this.data.tasks[idx], ...updates };
    this.saveData();
    return this.data.tasks[idx];
  }

  // Reviews
  public getReviews(): AIReviewResult[] {
    return this.data.reviews;
  }

  public saveReview(review: AIReviewResult): AIReviewResult {
    const existingIdx = this.data.reviews.findIndex(r => r.taskId === review.taskId);
    if (existingIdx !== -1) {
      this.data.reviews[existingIdx] = review;
    } else {
      this.data.reviews.push(review);
    }

    // Link in task
    const taskIdx = this.data.tasks.findIndex(t => t.id === review.taskId);
    if (taskIdx !== -1) {
      this.data.tasks[taskIdx].aiReviewId = review.id;
    }

    this.saveData();
    return review;
  }

  // Feedback
  public getFeedbacks(): FinalFeedback[] {
    return this.data.feedback;
  }

  public getFeedbackByInternId(internId: string): FinalFeedback | undefined {
    return this.data.feedback.find(f => f.internId === internId);
  }

  public saveFeedback(feedback: FinalFeedback): FinalFeedback {
    const existingIdx = this.data.feedback.findIndex(f => f.internId === feedback.internId);
    if (existingIdx !== -1) {
      this.data.feedback[existingIdx] = feedback;
    } else {
      this.data.feedback.push(feedback);
    }
    this.saveData();
    return feedback;
  }

  // Certificates
  public getCertificates(): Certificate[] {
    return this.data.certificates;
  }

  public getCertificateById(id: string): Certificate | undefined {
    return this.data.certificates.find(c => c.id.toLowerCase() === id.toLowerCase());
  }

  public getCertificateByInternId(internId: string): Certificate | undefined {
    return this.data.certificates.find(c => c.internId === internId);
  }

  public issueCertificate(internId: string): Certificate {
    const intern = this.getInternById(internId);
    if (!intern) throw new Error(`Intern ${internId} not found.`);

    const metrics = this.calculatePerformance(internId);
    if (!metrics.eligibilityStatus) {
      throw new Error(`Intern ${internId} is not eligible for certificate: ${metrics.eligibilityIssues.join(', ')}`);
    }

    const existing = this.getCertificateByInternId(internId);
    if (existing) {
      existing.verifiedCount++;
      this.saveData();
      return existing;
    }

    const nextNumber = this.data.certificates.length + 1;
    const certId = `CERT-2026-INFLOW-${String(nextNumber).padStart(3, '0')}`;

    const newCert: Certificate = {
      id: certId,
      internId: intern.id,
      internName: intern.fullName,
      department: intern.department,
      startDate: intern.startDate,
      endDate: intern.endDate,
      issueDate: new Date().toISOString().split('T')[0],
      signatoryName: this.data.settings.authorizedSignatory,
      signatoryTitle: this.data.settings.signatoryTitle,
      isEligible: true,
      fileReference: `${certId}.pdf`,
      verifiedCount: 1
    };

    this.data.certificates.push(newCert);
    
    // Update intern status to completed if not already
    if (intern.status !== 'Completed') {
      intern.status = 'Completed';
    }

    this.saveData();
    return newCert;
  }

  // Email Logs
  public getEmailLogs(): EmailLog[] {
    return this.data.emailLogs;
  }

  public addEmailLog(log: Omit<EmailLog, 'id'>): EmailLog {
    const id = `EML-${String(this.data.emailLogs.length + 1).padStart(4, '0')}`;
    const newLog: EmailLog = { ...log, id };
    this.data.emailLogs.unshift(newLog);
    this.saveData();
    return newLog;
  }

  public updateEmailLog(id: string, updates: Partial<EmailLog>): EmailLog {
    const idx = this.data.emailLogs.findIndex(l => l.id === id);
    if (idx === -1) throw new Error(`Email log ${id} not found.`);
    this.data.emailLogs[idx] = { ...this.data.emailLogs[idx], ...updates };
    this.saveData();
    return this.data.emailLogs[idx];
  }

  // Mentors & Settings
  public getMentors(): Mentor[] {
    return this.data.mentors;
  }

  public getSettings(): SystemSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData();
    return this.data.settings;
  }

  // Performance calculation using specified weighted formula
  public calculatePerformance(internId: string): PerformanceMetrics {
    const intern = this.getInternById(internId);
    const internTasks = this.data.tasks.filter(t => t.internId === internId);
    const weights = this.data.settings.weights;

    const totalAssignedTasks = internTasks.length;
    const completedTasks = internTasks.filter(t => t.status === 'Completed' || t.status === 'Approved');
    const totalCompletedTasks = completedTasks.length;
    const pendingTasks = internTasks.filter(t => t.status === 'Assigned' || t.status === 'In Progress' || t.status === 'Changes Requested').length;
    
    const today = new Date().toISOString().split('T')[0];
    const overdueTasks = internTasks.filter(t => 
      t.status !== 'Completed' && t.status !== 'Approved' && t.dueDate < today
    ).length;

    // Task Completion Rate (0-100)
    const taskCompletionRate = totalAssignedTasks > 0 
      ? Math.round((totalCompletedTasks / totalAssignedTasks) * 100) 
      : 0;

    // Average Review Score
    const scoredTasks = internTasks.filter(t => typeof t.reviewScore === 'number');
    const avgReviewScore = scoredTasks.length > 0 
      ? Math.round(scoredTasks.reduce((sum, t) => sum + (t.reviewScore || 0), 0) / scoredTasks.length)
      : 0;

    // On-Time Completion Rate
    const completedOnTime = completedTasks.filter(t => {
      if (!t.completionDate) return true;
      return t.completionDate <= t.dueDate;
    }).length;

    const onTimeCompletionRate = totalCompletedTasks > 0
      ? Math.round((completedOnTime / totalCompletedTasks) * 100)
      : 100;

    // Formula: Task Completion Rate: 40%, Average Review Score: 40%, On-Time Completion Rate: 20%
    const finalCalculatedScore = Math.round(
      (taskCompletionRate * (weights.taskCompletionRate / 100)) +
      (avgReviewScore * (weights.averageReviewScore / 100)) +
      (onTimeCompletionRate * (weights.onTimeCompletionRate / 100))
    );

    // Eligibility check
    const issues: string[] = [];
    const rules = this.data.settings.eligibilityRules;

    if (totalAssignedTasks === 0) {
      issues.push('No tasks assigned yet.');
    }

    if (rules.requireAllMandatoryTasks) {
      const incompleteMandatory = internTasks.filter(t => t.isMandatory && t.status !== 'Completed' && t.status !== 'Approved');
      if (incompleteMandatory.length > 0) {
        issues.push(`${incompleteMandatory.length} mandatory task(s) remain uncompleted.`);
      }
    }

    if (finalCalculatedScore < rules.requireMinScore) {
      issues.push(`Calculated performance score (${finalCalculatedScore}) is below minimum threshold (${rules.requireMinScore}).`);
    }

    const feedback = this.getFeedbackByInternId(internId);
    if (rules.requireMentorApproval && (!feedback || feedback.mentorApprovalStatus !== 'Approved')) {
      issues.push('Final mentor performance evaluation is not approved.');
    }

    const eligibilityStatus = issues.length === 0 && totalAssignedTasks > 0;

    return {
      internId,
      totalAssignedTasks,
      totalCompletedTasks,
      pendingTasks,
      overdueTasks,
      avgReviewScore,
      onTimeCompletionRate,
      taskCompletionRate,
      finalCalculatedScore,
      eligibilityStatus,
      eligibilityIssues: issues
    };
  }
}

export const db = new Database();
