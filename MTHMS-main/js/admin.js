/* CareCluster — Admin Settings & Audit Logs */
CareCluster.Admin = (() => {
    const { Icons, showToast, esc, formatDate, formatDateTime } = CareCluster.Utils;
    function renderSettings() {
        const hid = CareCluster.Auth.currentHospitalId(); const hospital = CareCluster.Data.HOSPITALS.find(h => h.id === hid);
        const users = CareCluster.Data.getStore(hid, 'users');
        let html = `<div class="page-header"><h2>Settings</h2></div><div class="grid-2" style="gap:var(--space-6)">`;
        // Hospital profile
        html += `<div class="card"><h4 class="card-title" style="margin-bottom:var(--space-4)">Hospital Profile</h4>
      <div style="display:grid;gap:var(--space-3)">
        <div><small style="color:var(--text-muted)">Name</small><div style="font-weight:600">${esc(hospital?.name)}</div></div>
        <div><small style="color:var(--text-muted)">Code</small><div>${hospital?.code}</div></div>
        <div><small style="color:var(--text-muted)">Address</small><div>${esc(hospital?.address)}</div></div>
        <div><small style="color:var(--text-muted)">Phone</small><div>${hospital?.phone}</div></div>
        <div><small style="color:var(--text-muted)">Email</small><div>${hospital?.email}</div></div></div></div>`;
        // Theme
        html += `<div class="card"><h4 class="card-title" style="margin-bottom:var(--space-4)">Appearance</h4>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) 0;border-bottom:1px solid var(--border-color)"><span>Theme</span>
        <div class="theme-toggle" onclick="CareCluster.Theme.toggle()"><span style="font-size:var(--fs-sm);color:var(--text-muted)">Dark</span><div class="theme-toggle-track"><div class="theme-toggle-thumb">${Icons.moon}</div></div><span style="font-size:var(--fs-sm);color:var(--text-muted)">Light</span></div></div></div>`;
        // Role management
        html += `<div class="card" style="grid-column:1/-1"><h4 class="card-title" style="margin-bottom:var(--space-4)">Registered Users (${users.length})</h4>
      <div class="table-wrapper"><table class="table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th></tr></thead><tbody>
        ${users.map(u => `<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td><span class="badge badge-approved">${CareCluster.RBAC.getRoleLabel(u.role)}</span></td><td>${esc(u.department || '—')}</td></tr>`).join('')}
      </tbody></table></div></div>`;
        // System actions
        html += `<div class="card"><h4 class="card-title" style="margin-bottom:var(--space-4)">System</h4>
      <button class="btn btn-danger" onclick="CareCluster.Utils.confirmAction('Reset ALL data for this hospital? This cannot be undone.',()=>{const hid=CareCluster.Auth.currentHospitalId();Object.keys(localStorage).forEach(k=>{if(k.startsWith('cc_'+hid+'_'))localStorage.removeItem(k)});CareCluster.Data.seedIfEmpty();CareCluster.Utils.showToast('Data reset','success');CareCluster.App.navigate('settings')})">Reset Hospital Data</button></div>`;
        html += '</div>'; return html;
    }
    function renderAuditLogs() {
        const hid = CareCluster.Auth.currentHospitalId(); const logs = CareCluster.Data.getStore(hid, 'audit_logs').reverse();
        let html = `<div class="page-header"><h2>Audit Logs</h2><div class="page-header-actions"><span class="badge badge-approved">${logs.length} Records</span></div></div>`;
        html += `<div class="table-wrapper"><table class="table"><thead><tr><th>Timestamp</th><th>Action</th><th>Details</th><th>User</th></tr></thead><tbody>`;
        if (logs.length === 0) html += '<tr><td colspan="4" class="text-center text-muted" style="padding:var(--space-8)">No audit logs.</td></tr>';
        else logs.slice(0, 100).forEach(l => { html += `<tr><td style="white-space:nowrap">${formatDateTime(l.timestamp)}</td><td><code style="font-size:var(--fs-xs);background:var(--bg-input);padding:2px 6px;border-radius:var(--radius-sm)">${l.action}</code></td><td style="font-size:var(--fs-sm)">${esc(l.details || '—')}</td><td style="font-size:var(--fs-sm)">${esc(l.user_name || '—')}</td></tr>`; });
        html += '</tbody></table></div>'; return html;
    }
    return { renderSettings, renderAuditLogs };
})();
