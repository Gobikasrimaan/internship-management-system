import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { db } from './server/db';
import { reviewTaskWithAI, generateFinalFeedbackWithAI, chatWithHRAssistant } from './server/aiService';
import { generateExcelWorkbook, parseExcelInterns } from './server/excelService';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', name: 'InternFlow AI', timestamp: new Date().toISOString() });
});

// Settings & Mentors
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(db.getSettings());
});

app.put('/api/settings', (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

app.get('/api/mentors', (req: Request, res: Response) => {
  res.json(db.getMentors());
});

// Interns CRUD
app.get('/api/interns', (req: Request, res: Response) => {
  const interns = db.getInterns();
  res.json(interns);
});

app.get('/api/interns/:id', (req: Request, res: Response) => {
  const intern = db.getInternById(req.params.id);
  if (!intern) return res.status(404).json({ error: 'Intern not found' });
  const metrics = db.calculatePerformance(intern.id);
  const tasks = db.getTasks().filter(t => t.internId === intern.id);
  const certificate = db.getCertificateByInternId(intern.id);
  const feedback = db.getFeedbackByInternId(intern.id);
  res.json({ intern, metrics, tasks, certificate, feedback });
});

app.post('/api/interns', (req: Request, res: Response) => {
  try {
    const intern = db.createIntern(req.body);
    res.status(201).json(intern);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create intern' });
  }
});

app.put('/api/interns/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateIntern(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update intern' });
  }
});

app.delete('/api/interns/:id', (req: Request, res: Response) => {
  db.deleteIntern(req.params.id);
  res.json({ success: true, message: `Intern ${req.params.id} deleted` });
});

// Bulk Import Interns from JSON payload (or Excel base64 payload)
app.post('/api/interns/bulk-import', (req: Request, res: Response) => {
  try {
    const { interns, base64File } = req.body;
    let listToImport = interns;

    if (base64File) {
      const buffer = Buffer.from(base64File, 'base64');
      listToImport = parseExcelInterns(buffer);
    }

    if (!Array.isArray(listToImport) || listToImport.length === 0) {
      return res.status(400).json({ error: 'No intern records provided to import' });
    }

    const result = db.bulkImportInterns(listToImport);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to import interns' });
  }
});

// Tasks CRUD
app.get('/api/tasks', (req: Request, res: Response) => {
  const { internId, status, department, mentorId } = req.query;
  let tasks = db.getTasks();

  if (internId) {
    tasks = tasks.filter(t => t.internId === internId);
  }
  if (status) {
    tasks = tasks.filter(t => t.status === status);
  }
  if (department) {
    tasks = tasks.filter(t => t.department === department);
  }
  if (mentorId) {
    tasks = tasks.filter(t => t.mentorId === mentorId);
  }

  res.json(tasks);
});

app.post('/api/tasks', (req: Request, res: Response) => {
  try {
    const task = db.createTask(req.body);
    res.status(201).json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create task' });
  }
});

app.post('/api/tasks/bulk-assign', (req: Request, res: Response) => {
  try {
    const createdTasks = db.bulkAssignTask(req.body);
    res.status(201).json({ created: createdTasks.length, tasks: createdTasks });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to bulk assign tasks' });
  }
});

app.put('/api/tasks/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateTask(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update task' });
  }
});

