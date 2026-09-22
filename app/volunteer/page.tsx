'use client';

import React, { useState } from 'react';
import { useSafetyStore } from '@/lib/store/safety-store';
import { 
  Users, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  HeartHandshake, 
  PhoneCall,
  Navigation
} from 'lucide-react';

export default function VolunteerApp() {
  const { 
    volunteerTasks, 
    missingCases, 
    acceptVolunteerTask, 
    startVolunteerTask, 
    volunteerCheckin, 
    completeVolunteerTask, 
    declineVolunteerTask 
  } = useSafetyStore();

  const [volunteerStatus, setVolunteerStatus] = useState<'AVAILABLE' | 'BUSY' | 'OFFLINE'>('AVAILABLE');
  const [checkinSuccessMsg, setCheckinSuccessMsg] = useState<string | null>(null);

  const activeTasks = volunteerTasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'DECLINED');

  const handleCheckin = (taskId: string) => {
    volunteerCheckin(taskId);
    setCheckinSuccessMsg('Safety Check-In Logged! Central Command confirmed your active sector presence.');
    setTimeout(() => setCheckinSuccessMsg(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Volunteer Header Card */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-glowEmerald">
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">Rajesh Deshmukh</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                VERIFIED RESPONDER
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Samata Sainik Dal Patrol Unit • Sector 1 (North Gate Corridor)
            </p>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10">
          {(['AVAILABLE', 'BUSY', 'OFFLINE'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setVolunteerStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                volunteerStatus === st
                  ? st === 'AVAILABLE'
                    ? 'bg-emerald-500 text-white shadow-glowEmerald'
                    : st === 'BUSY'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-700 text-slate-300'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Checkin Alert Toast */}
      {checkinSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{checkinSuccessMsg}</span>
        </div>
      )}

      {/* Active Assignment / Task State Machine */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Radio className="w-4 h-4 text-safety-orange" />
          Active Incident Task Assignments ({activeTasks.length})
        </h2>

        {activeTasks.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center space-y-3">
            <HeartHandshake className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">
              No Pending Incident Assignments
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You are currently on standby in Sector 1. Keep your GPS active. New Guardian Mesh radial alerts within 2.0 km will automatically appear here.
            </p>
          </div>
        ) : (
          activeTasks.map((task) => {
            const isAssigned = task.status === 'ASSIGNED';
            const isAccepted = task.status === 'ACCEPTED';
            const isInProgress = task.status === 'IN_PROGRESS';

            return (
              <div
                key={task.id}
                className="glass-panel p-6 rounded-3xl border border-white/15 space-y-5 shadow-glass"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        isAssigned
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                          : isInProgress
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      }`}>
                        STATUS: {task.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        Task #{task.id} • Linked to {task.caseId}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white mt-1">
                      Search Assignment: {task.searchZoneName}
                    </h3>
                  </div>

                  {isAssigned && (
                    <div className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-2 self-start sm:self-auto">
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Respond within 60s (Auto-cascade to next responder)</span>
                    </div>
                  )}
                </div>

                {/* Child Summary Card */}
                <div className="bg-[#0B0F19] p-4 rounded-2xl border border-white/10 flex items-start gap-4">
                  <img
                    src={task.childSummary.photoUrl}
                    alt={task.childSummary.name}
                    className="w-20 h-20 rounded-xl object-cover border border-white/20"
                  />
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-base">
                      {task.childSummary.name} ({task.childSummary.age} years)
                    </h4>
                    <div className="text-xs text-slate-300">
                      Gender: <strong className="text-white">{task.childSummary.gender}</strong>
                    </div>
                    <div className="text-xs text-slate-300">
                      Wearing: <strong className="text-white">{task.childSummary.clothing}</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-safety-orange" />
                      Search Sector Coordinates: 21.1262° N, 79.0564° E
                    </div>
                  </div>
                </div>

                {/* State Machine Action Controls */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {isAssigned && (
                    <>
                      <button
                        onClick={() => acceptVolunteerTask(task.id)}
                        className="flex-1 sm:flex-initial px-6 py-3 rounded-xl font-bold text-xs bg-emerald-500 text-white shadow-glowEmerald hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Accept Task Assignment
                      </button>
                      <button
                        onClick={() => declineVolunteerTask(task.id)}
                        className="px-4 py-3 rounded-xl font-bold text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/10 transition-colors"
                      >
                        Decline / Busy (Cascade)
                      </button>
                    </>
                  )}

                  {isAccepted && (
                    <button
                      onClick={() => startVolunteerTask(task.id)}
                      className="px-6 py-3 rounded-xl font-bold text-xs bg-safety-orange text-white shadow-glowOrange hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      Start Sector Patrol (In Progress)
                    </button>
                  )}

                  {isInProgress && (
                    <>
                      <button
                        onClick={() => handleCheckin(task.id)}
                        className="px-5 py-3 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-500 shadow-glowBlue transition-all flex items-center gap-2"
                      >
                        <Radio className="w-4 h-4" />
                        Safety Check-In Ping ({task.safetyCheckinCount} Logged)
                      </button>
                      <button
                        onClick={() => completeVolunteerTask(task.id)}
                        className="px-6 py-3 rounded-xl font-bold text-xs bg-emerald-500 text-white hover:bg-emerald-600 shadow-glowEmerald transition-all flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Task Completed / Child Located
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Nearby Incidents Radar List */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-safety-orange" />
          Nearby Missing Child Alerts (Within 2.0 km Radius)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {missingCases.filter((c) => c.status === 'SEARCHING').map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-2xl bg-[#0B0F19] border border-white/10 flex items-center gap-3"
            >
              <img
                src={c.photoUrl}
                alt={c.childName}
                className="w-12 h-12 rounded-xl object-cover border border-white/20"
              />
              <div className="space-y-0.5">
                <div className="font-bold text-white text-xs">{c.childName} ({c.age}y)</div>
                <div className="text-[11px] text-slate-300">{c.clothing.top}</div>
                <div className="text-[10px] text-slate-400">
                  Seen: {c.lastSeenLocation.landmark}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
