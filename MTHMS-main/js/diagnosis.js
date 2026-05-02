/* CareCluster — AI Diagnosis Engine */
CareCluster.Diagnosis = (() => {
    const { Icons, showToast, esc } = CareCluster.Utils;
    const SYMPTOM_DB = {
        'chest pain': { severity: 'emergency', dept: 'Cardiology', score: 9 },
        'shortness of breath': { severity: 'emergency', dept: 'Pulmonology', score: 8 },
        'severe bleeding': { severity: 'emergency', dept: 'Emergency', score: 10 },
        'unconscious': { severity: 'emergency', dept: 'Emergency', score: 10 },
        'seizure': { severity: 'emergency', dept: 'Neurology', score: 9 },
        'heart attack': { severity: 'emergency', dept: 'Cardiology', score: 10 },
        'high fever': { severity: 'priority', dept: 'General Medicine', score: 6 },
        'persistent cough': { severity: 'priority', dept: 'Pulmonology', score: 5 },
        'severe headache': { severity: 'priority', dept: 'Neurology', score: 6 },
        'abdominal pain': { severity: 'priority', dept: 'General Medicine', score: 6 },
        'fracture': { severity: 'priority', dept: 'Orthopedics', score: 7 },
        'dizziness': { severity: 'priority', dept: 'ENT', score: 5 },
        'vomiting': { severity: 'priority', dept: 'General Medicine', score: 5 },
        'headache': { severity: 'normal', dept: 'General Medicine', score: 3 },
        'cold': { severity: 'normal', dept: 'General Medicine', score: 2 },
        'fever': { severity: 'normal', dept: 'General Medicine', score: 3 },
        'skin rash': { severity: 'normal', dept: 'Dermatology', score: 3 },
        'eye pain': { severity: 'normal', dept: 'Ophthalmology', score: 4 },
        'ear pain': { severity: 'normal', dept: 'ENT', score: 3 },
        'back pain': { severity: 'normal', dept: 'Orthopedics', score: 4 },
        'anxiety': { severity: 'normal', dept: 'Psychiatry', score: 3 },
        'depression': { severity: 'priority', dept: 'Psychiatry', score: 5 },
    };

    function render() {
        const hid = CareCluster.Auth.currentHospitalId();
        const patients = CareCluster.Data.getStore(hid, 'patients');
        return `<div class="page-header"><h2>AI Diagnosis Engine</h2></div>
    <div class="grid-2">
      <div class="card"><h4 class="card-title" style="margin-bottom:var(--space-4)">${Icons.diagnosis} Run Diagnosis</h4>
        <form id="diagnosis-form">
          <div class="form-group"><label class="form-label">Patient *</label>
            <select class="form-select" name="patient_id" required><option value="">Select</option>${patients.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Symptoms * (comma separated)</label>
            <textarea class="form-textarea" name="symptoms" required placeholder="chest pain, fever..." rows="3"></textarea></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Temperature (°F)</label><input type="number" class="form-input" name="temperature" step="0.1" placeholder="98.6"></div>
            <div class="form-group"><label class="form-label">Heart Rate</label><input type="number" class="form-input" name="heart_rate" placeholder="72"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Blood Pressure</label><input type="text" class="form-input" name="bp" placeholder="120/80"></div>
            <div class="form-group"><label class="form-label">SpO2 (%)</label><input type="number" class="form-input" name="spo2" placeholder="98"></div>
          </div>
          <div class="form-group"><label class="form-label">History</label><textarea class="form-textarea" name="history" rows="2" placeholder="Previous conditions..."></textarea></div>
          <button type="button" class="btn btn-primary btn-block" onclick="CareCluster.Diagnosis.analyze()">Run AI Analysis</button>
        </form></div>
      <div class="card" id="diagnosis-result" style="display:flex;align-items:center;justify-content:center;min-height:400px">
        <div class="empty-state"><h3>Awaiting Analysis</h3><p>Fill in details and click Run AI Analysis</p></div></div></div>`;
    }

    function analyze() {
        const fd = new FormData(document.getElementById('diagnosis-form'));
        const data = Object.fromEntries(fd);
        if (!data.patient_id || !data.symptoms) { showToast('Fill required fields', 'warning'); return; }
        const hid = CareCluster.Auth.currentHospitalId();
        const patient = CareCluster.Data.getRecord(hid, 'patients', data.patient_id);
        const symptoms = data.symptoms.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
        let maxScore = 0, severity = 'normal', suggestedDept = 'General Medicine';
        const matched = [];
        symptoms.forEach(sym => { for (const [key, val] of Object.entries(SYMPTOM_DB)) { if (sym.includes(key) || key.includes(sym)) { matched.push({ symptom: key, ...val }); if (val.score > maxScore) { maxScore = val.score; severity = val.severity; suggestedDept = val.dept; } } } });
        const vitalsFlags = [];
        const temp = parseFloat(data.temperature), hr = parseInt(data.heart_rate), spo2 = parseInt(data.spo2);
        if (temp > 103) { vitalsFlags.push('Critical temperature'); severity = 'emergency'; maxScore = Math.max(maxScore, 8); }
        else if (temp > 100.4) { vitalsFlags.push('Elevated temperature'); if (severity === 'normal') severity = 'priority'; }
        if (hr > 120) { vitalsFlags.push('Tachycardia'); severity = 'emergency'; maxScore = Math.max(maxScore, 8); }
        if (spo2 && spo2 < 90) { vitalsFlags.push('Critical SpO2'); severity = 'emergency'; maxScore = Math.max(maxScore, 9); }
        else if (spo2 && spo2 < 95) { vitalsFlags.push('Low SpO2'); if (severity === 'normal') severity = 'priority'; }
        CareCluster.Data.updateRecord(hid, 'patients', data.patient_id, { severity, suggested_department: suggestedDept });
        if (severity === 'emergency') { CareCluster.Data.addNotification(hid, ['doctor', 'nurse', 'admin'], `EMERGENCY: ${patient.name} - ${symptoms.join(', ')}`, 'emergency'); CareCluster.Data.addAuditLog(hid, 'EMERGENCY', `Emergency: ${patient.name}`); }
        const c = { emergency: 'var(--danger)', priority: 'var(--warning)', normal: 'var(--success)' };
        document.getElementById('diagnosis-result').innerHTML = `
      <h4 class="card-title" style="margin-bottom:var(--space-4)">Analysis Result</h4>
      <div style="padding:var(--space-4);border-radius:var(--radius-md);background:${c[severity]}15;border:1px solid ${c[severity]};margin-bottom:var(--space-4)">
        <div style="font-weight:var(--fw-bold);font-size:var(--fs-xl);color:${c[severity]}">${severity.toUpperCase()}</div>
        <div style="font-size:var(--fs-sm);color:var(--text-secondary)">Score: ${maxScore}/10</div></div>
      <div style="margin-bottom:var(--space-4)"><strong>Suggested Department</strong><div style="font-size:var(--fs-lg);color:var(--primary);font-weight:600">${suggestedDept}</div></div>
      <div style="margin-bottom:var(--space-4)"><strong>Matched</strong><div style="display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-2)">${matched.map(m => `<span class="badge" style="background:${c[m.severity]}20;color:${c[m.severity]}">${m.symptom} (${m.score})</span>`).join('')}</div></div>
      ${vitalsFlags.length ? `<div><strong>Vitals Flags</strong><ul style="padding-left:var(--space-5);font-size:var(--fs-sm);color:var(--danger)">${vitalsFlags.map(f => `<li>${f}</li>`).join('')}</ul></div>` : ''}
      ${severity === 'emergency' ? `<button class="btn btn-danger btn-block mt-4" onclick="CareCluster.Diagnosis.emergencyAdmit('${data.patient_id}')">Emergency Admission</button>` : ''}`;
    }

    function emergencyAdmit(pid) {
        const hid = CareCluster.Auth.currentHospitalId();
        CareCluster.Data.updateRecord(hid, 'patients', pid, { status: 'admitted', admitted_date: new Date().toISOString(), severity: 'emergency' });
        CareCluster.Data.addAuditLog(hid, 'EMERGENCY_ADMISSION', `Emergency admission: ${pid}`);
        showToast('Patient admitted as emergency', 'success');
    }
    return { render, analyze, emergencyAdmit };
})();
