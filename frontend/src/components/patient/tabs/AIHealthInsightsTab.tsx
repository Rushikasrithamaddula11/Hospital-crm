import React from 'react';
import { Bot, AlertTriangle, Sparkles, Activity, ShieldCheck, HeartPulse } from 'lucide-react';
import { Patient } from '../../../types/patient';

interface AIHealthInsightsTabProps {
  patient: Patient;
}

export const AIHealthInsightsTab: React.FC<AIHealthInsightsTabProps> = ({ patient }) => {
  return (
    <div className="space-y-6">
      {/* Required Disclaimer Alert Box */}
      <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-5 text-amber-950 space-y-2 shadow-2xs">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Clinical Decision Support Disclaimer</span>
        </div>
        <p className="text-xs text-amber-900 leading-relaxed font-medium">
          ⚠ AI-generated information is for clinical review and decision support only. It does not replace a qualified healthcare professional. Autonomous diagnosis is explicitly prohibited under hospital governance.
        </p>
      </div>

      {/* Main AI Health Insights Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-medical-600 text-white flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                AI Health Insights
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200 uppercase">
                  Preview Integration
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Future-ready intelligence placeholder for hospital-approved AI model services
              </p>
            </div>
          </div>
        </div>

        {/* Demo Data Insights Panel */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Sample Clinical Decision Support Insights (Demo Data)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Insight Card 1 */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-medical-600" />
                  Vitals & Trend Summary
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  DEMO DATA
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Patient {patient.first_name} {patient.last_name} maintains consistent vitals across recent consultations. BP records average 122/80 mmHg over the last 30 days.
              </p>
            </div>

            {/* Insight Card 2 */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  Preventive Follow-up Alert
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  DEMO DATA
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Annual routine cholesterol and lipid profile evaluation is recommended based on age group ({patient.age} yrs) and historical visit frequency.
              </p>
            </div>
          </div>
        </div>

        {/* Architecture Connection Specs */}
        <div className="bg-slate-900 text-slate-300 p-5 rounded-xl border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AI Module Architecture Specification</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            When Module 9 (AI Monitoring) is activated, secure HIPAA-compliant REST / gRPC webhooks will deliver automated risk stratification, LLM consultation summaries, and lab trend anomalies directly into this view.
          </p>
        </div>
      </div>
    </div>
  );
};
