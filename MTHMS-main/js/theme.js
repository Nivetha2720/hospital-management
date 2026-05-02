/* =========================================
   CareCluster — Theme Toggle
   ========================================= */

CareCluster.Theme = (() => {
    const THEME_KEY = 'cc_theme';

    function init() {
        const saved = localStorage.getItem(THEME_KEY) || 'dark';
        apply(saved);
    }

    function apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }

    function toggle() {
        const current = localStorage.getItem(THEME_KEY) || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        apply(next);
        // Re-render charts if on dashboard
        if (typeof CareCluster.Dashboard?.refreshCharts === 'function') {
            setTimeout(() => CareCluster.Dashboard.refreshCharts(), 100);
        }
    }

    function current() {
        return localStorage.getItem(THEME_KEY) || 'dark';
    }

    return { init, apply, toggle, current };
})();
