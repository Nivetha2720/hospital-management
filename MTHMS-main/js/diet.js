/* CareCluster — Diet Prescription */
CareCluster.Diet = (() => {
    const { Icons, showToast, showModal, closeModal, esc, formatDate } = CareCluster.Utils;
    function render() {
        const user = CareCluster.Auth.currentUser(); const hid = user.hospital_id;
        if (user.role === 'patient') return renderPatientView(hid, user);
        const patients = CareCluster.Data.getStore(hid, 'patients').filter(p => p.status === 'admitted');
        const diets = CareCluster.Data.getStore(hid, 'diet_prescriptions');
        let html = `<div class="page-header"><h2>Diet Prescriptions</h2><div class="page-header-actions"><button class="btn btn-primary" onclick="CareCluster.Diet.showAdd()"><span style="width:16px;height:16px;display:flex">${Icons.plus}</span> Add Prescription</button></div></div>`;
        html += `<div class="table-wrapper"><table class="table"><thead><tr><th>Patient</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th><th>Restrictions</th><th>Duration</th><th>Actions</th></tr></thead><tbody>`;
        if (diets.length === 0) html += '<tr><td colspan="7" class="text-center text-muted" style="padding:var(--space-8)">No prescriptions.</td></tr>';
        else diets.forEach(d => { html += `<tr><td><strong>${esc(d.patient_name)}</strong></td><td>${esc(d.breakfast)}</td><td>${esc(d.lunch)}</td><td>${esc(d.dinner)}</td><td>${esc(d.restrictions || 'None')}</td><td>${d.duration || '—'}</td><td><button class="btn btn-ghost btn-sm" onclick="CareCluster.Diet.showEdit('${d.id}')"><span style="width:14px;height:14px;display:flex">${Icons.edit}</span></button></td></tr>`; });
        html += '</tbody></table></div>'; return html;
    }
    function renderPatientView(hid, user) {
        const diets = CareCluster.Data.getStore(hid, 'diet_prescriptions').filter(d => d.patient_id === user.id);
        let html = `<div class="page-header"><h2>My Diet Prescription</h2></div>`;
        if (diets.length === 0) return html + '<div class="empty-state"><h3>No Diet Prescription</h3><p>Your doctor has not prescribed a diet yet.</p></div>';
        diets.forEach(d => {
            html += `<div class="card" style="margin-bottom:var(--space-4)"><div class="grid-2" style="gap:var(--space-5)">
        <div><h5 style="color:var(--success);margin-bottom:var(--space-2)">Breakfast</h5><p>${esc(d.breakfast)}</p></div>
        <div><h5 style="color:var(--primary);margin-bottom:var(--space-2)">Lunch</h5><p>${esc(d.lunch)}</p></div>
        <div><h5 style="color:var(--warning);margin-bottom:var(--space-2)">Dinner</h5><p>${esc(d.dinner)}</p></div>
        <div><h5 style="color:var(--danger);margin-bottom:var(--space-2)">Restrictions</h5><p>${esc(d.restrictions || 'None')}</p></div></div>
        <div style="margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--border-color)"><small style="color:var(--text-muted)">Duration: ${d.duration || 'Not specified'} | Prescribed: ${formatDate(d.created_at)}</small></div></div>`;
        });
        return html;
    }
    function showAdd() {
        const hid = CareCluster.Auth.currentHospitalId(); const patients = CareCluster.Data.getStore(hid, 'patients').filter(p => p.status === 'admitted');
        showModal('Add Diet Prescription', `<form id="diet-form">
      <div class="form-group"><label class="form-label">Patient *</label><select class="form-select" name="patient_id" required><option value="">Select</option>${patients.map(p => `<option value="${p.id}" data-name="${esc(p.name)}">${esc(p.name)}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Breakfast *</label><input class="form-input" name="breakfast" required placeholder="Morning meal plan"></div>
      <div class="form-group"><label class="form-label">Lunch *</label><input class="form-input" name="lunch" required placeholder="Afternoon meal plan"></div>
      <div class="form-group"><label class="form-label">Dinner *</label><input class="form-input" name="dinner" required placeholder="Evening meal plan"></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Restrictions</label><input class="form-input" name="restrictions" placeholder="No sugar, low salt..."></div>
        <div class="form-group"><label class="form-label">Duration</label><input class="form-input" name="duration" placeholder="e.g. 7 days"></div></div></form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button><button class="btn btn-primary" onclick="CareCluster.Diet.save()">Save</button>`);
    }
    function save() {
        const fd = new FormData(document.getElementById('diet-form')); const data = Object.fromEntries(fd);
        if (!data.patient_id || !data.breakfast || !data.lunch || !data.dinner) { showToast('Fill required fields', 'warning'); return; }
        const hid = CareCluster.Auth.currentHospitalId(); const patient = CareCluster.Data.getRecord(hid, 'patients', data.patient_id);
        data.patient_name = patient?.name || 'Unknown';
        CareCluster.Data.addRecord(hid, 'diet_prescriptions', data);
        CareCluster.Data.addAuditLog(hid, 'DIET_PRESCRIBED', `Diet for ${data.patient_name}`);
        closeModal(); showToast('Diet prescribed', 'success'); CareCluster.App.navigate('diet');
    }
    function showEdit(id) {
        const hid = CareCluster.Auth.currentHospitalId(); const d = CareCluster.Data.getRecord(hid, 'diet_prescriptions', id); if (!d) return;
        showModal('Edit Diet', `<form id="diet-edit"><input type="hidden" name="id" value="${d.id}">
      <div class="form-group"><label class="form-label">Patient</label><input class="form-input" value="${esc(d.patient_name)}" disabled></div>
      <div class="form-group"><label class="form-label">Breakfast</label><input class="form-input" name="breakfast" value="${esc(d.breakfast)}"></div>
      <div class="form-group"><label class="form-label">Lunch</label><input class="form-input" name="lunch" value="${esc(d.lunch)}"></div>
      <div class="form-group"><label class="form-label">Dinner</label><input class="form-input" name="dinner" value="${esc(d.dinner)}"></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Restrictions</label><input class="form-input" name="restrictions" value="${esc(d.restrictions || '')}"></div>
        <div class="form-group"><label class="form-label">Duration</label><input class="form-input" name="duration" value="${esc(d.duration || '')}"></div></div></form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button><button class="btn btn-primary" onclick="CareCluster.Diet.update()">Update</button>`);
    }
    function update() {
        const fd = new FormData(document.getElementById('diet-edit')); const data = Object.fromEntries(fd);
        CareCluster.Data.updateRecord(CareCluster.Auth.currentHospitalId(), 'diet_prescriptions', data.id, data);
        closeModal(); showToast('Updated', 'success'); CareCluster.App.navigate('diet');
    }
    return { render, renderPatientView, showAdd, save, showEdit, update };
})();
