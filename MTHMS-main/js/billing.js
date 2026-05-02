/* CareCluster — Billing & Insurance Engine */
CareCluster.Billing = (() => {
    const { Icons, showToast, showModal, closeModal, statusBadge, formatDate, esc } = CareCluster.Utils;

    function render() {
        const user = CareCluster.Auth.currentUser();
        const hid = user.hospital_id;
        const isPatient = user.role === 'patient';
        const bills = isPatient ? CareCluster.Data.getStore(hid, 'bills').filter(b => b.patient_id === user.id) : CareCluster.Data.getStore(hid, 'bills');

        let html = `<div class="page-header"><h2>${isPatient ? 'My Billing' : 'Billing & Insurance'}</h2>
      <div class="page-header-actions">${!isPatient ? `<button class="btn btn-primary" onclick="CareCluster.Billing.showAdd()"><span style="width:16px;height:16px;display:flex">${Icons.plus}</span> New Bill</button>` : ''}</div></div>`;

        // Summary cards
        const totalBilled = bills.reduce((s, b) => s + (b.total_amount || 0), 0);
        const totalInsurance = bills.reduce((s, b) => s + (b.insurance_amount || 0), 0);
        const totalSelf = bills.reduce((s, b) => s + (b.self_payment || 0), 0);
        const totalOutstanding = bills.reduce((s, b) => s + Math.max(0, (b.total_amount || 0) - (b.insurance_amount || 0) - (b.self_payment || 0)), 0);

        html += `<div class="grid-4" style="margin-bottom:var(--space-6)">
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--primary-light)"><span style="width:24px;height:24px;display:flex;color:var(--primary)">${Icons.billing}</span></div><div class="metric-card-info"><div class="metric-card-label">Total Billed</div><div class="metric-card-value">$${totalBilled.toLocaleString()}</div></div></div>
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--success-light)"><span style="width:24px;height:24px;display:flex;color:var(--success)">${Icons.insurance}</span></div><div class="metric-card-info"><div class="metric-card-label">Insurance Covered</div><div class="metric-card-value">$${totalInsurance.toLocaleString()}</div></div></div>
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--info-light)"><span style="width:24px;height:24px;display:flex;color:var(--info)">${Icons.billing}</span></div><div class="metric-card-info"><div class="metric-card-label">Self Payment</div><div class="metric-card-value">$${totalSelf.toLocaleString()}</div></div></div>
      <div class="metric-card"><div class="metric-card-icon" style="background:${totalOutstanding > 0 ? 'var(--danger-light)' : 'var(--success-light)'}"><span style="width:24px;height:24px;display:flex;color:${totalOutstanding > 0 ? 'var(--danger)' : 'var(--success)'}">${Icons.alert}</span></div><div class="metric-card-info"><div class="metric-card-label">Outstanding</div><div class="metric-card-value" style="color:${totalOutstanding > 0 ? 'var(--danger)' : 'var(--success)'}">$${totalOutstanding.toLocaleString()}</div></div></div></div>`;

        html += `<div class="table-wrapper"><table class="table"><thead><tr><th>Bill ID</th><th>Patient</th><th>Total</th><th>Insurance</th><th>Self Pay</th><th>Outstanding</th><th>Status</th><th>Date</th>${!isPatient ? '<th>Actions</th>' : ''}</tr></thead><tbody>`;
        if (bills.length === 0) html += '<tr><td colspan="9" class="text-center text-muted" style="padding:var(--space-8)">No bills created yet.</td></tr>';
        else bills.forEach(b => {
            const outstanding = Math.max(0, (b.total_amount || 0) - (b.insurance_amount || 0) - (b.self_payment || 0));
            const status = outstanding <= 0 ? 'Paid' : 'Pending';
            html += `<tr><td><code>${(b.id || '').slice(0, 10)}</code></td><td>${esc(b.patient_name || '—')}</td><td>$${(b.total_amount || 0).toLocaleString()}</td><td>$${(b.insurance_amount || 0).toLocaleString()}</td><td>$${(b.self_payment || 0).toLocaleString()}</td><td style="color:${outstanding > 0 ? 'var(--danger)' : 'var(--success)'};font-weight:600">$${outstanding.toLocaleString()}</td><td>${statusBadge(status === 'Paid' ? 'completed' : 'pending')}</td><td>${formatDate(b.created_at)}</td>${!isPatient ? `<td class="table-actions"><button class="btn btn-ghost btn-sm" onclick="CareCluster.Billing.showEdit('${b.id}')"><span style="width:14px;height:14px;display:flex">${Icons.edit}</span></button></td>` : ''}</tr>`;
        });
        html += '</tbody></table></div>';
        return html;
    }

    function showAdd() {
        const hid = CareCluster.Auth.currentHospitalId();
        const patients = CareCluster.Data.getStore(hid, 'patients');
        showModal('Create Bill', `<form id="bill-form">
      <div class="form-group"><label class="form-label">Patient *</label><select class="form-select" name="patient_id" required onchange="CareCluster.Billing._onPatientSelect(this)"><option value="">Select</option>${patients.map(p => `<option value="${p.id}" data-name="${esc(p.name)}">${esc(p.name)}</option>`).join('')}</select></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Total Amount ($) *</label><input type="number" class="form-input" name="total_amount" required min="0" step="0.01" oninput="CareCluster.Billing._calcOutstanding()"></div>
        <div class="form-group"><label class="form-label">Insurance Amount ($)</label><input type="number" class="form-input" name="insurance_amount" value="0" min="0" step="0.01" oninput="CareCluster.Billing._calcOutstanding()"></div></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Self Payment ($)</label><input type="number" class="form-input" name="self_payment" value="0" min="0" step="0.01" oninput="CareCluster.Billing._calcOutstanding()"></div>
        <div class="form-group"><label class="form-label">Claim ID</label><input type="text" class="form-input" name="claim_id" placeholder="INS-XXXXX"></div></div>
      <div style="padding:var(--space-3);background:var(--bg-input);border-radius:var(--radius-md);margin-top:var(--space-2)"><small style="color:var(--text-muted)">Outstanding Balance</small><div id="calc-outstanding" style="font-size:var(--fs-xl);font-weight:var(--fw-bold)">$0</div></div>
      <div class="form-group" style="margin-top:var(--space-4)"><label class="form-label">Notes</label><textarea class="form-textarea" name="notes" rows="2" placeholder="Billing notes..."></textarea></div></form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button><button class="btn btn-primary" onclick="CareCluster.Billing.saveBill()">Create Bill</button>`, 'modal-lg');
    }

    function _onPatientSelect(sel) {/* name stored via data attribute */ }
    function _calcOutstanding() {
        const t = parseFloat(document.querySelector('#bill-form [name="total_amount"]')?.value || 0);
        const i = parseFloat(document.querySelector('#bill-form [name="insurance_amount"]')?.value || 0);
        const s = parseFloat(document.querySelector('#bill-form [name="self_payment"]')?.value || 0);
        const o = Math.max(0, t - i - s);
        const el = document.getElementById('calc-outstanding');
        if (el) { el.textContent = '$' + o.toLocaleString(); el.style.color = o > 0 ? 'var(--danger)' : 'var(--success)'; }
    }

    function saveBill() {
        const fd = new FormData(document.getElementById('bill-form')); const data = Object.fromEntries(fd);
        if (!data.patient_id || !data.total_amount) { showToast('Fill required fields', 'warning'); return; }
        const hid = CareCluster.Auth.currentHospitalId();
        const patient = CareCluster.Data.getRecord(hid, 'patients', data.patient_id);
        data.patient_name = patient?.name || 'Unknown';
        data.total_amount = parseFloat(data.total_amount); data.insurance_amount = parseFloat(data.insurance_amount || 0); data.self_payment = parseFloat(data.self_payment || 0);
        CareCluster.Data.addRecord(hid, 'bills', data);
        CareCluster.Data.addAuditLog(hid, 'BILL_CREATED', `Bill $${data.total_amount} for ${data.patient_name}`);
        CareCluster.Data.addNotification(hid, ['patient', 'admin'], `New bill created: $${data.total_amount}`, 'info');
        closeModal(); showToast('Bill created', 'success'); CareCluster.App.navigate(CareCluster.Auth.currentRole() === 'receptionist' ? 'billing' : 'billing');
    }

    function showEdit(id) {
        const hid = CareCluster.Auth.currentHospitalId(); const b = CareCluster.Data.getRecord(hid, 'bills', id); if (!b) return;
        showModal('Edit Bill', `<form id="bill-edit-form"><input type="hidden" name="id" value="${b.id}">
      <div class="form-group"><label class="form-label">Patient</label><input type="text" class="form-input" value="${esc(b.patient_name)}" disabled></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Total ($)</label><input type="number" class="form-input" name="total_amount" value="${b.total_amount}" step="0.01" oninput="CareCluster.Billing._calcOutstanding()"></div>
        <div class="form-group"><label class="form-label">Insurance ($)</label><input type="number" class="form-input" name="insurance_amount" value="${b.insurance_amount}" step="0.01" oninput="CareCluster.Billing._calcOutstanding()"></div></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Self Pay ($)</label><input type="number" class="form-input" name="self_payment" value="${b.self_payment}" step="0.01" oninput="CareCluster.Billing._calcOutstanding()"></div>
        <div class="form-group"><label class="form-label">Claim ID</label><input type="text" class="form-input" name="claim_id" value="${esc(b.claim_id || '')}"></div></div>
      <div style="padding:var(--space-3);background:var(--bg-input);border-radius:var(--radius-md)"><small>Outstanding</small><div id="calc-outstanding" style="font-size:var(--fs-xl);font-weight:var(--fw-bold);color:${Math.max(0, b.total_amount - b.insurance_amount - b.self_payment) > 0 ? 'var(--danger)' : 'var(--success)'}">$${Math.max(0, b.total_amount - b.insurance_amount - b.self_payment)}</div></div></form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button><button class="btn btn-primary" onclick="CareCluster.Billing.updateBill()">Update</button>`);
    }

    function updateBill() {
        const fd = new FormData(document.getElementById('bill-edit-form')); const data = Object.fromEntries(fd);
        const hid = CareCluster.Auth.currentHospitalId();
        data.total_amount = parseFloat(data.total_amount); data.insurance_amount = parseFloat(data.insurance_amount || 0); data.self_payment = parseFloat(data.self_payment || 0);
        CareCluster.Data.updateRecord(hid, 'bills', data.id, data);
        CareCluster.Data.addAuditLog(hid, 'BILL_UPDATED', `Bill ${data.id} updated`);
        closeModal(); showToast('Bill updated', 'success'); CareCluster.App.navigate('billing');
    }

    function renderMyInsurance() {
        const user = CareCluster.Auth.currentUser(); const hid = user.hospital_id;
        const bills = CareCluster.Data.getStore(hid, 'bills').filter(b => b.patient_id === user.id);
        const insured = bills.filter(b => b.insurance_amount > 0);
        let html = `<div class="page-header"><h2>My Insurance</h2></div>`;
        if (insured.length === 0) html += '<div class="empty-state"><h3>No Insurance Records</h3><p>No insurance claims on file.</p></div>';
        else {
            html += `<div class="table-wrapper"><table class="table"><thead><tr><th>Claim ID</th><th>Total</th><th>Covered</th><th>Status</th></tr></thead><tbody>`;
            insured.forEach(b => { html += `<tr><td>${esc(b.claim_id || 'N/A')}</td><td>$${b.total_amount}</td><td>$${b.insurance_amount}</td><td>${statusBadge(b.insurance_amount >= b.total_amount ? 'completed' : 'pending')}</td></tr>`; });
            html += '</tbody></table></div>';
        }
        return html;
    }

    function renderInsurance() {
        const hid = CareCluster.Auth.currentHospitalId(); const bills = CareCluster.Data.getStore(hid, 'bills').filter(b => b.insurance_amount > 0);
        let html = `<div class="page-header"><h2>Insurance Management</h2></div>`;
        html += `<div class="table-wrapper"><table class="table"><thead><tr><th>Patient</th><th>Claim ID</th><th>Total</th><th>Insurance</th><th>Outstanding</th><th>Status</th></tr></thead><tbody>`;
        if (bills.length === 0) html += '<tr><td colspan="6" class="text-center text-muted" style="padding:var(--space-8)">No insurance records.</td></tr>';
        else bills.forEach(b => { const o = Math.max(0, b.total_amount - b.insurance_amount - b.self_payment); html += `<tr><td>${esc(b.patient_name)}</td><td>${esc(b.claim_id || 'N/A')}</td><td>$${b.total_amount}</td><td>$${b.insurance_amount}</td><td style="color:${o > 0 ? 'var(--danger)' : 'var(--success)'}">$${o}</td><td>${statusBadge(o <= 0 ? 'completed' : 'pending')}</td></tr>`; });
        html += '</tbody></table></div>'; return html;
    }

    function checkFinancialClearance(patientId) {
        const hid = CareCluster.Auth.currentHospitalId();
        const bills = CareCluster.Data.getStore(hid, 'bills').filter(b => b.patient_id === patientId);
        const outstanding = bills.reduce((s, b) => s + Math.max(0, (b.total_amount || 0) - (b.insurance_amount || 0) - (b.self_payment || 0)), 0);
        return outstanding <= 0;
    }

    return { render, showAdd, saveBill, showEdit, updateBill, _calcOutstanding, _onPatientSelect, renderMyInsurance, renderInsurance, checkFinancialClearance };
})();
