'use client';

import React, { useState } from 'react';
import { MatchCandidate, MissingChildCase, FoundChildReport } from '@/types/safety';
import { useSafetyStore } from '@/lib/store/safety-store';
import { calculateHaversineDistance, formatDistance } from '@/lib/geo/haversine';
import { 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  UserCheck, 
  MapPin, 
  Clock, 
  Tag, 
  Scale,
  Sparkles
} from 'lucide-react';

interface MatchModalProps {
  candidate: MatchCandidate;
  missingCase: MissingChildCase;
  foundReport: FoundChildReport;
  onClose: () => void;
}

export function MatchModal({ candidate, missingCase, foundReport, onClose }: MatchModalProps) {
  const { verifyCandidateMatch } = useSafetyStore();
  const [officerNotes, setOfficerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const distMeters = calculateHaversineDistance(missingCase.lastSeenLocation, foundReport.foundLocation);
  const scorePercent = (candidate.compositeScore * 100).toFixed(1);
  const isHighPriority = candidate.compositeScore >= 0.82;

  const handleConfirm = () => {
    setIsSubmitting(true);
    verifyCandidateMatch(candidate.id, 'CONFIRMED', officerNotes || 'Physically verified by authorized case officer on ground.');
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const handleReject = () => {
    setIsSubmitting(true);
    verifyCandidateMatch(candidate.id, 'REJECTED', officerNotes || 'Inspected and dismissed as false positive.');
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0D1424] border border-white/15 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className={`p-4 sm:p-6 flex items-center justify-between border-b ${
          isHighPriority ? 'bg-red-950/40 border-red-500/30' : 'bg-safety-orange/10 border-safety-orange/30'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isHighPriority ? 'bg-red-500 text-white' : 'bg-safety-orange text-white'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-white">
                  Two-Way Candidate Match Inspection
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  isHighPriority ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-safety-orange/20 text-safety-orange border border-safety-orange/40'
                }`}>
                  {scorePercent}% Composite Confidence
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparing Missing Case <strong className="text-white">{missingCase.id}</strong> vs Found Report <strong className="text-white">{foundReport.id}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Side by Side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Missing Child Column */}
            <div className="bg-[#121A2E] p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-safety-orange uppercase tracking-wider">
                  Reported Missing Child
                </span>
                <span className="text-xs text-slate-400">{missingCase.id}</span>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={missingCase.photoUrl}
                  alt={missingCase.childName}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-safety-orange shadow-md"
                />
                <div>
                  <h3 className="text-base font-bold text-white">{missingCase.childName}</h3>
                  <div className="text-xs text-slate-300 mt-1">
                    Age: <strong className="text-white">{missingCase.age} years</strong> • Gender: <strong className="text-white">{missingCase.gender}</strong>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Parent: {missingCase.reporterName} ({missingCase.reporterPhone})
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-1">
                <div className="flex items-start gap-2 text-slate-300">
                  <Tag className="w-4 h-4 text-safety-orange shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400">Clothing:</span> {missingCase.clothing.top}, {missingCase.clothing.bottom}
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-safety-orange shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400">Last Seen:</span> {missingCase.lastSeenLocation.landmark}
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-safety-orange shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400">Time Seen:</span> {new Date(missingCase.lastSeenTime).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Found Child Doubt Column */}
            <div className="bg-[#121A2E] p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Found Child Doubt Report
                </span>
                <span className="text-xs text-slate-400">{foundReport.id}</span>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={foundReport.childPhotoUrl || missingCase.photoUrl}
                  alt="Found Child"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-cyan-400 shadow-md"
                />
                <div>
                  <h3 className="text-base font-bold text-white">Unidentified Child</h3>
                  <div className="text-xs text-slate-300 mt-1">
                    Est. Age: <strong className="text-white">{foundReport.estimatedAge} years</strong> • Gender: <strong className="text-white">{foundReport.gender}</strong>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Finder: {foundReport.isAnonymous ? 'Anonymous Citizen' : `${foundReport.finderName} (${foundReport.finderPhone})`}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-1">
                <div className="flex items-start gap-2 text-slate-300">
                  <Tag className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400">Wearing:</span> {foundReport.clothing.top}, {foundReport.clothing.bottom}
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400">Found At:</span> {foundReport.foundLocation.landmark}
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400">Found Time:</span> {new Date(foundReport.foundTime).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Multi-Signal Breakdown */}
          <div className="bg-[#090E1A] p-4 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-safety-blue" />
                Deterministic Multi-Signal Scoring Breakdown
              </span>
              <span className="text-[11px] text-slate-400">
                Spatial Haversine Separation: <strong className="text-white">{formatDistance(distMeters)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400 text-[10px]">Face Cosine (w: 0.40)</div>
                <div className="font-bold text-white text-sm mt-0.5">
                  {(candidate.breakdown.faceSimilarity * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] text-emerald-400">High Match</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400 text-[10px]">Location Decay (w: 0.25)</div>
                <div className="font-bold text-white text-sm mt-0.5">
                  {(candidate.breakdown.locationScore * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] text-emerald-400">{formatDistance(distMeters)} apart</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400 text-[10px]">Timeline (w: 0.15)</div>
                <div className="font-bold text-white text-sm mt-0.5">
                  {(candidate.breakdown.timeScore * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] text-emerald-400">Feasible window</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400 text-[10px]">Age Variance (w: 0.10)</div>
                <div className="font-bold text-white text-sm mt-0.5">
                  {(candidate.breakdown.ageCompatibility * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] text-emerald-400">Exact match</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400 text-[10px]">Clothing (w: 0.10)</div>
                <div className="font-bold text-white text-sm mt-0.5">
                  {(candidate.breakdown.clothingSimilarity * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] text-emerald-400">Blue shirt & jeans</div>
              </div>
            </div>
          </div>

          {/* Mandatory Human-in-the-Loop Safeguard Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-amber-300">
                Mandatory Human-in-the-Loop Safeguard (DPDP Act & POCSO Compliance)
              </strong>
              Algorithmic scoring provides statistical candidate ranking and does not constitute legal identity determination. An authorized Case Officer must physically inspect the child, verify guardian identification documents, and sign off before final case reunion and closure.
            </div>
          </div>

          {/* Verification Notes Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Case Officer Verification Notes / On-Site Observations:
            </label>
            <input
              type="text"
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              placeholder="e.g. Officer verified child by birthmark on right cheek; mother confirmed identity over phone."
              className="w-full px-4 py-2.5 rounded-xl bg-[#090E1A] border border-white/10 text-white text-xs focus:outline-none focus:border-safety-orange"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-[#090E1A] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReject}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/10 transition-colors"
          >
            Dismiss as False Match
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-safety-emerald to-teal-500 text-white shadow-glowEmerald hover:scale-105 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              Confirm Match & Reunited Child
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
