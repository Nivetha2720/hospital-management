/* CareCluster — Equipment Management */
CareCluster.Equipment = (() => {
    const { Icons, showToast, showModal, closeModal, statusBadge, formatDate, esc, daysUntil } = CareCluster.Utils;
    function render() {
        const hid = CareCluster.Auth.currentHospitalId(); const equip = CareCluster.Data.getStore(hid, 'equipment');
        const totalQty = equip.reduce((s, e) => s + (e.quantity || 0), 0); const maintenanceDue = equip.filter(e => { const d = daysUntil(e.maintenance_date); return d >= 0 && d <= 7; }).length;
        let html = `<div class="page-header"><h2>Equipment Management</h2><div class="page-header-actions"><button class="btn btn-primary" onclick="CareCluster.Equipment.showAdd()"><span style="width:16px;height:16px;display:flex">${Icons.plus}</span> Add Equipment</button></div></div>`;
        html += `<div class="grid-3" style="margin-bottom:var(--space-6)">
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--primary-light)"><span style="width:24px;height:24px;display:flex;color:var(--primary)">${Icons.equipment}</span></div><div class="metric-card-info"><div class="metric-card-label">Total Items</div><div class="metric-card-value">${equip.length}</div></div></div>
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--success-light)"><span style="width:24px;height:24px;display:flex;color:var(--success)">${Icons.check}</span></div><div class="metric-card-info"><div class="metric-card-label">Total Quantity</div><div class="metric-card-value">${totalQty}</div></div></div>
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--warning-light)"><span style="width:24px;height:24px;display:flex;color:var(--warning)">${Icons.alert}</span></div><div class="metric-card-info"><div class="metric-card-label">Maintenance Due</div><div class="metric-card-value" style="color:var(--warning)">${maintenanceDue}</div></div></div></div>`;
        html += `<div class="table-wrapper"><table class="table"><thead><tr><th>Name</th><th>Quantity</th><th>Status</th><th>Maintenance Date</th><th>Location</th><th>Actions</th></tr></thead><tbody>`;
        if (equip.length === 0) html += '<tr><td colspan="6" class="text-center text-muted" style="padding:var(--space-8)">No equipment.</td></tr>';
        else equip.forEach(e => {
            const days = daysUntil(e.maintenance_date); const due = days >= 0 && days <= 7;
            html += `<tr style="${due ? 'background:var(--warning-light)' : ''}"><td><strong>${esc(e.name)}</strong></td><td>${e.quantity}</td><td>${statusBadge(e.status || 'available')}</td><td style="${due ? 'color:var(--warning)' : ''}">${formatDate(e.maintenance_date)}${due ? ` (${days}d)` : ''}</td><td>${esc(e.location || '—')}</td><td class="table-actions"><button class="btn btn-ghost btn-sm" onclick="CareCluster.Equipment.showEdit('${e.id}')"><span style="width:14px;height:14px;display:flex">${Icons.edit}</span></button></td></tr>`;
        });
        html += '</tbody></table></div>'; return html;
    }
    function showAdd() {
        showModal('Add Equipment', `<form id="equip-form">
      <div class="form-row"><div class="form-group"><label class="form-label">Name *</label><input class="form-input" name="name" required placeholder="Equipment name"></div>
        <div class="form-group"><label class="form-label">Quantity *</label><input type="number" class="form-input" name="quantity" required min="0"></div></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Status</label><select class="form-select" name="status"><option>Available</option><option>In Use</option><option>Maintenance</option></select></div>
        <div class="form-group"><label class="form-label">Maintenance Date</label><input type="date" class="form-input" name="maintenance_date"></div></div>
      <div class="form-group"><label class="form-label">Location</label><input class="form-input" name="location" placeholder="Ward/Room"></div></form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button><button class="btn btn-primary" onclick="CareCluster.Equipment.save()">Add</button>`);
    }
    function save() {
        const fd = new FormData(document.getElementById('equip-form')); const data = Object.fromEntries(fd);
        if (!data.name || !data.quantity) { showToast('Fill required', 'warning'); return; }
        data.quantity = parseInt(data.quantity);
        CareCluster.Data.addRecord(CareCluster.Auth.currentHospitalId(), 'equipment', data);
        CareCluster.Data.addAuditLog(CareCluster.Auth.currentHospitalId(), 'EQUIPMENT_ADDED', `${data.name} x${data.quantity}`);
        closeModal(); showToast('Equipment added', 'success'); CareCluster.App.navigate('equipment');
    }
    function showEdit(id) {
        const hid = CareCluster.Auth.currentHospitalId(); const e = CareCluster.Data.getRecord(hid, 'equipment', id); if (!e) return;
        showModal('Edit Equipment', `<form id="equip-edit"><input type="hidden" name="id" value="${e.id}">
      <div class="form-row"><div class="form-group"><label class="form-label">Name</label><input class="form-input" name="name" value="${esc(e.name)}"></div>
        <div class="form-group"><label class="form-label">Quantity</label><input type="number" class="form-input" name="quantity" value="${e.quantity}"></div></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Status</label><select class="form-select" name="status">${['Available', 'In Use', 'Maintenance'].map(s => `<option ${s === e.status ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Maintenance</label><input type="date" class="form-input" name="maintenance_date" value="${e.maintenance_date || ''}"></div></div></form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button><button class="btn btn-primary" onclick="CareCluster.Equipment.update()">Update</button>`);
    }
    function update() {
        const fd = new FormData(document.getElementById('equip-edit')); const data = Object.fromEntries(fd);
        data.quantity = parseInt(data.quantity);
        CareCluster.Data.updateRecord(CareCluster.Auth.currentHospitalId(), 'equipment', data.id, data);
        closeModal(); showToast('Updated', 'success'); CareCluster.App.navigate('equipment');
    }
    return { render, showAdd, save, showEdit, update };
})();
