'use client';

import React, { useState } from 'react';
import { useSafetyStore } from '@/lib/store/safety-store';
import { IncidentMap } from '@/components/maps/incident-map';
import { MatchModal } from '@/components/matching/match-modal';
import { 
  ShieldAlert, 
  Users, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  Radio, 
  CheckCircle2, 
  ArrowUpRight, 
  Layers, 
  Eye, 
  History,
  Activity
} from 'lucide-react';
import { MatchCandidate, MissingChildCase, FoundChildReport } from '@/types/safety';

export default function ControlRoomDashboard() {
  const { 
    missingCases, 
    foundReports, 
    matchCandidates, 
    volunteerTasks, 
    crowdZones, 
    auditLogs,
    escalateCaseToRed, 
    simulateCrowdSpike 
  } = useSafetyStore();

  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>(missingCases[0]?.id);
  const [selectedCandidate, setSelectedCandidate] = useState<MatchCandidate | null>(null);
  const [bottomTab, setBottomTab] = useState<'MATCHES' | 'CROWD' | 'AUDIT'>('MATCHES');

  const activeCases = missingCases.filter((c) => c.status === 'SEARCHING' || c.status === 'MATCH_CANDIDATE_FOUND');
  const orangeCases = activeCases.filter((c) => c.severity === 'ORANGE');
  const redCases = activeCases.filter((c) => c.severity === 'RED');

  // Find associated case & found report for candidate modal
  const activeInspectionCase = selectedCandidate 
    ? missingCases.find((c) => c.id === selectedCandidate.missingCaseId) 
    : null;
  const activeInspectionReport = selectedCandidate 
    ? foundReports.find((r) => r.id === selectedCandidate.foundReportId) 
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Stat Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-safety-orange">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ORANGE ALERTS</span>
            <span className="w-2 h-2 rounded-full bg-safety-orange animate-ping" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {orangeCases.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Search radius: 2.0 km active
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-red-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>RED ALERTS (ESCALATED)</span>
            {redCases.length > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {redCases.length}
          </div>
          <div className="text-[11px] text-red-400 mt-1">
            Expanded 3.5 km perimeter
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-safety-emerald">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ACTIVE VOLUNTEER MESH</span>
            <Users className="w-4 h-4 text-safety-emerald" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {volunteerTasks.length + 18}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Avg ping latency: 3.4s
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-safety-yellow">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>DEEKSHA BHOOMI DENSITY</span>
            <Activity className="w-4 h-4 text-safety-yellow" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {crowdZones[0]?.densityPercentage}%
          </div>
          <div className="text-[11px] text-amber-400 mt-1 truncate">
            {crowdZones[0]?.name}: {crowdZones[0]?.thresholdLevel}
          </div>
        </div>
      </div>

      {/* Main Command Center: Map + Incident Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Interactive GIS Command Map */}
        <div className="lg:col-span-7 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Geofenced Operational Radar
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Center: Deeksha Bhoomi Stupa (21.1255° N, 79.0558° E)
            </span>
          </div>

          <IncidentMap
            missingCases={missingCases}
            foundReports={foundReports}
            volunteerTasks={volunteerTasks}
            crowdZones={crowdZones}
            selectedCaseId={selectedCaseId}
            onSelectCase={(id) => setSelectedCaseId(id)}
            heightClass="h-[480px] lg:h-[580px]"
          />
        </div>

        {/* Right 5 Columns: Incident Priority Queue */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-safety-orange" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Incident Response Queue
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {activeCases.length} Active Cases
            </span>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {activeCases.map((c) => {
              const isSelected = selectedCaseId === c.id;
              const isRed = c.severity === 'RED';
              const topMatch = matchCandidates.find((m) => m.missingCaseId === c.id && m.compositeScore >= 0.75);

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'glass-panel-elevated border-safety-orange shadow-glowOrange'
                      : 'glass-panel border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.photoUrl}
                        alt={c.childName}
                        className="w-14 h-14 rounded-xl object-cover border border-white/20"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">{c.childName}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isRed ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-safety-orange/20 text-safety-orange border border-safety-orange/30'
                          }`}>
                            {c.severity} ALERT
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5">
                          Age: <strong className="text-white">{c.age}y</strong> • {c.gender} • Case #{c.id}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Seen: {c.lastSeenLocation.landmark}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(c.lastSeenTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                        {c.assignedVolunteersCount} Volunteers Active
                      </div>
                    </div>
                  </div>

                  {/* Garment Details & Top Match Alert */}
                  <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2">
                    <div className="text-xs text-slate-300 flex items-center justify-between">
                      <span className="truncate max-w-[280px]">
                        <strong>Clothing:</strong> {c.clothing.top}, {c.clothing.bottom}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300">
                        {c.searchRadiusMeters}m Zone
                      </span>
                    </div>

                    {/* Auto-Pinned High Confidence Match Banner */}
                    {topMatch && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidate(topMatch);
                        }}
                        className="p-2 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/40 flex items-center justify-between hover:border-cyan-400 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                          <span className="text-xs font-bold text-cyan-300">
                            Candidate Match {(topMatch.compositeScore * 100).toFixed(0)}% Found!
                          </span>
                        </div>
                        <button className="text-[10px] font-bold text-white bg-cyan-600 hover:bg-cyan-500 px-2 py-1 rounded-lg">
                          Inspect
                        </button>
                      </div>
                    )}

                    {/* Quick Escalation Button */}
                    {!isRed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          escalateCaseToRed(c.id, 'Operator manual escalation due to gathering density');
                        }}
                        className="w-full mt-1 py-1.5 rounded-xl text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Escalate to Red Alert (Expand to 3.5 km)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Command Panels: Tabs (Match Candidates Queue, Crowd Density, Audit Trail) */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/10 space-y-4">
        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBottomTab('MATCHES')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                bottomTab === 'MATCHES'
                  ? 'bg-safety-orange text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Two-Way Match Queue ({matchCandidates.length})
            </button>
            <button
              onClick={() => setBottomTab('CROWD')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                bottomTab === 'CROWD'
                  ? 'bg-safety-orange text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              Crowd Density Zones ({crowdZones.length})
            </button>
            <button
              onClick={() => setBottomTab('AUDIT')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                bottomTab === 'AUDIT'
                  ? 'bg-safety-orange text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-4 h-4" />
              Immutable Audit Log ({auditLogs.length})
            </button>
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Deterministic Evaluation • Multi-Signal Pipeline
          </span>
        </div>

        {/* Tab 1: Match Candidates Queue */}
        {bottomTab === 'MATCHES' && (
          <div className="space-y-3">
            {matchCandidates.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No active candidate matches generated yet. As found reports or missing cases are filed, candidates will appear here.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchCandidates.map((cand) => {
                  const mCase = missingCases.find((c) => c.id === cand.missingCaseId);
                  const fReport = foundReports.find((r) => r.id === cand.foundReportId);
                  if (!mCase || !fReport) return null;

                  const isHigh = cand.compositeScore >= 0.82;

                  return (
                    <div
                      key={cand.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isHigh
                          ? 'bg-red-950/20 border-red-500/40 shadow-glowRed'
                          : 'bg-[#0D1424] border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isHigh ? 'bg-red-500/30 text-red-300' : 'bg-safety-orange/30 text-safety-orange'
                        }`}>
                          {(cand.compositeScore * 100).toFixed(1)}% SCORE
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {cand.decision === 'CONFIRMED' ? (
                            <span className="text-emerald-400 font-bold">REUNITED ✓</span>
                          ) : (
                            'PENDING REVIEW'
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={mCase.photoUrl}
                            alt="Missing"
                            className="w-12 h-12 rounded-xl object-cover border border-white/20"
                          />
                          <div>
                            <div className="text-xs font-bold text-white">{mCase.childName}</div>
                            <div className="text-[10px] text-slate-400">{mCase.id}</div>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-slate-500">VS</span>

                        <div className="flex items-center gap-2">
                          <div>
                            <div className="text-xs font-bold text-white text-right">
                              Found Child
                            </div>
                            <div className="text-[10px] text-slate-400 text-right">{fReport.id}</div>
                          </div>
                          <img
                            src={fReport.childPhotoUrl || mCase.photoUrl}
                            alt="Found"
                            className="w-12 h-12 rounded-xl object-cover border border-cyan-400/40"
                          />
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                        <div className="text-[10px] text-slate-400">
                          Face: {(cand.breakdown.faceSimilarity * 100).toFixed(0)}% • Loc: {(cand.breakdown.locationScore * 100).toFixed(0)}%
                        </div>
                        <button
                          onClick={() => setSelectedCandidate(cand)}
                          className="px-3 py-1 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                          Inspect & Verify
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Crowd Density Zones */}
        {bottomTab === 'CROWD' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {crowdZones.map((zone) => {
                const isCrit = zone.densityPercentage >= 85;
                const isElev = zone.densityPercentage >= 70 && !isCrit;

                return (
                  <div
                    key={zone.id}
                    className={`p-4 rounded-2xl border ${
                      isCrit ? 'bg-red-950/20 border-red-500/40' : isElev ? 'bg-amber-950/20 border-amber-500/40' : 'bg-[#0D1424] border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{zone.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 font-mono text-slate-300">
                        {zone.provenance}
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-2xl font-black text-white">
                        {zone.densityPercentage}%
                      </span>
                      <span className="text-xs text-slate-400">
                        {zone.currentCount} / {zone.capacity}
                      </span>
                    </div>

                    {/* Density Meter Bar */}
                    <div className="w-full h-2 rounded-full bg-white/10 mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCrit ? 'bg-red-500' : isElev ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, zone.densityPercentage)}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-slate-400 mt-2 italic leading-relaxed">
                      {zone.recommendation}
                    </p>

                    {/* Drill simulator trigger */}
                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => simulateCrowdSpike(zone.id, Math.round(zone.capacity * 0.96))}
                        className="text-[10px] font-semibold text-red-400 hover:text-red-300"
                      >
                        Simulate Surge (96%)
                      </button>
                      <button
                        onClick={() => simulateCrowdSpike(zone.id, Math.round(zone.capacity * 0.60))}
                        className="text-[10px] font-semibold text-slate-400 hover:text-slate-300"
                      >
                        Reset (60%)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Immutable Audit Logs */}
        {bottomTab === 'AUDIT' && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#090E1A] border border-white/5 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-safety-orange">
                    {log.action}
                  </span>
                  <span className="text-slate-300 truncate max-w-sm">
                    {log.targetType}: {log.targetId}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 hidden sm:block">
                  Actor: {log.actorRole} ({log.actorId})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidate Inspection Modal */}
      {selectedCandidate && activeInspectionCase && activeInspectionReport && (
        <MatchModal
          candidate={selectedCandidate}
          missingCase={activeInspectionCase}
          foundReport={activeInspectionReport}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}
