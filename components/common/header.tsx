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
  Car, 
  EyeOff, 
  Heart, 
  Train,
  Cpu
} from 'lucide-react';
import { useSafetyStore } from '@/lib/store/safety-store';
import { DICTIONARIES, Locale } from '@/lib/i18n/dictionaries';

export function Header() {
  const pathname = usePathname();
  const { locale, setLocale, activeNotification, clearNotification, missingCases, activeSafeRide, wanderAlerts, crossCityEscalations } = useSafetyStore();
  const t = DICTIONARIES[locale];

  const activeOrangeCount = missingCases.filter((c) => c.status === 'SEARCHING' && c.severity === 'ORANGE').length;
  const activeRedCount = missingCases.filter((c) => c.status === 'SEARCHING' && c.severity === 'RED').length;
  const activeSafeRideAlert = activeSafeRide && activeSafeRide.safetyState !== 'GREEN' && activeSafeRide.safetyState !== 'RESOLVED';
  const activeWanderCount = wanderAlerts.filter((a) => a.status === 'ACTIVE_SEARCH').length;

  const navItems = [
    { label: 'Operations', href: '/operations', icon: <Cpu className="w-3.5 h-3.5" />, badge: crossCityEscalations.length > 0 ? `${crossCityEscalations.length}` : undefined },
    { label: 'Control Room', href: '/control-room', icon: <Monitor className="w-3.5 h-3.5" /> },
    { label: 'SafeRide', href: '/safety', icon: <Car className="w-3.5 h-3.5" />, badge: activeSafeRideAlert ? 'ALERT' : undefined },
    { label: 'Elder Care', href: '/family', icon: <Heart className="w-3.5 h-3.5" />, badge: activeWanderCount > 0 ? `${activeWanderCount}` : undefined },
    { label: 'Witness', href: '/witness', icon: <EyeOff className="w-3.5 h-3.5" /> },
    { label: 'Transit Hubs', href: '/transport', icon: <Train className="w-3.5 h-3.5" /> },
    { label: 'Help-Desk', href: '/help-desk', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { label: 'Volunteer', href: '/volunteer', icon: <Users className="w-3.5 h-3.5" /> },
    { label: 'Citizen', href: '/citizen', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070B14]/92 backdrop-blur-xl">
      {/* Active High-Priority Emergency Ticker */}
      {(activeRedCount > 0 || activeNotification || activeSafeRide?.safetyState === 'RED') && (
        <div className="bg-gradient-to-r from-red-600 via-safety-orange to-red-600 text-white px-4 py-1 text-xs font-semibold tracking-wide flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 max-w-6xl mx-auto w-full">
            <Radio className="w-3.5 h-3.5 animate-spin" />
            <span>
              {activeNotification
                ? `${activeNotification.title}: ${activeNotification.message}`
                : `CRITICAL ALERT: Emergency Guardian Mesh response active. Nearest patrols auto-dispatched.`}
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
        {/* Left: Brand & Hub */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-safety-orange via-red-500 to-safety-blue p-0.5 shadow-glowOrange transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-safety-orange" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-wider text-white bg-gradient-to-r from-white via-slate-200 to-safety-orange bg-clip-text text-transparent">
                MEHFUS
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PHASE 4: PROACTIVE INTELLIGENCE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[160px] sm:max-w-none">
              Risk Intelligence • k-Anonymity Grid • Operational Optimization
            </p>
          </div>
        </Link>

        {/* Center: Comprehensive Navigation */}
        <nav className="hidden xl:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-safety-orange to-red-500 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-red-500 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Language Switcher & Operational Indicators */}
        <div className="flex items-center gap-3">
          {/* Quick SafeRide Indicator */}
          {activeSafeRide && (
            <Link 
              href="/safety" 
              className={`hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl border ${
                activeSafeRideAlert ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' : 'bg-white/5 text-slate-300 border-white/10'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>SafeRide: <strong>{activeSafeRide.safetyState}</strong></span>
            </Link>
          )}

          {/* Trilingual Selector */}
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

      {/* Mobile / Compact Navigation Scroller */}
      <div className="xl:hidden flex items-center gap-1 border-t border-white/5 bg-[#0B0F19] py-1.5 px-3 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 text-xs font-semibold py-1 px-2.5 rounded-lg shrink-0 ${
                isActive ? 'bg-safety-orange text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              )}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
