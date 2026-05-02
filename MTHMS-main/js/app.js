/* =========================================
   CareCluster — Main Application Orchestrator
   SPA Router, View Rendering, App Shell
   ========================================= */

CareCluster.App = (() => {
  const { Icons } = CareCluster.Utils;
  let currentView = 'landing';

  /* ── View router mapping ── */
  const VIEWS = {
    dashboard: () => CareCluster.Dashboard.render(),
    patients: () => CareCluster.Patients.render(),
    patients_view: () => CareCluster.Nurse.renderPatientsView(),
    tokens: () => CareCluster.Tokens.render(),
    token_booking: () => CareCluster.Tokens.render(),
    my_appointments: () => CareCluster.Tokens.renderMyAppointments(),
    diagnosis: () => CareCluster.Diagnosis.render(),
    billing: () => CareCluster.Billing.render(),
    insurance: () => CareCluster.Billing.renderInsurance(),
    my_billing: () => CareCluster.Billing.render(),
    my_insurance: () => CareCluster.Billing.renderMyInsurance(),
    lab_reports: () => CareCluster.Lab.render(),
    lab_reports_view: () => CareCluster.Lab.render(),
    my_lab_reports: () => CareCluster.Lab.render(),
    pharmacy: () => CareCluster.Pharmacy.render(),
    discharge: () => CareCluster.Discharge.render(),
    discharge_view: () => CareCluster.Discharge.render(),
    blood_bank: () => CareCluster.BloodBank.render(),
    blood_view: () => CareCluster.BloodBank.render(),
    blood_request: () => CareCluster.BloodBank.render(),
    ambulance: () => CareCluster.Ambulance.render(),
    ambulance_view: () => CareCluster.Ambulance.renderPatientView(),
    ambulance_status: () => CareCluster.Ambulance.renderPatientView(),
    my_ambulance: () => CareCluster.Ambulance.renderPatientView(),
    equipment: () => CareCluster.Equipment.render(),
    organ_donation: () => CareCluster.Organ.render(),
    organ_donor_register: () => CareCluster.Organ.renderPatientRegister(),
    diet: () => CareCluster.Diet.render(),
    my_diet: () => CareCluster.Diet.render(),
    feedback: () => CareCluster.Feedback.render(),
    feedback_view: () => CareCluster.Feedback.render(),
    my_feedback: () => CareCluster.Feedback.render(),
    nurse_tasks: () => CareCluster.Nurse.renderTasks(),
    vitals: () => CareCluster.Nurse.renderVitals(),
    nurse_patients: () => CareCluster.Nurse.renderPatientsView(),
    settings: () => CareCluster.Admin.renderSettings(),
    audit_logs: () => CareCluster.Admin.renderAuditLogs(),
    analytics: () => CareCluster.SuperAdmin.renderAnalytics(),
    organ_analytics: () => CareCluster.SuperAdmin.renderOrganAnalytics(),
    blood_analytics: () => CareCluster.SuperAdmin.renderBloodAnalytics(),
    compliance: () => CareCluster.SuperAdmin.renderCompliance(),
  };

  /* ── App initialization ── */
  function init() {
    CareCluster.Data.seedIfEmpty();
    CareCluster.Theme.init();

    const session = CareCluster.Auth.currentUser();
    if (session) {
      showAppShell();
    } else {
      showLanding();
    }
  }

  /* ── Landing → Auth → Intro → Dashboard flow ── */
  function showLanding() {
    document.getElementById('app-root').innerHTML = CareCluster.Landing.render();
    currentView = 'landing';
  }

  function showAuth(hospitalId, role) {
    CareCluster.AuthUI.selectedHospitalId = hospitalId;
    CareCluster.AuthUI.selectedRole = role;
    document.getElementById('app-root').innerHTML = CareCluster.AuthUI.render();
    currentView = 'auth';
  }

  function showIntro() {
    document.getElementById('app-root').innerHTML = CareCluster.Intro.render();
    CareCluster.Intro.startAutoplay();
    currentView = 'intro';
  }

  function showAppShell() {
    const user = CareCluster.Auth.currentUser();
    if (!user) { showLanding(); return; }

    document.getElementById('app-root').innerHTML = `
      <div id="app-container">
        ${CareCluster.Sidebar.render()}
        <div class="main-wrapper">
          <header class="header">
            <div class="header-left">
              <button class="header-toggle" onclick="CareCluster.Sidebar.toggleCollapse()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              </button>
              <div>
                <h3 class="header-title" id="page-title">Dashboard</h3>
                <small style="color:var(--text-muted);font-size:var(--fs-xs)" id="page-subtitle">${user.name} — ${CareCluster.RBAC.getRoleLabel(user.role)}</small>
              </div>
            </div>
            <div class="header-right">
              <div id="notif-bell-container">${CareCluster.Notifications.renderBell()}</div>
              <div class="theme-toggle" onclick="CareCluster.Theme.toggle()">
                <div class="theme-toggle-track">
                  <div class="theme-toggle-thumb">${CareCluster.Theme.current() === 'dark' ? Icons.moon : Icons.sun}</div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:var(--space-2)">
                <div style="width:32px;height:32px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:white;font-weight:600;font-size:var(--fs-sm)">${(user.name || 'U').charAt(0).toUpperCase()}</div>
                <div style="display:flex;flex-direction:column">
                  <span style="font-size:var(--fs-sm);font-weight:var(--fw-semibold)">${user.name}</span>
                  <span style="font-size:var(--fs-xs);color:var(--text-muted)">${CareCluster.RBAC.getRoleLabel(user.role)}</span>
                </div>
              </div>
            </div>
          </header>
          <main class="main-content" id="main-content">
            <!-- Dynamic content -->
          </main>
        </div>
      </div>`;

    navigate('dashboard');
  }

  /* ── SPA Navigation ── */
  function navigate(viewId) {
    const user = CareCluster.Auth.currentUser();
    if (!user) { showLanding(); return; }

    currentView = viewId;
    const mainContent = document.getElementById('main-content');
    if (!mainContent) { showAppShell(); return; }

    const renderFn = VIEWS[viewId];
    if (renderFn) {
      mainContent.innerHTML = renderFn();
    } else {
      mainContent.innerHTML = `<div class="empty-state"><h3>View Not Found</h3><p>The requested view "${viewId}" doesn't exist.</p></div>`;
    }

    // Update page title
    const titleMap = {
      dashboard: 'Dashboard', patients: 'Patients', tokens: 'Token Management',
      token_booking: 'Book Token', my_appointments: 'My Appointments',
      diagnosis: 'AI Diagnosis', billing: 'Billing & Insurance',
      insurance: 'Insurance', my_billing: 'My Bills', my_insurance: 'My Insurance',
      lab_reports: 'Lab Reports', my_lab_reports: 'My Lab Reports',
      pharmacy: 'Pharmacy', discharge: 'Discharge', blood_bank: 'Blood Bank',
      ambulance: 'Ambulance', ambulance_status: 'Ambulance Status',
      equipment: 'Equipment', organ_donation: 'Organ Donation',
      organ_donor_register: 'Organ Donor Registration',
      diet: 'Diet Prescriptions', my_diet: 'My Diet',
      feedback: 'Feedback', my_feedback: 'Submit Feedback',
      nurse_tasks: 'Nurse Tasks', vitals: 'Update Vitals',
      nurse_patients: 'Patients', settings: 'Settings',
      audit_logs: 'Audit Logs', analytics: 'Hospital Analytics',
      organ_analytics: 'Organ Analytics', blood_analytics: 'Blood Analytics',
      compliance: 'Compliance'
    };
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = titleMap[viewId] || viewId;

    // Highlight sidebar
    CareCluster.Sidebar.setActive(viewId);

    // Refresh charts after render
    requestAnimationFrame(() => {
      if (viewId === 'dashboard') CareCluster.Dashboard.refreshCharts();
      if (viewId === 'blood_bank') CareCluster.BloodBank.refreshChart();
      if (['analytics', 'organ_analytics', 'blood_analytics'].includes(viewId)) CareCluster.SuperAdmin.refreshCharts();
    });

    // Scroll to top
    mainContent.scrollTo(0, 0);
  }

  /* ── Auth callback: called after successful login ── */
  function onLoginSuccess() {
    showIntro();
  }

  function enterDashboard() {
    showAppShell();
  }

  return { init, showLanding, showAuth, showIntro, showAppShell, navigate, onLoginSuccess, enterDashboard };
})();

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => CareCluster.App.init());
