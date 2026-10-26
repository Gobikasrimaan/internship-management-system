import React, { useState, useMemo } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  FileText,
  Award,
  Eye,
  ShieldAlert,
  Search,
  CheckSquare,
  Square,
  Users
} from 'lucide-react';
import { EmailLog, Intern, Certificate, FinalFeedback, SystemSettings } from '../types';
import { api } from '../utils/api';

interface EmailAutomationViewProps {
  emailLogs: EmailLog[];
  interns: Intern[];
  certificates: Certificate[];
  feedbacks: FinalFeedback[];
  settings: SystemSettings;
  onLogsUpdated: (logs: EmailLog[]) => void;
  onOpenPreviewEmail: (intern: Intern) => void;
}

export const EmailAutomationView: React.FC<EmailAutomationViewProps> = ({
  emailLogs,
  interns,
  certificates,
  feedbacks,
  settings,
  onLogsUpdated,
  onOpenPreviewEmail
}) => {
  const [selectedInternIds, setSelectedInternIds] = useState<string[]>([]);
  const [testEmailAddress, setTestEmailAddress] = useState<string>('gobikasrimaan1234@gmail.com');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [isBulkSending, setIsBulkSending] = useState<boolean>(false);
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string>('');
  const [logSearchTerm, setLogSearchTerm] = useState<string>('');

  // Eligible interns who have both Certificate and Approved Feedback
  const eligibleInterns = useMemo(() => {
    return interns.filter(i => {
      const cert = certificates.find(c => c.internId === i.id);
      const fb = feedbacks.find(f => f.internId === i.id);
      return Boolean(cert && fb && fb.mentorApprovalStatus === 'Approved');
    });
  }, [interns, certificates, feedbacks]);

  // Email log statistics
  const totalEligible = eligibleInterns.length;
  const emailsSent = emailLogs.filter(e => e.emailStatus === 'Sent').length;
  const emailsFailed = emailLogs.filter(e => e.emailStatus === 'Failed').length;
  const emailsPending = Math.max(0, totalEligible - emailsSent);

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedInternIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllEligible = () => {
    if (selectedInternIds.length === eligibleInterns.length) {
      setSelectedInternIds([]);
    } else {
      setSelectedInternIds(eligibleInterns.map(i => i.id));
    }
  };

  // Send Test Email
  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      alert('Please enter a valid recipient email address.');
      return;
    }
    setIsSendingTest(true);
    setActionMessage('');
    try {
      const res = await api.sendTestEmail(testEmailAddress);
      setActionMessage(`Test delivery simulated successfully to ${testEmailAddress}. Attachment records registered in Email_Log.`);
      const updatedLogs = await api.getEmailLogs();
      onLogsUpdated(updatedLogs);
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  // Bulk Send Execution
  const executeBulkSend = async () => {
    setShowBulkConfirmModal(false);
    setIsBulkSending(true);
    setActionMessage('');
    try {
      const targetIds = selectedInternIds.length > 0 ? selectedInternIds : undefined;
      const res = await api.bulkSendEmails(targetIds);
      setActionMessage(`Successfully processed email queue for ${res.count} interns with Certificate and Feedback attachments!`);
      const updatedLogs = await api.getEmailLogs();
      onLogsUpdated(updatedLogs);
      setSelectedInternIds([]);
    } catch (err: any) {
      alert(err.message || 'Failed bulk send');
    } finally {
      setIsBulkSending(false);
    }
  };

  // Retry single failed email
  const handleRetryEmail = async (logId: string) => {
    try {
      await api.retryEmail(logId);
      const updatedLogs = await api.getEmailLogs();
      onLogsUpdated(updatedLogs);
      setActionMessage(`Email ${logId} retry succeeded and recorded as Sent.`);
    } catch (err: any) {
      alert(err.message || 'Failed to retry email');
    }
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return emailLogs.filter(log => {
      return (
        log.internName.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
        log.recipientEmail.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
        log.id.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
        log.internId.toLowerCase().includes(logSearchTerm.toLowerCase())
      );
    });
  }, [emailLogs, logSearchTerm]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Automated Email Delivery & Distribution System
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {settings.testMode ? 'Test Delivery Simulation Mode' : 'Live SMTP Active'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automates delivery of verified Completion Certificate PDF and Final Performance Feedback PDF directly to registered interns.
          </p>
        </div>

        {/* Test Email Action Pill */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <input
            type="email"
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
            placeholder="recipient@example.com"
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 w-56 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleSendTestEmail}
            disabled={isSendingTest}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test Email</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage('')} className="text-emerald-700 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Email Dashboard Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Eligible Interns</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{totalEligible}</div>
          <p className="text-xs text-slate-500 mt-1">Both Cert & Feedback approved</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Emails Successfully Sent</span>
          <div className="text-3xl font-black text-emerald-700 mt-1">{emailsSent}</div>
          <p className="text-xs text-slate-500 mt-1">Logged in Sheet 6 (Email_Log)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Deliveries</span>
          <div className="text-3xl font-black text-amber-600 mt-1">{emailsPending}</div>
          <p className="text-xs text-slate-500 mt-1">Awaiting HR bulk dispatch</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Failed / Retries</span>
          <div className="text-3xl font-black text-rose-600 mt-1">{emailsFailed}</div>
          <p className="text-xs text-slate-500 mt-1">Requires safe re-sending</p>
        </div>
      </div>

      {/* Bulk Dispatch & Eligibility Selection Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Certificate & Feedback Email Package Dispatch</h3>
            <p className="text-xs text-slate-500">
              Each email attaches the official <strong className="text-slate-700">Certificate PDF</strong> and <strong className="text-slate-700">Feedback Evaluation PDF</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenPreviewEmail(eligibleInterns[0] || interns[0])}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-300"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Email Template</span>
            </button>

            <button
              onClick={() => setShowBulkConfirmModal(true)}
              disabled={isBulkSending || eligibleInterns.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {selectedInternIds.length > 0
                  ? `Send Email to Selected (${selectedInternIds.length})`
                  : `Send to All Eligible (${eligibleInterns.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Selection List for Eligible Interns */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Eligible Recipients ({eligibleInterns.length})</span>
            </span>
            <button
              onClick={handleSelectAllEligible}
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              {selectedInternIds.length === eligibleInterns.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
            {eligibleInterns.map(i => {
              const isSelected = selectedInternIds.includes(i.id);
              const alreadySent = emailLogs.some(e => e.internId === i.id && e.emailStatus === 'Sent');

              return (
                <div
                  key={i.id}
                  onClick={() => handleToggleSelect(i.id)}
                  className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-indigo-50 border-indigo-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <div className="truncate">
                      <p className="font-bold text-slate-900 truncate">{i.fullName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{i.id} • {i.email}</p>
                    </div>
                  </div>
                  {alreadySent && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0 ml-1">
                      Sent
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Email Delivery Audit Log Table (Sheet 6 Mirror) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Email Delivery Audit Trail (Sheet 6: Email_Log)</h3>
            <p className="text-xs text-slate-500">Live delivery records, timestamps, attached certificates, and error traces</p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Filter email logs..."
              value={logSearchTerm}
              onChange={(e) => setLogSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Email ID</th>
                <th className="py-3 px-4">Intern ID & Name</th>
                <th className="py-3 px-4">Recipient Email</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Attachments</th>
                <th className="py-3 px-4">Sent Date & Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => {
                const isFailed = log.emailStatus === 'Failed';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{log.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{log.internName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.internId}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono">{log.recipientEmail}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{log.emailSubject}</td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      <div>📎 {log.certificateFile}</div>
                      <div>📎 {log.feedbackFile}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {log.sentDateTime.replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        log.emailStatus === 'Sent'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {log.emailStatus}
                      </span>
                      {log.errorMessage && (
                        <div className="text-[10px] text-rose-600 mt-0.5 max-w-xs truncate" title={log.errorMessage}>
                          {log.errorMessage}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isFailed && (
                        <button
                          onClick={() => handleRetryEmail(log.id)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Send Confirmation Modal */}
      {showBulkConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-extrabold text-slate-900 text-lg">Confirm Bulk Email Dispatch</h3>
              <p className="text-xs text-slate-600 mt-1">
                You are about to dispatch official certificate packages to{' '}
                <strong>
                  {selectedInternIds.length > 0 ? selectedInternIds.length : eligibleInterns.length}
                </strong>{' '}
                verified intern recipients.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
              <p className="font-bold flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>HR Approval Safety Check</span>
              </p>
              <p className="mt-0.5 text-[11px] text-amber-700">
                Each email includes individual Certificate PDF and Final Feedback PDF attachments. Duplicate sends are automatically suppressed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBulkConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={executeBulkSend}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Confirm & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
