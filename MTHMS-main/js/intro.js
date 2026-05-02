/* =========================================
   CareCluster — Intro Slides
   Static full-screen slides after login
   ========================================= */

CareCluster.Intro = (() => {
  const { Icons } = CareCluster.Utils;
  let currentSlide = 0;
  let autoplayTimer = null;

  const SLIDES = [
    { icon: Icons.hospital, title: 'Welcome to CareCluster', desc: 'An enterprise-grade Hospital Management platform built for modern healthcare. Manage patients, staff, and operations with precision and ease.' },
    { icon: Icons.patients, title: 'Complete Patient Lifecycle', desc: 'From registration to discharge — track every patient journey with AI-powered diagnosis, lab reports, billing, and real-time status updates.' },
    { icon: Icons.vitals, title: 'Smart Clinical Intelligence', desc: 'AI-driven triage engine analyzes symptoms and vitals to prioritize emergency cases, suggest departments, and accelerate patient care.' },
    { icon: Icons.bloodbank, title: 'Resource Management', desc: 'Blood bank tracking, ambulance dispatch, equipment maintenance, and pharmacy inventory — all managed dynamically with real-time alerts.' },
    { icon: Icons.audit, title: 'Security & Compliance', desc: 'Role-based access control, multi-tenant isolation, complete audit logging, and encrypted organ donation consent — enterprise security built-in.' }
  ];

  function render() {
    return `
    <div class="intro-screen" id="intro-screen">
      ${SLIDES.map((s, i) => `
        <div class="intro-slide ${i === 0 ? 'active' : ''}" data-slide="${i}">
          <div class="intro-slide-bg"></div>
          <div class="intro-content">
            <div class="intro-icon">${s.icon}</div>
            <h2>${s.title}</h2>
            <p>${s.desc}</p>
            <div class="intro-dots">
              ${SLIDES.map((_, j) => `<div class="intro-dot ${j === i ? 'active' : ''}" onclick="CareCluster.Intro.goTo(${j})"></div>`).join('')}
            </div>
          </div>
        </div>
      `).join('')}
      <button class="intro-enter-btn" onclick="CareCluster.Intro.enterDashboard()">
        Enter Dashboard
      </button>
    </div>`;
  }

  function startAutoplay() {
    currentSlide = 0;
    autoplayTimer = setInterval(() => {
      currentSlide = (currentSlide + 1) % SLIDES.length;
      updateSlide();
    }, 4000);
  }

  function stopAutoplay() {
    if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
  }

  function goTo(idx) {
    stopAutoplay();
    currentSlide = idx;
    updateSlide();
    startAutoplay();
  }

  function updateSlide() {
    const slides = document.querySelectorAll('.intro-slide');
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === currentSlide);
      const dots = s.querySelectorAll('.intro-dot');
      dots.forEach((d, j) => d.classList.toggle('active', j === currentSlide));
    });
  }

  function enterDashboard() {
    stopAutoplay();
    CareCluster.App.enterDashboard();
  }

  return { render, startAutoplay, stopAutoplay, goTo, enterDashboard };
})();
