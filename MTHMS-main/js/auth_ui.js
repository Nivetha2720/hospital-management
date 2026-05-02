/* =========================================
   CareCluster — Auth UI
   Sign In, Sign Up, Forgot Password screens
   ========================================= */

CareCluster.AuthUI = (() => {
    const { Icons, showToast, esc } = CareCluster.Utils;

    let currentTab = 'signin';
    let forgotStep = 0; // 0=email, 1=otp, 2=new password

    function render() {
        const hospitalId = sessionStorage.getItem('cc_selected_hospital');
        const role = sessionStorage.getItem('cc_selected_role');
        const hospital = CareCluster.Data.HOSPITALS.find(h => h.id === hospitalId);
        const roleLabel = CareCluster.RBAC.getRoleLabel(role);

        return `
    <div class="auth-screen" id="auth-screen">
      <div class="auth-card">
        <div class="auth-hospital-badge">
          <span style="width:14px;height:14px;display:flex">${Icons.hospital}</span>
          ${esc(hospital?.name || 'Hospital')} &mdash; ${esc(roleLabel)}
        </div>

        <div id="auth-content">${renderSignIn()}</div>
      </div>
    </div>`;
    }

    function renderSignIn() {
        return `
      <div class="auth-tabs">
        <button class="auth-tab ${currentTab === 'signin' ? 'active' : ''}" onclick="CareCluster.AuthUI.switchTab('signin')">Sign In</button>
        <button class="auth-tab ${currentTab === 'signup' ? 'active' : ''}" onclick="CareCluster.AuthUI.switchTab('signup')">Sign Up</button>
      </div>
      <form class="auth-form" onsubmit="CareCluster.AuthUI.handleSignIn(event)">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-input" id="auth-email" placeholder="Enter your email" required>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-input" id="auth-password" placeholder="Enter your password" required>
        </div>
        <button type="button" class="auth-forgot" onclick="CareCluster.AuthUI.showForgotPassword()">Forgot Password?</button>
        <button type="submit" class="auth-submit">Sign In</button>
        <p class="auth-info">Demo: Use role emails like admin@[hospital].care with password admin123</p>
      </form>`;
    }

    function renderSignUp() {
        return `
      <div class="auth-tabs">
        <button class="auth-tab ${currentTab === 'signin' ? 'active' : ''}" onclick="CareCluster.AuthUI.switchTab('signin')">Sign In</button>
        <button class="auth-tab ${currentTab === 'signup' ? 'active' : ''}" onclick="CareCluster.AuthUI.switchTab('signup')">Sign Up</button>
      </div>
      <form class="auth-form" onsubmit="CareCluster.AuthUI.handleSignUp(event)">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-input" id="auth-name" placeholder="Enter your full name" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-input" id="auth-email" placeholder="Enter your email" required>
        </div>
        <div class="form-group">
          <label class="form-label">Phone Number</label>
          <input type="tel" class="form-input" id="auth-phone" placeholder="+1-555-0000">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" class="form-input" id="auth-password" placeholder="Min 6 characters" required minlength="6" oninput="CareCluster.AuthUI.checkPasswordStrength(this.value)">
          <div class="password-strength" id="pw-strength"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input type="password" class="form-input" id="auth-password-confirm" placeholder="Re-enter password" required>
        </div>
        <button type="submit" class="auth-submit">Create Account</button>
      </form>`;
    }

    function renderForgotPassword() {
        if (forgotStep === 0) {
            return `
        <button class="auth-back" onclick="CareCluster.AuthUI.switchTab('signin')">
          ${Icons.back} <span>Back to Sign In</span>
        </button>
        <h3 style="margin-bottom:var(--space-2)">Forgot Password</h3>
        <p style="font-size:var(--fs-sm);margin-bottom:var(--space-5)">Enter your registered email to receive a reset OTP.</p>
        <form class="auth-form" onsubmit="CareCluster.AuthUI.handleForgotEmail(event)">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-input" id="auth-reset-email" placeholder="Enter your email" required>
          </div>
          <button type="submit" class="auth-submit">Send OTP</button>
        </form>`;
        }
        if (forgotStep === 1) {
            return `
        <button class="auth-back" onclick="CareCluster.AuthUI.forgotStep = 0; CareCluster.AuthUI.showForgotPassword()">
          ${Icons.back} <span>Back</span>
        </button>
        <h3 style="margin-bottom:var(--space-2)">Enter OTP</h3>
        <p style="font-size:var(--fs-sm);margin-bottom:var(--space-5)">Check the toast notification for your OTP code.</p>
        <form class="auth-form" onsubmit="CareCluster.AuthUI.handleOtpVerify(event)">
          <div class="otp-inputs" id="otp-inputs">
            <input type="text" class="otp-input" maxlength="1" data-idx="0" oninput="CareCluster.AuthUI.otpNext(this,1)" autofocus>
            <input type="text" class="otp-input" maxlength="1" data-idx="1" oninput="CareCluster.AuthUI.otpNext(this,2)">
            <input type="text" class="otp-input" maxlength="1" data-idx="2" oninput="CareCluster.AuthUI.otpNext(this,3)">
            <input type="text" class="otp-input" maxlength="1" data-idx="3" oninput="CareCluster.AuthUI.otpNext(this,4)">
            <input type="text" class="otp-input" maxlength="1" data-idx="4" oninput="CareCluster.AuthUI.otpNext(this,5)">
            <input type="text" class="otp-input" maxlength="1" data-idx="5">
          </div>
          <button type="submit" class="auth-submit">Verify OTP</button>
        </form>`;
        }
        if (forgotStep === 2) {
            return `
        <h3 style="margin-bottom:var(--space-2)">Set New Password</h3>
        <p style="font-size:var(--fs-sm);margin-bottom:var(--space-5)">Enter your new password below.</p>
        <form class="auth-form" onsubmit="CareCluster.AuthUI.handleResetPassword(event)">
          <div class="form-group">
            <label class="form-label">New Password</label>
            <input type="password" class="form-input" id="auth-new-password" placeholder="Min 6 characters" required minlength="6">
          </div>
          <div class="form-group">
            <label class="form-label">Confirm New Password</label>
            <input type="password" class="form-input" id="auth-new-password-confirm" placeholder="Re-enter password" required>
          </div>
          <button type="submit" class="auth-submit">Reset Password</button>
        </form>`;
        }
    }

    function switchTab(tab) {
        currentTab = tab;
        forgotStep = 0;
        const content = document.getElementById('auth-content');
        if (tab === 'signin') content.innerHTML = renderSignIn();
        else if (tab === 'signup') content.innerHTML = renderSignUp();
    }

    function showForgotPassword() {
        const content = document.getElementById('auth-content');
        content.innerHTML = renderForgotPassword();
    }

    function handleSignIn(e) {
        e.preventDefault();
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const hospitalId = sessionStorage.getItem('cc_selected_hospital');
        const selectedRole = sessionStorage.getItem('cc_selected_role');

        const result = CareCluster.Auth.signIn(hospitalId, email, password);
        if (!result.success) {
            showToast(result.error, 'error');
            return;
        }
        // Enforce role match
        if (result.user.role !== selectedRole) {
            CareCluster.Auth.clearSession();
            showToast(`This account is registered as "${CareCluster.RBAC.getRoleLabel(result.user.role)}", not "${CareCluster.RBAC.getRoleLabel(selectedRole)}"`, 'error');
            return;
        }
        showToast(`Welcome back, ${result.user.name}!`, 'success');
        CareCluster.App.showIntro();
    }

    function handleSignUp(e) {
        e.preventDefault();
        const name = document.getElementById('auth-name').value.trim();
        const email = document.getElementById('auth-email').value.trim();
        const phone = document.getElementById('auth-phone')?.value.trim() || '';
        const password = document.getElementById('auth-password').value;
        const confirm = document.getElementById('auth-password-confirm').value;
        const hospitalId = sessionStorage.getItem('cc_selected_hospital');
        const role = sessionStorage.getItem('cc_selected_role');

        if (password !== confirm) { showToast('Passwords do not match', 'error'); return; }
        if (password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }

        const result = CareCluster.Auth.signUp(hospitalId, { name, email, phone, password, role });
        if (!result.success) { showToast(result.error, 'error'); return; }

        showToast(`Account created! Welcome, ${name}!`, 'success');
        CareCluster.App.showIntro();
    }

    function handleForgotEmail(e) {
        e.preventDefault();
        const email = document.getElementById('auth-reset-email').value.trim();
        const hospitalId = sessionStorage.getItem('cc_selected_hospital');

        const result = CareCluster.Auth.forgotPassword(hospitalId, email);
        if (!result.success) { showToast(result.error, 'error'); return; }

        showToast(`OTP: ${result.otp} (Check this notification!)`, 'info');
        forgotStep = 1;
        showForgotPassword();
    }

    function handleOtpVerify(e) {
        e.preventDefault();
        const inputs = document.querySelectorAll('#otp-inputs .otp-input');
        const otp = Array.from(inputs).map(i => i.value).join('');

        if (otp.length !== 6) { showToast('Please enter the complete 6-digit OTP', 'warning'); return; }
        if (!CareCluster.Auth.verifyOtp(otp)) { showToast('Invalid OTP. Please try again.', 'error'); return; }

        showToast('OTP verified!', 'success');
        forgotStep = 2;
        showForgotPassword();
    }

    function handleResetPassword(e) {
        e.preventDefault();
        const pw = document.getElementById('auth-new-password').value;
        const confirm = document.getElementById('auth-new-password-confirm').value;
        if (pw !== confirm) { showToast('Passwords do not match', 'error'); return; }
        if (pw.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }

        const result = CareCluster.Auth.resetPassword(pw);
        if (!result.success) { showToast(result.error, 'error'); return; }

        showToast('Password reset successful! Please sign in.', 'success');
        forgotStep = 0;
        currentTab = 'signin';
        const content = document.getElementById('auth-content');
        content.innerHTML = renderSignIn();
    }

    function otpNext(el, nextIdx) {
        if (el.value.length === 1 && nextIdx < 6) {
            const next = document.querySelector(`.otp-input[data-idx="${nextIdx}"]`);
            if (next) next.focus();
        }
    }

    function checkPasswordStrength(pw) {
        const el = document.getElementById('pw-strength');
        if (!el) return;
        let score = 0;
        if (pw.length >= 6) score++;
        if (pw.length >= 10) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
        const colors = ['var(--danger)', 'var(--warning)', '#eab308', 'var(--success)', 'var(--accent-green)'];
        const pct = Math.min(score, 5) * 20;
        el.innerHTML = `
      <div class="password-strength-bar"><div class="password-strength-fill" style="width:${pct}%;background:${colors[score - 1] || colors[0]}"></div></div>
      <span class="password-strength-text" style="color:${colors[score - 1] || colors[0]}">${labels[score - 1] || 'Too Short'}</span>`;
    }

    return {
        render, switchTab, showForgotPassword,
        handleSignIn, handleSignUp, handleForgotEmail,
        handleOtpVerify, handleResetPassword,
        otpNext, checkPasswordStrength,
        forgotStep
    };
})();
