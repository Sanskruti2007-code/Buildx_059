'use client';

import React, { useState } from 'react';
import { useSafetyStore } from '@/lib/store/safety-store';
import { 
  ShieldAlert, 
  Navigation, 
  AlertTriangle, 
  Clock, 
  Radio, 
  KeyRound, 
  UserPlus, 
  Trash2, 
  Car, 
  User, 
  CheckCircle2, 
  MapPin,
  ShieldCheck,
  EyeOff,
  BellRing
} from 'lucide-react';

export default function WomenSafetyCenter() {
  const { 
    activeSafeRide, 
    trustedContacts, 
    simulateRouteDeviation, 
    simulateStationaryStop, 
    disarmSafeRide, 
    triggerSilentSOS,
    addTrustedContact,
    removeTrustedContact 
  } = useSafetyStore();

  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinMessage, setPinMessage] = useState<string | null>(null);
  const [isDuressFeedback, setIsDuressFeedback] = useState(false);

  // New Contact Form
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState<'FAMILY' | 'FRIEND' | 'COLLEAGUE'>('FAMILY');

  const handleDisarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = disarmSafeRide(pinInput);
    setPinMessage(res.message);
    if (res.isDuress) {
      setIsDuressFeedback(true);
    }
    if (res.success) {
      setTimeout(() => {
        setPinModalOpen(false);
        setPinInput('');
        setPinMessage(null);
        setIsDuressFeedback(false);
      }, 2500);
    }
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;
    addTrustedContact({
      name: newContactName,
      phone: newContactPhone,
      relationship: newContactRel,
      priorityOrder: trustedContacts.length + 1,
      receiveSmsOnYellow: false,
      receiveSmsOnOrange: true,
    });
    setNewContactName('');
    setNewContactPhone('');
  };

  const isYellow = activeSafeRide?.safetyState === 'YELLOW';
  const isRed = activeSafeRide?.safetyState === 'RED';
  const isResolved = activeSafeRide?.safetyState === 'RESOLVED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>WOMEN SAFETY & DAILY SAFERIDE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Daily Journey Protection & Silent SOS
          </h1>
          <p className="text-xs text-slate-300">
            Automated route deviation tracking, stationary stop alerts, and duress-safe disarm protocols across Nagpur.
          </p>
        </div>

        {/* Discreet Silent SOS Button */}
        <button
          onClick={() => triggerSilentSOS()}
          className="self-start md:self-auto px-6 py-3 rounded-2xl font-black text-xs bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-glowRed hover:scale-105 transition-all flex items-center gap-2 border border-red-400/40"
          title="Discreet emergency broadcast"
        >
          <Radio className="w-4 h-4 animate-spin" />
          <span>TRIGGER SILENT SOS</span>
        </button>
      </div>

      {/* Active SafeRide Journey HUD */}
      {activeSafeRide && !isResolved ? (
        <div className={`glass-panel p-6 sm:p-8 rounded-3xl border transition-all ${
          isRed 
            ? 'border-red-500 shadow-glowRed bg-red-950/20' 
            : isYellow 
            ? 'border-amber-500 shadow-glowOrange bg-amber-950/20' 
            : 'border-white/15'
        }`}>
          {/* Status Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3.5 h-3.5 rounded-full ${
                isRed ? 'bg-red-500 animate-ping' : isYellow ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
              }`} />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white">
                    SafeRide Trip #{activeSafeRide.id}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                    isRed 
                      ? 'bg-red-500/30 text-red-300 border border-red-500/50' 
                      : isYellow 
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 animate-pulse' 
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    STATE: {activeSafeRide.safetyState}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rider: <strong className="text-white">{activeSafeRide.userName}</strong> ({activeSafeRide.userPhone})
                </p>
              </div>
            </div>

            {/* Disarm / Safety PIN Button */}
            <button
              onClick={() => setPinModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <KeyRound className="w-3.5 h-3.5 text-safety-orange" />
              <span>Enter Safety PIN / Disarm</span>
            </button>
          </div>

          {/* Anomaly Notification Banner */}
          {isYellow && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>
                  <strong>AUTOMATED SAFETY CHECK:</strong> {activeSafeRide.anomalyReason}. Check-in within 60s to prevent Orange Escalation.
                </span>
              </div>
              <button
                onClick={() => setPinModalOpen(true)}
                className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 shrink-0 ml-3"
              >
                I am Safe
              </button>
            </div>
          )}

          {/* Journey Route & Vehicle Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Route Progress */}
            <div className="bg-[#090E1A] p-5 rounded-2xl border border-white/10 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-safety-blue" />
                Live Route Corridor
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-slate-400">Origin:</span> {activeSafeRide.startLocation.landmark}
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-safety-orange mt-1.5 shrink-0" />
                  <div>
                    <span className="text-slate-400">Current GPS Fix:</span> {activeSafeRide.currentLocation.landmark}
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-slate-400">Destination:</span> {activeSafeRide.destination.landmark}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>Corridor Separation: <strong className="text-white">{activeSafeRide.deviationMeters}m</strong></span>
                <span>Stationary: <strong className="text-white">{activeSafeRide.stationarySeconds}s</strong></span>
              </div>
            </div>

            {/* Vehicle & Driver Info */}
            <div className="bg-[#090E1A] p-5 rounded-2xl border border-white/10 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-safety-orange" />
                Verified Transport Details
              </span>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-safety-orange text-sm">
                  AUTO
                </div>
                <div>
                  <div className="text-sm font-black text-white font-mono">
                    {activeSafeRide.vehicleDetails?.vehicleNumber}
                  </div>
                  <div className="text-xs text-slate-300">
                    Driver: {activeSafeRide.vehicleDetails?.driverName} ({activeSafeRide.vehicleDetails?.rideServiceProvider})
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Live location link shared with {trustedContacts.length} verified emergency contacts.
              </p>
            </div>
          </div>

          {/* Interactive Simulation Controls for Drill Verification */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-semibold">
              Live SafeRide Simulation Triggers:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => simulateRouteDeviation()}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-bold transition-all"
              >
                Simulate Route Deviation (&gt; 500m)
              </button>
              <button
                onClick={() => simulateStationaryStop()}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-bold transition-all"
              >
                Simulate Stationary Stop (&gt; 3m)
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* SafeRide Completed Card */
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 text-center space-y-3 shadow-glowEmerald">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">SafeRide Journey Completed</h2>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            You have safely disarmed the session. Real-time location sharing with trusted contacts has ended.
          </p>
          <div className="pt-2">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white"
            >
              Start New Journey
            </button>
          </div>
        </div>
      )}

      {/* Trusted Contacts Management */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="border-b border-white/10 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-safety-emerald" />
              Verified Trusted Contacts ({trustedContacts.length} / 5 Max)
            </h3>
            <p className="text-xs text-slate-400">
              Only verified contacts receive automated SafeRide telemetry and emergency escalation SMS.
            </p>
          </div>
        </div>

        {/* Existing Contacts List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {trustedContacts.map((tc) => (
            <div
              key={tc.id}
              className="p-4 rounded-2xl bg-[#090E1A] border border-white/10 flex items-start justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{tc.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                    VERIFIED
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-mono mt-1">{tc.phone}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Priority #{tc.priorityOrder} • {tc.relationship}</div>
              </div>
              <button
                onClick={() => removeTrustedContact(tc.id)}
                className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                title="Remove Contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Contact Form (if under 5) */}
        {trustedContacts.length < 5 && (
          <form onSubmit={handleAddContact} className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              required
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              placeholder="Contact Full Name"
              className="px-3 py-2 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs"
            />
            <input
              type="tel"
              required
              value={newContactPhone}
              onChange={(e) => setNewContactPhone(e.target.value)}
              placeholder="+91 Mobile Number"
              className="px-3 py-2 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs"
            />
            <select
              value={newContactRel}
              onChange={(e) => setNewContactRel(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs"
            >
              <option value="FAMILY">Family</option>
              <option value="FRIEND">Friend</option>
              <option value="COLLEAGUE">Colleague</option>
            </select>
            <button
              type="submit"
              className="py-2 px-4 rounded-xl font-bold text-xs bg-safety-emerald text-white hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Contact
            </button>
          </form>
        )}
      </div>

      {/* Safety PIN / Duress PIN Modal */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0D1424] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-safety-orange" />
                <h3 className="font-bold text-white text-base">Enter Safety / Duress PIN</h3>
              </div>
              <button
                onClick={() => setPinModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDisarmSubmit} className="space-y-4">
              <p className="text-xs text-slate-300">
                Enter your 4-digit safety code to disarm the trip.
              </p>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300 space-y-1">
                <div>• Normal Safe PIN: <strong className="text-white font-mono">1234</strong> (Disarms trip safely)</div>
                <div>• Coercion Duress PIN: <strong className="text-red-400 font-mono">9876</strong> (Shows &quot;Safe&quot; screen, secretly triggers Police Red Alert)</div>
              </div>

              <input
                type="password"
                maxLength={4}
                autoFocus
                required
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full px-4 py-3 rounded-2xl bg-[#090E1A] border border-white/20 text-white font-mono text-center tracking-widest text-2xl focus:outline-none focus:border-safety-orange"
              />

              {pinMessage && (
                <div className={`p-3 rounded-xl text-xs font-bold text-center ${
                  isDuressFeedback ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {pinMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-black text-xs bg-safety-orange hover:bg-orange-600 text-white shadow-glowOrange transition-all"
              >
                Authorize & Disarm Trip
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
