/* =========================================
   CareCluster — Data Layer
   Multi-tenant localStorage CRUD with seed data
   ========================================= */

const CareCluster = window.CareCluster || {};
window.CareCluster = CareCluster;

CareCluster.Data = (() => {

  const HOSPITALS = [
    { id: 'apollo', name: 'Apollo Medical Center', code: 'APL', address: '123 Healthcare Ave, Metro City', phone: '+1-555-0100', email: 'admin@apollo.care' },
    { id: 'global', name: 'Global Health Institute', code: 'GHI', address: '456 Wellness Blvd, Global City', phone: '+1-555-0200', email: 'admin@globalhealth.care' },
    { id: 'city', name: 'City General Hospital', code: 'CGH', address: '789 Medical Dr, City Center', phone: '+1-555-0300', email: 'admin@citygeneral.care' }
  ];

  const DEPARTMENTS = ['General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'ENT', 'Ophthalmology', 'Psychiatry', 'Emergency', 'Surgery', 'Gynecology', 'Urology', 'Oncology', 'Pulmonology'];

  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const ORGANS = ['Kidney', 'Liver', 'Heart', 'Lungs', 'Cornea', 'Pancreas', 'Bone Marrow', 'Skin', 'Small Intestine'];

  function _key(hospitalId, collection) {
    return `cc_${hospitalId}_${collection}`;
  }

  function getStore(hospitalId, collection) {
    try {
      const raw = localStorage.getItem(_key(hospitalId, collection));
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function setStore(hospitalId, collection, data) {
    localStorage.setItem(_key(hospitalId, collection), JSON.stringify(data));
  }

  function addRecord(hospitalId, collection, record) {
    const data = getStore(hospitalId, collection);
    record.id = record.id || generateId();
    record.hospital_id = hospitalId;
    record.created_at = record.created_at || new Date().toISOString();
    record.updated_at = new Date().toISOString();
    data.push(record);
    setStore(hospitalId, collection, data);
    return record;
  }

  function updateRecord(hospitalId, collection, id, updates) {
    const data = getStore(hospitalId, collection);
    const idx = data.findIndex(r => r.id === id);
    if (idx === -1) return null;
    data[idx] = { ...data[idx], ...updates, updated_at: new Date().toISOString() };
    setStore(hospitalId, collection, data);
    return data[idx];
  }

  function deleteRecord(hospitalId, collection, id) {
    const data = getStore(hospitalId, collection);
    const filtered = data.filter(r => r.id !== id);
    setStore(hospitalId, collection, filtered);
    return filtered.length < data.length;
  }

  function getRecord(hospitalId, collection, id) {
    return getStore(hospitalId, collection).find(r => r.id === id) || null;
  }

  function queryRecords(hospitalId, collection, filterFn) {
    return getStore(hospitalId, collection).filter(filterFn);
  }

  function generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  function countRecords(hospitalId, collection, filterFn) {
    const data = getStore(hospitalId, collection);
    return filterFn ? data.filter(filterFn).length : data.length;
  }

  /* ── Seed data for demo ── */
  function seedIfEmpty() {
    HOSPITALS.forEach(h => {
      // Seed users
      if (getStore(h.id, 'users').length === 0) {
        const users = [
          { id: `${h.id}_admin`, name: 'Admin User', email: `admin@${h.id}.care`, password: 'admin123', role: 'admin', department: 'Administration', phone: '+1-555-1001' },
          { id: `${h.id}_doctor`, name: 'Dr. Sarah Mitchell', email: `doctor@${h.id}.care`, password: 'doctor123', role: 'doctor', department: 'General Medicine', phone: '+1-555-1002' },
          { id: `${h.id}_doctor2`, name: 'Dr. James Wilson', email: `doctor2@${h.id}.care`, password: 'doctor123', role: 'doctor', department: 'Cardiology', phone: '+1-555-1009' },
          { id: `${h.id}_nurse`, name: 'Nancy Wilson', email: `nurse@${h.id}.care`, password: 'nurse123', role: 'nurse', department: 'General Medicine', phone: '+1-555-1003' },
          { id: `${h.id}_lab`, name: 'Lab Tech Ryan', email: `lab@${h.id}.care`, password: 'lab123', role: 'lab_technician', department: 'Laboratory', phone: '+1-555-1004' },
          { id: `${h.id}_pharma`, name: 'Pharmacist Emily', email: `pharma@${h.id}.care`, password: 'pharma123', role: 'pharmacist', department: 'Pharmacy', phone: '+1-555-1005' },
          { id: `${h.id}_recep`, name: 'Rachel Green', email: `reception@${h.id}.care`, password: 'recep123', role: 'receptionist', department: 'Front Desk', phone: '+1-555-1006' },
          { id: `${h.id}_patient`, name: 'John Patient', email: `patient@${h.id}.care`, password: 'patient123', role: 'patient', department: '', phone: '+1-555-1007' },
          { id: `${h.id}_superadmin`, name: 'Super Admin', email: `super@${h.id}.care`, password: 'super123', role: 'super_admin', department: 'System', phone: '+1-555-1008' }
        ];
        users.forEach(u => addRecord(h.id, 'users', u));
      }

      // Seed audit log
      if (getStore(h.id, 'audit_logs').length === 0) {
        setStore(h.id, 'audit_logs', []);
      }

      // Initialize empty collections
      ['patients', 'tokens', 'appointments', 'lab_reports', 'medicines', 'bills',
       'insurance', 'blood_bank', 'ambulances', 'equipment', 'organ_donors',
       'diet_prescriptions', 'feedback', 'discharge', 'notifications', 'vitals', 'nurse_tasks'
      ].forEach(col => {
        if (getStore(h.id, col).length === 0 && !localStorage.getItem(_key(h.id, col))) {
          setStore(h.id, col, []);
        }
      });
    });
  }

  function addAuditLog(hospitalId, action, details, userId) {
    addRecord(hospitalId, 'audit_logs', {
      action,
      details,
      user_id: userId || CareCluster.Auth?.currentUser()?.id || 'system',
      user_name: CareCluster.Auth?.currentUser()?.name || 'System',
      timestamp: new Date().toISOString()
    });
  }

  function addNotification(hospitalId, targetRoles, message, type = 'info', relatedId = '') {
    const roles = Array.isArray(targetRoles) ? targetRoles : [targetRoles];
    addRecord(hospitalId, 'notifications', {
      target_roles: roles,
      message,
      type, // info, emergency, warning, low_stock, expiry
      related_id: relatedId,
      read_by: [],
      timestamp: new Date().toISOString()
    });
  }

  function getNotificationsForRole(hospitalId, role) {
    return getStore(hospitalId, 'notifications')
      .filter(n => n.target_roles.includes(role) || n.target_roles.includes('all'))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  function markNotificationRead(hospitalId, notifId, userId) {
    const data = getStore(hospitalId, 'notifications');
    const n = data.find(x => x.id === notifId);
    if (n && !n.read_by.includes(userId)) {
      n.read_by.push(userId);
      setStore(hospitalId, 'notifications', data);
    }
  }

  function getAllHospitalData(collection) {
    let all = [];
    HOSPITALS.forEach(h => {
      const data = getStore(h.id, collection);
      all = all.concat(data.map(r => ({ ...r, _hospital_name: h.name, _hospital_id: h.id })));
    });
    return all;
  }

  function resetAll() {
    HOSPITALS.forEach(h => {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`cc_${h.id}_`)) localStorage.removeItem(key);
      });
    });
    seedIfEmpty();
  }

  return {
    HOSPITALS, DEPARTMENTS, BLOOD_GROUPS, ORGANS,
    getStore, setStore, addRecord, updateRecord, deleteRecord,
    getRecord, queryRecords, generateId, countRecords,
    seedIfEmpty, addAuditLog, addNotification,
    getNotificationsForRole, markNotificationRead,
    getAllHospitalData, resetAll
  };
})();
