import { supabase } from './supabase';
import type { AdminAuditLog } from '../types';

/**
 * Admin User Management
 */

const ADMIN_USER_IDS = [
  '187bfbe5-4349-4c15-afb7-c1ebd5ff1a9e', // Pablo
];

export function isAdmin(userId: string): boolean {
  return ADMIN_USER_IDS.includes(userId);
}

/**
 * PII Masking Functions
 */

export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;

  if (name.length <= 2) {
    return name[0] + '***@' + domain;
  }

  return name[0] + '***' + name[name.length - 1] + '@' + domain;
}

export function maskBodyFat(value: number | null): string {
  if (value === null) return 'N/A';
  return '**.*%';
}

export function maskUserId(userId: string): string {
  // Show first and last 4 characters
  if (userId.length <= 8) return '****';
  return userId.substring(0, 4) + '...' + userId.substring(userId.length - 4);
}

/**
 * Admin Audit Logging
 */

export interface AuditLogEntry {
  action: string;
  target_user_id?: string;
  table_name?: string;
  details?: Record<string, unknown>;
  reason?: string;
}

export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.warn('Cannot create audit log: No authenticated user');
    return;
  }

  const auditEntry: Partial<AdminAuditLog> = {
    admin_user_id: user.id,
    action: entry.action,
    target_user_id: entry.target_user_id || null,
    table_name: entry.table_name || null,
    details: entry.details || null,
    reason: entry.reason || null,
    ip_address: null, // Could fetch from browser if needed
  };

  const { error } = await supabase
    .from('admin_audit_log')
    .insert(auditEntry);

  if (error) {
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Wrapper function for admin queries with automatic audit logging
 */

export async function adminQuery<T>(
  table: string,
  filters: Record<string, unknown>,
  reason?: string
): Promise<T | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Must be authenticated to use admin query');
  }

  // Create audit log before query
  await createAuditLog({
    action: 'view_user_data',
    table_name: table,
    details: { filters, query_time: new Date().toISOString() },
    reason,
  });

  // Execute the actual query
  let query = supabase.from(table).select('*');

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { data, error } = await query;

  if (error) {
    console.error('Admin query error:', error);
    return null;
  }

  return data as T;
}

/**
 * Get audit logs for a specific user (for user data access requests)
 */

export async function getUserAuditLogs(targetUserId: string): Promise<AdminAuditLog[]> {
  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('*')
    .eq('target_user_id', targetUserId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }

  return data || [];
}