// Task Submission by Intern
app.post('/api/tasks/:id/submit', (req: Request, res: Response) => {
  try {
    const { submissionDescription, submissionSolutionText, submissionAttachmentName } = req.body;
    const task = db.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const updated = db.updateTask(req.params.id, {
      submissionDescription,
      submissionSolutionText,
      submissionAttachmentName: submissionAttachmentName || 'submission-work.txt',
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'Submitted'
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to submit task' });
  }
});

// AI Task Review (Gemini 3.8 Flash)
app.post('/api/tasks/:id/ai-review', async (req: Request, res: Response) => {
  try {
    const task = db.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const intern = db.getInternById(task.internId);
    if (!intern) return res.status(404).json({ error: 'Assigned intern not found' });

    const aiReview = await reviewTaskWithAI(task, intern);
    const reviewId = `REV-${Date.now()}`;
    const fullReview = {
      ...aiReview,
      id: reviewId,
      generatedAt: new Date().toISOString()
    };

    db.saveReview(fullReview);
    // Update task status to Under Review
    db.updateTask(task.id, { status: 'Under Review' });

    res.json(fullReview);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate AI task review' });
  }
});

// Mentor Review Submission (Approve / Request Changes / Reject)
app.post('/api/tasks/:id/mentor-review', (req: Request, res: Response) => {
  try {
    const { action, reviewScore, mentorComments } = req.body;
    const task = db.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    let newStatus = task.status;
    let completionDate = task.completionDate;

    if (action === 'Approve') {
      newStatus = 'Completed';
      completionDate = new Date().toISOString().split('T')[0];
    } else if (action === 'Request Changes') {
      newStatus = 'Changes Requested';
    } else if (action === 'Reject') {
      newStatus = 'Changes Requested';
    }

    const updated = db.updateTask(task.id, {
      status: newStatus,
      reviewScore: typeof reviewScore === 'number' ? reviewScore : task.reviewScore,
      mentorComments,
      completionDate
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to submit mentor review' });
  }
});

app.get('/api/reviews', (req: Request, res: Response) => {
  res.json(db.getReviews());
});

// Performance Metrics
app.get('/api/performance/:internId', (req: Request, res: Response) => {
  try {
    const metrics = db.calculatePerformance(req.params.internId);
    res.json(metrics);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to calculate performance' });
  }
});

// Feedback & AI Generation
app.get('/api/feedback', (req: Request, res: Response) => {
  res.json(db.getFeedbacks());
});

app.get('/api/feedback/:internId', (req: Request, res: Response) => {
  const fb = db.getFeedbackByInternId(req.params.internId);
  res.json(fb || null);
});

app.post('/api/feedback/generate/:internId', async (req: Request, res: Response) => {
  try {
    const intern = db.getInternById(req.params.internId);
    if (!intern) return res.status(404).json({ error: 'Intern not found' });

    const metrics = db.calculatePerformance(intern.id);
    const tasks = db.getTasks().filter(t => t.internId === intern.id);

    const generated = await generateFinalFeedbackWithAI(intern, metrics, tasks);
    const feedbackId = `FDB-${String(db.getFeedbacks().length + 1).padStart(3, '0')}`;
    
    const saved = db.saveFeedback({
      ...generated,
      id: feedbackId
    });

    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate final feedback' });
  }
});

app.put('/api/feedback/:internId/approve', (req: Request, res: Response) => {
  try {
    const { mentorApprovedBy, summary, strengths, areasForImprovement, finalRecommendation } = req.body;
    const existing = db.getFeedbackByInternId(req.params.internId);
    if (!existing) return res.status(404).json({ error: 'Feedback record not found for this intern' });

    const updated = db.saveFeedback({
      ...existing,
      summary: summary || existing.summary,
      strengths: strengths || existing.strengths,
      areasForImprovement: areasForImprovement || existing.areasForImprovement,
      finalRecommendation: finalRecommendation || existing.finalRecommendation,
      mentorApprovalStatus: 'Approved',
      mentorApprovedBy: mentorApprovedBy || 'Assigned Mentor',
      approvedAt: new Date().toISOString()
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to approve feedback' });
  }
});

// Certificates
app.get('/api/certificates', (req: Request, res: Response) => {
  res.json(db.getCertificates());
});

app.get('/api/certificates/verify/:certId', (req: Request, res: Response) => {
  const cert = db.getCertificateById(req.params.certId);
  if (!cert) return res.status(404).json({ valid: false, error: 'Certificate ID not recognized in database' });
  cert.verifiedCount++;
  db.saveData();
  res.json({ valid: true, certificate: cert });
});

app.post('/api/certificates/issue/:internId', (req: Request, res: Response) => {
  try {
    const cert = db.issueCertificate(req.params.internId);
    res.status(201).json(cert);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to issue certificate' });
  }
});

// Email Automation
app.get('/api/emails', (req: Request, res: Response) => {
  res.json(db.getEmailLogs());
});

// Send single email to intern
app.post('/api/emails/send', (req: Request, res: Response) => {
  try {
    const { internId, customSubject } = req.body;
    const intern = db.getInternById(internId);
    if (!intern) return res.status(404).json({ error: 'Intern not found' });

    const cert = db.getCertificateByInternId(intern.id);
    const feedback = db.getFeedbackByInternId(intern.id);

    const log = db.addEmailLog({
      internId: intern.id,
      internName: intern.fullName,
      recipientEmail: intern.email,
      emailSubject: customSubject || 'Congratulations! Your Internship Completion Certificate and Final Feedback',
      certificateFile: cert ? `${cert.id}.pdf` : 'Not Attached',
      feedbackFile: feedback ? `FEEDBACK-${intern.id}.pdf` : 'Not Attached',
      sentDateTime: new Date().toISOString(),
      emailStatus: 'Sent',
      deliveryMode: db.getSettings().testMode ? 'Test Mode' : 'Live'
    });

    res.json({ success: true, log });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to send email' });
  }
});

// Send test email
app.post('/api/emails/test', (req: Request, res: Response) => {
  try {
    const { recipientEmail } = req.body;
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid test recipient email address required' });
    }

    const log = db.addEmailLog({
      internId: 'TEST-001',
      internName: 'Test Recipient',
      recipientEmail,
      emailSubject: '[TEST RUN] Congratulations! Your Internship Completion Certificate and Final Feedback',
      certificateFile: 'SAMPLE-CERT-2026.pdf',
      feedbackFile: 'SAMPLE-FEEDBACK.pdf',
      sentDateTime: new Date().toISOString(),
      emailStatus: 'Sent',
      deliveryMode: 'Test Mode'
    });

    res.json({ success: true, message: `Test email simulated successfully to ${recipientEmail}`, log });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to dispatch test email' });
  }
});

// Bulk send emails to selected or all eligible interns
app.post('/api/emails/bulk-send', (req: Request, res: Response) => {
  try {
    const { internIds } = req.body;
    const allInterns = db.getInterns();
    const targetInterns = Array.isArray(internIds) && internIds.length > 0
      ? allInterns.filter(i => internIds.includes(i.id))
      : allInterns.filter(i => {
          const metrics = db.calculatePerformance(i.id);
          return metrics.eligibilityStatus;
        });

    const logs = [];
    for (const intern of targetInterns) {
      const cert = db.getCertificateByInternId(intern.id);
      const feedback = db.getFeedbackByInternId(intern.id);

      const log = db.addEmailLog({
        internId: intern.id,
        internName: intern.fullName,
        recipientEmail: intern.email,
        emailSubject: 'Congratulations! Your Internship Completion Certificate and Final Feedback',
        certificateFile: cert ? `${cert.id}.pdf` : 'Pending Certificate',
        feedbackFile: feedback ? `FEEDBACK-${intern.id}.pdf` : 'Pending Feedback',
        sentDateTime: new Date().toISOString(),
        emailStatus: 'Sent',
        deliveryMode: db.getSettings().testMode ? 'Test Mode' : 'Live'
      });
      logs.push(log);
    }

    res.json({ success: true, count: logs.length, logs });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to dispatch bulk emails' });
  }
});

// Retry failed email
app.post('/api/emails/retry/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateEmailLog(req.params.id, {
      emailStatus: 'Sent',
      errorMessage: undefined,
      sentDateTime: new Date().toISOString()
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to retry email' });
  }
});

// AI Chatbot for HR & Mentors
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const result = await chatWithHRAssistant(message, history || []);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI Chatbot error' });
  }
});

// Excel Workbook Download (Intern_Management.xlsx)
app.get('/api/export/excel', (req: Request, res: Response) => {
  try {
    const buffer = generateExcelWorkbook();
    res.setHeader('Content-Disposition', 'attachment; filename="Intern_Management.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate Excel export' });
  }
});

// Reset / Re-seed 100 Interns Dataset
app.post('/api/reset-data', (req: Request, res: Response) => {
  try {
    const freshData = db.seedDefaultData();
    res.json({ success: true, message: 'Database reset to default 100 interns with rich activity history', counts: {
      interns: freshData.interns.length,
      tasks: freshData.tasks.length,
      certificates: freshData.certificates.length,
      emailLogs: freshData.emailLogs.length
    }});
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to reset dataset' });
  }
});

// Vite Middleware Setup (Development) or Static File Serving (Production)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> InternFlow AI full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
