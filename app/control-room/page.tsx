'use client';

import React, { useState } from 'react';
import { useSafetyStore } from '@/lib/store/safety-store';
import { IncidentMap } from '@/components/maps/incident-map';
import { MatchModal } from '@/components/matching/match-modal';
import { 
  ShieldAlert, 
  Users, 
  Clock, 
  AlertTriangle, 
  Radio, 
  CheckCircle2, 
  ArrowUpRight, 
  Layers, 
  History,
  Activity,
  Heart,
  EyeOff,
  Building2,
  Globe,
  Wifi,
  Send,
  TrendingUp,
  Gauge,
  FileCheck,
  Cpu,
  Video,
  ExternalLink,
  ChevronDown,
  Navigation,
  Brain,
  Sparkles,
  Lock,
  Flame,
  Check
} from 'lucide-react';
import { MatchCandidate, MissingChildCase, FoundChildReport, DroneTelemetry, EscalationScope } from '@/types/safety';
import { getAllCities, getCityConfig } from '@/lib/config/cities';
import { CaseIntelligenceModal } from '@/components/intelligence/case-intelligence-modal';
import { RecommendationDeck } from '@/components/recommendations/recommendation-deck';

export default function ControlRoomDashboard() {
  const { 
    missingCases, 
    foundReports, 
    matchCandidates, 
    volunteerTasks, 
    crowdZones, 
    auditLogs,
    activeSafeRide,
    wanderAlerts,
    witnessReports,
    currentCityId,
    currentCityConfig,
    setCurrentCityId,
    crossCityEscalations,
    droneFeeds,
    integrationHealth,
    predictiveCrowdMetrics,
    incidentPriorities,
    riskSignals,
    safetyPatterns,
    operatorRecommendations,
    caseIntelligenceSummaries,
    privacyHeatmapCells,
    escalateCaseToRed, 
    simulateCrowdSpike,
    resolveWanderAlert,
    escalateCrossCity,
    requestDroneFeed,
    dispatch112Emergency,
    syncCCTNSCase,
    acceptOperatorRecommendation,
    rejectOperatorRecommendation,
    generateCaseIntelligenceSummary
  } = useSafetyStore();

  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>(missingCases[0]?.id);
  const [selectedCandidate, setSelectedCandidate] = useState<MatchCandidate | null>(null);
  const [bottomTab, setBottomTab] = useState<'RECOMMENDATIONS' | 'CROWD' | 'ESCALATIONS' | 'PATTERNS' | 'SAFERIDE' | 'MATCHES' | 'AUDIT'>('RECOMMENDATIONS');

  // Phase 4 states
  const [showPrivacyHeatmap, setShowPrivacyHeatmap] = useState<boolean>(true);
  const [activeIntelligenceCaseId, setActiveIntelligenceCaseId] = useState<string | null>(null);

  // Modals state
  const [activeDroneModal, setActiveDroneModal] = useState<DroneTelemetry | null>(null);
  const [escalatingCase, setEscalatingCase] = useState<MissingChildCase | null>(null);
  const [targetCityChoice, setTargetCityChoice] = useState<string>('mumbai');
  const [escalationReason, setEscalationReason] = useState<string>('');
  const [escalationScope, setEscalationScope] = useState<EscalationScope>('FULL_CASE_DOSSIER');

  // Action status state
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const activeCases = missingCases.filter((c) => c.status === 'SEARCHING' || c.status === 'MATCH_CANDIDATE_FOUND');
  const orangeCases = activeCases.filter((c) => c.severity === 'ORANGE');
  const redCases = activeCases.filter((c) => c.severity === 'RED');

  const allCities = getAllCities();

  // Find associated case & found report for candidate modal
  const activeInspectionCase = selectedCandidate 
    ? missingCases.find((c) => c.id === selectedCandidate.missingCaseId) 
    : null;
  const activeInspectionReport = selectedCandidate 
    ? foundReports.find((r) => r.id === selectedCandidate.foundReportId) 
    : null;

  const handle112Dispatch = async (caseId: string) => {
    setActionFeedback('Dispatching to 112 / ERSS CAD...');
    const res = await dispatch112Emergency(caseId, 'MISSING_PERSON', `Priority child search escalation for case ${caseId}`);
    setActionFeedback(`112 CAD Acknowledged: ${res.externalReferenceId} (${res.latencyMs}ms)`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleCCTNSSync = async (caseId: string) => {
    setActionFeedback('Synchronizing with CCTNS Police Network...');
    const res = await syncCCTNSCase(caseId);
    setActionFeedback(`CCTNS FIR Linked: ${res.cctnsRecordId}`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleOpenDroneFeed = (drone: DroneTelemetry) => {
    requestDroneFeed(drone.id, selectedCaseId || 'GENERAL_PATROL', 'Active aerial perimeter surveillance');
    setActiveDroneModal(drone);
  };

  const handleConfirmEscalation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalatingCase) return;
    escalateCrossCity(escalatingCase.id, targetCityChoice, escalationReason || 'Evidence points to interstate rail/bus departure', escalationScope);
    setEscalatingCase(null);
    setEscalationReason('');
    setActionFeedback(`Case ${escalatingCase.id} successfully escalated to ${getCityConfig(targetCityChoice).name}!`);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Action Notification Banner */}
      {actionFeedback && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-glowCyan animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionFeedback}</span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Gateway Live</span>
        </div>
      )}

      {/* Top Multi-City Tenant Ribbon & Integration Status Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: City Switcher */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-safety-orange/20 border border-safety-orange/40 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-safety-orange" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1.5">
              <span>Jurisdiction Tenant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={currentCityId}
                onChange={(e) => setCurrentCityId(e.target.value)}
                className="bg-[#0B0F19] text-white font-black text-sm sm:text-base rounded-lg px-2.5 py-1 border border-white/20 focus:border-safety-orange focus:outline-none cursor-pointer"
              >
                {allCities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name} ({city.state}, {city.countryCode})
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-400 hidden sm:inline">
                • Emg: <strong className="text-white">{currentCityConfig.emergencyNumber}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Integration Health Chips */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>112 ERSS: <strong>{integrationHealth.erss?.latencyMs}ms</strong></span>
            <span className="text-[9px] px-1 rounded bg-emerald-500/20 font-sans">SIM</span>
          </div>

          <div className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>CCTNS: <strong>{integrationHealth.cctns?.latencyMs}ms</strong></span>
            <span className="text-[9px] px-1 rounded bg-blue-500/20 font-sans">SIM</span>
          </div>

          <button
            onClick={() => handleOpenDroneFeed(droneFeeds[0])}
            className="px-3 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Video className="w-3.5 h-3.5 text-purple-400" />
            <span>GARUDA DRONES: <strong>{droneFeeds.length} ONLINE</strong></span>
          </button>

          <div className="px-3 py-1 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>CARTO GIS: <strong>44ms</strong></span>
          </div>
        </div>
      </div>

      {/* Primary KPI Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-safety-orange">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>CHILD ALERTS</span>
            <span className="w-2 h-2 rounded-full bg-safety-orange animate-ping" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {orangeCases.length + redCases.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {orangeCases.length} Orange • {redCases.length} Red
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>CROSS-CITY CASES</span>
            <ArrowUpRight className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {crossCityEscalations.length}
          </div>
          <div className="text-[11px] text-cyan-400 mt-1">
            Multi-Tenant Delegated
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-pink-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>SAFERIDE MONITORS</span>
            {activeSafeRide?.safetyState === 'RED' && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {activeSafeRide ? 1 : 0}
          </div>
          <div className="text-[11px] text-pink-400 mt-1">
            State: {activeSafeRide?.safetyState || 'None'}
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ELDER WANDER</span>
            <Heart className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {wanderAlerts.filter(a => a.status === 'ACTIVE_SEARCH').length}
          </div>
          <div className="text-[11px] text-purple-400 mt-1">
            Geofence buffer 35m
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>RESPONDERS</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {currentCityConfig.activeRespondersCount}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Jurisdiction Active
          </div>
        </div>
      </div>

      {/* Main Command Center: Interactive Map + Incident Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Interactive GIS Command Map */}
        <div className="lg:col-span-7 flex flex-col space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Geofenced Operational Radar ({currentCityConfig.name})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrivacyHeatmap(!showPrivacyHeatmap)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showPrivacyHeatmap
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                }`}
                title="Toggle 250m x 250m Privacy-Preserving Heatmap with k >= 3 Suppression"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Privacy Grid (k&ge;3)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200">
                  {privacyHeatmapCells.filter(c => !c.isSuppressed).length} Cells
                </span>
              </button>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Zone: {currentCityConfig.erssZoneCode}
              </span>
            </div>
          </div>

          <IncidentMap
            missingCases={missingCases}
            foundReports={foundReports}
            volunteerTasks={volunteerTasks}
            crowdZones={crowdZones}
            privacyHeatmapCells={privacyHeatmapCells}
            showPrivacyHeatmap={showPrivacyHeatmap}
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
                Active Incident Dossiers
              </h2>
            </div>
            <span className="text-xs text-purple-300 font-mono">
              Auto-Ranked by P_score (Safety Floor Enforced)
            </span>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {[...activeCases].sort((a, b) => {
              const pA = incidentPriorities[a.id]?.effectiveScore ?? (a.severity === 'RED' ? 95 : 85);
              const pB = incidentPriorities[b.id]?.effectiveScore ?? (b.severity === 'RED' ? 95 : 85);
              return pB - pA;
            }).map((c) => {
              const isSelected = selectedCaseId === c.id;
              const isRed = c.severity === 'RED';
              const topMatch = matchCandidates.find((m) => m.missingCaseId === c.id && m.compositeScore >= 0.75);
              const priority = incidentPriorities[c.id];
              const score = priority?.effectiveScore ?? (isRed ? 94 : 88);

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
                  {/* Phase 4 Priority & Floor Header Banner */}
                  <div className="mb-2 px-2.5 py-1 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-purple-300">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>P_score: <strong className="text-white text-xs">{score}</strong>/100</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-semibold">
                        Floor &ge; {priority?.isFloorEnforced ? priority.safetyFloor : (priority?.safetyFloor ?? 85)} Enforced
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveIntelligenceCaseId(c.id);
                          generateCaseIntelligenceSummary(c.id);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold flex items-center gap-1 transition-all"
                        title="Open Grounded AI Case Intelligence Dossier"
                      >
                        <Brain className="w-3 h-3" />
                        Intelligence
                      </button>
                    </div>
                  </div>

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
                          Age: <strong className="text-white">{c.age}y</strong> • {c.gender} • #{c.id}
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

                    {topMatch && (
                      <div className="p-2 rounded-xl bg-safety-orange/15 border border-safety-orange/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-safety-orange animate-ping" />
                          <span className="text-xs font-bold text-safety-orange">
                            High Priority Match: {(topMatch.compositeScore * 100).toFixed(1)}%
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCandidate(topMatch);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-black bg-safety-orange hover:bg-orange-600 text-white transition-colors"
                        >
                          Verify Match
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEscalatingCase(c);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        Escalate Cross-City
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handle112Dispatch(c.id);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1"
                      >
                        <Radio className="w-3 h-3" />
                        112 CAD
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCCTNSSync(c.id);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 flex items-center gap-1"
                      >
                        <FileCheck className="w-3 h-3" />
                        CCTNS Sync
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveIntelligenceCaseId(c.id);
                          generateCaseIntelligenceSummary(c.id);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 flex items-center gap-1"
                      >
                        <Brain className="w-3 h-3" />
                        Dossier
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Operational Multi-Tab Control Deck */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-safety-orange" />
            Tactical Operations Deck
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setBottomTab('RECOMMENDATIONS')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                bottomTab === 'RECOMMENDATIONS' ? 'bg-purple-600 text-white shadow-glowPurple' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Recommendations ({operatorRecommendations.filter(r => r.status === 'PENDING_REVIEW' || r.decision === 'PENDING' || r.decision === 'PENDING_REVIEW' || (!r.status && !r.decision)).length})</span>
            </button>

            <button
              onClick={() => setBottomTab('PATTERNS')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                bottomTab === 'PATTERNS' ? 'bg-purple-600 text-white shadow-glowPurple' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-purple-300" />
              <span>Risk Patterns & Signals ({riskSignals.length})</span>
            </button>

            <button
              onClick={() => setBottomTab('CROWD')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                bottomTab === 'CROWD' ? 'bg-safety-orange text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Predictive Crowd Analytics
            </button>

            <button
              onClick={() => setBottomTab('ESCALATIONS')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                bottomTab === 'ESCALATIONS' ? 'bg-safety-orange text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Cross-City Escalations ({crossCityEscalations.length})
            </button>

            <button
              onClick={() => setBottomTab('SAFERIDE')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                bottomTab === 'SAFERIDE' ? 'bg-safety-orange text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>SafeRide HUD</span>
            </button>

            <button
              onClick={() => setBottomTab('MATCHES')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                bottomTab === 'MATCHES' ? 'bg-safety-orange text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Child Matches ({matchCandidates.length})</span>
            </button>

            <button
              onClick={() => setBottomTab('AUDIT')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                bottomTab === 'AUDIT' ? 'bg-safety-orange text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Audit Log ({auditLogs.length})
            </button>
          </div>
        </div>

        {/* Tab: Proactive Operator Recommendations (Phase 4 Human-in-the-Loop) */}
        {bottomTab === 'RECOMMENDATIONS' && (
          <RecommendationDeck
            recommendations={operatorRecommendations}
            onAccept={acceptOperatorRecommendation}
            onReject={rejectOperatorRecommendation}
          />
        )}

        {/* Tab: Spatio-Temporal Risk Patterns & Signals (Phase 4) */}
        {bottomTab === 'PATTERNS' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-blue-950/40 border border-purple-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-purple-300 font-bold">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Continuous Spatio-Temporal Pattern & Risk Engine</span>
              </div>
              <span className="text-slate-400 text-[11px]">
                Haversine Distance Decay + Jaro-Winkler Description Match
              </span>
            </div>

            {/* Proactive Risk Signals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {riskSignals.map((sig) => (
                <div key={sig.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        (sig.severity === 'RED' || sig.level === 'RED') ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        Risk Score: {sig.riskScore || 75}/100
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(sig.detectedAt || sig.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-2 leading-snug">{sig.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{sig.description || sig.evidenceSummary}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px]">
                    <div className="text-purple-300 font-semibold">Recommended Mitigating Action:</div>
                    <div className="text-slate-200 text-xs bg-purple-950/30 p-2 rounded-xl border border-purple-500/20">
                      {sig.recommendedAction}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Predictive Crowd Physics & Congestion Forecasting */}
        {bottomTab === 'CROWD' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span>Multivariate Logistic Congestion Forecaster ($R_{'{cong}'}$ horizon: 15 minutes)</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Fruin LOS Calibration: Normal &le; 1.0 p/m² • Critical &gt; 2.5 p/m²
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crowdZones.map((zone) => {
                const metrics = predictiveCrowdMetrics[zone.id];
                const riskPercent = metrics ? Math.round(metrics.congestionRiskIndex * 100) : Math.round(zone.densityPercentage);
                const isHighRisk = riskPercent >= 70;
                const isCritical = riskPercent >= 85;

                return (
                  <div 
                    key={zone.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCritical
                        ? 'bg-red-500/10 border-red-500/40 shadow-glowOrange'
                        : isHighRisk
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-[#0D1424] border-white/10'
                    } space-y-4`}
                  >
                    {/* Header: Zone & Risk Score */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">{zone.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isCritical ? 'bg-red-500/20 text-red-400' : isHighRisk ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {isCritical ? 'CRITICAL SURGE' : isHighRisk ? 'CONGESTION WARNING' : 'NORMAL CIRCULATION'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Capacity: {zone.capacity.toLocaleString()} persons • Area: {zone.capacity * 0.75} m²
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-black text-white">
                          {riskPercent}%
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">
                          15m Predicted Risk
                        </div>
                      </div>
                    </div>

                    {/* Mathematical Metrics Breakdown */}
                    <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase flex items-center justify-center gap-1">
                          <span>Density (&rho;)</span>
                          <span className="text-[9px] px-1 rounded bg-blue-500/20 text-blue-300">OBSERVED</span>
                        </div>
                        <div className="font-mono font-bold text-white text-sm mt-0.5">
                          {metrics ? metrics.densityPeoplePerSqMeter : (zone.currentCount / (zone.capacity * 0.75)).toFixed(2)} p/m²
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 uppercase flex items-center justify-center gap-1">
                          <span>Velocity (v<sub>&rho;</sub>)</span>
                          <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-300">DERIVED</span>
                        </div>
                        <div className={`font-mono font-bold text-sm mt-0.5 ${metrics && metrics.densityVelocity > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {metrics ? `${metrics.densityVelocity > 0 ? '+' : ''}${metrics.densityVelocity}` : '+0.012'} p/m²s
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 uppercase flex items-center justify-center gap-1">
                          <span>Net Flux (q<sub>net</sub>)</span>
                          <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-300">DERIVED</span>
                        </div>
                        <div className="font-mono font-bold text-white text-sm mt-0.5">
                          {metrics ? `${metrics.netFlowRatePerSec > 0 ? '+' : ''}${metrics.netFlowRatePerSec}` : '+4.2'} p/s
                        </div>
                      </div>
                    </div>

                    {/* Proactive Operational Guidance */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-safety-orange shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Proactive Gate Action:</strong> {metrics?.recommendedAction || zone.recommendation}
                      </div>
                    </div>

                    {/* Simulation Controller */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[11px] text-slate-400 font-mono">
                        Model Confidence: <strong className="text-emerald-400">{metrics ? Math.round(metrics.confidenceScore * 100) : 94}%</strong>
                      </div>
                      <button
                        onClick={() => simulateCrowdSpike(zone.id, Math.min(zone.capacity * 1.15, zone.currentCount + 450))}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-safety-orange hover:bg-orange-600 text-white transition-all flex items-center gap-1"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        Simulate Sudden Inflow Spike
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Cross-City Escalations */}
        {bottomTab === 'ESCALATIONS' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 mb-2">
              Cross-jurisdictional missing-person cases delegated across city control rooms with cryptographic tokens.
            </div>

            {crossCityEscalations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No active cross-city escalations.</div>
            ) : (
              crossCityEscalations.map((esc) => {
                const originConfig = getCityConfig(esc.originCityId);
                const targetConfig = getCityConfig(esc.targetCityId);

                return (
                  <div key={esc.id} className="p-4 rounded-2xl bg-[#0B0F19] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">{esc.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {originConfig.name} &rarr; {targetConfig.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          {esc.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-200">
                        <strong>Incident:</strong> #{esc.incidentId} • Authorized by {esc.authorizedBy}
                      </div>
                      <p className="text-xs text-slate-300 italic">
                        &quot;{esc.reason}&quot;
                      </p>
                      <div className="text-[11px] text-slate-400 font-mono pt-1">
                        Token: {esc.authorizationToken} • Transit Hub: {esc.transitHubRef}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-slate-400">
                        {new Date(esc.escalatedAt).toLocaleDateString()} {new Date(esc.escalatedAt).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-emerald-400 font-bold mt-1">
                        Target City Synced ✓
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab: SafeRide HUD (Phase 2) */}
        {bottomTab === 'SAFERIDE' && (
          <div className="space-y-4">
            {activeSafeRide ? (
              <div className="p-5 rounded-2xl bg-[#0B0F19] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{activeSafeRide.userName}</span>
                      <span className="text-xs text-slate-400">({activeSafeRide.userPhone})</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        activeSafeRide.safetyState === 'RED' ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' :
                        activeSafeRide.safetyState === 'YELLOW' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        STATE: {activeSafeRide.safetyState}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      Route: {activeSafeRide.startLocation.landmark} → {activeSafeRide.destination.landmark}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono text-slate-300">
                      Vehicle: {activeSafeRide.vehicleDetails?.vehicleNumber} ({activeSafeRide.vehicleDetails?.vehicleType})
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Driver: {activeSafeRide.vehicleDetails?.driverName}
                    </div>
                  </div>
                </div>

                {activeSafeRide.anomalyReason && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between">
                    <span>⚠️ {activeSafeRide.anomalyReason}</span>
                    <button
                      onClick={() => alert('Police Mobile Patrol #4 dispatched to intercept vehicle.')}
                      className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                    >
                      Dispatch Patrol Car
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">No active SafeRide journeys at this moment.</div>
            )}
          </div>
        )}

        {/* Tab: Match Queue (Phase 1) */}
        {bottomTab === 'MATCHES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchCandidates.map((cand) => {
              const mCase = missingCases.find((c) => c.id === cand.missingCaseId);
              const fReport = foundReports.find((r) => r.id === cand.foundReportId);
              if (!mCase || !fReport) return null;
              return (
                <div key={cand.id} className="p-4 rounded-2xl bg-[#0D1424] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-safety-orange">{(cand.compositeScore * 100).toFixed(1)}% SCORE</span>
                    <button
                      onClick={() => setSelectedCandidate(cand)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white"
                    >
                      Inspect
                    </button>
                  </div>
                  <div className="text-xs text-slate-300">{mCase.childName} vs Found #{fReport.id}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab: Audit Logs */}
        {bottomTab === 'AUDIT' && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-[#090E1A] border border-white/5 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-safety-orange">{log.action}</span>
                  <span className="text-slate-300">{log.targetType}: {log.targetId}</span>
                </div>
                <span className="text-slate-400 text-[11px]">{log.actorRole}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drone Aerial Surveillance Video HUD Modal */}
      {activeDroneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-3xl w-full glass-panel-elevated p-6 rounded-3xl border border-purple-500/40 space-y-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                  <Video className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <span>{activeDroneModal.callsign} ({activeDroneModal.id})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      LIVE AERIAL STREAM
                    </span>
                  </h3>
                  <div className="text-xs text-slate-400">
                    City: {getCityConfig(activeDroneModal.cityId).name} • Camera: {activeDroneModal.cameraType}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveDroneModal(null)}
                className="text-slate-400 hover:text-white px-3 py-1 rounded-xl bg-white/5"
              >
                Close
              </button>
            </div>

            {/* Simulated Live Video Canvas with HUD Overlays */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 flex items-center justify-center">
              <video
                src={activeDroneModal.streamUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-85"
              />

              {/* HUD Compass & Telemetry Overlay */}
              <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-emerald-300 space-y-0.5">
                <div>ALT: {activeDroneModal.altitudeMeters}m MSL</div>
                <div>SPEED: {activeDroneModal.speedKmh} km/h</div>
                <div>HDG: {activeDroneModal.headingDegrees}&deg; NW</div>
                <div>GIMBAL: {activeDroneModal.gimbalPitchDegrees}&deg;</div>
                <div>BATT: {activeDroneModal.batteryPercent}%</div>
              </div>

              {/* Location Badge */}
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-white flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-purple-400" />
                <span>{activeDroneModal.coordinates.landmark || 'Overhead Sector 1'}</span>
              </div>

              {/* Crosshair Target */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-16 h-16 border border-white/30 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping" />
                </div>
              </div>

              {/* Bottom Privacy Watermark */}
              <div className="absolute bottom-3 left-4 right-4 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-[11px] text-amber-300 flex items-center justify-between">
                <span>🔒 PRIVACY BOUNDARY: Strictly bound to incident {activeDroneModal.assignedIncidentId || 'PATROL-ACTIVE'}. Mass facial tracking disabled.</span>
                <span className="text-slate-400 font-mono">OP: {activeDroneModal.authorizedOperator}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cross-City Escalation Modal */}
      {escalatingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-lg w-full glass-panel-elevated p-6 rounded-3xl border border-cyan-500/40 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">
                  Cross-City Escalation Authorization
                </h3>
              </div>
              <button
                onClick={() => setEscalatingCase(null)}
                className="text-slate-400 hover:text-white px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmEscalation} className="space-y-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                Escalating Case: <strong className="text-white">{escalatingCase.childName}</strong> (#{escalatingCase.id}) from <strong>{currentCityConfig.name}</strong>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Target Destination City:
                </label>
                <select
                  value={targetCityChoice}
                  onChange={(e) => setTargetCityChoice(e.target.value)}
                  className="w-full bg-[#0B0F19] text-white text-xs rounded-xl p-3 border border-white/20 focus:border-cyan-400 focus:outline-none"
                >
                  {allCities.filter(c => c.id !== currentCityId).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Intelligence / Escalation Rationale:
                </label>
                <textarea
                  rows={3}
                  required
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  placeholder="e.g. CCTV sighting indicates child boarded Train #12106 Vidarbha Express towards Mumbai CSMT..."
                  className="w-full bg-[#0B0F19] text-white text-xs rounded-xl p-3 border border-white/20 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Data Sharing Scope:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className={`p-2.5 rounded-xl border cursor-pointer ${
                    escalationScope === 'FULL_CASE_DOSSIER' ? 'bg-cyan-500/20 border-cyan-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="scope"
                      checked={escalationScope === 'FULL_CASE_DOSSIER'}
                      onChange={() => setEscalationScope('FULL_CASE_DOSSIER')}
                      className="mr-2"
                    />
                    Full Case Dossier
                  </label>
                  <label className={`p-2.5 rounded-xl border cursor-pointer ${
                    escalationScope === 'MINIMAL_SEARCH_VECTORS' ? 'bg-cyan-500/20 border-cyan-400 text-white' : 'bg-white/5 border-white/10 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="scope"
                      checked={escalationScope === 'MINIMAL_SEARCH_VECTORS'}
                      onChange={() => setEscalationScope('MINIMAL_SEARCH_VECTORS')}
                      className="mr-2"
                    />
                    Minimal Vectors
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEscalatingCase(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-slate-950 shadow-md font-black"
                >
                  Dispatch Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Verification Modal (Phase 1) */}
      {selectedCandidate && activeInspectionCase && activeInspectionReport && (
        <MatchModal
          candidate={selectedCandidate}
          missingCase={activeInspectionCase}
          foundReport={activeInspectionReport}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {/* Case Intelligence Dossier Modal (Phase 4) */}
      {activeIntelligenceCaseId && (
        <CaseIntelligenceModal
          summary={caseIntelligenceSummaries[activeIntelligenceCaseId] || generateCaseIntelligenceSummary(activeIntelligenceCaseId)}
          incidentCase={missingCases.find(c => c.id === activeIntelligenceCaseId)}
          onClose={() => setActiveIntelligenceCaseId(null)}
          onDispatchAction={(actionText) => {
            setActionFeedback(`Authorized: ${actionText}`);
            setTimeout(() => setActionFeedback(null), 5000);
          }}
        />
      )}
    </div>
  );
}
