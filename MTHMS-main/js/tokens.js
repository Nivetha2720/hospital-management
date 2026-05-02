/* =========================================
   CareCluster — Token Booking System
   ========================================= */

CareCluster.Tokens = (() => {
    const { Icons, showToast, showModal, closeModal, statusBadge, formatDate, esc } = CareCluster.Utils;

    function render() {
        const user = CareCluster.Auth.currentUser();
        const hid = user.hospital_id;
        const role = user.role;

        if (role === 'patient') return renderPatientBooking(hid, user);
        return renderManagement(hid, user);
    }

    function renderPatientBooking(hid, user) {
        const depts = CareCluster.Data.DEPARTMENTS;
        const myTokens = CareCluster.Data.getStore(hid, 'tokens').filter(t => t.patient_id === user.id);

        return `
    <div class="page-header"><h2>Book Token</h2></div>
    <div class="grid-2">
      <div class="card">
        <h4 class="card-title" style="margin-bottom:var(--space-4)">New Token Request</h4>
        <form id="token-form" class="auth-form">
          <div class="form-group"><label class="form-label">Department *</label>
            <select class="form-select" name="department" required><option value="">Select department</option>${depts.map(d => `<option>${d}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Preferred Date *</label>
            <input type="date" class="form-input" name="preferred_date" required min="${new Date().toISOString().split('T')[0]}"></div>
          <div class="form-group"><label class="form-label">Symptoms / Reason *</label>
            <textarea class="form-textarea" name="symptoms" required placeholder="Describe your symptoms or reason for visit..." rows="3"></textarea></div>
          <button type="button" class="btn btn-primary btn-block" onclick="CareCluster.Tokens.submitToken()">Submit Token Request</button>
        </form>
      </div>
      <div class="card">
        <h4 class="card-title" style="margin-bottom:var(--space-4)">My Tokens</h4>
        ${myTokens.length === 0 ? '<p style="color:var(--text-muted);font-size:var(--fs-sm)">No tokens booked yet.</p>' :
                myTokens.map(t => `
          <div style="padding:var(--space-3);border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:var(--space-3)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2)">
              <strong style="font-size:var(--fs-sm)">${esc(t.department)}</strong>
              ${statusBadge(t.status)}
            </div>
            <p style="font-size:var(--fs-xs);color:var(--text-muted)">Token: ${t.token_id || t.id.slice(0, 8).toUpperCase()}</p>
            <p style="font-size:var(--fs-xs);color:var(--text-muted)">Date: ${formatDate(t.preferred_date)} ${t.allotted_slot ? '| Slot: ' + t.allotted_slot : ''}</p>
          </div>`).join('')}
      </div>
    </div>`;
    }

    function renderManagement(hid, user) {
        const tokens = CareCluster.Data.getStore(hid, 'tokens');
        const pending = tokens.filter(t => t.status === 'pending');
        const confirmed = tokens.filter(t => t.status === 'confirmed');

        return `
    <div class="page-header">
      <h2>Token Management</h2>
      <div class="page-header-actions">
        <span class="badge badge-warning">${pending.length} Pending</span>
        <span class="badge badge-approved">${confirmed.length} Confirmed</span>
      </div>
    </div>
    <div class="table-wrapper">
      <table class="table">
        <thead><tr><th>Token</th><th>Patient</th><th>Department</th><th>Preferred Date</th><th>Symptoms</th><th>Status</th><th>Slot</th><th>Actions</th></tr></thead>
        <tbody>
          ${tokens.length === 0 ? '<tr><td colspan="8" class="text-center text-muted" style="padding:var(--space-8)">No token requests yet.</td></tr>' :
                tokens.sort((a, b) => (a.status === 'pending' ? -1 : 1)).map(t => `
            <tr>
              <td><code style="font-size:var(--fs-xs)">${t.token_id || t.id.slice(0, 8).toUpperCase()}</code></td>
              <td>${esc(t.patient_name || '—')}</td>
              <td>${esc(t.department)}</td>
              <td>${formatDate(t.preferred_date)}</td>
              <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(t.symptoms)}">${esc(t.symptoms)}</td>
              <td>${statusBadge(t.status)}</td>
              <td>${t.allotted_slot || '—'}</td>
              <td class="table-actions">
                ${t.status === 'pending' ? `
                <button class="btn btn-success btn-sm" onclick="CareCluster.Tokens.allotSlot('${t.id}')">Allot Slot</button>
                <button class="btn btn-danger btn-sm" onclick="CareCluster.Tokens.reject('${t.id}')">Reject</button>` :
                        t.status === 'confirmed' ? `<button class="btn btn-ghost btn-sm" onclick="CareCluster.Tokens.complete('${t.id}')">Complete</button>` : ''}
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
    }

    function submitToken() {
        const form = document.getElementById('token-form');
        const fd = new FormData(form);
        const data = Object.fromEntries(fd);
        if (!data.department || !data.preferred_date || !data.symptoms) {
            showToast('Please fill all required fields', 'warning'); return;
        }

        const user = CareCluster.Auth.currentUser();
        const hid = user.hospital_id;
        const tokenId = 'TKN-' + Date.now().toString().slice(-6);

        CareCluster.Data.addRecord(hid, 'tokens', {
            token_id: tokenId,
            patient_id: user.id,
            patient_name: user.name,
            department: data.department,
            preferred_date: data.preferred_date,
            symptoms: data.symptoms,
            status: 'pending',
            allotted_slot: null
        });

        CareCluster.Data.addNotification(hid, ['receptionist', 'admin'], `New token request from ${user.name} for ${data.department}`, 'info');
        CareCluster.Data.addAuditLog(hid, 'TOKEN_BOOKED', `Token ${tokenId} booked by ${user.name}`);
        showToast('Token request submitted! You will be notified when a slot is allotted.', 'success');
        CareCluster.App.navigate('token_booking');
    }

    function allotSlot(id) {
        showModal('Allot Appointment Slot', `
      <form id="allot-form">
        <div class="form-group"><label class="form-label">Time Slot *</label>
          <select class="form-select" name="slot" required>
            <option value="">Select slot</option>
            <option>9:00 AM - 9:30 AM</option><option>9:30 AM - 10:00 AM</option>
            <option>10:00 AM - 10:30 AM</option><option>10:30 AM - 11:00 AM</option>
            <option>11:00 AM - 11:30 AM</option><option>11:30 AM - 12:00 PM</option>
            <option>2:00 PM - 2:30 PM</option><option>2:30 PM - 3:00 PM</option>
            <option>3:00 PM - 3:30 PM</option><option>3:30 PM - 4:00 PM</option>
            <option>4:00 PM - 4:30 PM</option><option>4:30 PM - 5:00 PM</option>
          </select>
        </div>
      </form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button>
       <button class="btn btn-success" onclick="CareCluster.Tokens.confirmSlot('${id}')">Confirm Slot</button>`);
    }

    function confirmSlot(id) {
        const slot = document.querySelector('#allot-form select[name="slot"]').value;
        if (!slot) { showToast('Please select a slot', 'warning'); return; }

        const hid = CareCluster.Auth.currentHospitalId();
        const token = CareCluster.Data.getRecord(hid, 'tokens', id);
        CareCluster.Data.updateRecord(hid, 'tokens', id, { status: 'confirmed', allotted_slot: slot });
        CareCluster.Data.addNotification(hid, ['patient'], `Your token ${token.token_id} is confirmed for ${slot}`, 'info', id);
        CareCluster.Data.addAuditLog(hid, 'TOKEN_CONFIRMED', `Token ${token.token_id} confirmed for ${slot}`);

        closeModal();
        showToast('Slot allotted and patient notified', 'success');
        CareCluster.App.navigate('tokens');
    }

    function reject(id) {
        const hid = CareCluster.Auth.currentHospitalId();
        CareCluster.Data.updateRecord(hid, 'tokens', id, { status: 'rejected' });
        CareCluster.Data.addAuditLog(hid, 'TOKEN_REJECTED', `Token ${id} rejected`);
        showToast('Token rejected', 'warning');
        CareCluster.App.navigate('tokens');
    }

    function complete(id) {
        const hid = CareCluster.Auth.currentHospitalId();
        CareCluster.Data.updateRecord(hid, 'tokens', id, { status: 'completed' });
        showToast('Token marked complete', 'success');
        CareCluster.App.navigate('tokens');
    }

    function renderMyAppointments() {
        const user = CareCluster.Auth.currentUser();
        const hid = user.hospital_id;
        const tokens = CareCluster.Data.getStore(hid, 'tokens').filter(t => t.patient_id === user.id);

        return `
    <div class="page-header"><h2>My Appointments</h2></div>
    ${tokens.length === 0 ? '<div class="empty-state"><h3>No appointments</h3><p>Book a token to get started.</p><button class="btn btn-primary mt-4" onclick="CareCluster.App.navigate(\'token_booking\')">Book Token</button></div>' :
                `<div class="table-wrapper"><table class="table">
      <thead><tr><th>Token</th><th>Department</th><th>Date</th><th>Slot</th><th>Status</th></tr></thead>
      <tbody>${tokens.map(t => `<tr><td>${t.token_id || t.id.slice(0, 8)}</td><td>${esc(t.department)}</td><td>${formatDate(t.preferred_date)}</td><td>${t.allotted_slot || '—'}</td><td>${statusBadge(t.status)}</td></tr>`).join('')}</tbody>
    </table></div>`}`;
    }

    return { render, submitToken, allotSlot, confirmSlot, reject, complete, renderMyAppointments };
})();
