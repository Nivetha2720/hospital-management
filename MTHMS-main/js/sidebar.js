/* =========================================
   CareCluster — Sidebar Navigation
   ========================================= */

CareCluster.Sidebar = (() => {
    const { Icons } = CareCluster.Utils;
    let collapsed = false;

    function render() {
        const user = CareCluster.Auth.currentUser();
        if (!user) return '';
        const items = CareCluster.RBAC.getMenuItems(user.role);
        const hospital = CareCluster.Data.HOSPITALS.find(h => h.id === user.hospital_id);

        let html = `
    <aside class="sidebar ${collapsed ? 'collapsed' : ''}" id="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>
        </div>
        <span class="sidebar-brand-text">CareCluster</span>
      </div>
      <nav class="sidebar-nav">`;

        items.forEach(item => {
            if (item.section) {
                html += `<div class="sidebar-section-label">${item.section}</div>`;
            } else {
                const icon = Icons[item.icon] || Icons.dashboard;
                html += `<a class="sidebar-link" data-view="${item.id}" onclick="CareCluster.App.navigate('${item.id}')">
          <span style="width:18px;height:18px;display:flex;flex-shrink:0">${icon}</span>
          <span>${item.label}</span>
        </a>`;
            }
        });

        html += `
      </nav>
      <div style="padding:var(--space-3) var(--space-2);border-top:1px solid var(--border-color)">
        <a class="sidebar-link" onclick="CareCluster.Auth.logout()" style="color:var(--danger)">
          <span style="width:18px;height:18px;display:flex;flex-shrink:0">${Icons.logout}</span>
          <span>Sign Out</span>
        </a>
      </div>
    </aside>`;
        return html;
    }

    function toggleCollapse() {
        collapsed = !collapsed;
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle('collapsed', collapsed);
        const wrapper = document.querySelector('.main-wrapper');
        if (wrapper) wrapper.style.marginLeft = collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)';
    }

    function setActive(viewId) {
        document.querySelectorAll('.sidebar-link').forEach(el => {
            el.classList.toggle('active', el.dataset.view === viewId);
        });
    }

    return { render, toggleCollapse, setActive };
})();
