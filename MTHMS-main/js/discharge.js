/* CareCluster — Discharge Workflow */
CareCluster.Discharge = (() => {
    const { Icons, showToast, showModal, closeModal, statusBadge, formatDate, esc } = CareCluster.Utils;
    function render() {
        const user = CareCluster.Auth.currentUser(); const hid = user.hospital_id;
        const patients = CareCluster.Data.getStore(hid, 'patients').filter(p => p.status === 'admitted' || p.discharge_status);
        const canApprove = CareCluster.RBAC.canApproveDischarge(user.role);
        let html = `<div class="page-header"><h2>Discharge Management</h2></div>`;
        html += `<div class="table-wrapper"><table class="table"><thead><tr><th>Patient</th><th>Department</th><th>Admitted</th><th>Severity</th><th>Financial</th><th>Discharge Status</th><th>Actions</th></tr></thead><tbody>`;
        if (patients.length === 0) html += '<tr><td colspan="7" class="text-center text-muted" style="padding:var(--space-8)">No patients for discharge.</td></tr>';
        else patients.forEach(p => {
            const cleared = CareCluster.Billing.checkFinancialClearance(p.id);
            html += `<tr><td><strong>${esc(p.name)}</strong></td><td>${esc(p.department || '—')}</td><td>${formatDate(p.admitted_date)}</td><td>${p.severity ? statusBadge(p.severity) : '—'}</td>
        <td>${statusBadge(cleared ? 'approved' : 'pending')}</td><td>${statusBadge(p.discharge_status || 'pending')}</td>
        <td class="table-actions">
          ${canApprove && p.status === 'admitted' && p.discharge_status !== 'completed' ? `<button class="btn btn-success btn-sm" onclick="CareCluster.Discharge.showApprove('${p.id}')">Approve Discharge</button>` : ''}
          ${p.discharge_status === 'completed' ? statusBadge('completed') : ''}
        </td></tr>`;
        });
        html += '</tbody></table></div>'; return html;
    }
    function showApprove(pid) {
        const hid = CareCluster.Auth.currentHospitalId(); const p = CareCluster.Data.getRecord(hid, 'patients', pid);
        const cleared = CareCluster.Billing.checkFinancialClearance(pid);
        showModal('Approve Discharge — ' + esc(p.name), `
      ${!cleared ? `<div style="padding:var(--space-3);background:var(--danger-light);border:1px solid var(--danger);border-radius:var(--radius-md);margin-bottom:var(--space-4)"><strong style="color:var(--danger)">Financial Clearance Required</strong><p style="font-size:var(--fs-sm);margin-top:4px">Outstanding balance exists. Admin override is needed.</p></div>` : ''}
      <form id="discharge-form">
        <div class="form-group"><label class="form-label">Discharge Summary *</label><textarea class="form-textarea" name="summary" required rows="3" placeholder="Final diagnosis, treatment summary..."></textarea></div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" name="notes" rows="2" placeholder="Additional notes..."></textarea></div>
        <div class="form-group"><label class="form-label">Follow-up Diet Plan</label><textarea class="form-textarea" name="diet_plan" rows="2" placeholder="Post-discharge diet recommendations..."></textarea></div>
      </form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button>
      ${!cleared && CareCluster.Auth.currentRole() === 'admin' ? `<button class="btn btn-warning" onclick="CareCluster.Discharge.adminOverride('${pid}')">Admin Override</button>` : ''}
      ${cleared ? `<button class="btn btn-success" onclick="CareCluster.Discharge.confirm('${pid}')">Complete Discharge</button>` : `<button class="btn btn-success" disabled>Complete (Blocked)</button>`}`);
    }
    function confirm(pid) {
        const fd = new FormData(document.getElementById('discharge-form')); const data = Object.fromEntries(fd);
        if (!data.summary) { showToast('Discharge summary required', 'warning'); return; }
        const hid = CareCluster.Auth.currentHospitalId(); const p = CareCluster.Data.getRecord(hid, 'patients', pid);
        CareCluster.Data.updateRecord(hid, 'patients', pid, { status: 'discharged', discharge_status: 'completed', discharge_summary: data.summary, discharge_notes: data.notes, discharge_diet: data.diet_plan, discharged_date: new Date().toISOString(), feedback_eligible: true });
        CareCluster.Data.addAuditLog(hid, 'DISCHARGE_COMPLETED', `${p.name} discharged`);
        CareCluster.Data.addNotification(hid, ['patient', 'receptionist', 'admin'], `Patient ${p.name} discharged successfully`, 'info');
        closeModal(); showToast('Patient discharged successfully. Feedback eligible.', 'success'); CareCluster.App.navigate('discharge');
    }
    function adminOverride(pid) {
        const hid = CareCluster.Auth.currentHospitalId(); const p = CareCluster.Data.getRecord(hid, 'patients', pid);
        CareCluster.Data.addAuditLog(hid, 'ADMIN_OVERRIDE', 'Financial override for discharge: ' + p.name);
        showToast('Admin override applied. You can now complete discharge.', 'warning');
        // Enable the complete button
        const fd = new FormData(document.getElementById('discharge-form')); const data = Object.fromEntries(fd);
        if (!data.summary) { showToast('Still need discharge summary', 'warning'); return; }
        CareCluster.Discharge.confirm(pid);
    }
    return { render, showApprove, confirm, adminOverride };
})();
