/* =========================================
   CareCluster — Patient Management
   ========================================= */

CareCluster.Patients = (() => {
    const { Icons, showToast, showModal, closeModal, statusBadge, formatDate, esc } = CareCluster.Utils;

    function render() {
        const user = CareCluster.Auth.currentUser();
        const hid = user.hospital_id;
        const patients = CareCluster.Data.getStore(hid, 'patients');
        const isViewOnly = user.role === 'nurse';

        return `
    <div class="page-header">
      <h2>Patient Management</h2>
      <div class="page-header-actions">
        <div class="search-bar">
          ${Icons.search}
          <input type="text" placeholder="Search patients..." oninput="CareCluster.Patients.search(this.value)">
        </div>
        ${!isViewOnly ? `<button class="btn btn-primary" onclick="CareCluster.Patients.showAdd()">
          <span style="width:16px;height:16px;display:flex">${Icons.plus}</span> Add Patient
        </button>` : ''}
      </div>
    </div>
    <div class="table-wrapper">
      <table class="table" id="patients-table">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Age/Gender</th><th>Phone</th><th>Department</th><th>Status</th><th>Severity</th><th>Admitted</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${patients.length === 0 ? '<tr><td colspan="9" class="text-center text-muted" style="padding:var(--space-8)">No patients registered yet. Click "Add Patient" to begin.</td></tr>' :
                patients.map(p => `
            <tr class="${p.severity === 'emergency' ? 'emergency-row' : ''}">
              <td><code style="font-size:var(--fs-xs)">${(p.id || '').slice(0, 10)}</code></td>
              <td><strong>${esc(p.name)}</strong></td>
              <td>${p.age || '—'} / ${p.gender || '—'}</td>
              <td>${esc(p.phone || '—')}</td>
              <td>${esc(p.department || '—')}</td>
              <td>${statusBadge(p.status || 'outpatient')}</td>
              <td>${p.severity ? statusBadge(p.severity) : '—'}</td>
              <td>${formatDate(p.admitted_date)}</td>
              <td class="table-actions">
                <button class="btn btn-ghost btn-sm" onclick="CareCluster.Patients.view('${p.id}')" title="View">
                  <span style="width:14px;height:14px;display:flex">${Icons.eye}</span>
                </button>
                ${!isViewOnly ? `<button class="btn btn-ghost btn-sm" onclick="CareCluster.Patients.showEdit('${p.id}')" title="Edit">
                  <span style="width:14px;height:14px;display:flex">${Icons.edit}</span>
                </button>` : ''}
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
    }

    function search(query) {
        const rows = document.querySelectorAll('#patients-table tbody tr');
        rows.forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    function showAdd() {
        const depts = CareCluster.Data.DEPARTMENTS;
        showModal('Add New Patient', `
      <form id="add-patient-form" class="auth-form">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Full Name *</label>
            <input type="text" class="form-input" name="name" required placeholder="Patient full name"></div>
          <div class="form-group"><label class="form-label">Age *</label>
            <input type="number" class="form-input" name="age" required min="0" max="150" placeholder="Age"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Gender *</label>
            <select class="form-select" name="gender" required><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
          <div class="form-group"><label class="form-label">Phone</label>
            <input type="tel" class="form-input" name="phone" placeholder="+1-555-0000"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Email</label>
            <input type="email" class="form-input" name="email" placeholder="patient@email.com"></div>
          <div class="form-group"><label class="form-label">Blood Group</label>
            <select class="form-select" name="blood_group"><option value="">Select</option>${CareCluster.Data.BLOOD_GROUPS.map(b => `<option>${b}</option>`).join('')}</select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Department *</label>
            <select class="form-select" name="department" required><option value="">Select</option>${depts.map(d => `<option>${d}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Status</label>
            <select class="form-select" name="status"><option value="outpatient">Outpatient</option><option value="admitted">Admitted</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">Address</label>
          <textarea class="form-textarea" name="address" rows="2" placeholder="Full address"></textarea></div>
        <div class="form-group"><label class="form-label">Medical History</label>
          <textarea class="form-textarea" name="medical_history" rows="2" placeholder="Previous conditions, allergies, etc."></textarea></div>
      </form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button>
       <button class="btn btn-primary" onclick="CareCluster.Patients.saveNew()">Add Patient</button>`
            , 'modal-lg');
    }

    function saveNew() {
        const form = document.getElementById('add-patient-form');
        const fd = new FormData(form);
        const data = Object.fromEntries(fd);
        if (!data.name || !data.age || !data.gender || !data.department) {
            showToast('Please fill all required fields', 'warning'); return;
        }
        const hid = CareCluster.Auth.currentHospitalId();
        data.age = parseInt(data.age);
        data.admitted_date = data.status === 'admitted' ? new Date().toISOString() : null;
        data.discharge_status = null;
        data.severity = null;

        CareCluster.Data.addRecord(hid, 'patients', data);
        CareCluster.Data.addAuditLog(hid, 'PATIENT_ADDED', `Patient ${data.name} registered`);
        CareCluster.Data.addNotification(hid, ['doctor', 'nurse', 'admin'], `New patient registered: ${data.name}`, 'info');

        closeModal();
        showToast('Patient added successfully', 'success');
        CareCluster.App.navigate('patients');
    }

    function showEdit(id) {
        const hid = CareCluster.Auth.currentHospitalId();
        const p = CareCluster.Data.getRecord(hid, 'patients', id);
        if (!p) return;
        const depts = CareCluster.Data.DEPARTMENTS;
        showModal('Edit Patient', `
      <form id="edit-patient-form" class="auth-form">
        <input type="hidden" name="id" value="${p.id}">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Full Name</label>
            <input type="text" class="form-input" name="name" value="${esc(p.name)}" required></div>
          <div class="form-group"><label class="form-label">Age</label>
            <input type="number" class="form-input" name="age" value="${p.age || ''}" required></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Gender</label>
            <select class="form-select" name="gender"><option ${p.gender === 'Male' ? 'selected' : ''}>Male</option><option ${p.gender === 'Female' ? 'selected' : ''}>Female</option><option ${p.gender === 'Other' ? 'selected' : ''}>Other</option></select></div>
          <div class="form-group"><label class="form-label">Phone</label>
            <input type="tel" class="form-input" name="phone" value="${esc(p.phone || '')}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Department</label>
            <select class="form-select" name="department">${depts.map(d => `<option ${d === p.department ? 'selected' : ''}>${d}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Status</label>
            <select class="form-select" name="status"><option value="outpatient" ${p.status === 'outpatient' ? 'selected' : ''}>Outpatient</option><option value="admitted" ${p.status === 'admitted' ? 'selected' : ''}>Admitted</option><option value="discharged" ${p.status === 'discharged' ? 'selected' : ''}>Discharged</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">Medical History</label>
          <textarea class="form-textarea" name="medical_history" rows="2">${esc(p.medical_history || '')}</textarea></div>
      </form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button>
       <button class="btn btn-primary" onclick="CareCluster.Patients.saveEdit()">Save Changes</button>`, 'modal-lg');
    }

    function saveEdit() {
        const form = document.getElementById('edit-patient-form');
        const fd = new FormData(form);
        const data = Object.fromEntries(fd);
        const hid = CareCluster.Auth.currentHospitalId();
        data.age = parseInt(data.age);
        if (data.status === 'admitted' && !CareCluster.Data.getRecord(hid, 'patients', data.id)?.admitted_date) {
            data.admitted_date = new Date().toISOString();
        }
        CareCluster.Data.updateRecord(hid, 'patients', data.id, data);
        CareCluster.Data.addAuditLog(hid, 'PATIENT_UPDATED', `Patient ${data.name} updated`);
        closeModal();
        showToast('Patient updated', 'success');
        CareCluster.App.navigate('patients');
    }

    function view(id) {
        const hid = CareCluster.Auth.currentHospitalId();
        const p = CareCluster.Data.getRecord(hid, 'patients', id);
        if (!p) return;
        showModal('Patient Details', `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
        <div><small style="color:var(--text-muted)">Name</small><div style="font-weight:var(--fw-semibold)">${esc(p.name)}</div></div>
        <div><small style="color:var(--text-muted)">Age / Gender</small><div>${p.age} / ${p.gender}</div></div>
        <div><small style="color:var(--text-muted)">Phone</small><div>${esc(p.phone || '—')}</div></div>
        <div><small style="color:var(--text-muted)">Email</small><div>${esc(p.email || '—')}</div></div>
        <div><small style="color:var(--text-muted)">Department</small><div>${esc(p.department)}</div></div>
        <div><small style="color:var(--text-muted)">Status</small><div>${statusBadge(p.status || 'outpatient')}</div></div>
        <div><small style="color:var(--text-muted)">Blood Group</small><div>${p.blood_group || '—'}</div></div>
        <div><small style="color:var(--text-muted)">Admitted</small><div>${formatDate(p.admitted_date)}</div></div>
        <div style="grid-column:1/-1"><small style="color:var(--text-muted)">Medical History</small><div>${esc(p.medical_history || 'None recorded')}</div></div>
        <div style="grid-column:1/-1"><small style="color:var(--text-muted)">Address</small><div>${esc(p.address || 'Not provided')}</div></div>
      </div>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Close</button>`);
    }

    return { render, search, showAdd, saveNew, showEdit, saveEdit, view };
})();
