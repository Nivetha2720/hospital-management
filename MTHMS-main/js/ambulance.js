/* CareCluster — Ambulance System */
CareCluster.Ambulance = (() => {
    const { Icons, showToast, showModal, closeModal, statusBadge, formatDate, esc } = CareCluster.Utils;
    const STATUSES = ['Available', 'Dispatched', 'Reached Patient', 'Returning', 'Maintenance'];
    function render() {
        const hid = CareCluster.Auth.currentHospitalId(); const ambs = CareCluster.Data.getStore(hid, 'ambulances');
        const canDispatch = CareCluster.RBAC.canDispatchAmbulance(CareCluster.Auth.currentRole());
        let html = `<div class="page-header"><h2>Ambulance Management</h2><div class="page-header-actions">${canDispatch ? `<button class="btn btn-primary" onclick="CareCluster.Ambulance.showAdd()"><span style="width:16px;height:16px;display:flex">${Icons.plus}</span> Add Ambulance</button>` : ''}</div></div>`;
        const avail = ambs.filter(a => a.status === 'Available').length;
        html += `<div class="grid-4" style="margin-bottom:var(--space-6)">
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--success-light)"><span style="width:24px;height:24px;display:flex;color:var(--success)">${Icons.ambulance}</span></div><div class="metric-card-info"><div class="metric-card-label">Available</div><div class="metric-card-value">${avail}</div></div></div>
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--danger-light)"><span style="width:24px;height:24px;display:flex;color:var(--danger)">${Icons.ambulance}</span></div><div class="metric-card-info"><div class="metric-card-label">Dispatched</div><div class="metric-card-value">${ambs.filter(a => a.status === 'Dispatched').length}</div></div></div>
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--primary-light)"><span style="width:24px;height:24px;display:flex;color:var(--primary)">${Icons.ambulance}</span></div><div class="metric-card-info"><div class="metric-card-label">Total Fleet</div><div class="metric-card-value">${ambs.length}</div></div></div>
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--warning-light)"><span style="width:24px;height:24px;display:flex;color:var(--warning)">${Icons.equipment}</span></div><div class="metric-card-info"><div class="metric-card-label">Maintenance</div><div class="metric-card-value">${ambs.filter(a => a.status === 'Maintenance').length}</div></div></div></div>`;
        html += `<div class="table-wrapper"><table class="table"><thead><tr><th>Ambulance ID</th><th>Driver</th><th>Phone</th><th>Status</th><th>Last Updated</th>${canDispatch ? '<th>Actions</th>' : ''}</tr></thead><tbody>`;
        if (ambs.length === 0) html += '<tr><td colspan="6" class="text-center text-muted" style="padding:var(--space-8)">No ambulances registered.</td></tr>';
        else ambs.forEach(a => {
            html += `<tr><td><strong>${esc(a.ambulance_id)}</strong></td><td>${esc(a.driver_name)}</td><td>${esc(a.driver_phone || '—')}</td><td>${statusBadge(a.status.toLowerCase())}</td><td>${formatDate(a.updated_at)}</td>${canDispatch ? `<td class="table-actions"><button class="btn btn-ghost btn-sm" onclick="CareCluster.Ambulance.changeStatus('${a.id}')"><span style="width:14px;height:14px;display:flex">${Icons.edit}</span></button>${a.status === 'Available' ? `<button class="btn btn-danger btn-sm" onclick="CareCluster.Ambulance.dispatch('${a.id}')">Dispatch</button>` : ''}</td>` : ''}</tr>`;
        });
        html += '</tbody></table></div>'; return html;
    }
    function showAdd() {
        showModal('Add Ambulance', `<form id="amb-form">
      <div class="form-row"><div class="form-group"><label class="form-label">Ambulance ID *</label><input class="form-input" name="ambulance_id" required placeholder="AMB-001"></div>
        <div class="form-group"><label class="form-label">Driver Name *</label><input class="form-input" name="driver_name" required placeholder="Driver name"></div></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Driver Phone</label><input class="form-input" name="driver_phone" placeholder="+1-555-0000"></div>
        <div class="form-group"><label class="form-label">Status</label><select class="form-select" name="status">${STATUSES.map(s => `<option>${s}</option>`).join('')}</select></div></div></form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button><button class="btn btn-primary" onclick="CareCluster.Ambulance.save()">Add</button>`);
    }
    function save() {
        const fd = new FormData(document.getElementById('amb-form')); const data = Object.fromEntries(fd);
        if (!data.ambulance_id || !data.driver_name) { showToast('Fill required', 'warning'); return; }
        CareCluster.Data.addRecord(CareCluster.Auth.currentHospitalId(), 'ambulances', data);
        CareCluster.Data.addAuditLog(CareCluster.Auth.currentHospitalId(), 'AMBULANCE_ADDED', data.ambulance_id);
        closeModal(); showToast('Ambulance added', 'success'); CareCluster.App.navigate('ambulance');
    }
    function dispatch(id) {
        const hid = CareCluster.Auth.currentHospitalId(); const a = CareCluster.Data.getRecord(hid, 'ambulances', id);
        CareCluster.Data.updateRecord(hid, 'ambulances', id, { status: 'Dispatched' });
        CareCluster.Data.addAuditLog(hid, 'AMBULANCE_DISPATCHED', `${a.ambulance_id} dispatched`);
        CareCluster.Data.addNotification(hid, ['doctor', 'admin', 'nurse'], `Ambulance ${a.ambulance_id} dispatched`, 'emergency');
        showToast(`${a.ambulance_id} dispatched`, 'success'); CareCluster.App.navigate('ambulance');
    }
    function changeStatus(id) {
        const hid = CareCluster.Auth.currentHospitalId(); const a = CareCluster.Data.getRecord(hid, 'ambulances', id);
        showModal('Update Status', `<form id="amb-status"><div class="form-group"><label class="form-label">Status</label><select class="form-select" name="status">${STATUSES.map(s => `<option ${s === a.status ? 'selected' : ''}>${s}</option>`).join('')}</select></div></form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button><button class="btn btn-primary" onclick="CareCluster.Ambulance.updateStatus('${id}')">Update</button>`);
    }
    function updateStatus(id) {
        const status = document.querySelector('#amb-status select').value;
        CareCluster.Data.updateRecord(CareCluster.Auth.currentHospitalId(), 'ambulances', id, { status });
        CareCluster.Data.addAuditLog(CareCluster.Auth.currentHospitalId(), 'AMBULANCE_STATUS', `Status → ${status}`);
        closeModal(); showToast('Status updated', 'success'); CareCluster.App.navigate('ambulance');
    }
    function renderPatientView() {
        const user = CareCluster.Auth.currentUser(); const hid = user.hospital_id;
        const ambs = CareCluster.Data.getStore(hid, 'ambulances');
        let html = `<div class="page-header"><h2>Ambulance Status</h2></div>`;
        html += `<div class="grid-3">${ambs.map(a => `<div class="card"><div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3)"><span style="width:24px;height:24px;display:flex;color:var(--primary)">${Icons.ambulance}</span><strong>${esc(a.ambulance_id)}</strong></div><p style="font-size:var(--fs-sm)">${esc(a.driver_name)}</p>${statusBadge(a.status.toLowerCase())}</div>`).join('')}</div>`;
        if (ambs.length === 0) html += '<div class="empty-state"><h3>No ambulances</h3></div>';
        return html;
    }
    return { render, showAdd, save, dispatch, changeStatus, updateStatus, renderPatientView };
})();
