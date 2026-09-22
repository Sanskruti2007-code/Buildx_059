'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getOfflineSyncQueue, flushOfflineSyncQueue, isSupabaseConfigured } from '@/lib/supabase/client';

export function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [justReconnected, setJustReconnected] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const updateQueueCount = () => {
      setPendingSyncCount(getOfflineSyncQueue().length);
    };

    updateQueueCount();

    const handleOnline = async () => {
      setIsOnline(true);
      setJustReconnected(true);
      updateQueueCount();

      if (isSupabaseConfigured()) {
        setIsSyncing(true);
        await flushOfflineSyncQueue();
        setIsSyncing(false);
        updateQueueCount();
      }

      setTimeout(() => {
        setJustReconnected(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateQueueCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const interval = setInterval(updateQueueCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await flushOfflineSyncQueue();
    setPendingSyncCount(getOfflineSyncQueue().length);
    setIsSyncing(false);
  };

  // If online, no pending queue, and not recently reconnected, keep banner subtle
  if (isOnline && pendingSyncCount === 0 && !justReconnected) {
    return null;
  }

  return (
    <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-[800] max-w-lg w-[92%] sm:w-auto animate-fadeIn pointer-events-auto">
      <div className={`px-4 py-2 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-2xl backdrop-blur-md transition-all ${
        !isOnline 
          ? 'bg-amber-950/80 border-amber-500/40 text-amber-200' 
          : justReconnected 
          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200' 
          : 'bg-slate-900/90 border-purple-500/30 text-purple-200'
      }`}>
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          ) : justReconnected ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Wifi className="w-4 h-4 text-purple-400 shrink-0" />
          )}

          <div className="leading-tight">
            {!isOnline ? (
              <div>
                <strong className="text-white">Offline Mesh Cache Active</strong>
                <span className="text-[11px] block text-amber-300/80">All emergency operations safely queued locally</span>
              </div>
            ) : justReconnected ? (
              <div>
                <strong className="text-white">Network Restored</strong>
                <span className="text-[11px] block text-emerald-300/80">Re-synchronized with Mehfus authority network</span>
              </div>
            ) : (
              <div>
                <strong className="text-white">{pendingSyncCount} Pending Offline Records</strong>
                <span className="text-[11px] block text-slate-300">Awaiting cloud confirmation</span>
              </div>
            )}
          </div>
        </div>

        {pendingSyncCount > 0 && isOnline && (
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
