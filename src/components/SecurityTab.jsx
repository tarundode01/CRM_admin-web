import React, { useState } from 'react';

export default function SecurityTab({ employees = [], leads = [] }) {
  const [activeSubTab, setActiveSubTab] = useState('audit'); // 'audit' | 'roles' | 'sessions'
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('All');

  const mockLogs = [
    { id: 1, action: 'Lead Assigned', user: 'Admin', target: 'Rahul Sharma (WhatsApp Lead)', detail: 'Assigned to Sales Rep Amit Kumar', time: '5 mins ago', badge: '#059669', icon: '🎯' },
    { id: 2, action: 'Quotation Dispatched', user: 'Amit Kumar', target: 'QUOT-90214', detail: 'Sent quote of ₹4,50,000 for ERP Implementation', time: '22 mins ago', badge: '#2563EB', icon: '📑' },
    { id: 3, action: 'Lead Status Changed', user: 'Neha Verma', target: 'Dr. Alok Clinic', detail: 'Status updated from "New" to "In Discussion"', time: '1 hour ago', badge: '#D97706', icon: '🔄' },
    { id: 4, action: 'Customer Account Approved', user: 'Admin', target: 'Apex Logistics Ltd', detail: 'KYC verified & account activated', time: '3 hours ago', badge: '#7C3AED', icon: '⚖️' },
    { id: 5, action: 'Support Ticket Closed', user: 'Pooja Singh', target: 'TCK-88124', detail: 'Resolved API webhook timeout complaint', time: '4 hours ago', badge: '#059669', icon: '💬' },
    { id: 6, action: 'Admin Login', user: 'Admin', target: 'Web Session', detail: 'Logged in from 192.168.1.7 (Chrome Windows)', time: 'Today 09:30 AM', badge: '#475569', icon: '🔑' },
    { id: 7, action: 'Target Modified', user: 'Admin', target: 'Sales3 Staff Goal', detail: 'Updated target quota to ₹10.0L with 20 tasks', time: 'Today 11:15 AM', badge: '#B45309', icon: '🎯' },
    { id: 8, action: 'Export Inbound Leads', user: 'Amit Kumar', target: 'CSV Telemetry Dump', detail: 'Downloaded 23 lead records securely', time: 'Today 01:20 PM', badge: '#0284C7', icon: '📥' }
  ];

  const roles = [
    {
      name: 'Operations Admin / Manager',
      usersCount: 2,
      color: '#B45309',
      permissions: ['Full Access', 'Lead Assignment', 'Employee Management', 'Financial Approvals', 'Export Data']
    },
    {
      name: 'Sales Executive',
      usersCount: employees.filter(e => e.role === 'sales').length || 6,
      color: '#059669',
      permissions: ['Assigned Leads Only', 'Create Quotations', 'Log Calls & Meetings', 'Update Lead Status']
    },
    {
      name: 'Support Officer',
      usersCount: employees.filter(e => e.role === 'support').length || 3,
      color: '#4338CA',
      permissions: ['Customer Tickets Desk', 'Chat Messaging', 'View Customer Profile', 'Escalate Complaints']
    }
  ];

  // Deep multi-field search filter for audit logs
  const filteredLogs = mockLogs.filter(log => {
    if (filterAction !== 'All') {
      if (filterAction === 'Logins' && !log.action.toLowerCase().includes('login')) return false;
      if (filterAction === 'Leads' && !log.action.toLowerCase().includes('lead')) return false;
      if (filterAction === 'Approvals' && !log.action.toLowerCase().includes('approv')) return false;
    }
    if (search) {
      const q = search.trim().toLowerCase();
      const act = log.action.toLowerCase();
      const usr = log.user.toLowerCase();
      const tgt = log.target.toLowerCase();
      const dtl = log.detail.toLowerCase();
      return act.includes(q) || usr.includes(q) || tgt.includes(q) || dtl.includes(q);
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      
      {/* 🌟 CSS Keyframe Animations */}
      <style>{`
        @keyframes pulseSecurityAmbient {
          0% { transform: scale(0.98); opacity: 0.8; }
          50% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(0.98); opacity: 0.8; }
        }
        @keyframes subtleLogFadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .security-log-card {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .security-log-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08) !important;
          border-color: #CBD5E1 !important;
        }
      `}</style>

      {/* 🌟 1. Compact Sleek Shield Billboard Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
        borderRadius: '16px',
        padding: '18px 24px',
        color: '#FFFFFF',
        boxShadow: '0 10px 30px rgba(49, 46, 129, 0.22)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        border: '1.5px solid rgba(199, 210, 254, 0.35)',
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
          background: 'radial-gradient(circle, rgba(165, 180, 252, 0.35) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
          animation: 'pulseSecurityAmbient 5s ease-in-out infinite'
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.2)',
            padding: '3px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '900',
            letterSpacing: '0.6px',
            marginBottom: '5px',
            backdropFilter: 'blur(6px)'
          }}>
            <span>🛡️</span> GOVERNANCE, ROLES & AUDIT
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.4px', textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
            Security, Permissions & Activity Audit
          </h2>
          <p style={{ fontSize: '12.5px', color: '#E0E7FF', margin: '4px 0 0 0', fontWeight: '500', maxWidth: '580px' }}>
            Monitor employee actions, role-based access control (RBAC), and user login audit logs
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', zIndex: 2 }}>
          {['audit', 'roles'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              style={{
                background: activeSubTab === tab ? '#FFFFFF' : 'rgba(255,255,255,0.18)',
                color: activeSubTab === tab ? '#1E1B4B' : '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '11.5px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: activeSubTab === tab ? '0 2px 10px rgba(0,0,0,0.15)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {tab === 'audit' ? '📜 Activity Timeline' : '👥 Roles & Permissions'}
            </button>
          ))}
        </div>
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
            📜
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Recorded Events
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#1E1B4B', lineHeight: '1' }}>
                {mockLogs.length}
              </div>
              <span style={{ fontSize: '10.5px', color: '#4338CA', fontWeight: '800', backgroundColor: '#E0E7FF', padding: '2px 7px', borderRadius: '6px' }}>
                24h Window
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
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
            👥
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Active RBAC Roles
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#065F46', lineHeight: '1' }}>
                {roles.length}
              </div>
              <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: '800', backgroundColor: '#D1FAE5', padding: '2px 7px', borderRadius: '6px' }}>
                Configured
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
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
            🛡️
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Access Integrity
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#0C4A6E', lineHeight: '1' }}>
                100% Secure
              </div>
              <span style={{ fontSize: '10.5px', color: '#0284C7', fontWeight: '800', backgroundColor: '#E0F2FE', padding: '2px 7px', borderRadius: '6px' }}>
                Enforced
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #FDE68A',
          padding: '14px 18px',
          boxShadow: '0 4px 14px rgba(217, 119, 6, 0.05)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF8 100%)',
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
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            border: '1.5px solid #FCD34D',
            color: '#B45309',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)'
          }}>
            ⚡
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Audit Engine
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#78350F', lineHeight: '1' }}>
                Live Stream
              </div>
              <span style={{ fontSize: '10.5px', color: '#B45309', fontWeight: '800', backgroundColor: '#FEF3C7', padding: '2px 7px', borderRadius: '6px' }}>
                Real-Time
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 🌟 3. Filter Controls & Prominent Colorful Live Search Bar */}
      {activeSubTab === 'audit' && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          padding: '12px 18px',
          borderRadius: '16px',
          border: '1.5px solid #C7D2FE',
          boxShadow: '0 4px 16px rgba(67, 56, 202, 0.04)'
        }}>
          {/* Action Filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'All', label: 'All Activities', count: mockLogs.length, color: '#4338CA', bg: '#EEF2FF' },
              { id: 'Leads', label: 'Lead Operations', count: mockLogs.filter(l => l.action.toLowerCase().includes('lead')).length, color: '#059669', bg: '#ECFDF5' },
              { id: 'Approvals', label: 'Approvals', count: mockLogs.filter(l => l.action.toLowerCase().includes('approv')).length, color: '#7C3AED', bg: '#F5F3FF' },
              { id: 'Logins', label: 'Authentication', count: mockLogs.filter(l => l.action.toLowerCase().includes('login')).length, color: '#0284C7', bg: '#F0F9FF' }
            ].map(f => {
              const isSel = filterAction === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilterAction(f.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '10px',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    border: isSel ? `1.5px solid ${f.color}` : '1.2px solid #E2E8F0',
                    backgroundColor: isSel ? f.color : '#FFFFFF',
                    color: isSel ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: isSel ? `0 2px 10px ${f.color}35` : 'none'
                  }}
                >
                  <span>{f.label}</span>
                  <span style={{
                    backgroundColor: isSel ? 'rgba(255,255,255,0.25)' : f.bg,
                    color: isSel ? '#FFFFFF' : f.color,
                    borderRadius: '8px',
                    padding: '1px 7px',
                    fontSize: '10px',
                    fontWeight: '900'
                  }}>
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Large, Colorful & Deeply Filtered Search Input */}
          <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: '460px' }}>
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #312E81 0%, #4338CA 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              boxShadow: '0 2px 6px rgba(49, 46, 129, 0.3)'
            }}>
              🔍
            </div>
            <input
              type="text"
              placeholder="Search audit trail by user, action, target or details..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px 11px 48px',
                borderRadius: '12px',
                border: '1.5px solid #C7D2FE',
                backgroundColor: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: '600',
                color: '#0F172A',
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: '0 2px 8px rgba(67, 56, 202, 0.06)',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4338CA';
                e.target.style.boxShadow = '0 0 0 3px rgba(67, 56, 202, 0.16)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#C7D2FE';
                e.target.style.boxShadow = '0 2px 8px rgba(67, 56, 202, 0.06)';
              }}
            />
          </div>
        </div>
      )}

      {/* 🌟 4. Activity Logs List or Roles Grid */}
      {activeSubTab === 'audit' ? (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #E2E8F0',
          padding: '18px',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
        }}>
          <h4 style={{ margin: '0 0 14px 0', fontSize: '14.5px', fontWeight: '900', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🕒</span> Real-time User Activity & Audit Trail ({filteredLogs.length})
          </h4>

          {filteredLogs.length === 0 ? (
            <div style={{ padding: '36px 14px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
              No audit activities match your search keyword.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredLogs.map((log, idx) => (
                <div
                  key={log.id}
                  className="security-log-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: '#F8FAFC',
                    border: '1.2px solid #E2E8F0',
                    flexWrap: 'wrap',
                    gap: '10px',
                    animation: `subtleLogFadeUp 0.35s ease-out ${idx * 0.04}s both`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: `${log.badge}15`,
                      border: `1.5px solid ${log.badge}35`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '17px',
                      flexShrink: 0
                    }}>
                      {log.icon || '📜'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>{log.action}</span>
                        <span style={{ fontSize: '10.5px', background: '#EEF2FF', color: '#4338CA', padding: '2px 8px', borderRadius: '6px', fontWeight: '800' }}>
                          by {log.user}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                        <strong style={{ color: '#0F172A' }}>{log.target}:</strong> {log.detail}
                      </p>
                    </div>
                  </div>

                  <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '6px' }}>
                    {log.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '14px'
        }}>
          {roles.map((r, i) => (
            <div
              key={i}
              className="security-log-card"
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1.5px solid #E2E8F0',
                padding: '18px',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                borderTop: `4px solid ${r.color}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#0F172A' }}>
                    {r.name}
                  </h4>
                  <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '3px 9px', borderRadius: '8px', fontWeight: '800' }}>
                    {r.usersCount} Active Users
                  </span>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.4px' }}>
                    Granted Permissions:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {r.permissions.map((p, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '11px',
                          background: '#ECFDF5',
                          color: '#065F46',
                          border: '1px solid #A7F3D0',
                          padding: '3px 9px',
                          borderRadius: '7px',
                          fontWeight: '800'
                        }}
                      >
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
