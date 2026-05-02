/* =========================================
   CareCluster — Landing Page
   Hospital & Role selection
   ========================================= */

CareCluster.Landing = (() => {
    const { Icons } = CareCluster.Utils;

    function render() {
        const hospitals = CareCluster.Data.HOSPITALS;
        const roles = CareCluster.RBAC.getAllRoles();

        return `
    <div class="landing-screen" id="landing-screen">
      <div class="landing-orb landing-orb-1"></div>
      <div class="landing-orb landing-orb-2"></div>
      <div class="landing-orb landing-orb-3"></div>
      <div class="landing-card">
        <div class="landing-logo">
          <div class="landing-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/>
              <path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/>
            </svg>
          </div>
          <div class="landing-logo-text">
            <h1>CareCluster</h1>
            <p>Hospital Management</p>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Select Hospital</label>
          <select class="form-select" id="landing-hospital">
            <option value="">Choose a hospital...</option>
            ${hospitals.map(h => `<option value="${h.id}">${h.name}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Select Role</label>
          <select class="form-select" id="landing-role">
            <option value="">Choose your role...</option>
            ${roles.map(r => `<option value="${r.id}">${r.label}</option>`).join('')}
          </select>
        </div>

        <div class="landing-divider"></div>

        <button class="landing-btn" id="landing-enter" onclick="CareCluster.Landing.onEnter()">
          Enter System
        </button>

        <div class="landing-footer">
          <p>Enterprise Hospital Management SaaS Platform</p>
          <p style="margin-top:4px;opacity:.6">v1.0.0 &bull; Secure &bull; Multi-Tenant</p>
        </div>
      </div>
    </div>`;
    }

    function onEnter() {
        const hospital = document.getElementById('landing-hospital').value;
        const role = document.getElementById('landing-role').value;
        if (!hospital) { CareCluster.Utils.showToast('Please select a hospital', 'warning'); return; }
        if (!role) { CareCluster.Utils.showToast('Please select a role', 'warning'); return; }
        // Store selection temporarily
        sessionStorage.setItem('cc_selected_hospital', hospital);
        sessionStorage.setItem('cc_selected_role', role);
        CareCluster.App.showAuth();
    }

    return { render, onEnter };
})();
