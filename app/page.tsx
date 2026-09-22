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
  Scale
} from 'lucide-react';
import { useSafetyStore } from '@/lib/store/safety-store';
import { DICTIONARIES } from '@/lib/i18n/dictionaries';

export default function Home() {
  const { locale, missingCases, matchCandidates, volunteerTasks, crowdZones } = useSafetyStore();
  const t = DICTIONARIES[locale];

  const activeCasesCount = missingCases.filter((c) => c.status === 'SEARCHING').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Executive Hero */}
      <div className="relative glass-panel p-8 sm:p-12 rounded-3xl border border-white/15 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-safety-orange/20 text-safety-orange border border-safety-orange/40 tracking-wider uppercase">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Phase 1 Pilot Active • Deeksha Bhoomi Gathering
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Integrated Citizen-Authority Safety Network
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            MEHFUS coordinates rapid missing child response, good-faith found child doubt reporting, geofenced volunteer mobilization, and crowd density monitoring for the historic Deeksha Bhoomi gathering in Nagpur.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs">
            <div>
              <div className="text-slate-400">Target Alert Time</div>
              <div className="font-bold text-white text-base">&lt; 2 Minutes</div>
            </div>
            <div>
              <div className="text-slate-400">Guardian Mesh Radius</div>
              <div className="font-bold text-safety-orange text-base">2.0 km Geofenced</div>
            </div>
            <div>
              <div className="text-slate-400">Active Ground Volunteers</div>
              <div className="font-bold text-emerald-400 text-base">{volunteerTasks.length + 18} Responders</div>
            </div>
            <div>
              <div className="text-slate-400">Event Ground Capacity</div>
              <div className="font-bold text-white text-base">18,500 Pilgrims</div>
            </div>
          </div>
        </div>

        {/* Background glow decoration */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-safety-orange/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-16 w-80 h-80 bg-safety-blue/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Primary Operational Portals Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>Select Operational Station</span>
          <span className="text-xs text-slate-400 font-normal font-sans">(Phase 1 Scope)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Station 1: Control Room Dashboard */}
          <Link
            href="/control-room"
            className="group glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-safety-orange hover:shadow-glowOrange transition-all space-y-6"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-safety-orange/20 text-safety-orange flex items-center justify-center border border-safety-orange/40 group-hover:scale-110 transition-transform">
                <Monitor className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-wider uppercase text-safety-orange">
                  Command & Dispatch
                </span>
                <h3 className="text-lg font-black text-white group-hover:text-safety-orange transition-colors">
                  Control Room Command
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Live interactive GIS map, Orange/Red priority queues, two-way candidate matching review, and real-time crowd density monitor.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-safety-orange pt-2 border-t border-white/10">
              <span>{activeCasesCount} Active Incidents</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Station 2: Help-Desk Kiosk */}
          <Link
            href="/help-desk"
            className="group glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-blue-500 hover:shadow-glowBlue transition-all space-y-6"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-wider uppercase text-blue-400">
                  Police Kiosk Terminal
                </span>
                <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">
                  Help-Desk Kiosk
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Trilingual touch terminal (English, Marathi, Hindi) for high-speed child intake, guardian OTP verification, and cross-desk alerting.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-blue-400 pt-2 border-t border-white/10">
              <span>Trilingual (EN / MR / HI)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Station 3: Volunteer Mesh */}
          <Link
            href="/volunteer"
            className="group glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-emerald-500 hover:shadow-glowEmerald transition-all space-y-6"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-wider uppercase text-emerald-400">
                  Ground Responders
                </span>
                <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
                  Volunteer Mesh
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Task assignment state machine (`ASSIGNED` $\to$ `ACCEPTED` $\to$ `IN_PROGRESS`), 60s cascade timeout, and safety checkin pings.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pt-2 border-t border-white/10">
              <span>{volunteerTasks.length} Active Tasks</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Station 4: Citizen Safety Portal */}
          <Link
            href="/citizen"
            className="group glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-cyan-400 hover:shadow-glowBlue transition-all space-y-6"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-wider uppercase text-cyan-400">
                  Pilgrim & Parent
                </span>
                <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors">
                  Citizen Portal
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "I Found a Child — I Have a Doubt" reporting with no-blame protection, child pre-registration vault, and transparent alert feeds.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-cyan-400 pt-2 border-t border-white/10">
              <span>Doubt Report Flow</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Foundational Pillars Highlight */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="border-b border-white/10 pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-safety-orange" />
            Core Engineering & Safety Innovations in Phase 1
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Engineered to balance rapid emergency dispatch with rigorous minor privacy and DPDP Act compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-[#0B0F19] border border-white/5 space-y-2">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-safety-orange" />
              Deterministic Multi-Signal Engine
            </div>
            <p className="leading-relaxed">
              Combines Great-Circle Haversine spatial decay (w: 0.25), facial cosine distance (w: 0.40), timeline compatibility (w: 0.15), and clothing Jaccard similarity (w: 0.10) with mandatory human officer sign-off.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B0F19] border border-white/5 space-y-2">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              "Found Child Doubt Report"
            </div>
            <p className="leading-relaxed">
              Eliminates the fear of police interrogation for good-faith citizens. Differentiates custody doubts from sighting tips, instantly querying active missing child cases in both directions.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B0F19] border border-white/5 space-y-2">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-safety-emerald" />
              Dynamic Crowd Threshold Escalation
            </div>
            <p className="leading-relaxed">
              Monitors 4 key Deeksha Bhoomi zones (Stupa Sanctum, North Gate, Food Pavillion, Parking). Density triggers Yellow (70%), Orange (85% auxiliary gate divert), and Red (95% emergency surge).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
