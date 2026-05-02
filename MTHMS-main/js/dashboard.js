/* =========================================
   CareCluster — Dashboard
   Role-specific dynamic dashboard
   ========================================= */

CareCluster.Dashboard = (() => {
    const { Icons, statusBadge, formatDate, timeAgo, drawBarChart, drawDonutChart } = CareCluster.Utils;

    function render() {
        const user = CareCluster.Auth.currentUser();
        if (!user) return '';
        const hid = user.hospital_id;
        const role = user.role;

        if (role === 'patient') return renderPatientHome(hid, user);
        if (role === 'super_admin') return renderSuperAdmin(user);
        return renderStaffDashboard(hid, role, user);
    }

    function renderStaffDashboard(hid, role, user) {
        const patients = CareCluster.Data.getStore(hid, 'patients');
        const tokens = CareCluster.Data.getStore(hid, 'tokens');
        const bills = CareCluster.Data.getStore(hid, 'bills');
        const labs = CareCluster.Data.getStore(hid, 'lab_reports');
        const meds = CareCluster.Data.getStore(hid, 'medicines');
        const blood = CareCluster.Data.getStore(hid, 'blood_bank');
        const ambulances = CareCluster.Data.getStore(hid, 'ambulances');
        const equipment = CareCluster.Data.getStore(hid, 'equipment');
        const feedback = CareCluster.Data.getStore(hid, 'feedback');
        const organs = CareCluster.Data.getStore(hid, 'organ_donors');

        const admitted = patients.filter(p => p.status === 'admitted').length;
        const totalPatients = patients.length;
        const pendingTokens = tokens.filter(t => t.status === 'pending').length;
        const pendingDischarge = patients.filter(p => p.discharge_status === 'pending').length;
        const emergencyCases = patients.filter(p => p.severity === 'emergency').length;
        const pendingLabs = labs.filter(l => l.status === 'pending').length;
        const lowStockMeds = meds.filter(m => m.quantity <= 10).length;
        const expiringMeds = meds.filter(m => { const d = CareCluster.Utils.daysUntil(m.expiry_date); return d >= 0 && d <= 30; }).length;
        const totalBloodUnits = blood.reduce((s, b) => s + (b.units || 0), 0);
        const availableAmbulances = ambulances.filter(a => a.status === 'available').length;
        const totalEquipment = equipment.reduce((s, e) => s + (e.quantity || 0), 0);
        const avgRating = feedback.length > 0 ? (feedback.reduce((s, f) => s + (f.overall_rating || 0), 0) / feedback.length).toFixed(1) : '—';

        // Build metric cards based on role
        let metricsHtml = '<div class="grid-4">';

        if (['admin', 'receptionist', 'doctor', 'nurse'].includes(role)) {
            metricsHtml += metricCard('Total Patients', totalPatients, Icons.patients, 'var(--primary)', 'var(--primary-light)');
            metricsHtml += metricCard('Admitted', admitted, Icons.hospital, 'var(--info)', 'var(--info-light)');
        }
        if (['admin', 'receptionist'].includes(role)) {
            metricsHtml += metricCard('Pending Tokens', pendingTokens, Icons.token, 'var(--warning)', 'var(--warning-light)');
        }
        if (['admin', 'doctor'].includes(role)) {
            metricsHtml += metricCard('Emergency Cases', emergencyCases, Icons.alert, 'var(--danger)', 'var(--danger-light)', emergencyCases > 0);
        }
        if (['admin', 'lab_technician'].includes(role)) {
            metricsHtml += metricCard('Pending Lab Tests', pendingLabs, Icons.lab, 'var(--info)', 'var(--info-light)');
        }
        if (['admin', 'pharmacist'].includes(role)) {
            metricsHtml += metricCard('Low Stock Meds', lowStockMeds, Icons.pharmacy, 'var(--warning)', 'var(--warning-light)');
            metricsHtml += metricCard('Expiring Soon', expiringMeds, Icons.alert, 'var(--danger)', 'var(--danger-light)');
        }
        if (['admin', 'lab_technician'].includes(role)) {
            metricsHtml += metricCard('Blood Units', totalBloodUnits, Icons.bloodbank, 'var(--danger)', 'var(--danger-light)');
        }
        if (['admin', 'receptionist'].includes(role)) {
            metricsHtml += metricCard('Ambulances Available', `${availableAmbulances}/${ambulances.length}`, Icons.ambulance, 'var(--success)', 'var(--success-light)');
        }
        if (role === 'admin') {
            metricsHtml += metricCard('Equipment', totalEquipment, Icons.equipment, 'var(--accent-green)', 'var(--accent-green-light)');
            metricsHtml += metricCard('Organ Donors', organs.length, Icons.organ, 'var(--organ-green)', 'var(--organ-green-light)');
            metricsHtml += metricCard('Avg Rating', avgRating, Icons.feedback, 'var(--warning)', 'var(--warning-light)');
            metricsHtml += metricCard('Pending Discharge', pendingDischarge, Icons.discharge, 'var(--info)', 'var(--info-light)');
        }
        if (role === 'nurse') {
            const tasks = CareCluster.Data.getStore(hid, 'nurse_tasks');
            const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
            metricsHtml += metricCard('My Pending Tasks', pendingTasks, Icons.check, 'var(--warning)', 'var(--warning-light)');
        }

        metricsHtml += '</div>';

        // Charts section
        let chartsHtml = '<div class="grid-2" style="margin-top:var(--space-6)">';

        chartsHtml += `
      <div class="card">
        <div class="card-header"><h4 class="card-title">Patient Status</h4></div>
        <div class="chart-container" style="height:220px"><canvas id="chart-patient-status"></canvas></div>
      </div>`;

        if (['admin', 'receptionist'].includes(role)) {
            chartsHtml += `
        <div class="card">
          <div class="card-header"><h4 class="card-title">Token Overview</h4></div>
          <div class="chart-container" style="height:220px"><canvas id="chart-tokens"></canvas></div>
        </div>`;
        }
        if (['admin', 'lab_technician'].includes(role)) {
            chartsHtml += `
        <div class="card">
          <div class="card-header"><h4 class="card-title">Blood Bank Stock</h4></div>
          <div class="chart-container" style="height:220px"><canvas id="chart-blood"></canvas></div>
        </div>`;
        }

        chartsHtml += '</div>';

        // Recent activity
        let recentHtml = `
    <div class="card" style="margin-top:var(--space-6)">
      <div class="card-header"><h4 class="card-title">Recent Activity</h4></div>
      <div class="card-body">`;

        const auditLogs = CareCluster.Data.getStore(hid, 'audit_logs').slice(-10).reverse();
        if (auditLogs.length === 0) {
            recentHtml += '<p style="color:var(--text-muted);font-size:var(--fs-sm)">No recent activity. Start by adding patients and data.</p>';
        } else {
            recentHtml += '<div style="display:flex;flex-direction:column;gap:var(--space-3)">';
            auditLogs.forEach(log => {
                recentHtml += `
        <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) 0;border-bottom:1px solid var(--border-color)">
          <div style="width:8px;height:8px;border-radius:50%;background:var(--primary);flex-shrink:0"></div>
          <div style="flex:1">
            <span style="font-size:var(--fs-sm);color:var(--text-primary)">${log.action}</span>
            <span style="font-size:var(--fs-xs);color:var(--text-muted);margin-left:var(--space-2)">${log.details || ''}</span>
          </div>
          <small style="color:var(--text-muted);white-space:nowrap">${timeAgo(log.timestamp)}</small>
        </div>`;
            });
            recentHtml += '</div>';
        }
        recentHtml += '</div></div>';

        // Emergency alert banner
        let alertHtml = '';
        if (emergencyCases > 0 && ['admin', 'doctor', 'nurse'].includes(role)) {
            alertHtml = `
      <div style="background:var(--danger-light);border:1px solid var(--danger);border-radius:var(--radius-md);padding:var(--space-3) var(--space-5);margin-bottom:var(--space-5);display:flex;align-items:center;gap:var(--space-3)">
        <span style="width:20px;height:20px;display:flex;color:var(--danger);animation:pulse-badge 1.5s infinite">${Icons.alert}</span>
        <span style="font-size:var(--fs-sm);font-weight:var(--fw-semibold);color:var(--danger)">${emergencyCases} Emergency Case${emergencyCases > 1 ? 's' : ''} Requiring Immediate Attention</span>
        <button class="btn btn-danger btn-sm" style="margin-left:auto" onclick="CareCluster.App.navigate('${role === 'doctor' ? 'patients' : 'diagnosis'}')">View Now</button>
      </div>`;
        }

        return alertHtml + metricsHtml + chartsHtml + recentHtml;
    }

    function renderPatientHome(hid, user) {
        const tokens = CareCluster.Data.getStore(hid, 'tokens').filter(t => t.patient_id === user.id);
        const bills = CareCluster.Data.getStore(hid, 'bills').filter(b => b.patient_id === user.id);
        const labs = CareCluster.Data.getStore(hid, 'lab_reports').filter(l => l.patient_id === user.id);

        let html = '<div class="grid-3">';
        html += metricCard('My Appointments', tokens.length, Icons.token, 'var(--primary)', 'var(--primary-light)');
        html += metricCard('Lab Reports', labs.length, Icons.lab, 'var(--info)', 'var(--info-light)');
        html += metricCard('Bills', bills.length, Icons.billing, 'var(--warning)', 'var(--warning-light)');
        html += '</div>';

        // Quick actions for patient
        html += `
    <div class="card" style="margin-top:var(--space-6)">
      <div class="card-header"><h4 class="card-title">Quick Actions</h4></div>
      <div style="display:flex;gap:var(--space-3);flex-wrap:wrap">
        <button class="btn btn-primary" onclick="CareCluster.App.navigate('token_booking')">
          <span style="width:16px;height:16px;display:flex">${Icons.token}</span> Book Token
        </button>
        <button class="btn btn-secondary" onclick="CareCluster.App.navigate('my_appointments')">
          <span style="width:16px;height:16px;display:flex">${Icons.eye}</span> My Appointments
        </button>
        <button class="btn btn-secondary" onclick="CareCluster.App.navigate('organ_donor_register')">
          <span style="width:16px;height:16px;display:flex">${Icons.organ}</span> Organ Donor
        </button>
      </div>
    </div>`;

        return html;
    }

    function renderSuperAdmin(user) {
        const hospitals = CareCluster.Data.HOSPITALS;
        let html = '<div class="grid-3">';

        let totalPatients = 0, totalDonors = 0, totalBlood = 0;
        hospitals.forEach(h => {
            totalPatients += CareCluster.Data.getStore(h.id, 'patients').length;
            totalDonors += CareCluster.Data.getStore(h.id, 'organ_donors').length;
            totalBlood += CareCluster.Data.getStore(h.id, 'blood_bank').reduce((s, b) => s + (b.units || 0), 0);
        });

        html += metricCard('Total Patients (All)', totalPatients, Icons.patients, 'var(--primary)', 'var(--primary-light)');
        html += metricCard('Organ Donors (All)', totalDonors, Icons.organ, 'var(--organ-green)', 'var(--organ-green-light)');
        html += metricCard('Blood Units (All)', totalBlood, Icons.bloodbank, 'var(--danger)', 'var(--danger-light)');
        html += '</div>';

        // Per-hospital overview
        html += '<div class="grid-3" style="margin-top:var(--space-6)">';
        hospitals.forEach(h => {
            const pc = CareCluster.Data.getStore(h.id, 'patients').length;
            const adm = CareCluster.Data.getStore(h.id, 'patients').filter(p => p.status === 'admitted').length;
            const fb = CareCluster.Data.getStore(h.id, 'feedback');
            const avg = fb.length > 0 ? (fb.reduce((s, f) => s + (f.overall_rating || 0), 0) / fb.length).toFixed(1) : '—';

            html += `
      <div class="card">
        <div class="card-header"><h4 class="card-title">${h.name}</h4></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)">
          <div><small style="color:var(--text-muted)">Patients</small><div style="font-size:var(--fs-xl);font-weight:var(--fw-bold)">${pc}</div></div>
          <div><small style="color:var(--text-muted)">Admitted</small><div style="font-size:var(--fs-xl);font-weight:var(--fw-bold)">${adm}</div></div>
          <div><small style="color:var(--text-muted)">Rating</small><div style="font-size:var(--fs-xl);font-weight:var(--fw-bold);color:var(--warning)">${avg}</div></div>
          <div><small style="color:var(--text-muted)">Blood Units</small><div style="font-size:var(--fs-xl);font-weight:var(--fw-bold)">${CareCluster.Data.getStore(h.id, 'blood_bank').reduce((s, b) => s + (b.units || 0), 0)}</div></div>
        </div>
      </div>`;
        });
        html += '</div>';

        // Cross-hospital chart
        html += `
    <div class="card" style="margin-top:var(--space-6)">
      <div class="card-header"><h4 class="card-title">Hospital Comparison</h4></div>
      <div class="chart-container" style="height:220px"><canvas id="chart-hospital-compare"></canvas></div>
    </div>`;

        return html;
    }

    function metricCard(label, value, icon, color, bgColor, pulse = false) {
        return `
    <div class="metric-card">
      <div class="metric-card-icon" style="background:${bgColor}">
        <span style="width:24px;height:24px;display:flex;color:${color}">${icon}</span>
      </div>
      <div class="metric-card-info">
        <div class="metric-card-label">${label}</div>
        <div class="metric-card-value ${pulse ? 'emergency-pulse' : ''}" style="${pulse ? 'color:var(--danger)' : ''}">${value}</div>
      </div>
    </div>`;
    }

    function refreshCharts() {
        const user = CareCluster.Auth.currentUser();
        if (!user) return;
        const hid = user.hospital_id;

        // Patient status donut
        const psCanvas = document.getElementById('chart-patient-status');
        if (psCanvas) {
            const patients = CareCluster.Data.getStore(hid, 'patients');
            const admitted = patients.filter(p => p.status === 'admitted').length;
            const discharged = patients.filter(p => p.status === 'discharged').length;
            const outpatient = patients.filter(p => !p.status || p.status === 'outpatient').length;
            drawDonutChart(psCanvas, ['Admitted', 'Discharged', 'Outpatient'], [admitted, discharged, outpatient], ['#4f8cff', '#22c55e', '#06b6d4']);
        }

        // Token chart
        const tkCanvas = document.getElementById('chart-tokens');
        if (tkCanvas) {
            const tokens = CareCluster.Data.getStore(hid, 'tokens');
            const pending = tokens.filter(t => t.status === 'pending').length;
            const confirmed = tokens.filter(t => t.status === 'confirmed').length;
            const completed = tokens.filter(t => t.status === 'completed').length;
            drawBarChart(tkCanvas, ['Pending', 'Confirmed', 'Completed'], [pending, confirmed, completed], ['#f59e0b', '#4f8cff', '#22c55e']);
        }

        // Blood chart
        const bCanvas = document.getElementById('chart-blood');
        if (bCanvas) {
            const blood = CareCluster.Data.getStore(hid, 'blood_bank');
            const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
            const values = groups.map(g => blood.filter(b => b.blood_group === g).reduce((s, b) => s + (b.units || 0), 0));
            drawBarChart(bCanvas, groups, values, ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#4f8cff', '#8b5cf6', '#ec4899']);
        }

        // Super admin hospital comparison
        const hcCanvas = document.getElementById('chart-hospital-compare');
        if (hcCanvas) {
            const hospitals = CareCluster.Data.HOSPITALS;
            const names = hospitals.map(h => h.code);
            const values = hospitals.map(h => CareCluster.Data.getStore(h.id, 'patients').length);
            drawBarChart(hcCanvas, names, values, ['#4f8cff', '#22c55e', '#f59e0b']);
        }
    }

    return { render, refreshCharts };
})();
