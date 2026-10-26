import { jsPDF } from 'jspdf';
import { Certificate } from '../types';

export function generateCertificatePdf(cert: Certificate, companyName: string = 'InternFlow Technologies Inc.'): jsPDF {
  // Landscape A4: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // Background cream tint
  doc.setFillColor(253, 252, 248);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Outer Navy Border
  doc.setDrawColor(24, 43, 73); // Deep Navy
  doc.setLineWidth(3);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Inner Gold Border
  doc.setDrawColor(197, 160, 89); // Gold
  doc.setLineWidth(1);
  doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

  // Decorative Corner Accents
  const cornerSize = 8;
  doc.setFillColor(197, 160, 89);
  // Top-left
  doc.triangle(14, 14, 14 + cornerSize, 14, 14, 14 + cornerSize, 'F');
  // Top-right
  doc.triangle(pageWidth - 14, 14, pageWidth - 14 - cornerSize, 14, pageWidth - 14, 14 + cornerSize, 'F');
  // Bottom-left
  doc.triangle(14, pageHeight - 14, 14 + cornerSize, pageHeight - 14, 14, pageHeight - 14 - cornerSize, 'F');
  // Bottom-right
  doc.triangle(pageWidth - 14, pageHeight - 14, pageWidth - 14 - cornerSize, pageHeight - 14, pageWidth - 14, pageHeight - 14 - cornerSize, 'F');

  // Company Brand Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(197, 160, 89);
  doc.text(companyName.toUpperCase(), pageWidth / 2, 28, { align: 'center' });

  // Main Title
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(24, 43, 73);
  doc.text('CERTIFICATE OF INTERNSHIP COMPLETION', pageWidth / 2, 42, { align: 'center' });

  // Subtitle
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text('This credential is officially conferred upon', pageWidth / 2, 54, { align: 'center' });

  // Intern Name
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(15, 23, 42);
  doc.text(cert.internName, pageWidth / 2, 70, { align: 'center' });

  // Decorative Underline
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.8);
  doc.line((pageWidth / 2) - 50, 74, (pageWidth / 2) + 50, 74);

  // Recognition Body Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  const bodyText1 = `In official recognition of successfully fulfilling all academic and professional milestone requirements as an Intern in the`;
  const bodyText2 = `Department of ${cert.department}`;
  const bodyText3 = `from ${cert.startDate} to ${cert.endDate}, demonstrating exemplary technical proficiency, leadership, and professional excellence.`;

  doc.text(bodyText1, pageWidth / 2, 86, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(24, 43, 73);
  doc.text(bodyText2, pageWidth / 2, 94, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text(bodyText3, pageWidth / 2, 102, { align: 'center' });

  // Gold Seal Graphic (Center-Bottom)
  const sealX = pageWidth / 2;
  const sealY = 138;
  doc.setFillColor(212, 175, 55); // Rich Gold
  doc.circle(sealX, sealY, 15, 'F');
  doc.setFillColor(253, 252, 248);
  doc.circle(sealX, sealY, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(180, 130, 20);
  doc.text('OFFICIAL SEAL', sealX, sealY - 1, { align: 'center' });
  doc.text('EXCELLENCE', sealX, sealY + 3, { align: 'center' });

  // Left Signature Block
  const sigLineY = 168;
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.5);
  doc.line(35, sigLineY, 95, sigLineY);

  doc.setFont('times', 'italic');
  doc.setFontSize(14);
  doc.setTextColor(24, 43, 73);
  doc.text(cert.signatoryName, 65, sigLineY - 3, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(cert.signatoryName, 65, sigLineY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(cert.signatoryTitle, 65, sigLineY + 9, { align: 'center' });

  // Right Details Block (Dates and Validation)
  doc.setDrawColor(100, 116, 139);
  doc.line(pageWidth - 95, sigLineY, pageWidth - 35, sigLineY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Credential Details', pageWidth - 65, sigLineY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issued: ${cert.issueDate}`, pageWidth - 65, sigLineY + 9, { align: 'center' });
  doc.text(`Intern ID: ${cert.internId}`, pageWidth - 65, sigLineY + 13, { align: 'center' });

  // Bottom Certificate ID & Verification Info
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`CERTIFICATE ID: ${cert.id}`, pageWidth / 2, 192, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Verify online at internflow.ai/verify?id=${cert.id} • Verified Count: ${cert.verifiedCount}`, pageWidth / 2, 196, { align: 'center' });

  return doc;
}
