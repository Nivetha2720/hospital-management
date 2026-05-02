/* CareCluster — Lab Reports */
CareCluster.Lab = (() => {
    const { Icons, showToast, showModal, closeModal, statusBadge, formatDate, esc } = CareCluster.Utils;
    function render() {
        const user = CareCluster.Auth.currentUser(); const hid = user.hospital_id;
        const isPatient = user.role === 'patient';
        const reports = isPatient ? CareCluster.Data.getStore(hid, 'lab_reports').filter(r => r.patient_id === user.id) : CareCluster.Data.getStore(hid, 'lab_reports');
        const canEdit = CareCluster.RBAC.canEditLabReports(user.role);
        let html = `<div class="page-header"><h2>${isPatient ? 'My Lab Reports' : 'Lab Reports'}</h2>
      <div class="page-header-actions">${canEdit ? `<button class="btn btn-primary" onclick="CareCluster.Lab.showAdd()"><span style="width:16px;height:16px;display:flex">${Icons.plus}</span> New Report</button>` : ''}</div></div>`;
        html += `<div class="table-wrapper"><table class="table"><thead><tr><th>Report ID</th><th>Patient</th><th>Test</th><th>Result</th><th>Status</th><th>Date</th>${canEdit ? '<th>Actions</th>' : ''}</tr></thead><tbody>`;
        if (reports.length === 0) html += '<tr><td colspan="7" class="text-center text-muted" style="padding:var(--space-8)">No lab reports.</td></tr>';
        else reports.forEach(r => {
            html += `<tr><td><code>${(r.id || '').slice(0, 10)}</code></td><td>${esc(r.patient_name || '—')}</td><td>${esc(r.test_name)}</td><td>${esc(r.result || 'Pending')}</td><td>${statusBadge(r.status || 'pending')}</td><td>${formatDate(r.created_at)}</td>${canEdit ? `<td class="table-actions"><button class="btn btn-ghost btn-sm" onclick="CareCluster.Lab.showEdit('${r.id}')"><span style="width:14px;height:14px;display:flex">${Icons.edit}</span></button></td>` : ''}</tr>`;
        });
        html += '</tbody></table></div>'; return html;
    }
    function showAdd() {
        const hid = CareCluster.Auth.currentHospitalId(); const patients = CareCluster.Data.getStore(hid, 'patients');
        showModal('New Lab Report', `<form id="lab-form">
      <div class="form-group"><label class="form-label">Patient *</label><select class="form-select" name="patient_id" required><option value="">Select</option>${patients.map(p => `<option value="${p.id}" data-name="${esc(p.name)}">${esc(p.name)}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Test Name *</label><input type="text" class="form-input" name="test_name" required placeholder="e.g. Complete Blood Count"></div>
      <div class="form-group"><label class="form-label">Test Category</label><select class="form-select" name="category"><option>Hematology</option><option>Biochemistry</option><option>Microbiology</option><option>Radiology</option><option>Pathology</option><option>Urinalysis</option></select></div>
      <div class="form-group"><label class="form-label">Result</label><textarea class="form-textarea" name="result" rows="3" placeholder="Test results..."></textarea></div>
      <div class="form-group"><label class="form-label">Status</label><select class="form-select" name="status"><option value="pending">Pending</option><option value="completed">Completed</option></select></div>
      <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" name="notes" rows="2"></textarea></div></form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button><button class="btn btn-primary" onclick="CareCluster.Lab.save()">Create</button>`);
    }
    function save() {
        const fd = new FormData(document.getElementById('lab-form')); const data = Object.fromEntries(fd);
        if (!data.patient_id || !data.test_name) { showToast('Fill required fields', 'warning'); return; }
        const hid = CareCluster.Auth.currentHospitalId();
        const patient = CareCluster.Data.getRecord(hid, 'patients', data.patient_id);
        data.patient_name = patient?.name || 'Unknown';
        CareCluster.Data.addRecord(hid, 'lab_reports', data);
        CareCluster.Data.addAuditLog(hid, 'LAB_REPORT_CREATED', `Lab report for ${data.patient_name}: ${data.test_name}`);
        if (data.status === 'completed') CareCluster.Data.addNotification(hid, ['doctor', 'patient'], `Lab report ready: ${data.test_name} for ${data.patient_name}`, 'info');
        closeModal(); showToast('Lab report created', 'success'); CareCluster.App.navigate(CareCluster.Auth.currentRole() === 'patient' ? 'my_lab_reports' : 'lab_reports');
    }
    function showEdit(id) {
        const hid = CareCluster.Auth.currentHospitalId(); const r = CareCluster.Data.getRecord(hid, 'lab_reports', id); if (!r) return;
        showModal('Edit Lab Report', `<form id="lab-edit-form"><input type="hidden" name="id" value="${r.id}">
      <div class="form-group"><label class="form-label">Patient</label><input class="form-input" value="${esc(r.patient_name)}" disabled></div>
      <div class="form-group"><label class="form-label">Test</label><input class="form-input" name="test_name" value="${esc(r.test_name)}"></div>
      <div class="form-group"><label class="form-label">Result</label><textarea class="form-textarea" name="result" rows="3">${esc(r.result || '')}</textarea></div>
      <div class="form-group"><label class="form-label">Status</label><select class="form-select" name="status"><option value="pending" ${r.status === 'pending' ? 'selected' : ''}>Pending</option><option value="completed" ${r.status === 'completed' ? 'selected' : ''}>Completed</option></select></div>
      <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" name="notes" rows="2">${esc(r.notes || '')}</textarea></div></form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button><button class="btn btn-primary" onclick="CareCluster.Lab.update()">Update</button>`);
    }
    function update() {
        const fd = new FormData(document.getElementById('lab-edit-form')); const data = Object.fromEntries(fd);
        const hid = CareCluster.Auth.currentHospitalId();
        CareCluster.Data.updateRecord(hid, 'lab_reports', data.id, data);
        CareCluster.Data.addAuditLog(hid, 'LAB_REPORT_UPDATED', `Lab report ${data.id} updated`);
        if (data.status === 'completed') CareCluster.Data.addNotification(hid, ['doctor'], `Lab report completed: ${data.test_name}`, 'info');
        closeModal(); showToast('Report updated', 'success'); CareCluster.App.navigate('lab_reports');
    }
    return { render, showAdd, save, showEdit, update };
})();
