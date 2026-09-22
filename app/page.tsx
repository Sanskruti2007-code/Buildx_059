'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Monitor, 
  HelpCircle, 
  Users, 
  ShieldAlert, 
  Sparkles, 
  MapPin, 
  Activity, 
  Radio, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Scale,
  Car,
  EyeOff,
  Heart,
  Train,
  KeyRound,
  Globe,
  TrendingUp,
  Brain,
  Lock,
  BarChart3
} from 'lucide-react';
import { useSafetyStore } from '@/lib/store/safety-store';
import { DICTIONARIES } from '@/lib/i18n/dictionaries';

export default function Home() {
  const { 
    locale, 
    missingCases, 
    volunteerTasks, 
    activeSafeRide, 
    wanderAlerts, 
    witnessReports,
    operatorRecommendations,
    riskSignals,
    modelRegistry 
  } = useSafetyStore();
  const t = DICTIONARIES[locale];

  const activeCasesCount = missingCases.filter((c) => c.status === 'SEARCHING').length;
  const activeWanderCount = wanderAlerts.filter((a) => a.status === 'ACTIVE_SEARCH').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Executive Hero Banner */}
      <div className="relative glass-panel p-8 sm:p-12 rounded-3xl border border-white/15 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-safety-orange/20 text-safety-orange border border-safety-orange/40 tracking-wider uppercase">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Phase 1 & Phase 2 Integrated Safety Grid • Nagpur Metro Region
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Integrated Citizen-Authority Safety Network
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            From the historic Deeksha Bhoomi mass gathering to city-wide daily commutes: MEHFUS provides missing-child rapid response, automated SafeRide route deviation tracking, discreet Silent SOS triggers, and elderly wander geofencing across Nagpur.
          </p>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-xs">
            <div>
              <div className="text-slate-400">Emergency Alert Target</div>
              <div className="font-bold text-white text-base">&lt; 2 Minutes</div>
            </div>
            <div>
              <div className="text-slate-400">Guardian Mesh Coverage</div>
              <div className="font-bold text-safety-orange text-base">City-Wide + Deeksha Bhoomi</div>
            </div>
            <div>
              <div className="text-slate-400">Active Ground Responders</div>
              <div className="font-bold text-emerald-400 text-base">{volunteerTasks.length + 18} Active</div>
            </div>
            <div>
              <div className="text-slate-400">Transit Hub Integrations</div>
              <div className="font-bold text-blue-400 text-base">Metro, Rail, Bus (3 Hubs)</div>
            </div>
          </div>
        </div>

        {/* Background glow effects */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-safety-orange/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* PHASE 4: PROACTIVE SAFETY, INTELLIGENCE & OPERATIONAL OPTIMIZATION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span>Phase 4: Proactive Intelligence & Operational Optimization</span>
          </h2>
          <span className="text-xs text-purple-300 font-semibold hidden sm:inline">
            Deterministic Floors • k-Anonymity Grid • Human-in-the-Loop • SLA Benchmarks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Operator Recommendations & Case Intelligence */}
          <Link
            href="/control-room"
            className="group glass-panel p-6 rounded-3xl border border-purple-500/30 flex flex-col justify-between hover:border-purple-400 hover:shadow-glowPurple transition-all space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {operatorRecommendations.filter(r => r.status === 'PENDING_REVIEW' || r.decision === 'PENDING' || r.decision === 'PENDING_REVIEW' || (!r.status && !r.decision)).length} PENDING DECISIONS
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition-colors">
                  Proactive Operator Recommendations & Dossiers
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Resource deficit minimization with strict Human-in-the-Loop governance. Multi-factor incident urgency with deterministic safety floors (P_floor &ge; 85) and grounded timeline dossiers.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-purple-400 pt-3 border-t border-white/10">
              <span>Inspect Operator Queue</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Model Governance & Post-Incident Learning */}
          <Link
            href="/operations"
            className="group glass-panel p-6 rounded-3xl border border-emerald-500/30 flex flex-col justify-between hover:border-emerald-400 hover:shadow-glowEmerald transition-all space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {modelRegistry.length} VERIFIED MODELS
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                  Model Governance & Response-Time Learning
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Continuous model drift monitoring, zero safety-demotion invariants, ISO-27001 compliance registry, and automated post-incident SLA analytics (MTTA, MTTD, MTTR).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pt-3 border-t border-white/10">
              <span>View Governance Registry</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Privacy-Preserving Heatmap Grid */}
          <Link
            href="/control-room"
            className="group glass-panel p-6 rounded-3xl border border-amber-500/30 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform">
                  <Lock className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  k &ge; 3 ANONYMITY
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                  Privacy-Preserving Safety Grid
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  250m &times; 250m quantized boundary cells with strict low-density suppression (&lt; 3 incidents) guaranteeing zero citizen re-identification under India&apos;s DPDP Act 2023.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-amber-400 pt-3 border-t border-white/10">
              <span>Explore Privacy Heatmap</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* PHASE 3: CITY SCALE & INTEROPERABILITY INFRASTRUCTURE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Phase 3: City Scale, Interoperability & Predictive Safety</span>
          </h2>
          <span className="text-xs text-cyan-400 font-semibold hidden sm:inline">Multi-City • 112 CAD • CCTNS • Drones • Predictive Crowd</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: City Operations & Gateway Test Bench */}
          <Link
            href="/operations"
            className="group glass-panel p-6 rounded-3xl border border-cyan-500/30 flex flex-col justify-between hover:border-cyan-400 hover:shadow-glowCyan transition-all space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  MULTI-CITY ARCHITECTURE
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">
                  City Operations & Interoperability Center
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Cross-city missing-person search across Nagpur, Mumbai, and Pune. Test bench for India&apos;s 112 / ERSS CAD dispatch, CCTNS police case sync, and multi-factor responder ranking ($S_{'{disp}'}$).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-cyan-400 pt-3 border-t border-white/10">
              <span>Enter Operations Command</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Control Room with Predictive Crowd & Drone HUD */}
          <Link
            href="/control-room"
            className="group glass-panel p-6 rounded-3xl border border-purple-500/30 flex flex-col justify-between hover:border-purple-400 hover:shadow-glowOrange transition-all space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  PREDICTIVE PHYSICS & DRONES
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition-colors">
                  Control Room • Predictive Crowd & Drone Radar
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Multivariate Logistic Congestion Risk forecaster ($R_{'{cong}'}$ horizon: 15m), density velocity ($v_&rho;$), net crowd flux ($q_{'{net}'}$), proactive gate diversion, and live aerial drone surveillance with strict privacy bounds.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-purple-400 pt-3 border-t border-white/10">
              <span>View Predictive Radar</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* PHASE 2 CITY-WIDE DAILY SAFETY STATIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span>Phase 2: City-Wide Daily Safety Modules</span>
          </h2>
          <span className="text-xs text-pink-400 font-semibold hidden sm:inline">Women Safety • SafeRide • Elders • Transit</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Station 1: Women Safety & SafeRide */}
          <Link
            href="/safety"
            className="group glass-panel p-6 rounded-3xl border border-pink-500/30 flex flex-col justify-between hover:border-pink-400 hover:shadow-glowRed transition-all space-y-5"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30 group-hover:scale-110 transition-transform">
                <Car className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-wider uppercase text-pink-400">
                  Daily Commute
                </span>
                <h3 className="text-base font-black text-white group-hover:text-pink-300 transition-colors">
                  SafeRide & Silent SOS
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automated route deviation tracking (&gt; 500m), 3-minute stationary stop detection, discreet Silent SOS, and duress-safe PIN disarm.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-pink-400 pt-2 border-t border-white/10">
              <span>State: {activeSafeRide?.safetyState || 'Active'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Station 2: Elderly Wander & Safe Zones */}
          <Link
            href="/family"
            className="group glass-panel p-6 rounded-3xl border border-purple-500/30 flex flex-col justify-between hover:border-purple-400 hover:shadow-glowBlue transition-all space-y-5"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-wider uppercase text-purple-400">
                  Vulnerable Citizens
                </span>
                <h3 className="text-base font-black text-white group-hover:text-purple-300 transition-colors">
                  Elderly Wander & QR Badges
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Safe zone perimeter geofencing with 35m hysteresis filtering, paired with revocable, opaque QR identity badges with zero exposed PII.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-purple-400 pt-2 border-t border-white/10">
              <span>{activeWanderCount} Active Wander Alerts</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Station 3: Anonymous Witness Report */}
          <Link
            href="/witness"
            className="group glass-panel p-6 rounded-3xl border border-cyan-500/30 flex flex-col justify-between hover:border-cyan-400 hover:shadow-glowBlue transition-all space-y-5"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                <EyeOff className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-wider uppercase text-cyan-400">
                  Zero Retaliation
                </span>
                <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                  Anonymous Witness
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Report harassment, suspicious activity, and street hazards with in-memory EXIF metadata stripping and zero client IP logging.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-cyan-400 pt-2 border-t border-white/10">
              <span>{witnessReports.length} Reports Logged</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Station 4: Transport Hubs */}
          <Link
            href="/transport"
            className="group glass-panel p-6 rounded-3xl border border-blue-500/30 flex flex-col justify-between hover:border-blue-400 hover:shadow-glowBlue transition-all space-y-5"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
                <Train className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-wider uppercase text-blue-400">
                  Transit Interchange
                </span>
                <h3 className="text-base font-black text-white group-hover:text-blue-300 transition-colors">
                  Transport Hub Safety
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Real-time incident bulletin coordination across Nagpur Metro, Central Railway Station, and Mor Bhavan Bus Terminus.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-blue-400 pt-2 border-t border-white/10">
              <span>Maha Metro & RPF Sync</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* PHASE 1 PILOT STATIONS (PRESERVED) */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-safety-orange" />
          <span>Phase 1: Foundational Event Safety (Deeksha Bhoomi Baseline)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/control-room"
            className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-safety-orange transition-all space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-safety-orange/20 text-safety-orange flex items-center justify-center">
                <Monitor className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Control Room Command</h3>
              <p className="text-xs text-slate-400">Master GIS radar, priority incident queue, and two-way match queue.</p>
            </div>
            <div className="text-xs font-bold text-safety-orange flex items-center justify-between pt-2 border-t border-white/5">
              <span>{activeCasesCount} Active Incidents</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/help-desk"
            className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-blue-500 transition-all space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Help-Desk Kiosk</h3>
              <p className="text-xs text-slate-400">Trilingual touch terminal (मराठी / हिंदी / EN) with rapid OTP intake.</p>
            </div>
            <div className="text-xs font-bold text-blue-400 flex items-center justify-between pt-2 border-t border-white/5">
              <span>Police Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/volunteer"
            className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-emerald-500 transition-all space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Volunteer Mesh</h3>
              <p className="text-xs text-slate-400">Task dispatch countdown, patrol state machine, and safety checkins.</p>
            </div>
            <div className="text-xs font-bold text-emerald-400 flex items-center justify-between pt-2 border-t border-white/5">
              <span>{volunteerTasks.length} Active Tasks</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/citizen"
            className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-cyan-400 transition-all space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">Found Child Doubt</h3>
              <p className="text-xs text-slate-400">&quot;I Found a Child — I Have a Doubt&quot; good-faith protection reporting.</p>
            </div>
            <div className="text-xs font-bold text-cyan-400 flex items-center justify-between pt-2 border-t border-white/5">
              <span>No-Blame Protocol</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
