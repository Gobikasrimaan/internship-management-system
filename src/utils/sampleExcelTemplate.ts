import * as XLSX from 'xlsx';

export function downloadSampleExcelTemplate() {
  const sampleData = [
    {
      'Full Name': 'Alex Rivera',
      'Email Address': 'alex.rivera@example.edu',
      'Phone Number': '+1 (555) 301-4455',
      'Department': 'Full-Stack Engineering',
      'College Name': 'Stanford University',
      'Internship Start Date': '2026-06-01',
      'Internship End Date': '2026-09-30',
      'Status': 'Active'
    },
    {
      'Full Name': 'Elena Rostova',
      'Email Address': 'elena.rostova@example.edu',
      'Phone Number': '+1 (555) 302-8822',
      'Department': 'Artificial Intelligence & ML',
      'College Name': 'MIT',
      'Internship Start Date': '2026-06-01',
      'Internship End Date': '2026-09-30',
      'Status': 'Active'
    },
    {
      'Full Name': 'Devon Vance',
      'Email Address': 'devon.vance@example.edu',
      'Phone Number': '+1 (555) 303-9911',
      'Department': 'Cloud & DevOps',
      'College Name': 'UC Berkeley',
      'Internship Start Date': '2026-06-01',
      'Internship End Date': '2026-09-30',
      'Status': 'Active'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Interns_Template');

  XLSX.writeFile(wb, 'Intern_Import_Template.xlsx');
}
