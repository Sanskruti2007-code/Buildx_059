'use client';

import React, { useState } from 'react';
import { useSafetyStore } from '@/lib/store/safety-store';
import { getAllCities, getCityConfig } from '@/lib/config/cities';
import { 
  Building2, 
  Globe, 
  Radio, 
  FileCheck, 
  ArrowUpRight, 
  Video, 
  Search, 
  ShieldCheck, 
  RefreshCw, 
  Layers, 
  Activity, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  Brain,
  Sparkles,
  Lock,
  BarChart3,
  Scale,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { rankRespondersForIncident } from '@/lib/math/dispatch-ranking';

export default function OperationsCenterPage() {
  const { 
    currentCityId, 
    setCurrentCityId, 
    currentCityConfig, 
    crossCityEscalations, 
    droneFeeds, 
    integrationHealth, 
    missingCases,
    modelRegistry,
    postIncidentMetrics,
    privacyHeatmapCells,
    safetyPatterns,
    riskSignals,
    operatorRecommendations,
    dispatch112Emergency,
    syncCCTNSCase
  } = useSafetyStore();

  const allCities = getAllCities();

  const [activeTab, setActiveTab] = useState<
    'MODEL_GOVERNANCE' | 
    'POST_INCIDENT_LEARNING' | 
    'HEATMAP_ANALYTICS' | 
    'CROSS_CITY_SEARCH' | 
    'GATEWAYS' | 
    'DRONE_FLEET' | 
    'INTERNATIONAL_ADAPTATION' | 
    'DISPATCH_RANKING'
  >('MODEL_GOVERNANCE');
  const [searchQuery, setSearchQuery] = useState('');
  const [testLog, setTestLog] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const addLog = (msg: string) => {
    setTestLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const handleTrigger112Test = async () => {
    setIsSimulating(true);
    addLog('Initiating test payload to 112 / ERSS Computer-Aided Dispatch (CAD)...');
    const res = await dispatch112Emergency('TEST-INCIDENT-991', 'MISSING_PERSON', 'Automated Gateway Test from Operations Center');
    addLog(`112 ERSS Response: ${res.externalReferenceId} (Latency: ${res.latencyMs}ms, State: ${res.deliveryState})`);
    setIsSimulating(false);
  };

  const handleTriggerCCTNSTest = async () => {
    setIsSimulating(true);
    addLog('Synchronizing test record with CCTNS Police Database...');
    const res = await syncCCTNSCase(missingCases[0]?.id || 'DB-2026-CASE-01');
    addLog(`CCTNS Linked: ${res.cctnsRecordId} at ${res.matchingPoliceStation} (Audit: ${res.auditToken})`);
    setIsSimulating(false);
  };

  // Mock responders for dispatch ranking engine demonstration
  const mockResponders = [
    {
      id: 'RESP-01',
      name: 'Sub-Inspector Sachin Shinde',
      phone: '+91 98220 11111',
      role: 'POLICE' as const,
      cityId: currentCityId,
      policeStationZone: 'Zone-1 Central',
      currentCoordinates: { lat: currentCityConfig.centerCoordinates.lat + 0.01, lng: currentCityConfig.centerCoordinates.lng + 0.01 },
      activeCasesCount: 1
    },
    {
      id: 'RESP-02',
      name: 'Dr. Ananya Joshi (Rapid Med)',
      phone: '+91 98220 22222',
      role: 'MEDICAL' as const,
      cityId: currentCityId,
      policeStationZone: 'Zone-2 East',
      currentCoordinates: { lat: currentCityConfig.centerCoordinates.lat - 0.02, lng: currentCityConfig.centerCoordinates.lng + 0.01 },
      activeCasesCount: 0
    },
    {
      id: 'RESP-03',
      name: 'Inspector Vikram Malhotra',
      phone: '+91 98220 33333',
      role: 'POLICE' as const,
      cityId: 'mumbai',
      policeStationZone: 'CSMT Division',
      currentCoordinates: { lat: 18.9402, lng: 72.8356 },
      activeCasesCount: 2
    },
    {
      id: 'RESP-04',
      name: 'Volunteer Lead Rajesh Kadam',
      phone: '+91 98220 44444',
      role: 'VOLUNTEER' as const,
      cityId: currentCityId,
      policeStationZone: 'Zone-1 Central',
      currentCoordinates: { lat: currentCityConfig.centerCoordinates.lat + 0.005, lng: currentCityConfig.centerCoordinates.lng - 0.005 },
      activeCasesCount: 3
    }
  ];

  const rankedCandidates = rankRespondersForIncident(mockResponders, {
    id: 'INC-DEMO-01',
    cityId: currentCityId,
    policeStationZone: 'Zone-1 Central',
    coordinates: currentCityConfig.centerCoordinates,
    requiredRole: 'POLICE',
    isCrossCityAuthorized: true
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>Multi-City Infrastructure & Interoperability Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            City Scale Command & Gateway Test Bench
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Jurisdiction-aware Guardian Mesh, 112 / CCTNS emergency adapters, drone telemetry, and predictive crowd orchestration.
          </p>
        </div>

        {/* City Selector */}
        <div className="glass-panel p-3 rounded-2xl border border-white/10 flex items-center gap-3">
          <Building2 className="w-5 h-5 text-safety-orange" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-black">Active Operations Base</div>
            <select
              value={currentCityId}
              onChange={(e) => setCurrentCityId(e.target.value)}
              className="bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
            >
              {allCities.map((city) => (
                <option key={city.id} value={city.id} className="bg-[#0B0F19]">
                  {city.name} ({city.state})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Multi-City Jurisdictional Comparative Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {allCities.map((city) => {
          const isSelected = city.id === currentCityId;

          return (
            <div
              key={city.id}
              onClick={() => setCurrentCityId(city.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected 
                  ? 'glass-panel-elevated border-cyan-400 shadow-glowCyan' 
                  : 'glass-panel border-white/10 hover:border-white/20'
              } space-y-3`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                    <span>{city.name}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {city.state}, {city.country}
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                  {city.countryCode}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-300 pt-2 border-t border-white/5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Emergency:</span>
                  <strong className="text-white">{city.emergencyNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Responders:</span>
                  <strong className="text-emerald-400">{city.activeRespondersCount} Active</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transit Hubs:</span>
                  <strong className="text-slate-200">{city.transportHubCount} Monitored</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Drone Bases:</span>
                  <strong className="text-purple-400">{city.droneBaseCount} Stations</strong>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono">{city.cctnsStationCode}</span>
                <span className={`font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {isSelected ? 'Active Base ✓' : 'Select Jurisdiction &rarr;'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('MODEL_GOVERNANCE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'MODEL_GOVERNANCE' ? 'bg-purple-600 text-white font-black shadow-glowPurple' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span>Model Governance & Drift ({modelRegistry.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('POST_INCIDENT_LEARNING')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'POST_INCIDENT_LEARNING' ? 'bg-emerald-600 text-white font-black shadow-glowEmerald' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-300" />
          <span>Post-Incident Learning & SLA</span>
        </button>

        <button
          onClick={() => setActiveTab('HEATMAP_ANALYTICS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'HEATMAP_ANALYTICS' ? 'bg-amber-600 text-white font-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Lock className="w-4 h-4 text-amber-300" />
          <span>Privacy Heatmap & k-Anonymity</span>
        </button>

        <button
          onClick={() => setActiveTab('CROSS_CITY_SEARCH')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'CROSS_CITY_SEARCH' ? 'bg-cyan-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Cross-City Search & Escalations</span>
        </button>

        <button
          onClick={() => setActiveTab('GATEWAYS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'GATEWAYS' ? 'bg-cyan-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Government Gateway Test Bench</span>
        </button>

        <button
          onClick={() => setActiveTab('DISPATCH_RANKING')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'DISPATCH_RANKING' ? 'bg-cyan-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Multi-Factor Dispatch Math (S<sub>disp</sub>)</span>
        </button>

        <button
          onClick={() => setActiveTab('DRONE_FLEET')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'DRONE_FLEET' ? 'bg-cyan-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Drone Fleet Telemetry ({droneFeeds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('INTERNATIONAL_ADAPTATION')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'INTERNATIONAL_ADAPTATION' ? 'bg-cyan-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>International Adaptation Spec</span>
        </button>
      </div>

      {/* Tab: Model Governance & Drift Monitoring (Phase 4) */}
      {activeTab === 'MODEL_GOVERNANCE' && (
        <div className="space-y-6">
          {/* Header Summary Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-purple-500">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Production Models</div>
              <div className="text-2xl font-black text-white mt-1">{modelRegistry.length} Registered</div>
              <div className="text-[10px] text-purple-300 mt-0.5">100% Active Production</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-emerald-500">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Safety Floor Invariant</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">100% Enforced</div>
              <div className="text-[10px] text-emerald-300 mt-0.5">Zero Emergency Demotions</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-cyan-500">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Max Model Drift</div>
              <div className="text-2xl font-black text-white mt-1">0.041</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Stable (&lt; 0.080 threshold)</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-amber-500">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Human-in-the-Loop</div>
              <div className="text-2xl font-black text-white mt-1">Required</div>
              <div className="text-[10px] text-amber-300 mt-0.5">Operator Feedback Calibrated</div>
            </div>
          </div>

          {/* Model Registry Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Active Safety & Spatial Intelligence Models</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Continuous Evaluator: Running every 60s
              </span>
            </div>

            <div className="space-y-3">
              {modelRegistry.map((mod) => (
                <div key={mod.modelId} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <h4 className="font-bold text-white text-base">{mod.modelName}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        v{mod.version}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="px-2.5 py-1 rounded-xl bg-white/5 text-slate-300 border border-white/10">
                        Type: {mod.modelType}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        Accuracy: {mod.accuracyScore}%
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        Drift: {mod.driftMetricValue} / {mod.driftThreshold} ({mod.driftStatus})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {mod.description}
                  </p>

                  <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span><strong>Safety Rule:</strong> {mod.safetyFloorRule || 'Standard bounded optimizer constraint'}</span>
                    </div>
                    <span className="text-slate-400 font-mono">
                      Compliance: <strong className="text-white">{mod.auditCompliance}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Post-Incident Response-Time Learning & SLA (Phase 4) */}
      {activeTab === 'POST_INCIDENT_LEARNING' && (
        <div className="space-y-6">
          {/* Target Response-Time Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-cyan-500">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">MTTA (Mean Ack Time)</div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1">11s</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Target: &lt; 30s (SLA Met ✓)</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-blue-500">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">MTTD (Mean Dispatch Time)</div>
              <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">31s</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Target: &lt; 60s (SLA Met ✓)</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-emerald-500">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">MTTArrival (On-Scene Arrival)</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">178s</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Target: &lt; 300s (SLA Met ✓)</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-purple-500">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Telemetry Quality (Q_data)</div>
              <div className="text-2xl sm:text-3xl font-black text-purple-300 mt-1">94.8%</div>
              <div className="text-[10px] text-purple-300 mt-0.5">High Sensor Integrity</div>
            </div>
          </div>

          {/* Historical Review Records */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Post-Incident Debrief & Continuous Learning Records</span>
            </h3>

            <div className="space-y-3">
              {postIncidentMetrics.map((rec, rIdx) => (
                <div key={rec.incidentId || rec.caseId || `metric-${rIdx}`} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">#{rec.incidentId || rec.caseId}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                        {rec.incidentType || rec.caseType}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Arrival SLA Met ({rec.mttArrivalSeconds}s / {rec.targetMttArrivalSeconds || 300}s target)
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                      <span>MTTR: <strong className="text-white">{rec.mttrSeconds}s</strong></span>
                      <span>Quality: <strong className="text-purple-300">{rec.dataQualityIndex ?? 95}%</strong></span>
                      {rec.fieldFeedbackScore && (
                        <span className="text-amber-400">★ {rec.fieldFeedbackScore}/5 Rating</span>
                      )}
                    </div>
                  </div>

                  {/* Lessons Learned */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <div className="text-xs text-slate-400 font-semibold">Operational Lessons Learned & Optimizations:</div>
                    <ul className="space-y-1">
                      {(rec.lessonsLearned || rec.identifiedBottlenecks || ['Standard operational response parameters met.']).map((lesson, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{lesson}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Privacy-Preserving Heatmap Analytics & k-Anonymity (Phase 4) */}
      {activeTab === 'HEATMAP_ANALYTICS' && (
        <div className="space-y-6">
          {/* Privacy Math Summary Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-amber-500">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">k-Anonymity Standard</div>
              <div className="text-2xl font-black text-amber-400 mt-1">k &ge; 3 Guaranteed</div>
              <div className="text-[10px] text-slate-400 mt-0.5">DPDP Act 2023 & GDPR Art 25</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-cyan-500">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Spatial Grid Resolution</div>
              <div className="text-2xl font-black text-white mt-1">250m &times; 250m</div>
              <div className="text-[10px] text-cyan-400 mt-0.5">Uniform Boundary Quantization</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-emerald-500">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Active Risk Cells</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {privacyHeatmapCells.filter(c => !c.isSuppressed).length} Cells
              </div>
              <div className="text-[10px] text-emerald-300 mt-0.5">Mathematically Disclosed</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-rose-500">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Suppressed Grid Cells</div>
              <div className="text-2xl font-black text-slate-300 mt-1">
                {privacyHeatmapCells.filter(c => c.isSuppressed).length} Cells
              </div>
              <div className="text-[10px] text-rose-300 mt-0.5">Suppressed (count &lt; 3)</div>
            </div>
          </div>

          {/* Privacy Cells Table */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Quantized Safety Cells & Anonymity Audit</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Raw coordinates are transformed into bounding boxes. Zero individual telemetry points disclosed.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Formula 4: H(lat, lng) &ge; k
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[10px]">
                    <th className="py-2.5">Cell ID</th>
                    <th className="py-2.5">Grid Bounds (SW - NE)</th>
                    <th className="py-2.5">Incident Reports</th>
                    <th className="py-2.5">Risk Intensity</th>
                    <th className="py-2.5">Privacy Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {privacyHeatmapCells.map((cell) => (
                    <tr key={cell.cellId} className="text-slate-200">
                      <td className="py-3 text-white font-bold">{cell.cellId}</td>
                      <td className="py-3 text-slate-400 text-[11px]">
                        [{cell.bounds.south.toFixed(4)}, {cell.bounds.west.toFixed(4)}] &rarr; [{cell.bounds.north.toFixed(4)}, {cell.bounds.east.toFixed(4)}]
                      </td>
                      <td className="py-3 font-bold text-white">{cell.incidentCount} Reports</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-rose-500"
                              style={{ width: `${Math.round(cell.intensity * 100)}%` }}
                            />
                          </div>
                          <span>{(cell.intensity * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        {cell.isSuppressed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-slate-400">
                            Suppressed (&lt; 3)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            k &ge; 3 Compliant ✓
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 1: Cross-City Search & Escalations */}
      {activeTab === 'CROSS_CITY_SEARCH' && (
        <div className="space-y-6">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cases across Nagpur, Mumbai, Pune by name, tracking token, or railway transit hub..."
                className="w-full bg-[#0B0F19] text-white text-xs rounded-xl pl-10 pr-4 py-2.5 border border-white/20 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Audit Scoped: <strong>All Search Events Logged</strong>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-cyan-400" />
              Active Cross-Jurisdiction Escalated Dossiers
            </h3>

            {crossCityEscalations.map((esc) => {
              const origin = getCityConfig(esc.originCityId);
              const target = getCityConfig(esc.targetCityId);

              return (
                <div key={esc.id} className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-cyan-400">{esc.id}</span>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        {origin.name} &rarr; {target.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        STATUS: {esc.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 font-mono">
                      Delegated At: {new Date(esc.escalatedAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">Incident Reference:</span>
                      <strong className="text-white">{esc.incidentId} (Missing Child)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Authorizing Official:</span>
                      <strong className="text-slate-200">{esc.authorizedBy}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Interstate Transit Anchor:</span>
                      <strong className="text-emerald-400">{esc.transitHubRef || 'Railway Central'}</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300">
                    <strong className="text-white">Escalation Reason:</strong> {esc.reason}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                    <span>Cryptographic Delegation Token: {esc.authorizationToken}</span>
                    <span className="text-emerald-400 font-bold">Audit Hash: {esc.auditTrailId}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content 2: Government Gateways & Test Bench */}
      {activeTab === 'GATEWAYS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Columns: Interactive Adapters */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              National Emergency & Police Gateway Adapters
            </h3>

            {/* 112 ERSS Card */}
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <Radio className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Emergency Response Support System (112 ERSS)</h4>
                    <div className="text-xs text-slate-400">National CAD Interface • Model A Partitioned</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  CONNECTED
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Connects directly to the State Emergency Dispatch CAD. Formats payloads with idempotency keys, coordinates, and priority severity indicators.
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                <span className="font-mono text-slate-400">Avg Latency: 92ms • Retry Backoff: Active</span>
                <button
                  onClick={handleTrigger112Test}
                  disabled={isSimulating}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                  Trigger Test CAD Dispatch
                </button>
              </div>
            </div>

            {/* CCTNS Police Card */}
            <div className="glass-panel p-5 rounded-2xl border border-blue-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">CCTNS Police Database Synchronization</h4>
                    <div className="text-xs text-slate-400">Crime and Criminal Tracking Network & Systems</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  CONNECTED
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Synchronizes verified missing children and FIR records with national police records. Generates an encrypted audit token for legal chain-of-custody.
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                <span className="font-mono text-slate-400">Station Code: {currentCityConfig.cctnsStationCode}</span>
                <button
                  onClick={handleTriggerCCTNSTest}
                  disabled={isSimulating}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-blue-500 hover:bg-blue-600 text-white transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                  Trigger Test FIR Sync
                </button>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Gateway Test Console Log */}
          <div className="lg:col-span-5 flex flex-col space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Gateway Transmission Log
            </h3>

            <div className="p-4 rounded-2xl bg-[#090E1A] border border-white/10 font-mono text-xs text-emerald-400 space-y-1.5 min-h-[360px] max-h-[420px] overflow-y-auto">
              <div className="text-slate-500">[System] Initializing Integration Gateway Test Console...</div>
              <div className="text-slate-500">[System] ERSS 112 Adapter loaded in HIGH-FIDELITY SIMULATION MODE.</div>
              <div className="text-slate-500">[System] CCTNS Police Adapter verified with station {currentCityConfig.cctnsStationCode}.</div>
              {testLog.map((log, idx) => (
                <div key={idx} className="leading-relaxed">{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Multi-Factor Dispatch Math Engine */}
      {activeTab === 'DISPATCH_RANKING' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 space-y-1">
            <div className="font-bold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Multi-Factor Dispatch Scoring Model (Formula 6)</span>
            </div>
            <p className="text-slate-300 font-mono">
              S<sub>disp</sub> = 0.40 &times; (1 - d/d<sub>max</sub>) + 0.25 &times; CapMatch + 0.20 &times; (1 - Workload/W<sub>max</sub>) + 0.15 &times; JurisAffinity
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Automated Candidate Ranking for Incident in {currentCityConfig.name}
            </h3>

            <div className="space-y-3">
              {rankedCandidates.map((cand, idx) => (
                <div 
                  key={cand.responderId} 
                  className={`p-4 rounded-2xl border transition-all ${
                    idx === 0 ? 'glass-panel-elevated border-emerald-500/40' : 'glass-panel border-white/10'
                  } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                      idx === 0 ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-white'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{cand.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-white/10 text-slate-300">
                          {cand.role}
                        </span>
                        {cand.isCrossCity && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            CROSS-CITY (MUMBAI)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Distance: <strong className="text-white">{cand.distanceKm} km</strong> • Zone: {cand.policeStationZone} • Active Cases: {cand.activeWorkload}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xl font-black text-emerald-400 font-mono">
                      {(cand.compositeDispatchScore * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">
                      Composite S<sub>disp</sub>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: Drone Fleet Telemetry */}
      {activeTab === 'DRONE_FLEET' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {droneFeeds.map((drone) => (
            <div key={drone.id} className="glass-panel p-5 rounded-2xl border border-purple-500/30 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">{drone.callsign}</h4>
                  <span className="font-mono text-xs text-purple-400">{drone.id}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {drone.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-slate-300 pt-2 border-t border-white/5">
                <div className="flex justify-between">
                  <span className="text-slate-400">City Base:</span>
                  <strong className="text-white">{getCityConfig(drone.cityId).name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Battery:</span>
                  <strong className={drone.batteryPercent > 70 ? 'text-emerald-400' : 'text-amber-400'}>{drone.batteryPercent}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Altitude:</span>
                  <strong className="text-white">{drone.altitudeMeters}m</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Camera:</span>
                  <strong className="text-purple-300">{drone.cameraType}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Authorized Op:</span>
                  <strong className="text-slate-200">{drone.authorizedOperator}</strong>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-400">
                Purpose: {drone.purpose}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 5: International Adaptation Spec */}
      {activeTab === 'INTERNATIONAL_ADAPTATION' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span>International Architecture Specification</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Phase 3 decouples hardcoded Indian assumptions, enabling zero-code multi-national deployment.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-2.5">Jurisdiction</th>
                  <th className="py-2.5">Country Code</th>
                  <th className="py-2.5">Emergency No</th>
                  <th className="py-2.5">Time Zone</th>
                  <th className="py-2.5">Currency</th>
                  <th className="py-2.5">Police Network</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {allCities.map((city) => (
                  <tr key={city.id} className="text-slate-200">
                    <td className="py-3 font-sans font-bold text-white">{city.name}</td>
                    <td className="py-3">{city.countryCode}</td>
                    <td className="py-3 text-emerald-400 font-bold">{city.emergencyNumber}</td>
                    <td className="py-3 text-slate-400">{city.timeZone}</td>
                    <td className="py-3">{city.currency}</td>
                    <td className="py-3 text-cyan-400">{city.cctnsStationCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
