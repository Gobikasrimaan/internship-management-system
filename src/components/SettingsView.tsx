import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Shield,
  FileSpreadsheet,
  Download,
  RotateCcw,
  CheckCircle2,
  Mail,
  Building,
  Save,
  AlertTriangle
} from 'lucide-react';
import { SystemSettings } from '../types';
import { api } from '../utils/api';

interface SettingsViewProps {
  settings: SystemSettings;
  onSettingsUpdated: (updated: SystemSettings) => void;
  onDataReset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSettingsUpdated,
  onDataReset
}) => {
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Check weights sum
  const weightsSum =
    Number(formData.weights.taskCompletionRate) +
    Number(formData.weights.averageReviewScore) +
    Number(formData.weights.onTimeCompletionRate);

  const isWeightsValid = weightsSum === 100;

  const handleSave = async () => {
    if (!isWeightsValid) {
      alert(`The weights must sum to exactly 100%. Current sum: ${weightsSum}%`);
      return;
    }

    try {
      const updated = await api.updateSettings(formData);
      onSettingsUpdated(updated);
      setSaveStatus('System configuration saved successfully!');
      setTimeout(() => setSaveStatus(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    }
  };

  const handleResetData = async () => {
    if (!confirm('Are you sure you want to re-seed the full 100 Interns sample dataset? Any unsaved edits will be refreshed to default pristine cohort state.')) {
      return;
    }
    setIsResetting(true);
    try {
      await api.resetData();
      onDataReset();
      setSaveStatus('Database re-seeded successfully with 100 rich intern profiles, milestones, and audit history!');
    } catch (err: any) {
      alert(err.message || 'Failed to reset data');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            System Settings & Enterprise Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure performance scoring formulas, certificate eligibility thresholds, email dispatch modes, and multi-sheet Excel exports.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {saveStatus && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveStatus}</span>
          </div>
          <button onClick={() => setSaveStatus('')} className="text-emerald-700 font-bold">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Performance Scoring Formula Weights */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <h2 className="font-bold text-sm text-slate-900">Performance Evaluation Formula Weights</h2>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isWeightsValid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              Sum: {weightsSum}% {isWeightsValid ? '✓' : '(Must be 100%)'}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Task Completion Rate Weight (%):</span>
                <span className="text-indigo-600">{formData.weights.taskCompletionRate}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.weights.taskCompletionRate}
                onChange={(e) => setFormData({
                  ...formData,
                  weights: { ...formData.weights, taskCompletionRate: parseInt(e.target.value) || 0 }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Average Review Score Weight (%):</span>
                <span className="text-indigo-600">{formData.weights.averageReviewScore}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.weights.averageReviewScore}
                onChange={(e) => setFormData({
                  ...formData,
                  weights: { ...formData.weights, averageReviewScore: parseInt(e.target.value) || 0 }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>On-Time Completion Rate Weight (%):</span>
                <span className="text-indigo-600">{formData.weights.onTimeCompletionRate}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.weights.onTimeCompletionRate}
                onChange={(e) => setFormData({
                  ...formData,
                  weights: { ...formData.weights, onTimeCompletionRate: parseInt(e.target.value) || 0 }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Certificate Eligibility Rules */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-sm text-slate-900">Certificate Eligibility Standards</h2>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.eligibilityRules.requireAllMandatoryTasks}
                onChange={(e) => setFormData({
                  ...formData,
                  eligibilityRules: { ...formData.eligibilityRules, requireAllMandatoryTasks: e.target.checked }
                })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <div>
                <span className="font-bold text-slate-900 block">Require 100% of Mandatory Tasks Approved</span>
                <span className="text-slate-500 text-[11px]">Interns cannot graduate if any mandatory milestone is unresolved.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.eligibilityRules.requireMentorApproval}
                onChange={(e) => setFormData({
                  ...formData,
                  eligibilityRules: { ...formData.eligibilityRules, requireMentorApproval: e.target.checked }
                })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
              <div>
                <span className="font-bold text-slate-900 block">Require Mentor Final Evaluation Signoff</span>
                <span className="text-slate-500 text-[11px]">Mentor must review and approve final performance feedback.</span>
              </div>
            </label>

            <div>
              <span className="font-bold text-slate-700 block mb-1">
                Minimum Score Threshold for Certificate Eligibility:
              </span>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.eligibilityRules.requireMinScore}
                onChange={(e) => setFormData({
                  ...formData,
                  eligibilityRules: { ...formData.eligibilityRules, requireMinScore: parseInt(e.target.value) || 0 }
                })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Company & Signatory Details */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-indigo-600" />
            <h2 className="font-bold text-sm text-slate-900">Certificate Credential Details</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Company / Organization Name:</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Authorized Signatory Name:</label>
              <input
                type="text"
                value={formData.authorizedSignatory}
                onChange={(e) => setFormData({ ...formData, authorizedSignatory: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Authorized Signatory Title:</label>
              <input
                type="text"
                value={formData.signatoryTitle}
                onChange={(e) => setFormData({ ...formData, signatoryTitle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Excel Workbook Export & Reset Operations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-sm text-slate-900">Excel Data Sync & Data Maintenance</h2>
            </div>

            <div className="space-y-3 text-xs mt-3">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                <span className="font-bold block">Intern_Management.xlsx (6 Sheets Included):</span>
                <p className="text-[11px] text-emerald-700 mt-1">
                  1. Interns • 2. Tasks • 3. Reviews • 4. Feedback • 5. Certificates • 6. Email_Log
                </p>
                <a
                  href="/api/export/excel"
                  download="Intern_Management.xlsx"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Live Intern_Management.xlsx</span>
                </a>
              </div>

              {/* Test Mode Toggle */}
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.testMode}
                  onChange={(e) => setFormData({ ...formData, testMode: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
                <div>
                  <span className="font-bold text-slate-900 block">Enable Safe Test Delivery Mode</span>
                  <span className="text-slate-500 text-[11px]">
                    Simulates email dispatch safely without requiring external SMTP configuration.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-rose-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isResetting ? 'Resetting...' : 'Re-seed Full 100 Interns Demo Cohort'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
