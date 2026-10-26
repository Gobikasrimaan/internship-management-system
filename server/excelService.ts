import * as XLSX from 'xlsx';
import { DatabaseSchema, db } from './db';

export function generateExcelWorkbook(): Buffer {
  const interns = db.getInterns();
  const tasks = db.getTasks();
  const reviews = db.getReviews();
  const feedback = db.getFeedbacks();
  const certificates = db.getCertificates();
  const emailLogs = db.getEmailLogs();

  const wb = XLSX.utils.book_new();

  // Sheet 1: Interns
  const internsData = interns.map(i => ({
    'Intern ID': i.id,
    'Full Name': i.fullName,
    'Email Address': i.email,
    'Phone Number': i.phone,
    'Department': i.department,
    'College Name': i.collegeName,
    'Internship Start Date': i.startDate,
    'Internship End Date': i.endDate,
    'Assigned Mentor ID': i.assignedMentorId,
    'Assigned Mentor Name': i.assignedMentorName,
    'Internship Status': i.status,
    'Created At': i.createdAt
  }));
  const wsInterns = XLSX.utils.json_to_sheet(internsData);
  XLSX.utils.book_append_sheet(wb, wsInterns, 'Interns');

  // Sheet 2: Tasks
  const tasksData = tasks.map(t => ({
    'Task ID': t.id,
    'Intern ID': t.internId,
    'Intern Name': t.internName,
    'Department': t.department,
    'Task Title': t.title,
    'Description': t.description,
    'Requirements': t.requirements.join(' | '),
    'Assigned Date': t.assignedDate,
    'Due Date': t.dueDate,
    'Priority': t.priority,
    'Mentor ID': t.mentorId,
    'Mentor Name': t.mentorName,
    'Task Status': t.status,
    'Is Mandatory': t.isMandatory ? 'Yes' : 'No',
    'Submission Date': t.submissionDate || '',
    'Submission Description': t.submissionDescription || '',
    'Completion Date': t.completionDate || '',
    'Review Score': t.reviewScore ?? '',
    'Mentor Comments': t.mentorComments || ''
  }));
  const wsTasks = XLSX.utils.json_to_sheet(tasksData);
  XLSX.utils.book_append_sheet(wb, wsTasks, 'Tasks');

  // Sheet 3: Reviews
  const reviewsData = reviews.map(r => ({
    'Review ID': r.id,
    'Task ID': r.taskId,
    'Intern ID': r.internId,
    'Generated At': r.generatedAt,
    'Completed Requirements': r.completedRequirements.join(' | '),
    'Missing Requirements': r.missingRequirements.join(' | '),
    'Strengths': r.strengths.join(' | '),
    'Areas For Improvement': r.areasForImprovement.join(' | '),
    'Recommended Score': r.recommendedScore,
    'Constructive Feedback': r.constructiveFeedback,
    'Recommended Status': r.recommendedStatus
  }));
  const wsReviews = XLSX.utils.json_to_sheet(reviewsData.length > 0 ? reviewsData : [
    { 'Note': 'Reviews are generated dynamically when AI reviews are requested.' }
  ]);
  XLSX.utils.book_append_sheet(wb, wsReviews, 'Reviews');

  // Sheet 4: Feedback
  const feedbackData = feedback.map(f => ({
    'Feedback ID': f.id,
    'Intern ID': f.internId,
    'Intern Name': f.internName,
    'Department': f.department,
    'Duration': f.duration,
    'Total Tasks': f.totalTasks,
    'Completed Tasks': f.completedTasks,
    'Average Review Score': f.avgReviewScore,
    'On-Time Completion Rate (%)': f.onTimeCompletionRate,
    'Final Performance Score': f.finalScore,
    'Strengths': f.strengths.join(' | '),
    'Areas for Improvement': f.areasForImprovement.join(' | '),
    'Overall Summary': f.summary,
    'Final Recommendation': f.finalRecommendation,
    'Mentor Approval Status': f.mentorApprovalStatus,
    'Approved By': f.mentorApprovedBy || '',
    'Approved At': f.approvedAt || '',
    'Generated At': f.generatedAt
  }));
  const wsFeedback = XLSX.utils.json_to_sheet(feedbackData);
  XLSX.utils.book_append_sheet(wb, wsFeedback, 'Feedback');

  // Sheet 5: Certificates
  const certsData = certificates.map(c => ({
    'Certificate ID': c.id,
    'Intern ID': c.internId,
    'Intern Name': c.internName,
    'Department': c.department,
    'Start Date': c.startDate,
    'End Date': c.endDate,
    'Issue Date': c.issueDate,
    'Authorized Signatory': c.signatoryName,
    'Signatory Title': c.signatoryTitle,
    'Eligibility Status': c.isEligible ? 'Eligible & Issued' : 'Ineligible',
    'File Reference': c.fileReference,
    'Verification Count': c.verifiedCount
  }));
  const wsCerts = XLSX.utils.json_to_sheet(certsData);
  XLSX.utils.book_append_sheet(wb, wsCerts, 'Certificates');

  // Sheet 6: Email_Log
  const emailLogsData = emailLogs.map(e => ({
    'Email ID': e.id,
    'Intern ID': e.internId,
    'Intern Name': e.internName,
    'Recipient Email': e.recipientEmail,
    'Email Subject': e.emailSubject,
    'Certificate File': e.certificateFile,
    'Feedback File': e.feedbackFile,
    'Sent Date and Time': e.sentDateTime,
    'Email Status': e.emailStatus,
    'Error Message': e.errorMessage || '',
    'Delivery Mode': e.deliveryMode
  }));
  const wsEmailLogs = XLSX.utils.json_to_sheet(emailLogsData);
  XLSX.utils.book_append_sheet(wb, wsEmailLogs, 'Email_Log');

  // Return binary buffer
  const out = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return out;
}

export function parseExcelInterns(buffer: Buffer): Array<{
  fullName: string;
  email: string;
  phone: string;
  department: string;
  collegeName: string;
  startDate: string;
  endDate: string;
  assignedMentorId?: string;
  assignedMentorName?: string;
  status?: any;
}> {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[firstSheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet);

  return rows.map(r => ({
    fullName: r['Full Name'] || r['Name'] || r['fullName'] || '',
    email: r['Email Address'] || r['Email'] || r['email'] || '',
    phone: r['Phone Number'] || r['Phone'] || r['phone'] || '',
    department: r['Department'] || r['department'] || 'Full-Stack Engineering',
    collegeName: r['College Name'] || r['College'] || r['collegeName'] || 'University',
    startDate: r['Internship Start Date'] || r['Start Date'] || r['startDate'] || '2026-06-01',
    endDate: r['Internship End Date'] || r['End Date'] || r['endDate'] || '2026-09-30',
    assignedMentorId: r['Assigned Mentor ID'] || r['Mentor ID'],
    assignedMentorName: r['Assigned Mentor Name'] || r['Mentor Name'],
    status: r['Internship Status'] || r['Status'] || 'Active'
  }));
}
