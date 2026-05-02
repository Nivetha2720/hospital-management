/* =========================================
   CareCluster — Utility Functions
   ========================================= */

CareCluster.Utils = (() => {

    /* ── SVG Icons library ── */
    const Icons = {
        hospital: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/></svg>',
        dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>',
        patients: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        doctor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21v-2a4 4 0 0 1 8 0v2"/><circle cx="12" cy="9" r="4"/><path d="M12 5V3"/><path d="M10 5h4"/></svg>',
        token: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/></svg>',
        diagnosis: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/></svg>',
        billing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M12 12a3 3 0 1 0 0-1 3 3 0 0 0 0 1z"/><path d="M2 10h20"/></svg>',
        lab: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 2v6l-4 8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3l-4-8V2"/><path d="M8 2h8"/><path d="M7 16h10"/></svg>',
        pharmacy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v2"/><circle cx="17" cy="17" r="4"/><path d="M17 15v4"/><path d="M15 17h4"/></svg>',
        bloodbank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c4-4 8-7.5 8-12a8 8 0 1 0-16 0c0 4.5 4 8 8 12z"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>',
        ambulance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L17 7h-3v10h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>',
        equipment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
        organ: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19.5 12.572l-7.5 7.428l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572"/></svg>',
        diet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
        feedback: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        discharge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
        settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
        notifications: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
        audit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
        sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
        close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
        back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
        search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
        trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
        alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        vitals: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
        nurse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M20 8v6"/><path d="M17 11h6"/></svg>',
        analytics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        insurance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 9v4"/><path d="M10 11h4"/><path d="M6 16h.01"/><path d="M18 16h.01"/></svg>',
        logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
        user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        starEmpty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    };

    /* ── Toast notifications ── */
    function showToast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const iconMap = { success: Icons.check, error: Icons.close, warning: Icons.alert, info: Icons.notifications };
        toast.innerHTML = `<span style="width:18px;height:18px;display:flex">${iconMap[type] || iconMap.info}</span><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(40px)'; setTimeout(() => toast.remove(), 300); }, 3500);
    }

    /* ── Date formatting ── */
    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function formatTime(dateStr) {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    function daysUntil(dateStr) {
        if (!dateStr) return Infinity;
        return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    }

    function timeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    }

    /* ── Modal helper ── */
    function showModal(title, bodyHtml, footerHtml = '', size = '') {
        closeModal();
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.id = 'active-modal';
        backdrop.innerHTML = `
      <div class="modal ${size}">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" onclick="CareCluster.Utils.closeModal()">${Icons.close}</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>
    `;
        backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
        document.body.appendChild(backdrop);
    }

    function closeModal() {
        const m = document.getElementById('active-modal');
        if (m) m.remove();
    }

    /* ── Confirm dialog ── */
    function confirmAction(message, onConfirm) {
        showModal('Confirm Action', `<p style="color:var(--text-primary)">${message}</p>`,
            `<button class="btn btn-secondary" onclick="CareCluster.Utils.closeModal()">Cancel</button>
       <button class="btn btn-danger" onclick="CareCluster.Utils.closeModal(); (${onConfirm.toString()})()">Confirm</button>`);
    }

    /* ── Canvas Chart: Bar chart ── */
    function drawBarChart(canvas, labels, values, colors, title = '') {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth; const h = canvas.clientHeight;
        canvas.width = w * dpr; canvas.height = h * dpr;
        ctx.scale(dpr, dpr);

        const padding = { top: title ? 35 : 15, right: 15, bottom: 40, left: 45 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;
        const maxVal = Math.max(...values, 1);
        const barW = Math.min(chartW / labels.length * .6, 40);
        const gap = chartW / labels.length;

        // bg
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, w, h);

        // title
        if (title) {
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim();
            ctx.font = `500 12px Inter, sans-serif`;
            ctx.textAlign = 'left';
            ctx.fillText(title, padding.left, 18);
        }

        // grid lines
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border-color').trim() || 'rgba(255,255,255,.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + chartH - (chartH / 4 * i);
            ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(w - padding.right, y); ctx.stroke();
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted').trim();
            ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'right';
            ctx.fillText(Math.round(maxVal / 4 * i), padding.left - 6, y + 3);
        }

        // bars
        values.forEach((v, i) => {
            const barH = (v / maxVal) * chartH;
            const x = padding.left + gap * i + (gap - barW) / 2;
            const y = padding.top + chartH - barH;
            const color = Array.isArray(colors) ? colors[i % colors.length] : colors;

            ctx.fillStyle = color;
            ctx.beginPath();
            const r = 4;
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + barW - r, y);
            ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
            ctx.lineTo(x + barW, padding.top + chartH);
            ctx.lineTo(x, padding.top + chartH);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.fill();

            // label
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted').trim();
            ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(labels[i], x + barW / 2, padding.top + chartH + 16);

            // value on top
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim();
            ctx.font = '600 11px Inter, sans-serif';
            ctx.fillText(v, x + barW / 2, y - 5);
        });
    }

    /* ── Canvas Chart: Donut chart ── */
    function drawDonutChart(canvas, labels, values, colors) {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth; const h = canvas.clientHeight;
        canvas.width = w * dpr; canvas.height = h * dpr;
        ctx.scale(dpr, dpr);

        const cx = w / 2; const cy = h / 2;
        const radius = Math.min(cx, cy) - 10;
        const innerRadius = radius * .6;
        const total = values.reduce((s, v) => s + v, 0) || 1;
        let angle = -Math.PI / 2;

        values.forEach((v, i) => {
            const slice = (v / total) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, angle, angle + slice);
            ctx.arc(cx, cy, innerRadius, angle + slice, angle, true);
            ctx.closePath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            angle += slice;
        });

        // center text
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim();
        ctx.font = `700 ${Math.round(radius * .35)}px Inter, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(total, cx, cy - 6);
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-muted').trim();
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText('Total', cx, cy + 12);
    }

    /* ── Status badge HTML ── */
    function statusBadge(status) {
        const map = {
            pending: 'badge-pending', approved: 'badge-approved', completed: 'badge-completed',
            rejected: 'badge-rejected', emergency: 'badge-emergency', warning: 'badge-warning',
            available: 'badge-available', dispatched: 'badge-dispatched', maintenance: 'badge-maintenance',
            active: 'badge-approved', inactive: 'badge-warning', expired: 'badge-rejected',
            'reached patient': 'badge-dispatched', returning: 'badge-pending',
            admitted: 'badge-dispatched', discharged: 'badge-completed',
            normal: 'badge-approved', priority: 'badge-warning',
            'in progress': 'badge-dispatched', 'out of stock': 'badge-rejected',
            'low stock': 'badge-warning', 'in stock': 'badge-approved'
        };
        const cls = map[(status || '').toLowerCase()] || 'badge-pending';
        return `<span class="badge ${cls}">${status}</span>`;
    }

    /* ── Star rating HTML ── */
    function starRatingHtml(rating, max = 5, interactive = false, inputName = 'rating') {
        let html = '<div class="star-rating">';
        for (let i = 1; i <= max; i++) {
            const filled = i <= rating ? 'filled' : '';
            if (interactive) {
                html += `<span class="star ${filled}" data-rating="${i}" data-name="${inputName}" onclick="CareCluster.Utils._setRating(this)" style="cursor:pointer;width:24px;height:24px;display:inline-flex">${i <= rating ? Icons.star : Icons.starEmpty}</span>`;
            } else {
                html += `<span class="star ${filled}" style="width:18px;height:18px;display:inline-flex;color:${i <= rating ? 'var(--warning)' : 'var(--text-muted)'}">${i <= rating ? Icons.star : Icons.starEmpty}</span>`;
            }
        }
        html += '</div>';
        return html;
    }

    function _setRating(el) {
        const val = parseInt(el.dataset.rating);
        const name = el.dataset.name;
        const container = el.parentElement;
        container.querySelectorAll('.star').forEach((s, i) => {
            s.className = `star ${i < val ? 'filled' : ''}`;
            s.style.color = i < val ? 'var(--warning)' : 'var(--text-muted)';
            s.innerHTML = i < val ? Icons.star : Icons.starEmpty;
        });
        container.dataset.value = val;
        const hiddenInput = document.querySelector(`input[name="${name}"]`);
        if (hiddenInput) hiddenInput.value = val;
    }

    /* ── Simple unique id ── */
    function uid() { return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6); }

    /* ── Escape HTML ── */
    function esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; }

    return {
        Icons, showToast, formatDate, formatDateTime, formatTime, daysUntil, timeAgo,
        showModal, closeModal, confirmAction,
        drawBarChart, drawDonutChart,
        statusBadge, starRatingHtml, _setRating, uid, esc
    };
})();
