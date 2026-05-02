/* =========================================
   CareCluster — Authentication Module
   Sign In, Sign Up, Forgot Password, Session
   ========================================= */

CareCluster.Auth = (() => {

    const SESSION_KEY = 'cc_session';

    function currentUser() {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }

    function currentHospitalId() {
        return currentUser()?.hospital_id || null;
    }

    function currentRole() {
        return currentUser()?.role || null;
    }

    function setSession(user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }

    function clearSession() {
        sessionStorage.removeItem(SESSION_KEY);
    }

    function signIn(hospitalId, email, password) {
        const users = CareCluster.Data.getStore(hospitalId, 'users');
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (!user) return { success: false, error: 'Invalid email or password' };
        setSession({ ...user, hospital_id: hospitalId });
        CareCluster.Data.addAuditLog(hospitalId, 'SIGN_IN', `${user.name} (${user.role}) signed in`, user.id);
        return { success: true, user };
    }

    function signUp(hospitalId, data) {
        const users = CareCluster.Data.getStore(hospitalId, 'users');
        if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
            return { success: false, error: 'Email already registered' };
        }
        const newUser = {
            id: CareCluster.Data.generateId(),
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role || 'patient',
            department: data.department || '',
            phone: data.phone || '',
            hospital_id: hospitalId
        };
        CareCluster.Data.addRecord(hospitalId, 'users', newUser);
        setSession({ ...newUser, hospital_id: hospitalId });
        CareCluster.Data.addAuditLog(hospitalId, 'SIGN_UP', `New user registered: ${newUser.name} (${newUser.role})`, newUser.id);
        return { success: true, user: newUser };
    }

    function forgotPassword(hospitalId, email) {
        const users = CareCluster.Data.getStore(hospitalId, 'users');
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return { success: false, error: 'Email not found' };
        // Generate OTP (simulated)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        sessionStorage.setItem('cc_reset_otp', otp);
        sessionStorage.setItem('cc_reset_email', email);
        sessionStorage.setItem('cc_reset_hospital', hospitalId);
        return { success: true, otp, message: `OTP sent to ${email}` };
    }

    function verifyOtp(otp) {
        return otp === sessionStorage.getItem('cc_reset_otp');
    }

    function resetPassword(newPassword) {
        const email = sessionStorage.getItem('cc_reset_email');
        const hospitalId = sessionStorage.getItem('cc_reset_hospital');
        if (!email || !hospitalId) return { success: false, error: 'Session expired' };

        const users = CareCluster.Data.getStore(hospitalId, 'users');
        const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (idx === -1) return { success: false, error: 'User not found' };

        users[idx].password = newPassword;
        CareCluster.Data.setStore(hospitalId, 'users', users);
        sessionStorage.removeItem('cc_reset_otp');
        sessionStorage.removeItem('cc_reset_email');
        sessionStorage.removeItem('cc_reset_hospital');
        CareCluster.Data.addAuditLog(hospitalId, 'PASSWORD_RESET', `Password reset for ${email}`, users[idx].id);
        return { success: true };
    }

    function logout() {
        const user = currentUser();
        if (user) {
            CareCluster.Data.addAuditLog(user.hospital_id, 'SIGN_OUT', `${user.name} signed out`, user.id);
        }
        clearSession();
        CareCluster.App.showLanding();
    }

    function isAuthenticated() {
        return !!currentUser();
    }

    function requireAuth() {
        if (!isAuthenticated()) {
            CareCluster.App.showLanding();
            return false;
        }
        return true;
    }

    return {
        currentUser, currentHospitalId, currentRole,
        signIn, signUp, forgotPassword, verifyOtp, resetPassword,
        logout, isAuthenticated, requireAuth, setSession, clearSession
    };
})();
