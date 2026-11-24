import React, { useState } from 'react';

export default function SettingsTab({ 
  leads = [], 
  customers = [], 
  employees = [],
  companyInfo: initialCompanyInfo,
  onUpdateCompanyInfo
}) {
  const [formData, setFormData] = useState(() => {
    if (initialCompanyInfo) return initialCompanyInfo;
    try {
      const savedInfo = localStorage.getItem('crm_company_info');
      if (savedInfo) {
        return JSON.parse(savedInfo);
      }
    } catch (e) {}
    return {
      name: 'OmniCRM Technologies Pvt Ltd',
      email: 'admin@crm.com',
      phone: '+91 99000 11223',
      address: 'Plot 42, Tech Park Cybercity, Bangalore, KA - 560100',
      currency: 'INR (₹)',
      timezone: 'Asia/Kolkata (IST)',
      workingHours: '09:30 AM - 06:30 PM'
    };
  });

  // Sync if parent updates
  React.useEffect(() => {
    if (initialCompanyInfo) {
      setFormData(initialCompanyInfo);
    }
  }, [initialCompanyInfo]);

  const [assignmentMode, setAssignmentMode] = useState(() => {
    return localStorage.getItem('crm_assignment_mode') || 'smart_approval';
  });

  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('Settings Saved Live!');

  const handleAssignmentModeChange = (mode) => {
    setAssignmentMode(mode);
    localStorage.setItem('crm_assignment_mode', mode);
    setSaveMessage('Lead Assignment Mode Updated!');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('crm_company_info', JSON.stringify(formData));
      if (onUpdateCompanyInfo) {
        onUpdateCompanyInfo(formData);
      }
      setSaveMessage(`"${formData.name}" Saved & Updated Across CRM!`);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error saving company settings');
    }
  };

  const handleExportCSV = (type) => {
    let data = [];
    if (type === 'leads') {
      data = leads.map(l => ({
        ID: l.enquiryId || l._id,
        Client: l.customerId?.name || l.customerName || 'Prospect',
        Service: l.productService || l.subject,
        Status: l.status,
        Budget: l.budget,
        AssignedTo: l.assignedSales?.name || l.assignedSalesId?.name || 'Unassigned'
      }));
    } else if (type === 'customers') {
      data = customers.map(c => ({
        ID: c._id,
        Name: c.name,
        Email: c.email,
        Phone: c.phone,
        Company: c.company,
        Status: c.status || 'Active'
      }));
    } else if (type === 'employees') {
      data = employees.map(e => ({
        ID: e.employeeId || e._id,
        Name: e.name,
        Email: e.email,
        Role: e.role,
        Department: e.department,
        Designation: e.designation
      }));
    }

    if (data.length === 0) {
      alert(`No records to export for ${type.toUpperCase()}`);
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(val => `"${val || ''}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${type}_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export items list with filter support
  const exportItems = [
    {
      id: 'leads',
      title: 'Sales Leads Pipeline Data',
      count: leads.length,
      unit: 'Records',
      desc: 'All customer leads, sources, budget valuations & sales consultant assignments',
      color: '#16A34A',
      bg: '#F0FDF4',
      border: '#BBF7D0'
    },
    {
      id: 'customers',
      title: 'Enterprise Accounts & Directory',
      count: customers.length,
      unit: 'Accounts',
      desc: 'Registered corporate entities, GSTIN credentials, contacts & verified portals',
      color: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE'
    },
    {
      id: 'employees',
      title: 'Staff, Executives & Telemetry',
      count: employees.length,
      unit: 'Employees',
      desc: 'Workforce credentials, sales quotas, monthly targets & assigned clients',
      color: '#9333EA',
      bg: '#FAF5FF',
      border: '#E9D5FF'
    }
  ];

  const filteredExportItems = exportItems.filter(item => {
    if (!search) return true;
    const q = search.trim().toLowerCase();
    return item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      
      {/* 🌟 CSS Keyframe Animations */}
      <style>{`
        @keyframes pulseConfigAmbient {
          0% { transform: scale(0.98); opacity: 0.8; }
          50% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(0.98); opacity: 0.8; }
        }
        @keyframes subtleSettingsFadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .config-bento-card {
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .config-bento-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08) !important;
        }
      `}</style>

      {/* 🌟 1. Compact Sleek Gear Billboard Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 50%, #020617 100%)',
        borderRadius: '16px',
        padding: '18px 24px',
        color: '#FFFFFF',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.28)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        border: '1.5px solid rgba(148, 163, 184, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow ambient background sphere */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(148, 163, 184, 0.3) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
          animation: 'pulseConfigAmbient 5s ease-in-out infinite'
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.18)',
            padding: '3px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '900',
            letterSpacing: '0.6px',
            marginBottom: '5px',
            backdropFilter: 'blur(6px)'
          }}>
            <span>⚙️</span> ORGANIZATION SETTINGS & DATA TOOLS
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.4px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            CRM Configuration & Data Export Hub
          </h2>
          <p style={{ fontSize: '12.5px', color: '#D1D5DB', margin: '4px 0 0 0', fontWeight: '500', maxWidth: '580px' }}>
            Manage company profile, business rules, working hours, and 1-click CSV/Excel data export
          </p>
        </div>

        {saved && (
          <div style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            padding: '9px 18px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '900',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.45)',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'menuSlideIn 0.25s ease'
          }}>
            <span style={{ fontSize: '14px' }}>✓</span> {saveMessage}
          </div>
        )}
      </div>

      {/* 🌟 2. Spacious 4-Col KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        
        {/* Metric 1 */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #C7D2FE',
          padding: '14px 18px',
          boxShadow: '0 4px 14px rgba(67, 56, 202, 0.05)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #EEF2FF 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
            border: '1.5px solid #A5B4FC',
            color: '#4338CA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(67, 56, 202, 0.15)'
          }}>
            🎯
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Lead Records
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#1E1B4B', lineHeight: '1' }}>
                {leads.length}
              </div>
              <span style={{ fontSize: '10.5px', color: '#4338CA', fontWeight: '800', backgroundColor: '#E0E7FF', padding: '2px 7px', borderRadius: '6px' }}>
                Pipeline
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #BAE6FD',
          padding: '14px 18px',
          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.05)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
            border: '1.5px solid #7DD3FC',
            color: '#0284C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)'
          }}>
            🏢
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Client Accounts
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#0C4A6E', lineHeight: '1' }}>
                {customers.length}
              </div>
              <span style={{ fontSize: '10.5px', color: '#0284C7', fontWeight: '800', backgroundColor: '#E0F2FE', padding: '2px 7px', borderRadius: '6px' }}>
                Registered
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #DDD6FE',
          padding: '14px 18px',
          boxShadow: '0 4px 14px rgba(109, 40, 217, 0.05)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
            border: '1.5px solid #C4B5FD',
            color: '#7C3AED',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)'
          }}>
            👥
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Team Members
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#1E1B4B', lineHeight: '1' }}>
                {employees.length}
              </div>
              <span style={{ fontSize: '10.5px', color: '#7C3AED', fontWeight: '800', backgroundColor: '#EDE9FE', padding: '2px 7px', borderRadius: '6px' }}>
                Active Staff
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #A7F3D0',
          padding: '14px 18px',
          boxShadow: '0 4px 14px rgba(5, 150, 105, 0.05)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            border: '1.5px solid #6EE7B7',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)'
          }}>
            📤
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Export Protocol
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#065F46', lineHeight: '1' }}>
                CSV / Excel
              </div>
              <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: '800', backgroundColor: '#D1FAE5', padding: '2px 7px', borderRadius: '6px' }}>
                1-Click Ready
              </span>
            </div>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
        
        {/* Smart Lead Assignment Strategy Card */}
        <div style={{
          gridColumn: '1 / -1',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
          borderRadius: '16px',
          border: '1.5px solid #818CF8',
          padding: '18px 20px',
          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EEF2FF', padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: '800', color: '#4338CA', marginBottom: '4px' }}>
                <span>🎯</span> INBOUND DISPATCH ENGINE
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#1E1B4B', margin: 0 }}>
                Smart Lead Assignment Configuration
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                Control how newly captured leads from WhatsApp, Instagram, Facebook, LinkedIn and Website are dispatched to Sales Team.
              </p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '4px 12px', borderRadius: '8px' }}>
              ✓ Engine Active
            </span>
          </div>

          {/* Three Premium Mode Options */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '10px' }}>
            
            {/* Mode 1 */}
            <div
              onClick={() => handleAssignmentModeChange('smart_approval')}
              className="config-bento-card"
              style={{
                padding: '14px',
                borderRadius: '14px',
                backgroundColor: assignmentMode === 'smart_approval' ? '#FEF3C7' : '#FFFFFF',
                border: assignmentMode === 'smart_approval' ? '2px solid #D97706' : '1.5px solid #E2E8F0',
                cursor: 'pointer',
                boxShadow: assignmentMode === 'smart_approval' ? '0 4px 12px rgba(217, 119, 6, 0.12)' : 'none',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '20px' }}>🧠</span>
                <span style={{
                  fontSize: '9.5px',
                  fontWeight: '900',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  border: '1px solid #86EFAC'
                }}>
                  RECOMMENDED
                </span>
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: '900', color: assignmentMode === 'smart_approval' ? '#78350F' : '#0F172A', marginBottom: '4px' }}>
                1. Smart Recommendation + Admin Approval
              </div>
              <p style={{ fontSize: '11px', color: '#64748B', lineHeight: '1.4', margin: 0 }}>
                System calculates expertise, capacity, and current active leads to highlight the <strong>Best Match</strong>. Admin retains 100% final approval control.
              </p>
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="radio"
                  name="assignmentMode"
                  checked={assignmentMode === 'smart_approval'}
                  onChange={() => handleAssignmentModeChange('smart_approval')}
                />
                <span style={{ fontSize: '11px', fontWeight: '800', color: assignmentMode === 'smart_approval' ? '#92400E' : '#475569' }}>
                  {assignmentMode === 'smart_approval' ? 'Selected (Default)' : 'Enable Mode'}
                </span>
              </div>
            </div>

            {/* Mode 2 */}
            <div
              onClick={() => handleAssignmentModeChange('auto_dispatch')}
              className="config-bento-card"
              style={{
                padding: '14px',
                borderRadius: '14px',
                backgroundColor: assignmentMode === 'auto_dispatch' ? '#ECFDF5' : '#FFFFFF',
                border: assignmentMode === 'auto_dispatch' ? '2px solid #059669' : '1.5px solid #E2E8F0',
                cursor: 'pointer',
                boxShadow: assignmentMode === 'auto_dispatch' ? '0 4px 12px rgba(5, 150, 105, 0.12)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '20px' }}>⚡</span>
                <span style={{
                  fontSize: '9.5px',
                  fontWeight: '900',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  backgroundColor: '#E0E7FF',
                  color: '#4338CA'
                }}>
                  INSTANT
                </span>
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: '900', color: assignmentMode === 'auto_dispatch' ? '#065F46' : '#0F172A', marginBottom: '4px' }}>
                2. Fully Automatic Assignment
              </div>
              <p style={{ fontSize: '11px', color: '#64748B', lineHeight: '1.4', margin: 0 }}>
                Inbound leads are immediately auto-dispatched to the highest-scoring available specialist with zero manual intervention required.
              </p>
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="radio"
                  name="assignmentMode"
                  checked={assignmentMode === 'auto_dispatch'}
                  onChange={() => handleAssignmentModeChange('auto_dispatch')}
                />
                <span style={{ fontSize: '11px', fontWeight: '800', color: assignmentMode === 'auto_dispatch' ? '#047857' : '#475569' }}>
                  {assignmentMode === 'auto_dispatch' ? 'Selected' : 'Enable Mode'}
                </span>
              </div>
            </div>

            {/* Mode 3 */}
            <div
              onClick={() => handleAssignmentModeChange('round_robin')}
              className="config-bento-card"
              style={{
                padding: '14px',
                borderRadius: '14px',
                backgroundColor: assignmentMode === 'round_robin' ? '#EFF6FF' : '#FFFFFF',
                border: assignmentMode === 'round_robin' ? '2px solid #2563EB' : '1.5px solid #E2E8F0',
                cursor: 'pointer',
                boxShadow: assignmentMode === 'round_robin' ? '0 4px 12px rgba(37, 99, 235, 0.12)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '20px' }}>🔄</span>
                <span style={{
                  fontSize: '9.5px',
                  fontWeight: '900',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  backgroundColor: '#F1F5F9',
                  color: '#475569'
                }}>
                  BALANCED
                </span>
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: '900', color: assignmentMode === 'round_robin' ? '#1E40AF' : '#0F172A', marginBottom: '4px' }}>
                3. Round Robin Assignment
              </div>
              <p style={{ fontSize: '11px', color: '#64748B', lineHeight: '1.4', margin: 0 }}>
                Distributes incoming inquiries equally and cyclically across active sales team members to guarantee 100% fair opportunity distribution.
              </p>
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="radio"
                  name="assignmentMode"
                  checked={assignmentMode === 'round_robin'}
                  onChange={() => handleAssignmentModeChange('round_robin')}
                />
                <span style={{ fontSize: '11px', fontWeight: '800', color: assignmentMode === 'round_robin' ? '#1D4ED8' : '#475569' }}>
                  {assignmentMode === 'round_robin' ? 'Selected' : 'Enable Mode'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Left: Company Profile Settings */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #E2E8F0',
          padding: '18px',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
        }}>
          <h4 style={{ margin: '0 0 14px 0', fontSize: '14.5px', fontWeight: '900', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏢</span> Company Profile & Business Settings
          </h4>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '4px' }}>
                COMPANY NAME
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  BUSINESS EMAIL
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  SUPPORT PHONE
                </label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '4px' }}>
                OFFICE HEADQUARTERS
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  CURRENCY
                </label>
                <input
                  type="text"
                  value={formData.currency || ''}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  WORKING HOURS
                </label>
                <input
                  type="text"
                  value={formData.workingHours || ''}
                  onChange={e => setFormData({ ...formData, workingHours: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                marginTop: '8px',
                background: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(67, 56, 202, 0.25)'
              }}
            >
              Save Company Settings
            </button>
          </form>
        </div>

        {/* Right: Data Export & Backup Hub */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #E2E8F0',
          padding: '18px',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: '900', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📤</span> Bulk Data Export & Reports
            </h4>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>
              Excel / CSV Ready
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '11.5px', color: '#64748B' }}>
            Export CRM records into standard CSV format for Excel, offline analysis, and stakeholder presentations:
          </p>

          {/* Bada & Colorful Search Filter for Export Datasets */}
          <div style={{ position: 'relative', width: '100%' }}>
            <div style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.3)'
            }}>
              🔍
            </div>
            <input
              type="text"
              placeholder="Search datasets by name or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 42px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '12px',
                color: '#0F172A',
                fontWeight: '600',
                backgroundColor: '#F8FAFC',
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1E293B';
                e.target.style.backgroundColor = '#FFFFFF';
                e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#CBD5E1';
                e.target.style.backgroundColor = '#F8FAFC';
                e.target.style.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.04)';
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
            {filteredExportItems.length === 0 ? (
              <div style={{ padding: '24px 10px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                No export datasets match your search.
              </div>
            ) : (
              filteredExportItems.map(item => (
                <div
                  key={item.id}
                  className="config-bento-card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: item.bg,
                    border: `1.5px solid ${item.border}`,
                    gap: '10px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '13px', color: item.color }}>{item.title}</strong>
                      <span style={{ fontSize: '10.5px', color: item.color, fontWeight: '800', backgroundColor: '#FFFFFF', padding: '1px 6px', borderRadius: '6px' }}>
                        {item.count} {item.unit}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '2px' }}>
                      {item.desc}
                    </span>
                  </div>
                  <button
                    onClick={() => handleExportCSV(item.id)}
                    style={{
                      background: item.color,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '7px 14px',
                      fontSize: '11.5px',
                      fontWeight: '900',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: `0 2px 8px ${item.color}40`,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>📥</span> Export CSV
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
