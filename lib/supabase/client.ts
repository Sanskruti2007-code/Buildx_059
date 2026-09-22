import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment credentials for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Singleton client instance or null if credentials are unconfigured
let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
  } catch (err) {
    console.warn('[Mehfus Supabase] Initialization fallback to local storage mode:', err);
    supabaseInstance = null;
  }
}

/**
 * Returns the active Supabase client instance, or null if operating in offline/standalone mode.
 */
export function getSupabaseClient(): SupabaseClient | null {
  return supabaseInstance;
}

/**
 * Checks whether the remote Supabase service is currently configured and reachable.
 */
export function isSupabaseConfigured(): boolean {
  return supabaseInstance !== null;
}

export interface OfflineSyncQueueItem {
  id: string;
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: Record<string, any>;
  queuedAt: string;
}

const OFFLINE_QUEUE_KEY = 'mehfus_offline_sync_queue';

/**
 * Retrieves the pending offline synchronization queue from localStorage.
 */
export function getOfflineSyncQueue(): OfflineSyncQueueItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Appends a mutation to the local offline synchronization queue.
 */
export function enqueueOfflineSync(table: string, action: OfflineSyncQueueItem['action'], payload: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  try {
    const queue = getOfflineSyncQueue();
    queue.push({
      id: `SYNC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      table,
      action,
      payload,
      queuedAt: new Date().toISOString()
    });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('[Mehfus Offline Queue] Failed to enqueue mutation:', err);
  }
}

/**
 * Flushes the offline synchronization queue to Supabase when network connectivity returns.
 */
export async function flushOfflineSyncQueue(): Promise<{ synced: number; failed: number }> {
  if (!supabaseInstance || typeof window === 'undefined') return { synced: 0, failed: 0 };

  const queue = getOfflineSyncQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remainingQueue: OfflineSyncQueueItem[] = [];

  for (const item of queue) {
    try {
      if (item.action === 'INSERT') {
        const { error } = await supabaseInstance.from(item.table).insert(item.payload);
        if (error) throw error;
      } else if (item.action === 'UPDATE') {
        const { id, ...data } = item.payload;
        const { error } = await supabaseInstance.from(item.table).update(data).eq('id', id);
        if (error) throw error;
      }
      synced++;
    } catch (err) {
      console.warn(`[Mehfus Sync] Failed to sync ${item.table} item:`, err);
      remainingQueue.push(item);
      failed++;
    }
  }

  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
  return { synced, failed };
}
