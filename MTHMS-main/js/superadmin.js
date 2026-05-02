/* CareCluster — Super Admin Cross-Hospital Analytics */
CareCluster.SuperAdmin = (() => {
    const { Icons, drawBarChart, drawDonutChart, esc } = CareCluster.Utils;
    const hospitals = () => CareCluster.Data.HOSPITALS;

    function renderAnalytics() {
        let html = `<div class="page-header"><h2>Hospital Analytics</h2></div>`;
        html += `<div class="grid-2" style="gap:var(--space-6)">
      <div class="card"><div class="card-header"><h4 class="card-title">Patients per Hospital</h4></div><div class="chart-container" style="height:220px"><canvas id="sa-chart-patients"></canvas></div></div>
      <div class="card"><div class="card-header"><h4 class="card-title">Admitted vs Discharged</h4></div><div class="chart-container" style="height:220px"><canvas id="sa-chart-admissions"></canvas></div></div></div>`;
        // Per-hospital details
        html += `<div class="table-wrapper" style="margin-top:var(--space-6)"><table class="table"><thead><tr><th>Hospital</th><th>Patients</th><th>Admitted</th><th>Discharged</th><th>Emergency</th><th>Blood Units</th><th>Rating</th></tr></thead><tbody>`;
        hospitals().forEach(h => {
            const p = CareCluster.Data.getStore(h.id, 'patients'); const fb = CareCluster.Data.getStore(h.id, 'feedback');
            const avg = fb.length ? (fb.reduce((s, f) => s + (f.overall_rating || 0), 0) / fb.length).toFixed(1) : '—';
            html += `<tr><td><strong>${esc(h.name)}</strong></td><td>${p.length}</td><td>${p.filter(x => x.status === 'admitted').length}</td><td>${p.filter(x => x.status === 'discharged').length}</td><td style="color:var(--danger)">${p.filter(x => x.severity === 'emergency').length}</td><td>${CareCluster.Data.getStore(h.id, 'blood_bank').reduce((s, b) => s + (b.units || 0), 0)}</td><td style="color:var(--warning)">${avg}</td></tr>`;
        });
        html += '</tbody></table></div>'; return html;
    }
    function renderOrganAnalytics() {
        let html = `<div class="organ-accent"><div class="page-header"><h2>Organ Donation Analytics</h2></div>`;
        let totalDonors = 0, totalApproved = 0, totalCompleted = 0; const organCounts = {};
        hospitals().forEach(h => { const d = CareCluster.Data.getStore(h.id, 'organ_donors'); totalDonors += d.length; totalApproved += d.filter(x => x.status === 'Approved').length; totalCompleted += d.filter(x => x.status === 'Completed').length; d.forEach(x => (x.organs || []).forEach(o => { organCounts[o] = (organCounts[o] || 0) + 1 })); });
        html += `<div class="grid-3" style="margin-bottom:var(--space-6)">
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--organ-green-light)"><span style="width:24px;height:24px;display:flex;color:var(--organ-green)">${Icons.organ}</span></div><div class="metric-card-info"><div class="metric-card-label">Total Donors</div><div class="metric-card-value">${totalDonors}</div></div></div>
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--success-light)"><span style="width:24px;height:24px;display:flex;color:var(--success)">${Icons.check}</span></div><div class="metric-card-info"><div class="metric-card-label">Approved</div><div class="metric-card-value">${totalApproved}</div></div></div>
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--accent-green-light)"><span style="width:24px;height:24px;display:flex;color:var(--accent-green)">${Icons.vitals}</span></div><div class="metric-card-info"><div class="metric-card-label">Completed</div><div class="metric-card-value">${totalCompleted}</div></div></div></div>`;
        html += `<div class="card"><div class="card-header"><h4 class="card-title">Donors per Organ Type</h4></div><div class="chart-container" style="height:220px"><canvas id="sa-chart-organs"></canvas></div></div></div>`;
        return html;
    }
    function renderBloodAnalytics() {
        let html = `<div class="page-header"><h2>Blood Bank Analytics</h2></div>`;
        html += `<div class="card"><div class="card-header"><h4 class="card-title">Blood Stock Across Hospitals</h4></div><div class="chart-container" style="height:250px"><canvas id="sa-chart-blood-all"></canvas></div></div>`;
        html += `<div class="table-wrapper" style="margin-top:var(--space-6)"><table class="table"><thead><tr><th>Hospital</th><th>A+</th><th>A-</th><th>B+</th><th>B-</th><th>AB+</th><th>AB-</th><th>O+</th><th>O-</th><th>Total</th></tr></thead><tbody>`;
        hospitals().forEach(h => {
            const blood = CareCluster.Data.getStore(h.id, 'blood_bank'); const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
            html += `<tr><td><strong>${esc(h.name)}</strong></td>${groups.map(g => `<td>${blood.filter(b => b.blood_group === g).reduce((s, b) => s + (b.units || 0), 0)}</td>`).join('')}<td style="font-weight:600">${blood.reduce((s, b) => s + (b.units || 0), 0)}</td></tr>`;
        });
        html += '</tbody></table></div>'; return html;
    }
    function renderCompliance() {
        let html = `<div class="page-header"><h2>Compliance & Regulatory</h2></div>`;
        hospitals().forEach(h => {
            const logs = CareCluster.Data.getStore(h.id, 'audit_logs'); const overrides = logs.filter(l => l.action.includes('OVERRIDE')); const emergencies = logs.filter(l => l.action.includes('EMERGENCY'));
            html += `<div class="card" style="margin-bottom:var(--space-4)"><h4 class="card-title">${esc(h.name)}</h4>
        <div class="grid-3" style="margin-top:var(--space-3)">
          <div><small style="color:var(--text-muted)">Total Audit Entries</small><div style="font-size:var(--fs-xl);font-weight:700">${logs.length}</div></div>
          <div><small style="color:var(--text-muted)">Admin Overrides</small><div style="font-size:var(--fs-xl);font-weight:700;color:var(--warning)">${overrides.length}</div></div>
          <div><small style="color:var(--text-muted)">Emergency Cases</small><div style="font-size:var(--fs-xl);font-weight:700;color:var(--danger)">${emergencies.length}</div></div></div></div>`;
        });
        return html;
    }
    function refreshCharts() {
        // Patients per hospital
        const c1 = document.getElementById('sa-chart-patients');
        if (c1) { const names = hospitals().map(h => h.code); const vals = hospitals().map(h => CareCluster.Data.getStore(h.id, 'patients').length); drawBarChart(c1, names, vals, ['#4f8cff', '#22c55e', '#f59e0b']); }
        // Admissions
        const c2 = document.getElementById('sa-chart-admissions');
        if (c2) { const labels = ['Admitted', 'Discharged', 'Outpatient']; let vAdm = 0, vDis = 0, vOut = 0; hospitals().forEach(h => { const p = CareCluster.Data.getStore(h.id, 'patients'); vAdm += p.filter(x => x.status === 'admitted').length; vDis += p.filter(x => x.status === 'discharged').length; vOut += p.filter(x => !x.status || x.status === 'outpatient').length; }); drawDonutChart(c2, labels, [vAdm, vDis, vOut], ['#4f8cff', '#22c55e', '#06b6d4']); }
        // Organs
        const c3 = document.getElementById('sa-chart-organs');
        if (c3) { const organCounts = {}; hospitals().forEach(h => { CareCluster.Data.getStore(h.id, 'organ_donors').forEach(d => (d.organs || []).forEach(o => { organCounts[o] = (organCounts[o] || 0) + 1 })) }); const labels = Object.keys(organCounts); const vals = Object.values(organCounts); const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#047857', '#065f46', '#064e3b', '#022c22', '#059669']; drawBarChart(c3, labels, vals, colors); }
        // Blood all
        const c4 = document.getElementById('sa-chart-blood-all');
        if (c4) { const names = hospitals().map(h => h.code); const vals = hospitals().map(h => CareCluster.Data.getStore(h.id, 'blood_bank').reduce((s, b) => s + (b.units || 0), 0)); drawBarChart(c4, names, vals, ['#ef4444', '#f97316', '#eab308']); }
    }
    return { renderAnalytics, renderOrganAnalytics, renderBloodAnalytics, renderCompliance, refreshCharts };
})();
