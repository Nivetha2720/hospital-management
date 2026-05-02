/* CareCluster — Feedback System (Live Recalculation) */
CareCluster.Feedback = (() => {
    const { Icons, showToast, showModal, closeModal, esc, formatDate, starRatingHtml } = CareCluster.Utils;
    function render() {
        const user = CareCluster.Auth.currentUser(); const hid = user.hospital_id;
        if (user.role === 'patient') return renderPatientFeedback(hid, user);
        return renderFeedbackList(hid);
    }
    function renderPatientFeedback(hid, user) {
        const patients = CareCluster.Data.getStore(hid, 'patients').filter(p => p.patient_id === user.id || p.email === user.email);
        const discharged = patients.filter(p => p.status === 'discharged' && p.feedback_eligible);
        const existing = CareCluster.Data.getStore(hid, 'feedback').filter(f => f.patient_id === user.id);
        let html = `<div class="page-header"><h2>Feedback</h2></div>`;
        if (existing.length > 0) {
            html += `<div class="card" style="margin-bottom:var(--space-6)"><h4 class="card-title">My Submitted Feedback</h4>`;
            existing.forEach(f => { html += `<div style="padding:var(--space-4);border:1px solid var(--border-color);border-radius:var(--radius-md);margin-top:var(--space-3)"><div style="display:flex;gap:var(--space-6);flex-wrap:wrap;margin-bottom:var(--space-3)"><div><small style="color:var(--text-muted)">Overall</small><div>${starRatingHtml(f.overall_rating)}</div></div><div><small style="color:var(--text-muted)">Doctor</small><div>${starRatingHtml(f.doctor_rating)}</div></div><div><small style="color:var(--text-muted)">Nursing</small><div>${starRatingHtml(f.nursing_rating)}</div></div><div><small style="color:var(--text-muted)">Cleanliness</small><div>${starRatingHtml(f.cleanliness_rating)}</div></div><div><small style="color:var(--text-muted)">Billing</small><div>${starRatingHtml(f.billing_rating)}</div></div></div><p style="font-size:var(--fs-sm)">${esc(f.review || '')}</p><small style="color:var(--text-muted)">Recommend: ${f.recommend ? 'Yes' : 'No'} | ${formatDate(f.created_at)}</small></div>`; });
            html += '</div>';
        }
        if (discharged.length > 0 && existing.length === 0) {
            html += `<div class="card"><h4 class="card-title" style="margin-bottom:var(--space-4)">Submit Feedback</h4>
        <form id="feedback-form">
          <div class="grid-2" style="gap:var(--space-5);margin-bottom:var(--space-4)">
            <div><label class="form-label">Overall Rating *</label>${starRatingHtml(0, 5, true, 'overall_rating')}<input type="hidden" name="overall_rating" value="0"></div>
            <div><label class="form-label">Doctor Service *</label>${starRatingHtml(0, 5, true, 'doctor_rating')}<input type="hidden" name="doctor_rating" value="0"></div>
            <div><label class="form-label">Nursing Care *</label>${starRatingHtml(0, 5, true, 'nursing_rating')}<input type="hidden" name="nursing_rating" value="0"></div>
            <div><label class="form-label">Cleanliness *</label>${starRatingHtml(0, 5, true, 'cleanliness_rating')}<input type="hidden" name="cleanliness_rating" value="0"></div>
            <div><label class="form-label">Billing Experience *</label>${starRatingHtml(0, 5, true, 'billing_rating')}<input type="hidden" name="billing_rating" value="0"></div>
          </div>
          <div class="form-group"><label class="form-label">Written Review</label><textarea class="form-textarea" name="review" rows="3" placeholder="Share your experience..."></textarea></div>
          <div class="form-group"><label class="form-label">Would you recommend this hospital?</label><select class="form-select" name="recommend"><option value="true">Yes</option><option value="false">No</option></select></div>
          <button type="button" class="btn btn-primary btn-block" onclick="CareCluster.Feedback.submit()">Submit Feedback</button></form></div>`;
        } else if (existing.length === 0) {
            html += '<div class="empty-state"><h3>Feedback Not Available</h3><p>Feedback can only be submitted after discharge.</p></div>';
        }
        return html;
    }
    function renderFeedbackList(hid) {
        const feedback = CareCluster.Data.getStore(hid, 'feedback');
        const avgOverall = feedback.length ? ((feedback.reduce((s, f) => s + (f.overall_rating || 0), 0) / feedback.length)).toFixed(1) : '—';
        const avgDoctor = feedback.length ? ((feedback.reduce((s, f) => s + (f.doctor_rating || 0), 0) / feedback.length)).toFixed(1) : '—';
        const avgNursing = feedback.length ? ((feedback.reduce((s, f) => s + (f.nursing_rating || 0), 0) / feedback.length)).toFixed(1) : '—';
        const avgClean = feedback.length ? ((feedback.reduce((s, f) => s + (f.cleanliness_rating || 0), 0) / feedback.length)).toFixed(1) : '—';
        const avgBilling = feedback.length ? ((feedback.reduce((s, f) => s + (f.billing_rating || 0), 0) / feedback.length)).toFixed(1) : '—';
        const hospitalRating = feedback.length ? (((parseFloat(avgOverall) + parseFloat(avgDoctor) + parseFloat(avgNursing) + parseFloat(avgClean) + parseFloat(avgBilling)) / 5)).toFixed(1) : '—';

        let html = `<div class="page-header"><h2>Feedback & Ratings</h2></div>`;
        html += `<div class="grid-3" style="margin-bottom:var(--space-6)">
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--warning-light)"><span style="width:24px;height:24px;display:flex;color:var(--warning)">${Icons.feedback}</span></div><div class="metric-card-info"><div class="metric-card-label">Hospital Rating</div><div class="metric-card-value" style="color:var(--warning)">${hospitalRating} <small style="font-size:var(--fs-sm);font-weight:400">/5</small></div></div></div>
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--primary-light)"><span style="width:24px;height:24px;display:flex;color:var(--primary)">${Icons.patients}</span></div><div class="metric-card-info"><div class="metric-card-label">Total Feedback</div><div class="metric-card-value">${feedback.length}</div></div></div>
      <div class="metric-card"><div class="metric-card-icon" style="background:var(--success-light)"><span style="width:24px;height:24px;display:flex;color:var(--success)">${Icons.check}</span></div><div class="metric-card-info"><div class="metric-card-label">Would Recommend</div><div class="metric-card-value">${feedback.filter(f => f.recommend === 'true' || f.recommend === true).length}/${feedback.length}</div></div></div></div>`;
        // Category averages
        html += `<div class="card" style="margin-bottom:var(--space-6)"><h4 class="card-title" style="margin-bottom:var(--space-4)">Category Averages</h4>
      <div class="grid-2" style="gap:var(--space-4)">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) 0"><span>Overall</span><strong style="color:var(--warning)">${avgOverall}/5</strong></div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) 0"><span>Doctor Service</span><strong style="color:var(--warning)">${avgDoctor}/5</strong></div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) 0"><span>Nursing Care</span><strong style="color:var(--warning)">${avgNursing}/5</strong></div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) 0"><span>Cleanliness</span><strong style="color:var(--warning)">${avgClean}/5</strong></div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) 0"><span>Billing</span><strong style="color:var(--warning)">${avgBilling}/5</strong></div></div></div>`;
        // Feedback list
        html += `<div class="card"><h4 class="card-title" style="margin-bottom:var(--space-4)">All Feedback</h4>`;
        if (feedback.length === 0) html += '<p style="color:var(--text-muted);font-size:var(--fs-sm)">No feedback yet.</p>';
        else feedback.forEach(f => { html += `<div style="padding:var(--space-3);border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:var(--space-3)"><div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2)"><strong style="font-size:var(--fs-sm)">${esc(f.patient_name || 'Patient')}</strong>${starRatingHtml(f.overall_rating)}</div><p style="font-size:var(--fs-sm);color:var(--text-secondary)">${esc(f.review || 'No review')}</p><small style="color:var(--text-muted)">${formatDate(f.created_at)} | Recommend: ${f.recommend === 'true' || f.recommend === true ? 'Yes' : 'No'}</small></div>`; });
        html += '</div>'; return html;
    }
    function submit() {
        const form = document.getElementById('feedback-form'); const fd = new FormData(form); const data = Object.fromEntries(fd);
        data.overall_rating = parseInt(data.overall_rating); data.doctor_rating = parseInt(data.doctor_rating); data.nursing_rating = parseInt(data.nursing_rating); data.cleanliness_rating = parseInt(data.cleanliness_rating); data.billing_rating = parseInt(data.billing_rating);
        if (!data.overall_rating || !data.doctor_rating || !data.nursing_rating || !data.cleanliness_rating || !data.billing_rating) { showToast('Please rate all categories', 'warning'); return; }
        const user = CareCluster.Auth.currentUser(); const hid = user.hospital_id;
        data.patient_id = user.id; data.patient_name = user.name;
        CareCluster.Data.addRecord(hid, 'feedback', data);
        CareCluster.Data.addAuditLog(hid, 'FEEDBACK_SUBMITTED', `Feedback by ${user.name}: Overall ${data.overall_rating}`);
        showToast('Thank you for your feedback!', 'success'); CareCluster.App.navigate('my_feedback');
    }
    return { render, submit };
})();
