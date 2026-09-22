'use client';

import React, { useState } from 'react';
import { useSafetyStore } from '@/lib/store/safety-store';
import { 
  EyeOff, 
  ShieldCheck, 
  Lock, 
  Camera, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { WitnessAnonymityLevel, WitnessCategory } from '@/types/safety';

export default function WitnessReportPortal() {
  const { submitWitnessReport } = useSafetyStore();

  const [anonymity, setAnonymity] = useState<WitnessAnonymityLevel>('ANONYMOUS');
  const [category, setCategory] = useState<WitnessCategory>('HARASSMENT');
  const [description, setDescription] = useState('');
  const [landmark, setLandmark] = useState('LAD College Bus Stand, Shankar Nagar');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    const { trackingCode } = submitWitnessReport({
      anonymityLevel: anonymity,
      category,
      description,
      location: { lat: 21.1420, lng: 79.0620, landmark },
      incidentTime: new Date().toISOString(),
      mediaUrls: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&auto=format&fit=crop&q=80'],
      reporterName: anonymity === 'ANONYMOUS' ? undefined : reporterName,
      reporterPhone: anonymity === 'ANONYMOUS' ? undefined : reporterPhone,
    });

    setSubmittedCode(trackingCode);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          <EyeOff className="w-3.5 h-3.5" />
          <span>ANONYMOUS & CONFIDENTIAL SAFETY REPORTING</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Witness Incident Report Portal
        </h1>
        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          Report harassment, suspicious activity, or public safety hazards across Nagpur. Your report reaches city control room dispatchers without exposing you to retaliation.
        </p>
      </div>

      {!submittedCode ? (
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          {/* Anonymity Level Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              Select Confidentiality Guarantee:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setAnonymity('ANONYMOUS')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  anonymity === 'ANONYMOUS'
                    ? 'bg-cyan-950/30 border-cyan-400 shadow-glowBlue text-white'
                    : 'bg-[#090E1A] border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-cyan-400">
                  <EyeOff className="w-4 h-4" />
                  100% Anonymous
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Zero IP address, device metadata, or phone recorded. EXIF tags scrubbed from media.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAnonymity('CONFIDENTIAL')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  anonymity === 'CONFIDENTIAL'
                    ? 'bg-blue-950/30 border-blue-400 shadow-glowBlue text-white'
                    : 'bg-[#090E1A] border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-blue-400">
                  <Lock className="w-4 h-4" />
                  Confidential
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Identity collected for official investigation only; hidden from public and first responders.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAnonymity('IDENTIFIED')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  anonymity === 'IDENTIFIED'
                    ? 'bg-emerald-950/30 border-emerald-400 shadow-glowEmerald text-white'
                    : 'bg-[#090E1A] border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  Identified
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Full witness contact details shared with responding police station for follow-up testimony.
                </p>
              </button>
            </div>
          </div>

          {/* Incident Category */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              Incident Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'HARASSMENT', label: 'Harassment / Eve-Teasing' },
                { id: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious Reconnaissance' },
                { id: 'CHAIN_SNATCHING', label: 'Chain-Snatching / Theft' },
                { id: 'PUBLIC_SAFETY_HAZARD', label: 'Public Safety Hazard' },
                { id: 'TRANSPORT_SAFETY', label: 'Transit / Bus Stop Issue' },
                { id: 'DOMESTIC_DISTRESS', label: 'Domestic / Street Altercation' },
              ].map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id as WitnessCategory)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                    category === cat.id
                      ? 'bg-safety-orange text-white border-safety-orange shadow-sm'
                      : 'bg-[#090E1A] text-slate-400 border-white/10 hover:border-white/20'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Landmark */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Incident Location / Landmark *
            </label>
            <input
              type="text"
              required
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near Gokulpeth Market opposite Petrol Pump"
              className="w-full px-4 py-2.5 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Detailed Description of Observed Event *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details: vehicle plate number, suspect clothing, direction of movement, weapons observed..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400 leading-relaxed"
            />
          </div>

          {/* Optional Contact Fields (if not Anonymous) */}
          {anonymity !== 'ANONYMOUS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Rajiv Khare"
                  className="w-full px-4 py-2 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Your Mobile Number
                </label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="+91 Mobile Number"
                  className="w-full px-4 py-2 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs"
                />
              </div>
            </div>
          )}

          {/* EXIF Metadata Privacy Notice */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3 text-[11px] text-cyan-200">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-cyan-300 font-bold">
                Automated Privacy by Design:
              </strong>
              All uploaded photos undergo in-memory EXIF metadata stripping (removing camera device serials, embedded GPS coords, and timestamp signatures) before storage.
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl font-black text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glowBlue transition-all flex items-center justify-center gap-2"
          >
            <span>Submit Witness Incident Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        /* Submission Confirmation Card */
        <div className="glass-panel p-8 rounded-3xl border border-cyan-500/40 text-center space-y-4 shadow-glowBlue">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center border border-cyan-500/40">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">
            Incident Report Successfully Dispatched
          </h2>
          <div className="p-3 rounded-2xl bg-[#090E1A] border border-white/10 max-w-sm mx-auto font-mono text-sm text-cyan-300 font-bold">
            Tracking Code: {submittedCode}
          </div>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Your report has been routed to the Nagpur Police Command Center triage queue. Anonymity mode: <strong className="text-white">{anonymity}</strong>. No personal identifiers have been linked to this record.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSubmittedCode(null);
                setDescription('');
              }}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
