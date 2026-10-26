import { jsPDF } from 'jspdf';
import { FinalFeedback, Intern } from '../types';

export function generateFeedbackPdf(
  feedback: FinalFeedback,
  intern?: Intern,
  companyName: string = 'InternFlow Technologies Inc.'
): jsPDF {
  // Portrait A4: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;

  // Header Banner
  doc.setFillColor(24, 43, 73); // Deep Navy
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('INTERNSHIP PERFORMANCE EVALUATION REPORT', 14, 18);

  doc.setFontSize(9);
  doc.setTextColor(197, 160, 89);
  doc.text(`${companyName.toUpperCase()} • TALENT DEVELOPMENT DIVISION`, 14, 26);

  // Intern Details Card Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, 38, pageWidth - 28, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('INTERN PROFILE & COHORT DETAILS', 18, 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  doc.text(`Intern Name:`, 18, 54);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(feedback.internName, 46, 54);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Intern ID:`, 18, 62);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(feedback.internId, 46, 62);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Department:`, 18, 70);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(feedback.department, 46, 70);

  // Column 2 of Card
  const col2X = 115;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Internship Period:`, col2X, 54);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(feedback.duration, col2X + 32, 54);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Evaluation Date:`, col2X, 62);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(feedback.approvedAt ? feedback.approvedAt.split('T')[0] : feedback.generatedAt.split('T')[0], col2X + 32, 62);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Mentor Signoff:`, col2X, 70);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${feedback.mentorApprovedBy || 'Approved'} (${feedback.mentorApprovalStatus})`, col2X + 32, 70);

  // Performance Score Breakdown Grid
  let y = 84;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(24, 43, 73);
  doc.text('VERIFIED PERFORMANCE METRICS (WEIGHTED SCORING)', 14, y);

  y += 6;
  const colWidth = (pageWidth - 28) / 4;
  const metrics = [
    { label: 'Task Completion', val: `${feedback.completedTasks}/${feedback.totalTasks}`, sub: '40% Weight' },
    { label: 'Avg Review Score', val: `${feedback.avgReviewScore}/100`, sub: '40% Weight' },
    { label: 'On-Time Rate', val: `${feedback.onTimeCompletionRate}%`, sub: '20% Weight' },
    { label: 'Final Score', val: `${feedback.finalScore}/100`, sub: feedback.finalRecommendation }
  ];

  metrics.forEach((m, idx) => {
    const x = 14 + (idx * colWidth);
    doc.setFillColor(idx === 3 ? 238 : 248, idx === 3 ? 242 : 250, idx === 3 ? 255 : 252);
    doc.setDrawColor(idx === 3 ? 99 : 226, idx === 3 ? 102 : 232, idx === 3 ? 241 : 240);
    doc.roundedRect(x, y, colWidth - 3, 26, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, x + 5, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(idx === 3 ? 79 : 15, idx === 3 ? 70 : 23, idx === 3 ? 229 : 42);
    doc.text(m.val, x + 5, y + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(m.sub, x + 5, y + 22);
  });

  // Section 1: Executive Performance Summary
  y += 36;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(24, 43, 73);
  doc.text('OVERALL PERFORMANCE SUMMARY', 14, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const splitSummary = doc.splitTextToSize(feedback.summary, pageWidth - 28);
  doc.text(splitSummary, 14, y);

  y += (splitSummary.length * 5) + 6;

  // Section 2: Key Technical & Professional Strengths
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(24, 43, 73);
  doc.text('IDENTIFIED STRENGTHS & KEY ACHIEVEMENTS', 14, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  feedback.strengths.forEach((str) => {
    doc.setFillColor(34, 197, 94);
    doc.circle(18, y - 1, 1.2, 'F');
    const splitStr = doc.splitTextToSize(str, pageWidth - 36);
    doc.text(splitStr, 22, y);
    y += (splitStr.length * 4.5) + 2;
  });

  // Section 3: Targeted Areas for Improvement & Growth
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(24, 43, 73);
  doc.text('AREAS FOR CAREER GROWTH & DEVELOPMENT', 14, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  feedback.areasForImprovement.forEach((area) => {
    doc.setFillColor(245, 158, 11);
    doc.circle(18, y - 1, 1.2, 'F');
    const splitArea = doc.splitTextToSize(area, pageWidth - 36);
    doc.text(splitArea, 22, y);
    y += (splitArea.length * 4.5) + 2;
  });

  // Section 4: Final Recommendation & Authorization
  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('FINAL TALENT COMMITTEE RECOMMENDATION', 18, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 64, 175);
  doc.text(feedback.finalRecommendation.toUpperCase(), 18, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized by Department Mentor and Talent Review Board • InternFlow AI', 18, y + 23);

  // Footer
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Document Reference: FEEDBACK-${feedback.internId} • Verified against InternFlow AI DB`, 14, 288);
  doc.text(`Page 1 of 1`, pageWidth - 28, 288);

  return doc;
}
