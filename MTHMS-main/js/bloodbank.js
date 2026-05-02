/* CareCluster — Blood Bank */
CareCluster.BloodBank = (() => {
    const { Icons, showToast, showModal, closeModal, statusBadge, formatDate, esc, daysUntil, drawBarChart } = CareCluster.Utils;
    function render() {
        const hid = CareCluster.Auth.currentHospitalId(); const blood = CareCluster.Data.getStore(hid, 'blood_bank'); const canEdit = CareCluster.RBAC.canManageBloodBank(CareCluster.Auth.currentRole());
        const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const summary = groups.map(g => { const items = blood.filter(b => b.blood_group === g); const units = items.reduce((s, b) => s + (b.units || 0), 0); const expiring = items.filter(b => { const d = daysUntil(b.expiry_date); return d >= 0 && d <= 7; }).length; return { group: g, units, expiring }; });
        let html = `<div class="page-header"><h2>Blood Bank</h2><div class="page-header-actions">${canEdit ? `<button class="btn btn-primary" onclick="CareCluster.BloodBank.showAdd()"><span style="width:16px;height:16px;display:flex">${Icons.plus}</span> Add Entry</button>` : ''}</div></div>`;
        html += `<div class="grid-4" style="margin-bottom:var(--space-6)">${summary.map(s => `<div class="metric-card"><div class="metric-card-icon" style="background:var(--danger-light)"><span style="width:24px;height:24px;display:flex;color:var(--danger);font-weight:700;font-size:var(--fs-sm)">${s.group}</span></div><div class="metric-card-info"><div class="metric-card-label">${s.group}</div><div class="metric-card-value">${s.units} <small style="font-size:var(--fs-xs);font-weight:400">units</small></div>${s.expiring > 0 ? `<div style="font-size:var(--fs-xs);color:var(--warning)">${s.expiring} expiring soon</div>` : ''}</div></div>`).join('')}</div>`;
        html += `<div class="card" style="margin-bottom:var(--space-6)"><div class="card-header"><h4 class="card-title">Stock Overview</h4></div><div class="chart-container" style="height:200px"><canvas id="chart-blood-overview"></canvas></div></div>`;
        html += `<div class="table-wrapper"><table class="table"><thead><tr><th>Blood Group</th><th>Units</th><th>Donor ID</th><th>Expiry</th><th>Status</th>${canEdit ? '<th>Actions</th>' : ''}</tr></thead><tbody>`;
        if (blood.length === 0) html += '<tr><td colspan="6" class="text-center text-muted" style="padding:var(--space-8)">No blood entries.</td></tr>';
        else blood.forEach(b => {
            const days = daysUntil(b.expiry_date); const expired = days < 0; const expiring = days >= 0 && days <= 7;
            html += `<tr style="${expired ? 'background:var(--danger-light)' : expiring ? 'background:var(--warning-light)' : ''}"><td><strong>${b.blood_group}</strong></td><td>${b.units}</td><td>${esc(b.donor_id || '—')}</td><td style="color:${expired ? 'var(--danger)' : expiring ? 'var(--warning)' : ''}">${formatDate(b.expiry_date)}${expired ? ' (EXPIRED)' : expiring ? ` (${days}d)` : ''}</td><td>${statusBadge(expired ? 'expired' : b.units <= 0 ? 'out of stock' : 'available')}</td>${canEdit ? `<td class="table-actions"><button class="btn btn-ghost btn-sm" onclick="CareCluster.BloodBank.showEdit('${b.id}')"><span style="width:14px;height:14px;display:flex">${Icons.edit}</span></button></td>` : ''}</tr>`;
        });
        html += '</tbody></table></div>'; return html;
    }
    function showAdd() {
        showModal('Add Blood Entry', `<form id="blood-form">
      <div class="form-row"><div class="form-group"><label class="form-label">Blood Group *</label><select class="form-select" name="blood_group" required><option value="">Select</option>${CareCluster.Data.BLOOD_GROUPS.map(g => `<option>${g}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Units *</label><input type="number" class="form-input" name="units" required min="1" placeholder="Number of units"></div></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Donor ID</label><input class="form-input" name="donor_id" placeholder="Donor identifier"></div>
        <div class="form-group"><label class="form-label">Expiry Date *</label><input type="date" class="form-input" name="expiry_date" required></div></div></form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button><button class="btn btn-primary" onclick="CareCluster.BloodBank.save()">Add</button>`);
    }
    function save() {
        const fd = new FormData(document.getElementById('blood-form')); const data = Object.fromEntries(fd);
        if (!data.blood_group || !data.units || !data.expiry_date) { showToast('Fill required fields', 'warning'); return; }
        const hid = CareCluster.Auth.currentHospitalId(); data.units = parseInt(data.units);
        CareCluster.Data.addRecord(hid, 'blood_bank', data);
        CareCluster.Data.addAuditLog(hid, 'BLOOD_ADDED', `${data.blood_group}: ${data.units} units`);
        closeModal(); showToast('Blood entry added', 'success'); CareCluster.App.navigate('blood_bank');
    }
    function showEdit(id) {
        const hid = CareCluster.Auth.currentHospitalId(); const b = CareCluster.Data.getRecord(hid, 'blood_bank', id); if (!b) return;
        showModal('Edit Entry', `<form id="blood-edit"><input type="hidden" name="id" value="${b.id}">
      <div class="form-row"><div class="form-group"><label class="form-label">Group</label><input class="form-input" value="${b.blood_group}" disabled></div>
        <div class="form-group"><label class="form-label">Units</label><input type="number" class="form-input" name="units" value="${b.units}" min="0"></div></div>
      <div class="form-group"><label class="form-label">Expiry</label><input type="date" class="form-input" name="expiry_date" value="${b.expiry_date || ''}"></div></form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button><button class="btn btn-primary" onclick="CareCluster.BloodBank.update()">Update</button>`);
    }
    function update() {
        const fd = new FormData(document.getElementById('blood-edit')); const data = Object.fromEntries(fd);
        const hid = CareCluster.Auth.currentHospitalId(); data.units = parseInt(data.units);
        CareCluster.Data.updateRecord(hid, 'blood_bank', data.id, data);
        CareCluster.Data.addAuditLog(hid, 'BLOOD_UPDATED', `Blood entry updated`);
        if (data.units <= 2) CareCluster.Data.addNotification(hid, ['lab_technician', 'admin', 'doctor'], `Low blood stock alert: ${data.units} units`, 'low_stock');
        closeModal(); showToast('Updated', 'success'); CareCluster.App.navigate('blood_bank');
    }
    function requestBlood() {
        showModal('Request Blood', `<form id="blood-req">
      <div class="form-group"><label class="form-label">Blood Group *</label><select class="form-select" name="blood_group" required><option value="">Select</option>${CareCluster.Data.BLOOD_GROUPS.map(g => `<option>${g}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Units Needed</label><input type="number" class="form-input" name="units" value="1" min="1"></div>
      <div class="form-group"><label class="form-label">Priority</label><select class="form-select" name="priority"><option>Normal</option><option>Emergency</option></select></div></form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button><button class="btn btn-danger" onclick="CareCluster.BloodBank.submitRequest()">Request</button>`);
    }
    function submitRequest() {
        const fd = new FormData(document.getElementById('blood-req')); const data = Object.fromEntries(fd);
        const hid = CareCluster.Auth.currentHospitalId(); const units = parseInt(data.units);
        const blood = CareCluster.Data.getStore(hid, 'blood_bank').filter(b => b.blood_group === data.blood_group && b.units > 0);
        const available = blood.reduce((s, b) => s + b.units, 0);
        if (available < units) { showToast(`Only ${available} ${data.blood_group} units available!`, 'error'); return; }
        // Deduct
        let remaining = units;
        blood.forEach(b => { if (remaining <= 0) return; const deduct = Math.min(b.units, remaining); CareCluster.Data.updateRecord(hid, 'blood_bank', b.id, { units: b.units - deduct }); remaining -= deduct; });
        CareCluster.Data.addAuditLog(hid, 'BLOOD_REQUESTED', `${units} units of ${data.blood_group} (${data.priority})`);
        CareCluster.Data.addNotification(hid, ['lab_technician', 'admin'], `Blood request: ${units}x ${data.blood_group} (${data.priority})`, 'info');
        closeModal(); showToast(`${units} units of ${data.blood_group} allocated`, 'success');
    }
    function refreshChart() {
        const canvas = document.getElementById('chart-blood-overview'); if (!canvas) return;
        const hid = CareCluster.Auth.currentHospitalId(); const blood = CareCluster.Data.getStore(hid, 'blood_bank');
        const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const vals = groups.map(g => blood.filter(b => b.blood_group === g).reduce((s, b) => s + (b.units || 0), 0));
        drawBarChart(canvas, groups, vals, ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#4f8cff', '#8b5cf6', '#ec4899']);
    }
    return { render, showAdd, save, showEdit, update, requestBlood, submitRequest, refreshChart };
})();
