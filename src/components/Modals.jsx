import React from 'react';
import SmartAssignModal from './SmartAssignModal.jsx';

export default function Modals({
  empModal,
  setEmpModal,
  leadModal,
  setLeadModal,
  assignModal,
  setAssignModal,
  analysisModal,
  setAnalysisModal,
  employees = [],
  leads = [],
  onCreateEmployee,
  onCreateLead,
  onAssignLead
}) {
  return (
    <>
      {/* Onboard Employee Modal */}
      {empModal && (
        <div style={overlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-navy)' }}>Onboard New Employee</h3>
              <button onClick={() => setEmpModal(false)} style={closeBtnStyle}>✕</button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.target);
              onCreateEmployee({
                name: fd.get('name'),
                email: fd.get('email'),
                phone: fd.get('phone'),
                department: fd.get('dept') || 'Enterprise Sales',
                role: 'sales'
              });
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input name="name" required placeholder="Full Name" style={inputStyle} />
              <input name="email" type="email" required placeholder="Corporate Email" style={inputStyle} />
              <input name="phone" required placeholder="Mobile Phone" style={inputStyle} />
              <input name="dept" placeholder="Department (Sales, Support, Tech)" defaultValue="Enterprise Sales" style={inputStyle} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" onClick={() => setEmpModal(false)} style={cancelBtnStyle}>Cancel</button>
                <button type="submit" style={submitBtnStyle}>Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ULTRA ATTRACTIVE & COLOURFUL QUICK CAPTURE LEAD MODAL */}
      {leadModal && (
        <div style={overlayStyle}>
          <div style={{
            ...modalBoxStyle,
            maxWidth: '560px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            border: '2px solid #34D399',
            borderRadius: '22px',
            boxShadow: '0 20px 45px rgba(5, 150, 105, 0.22)',
            padding: '28px'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', color: '#065F46', marginBottom: '6px', border: '1px solid #A7F3D0' }}>
                  <span>🚀</span> INSTANT LEAD REGISTRATION
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-navy)', margin: 0 }}>
                  Capture New Sales Lead
                </h3>
              </div>
              <button onClick={() => setLeadModal(false)} style={closeBtnStyle}>✕</button>
            </div>

            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.target);
              onCreateLead({
                name: fd.get('customerName'),
                customerName: fd.get('customerName'),
                phone: fd.get('phone'),
                email: fd.get('email'),
                company: fd.get('company'),
                subject: fd.get('subject'),
                service: fd.get('service') || 'Enterprise CRM Suite',
                productService: fd.get('service') || 'Enterprise CRM Suite',
                source: fd.get('source') || 'Website',
                budget: fd.get('budget') ? Number(fd.get('budget')) : 500000,
                priority: fd.get('priority') || 'High'
              });
            }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Row 1: Client Name & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>
                    Client Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    name="customerName"
                    required
                    placeholder="e.g. Vikram Sharma"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>
                    Mobile Number <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    name="phone"
                    required
                    placeholder="e.g. +91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Email & Company */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>
                    Corporate Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="e.g. vikram@acme.com"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>
                    Organization / Company
                  </label>
                  <input
                    name="company"
                    placeholder="e.g. Acme Tech Global"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Row 3: Requirement Subject */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>
                  Requirement Subject / Scope <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  name="subject"
                  required
                  placeholder="e.g. Enterprise Cloud ERP Multi-tenant Implementation"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Row 4: Source & Budget */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>
                    Lead Source Channel <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    name="source"
                    defaultValue="Website"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      fontWeight: '700'
                    }}
                  >
                    <option value="WhatsApp">💬 WhatsApp</option>
                    <option value="Instagram">📸 Instagram</option>
                    <option value="Facebook">👥 Facebook</option>
                    <option value="LinkedIn">💼 LinkedIn</option>
                    <option value="Website">🌐 Website</option>
                    <option value="Phone">📞 Phone Call</option>
                    <option value="Referral">🤝 Referral</option>
                    <option value="Manual Entry">✍️ Manual Entry</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>
                    Commercial Budget (₹ INR)
                  </label>
                  <input
                    name="budget"
                    type="number"
                    defaultValue="500000"
                    placeholder="500000"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Row 5: Priority */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>
                  Priority
                </label>
                <select
                  name="priority"
                  defaultValue="High"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Urgent">🔥 Urgent</option>
                  <option value="High">⚡ High</option>
                  <option value="Medium">⚖️ Medium</option>
                  <option value="Low">🌱 Low</option>
                </select>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setLeadModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>✓</span> Confirm & Register Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ULTRA ATTRACTIVE & COLOURFUL SMART LEAD ASSIGNMENT MODAL */}
      {assignModal && (
        <SmartAssignModal
          assignModal={assignModal}
          employees={employees}
          leads={leads}
          onClose={() => setAssignModal(null)}
          onAssignLead={onAssignLead}
        />
      )}

      {/* Organization Analysis Modal */}
      {analysisModal && (
        <div style={overlayStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📊</span>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-navy)' }}>
                  Organization Analysis & Growth Telemetry
                </h3>
              </div>
              <button onClick={() => setAnalysisModal(false)} style={closeBtnStyle}>✕</button>
            </div>

            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '14px',
              padding: '16px',
              border: '1.5px solid #E2E8F0',
              marginBottom: '16px'
            }}>
              <p style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px' }}>
                PERFORMANCE BREAKDOWN (FY 2026)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Closing Ratio</span>
                  <p style={{ fontSize: '18px', fontWeight: '900', color: '#059669', marginTop: '2px' }}>74.2%</p>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Avg Deal Size</span>
                  <p style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary)', marginTop: '2px' }}>₹4.2L</p>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Active Pipeline</span>
                  <p style={{ fontSize: '18px', fontWeight: '900', color: '#D97706', marginTop: '2px' }}>₹25.0L</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setAnalysisModal(false)}
              style={{
                width: '100%',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '800',
                padding: '11px',
                borderRadius: '10px'
              }}
            >
              Back to Admin Overview ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  padding: '20px'
};

const modalBoxStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: '20px',
  width: '100%',
  maxWidth: '460px',
  padding: '24px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  border: '1.5px solid var(--border)'
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1.5px solid #CBD5E1',
  fontSize: '13px',
  color: 'var(--text-dark)'
};

const closeBtnStyle = {
  fontSize: '16px',
  fontWeight: '800',
  color: '#64748B',
  width: '28px',
  height: '28px',
  borderRadius: '14px',
  backgroundColor: '#F1F5F9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer'
};

const cancelBtnStyle = {
  padding: '8px 16px',
  fontSize: '12.5px',
  fontWeight: '700',
  color: '#475569'
};

const submitBtnStyle = {
  backgroundColor: 'var(--primary)',
  color: '#FFFFFF',
  padding: '8px 18px',
  borderRadius: '8px',
  fontSize: '12.5px',
  fontWeight: '800'
};
