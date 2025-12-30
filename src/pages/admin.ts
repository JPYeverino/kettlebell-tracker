import { supabase } from '../lib/supabase';
import type { PilotInvite, AdminAuditLog } from '../types';
import type { User } from '@supabase/supabase-js';
import { maskEmail, createAuditLog } from '../lib/admin-utils';

let currentUser: User | null = null;
let invites: PilotInvite[] = [];
let userEmailMap: Record<string, string> = {};

export function renderAdmin(container: HTMLElement, user: User) {
  currentUser = user;
  loadData().then(() => render(container));
}

async function loadData() {
  if (!currentUser) return;

  // Log admin access
  await createAuditLog({
    action: 'view_admin_dashboard',
    details: { timestamp: new Date().toISOString() },
  });

  // Load invite codes
  const { data: inviteData } = await supabase
    .from('pilot_invites')
    .select('*')
    .order('code', { ascending: true });

  if (inviteData) {
    invites = inviteData;
  }

  // Load user emails for those who used codes
  const usedByIds = invites
    .filter(inv => inv.used_by)
    .map(inv => inv.used_by as string);

  if (usedByIds.length > 0) {
    // Fetch user emails from auth.users
    // Note: This requires service role key or admin API access
    // For now, we'll show masked user IDs
    userEmailMap = {}; // TODO: Implement user email fetching if needed
  }
}

function getUserEmail(userId: string | null): string {
  if (!userId) return 'N/A';
  // If we had user emails, we'd return maskEmail(userEmailMap[userId])
  // For now, return masked user ID
  return userId.substring(0, 8) + '...';
}

function render(container: HTMLElement) {
  const usedCount = invites.filter(inv => inv.used).length;
  const availableCount = invites.filter(inv => !inv.used).length;

  container.innerHTML = `
    <div class="admin-dashboard">
      <header class="admin-header">
        <h1>Admin Dashboard</h1>
        <p class="subtitle">Pilot program management</p>
      </header>

      <div class="admin-stats">
        <div class="stat-card">
          <div class="stat-value">${usedCount}</div>
          <div class="stat-label">Users Enrolled</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${availableCount}</div>
          <div class="stat-label">Codes Available</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${invites.length}</div>
          <div class="stat-label">Total Codes</div>
        </div>
      </div>

      <section class="admin-section">
        <h2>Invite Codes</h2>
        <p class="section-subtitle">Distribute these codes via Discord DM</p>

        <div class="invite-table">
          <div class="table-header">
            <div>Code</div>
            <div>Status</div>
            <div>Used By</div>
            <div>Used At</div>
          </div>

          ${invites.map(invite => `
            <div class="table-row ${invite.used ? 'row-used' : 'row-available'}">
              <div class="code-cell">
                <code>${invite.code}</code>
              </div>
              <div class="status-cell">
                ${invite.used
                  ? '<span class="badge badge-used">Used</span>'
                  : '<span class="badge badge-available">Available</span>'
                }
              </div>
              <div class="user-cell">
                ${invite.used_by ? getUserEmail(invite.used_by) : '-'}
              </div>
              <div class="date-cell">
                ${invite.used_at
                  ? new Date(invite.used_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '-'
                }
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="admin-section">
        <h2>Privacy & Audit</h2>
        <p class="section-subtitle">All admin data access is automatically logged</p>
        <div class="info-box">
          <strong>PII Masking:</strong> User emails and IDs are masked in this view for privacy.<br>
          <strong>Audit Logging:</strong> Your access to this dashboard has been logged.<br>
          <strong>User Rights:</strong> Users can request their audit logs by contacting support.
        </div>
      </section>
    </div>
  `;
}
