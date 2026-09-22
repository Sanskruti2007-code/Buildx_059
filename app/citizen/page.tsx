'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSafetyStore } from '@/lib/store/safety-store';
import { DICTIONARIES } from '@/lib/i18n/dictionaries';
import { 
  ShieldAlert, 
  HelpCircle, 
  UserPlus, 
  Search, 
  Lock, 
  Sparkles, 
  HeartHandshake, 
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function CitizenPortal() {
  const { 
    locale, 
    missingCases, 
    reportFoundChild 
  } = useSafetyStore();
  const t = DICTIONARIES[locale];

  // Citizen Found Child Doubt Quick Modal
  const [showDoubtForm, setShowDoubtForm] = useState(false);
  const [doubtAge, setDoubtAge] = useState('5');
  const [doubtGender, setDoubtGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [doubtClothing, setDoubtClothing] = useState('');
  const [doubtLandmark, setDoubtLandmark] = useState('Near Stupa Gate 2 Book Stall');
  const [doubtSubmittedId, setDoubtSubmittedId] = useState<string | null>(null);

  const handleDoubtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { reportId } = reportFoundChild({
      reportType: 'DOUBT_REPORT',
      isAnonymous: false,
      finderName: 'Citizen Pilgrim',
      finderPhone: '+91 94220 12345',
      childPhotoUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=400&auto=format&fit=crop&q=80',
      estimatedAge: parseInt(doubtAge, 10),
      gender: doubtGender,
      foundLocation: {
        lat: 21.1259,
        lng: 79.0568,
        landmark: doubtLandmark,
      },
      foundTime: new Date().toISOString(),
      clothing: {
        top: doubtClothing || 'Blue shirt',
        bottom: 'Jeans',
      },
      currentPhysicalStatus: 'Safe with Citizen Reporter',
    });

    setDoubtSubmittedId(reportId);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 relative overflow-hidden shadow-glass">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-safety-emerald/20 text-safety-emerald border border-safety-emerald/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Deeksha Bhoomi Citizen Safety Shield</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Child Safety & Emergency Family Reconnection
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Welcome to Deeksha Bhoomi. MEHFUS connects police assistance kiosks, ground volunteers, and citizens into an integrated safety mesh to prevent and resolve missing-child incidents rapidly.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-safety-orange/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main 3 Action Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: Found Child Doubt Report */}
        <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 flex flex-col justify-between space-y-4 hover:border-cyan-400 transition-all shadow-glass">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-wider uppercase text-cyan-400">
                Key Differentiator
              </span>
              <h3 className="text-lg font-bold text-white">
                {t.doubtReport.title}
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.doubtReport.subheading} Good-faith reporting is 100% protected without police hassle.
            </p>
          </div>

          <button
            onClick={() => {
              setShowDoubtForm(true);
              setDoubtSubmittedId(null);
            }}
            className="w-full py-3 rounded-2xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glowBlue transition-all flex items-center justify-center gap-2"
          >
            <span>Report a Found Child</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Pillar 2: Report Missing Child Fast Intake */}
        <div className="glass-panel p-6 rounded-3xl border border-safety-orange/30 flex flex-col justify-between space-y-4 hover:border-safety-orange transition-all shadow-glass">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-safety-orange/20 text-safety-orange flex items-center justify-center border border-safety-orange/40">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-wider uppercase text-safety-orange">
                Emergency Response
              </span>
              <h3 className="text-lg font-bold text-white">
                My Child is Missing
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Immediately notify police kiosks and all active volunteers within 2.0 km of your last known location.
            </p>
          </div>

          <Link
            href="/help-desk"
            className="w-full py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-safety-orange to-red-500 text-white shadow-glowOrange transition-all flex items-center justify-center gap-2"
          >
            <span>Open Emergency Intake</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Pillar 3: Pre-Register Child (Parent Vault) */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all shadow-glass">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/20">
              <UserPlus className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">
                Preventative Safety
              </span>
              <h3 className="text-lg font-bold text-white">
                Child Pre-Registration
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Store your child's photograph and clothing details safely in your private encrypted vault before entering large gatherings.
            </p>
          </div>

          <button
            onClick={() => alert('Parent Pre-Registration Vault is active for pilot participants. Use the Help Desk Kiosk for rapid on-site registration.')}
            className="w-full py-3 rounded-2xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center gap-2"
          >
            <span>Pre-Register Child</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Public Safety Notices */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-safety-orange" />
          Active Citizen Alerts at Deeksha Bhoomi
        </h3>

        <div className="space-y-3">
          {missingCases.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-[#0B0F19] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={c.photoUrl}
                  alt={c.childName}
                  className="w-14 h-14 rounded-xl object-cover border border-white/20"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{c.childName}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-safety-orange/20 text-safety-orange">
                      Age: {c.age} years
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Wearing: <strong>{c.clothing.top}</strong>, {c.clothing.bottom}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-safety-orange" />
                    Last seen near: {c.lastSeenLocation.landmark}
                  </p>
                </div>
              </div>

              <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                <span className="text-[11px] text-emerald-400 font-semibold">
                  {c.assignedVolunteersCount} Volunteers Active
                </span>
                <span className="text-[10px] text-slate-400">
                  Search Radius: {c.searchRadiusMeters}m
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Found Child Doubt Submission Modal */}
      {showDoubtForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0D1424] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">
                  {t.doubtReport.title}
                </h3>
                <p className="text-xs text-cyan-400 mt-0.5">
                  {t.doubtReport.noBlameNotice}
                </p>
              </div>
              <button
                onClick={() => setShowDoubtForm(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {!doubtSubmittedId ? (
              <form onSubmit={handleDoubtSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Estimated Age
                    </label>
                    <input
                      type="number"
                      value={doubtAge}
                      onChange={(e) => setDoubtAge(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={doubtGender}
                      onChange={(e) => setDoubtGender(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs"
                    >
                      <option value="MALE">Boy</option>
                      <option value="FEMALE">Girl</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Clothing Description
                  </label>
                  <input
                    type="text"
                    required
                    value={doubtClothing}
                    onChange={(e) => setDoubtClothing(e.target.value)}
                    placeholder="e.g. Royal blue graphic t-shirt and jeans"
                    className="w-full px-3 py-2 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Where is the child right now?
                  </label>
                  <input
                    type="text"
                    required
                    value={doubtLandmark}
                    onChange={(e) => setDoubtLandmark(e.target.value)}
                    placeholder="e.g. East Gate Book Stall 14"
                    className="w-full px-3 py-2 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs"
                  />
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200">
                  {t.doubtReport.noBlameDetails}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-cyan-500 text-slate-950 shadow-glowBlue hover:bg-cyan-400 transition-colors"
                >
                  Submit Found Child Doubt Report
                </button>
              </form>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center border border-cyan-500/40">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-white">
                  Report Received (Report #{doubtSubmittedId})
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  {t.doubtReport.nextSteps}
                </p>
                <button
                  onClick={() => setShowDoubtForm(false)}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
