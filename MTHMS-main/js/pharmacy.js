/* CareCluster — Pharmacy & Medicine Management */
CareCluster.Pharmacy = (() => {
    const { Icons, showToast, showModal, closeModal, statusBadge, formatDate, esc, daysUntil } = CareCluster.Utils;
    function render() {
        const hid = CareCluster.Auth.currentHospitalId(); const meds = CareCluster.Data.getStore(hid, 'medicines');
        const lowStock = meds.filter(m => m.quantity <= 10).length; const expiringSoon = meds.filter(m => { const d = daysUntil(m.expiry_date); return d >= 0 && d <= 30; }).length;
        const expired = meds.filter(m => daysUntil(m.expiry_date) < 0).length;
        let html = `<div class="page-header"><h2>Pharmacy Management</h2><div class="page-header-actions">
      <button class="btn btn-primary" onclick="CareCluster.Pharmacy.showAdd()"><span style="width:16px;height:16px;display:flex">${Icons.plus}</span> Add Medicine</button></div></div>`;
        html += `<div class="grid-4" style="margin-bottom:var(--space-6)">
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--primary-light)"><span style="width:24px;height:24px;display:flex;color:var(--primary)">${Icons.pharmacy}</span></div><div class="metric-card-info"><div class="metric-card-label">Total Medicines</div><div class="metric-card-value">${meds.length}</div></div></div>
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--warning-light)"><span style="width:24px;height:24px;display:flex;color:var(--warning)">${Icons.alert}</span></div><div class="metric-card-info"><div class="metric-card-label">Low Stock</div><div class="metric-card-value" style="color:var(--warning)">${lowStock}</div></div></div>
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--warning-light)"><span style="width:24px;height:24px;display:flex;color:var(--warning)">${Icons.clock}</span></div><div class="metric-card-info"><div class="metric-card-label">Expiring ≤30d</div><div class="metric-card-value" style="color:var(--warning)">${expiringSoon}</div></div></div>
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--danger-light)"><span style="width:24px;height:24px;display:flex;color:var(--danger)">${Icons.alert}</span></div><div class="metric-card-info"><div class="metric-card-label">Expired</div><div class="metric-card-value" style="color:var(--danger)">${expired}</div></div></div></div>`;
        html += `<div class="table-wrapper"><table class="table"><thead><tr><th>Name</th><th>Category</th><th>Quantity</th><th>Price</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead><tbody>`;
        if (meds.length === 0) html += '<tr><td colspan="7" class="text-center text-muted" style="padding:var(--space-8)">No medicines added.</td></tr>';
        else meds.forEach(m => {
            const days = daysUntil(m.expiry_date); let stockStatus = 'In Stock';
            if (m.quantity <= 0) stockStatus = 'Out of Stock'; else if (m.quantity <= 10) stockStatus = 'Low Stock';
            const isExpired = days < 0; const isExpiring = days >= 0 && days <= 30;
            html += `<tr style="${isExpired ? 'background:var(--danger-light)' : isExpiring ? 'background:var(--warning-light)' : ''}">
        <td><strong>${esc(m.name)}</strong></td><td>${esc(m.category || '—')}</td>
        <td style="color:${m.quantity <= 10 ? 'var(--warning)' : ''}">${m.quantity}</td>
        <td>$${(m.price || 0).toFixed(2)}</td><td style="color:${isExpired ? 'var(--danger)' : isExpiring ? 'var(--warning)' : ''}">${formatDate(m.expiry_date)} ${isExpired ? ' (EXPIRED)' : isExpiring ? ` (${days}d)` : ''}</td>
        <td>${statusBadge(stockStatus.toLowerCase().replace(' ', '_'))}</td>
        <td class="table-actions"><button class="btn btn-ghost btn-sm" onclick="CareCluster.Pharmacy.showEdit('${m.id}')"><span style="width:14px;height:14px;display:flex">${Icons.edit}</span></button>
        <button class="btn btn-ghost btn-sm" onclick="CareCluster.Pharmacy.dispense('${m.id}')"><span style="width:14px;height:14px;display:flex">${Icons.check}</span></button></td></tr>`;
        });
        html += '</tbody></table></div>'; return html;
    }
    function showAdd() {
        showModal('Add Medicine', `<form id="med-form">
      <div class="form-row"><div class="form-group"><label class="form-label">Medicine Name *</label><input class="form-input" name="name" required placeholder="Medicine name"></div>
        <div class="form-group"><label class="form-label">Category</label><select class="form-select" name="category"><option>Tablet</option><option>Capsule</option><option>Syrup</option><option>Injection</option><option>Ointment</option><option>Drops</option><option>Other</option></select></div></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Quantity *</label><input type="number" class="form-input" name="quantity" required min="0" placeholder="0"></div>
        <div class="form-group"><label class="form-label">Price ($)</label><input type="number" class="form-input" name="price" step="0.01" min="0" placeholder="0.00"></div></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Expiry Date *</label><input type="date" class="form-input" name="expiry_date" required></div>
        <div class="form-group"><label class="form-label">Manufacturer</label><input class="form-input" name="manufacturer" placeholder="Manufacturer"></div></div></form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button><button class="btn btn-primary" onclick="CareCluster.Pharmacy.save()">Add</button>`);
    }
    function save() {
        const fd = new FormData(document.getElementById('med-form')); const data = Object.fromEntries(fd);
        if (!data.name || !data.quantity || !data.expiry_date) { showToast('Fill required fields', 'warning'); return; }
        const hid = CareCluster.Auth.currentHospitalId(); data.quantity = parseInt(data.quantity); data.price = parseFloat(data.price || 0);
        CareCluster.Data.addRecord(hid, 'medicines', data);
        CareCluster.Data.addAuditLog(hid, 'MEDICINE_ADDED', `${data.name} x${data.quantity}`);
        if (data.quantity <= 10) CareCluster.Data.addNotification(hid, ['pharmacist', 'admin'], `Low stock: ${data.name}`, 'low_stock');
        closeModal(); showToast('Medicine added', 'success'); CareCluster.App.navigate('pharmacy');
    }
    function showEdit(id) {
        const hid = CareCluster.Auth.currentHospitalId(); const m = CareCluster.Data.getRecord(hid, 'medicines', id); if (!m) return;
        showModal('Edit Medicine', `<form id="med-edit-form"><input type="hidden" name="id" value="${m.id}">
      <div class="form-row"><div class="form-group"><label class="form-label">Name</label><input class="form-input" name="name" value="${esc(m.name)}"></div>
        <div class="form-group"><label class="form-label">Category</label><select class="form-select" name="category">${['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Other'].map(c => `<option ${c === m.category ? 'selected' : ''}>${c}</option>`).join('')}</select></div></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Quantity</label><input type="number" class="form-input" name="quantity" value="${m.quantity}"></div>
        <div class="form-group"><label class="form-label">Price</label><input type="number" class="form-input" name="price" value="${m.price}" step="0.01"></div></div>
      <div class="form-group"><label class="form-label">Expiry</label><input type="date" class="form-input" name="expiry_date" value="${m.expiry_date || ''}"></div></form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button><button class="btn btn-primary" onclick="CareCluster.Pharmacy.updateMed()">Update</button>`);
    }
    function updateMed() {
        const fd = new FormData(document.getElementById('med-edit-form')); const data = Object.fromEntries(fd);
        const hid = CareCluster.Auth.currentHospitalId(); data.quantity = parseInt(data.quantity); data.price = parseFloat(data.price || 0);
        CareCluster.Data.updateRecord(hid, 'medicines', data.id, data);
        CareCluster.Data.addAuditLog(hid, 'MEDICINE_UPDATED', `${data.name} updated`);
        closeModal(); showToast('Medicine updated', 'success'); CareCluster.App.navigate('pharmacy');
    }
    function dispense(id) {
        const hid = CareCluster.Auth.currentHospitalId(); const m = CareCluster.Data.getRecord(hid, 'medicines', id);
        if (!m) return; if (m.quantity <= 0) { showToast('Out of stock', 'error'); return; }
        CareCluster.Data.updateRecord(hid, 'medicines', id, { quantity: m.quantity - 1 });
        CareCluster.Data.addAuditLog(hid, 'MEDICINE_DISPENSED', `${m.name} dispensed (${m.quantity - 1} remaining)`);
        if (m.quantity - 1 <= 10) CareCluster.Data.addNotification(hid, ['pharmacist', 'admin'], `Low stock alert: ${m.name} (${m.quantity - 1} left)`, 'low_stock');
        showToast(`${m.name} dispensed. ${m.quantity - 1} remaining.`, 'success'); CareCluster.App.navigate('pharmacy');
    }
    return { render, showAdd, save, showEdit, updateMed, dispense };
})();
