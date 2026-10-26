import { Intern, Task, Certificate, FinalFeedback, EmailLog, Mentor, SystemSettings } from '../types';

export const SEED_MENTORS: Mentor[] = [
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

export const SEED_SETTINGS: SystemSettings = {
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
  'Stanford University', 'MIT', 'UC Berkeley', 'Carnegie Mellon University',
  'Georgia Tech', 'University of Washington', 'UT Austin', 'Harvard University', 'University of Michigan',
  'Cornell University', 'Columbia University', 'UCLA', 'Purdue University', 'UIUC',
  'University of Toronto', 'Waterloo University'
];

const DEPARTMENTS = [
  'Artificial Intelligence & ML',
  'Full-Stack Engineering',
  'Cloud & DevOps',
  'Data Science & Analytics',
  'UI/UX Design'
];

export function generateSeedInterns(): Intern[] {
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
    const mentor = SEED_MENTORS.find(m => m.department === dept) || SEED_MENTORS[0];

    let status: 'Active' | 'Completed' | 'On Leave' = 'Active';
    if (i <= 25) {
      status = 'Completed';
    } else if (i === 42 || i === 87) {
      status = 'On Leave';
    }

    interns.push({
      id,
      fullName,
      email,
      phone,
      department: dept,
      collegeName: college,
      startDate: i <= 25 ? '2026-06-01' : '2026-08-15',
      endDate: i <= 25 ? '2026-09-30' : '2026-12-15',
      assignedMentorId: mentor.id,
      assignedMentorName: mentor.name,
      status,
      createdAt: '2026-06-01T09:00:00Z'
    });
  }
  return interns;
}

export function generateSeedTasks(interns: Intern[]): Task[] {
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
        status = 'Completed';
        submissionDate = '2026-09-10';
        submissionDescription = 'Successfully completed all deliverables and verified in staging environment.';
        submissionSolutionText = `Completed comprehensive implementation of ${template.title}. All requirements met according to specifications. Unit tests: 42 passed. Docker container runs cleanly.`;
        completionDate = '2026-09-12';
        reviewScore = 88 + ((idx + t) % 12);
        mentorComments = 'Exceptional work. Clean architecture, robust documentation, and met all specifications on time.';
      } else {
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

export function generateSeedCertificates(interns: Intern[]): Certificate[] {
  const certs: Certificate[] = [];
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
      signatoryName: SEED_SETTINGS.authorizedSignatory,
      signatoryTitle: SEED_SETTINGS.signatoryTitle,
      isEligible: true,
      fileReference: `${certId}.pdf`,
      verifiedCount: Math.floor(Math.random() * 5) + 1
    });
  }
  return certs;
}

export function generateSeedFeedback(interns: Intern[]): FinalFeedback[] {
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

export function generateSeedEmailLogs(interns: Intern[]): EmailLog[] {
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

export const SEED_INTERNS = generateSeedInterns();
export const SEED_TASKS = generateSeedTasks(SEED_INTERNS);
export const SEED_CERTIFICATES = generateSeedCertificates(SEED_INTERNS);
export const SEED_FEEDBACK = generateSeedFeedback(SEED_INTERNS);
export const SEED_EMAIL_LOGS = generateSeedEmailLogs(SEED_INTERNS);
