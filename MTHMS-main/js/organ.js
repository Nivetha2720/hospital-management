/* CareCluster — Organ Donation Module */
CareCluster.Organ = (() => {
    const { Icons, showToast, showModal, closeModal, statusBadge, formatDate, esc } = CareCluster.Utils;
    function render() { return renderAdmin(); }
    function renderAdmin() {
        const hid = CareCluster.Auth.currentHospitalId(); const donors = CareCluster.Data.getStore(hid, 'organ_donors');
        const pending = donors.filter(d => d.status === 'Pending').length; const approved = donors.filter(d => d.status === 'Approved').length;
        let html = `<div class="organ-accent"><div class="page-header"><h2>Organ Donation Management</h2></div>
      <div class="grid-4" style="margin-bottom:var(--space-6)">
        <div class="metric-card"><div class="metric-card-icon" style="background:var(--organ-green-light)"><span style="width:24px;height:24px;display:flex;color:var(--organ-green)">${Icons.organ}</span></div><div class="metric-card-info"><div class="metric-card-label">Total Donors</div><div class="metric-card-value">${donors.length}</div></div></div>
        <div class="metric-card"><div class="metric-card-icon" style="background:var(--info-light)"><span style="width:24px;height:24px;display:flex;color:var(--info)">${Icons.clock}</span></div><div class="metric-card-info"><div class="metric-card-label">Pending</div><div class="metric-card-value">${pending}</div></div></div>
        <div class="metric-card"><div class="metric-card-icon" style="background:var(--success-light)"><span style="width:24px;height:24px;display:flex;color:var(--success)">${Icons.check}</span></div><div class="metric-card-info"><div class="metric-card-label">Approved</div><div class="metric-card-value">${approved}</div></div></div>
        <div class="metric-card"><div class="metric-card-icon" style="background:var(--accent-green-light)"><span style="width:24px;height:24px;display:flex;color:var(--accent-green)">${Icons.vitals}</span></div><div class="metric-card-info"><div class="metric-card-label">Completed</div><div class="metric-card-value">${donors.filter(d => d.status === 'Completed').length}</div></div></div></div>`;
        html += `<div class="table-wrapper"><table class="table"><thead><tr><th>Donor</th><th>Organs</th><th>Blood Group</th><th>Status</th><th>Registered</th><th>Actions</th></tr></thead><tbody>`;
        if (donors.length === 0) html += '<tr><td colspan="6" class="text-center text-muted" style="padding:var(--space-8)">No organ donors registered.</td></tr>';
        else donors.forEach(d => {
            html += `<tr><td><strong>${esc(d.donor_name)}</strong></td><td>${(d.organs || []).join(', ')}</td><td>${d.blood_group || '—'}</td><td>${statusBadge(d.status.toLowerCase())}</td><td>${formatDate(d.created_at)}</td>
        <td class="table-actions">${d.status === 'Pending' ? `<button class="btn btn-success btn-sm" onclick="CareCluster.Organ.approve('${d.id}')">Approve</button><button class="btn btn-danger btn-sm" onclick="CareCluster.Organ.reject('${d.id}')">Reject</button>` : ''}${d.status === 'Approved' ? `<button class="btn btn-primary btn-sm" onclick="CareCluster.Organ.complete('${d.id}')">Complete</button>` : ''}</td></tr>`;
        });
        html += '</tbody></table></div></div>'; return html;
    }
    function renderPatientRegister() {
        const user = CareCluster.Auth.currentUser(); const hid = user.hospital_id;
        const existing = CareCluster.Data.getStore(hid, 'organ_donors').filter(d => d.patient_id === user.id);
        let html = `<div class="organ-accent"><div class="page-header"><h2>Organ Donor Registration</h2></div>`;
        if (existing.length > 0) {
            html += `<div class="card" style="margin-bottom:var(--space-6)"><h4 class="card-title">My Registrations</h4>${existing.map(d => `<div style="padding:var(--space-3);border:1px solid var(--border-color);border-radius:var(--radius-md);margin-top:var(--space-3);display:flex;justify-content:space-between"><div><strong>${(d.organs || []).join(', ')}</strong><p style="font-size:var(--fs-xs);color:var(--text-muted)">${formatDate(d.created_at)}</p></div>${statusBadge(d.status.toLowerCase())}</div>`).join('')}</div>`;
        }
        html += `<div class="card"><h4 class="card-title" style="margin-bottom:var(--space-4)">Register as Organ Donor</h4>
      <form id="organ-form">
        <div class="form-group"><label class="form-label">Select Organs *</label>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2)">${CareCluster.Data.ORGANS.map(o => `<label style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--fs-sm);cursor:pointer"><input type="checkbox" name="organs" value="${o}"> ${o}</label>`).join('')}</div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Blood Group</label><select class="form-select" name="blood_group"><option value="">Select</option>${CareCluster.Data.BLOOD_GROUPS.map(b => `<option>${b}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Emergency Contact</label><input class="form-input" name="emergency_contact" placeholder="+1-555-0000"></div></div>
        <div class="form-group"><label class="form-label">Medical Notes</label><textarea class="form-textarea" name="notes" rows="2" placeholder="Any relevant medical information..."></textarea></div>
        <div class="form-group"><label class="form-label">Digital Consent</label>
          <div class="signature-pad" id="consent-pad" onclick="CareCluster.Organ.signConsent()"><span>Click to sign consent</span></div>
          <input type="hidden" name="consent_signed" id="consent-signed" value="false"></div>
        <button type="button" class="btn btn-primary btn-block" style="background:var(--organ-green)" onclick="CareCluster.Organ.submitRegistration()">Register as Donor</button>
      </form></div></div>`;
        return html;
    }
    function signConsent() {
        const pad = document.getElementById('consent-pad');
        pad.innerHTML = '<div style="color:var(--organ-green);font-weight:600;font-size:var(--fs-lg)">✓ Consent Signed Digitally</div>';
        pad.style.borderColor = 'var(--organ-green)'; pad.style.background = 'var(--organ-green-light)';
        document.getElementById('consent-signed').value = 'true';
    }
    function submitRegistration() {
        const form = document.getElementById('organ-form');
        const checkboxes = form.querySelectorAll('input[name="organs"]:checked');
        const organs = Array.from(checkboxes).map(c => c.value);
        if (organs.length === 0) { showToast('Select at least one organ', 'warning'); return; }
        if (document.getElementById('consent-signed').value !== 'true') { showToast('Please sign consent', 'warning'); return; }
        const fd = new FormData(form); const data = Object.fromEntries(fd);
        const user = CareCluster.Auth.currentUser(); const hid = user.hospital_id;
        CareCluster.Data.addRecord(hid, 'organ_donors', { donor_name: user.name, patient_id: user.id, organs, blood_group: data.blood_group, emergency_contact: data.emergency_contact, notes: data.notes, consent_signed: true, status: 'Pending' });
        CareCluster.Data.addAuditLog(hid, 'ORGAN_DONOR_REGISTERED', `${user.name} registered: ${organs.join(',')}`);
        CareCluster.Data.addNotification(hid, ['admin'], `New organ donor: ${user.name}`, 'info');
        showToast('Registration submitted!', 'success'); CareCluster.App.navigate('organ_donor_register');
    }
    function approve(id) { const hid = CareCluster.Auth.currentHospitalId(); CareCluster.Data.updateRecord(hid, 'organ_donors', id, { status: 'Approved' }); CareCluster.Data.addAuditLog(hid, 'ORGAN_APPROVED', 'Donor ' + id); showToast('Approved', 'success'); CareCluster.App.navigate('organ_donation'); }
    function reject(id) { const hid = CareCluster.Auth.currentHospitalId(); CareCluster.Data.updateRecord(hid, 'organ_donors', id, { status: 'Rejected' }); CareCluster.Data.addAuditLog(hid, 'ORGAN_REJECTED', 'Donor ' + id); showToast('Rejected', 'warning'); CareCluster.App.navigate('organ_donation'); }
    function complete(id) { const hid = CareCluster.Auth.currentHospitalId(); CareCluster.Data.updateRecord(hid, 'organ_donors', id, { status: 'Completed' }); CareCluster.Data.addAuditLog(hid, 'ORGAN_COMPLETED', 'Donor ' + id); showToast('Completed', 'success'); CareCluster.App.navigate('organ_donation'); }
    return { render, renderPatientRegister, signConsent, submitRegistration, approve, reject, complete };
})();
