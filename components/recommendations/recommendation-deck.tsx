'use client';

import React, { useState } from 'react';
import { OperatorRecommendation } from '@/types/safety';
import { 
  Sparkles, 
  Check, 
  X, 
  AlertCircle, 
  ShieldAlert, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Users, 
  HelpCircle,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

interface RecommendationDeckProps {
  recommendations: OperatorRecommendation[];
  onAccept: (recId: string) => void;
  onReject: (recId: string, reason: string) => void;
}

const PREDEFINED_REJECTION_REASONS = [
  'Resource committed to higher-priority life-critical incident',
  'Ground patrol visual inspection confirmed sector normal',
  'False correlation / transient crowd fluctuation',
  'Sector already reinforced by local police beat van',
  'Shift turnover in progress; deferred to incoming commander'
];

export function RecommendationDeck({
  recommendations,
  onAccept,
  onReject
}: RecommendationDeckProps) {
  const [rejectingRec, setRejectingRec] = useState<OperatorRecommendation | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(PREDEFINED_REJECTION_REASONS[0]);
  const [customFeedback, setCustomFeedback] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('PENDING');

  const isRecPending = (r: OperatorRecommendation) => 
    r.status === 'PENDING_REVIEW' || r.decision === 'PENDING' || r.decision === 'PENDING_REVIEW' || (!r.status && !r.decision);
  const isRecAccepted = (r: OperatorRecommendation) => 
    r.status === 'ACCEPTED' || r.decision === 'ACCEPTED';
  const isRecRejected = (r: OperatorRecommendation) => 
    r.status === 'REJECTED' || r.decision === 'REJECTED';

  const filteredRecs = recommendations.filter((r) => {
    if (activeFilter === 'PENDING') return isRecPending(r);
    if (activeFilter === 'ACCEPTED') return isRecAccepted(r);
    if (activeFilter === 'REJECTED') return isRecRejected(r);
    return true;
  });

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRec) return;
    const finalReason = customFeedback.trim() ? `${selectedReason} - ${customFeedback.trim()}` : selectedReason;
    onReject(rejectingRec.id, finalReason);
    setRejectingRec(null);
    setCustomFeedback('');
  };

  const getTypeBadge = (type?: string) => {
    switch (type) {
      case 'PATROL_REBALANCE':
      case 'REPOSITION_VOLUNTEERS':
        return { label: 'Patrol Rebalance', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'RESOURCE_PRE_STAGE':
      case 'DISPATCH_MOBILE_PATROL':
        return { label: 'Resource Pre-Stage', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'PROACTIVE_ALERT':
      case 'HEIGHTEN_MONITORING':
        return { label: 'Proactive Alert', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      default:
        return { label: type || 'OPERATIONAL', color: 'bg-slate-700/50 text-slate-300 border-slate-600' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Subheader & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-purple-950/20 border border-purple-500/30">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-white font-bold">
            Human-in-the-Loop Operational Recommendations
          </span>
          <span className="text-purple-300 text-[11px] hidden sm:inline">
            (Linear Resource Optimizer + Spatio-Temporal Cluster Engine)
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {(['PENDING', 'ACCEPTED', 'REJECTED', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1 rounded-xl font-bold transition-all text-[11px] ${
                activeFilter === tab
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'PENDING' ? `Pending (${recommendations.filter(isRecPending).length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {filteredRecs.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-2xl border border-white/10 text-slate-400 text-xs">
            No recommendations in <strong className="text-white">{activeFilter}</strong> state.
          </div>
        ) : (
          filteredRecs.map((rec) => {
            const recType = rec.recommendationType || rec.type;
            const badge = getTypeBadge(recType);
            const isPending = isRecPending(rec);
            const isAccepted = isRecAccepted(rec);
            const isRejected = isRecRejected(rec);

            return (
              <div
                key={rec.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isPending
                    ? 'glass-panel border-purple-500/40 hover:border-purple-400 shadow-glass'
                    : isAccepted
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-slate-900/40 border-white/5 opacity-75'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                        Impact: {rec.impactScore || Math.round(rec.confidenceScore * 100)}/100
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isAccepted && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Accepted by {rec.reviewedBy || 'Operator'}
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Dismissed: {rec.rejectionReason || 'Operator choice'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug">
                      {rec.title || rec.headline}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {rec.rationale}
                    </p>

                    {(rec.proposedAction || rec.dataPoints) && (
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200">
                        <strong className="text-purple-300">Action Plan:</strong>{' '}
                        {rec.proposedAction || rec.dataPoints?.join(' • ')}
                      </div>
                    )}

                    {/* Explainability Tags */}
                    {((rec.explainableReasonCodes && rec.explainableReasonCodes.length > 0) || 
                      (rec.dataPoints && rec.dataPoints.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Explainable Drivers:</span>
                        {(rec.explainableReasonCodes || rec.dataPoints || []).map((code, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] bg-purple-900/30 text-purple-200 border border-purple-500/20 font-mono"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>


                  {/* Actions for Pending Recommendation */}
                  {isPending && (
                    <div className="flex md:flex-col items-center gap-2 shrink-0 pt-2 md:pt-0">
                      <button
                        onClick={() => onAccept(rec.id)}
                        className="w-full px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-slate-950 flex items-center justify-center gap-1.5 shadow-glowEmerald transition-all"
                      >
                        <Check className="w-4 h-4" />
                        Accept & Dispatch
                      </button>

                      <button
                        onClick={() => setRejectingRec(rec)}
                        className="w-full px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <X className="w-4 h-4 text-rose-400" />
                        Dismiss / Modify
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Structured Rejection Feedback Modal */}
      {rejectingRec && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0B0F19] border border-white/20 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  Operator Rejection Feedback
                </h3>
              </div>
              <button
                onClick={() => setRejectingRec(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Provide operator feedback for recommendation <strong className="text-white">#{rejectingRec.id}</strong>. This feedback is logged into the model governance registry to calibrate future recommendations.
            </p>

            <form onSubmit={handleConfirmRejection} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Select Structured Reason:
                </label>
                <div className="space-y-1.5">
                  {PREDEFINED_REJECTION_REASONS.map((r, i) => (
                    <label
                      key={i}
                      className={`block p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedReason === r
                          ? 'bg-purple-600/20 border-purple-500 text-white font-semibold'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rejectionReason"
                        checked={selectedReason === r}
                        onChange={() => setSelectedReason(r)}
                        className="mr-2"
                      />
                      {r}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Additional Operator Notes (Optional):
                </label>
                <textarea
                  value={customFeedback}
                  onChange={(e) => setCustomFeedback(e.target.value)}
                  placeholder="e.g., Confirmed with Sector 4 officer via VHF that crowd cleared through Gate 3..."
                  rows={2}
                  className="w-full bg-[#070B14] border border-white/20 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingRec(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-rose-500 hover:bg-rose-600 text-white shadow-md"
                >
                  Confirm Dismissal & Log Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
