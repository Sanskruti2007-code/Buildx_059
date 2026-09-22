'use client';

import React, { useState } from 'react';
import { useSafetyStore } from '@/lib/store/safety-store';
import { DICTIONARIES } from '@/lib/i18n/dictionaries';
import { 
  HelpCircle, 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  Camera, 
  MapPin, 
  Clock, 
  KeyRound, 
  Sparkles,
  PhoneCall,
  UserCheck
} from 'lucide-react';

export default function HelpDeskKiosk() {
  const { 
    locale, 
    reportMissingChild, 
    reportFoundChild, 
    missingCases, 
    verifyCaseOtp 
  } = useSafetyStore();
  const t = DICTIONARIES[locale];

  const [activeTab, setActiveTab] = useState<'MISSING' | 'FOUND' | 'BROADCASTS'>('MISSING');

  // Form State for Missing Child
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('5');
  const [childGender, setChildGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [clothingTop, setClothingTop] = useState('');
  const [clothingBottom, setClothingBottom] = useState('');
  const [landmark, setLandmark] = useState('Deeksha Bhoomi North Gate (Gate 1)');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1543332164-6e82f355badc?w=400&auto=format&fit=crop&q=80');
  
  // OTP Verification State
  const [generatedCaseId, setGeneratedCaseId] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);

  // Form State for Found Child Doubt
  const [foundAge, setFoundAge] = useState('5');
  const [foundGender, setFoundGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [foundClothingTop, setFoundClothingTop] = useState('');
  const [foundClothingBottom, setFoundClothingBottom] = useState('');
  const [foundLocationLandmark, setFoundLocationLandmark] = useState('East Gate Book Stall Area');
  const [finderName, setFinderName] = useState('Constable Vinayak Sawant');
  const [finderPhone, setFinderPhone] = useState('+91 98200 44556');
  const [foundSuccessId, setFoundSuccessId] = useState<string | null>(null);
  const [matchFoundAlert, setMatchFoundAlert] = useState<string | null>(null);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName || !guardianPhone) return;

    const { caseId } = reportMissingChild({
      childName,
      age: parseInt(childAge, 10),
      gender: childGender,
      photoUrl,
      clothing: {
        top: clothingTop || 'Red t-shirt',
        bottom: clothingBottom || 'Blue jeans',
      },
      lastSeenLocation: {
        lat: 21.1265,
        lng: 79.0562,
        landmark,
      },
      lastSeenTime: new Date().toISOString(),
      reporterId: 'HELP-DESK-KIOSK-01',
      reporterName: guardianName || 'Parent at Help Desk 1',
      reporterPhone: guardianPhone,
      searchRadiusMeters: 2000,
    });

    setGeneratedCaseId(caseId);
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (!generatedCaseId) return;
    const ok = verifyCaseOtp(generatedCaseId, otpValue || '492015');
    if (ok) {
      setIsVerifiedSuccess(true);
    }
  };

  const handleResetMissingForm = () => {
    setGeneratedCaseId(null);
    setOtpSent(false);
    setOtpValue('');
    setIsVerifiedSuccess(false);
    setChildName('');
    setClothingTop('');
    setClothingBottom('');
    setGuardianPhone('');
  };

  const handleFoundChildSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { reportId, topMatch } = reportFoundChild({
      reportType: 'DOUBT_REPORT',
      isAnonymous: false,
      finderName,
      finderPhone,
      childPhotoUrl: photoUrl,
      estimatedAge: parseInt(foundAge, 10),
      gender: foundGender,
      foundLocation: {
        lat: 21.1259,
        lng: 79.0568,
        landmark: foundLocationLandmark,
      },
      foundTime: new Date().toISOString(),
      clothing: {
        top: foundClothingTop || 'Blue t-shirt',
        bottom: foundClothingBottom || 'Dark jeans',
      },
      currentPhysicalStatus: 'Safe at Help Desk 1 with Police Personnel',
    });

    setFoundSuccessId(reportId);
    if (topMatch && topMatch.compositeScore >= 0.80) {
      setMatchFoundAlert(`Top Candidate Match: Case ${topMatch.missingCaseId} (${(topMatch.compositeScore * 100).toFixed(1)}% Match Confidence)! Control Room alerted.`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Kiosk Banner Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-safety-blue/20 text-safety-blue border border-safety-blue/40">
              POLICE ASSISTANCE KIOSK #1
            </span>
            <span className="text-xs text-slate-400">Deeksha Bhoomi Ground • Nagpur</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            {t.helpDesk.title}
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            {t.helpDesk.subtitle}
          </p>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('MISSING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'MISSING'
                ? 'bg-safety-orange text-white shadow-glowOrange'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.helpDesk.reportMissingTab}
          </button>
          <button
            onClick={() => setActiveTab('FOUND')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'FOUND'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-glowBlue'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.helpDesk.reportFoundTab}
          </button>
          <button
            onClick={() => setActiveTab('BROADCASTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'BROADCASTS'
                ? 'bg-safety-emerald text-white shadow-glowEmerald'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.helpDesk.crossDeskAlertsTab}
          </button>
        </div>
      </div>

      {/* Tab 1: Missing Child Intake Form */}
      {activeTab === 'MISSING' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          {!isVerifiedSuccess ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-safety-orange" />
                    Immediate Missing Child Registration
                  </h2>
                  <p className="text-xs text-slate-400">
                    Triggers high-priority Guardian Mesh alert within 2.0 km radius.
                  </p>
                </div>
                <span className="text-xs font-mono text-safety-orange bg-safety-orange/10 px-3 py-1 rounded-full border border-safety-orange/20">
                  Target Dispatch &lt; 2 Minutes
                </span>
              </div>

              {/* Child Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t.helpDesk.childName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="e.g. Rohan Gaikwad"
                    className="w-full px-4 py-3 rounded-xl bg-[#090E1A] border border-white/15 text-white text-sm focus:outline-none focus:border-safety-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t.helpDesk.approxAge} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#090E1A] border border-white/15 text-white text-sm focus:outline-none focus:border-safety-orange"
                  />
                </div>
              </div>

              {/* Gender & Photo Preset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t.helpDesk.gender}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['MALE', 'FEMALE', 'OTHER'] as const).map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setChildGender(g)}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          childGender === g
                            ? 'bg-safety-orange text-white border-safety-orange'
                            : 'bg-[#090E1A] text-slate-400 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {g === 'MALE' ? t.helpDesk.male : g === 'FEMALE' ? t.helpDesk.female : t.helpDesk.other}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Recent Photograph (Camera / Upload)
                  </label>
                  <div className="flex items-center gap-3">
                    <img
                      src={photoUrl}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-safety-orange"
                    />
                    <select
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs focus:outline-none focus:border-safety-orange"
                    >
                      <option value="https://images.unsplash.com/photo-1543332164-6e82f355badc?w=400&auto=format&fit=crop&q=80">
                        Boy (Blue shirt sample)
                      </option>
                      <option value="https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400&auto=format&fit=crop&q=80">
                        Girl (Yellow frock sample)
                      </option>
                      <option value="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80">
                        Child (Red cap sample)
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Clothing Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t.helpDesk.clothingTop}
                  </label>
                  <input
                    type="text"
                    value={clothingTop}
                    onChange={(e) => setClothingTop(e.target.value)}
                    placeholder="e.g. Yellow cartoon graphic t-shirt"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs focus:outline-none focus:border-safety-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t.helpDesk.clothingBottom}
                  </label>
                  <input
                    type="text"
                    value={clothingBottom}
                    onChange={(e) => setClothingBottom(e.target.value)}
                    placeholder="e.g. Navy blue denim shorts"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs focus:outline-none focus:border-safety-orange"
                  />
                </div>
              </div>

              {/* Landmark & Guardian Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t.helpDesk.lastSeenLandmark}
                  </label>
                  <select
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs focus:outline-none focus:border-safety-orange"
                  >
                    <option value="Deeksha Bhoomi North Gate (Gate 1)">North Gate (Gate 1)</option>
                    <option value="Deeksha Bhoomi East Gate (Gate 2)">East Gate (Gate 2)</option>
                    <option value="Stupa Circumference Pathway">Stupa Circumference</option>
                    <option value="Food Pavillion / Langar Area">Food Pavillion</option>
                    <option value="South Bus Stand & Parking">South Bus Stand</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="e.g. Sunita Gaikwad"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs focus:outline-none focus:border-safety-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t.helpDesk.guardianPhone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="+91 98901 23456"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs focus:outline-none focus:border-safety-orange"
                  />
                </div>
              </div>

              {/* OTP Generation & Verification Section */}
              {!otpSent ? (
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-safety-orange via-red-500 to-safety-orange text-white shadow-glowOrange hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  {t.helpDesk.generateOtp}
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-[#121A2E] border border-safety-orange/40 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-safety-orange">
                      OTP Sent to {guardianPhone}
                    </span>
                    <span className="text-xs text-slate-400">
                      Case ID: <strong className="text-white">{generatedCaseId}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {t.helpDesk.otpSentMessage} (Pilot Demo Code: <strong>492015</strong>)
                  </p>

                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value)}
                      placeholder={t.helpDesk.otpPlaceholder}
                      className="px-4 py-2.5 rounded-xl bg-[#090E1A] border border-white/20 text-white font-mono text-center tracking-widest text-base w-44 focus:outline-none focus:border-safety-orange"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs bg-safety-emerald text-white hover:bg-emerald-600 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {t.helpDesk.verifyOtp}
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* Success View */
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-safety-emerald/20 text-safety-emerald mx-auto flex items-center justify-center border border-safety-emerald/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white">
                Guardian Mesh Alert Activated!
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                {t.helpDesk.caseGenerated} <span className="font-mono font-bold text-safety-orange text-base">{generatedCaseId}</span>. All police kiosks and verified volunteers within 2.0 km are actively searching.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleResetMissingForm}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Register Another Incident
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Found Child Doubt Report Form */}
      {activeTab === 'FOUND' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-3">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-2">
              {t.doubtReport.badge}
            </div>
            <h2 className="text-xl font-black text-white">
              {t.doubtReport.title}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {t.doubtReport.noBlameDetails}
            </p>
          </div>

          {!foundSuccessId ? (
            <form onSubmit={handleFoundChildSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Estimated Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={foundAge}
                    onChange={(e) => setFoundAge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Estimated Gender
                  </label>
                  <select
                    value={foundGender}
                    onChange={(e) => setFoundGender(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="MALE">Male (Boy)</option>
                    <option value="FEMALE">Female (Girl)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Child's Upper Clothing (Color / Pattern)
                  </label>
                  <input
                    type="text"
                    value={foundClothingTop}
                    onChange={(e) => setFoundClothingTop(e.target.value)}
                    placeholder="e.g. Royal blue graphic shirt"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Child's Lower Clothing (Jeans / Shorts / Skirt)
                  </label>
                  <input
                    type="text"
                    value={foundClothingBottom}
                    onChange={(e) => setFoundClothingBottom(e.target.value)}
                    placeholder="e.g. Dark blue jeans"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Location Found / Near Landmark
                </label>
                <input
                  type="text"
                  value={foundLocationLandmark}
                  onChange={(e) => setFoundLocationLandmark(e.target.value)}
                  placeholder="e.g. East Gate Book Stall 14"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Reporting Officer / Finder Name
                  </label>
                  <input
                    type="text"
                    value={finderName}
                    onChange={(e) => setFinderName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={finderPhone}
                    onChange={(e) => setFinderPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090E1A] border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-glowBlue hover:scale-[1.01] transition-all"
              >
                Submit Doubt Report & Trigger Two-Way Match Engine
              </button>
            </form>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center border border-cyan-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">
                Doubt Report Successfully Filed (#{foundSuccessId})
              </h3>
              {matchFoundAlert && (
                <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-bold max-w-lg mx-auto">
                  {matchFoundAlert}
                </div>
              )}
              <button
                onClick={() => setFoundSuccessId(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white"
              >
                File Another Report
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Cross-Desk Alerts View */}
      {activeTab === 'BROADCASTS' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-safety-emerald" />
              Real-Time Cross-Desk Incident Broadcasts
            </h2>
            <span className="text-xs text-slate-400">Synced across all ground kiosks</span>
          </div>

          <div className="space-y-3">
            {missingCases.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-[#0B0F19] border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={c.photoUrl}
                    alt={c.childName}
                    className="w-12 h-12 rounded-xl object-cover border border-white/20"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{c.childName}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-safety-orange/20 text-safety-orange">
                        {c.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Wearing: {c.clothing.top}, {c.clothing.bottom} • Last seen: {c.lastSeenLocation.landmark}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400">
                    {c.assignedVolunteersCount} Searchers Active
                  </span>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                    Search Radius: {c.searchRadiusMeters}m
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
