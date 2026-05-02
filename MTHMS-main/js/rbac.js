/* =========================================
   CareCluster — RBAC Engine
   Role-Based Access Control
   ========================================= */

CareCluster.RBAC = (() => {

    const ROLES = {
        patient: { label: 'Patient', level: 1 },
        doctor: { label: 'Doctor', level: 3 },
        nurse: { label: 'Nurse', level: 2 },
        lab_technician: { label: 'Lab Technician', level: 2 },
        pharmacist: { label: 'Pharmacist', level: 2 },
        receptionist: { label: 'Receptionist', level: 2 },
        admin: { label: 'Admin', level: 4 },
        super_admin: { label: 'Super Admin', level: 5 }
    };

    // Which views each role can access
    const PERMISSIONS = {
        patient: ['my_appointments', 'my_lab_reports', 'my_billing', 'my_insurance', 'my_diet', 'my_ambulance', 'organ_donor_register', 'my_feedback', 'token_booking'],
        doctor: ['dashboard', 'patients', 'diagnosis', 'discharge', 'diet', 'lab_reports_view', 'blood_request', 'ambulance_view', 'feedback_view'],
        nurse: ['dashboard', 'patients_view', 'vitals', 'nurse_tasks'],
        lab_technician: ['dashboard', 'lab_reports', 'blood_bank'],
        pharmacist: ['dashboard', 'pharmacy'],
        receptionist: ['dashboard', 'patients', 'tokens', 'billing', 'insurance', 'ambulance', 'blood_view', 'discharge_view'],
        admin: ['dashboard', 'patients', 'tokens', 'diagnosis', 'billing', 'insurance', 'lab_reports', 'pharmacy', 'blood_bank', 'ambulance', 'equipment', 'organ_donation', 'diet', 'discharge', 'feedback', 'settings', 'audit_logs', 'nurse_tasks'],
        super_admin: ['dashboard', 'analytics', 'organ_analytics', 'blood_analytics', 'compliance', 'settings']
    };

    // Sidebar menu items per role
    const MENU_ITEMS = {
        patient: [
            { id: 'token_booking', label: 'Book Token', icon: 'token' },
            { id: 'my_appointments', label: 'My Appointments', icon: 'token' },
            { id: 'my_lab_reports', label: 'My Lab Reports', icon: 'lab' },
            { id: 'my_billing', label: 'My Billing', icon: 'billing' },
            { id: 'my_insurance', label: 'My Insurance', icon: 'insurance' },
            { id: 'my_diet', label: 'Diet Prescription', icon: 'diet' },
            { id: 'my_ambulance', label: 'Ambulance Status', icon: 'ambulance' },
            { id: 'organ_donor_register', label: 'Organ Donor', icon: 'organ' },
            { id: 'my_feedback', label: 'Feedback', icon: 'feedback' }
        ],
        doctor: [
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { section: 'Clinical' },
            { id: 'patients', label: 'My Patients', icon: 'patients' },
            { id: 'diagnosis', label: 'AI Diagnosis', icon: 'diagnosis' },
            { id: 'discharge', label: 'Discharge', icon: 'discharge' },
            { id: 'diet', label: 'Diet Prescription', icon: 'diet' },
            { section: 'Resources' },
            { id: 'lab_reports_view', label: 'Lab Reports', icon: 'lab' },
            { id: 'blood_request', label: 'Blood Request', icon: 'bloodbank' },
            { id: 'ambulance_view', label: 'Ambulance', icon: 'ambulance' },
            { id: 'feedback_view', label: 'Feedback', icon: 'feedback' }
        ],
        nurse: [
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { id: 'patients_view', label: 'Admitted Patients', icon: 'patients' },
            { id: 'vitals', label: 'Update Vitals', icon: 'vitals' },
            { id: 'nurse_tasks', label: 'My Tasks', icon: 'check' }
        ],
        lab_technician: [
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { id: 'lab_reports', label: 'Lab Reports', icon: 'lab' },
            { id: 'blood_bank', label: 'Blood Bank', icon: 'bloodbank' }
        ],
        pharmacist: [
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { id: 'pharmacy', label: 'Pharmacy', icon: 'pharmacy' }
        ],
        receptionist: [
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { section: 'Operations' },
            { id: 'patients', label: 'Patients', icon: 'patients' },
            { id: 'tokens', label: 'Token Management', icon: 'token' },
            { id: 'billing', label: 'Billing', icon: 'billing' },
            { id: 'insurance', label: 'Insurance', icon: 'insurance' },
            { section: 'Services' },
            { id: 'ambulance', label: 'Ambulance', icon: 'ambulance' },
            { id: 'blood_view', label: 'Blood Availability', icon: 'bloodbank' },
            { id: 'discharge_view', label: 'Discharge', icon: 'discharge' }
        ],
        admin: [
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { section: 'Patient Care' },
            { id: 'patients', label: 'Patients', icon: 'patients' },
            { id: 'tokens', label: 'Token Booking', icon: 'token' },
            { id: 'diagnosis', label: 'AI Diagnosis', icon: 'diagnosis' },
            { id: 'discharge', label: 'Discharge', icon: 'discharge' },
            { section: 'Clinical' },
            { id: 'lab_reports', label: 'Lab Reports', icon: 'lab' },
            { id: 'pharmacy', label: 'Pharmacy', icon: 'pharmacy' },
            { id: 'diet', label: 'Diet Prescription', icon: 'diet' },
            { section: 'Resources' },
            { id: 'blood_bank', label: 'Blood Bank', icon: 'bloodbank' },
            { id: 'ambulance', label: 'Ambulance', icon: 'ambulance' },
            { id: 'equipment', label: 'Equipment', icon: 'equipment' },
            { section: 'Finance' },
            { id: 'billing', label: 'Billing', icon: 'billing' },
            { id: 'insurance', label: 'Insurance', icon: 'insurance' },
            { section: 'Advanced' },
            { id: 'organ_donation', label: 'Organ Donation', icon: 'organ' },
            { id: 'feedback', label: 'Feedback', icon: 'feedback' },
            { id: 'nurse_tasks', label: 'Nurse Tasks', icon: 'nurse' },
            { section: 'System' },
            { id: 'settings', label: 'Settings', icon: 'settings' },
            { id: 'audit_logs', label: 'Audit Logs', icon: 'audit' }
        ],
        super_admin: [
            { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { section: 'Analytics' },
            { id: 'analytics', label: 'Hospital Analytics', icon: 'analytics' },
            { id: 'organ_analytics', label: 'Organ Donation', icon: 'organ' },
            { id: 'blood_analytics', label: 'Blood Bank', icon: 'bloodbank' },
            { section: 'Governance' },
            { id: 'compliance', label: 'Compliance', icon: 'audit' },
            { id: 'settings', label: 'Settings', icon: 'settings' }
        ]
    };

    function hasPermission(role, view) {
        if (!role || !PERMISSIONS[role]) return false;
        return PERMISSIONS[role].includes(view);
    }

    function getMenuItems(role) {
        return MENU_ITEMS[role] || [];
    }

    function getRoleLabel(role) {
        return ROLES[role]?.label || role;
    }

    function getAllRoles() {
        return Object.entries(ROLES).map(([k, v]) => ({ id: k, ...v }));
    }

    function canEditBilling(role) {
        return ['receptionist', 'admin', 'super_admin'].includes(role);
    }

    function canEditLabReports(role) {
        return ['lab_technician', 'admin'].includes(role);
    }

    function canDispatchAmbulance(role) {
        return ['receptionist', 'admin'].includes(role);
    }

    function canManageOrganDonation(role) {
        return ['admin', 'super_admin'].includes(role);
    }

    function canManageBloodBank(role) {
        return ['lab_technician', 'admin'].includes(role);
    }

    function canApproveDischarge(role) {
        return ['doctor', 'admin'].includes(role);
    }

    function canViewAllPatients(role) {
        return ['receptionist', 'admin', 'super_admin'].includes(role);
    }

    return {
        ROLES, PERMISSIONS, MENU_ITEMS,
        hasPermission, getMenuItems, getRoleLabel, getAllRoles,
        canEditBilling, canEditLabReports, canDispatchAmbulance,
        canManageOrganDonation, canManageBloodBank, canApproveDischarge, canViewAllPatients
    };
})();
