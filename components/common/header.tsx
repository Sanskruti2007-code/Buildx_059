'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldAlert, 
  Users, 
  Monitor, 
  HelpCircle, 
  Globe, 
  Radio, 
  Bell, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { useSafetyStore } from '@/lib/store/safety-store';
import { DICTIONARIES, Locale } from '@/lib/i18n/dictionaries';
import { Role } from '@/types/safety';

export function Header() {
  const pathname = usePathname();
  const { role, setRole, locale, setLocale, activeNotification, clearNotification, missingCases } = useSafetyStore();
  const t = DICTIONARIES[locale];

  const activeOrangeCount = missingCases.filter((c) => c.status === 'SEARCHING' && c.severity === 'ORANGE').length;
  const activeRedCount = missingCases.filter((c) => c.status === 'SEARCHING' && c.severity === 'RED').length;

  const roleNavItems: { role: Role; label: string; href: string; icon: React.ReactNode }[] = [
    { role: 'CONTROL_ROOM', label: t.roleSwitcher.controlRoom, href: '/control-room', icon: <Monitor className="w-4 h-4" /> },
    { role: 'HELP_DESK', label: t.roleSwitcher.helpDesk, href: '/help-desk', icon: <HelpCircle className="w-4 h-4" /> },
    { role: 'VOLUNTEER', label: t.roleSwitcher.volunteer, href: '/volunteer', icon: <Users className="w-4 h-4" /> },
    { role: 'CITIZEN', label: t.roleSwitcher.citizen, href: '/citizen', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070B14]/90 backdrop-blur-xl">
      {/* Active High-Priority Emergency Ticker */}
      {(activeRedCount > 0 || activeNotification) && (
        <div className="bg-gradient-to-r from-red-600 via-safety-orange to-red-600 text-white px-4 py-1.5 text-xs font-semibold tracking-wide flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <Radio className="w-3.5 h-3.5 animate-spin" />
            <span>
              {activeNotification
                ? `${activeNotification.title}: ${activeNotification.message}`
                : `EMERGENCY ALERT: ${activeRedCount} Active Red-Level Cases under immediate Guardian Mesh search protocol.`}
            </span>
          </div>
          {activeNotification && (
            <button 
              onClick={clearNotification}
              className="text-white/80 hover:text-white text-xs underline ml-4 px-2"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Pilot Venue */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-safety-orange via-red-500 to-safety-blue p-0.5 shadow-glowOrange transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-safety-orange" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-wider text-white bg-gradient-to-r from-white via-slate-200 to-safety-orange bg-clip-text text-transparent">
                {t.appName}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-safety-emerald/20 text-safety-emerald border border-safety-emerald/30">
                PILOT V1
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[200px] sm:max-w-none">
              {t.pilotLocation}
            </p>
          </div>
        </Link>

        {/* Center: Operational Portals */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
          {roleNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href) || role === item.role;
            return (
              <Link
                key={item.role}
                href={item.href}
                onClick={() => setRole(item.role)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-safety-orange to-red-500 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Trilingual Selector & Case Counts */}
        <div className="flex items-center gap-3">
          {/* Active Case Badges */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs bg-slate-900/80 px-2.5 py-1 rounded-xl border border-white/10">
            <span className="w-2 h-2 rounded-full bg-safety-orange animate-ping" />
            <span className="text-slate-400">Cases:</span>
            <span className="font-bold text-safety-orange">{activeOrangeCount} Orange</span>
            {activeRedCount > 0 && (
              <span className="font-bold text-red-400 ml-1">/ {activeRedCount} Red</span>
            )}
          </div>

          {/* Locale Selector */}
          <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
            {(['en', 'mr', 'hi'] as Locale[]).map((loc) => (
              <button
                key={loc}
                onClick={() => setLocale(loc)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  locale === loc
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {loc === 'en' ? 'EN' : loc === 'mr' ? 'मराठी' : 'हिंदी'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Portal Navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-white/5 bg-[#0B0F19] py-1.5 px-2">
        {roleNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href) || role === item.role;
          return (
            <Link
              key={item.role}
              href={item.href}
              onClick={() => setRole(item.role)}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-2 rounded-lg ${
                isActive ? 'text-safety-orange font-bold' : 'text-slate-400'
              }`}
            >
              {item.icon}
              <span>{item.role === 'CONTROL_ROOM' ? 'Command' : item.role === 'HELP_DESK' ? 'Kiosk' : item.role === 'VOLUNTEER' ? 'Volunteer' : 'Citizen'}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
