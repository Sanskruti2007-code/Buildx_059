'use client';

import React, { useState } from 'react';
import { useSafetyStore } from '@/lib/store/safety-store';
import { 
  Train, 
  Bus, 
  MapPin, 
  ShieldAlert, 
  PhoneCall, 
  Radio, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function TransportHubIntegration() {
  const { transportHubs, missingCases, wanderAlerts } = useSafetyStore();
  const [broadcastFeedback, setBroadcastFeedback] = useState<string | null>(null);

  const handleSimulateBroadcast = (hubName: string) => {
    setBroadcastFeedback(`Emergency Broadcast Synchronized across all digital concourse boards at ${hubName}!`);
    setTimeout(() => setBroadcastFeedback(null), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">
          <Train className="w-3.5 h-3.5" />
          <span>TRANSPORT HUB INTEGRATION ADAPTER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          City Transit Interchanges & Transit Security
        </h1>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Coordinates emergency alert broadcasts, missing child bulletins, and SafeRide departures across Nagpur Metro, Central Railway, and City Bus termini.
        </p>

        {/* Clear Simulation Disclosure Tag */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 mt-2">
          <span>NOTICE: DEMO / SIMULATION ADAPTER — Open API Handshake Ready for Maha Metro & RPF Integration</span>
        </div>
      </div>

      {broadcastFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{broadcastFeedback}</span>
        </div>
      )}

      {/* Transit Hubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {transportHubs.map((hub) => (
          <div
            key={hub.id}
            className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-5 hover:border-blue-400 transition-all shadow-glass"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  {hub.type === 'METRO' ? (
                    <Train className="w-6 h-6" />
                  ) : hub.type === 'RAILWAY' ? (
                    <Train className="w-6 h-6 text-safety-orange" />
                  ) : (
                    <Bus className="w-6 h-6 text-safety-emerald" />
                  )}
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  {hub.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{hub.name}</h3>
                <div className="text-[11px] text-slate-400">{hub.operatorName}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#090E1A] border border-white/5 space-y-1.5 text-xs">
                <div className="text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>{hub.coordinates.landmark}</span>
                </div>
                <div className="text-slate-300 flex items-center gap-1.5 font-mono">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{hub.policeBoothPhone}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                &quot;{hub.lastBroadcastNotice}&quot;
              </p>
            </div>

            <button
              onClick={() => handleSimulateBroadcast(hub.name)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-glowBlue transition-colors flex items-center justify-center gap-2"
            >
              <Radio className="w-3.5 h-3.5" />
              Sync Emergency Bulletin
            </button>
          </div>
        ))}
      </div>

      {/* Transit Multi-Agency Coordination Panel */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-safety-orange" />
          Active Cross-Transit Bulletins Synchronized with Control Room
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#090E1A] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-safety-orange">CHILD SEARCH BULLETIN</span>
              <span className="text-[10px] text-slate-400">Live on Transit Displays</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Displaying bulletin for <strong>Aarav Sharma (6y)</strong> at Sitabuldi Metro Ticket Concourse and Nagpur Central Platform 1.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#090E1A] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400">ELDERLY WANDER ADVISORY</span>
              <span className="text-[10px] text-slate-400">Security Booth Alert</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Advising Mor Bhavan Aapli Bus conductors on routes towards Ramdaspeth to assist <strong>Prabhakar Rao Deshpande (78y)</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
