'use client';

import React from 'react';
import { CaseIntelligenceSummary, MissingChildCase } from '@/types/safety';
import { 
  Brain, 
  X, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Radio, 
  Eye, 
  Compass, 
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';

interface CaseIntelligenceModalProps {
  summary: CaseIntelligenceSummary;
  incidentCase?: MissingChildCase;
  onClose: () => void;
  onDispatchAction?: (actionText: string) => void;
}

export function CaseIntelligenceModal({
  summary,
  incidentCase,
  onClose,
  onDispatchAction
}: CaseIntelligenceModalProps) {
  const getSourceBadge = (source?: string) => {
    switch (source) {
      case 'OFFICIAL_CAD':
      case 'CAD_112':
        return { label: '112 CAD Verified', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'FAMILY_REPORT':
        return { label: 'Guardian Primary', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'WITNESS_REPORT':
      case 'CITIZEN_REPORT':
        return { label: 'Witness Sighting', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'DRONE_SCAN':
      case 'DRONE_PATROL':
        return { label: 'Garuda Aerial Scan', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'MESH_BROADCAST':
      case 'VOLUNTEER_TASK':
        return { label: 'Mesh Geofence Delivery', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      default:
        return { label: source || 'TELEMETRY', color: 'bg-slate-700/50 text-slate-300 border-slate-600' };
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0B0F19] border border-purple-500/30 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-[#0B0F19] to-cyan-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shadow-glowPurple">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Case Intelligence Dossier: {summary.caseId}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Synthesized AI Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Subject: <strong className="text-white">{incidentCase?.childName || 'Active Case'}</strong> • Verified Against Multi-Source Telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Overall Confidence</div>
              <div className="text-xl sm:text-2xl font-black text-purple-300 mt-1">
                {(summary.confidenceMetrics.overallConfidence * 100).toFixed(0)}%
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">High Reliability</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Timeline Coverage</div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                {(summary.confidenceMetrics.timelineCoverageScore * 100).toFixed(0)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{summary.groundedTimeline.length} events logged</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Source Diversity</div>
              <div className="text-xl sm:text-2xl font-black text-cyan-400 mt-1">
                {(summary.confidenceMetrics.sourceDiversityScore * 100).toFixed(0)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">CAD, Family & Witness</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Spatial Consistency</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                {(summary.confidenceMetrics.spatialConsistencyScore * 100).toFixed(0)}%
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Within 600m radius</div>
            </div>
          </div>

          {/* Corroborated Hypotheses */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Corroborated Investigation Hypotheses</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {summary.corroboratedHypotheses.map((hyp, i) => (
                <div key={i} className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white leading-snug">{hyp.hypothesis}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/30 text-purple-300 border border-purple-500/40 shrink-0">
                        {(hyp.confidence * 100).toFixed(0)}% Conf
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{hyp.rationale}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-emerald-400">✓ {hyp.supportingEvidenceCount} Supporting Signals</span>
                    <span className="text-slate-500">✗ {hyp.conflictingEvidenceCount} Conflicts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grounded Chronological Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Grounded Multi-Source Timeline</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Synthesized at {new Date(summary.lastSynthesizedAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="space-y-2 border-l-2 border-purple-500/30 pl-4 ml-2">
              {summary.groundedTimeline.map((item) => {
                const badge = getSourceBadge(item.source);
                return (
                  <div key={item.id} className="relative group">
                    <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-purple-500 border-2 border-[#0B0F19]" />
                    <div className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1.5">{item.event}</p>
                      {item.coordinates?.landmark && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          <span>{item.coordinates.landmark}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Next Operational Steps */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Recommended Next Operational Actions</span>
            </div>

            <ul className="space-y-2">
              {summary.recommendedNextSteps.map((step, idx) => (
                <li key={idx} className="flex items-start justify-between gap-3 text-xs text-slate-200 p-2 rounded-xl bg-black/30 border border-white/5">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                  {onDispatchAction && (
                    <button
                      onClick={() => onDispatchAction(step)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 shrink-0 transition-colors"
                    >
                      Authorize Action
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            Model ID: <code>MEHFUS-PRIORITY-SCORER-V1</code> • Zero PII Leakage
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
