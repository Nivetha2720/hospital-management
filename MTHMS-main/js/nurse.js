/* CareCluster — Nurse Module */
CareCluster.Nurse = (() => {
    const { Icons, showToast, showModal, closeModal, statusBadge, formatDate, esc } = CareCluster.Utils;
    function renderVitals() {
        const hid = CareCluster.Auth.currentHospitalId(); const patients = CareCluster.Data.getStore(hid, 'patients').filter(p => p.status === 'admitted');
        let html = `<div class="page-header"><h2>Update Vitals</h2></div>`;
        if (patients.length === 0) return html + '<div class="empty-state"><h3>No Admitted Patients</h3></div>';
        html += `<div class="grid-2">${patients.map(p => {
            const vitals = CareCluster.Data.getStore(hid, 'vitals').filter(v => v.patient_id === p.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            const latest = vitals[0];
            return `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3)"><h4>${esc(p.name)}</h4>${p.severity ? statusBadge(p.severity) : ''}</div>
        <div style="font-size:var(--fs-sm);color:var(--text-muted);margin-bottom:var(--space-3)">${esc(p.department || '')} | Admitted ${formatDate(p.admitted_date)}</div>
        ${latest ? `<div class="grid-2" style="gap:var(--space-2);margin-bottom:var(--space-3)"><div style="padding:var(--space-2);background:var(--bg-input);border-radius:var(--radius-sm)"><small style="color:var(--text-muted)">Temp</small><div style="font-weight:600">${latest.temperature || '—'}°F</div></div><div style="padding:var(--space-2);background:var(--bg-input);border-radius:var(--radius-sm)"><small style="color:var(--text-muted)">Heart Rate</small><div style="font-weight:600">${latest.heart_rate || '—'} bpm</div></div><div style="padding:var(--space-2);background:var(--bg-input);border-radius:var(--radius-sm)"><small style="color:var(--text-muted)">BP</small><div style="font-weight:600">${latest.bp || '—'}</div></div><div style="padding:var(--space-2);background:var(--bg-input);border-radius:var(--radius-sm)"><small style="color:var(--text-muted)">SpO2</small><div style="font-weight:600">${latest.spo2 || '—'}%</div></div></div>` : '<p style="font-size:var(--fs-sm);color:var(--text-muted);margin-bottom:var(--space-3)">No vitals recorded</p>'}
        <button class="btn btn-primary btn-sm" onclick="CareCluster.Nurse.showVitalForm('${p.id}','${esc(p.name)}')">Update Vitals</button></div>`
        }).join('')}</div>`;
        return html;
    }
    function showVitalForm(pid, name) {
        showModal('Update Vitals — ' + name, `<form id="vitals-form"><input type="hidden" name="patient_id" value="${pid}">
      <div class="form-row"><div class="form-group"><label class="form-label">Temperature (°F)</label><input type="number" class="form-input" name="temperature" step="0.1" placeholder="98.6"></div>
        <div class="form-group"><label class="form-label">Heart Rate (bpm)</label><input type="number" class="form-input" name="heart_rate" placeholder="72"></div></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Blood Pressure</label><input class="form-input" name="bp" placeholder="120/80"></div>
        <div class="form-group"><label class="form-label">SpO2 (%)</label><input type="number" class="form-input" name="spo2" placeholder="98"></div></div>
      <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" name="notes" rows="2"></textarea></div></form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button><button class="btn btn-primary" onclick="CareCluster.Nurse.saveVitals()">Save</button>`);
    }
    function saveVitals() {
        const fd = new FormData(document.getElementById('vitals-form')); const data = Object.fromEntries(fd);
        CareCluster.Data.addRecord(CareCluster.Auth.currentHospitalId(), 'vitals', data);
        CareCluster.Data.addAuditLog(CareCluster.Auth.currentHospitalId(), 'VITALS_UPDATED', `Vitals for ${data.patient_id}`);
        closeModal(); showToast('Vitals updated', 'success'); CareCluster.App.navigate('vitals');
    }
    function renderTasks() {
        const hid = CareCluster.Auth.currentHospitalId(); const user = CareCluster.Auth.currentUser();
        const tasks = CareCluster.Data.getStore(hid, 'nurse_tasks');
        const isAdmin = user.role === 'admin';
        let html = `<div class="page-header"><h2>${isAdmin ? 'Nurse Tasks Management' : 'My Tasks'}</h2><div class="page-header-actions">${isAdmin ? `<button class="btn btn-primary" onclick="CareCluster.Nurse.showAddTask()"><span style="width:16px;height:16px;display:flex">${Icons.plus}</span> Assign Task</button>` : ''}</div></div>`;
        const myTasks = isAdmin ? tasks : tasks.filter(t => t.assigned_to === user.id || t.assigned_to === 'all');
        html += `<div class="table-wrapper"><table class="table"><thead><tr><th>Task</th><th>Patient</th><th>Priority</th><th>Status</th><th>Assigned</th><th>Actions</th></tr></thead><tbody>`;
        if (myTasks.length === 0) html += '<tr><td colspan="6" class="text-center text-muted" style="padding:var(--space-8)">No tasks.</td></tr>';
        else myTasks.forEach(t => {
            html += `<tr><td>${esc(t.description)}</td><td>${esc(t.patient_name || '—')}</td><td>${statusBadge(t.priority || 'normal')}</td><td>${statusBadge(t.status || 'pending')}</td><td>${formatDate(t.created_at)}</td><td>${t.status !== 'completed' ? `<button class="btn btn-success btn-sm" onclick="CareCluster.Nurse.completeTask('${t.id}')">Complete</button>` : ''}</td></tr>`;
        });
        html += '</tbody></table></div>'; return html;
    }
    function showAddTask() {
        const hid = CareCluster.Auth.currentHospitalId(); const nurses = CareCluster.Data.getStore(hid, 'users').filter(u => u.role === 'nurse'); const patients = CareCluster.Data.getStore(hid, 'patients').filter(p => p.status === 'admitted');
        showModal('Assign Task', `<form id="task-form">
      <div class="form-group"><label class="form-label">Task *</label><input class="form-input" name="description" required placeholder="Task description"></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Assign To</label><select class="form-select" name="assigned_to"><option value="all">All Nurses</option>${nurses.map(n => `<option value="${n.id}">${esc(n.name)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Patient</label><select class="form-select" name="patient_id"><option value="">None</option>${patients.map(p => `<option value="${p.id}" data-name="${esc(p.name)}">${esc(p.name)}</option>`).join('')}</select></div></div>
      <div class="form-group"><label class="form-label">Priority</label><select class="form-select" name="priority"><option>Normal</option><option>Priority</option><option>Emergency</option></select></div></form>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button><button class="btn btn-primary" onclick="CareCluster.Nurse.saveTask()">Assign</button>`);
    }
    function saveTask() {
        const fd = new FormData(document.getElementById('task-form')); const data = Object.fromEntries(fd);
        if (!data.description) { showToast('Enter task description', 'warning'); return; }
        const hid = CareCluster.Auth.currentHospitalId();
        const patientSel = document.querySelector('#task-form select[name="patient_id"]');
        data.patient_name = patientSel?.selectedOptions[0]?.dataset?.name || ''; data.status = 'pending';
        CareCluster.Data.addRecord(hid, 'nurse_tasks', data);
        CareCluster.Data.addNotification(hid, ['nurse'], `New task: ${data.description}`, 'info');
        closeModal(); showToast('Task assigned', 'success'); CareCluster.App.navigate('nurse_tasks');
    }
    function completeTask(id) {
        CareCluster.Data.updateRecord(CareCluster.Auth.currentHospitalId(), 'nurse_tasks', id, { status: 'completed' });
        showToast('Task completed', 'success'); CareCluster.App.navigate('nurse_tasks');
    }
    function renderPatientsView() {
        const hid = CareCluster.Auth.currentHospitalId(); const patients = CareCluster.Data.getStore(hid, 'patients').filter(p => p.status === 'admitted');
        let html = `<div class="page-header"><h2>Admitted Patients</h2></div>`;
        html += `<div class="table-wrapper"><table class="table"><thead><tr><th>Name</th><th>Dept</th><th>Severity</th><th>Admitted</th></tr></thead><tbody>`;
        if (patients.length === 0) html += '<tr><td colspan="4" class="text-center text-muted" style="padding:var(--space-8)">No admitted patients.</td></tr>';
        else patients.forEach(p => { html += `<tr class="${p.severity === 'emergency' ? 'emergency-row' : ''}"><td><strong>${esc(p.name)}</strong></td><td>${esc(p.department || '—')}</td><td>${p.severity ? statusBadge(p.severity) : '—'}</td><td>${formatDate(p.admitted_date)}</td></tr>`; });
        html += '</tbody></table></div>'; return html;
    }
    return { renderVitals, showVitalForm, saveVitals, renderTasks, showAddTask, saveTask, completeTask, renderPatientsView };
})();
