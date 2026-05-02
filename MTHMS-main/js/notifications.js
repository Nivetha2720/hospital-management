/* =========================================
   CareCluster — Notifications Module
   ========================================= */

CareCluster.Notifications = (() => {
    const { Icons, timeAgo } = CareCluster.Utils;
    let isOpen = false;

    function renderBell() {
        const user = CareCluster.Auth.currentUser();
        if (!user) return '';
        const notifs = CareCluster.Data.getNotificationsForRole(user.hospital_id, user.role);
        const unread = notifs.filter(n => !n.read_by.includes(user.id)).length;

        return `
    <div style="position:relative">
      <button class="notification-bell" onclick="CareCluster.Notifications.toggle()">
        ${Icons.notifications}
        ${unread > 0 ? `<span class="notification-count">${unread > 99 ? '99+' : unread}</span>` : ''}
      </button>
      <div class="notification-dropdown ${isOpen ? '' : 'hidden'}" id="notif-dropdown">
        <div style="padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center">
          <strong style="font-size:var(--fs-sm)">Notifications</strong>
          ${unread > 0 ? `<button class="btn btn-ghost btn-sm" onclick="CareCluster.Notifications.markAllRead()">Mark all read</button>` : ''}
        </div>
        ${notifs.length === 0 ? '<div style="padding:var(--space-8);text-align:center;color:var(--text-muted);font-size:var(--fs-sm)">No notifications</div>' :
                notifs.slice(0, 20).map(n => {
                    const read = n.read_by.includes(user.id);
                    const dotColor = n.type === 'emergency' ? 'red' : n.type === 'warning' || n.type === 'expiry' ? 'orange' : n.type === 'low_stock' ? 'yellow' : 'blue';
                    return `
            <div class="notification-item" style="${read ? 'opacity:.6' : ''}" onclick="CareCluster.Notifications.markRead('${n.id}')">
              <div class="notification-dot ${dotColor}"></div>
              <div class="notification-text">
                <p>${n.message}</p>
                <small>${timeAgo(n.timestamp)}</small>
              </div>
            </div>`;
                }).join('')}
      </div>
    </div>`;
    }

    function toggle() {
        isOpen = !isOpen;
        const dd = document.getElementById('notif-dropdown');
        if (dd) dd.classList.toggle('hidden', !isOpen);
    }

    function close() {
        isOpen = false;
        const dd = document.getElementById('notif-dropdown');
        if (dd) dd.classList.add('hidden');
    }

    function markRead(id) {
        const user = CareCluster.Auth.currentUser();
        if (user) CareCluster.Data.markNotificationRead(user.hospital_id, id, user.id);
        refreshBell();
    }

    function markAllRead() {
        const user = CareCluster.Auth.currentUser();
        if (!user) return;
        const notifs = CareCluster.Data.getNotificationsForRole(user.hospital_id, user.role);
        notifs.forEach(n => CareCluster.Data.markNotificationRead(user.hospital_id, n.id, user.id));
        refreshBell();
    }

    function refreshBell() {
        const bellContainer = document.getElementById('notif-bell-container');
        if (bellContainer) bellContainer.innerHTML = renderBell();
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (isOpen && !e.target.closest('.notification-bell') && !e.target.closest('.notification-dropdown')) {
            close();
        }
    });

    return { renderBell, toggle, close, markRead, markAllRead, refreshBell };
})();
