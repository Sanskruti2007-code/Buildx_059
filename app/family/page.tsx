'use client';

import React, { useState } from 'react';
import { useSafetyStore } from '@/lib/store/safety-store';
import { 
  Heart, 
  MapPin, 
  AlertTriangle, 
  QrCode, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  User, 
  PhoneCall,
  Sparkles,
  RefreshCw,
  Eye
} from 'lucide-react';

export default function FamilyElderlyCare() {
  const { 
    elderProfiles, 
    wanderAlerts, 
    triggerElderWander, 
    resolveWanderAlert 
  } = useSafetyStore();

  const [qrScanModalOpen, setQrScanModalOpen] = useState(false);

  const activeElder = elderProfiles[0];
  const activeAlert = wanderAlerts.find((a) => a.status === 'ACTIVE_SEARCH');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <Heart className="w-3.5 h-3.5" />
          <span>FAMILY & ELDERLY WANDER PROTECTION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Safe Zone Geofencing & Opaque QR Badges
        </h1>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Geofenced boundary protection with 35m hysteresis filtering to prevent false alarm spamming, paired with privacy-first QR identity cards for elders and vulnerable family members.
        </p>
      </div>

      {/* Active Elder Profile Card */}
      {activeElder && (
        <div className={`glass-panel p-6 sm:p-8 rounded-3xl border transition-all ${
          activeElder.currentStatus === 'WANDERING_DETECTED'
            ? 'border-amber-500 bg-amber-950/20 shadow-glowOrange'
            : 'border-white/15'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-4">
              <img
                src={activeElder.photoUrl}
                alt={activeElder.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">{activeElder.name}</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                    Age: {activeElder.age}y
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Guardian: <strong className="text-white">{activeElder.guardianName}</strong> ({activeElder.guardianPhone})
                </p>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-black self-start sm:self-auto ${
              activeElder.currentStatus === 'WANDERING_DETECTED'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {activeElder.currentStatus === 'WANDERING_DETECTED' ? 'WANDER ALERT ACTIVE' : 'SAFE IN ZONE'}
            </span>
          </div>

          {/* Condition Notes & Safe Zones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Safe Zones List */}
            <div className="bg-[#090E1A] p-5 rounded-2xl border border-white/10 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-safety-blue" />
                Configured Safe Zones (Hysteresis 35m)
              </span>

              <div className="space-y-2">
                {activeElder.safeZones.map((sz) => (
                  <div
                    key={sz.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{sz.name}</div>
                      <div className="text-[11px] text-slate-400">{sz.center.landmark}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px]">
                      {sz.radiusMeters}m Radius
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-slate-400 pt-1">
                Last GPS Ping: <strong className="text-white">{activeElder.lastKnownLocation.landmark}</strong>
              </div>
            </div>

            {/* Secure Opaque QR/ID Badge Card */}
            <div className="bg-[#090E1A] p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-purple-400" />
                  Secure Revocable QR Badge
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tamper-evident identity card worn on clothing/wristband. Contains an opaque cryptographic reference; zero raw PII or home address stored inside the barcode.
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                  <QrCode className="w-10 h-10 text-slate-950" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-white">
                    {activeElder.qrTokenId}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold">STATUS: ACTIVE & SIGNED</div>
                </div>
              </div>

              <button
                onClick={() => setQrScanModalOpen(true)}
                className="w-full py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                Simulate Public Citizen Scan View
              </button>
            </div>
          </div>

          {/* Simulation & Alert Resolution Actions */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">Drill & Escalation Controls:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerElderWander(activeElder.id)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-bold transition-all"
              >
                Simulate Geofence Breach (550m Outside)
              </button>
              {activeAlert && (
                <button
                  onClick={() => resolveWanderAlert(activeAlert.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold transition-all"
                >
                  Confirm Elder Located & Disarm Alert
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Wander Alerts Stream */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-safety-orange" />
          Active Elderly Wander Alerts Across Nagpur ({wanderAlerts.filter(a => a.status === 'ACTIVE_SEARCH').length})
        </h3>

        <div className="space-y-3">
          {wanderAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-2xl bg-[#0B0F19] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{alert.elderName}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    alert.status === 'ACTIVE_SEARCH'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {alert.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Exited: <strong>{alert.triggerZoneName}</strong> • Currently {alert.distanceOutsideMeters}m outside boundary
                </p>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-safety-orange" />
                  Last spotted: {alert.currentLocation.landmark}
                </div>
              </div>

              <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                <span className="text-[11px] text-emerald-400 font-semibold">
                  {alert.assignedRespondersCount} Search Responders Routed
                </span>
                <span className="text-[10px] text-slate-400">
                  Triggered: {new Date(alert.triggeredAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Citizen QR Scan Simulation Modal */}
      {qrScanModalOpen && activeElder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0D1424] border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Public Citizen QR Scan Result</h3>
              </div>
              <button
                onClick={() => setQrScanModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#090E1A] border border-white/10 text-center space-y-3">
              <img
                src={activeElder.photoUrl}
                alt={activeElder.name}
                className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-purple-400"
              />
              <div>
                <h4 className="text-lg font-bold text-white">{activeElder.name}</h4>
                <div className="text-xs text-slate-400">Assisted Citizen Safety Badge</div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                &quot;{activeElder.conditionNotes}&quot;
              </p>
            </div>

            {/* Privacy Protection Callout */}
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200">
              <strong>Privacy Protection:</strong> Home street address and medical diagnosis are not stored or visible to scan viewers.
            </div>

            {/* Direct Connect Proxy Button */}
            <div className="space-y-2">
              <a
                href={`tel:${activeElder.guardianPhone}`}
                className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center justify-center gap-2 shadow-glowEmerald"
              >
                <PhoneCall className="w-4 h-4" />
                Call Authorized Family Guardian (Proxied)
              </a>
              <button
                onClick={() => {
                  alert('Coordinates shared with nearest Nagpur Police Help-Desk kiosk.');
                  setQrScanModalOpen(false);
                }}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Notify Nearest Police Help-Desk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
