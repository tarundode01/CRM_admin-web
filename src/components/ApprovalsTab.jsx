import React, { useState } from 'react';

export default function ApprovalsTab({ approvals = [], onUpdateApproval }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' (Bento Grid) or 'table'
  const [processingId, setProcessingId] = useState(null);

  // Type styling & badges
  const getTypeTheme = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('customer') || t.includes('kyc')) {
      return { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD', icon: '🏢' };
    }
    if (t.includes('employee') || t.includes('staff')) {
      return { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE', icon: '👥' };
    }
    if (t.includes('deal') || t.includes('discount') || t.includes('pricing')) {
      return { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A', icon: '💰' };
    }
    if (t.includes('cancellation') || t.includes('payment')) {
      return { bg: '#FFE4E6', color: '#BE123C', border: '#FECDD3', icon: '⚠️' };
    }
    return { bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE', icon: '⚖️' };
  };

  // Status styling
  const getStatusBadge = (status = 'Pending') => {
    const s = status.toLowerCase();
    if (s === 'approved') {
      return { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', icon: '✓', text: 'APPROVED' };
    }
    if (s === 'rejected') {
      return { bg: '#FEE2E2', color: '#DC2626', border: '#FECDD3', icon: '✕', text: 'REJECTED' };
    }
    return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', icon: '⏳', text: 'PENDING' };
  };

  // Metrics
  const pendingCount = approvals.filter(a => (a.status || 'Pending').toLowerCase() === 'pending').length;
  const approvedCount = approvals.filter(a => (a.status || '').toLowerCase() === 'approved').length;
  const rejectedCount = approvals.filter(a => (a.status || '').toLowerCase() === 'rejected').length;

  // Filter list with deep multi-field matching
  const filteredApprovals = approvals.filter(a => {
    const st = (a.status || 'Pending').toLowerCase();
    if (filterStatus === 'Pending' && st !== 'pending') return false;
    if (filterStatus === 'Approved' && st !== 'approved') return false;
    if (filterStatus === 'Rejected' && st !== 'rejected') return false;

    if (search) {
      const q = search.trim().toLowerCase();
      const reqName = (a.requestedByName || a.requestedBy?.name || a.employee?.name || '').toLowerCase();
      const email = (a.requestedBy?.email || a.employee?.email || '').toLowerCase();
      const phone = (a.requestedBy?.phone || a.employee?.phone || '').toLowerCase();
      const sub = (a.subject || '').toLowerCase();
      const typ = (a.requestType || '').toLowerCase();
      const desc = (a.description || '').toLowerCase();
      const role = (a.role || a.requestedBy?.role || a.employee?.role || '').toLowerCase();
      return reqName.includes(q) || email.includes(q) || phone.includes(q) || sub.includes(q) || typ.includes(q) || desc.includes(q) || role.includes(q);
    }
    return true;
  });

  const handleDecision = async (id, status) => {
    setProcessingId(id);
    try {
      await onUpdateApproval(id, status);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      
      {/* 🌟 CSS Keyframes and Micro-animations */}
      <style>{`
        @keyframes pulseAmbientAppr {
          0% { transform: scale(0.98); opacity: 0.8; }
          50% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(0.98); opacity: 0.8; }
        }
        @keyframes subtleApprFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .approval-bento-card {
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .approval-bento-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(190, 18, 60, 0.12) !important;
          border-color: #FDA4AF !important;
        }
      `}</style>

      {/* 🌟 1. Compact Sleek Crimson/Rose Billboard Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #881337 0%, #BE123C 50%, #E11D48 100%)',
        borderRadius: '16px',
        padding: '18px 24px',
        color: '#FFFFFF',
        boxShadow: '0 10px 30px rgba(190, 18, 60, 0.22)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        border: '1.5px solid rgba(254, 205, 211, 0.35)',
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
          background: 'radial-gradient(circle, rgba(255, 228, 230, 0.35) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
          animation: 'pulseAmbientAppr 5s ease-in-out infinite'
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.22)',
            padding: '3px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '900',
            letterSpacing: '0.6px',
            marginBottom: '5px',
            backdropFilter: 'blur(6px)'
          }}>
            <span>⚖️</span> ACCOUNT VERIFICATION & AUTHORIZATIONS
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.4px', textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
            New Account Approval Queue
          </h1>
          <p style={{ margin: '4px 0 0 0', opacity: 0.94, fontSize: '12.5px', color: '#FFE4E6', maxWidth: '560px' }}>
            Review new customer & employee signup requests. Authorize accounts to grant CRM portal access.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
          {/* View Toggle */}
          <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: '12px', padding: '3px', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(8px)' }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                backgroundColor: viewMode === 'cards' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'cards' ? '#BE123C' : '#FFFFFF',
                border: 'none',
                borderRadius: '9px',
                padding: '6px 14px',
                fontSize: '11.5px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: viewMode === 'cards' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🗂️</span> Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'table' ? '#BE123C' : '#FFFFFF',
                border: 'none',
                borderRadius: '9px',
                padding: '6px 14px',
                fontSize: '11.5px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: viewMode === 'table' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span>📑</span> List
            </button>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            color: '#BE123C',
            fontSize: '12px',
            fontWeight: '900',
            padding: '8px 16px',
            borderRadius: '12px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ fontSize: '14px' }}>⏳</span>
            <span>{pendingCount} Pending</span>
          </div>
        </div>
      </div>

      {/* 🌟 2. Spacious & Modern 4-Col KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        
        {/* Metric 1 */}
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
            ⏳
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Pending Approvals
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#78350F', lineHeight: '1' }}>
                {pendingCount}
              </div>
              <span style={{ fontSize: '10.5px', color: '#B45309', fontWeight: '800', backgroundColor: '#FEF3C7', padding: '2px 7px', borderRadius: '6px' }}>
                Action Required
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
            ✓
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Approved
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#065F46', lineHeight: '1' }}>
                {approvedCount}
              </div>
              <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: '800', backgroundColor: '#D1FAE5', padding: '2px 7px', borderRadius: '6px' }}>
                Authorized
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #FECDD3',
          padding: '14px 18px',
          boxShadow: '0 4px 14px rgba(225, 29, 72, 0.05)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF1F2 100%)',
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
            background: 'linear-gradient(135deg, #FFE4E6 0%, #FECDD3 100%)',
            border: '1.5px solid #FDA4AF',
            color: '#E11D48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(225, 29, 72, 0.15)'
          }}>
            ✕
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#BE123C', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Rejected
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#881337', lineHeight: '1' }}>
                {rejectedCount}
              </div>
              <span style={{ fontSize: '10.5px', color: '#BE123C', fontWeight: '800', backgroundColor: '#FFE4E6', padding: '2px 7px', borderRadius: '6px' }}>
                Declined
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
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
            🛡️
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Access Protocol
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#1E1B4B', lineHeight: '1' }}>
                RBAC Live
              </div>
              <span style={{ fontSize: '10.5px', color: '#7C3AED', fontWeight: '800', backgroundColor: '#EDE9FE', padding: '2px 7px', borderRadius: '6px' }}>
                Strict
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 🌟 3. Filter Controls & Prominent Colorful Live Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#FFFFFF',
        padding: '12px 18px',
        borderRadius: '16px',
        border: '1.5px solid #FECDD3',
        boxShadow: '0 4px 16px rgba(190, 18, 60, 0.04)'
      }}>
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'All', label: 'All', count: approvals.length, color: '#BE123C', bg: '#FFF1F2' },
            { id: 'Pending', label: 'Pending', count: pendingCount, color: '#D97706', bg: '#FFFBEB' },
            { id: 'Approved', label: 'Approved', count: approvedCount, color: '#059669', bg: '#ECFDF5' },
            { id: 'Rejected', label: 'Rejected', count: rejectedCount, color: '#DC2626', bg: '#FEF2F2' }
          ].map(f => {
            const isSel = filterStatus === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
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
            background: 'linear-gradient(135deg, #BE123C 0%, #E11D48 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            boxShadow: '0 2px 6px rgba(190, 18, 60, 0.3)'
          }}>
            🔍
          </div>
          <input
            type="text"
            placeholder="Search by applicant name, email, phone, role or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px 11px 48px',
              borderRadius: '12px',
              border: '1.5px solid #FECDD3',
              backgroundColor: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: '600',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 2px 8px rgba(190, 18, 60, 0.06)',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#BE123C';
              e.target.style.boxShadow = '0 0 0 3px rgba(190, 18, 60, 0.18)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#FECDD3';
              e.target.style.boxShadow = '0 2px 8px rgba(190, 18, 60, 0.06)';
            }}
          />
        </div>
      </div>

      {/* 🌟 4. Main Body: Chota & Sleek Bento Cards OR Classic List */}
      {viewMode === 'cards' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '12px'
        }}>
          {filteredApprovals.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '36px 14px',
              textAlign: 'center',
              border: '2px dashed #CBD5E1',
              color: '#64748B'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>⚖️</div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', margin: 0 }}>
                No Compliance Requests
              </h3>
              <p style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '3px' }}>
                {search ? 'No requests match search criteria.' : 'All registrations & exception approvals are fully resolved.'}
              </p>
            </div>
          ) : (
            filteredApprovals.map((a, idx) => {
              const typeTheme = getTypeTheme(a.requestType);
              const statusTheme = getStatusBadge(a.status);
              const isPending = (a.status || 'Pending').toLowerCase() === 'pending';
              const isProcessing = processingId === a._id;
              const requestorName = a.requestedByName || a.requestedBy?.name || a.employee?.name || 'Applicant';
              const requestorEmail = a.requestedBy?.email || a.employee?.email || 'System Request';

              return (
                <div
                  key={a._id || idx}
                  className="approval-bento-card"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: isPending ? '1.5px solid #FCD34D' : '1.5px solid #E2E8F0',
                    boxShadow: isPending ? '0 6px 20px rgba(217, 119, 6, 0.08)' : '0 4px 16px rgba(15, 23, 42, 0.04)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: `subtleApprFadeUp 0.4s ease-out ${idx * 0.04}s both`
                  }}
                >
                  {/* Top Colorful Accent Gradient Line */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3.5px',
                    background: isPending
                      ? 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)'
                      : a.status === 'Approved'
                      ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                      : 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)'
                  }} />

                  <div>
                    {/* Header Row: Type Badge & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', marginTop: '2px' }}>
                      <span style={{
                        backgroundColor: typeTheme.bg,
                        color: typeTheme.color,
                        border: `1px solid ${typeTheme.border}`,
                        fontSize: '10.5px',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <span>{typeTheme.icon}</span>
                        <span>{a.requestType || 'KYC Check'}</span>
                      </span>

                      <span style={{
                        backgroundColor: statusTheme.bg,
                        color: statusTheme.color,
                        border: `1px solid ${statusTheme.border}`,
                        fontSize: '9.5px',
                        fontWeight: '900',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        letterSpacing: '0.4px'
                      }}>
                        <span>{statusTheme.icon}</span>
                        <span>{statusTheme.text}</span>
                      </span>
                    </div>

                    {/* Requestor Identity */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #FFE4E6 0%, #FECDD3 100%)',
                        color: '#BE123C',
                        border: '1.5px solid #FDA4AF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '900',
                        fontSize: '15px',
                        flexShrink: 0,
                        boxShadow: '0 4px 10px rgba(190, 18, 60, 0.12)'
                      }}>
                        {requestorName?.[0]?.toUpperCase() || 'A'}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {requestorName}
                        </h4>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {requestorEmail}
                        </span>
                      </div>
                    </div>

                    {/* Subject Box */}
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      fontSize: '11.5px',
                      lineHeight: '1.4',
                      color: '#334155',
                      marginBottom: '12px',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ fontWeight: '800', color: '#0F172A' }}>
                        {a.subject || 'Registration KYC verification'}
                      </div>
                      {a.description && a.description !== a.subject && (
                        <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {a.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions / Decision Section */}
                  <div style={{
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '12px'
                  }}>
                    {isPending ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                          disabled={isProcessing}
                          onClick={() => handleDecision(a._id, 'Approved')}
                          style={{
                            backgroundColor: '#ECFDF5',
                            border: '1.2px solid #34D399',
                            color: '#059669',
                            fontSize: '11.5px',
                            fontWeight: '900',
                            padding: '7px 10px',
                            borderRadius: '8px',
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.12)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>✓</span> Approve
                        </button>

                        <button
                          disabled={isProcessing}
                          onClick={() => handleDecision(a._id, 'Rejected')}
                          style={{
                            backgroundColor: '#FEF2F2',
                            border: '1.2px solid #FCA5A5',
                            color: '#DC2626',
                            fontSize: '11.5px',
                            fontWeight: '900',
                            padding: '7px 10px',
                            borderRadius: '8px',
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>✕</span> Reject
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                        <span style={{ color: '#94A3B8', fontWeight: '700' }}>
                          Audit Logged
                        </span>
                        <span style={{
                          color: a.status === 'Approved' ? '#047857' : '#DC2626',
                          fontWeight: '900',
                          backgroundColor: a.status === 'Approved' ? '#ECFDF5' : '#FEF2F2',
                          border: a.status === 'Approved' ? '1px solid #A7F3D0' : '1px solid #FECACA',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          {a.status === 'Approved' ? '✓ Verified' : '✕ Rejected'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Classic List Table View */
        <div className="table-responsive" style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1.2px solid var(--border)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.2px solid var(--border)' }}>
                <th style={{ padding: '10px 12px', fontSize: '10.5px', fontWeight: '900', color: '#64748B' }}>TYPE</th>
                <th style={{ padding: '10px 12px', fontSize: '10.5px', fontWeight: '900', color: '#64748B' }}>APPLICANT</th>
                <th style={{ padding: '10px 12px', fontSize: '10.5px', fontWeight: '900', color: '#64748B' }}>SPECIFICATION</th>
                <th style={{ padding: '10px 12px', fontSize: '10.5px', fontWeight: '900', color: '#64748B' }}>STATUS</th>
                <th style={{ padding: '10px 12px', fontSize: '10.5px', fontWeight: '900', color: '#64748B', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredApprovals.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '11.5px' }}>
                    No compliance records.
                  </td>
                </tr>
              ) : (
                filteredApprovals.map(a => {
                  const typeTheme = getTypeTheme(a.requestType);
                  const statusTheme = getStatusBadge(a.status);
                  const isPending = (a.status || 'Pending').toLowerCase() === 'pending';

                  return (
                    <tr key={a._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          backgroundColor: typeTheme.bg,
                          color: typeTheme.color,
                          border: `1px solid ${typeTheme.border}`,
                          fontSize: '10px',
                          fontWeight: '800',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {a.requestType || 'KYC Check'}
                        </span>
                      </td>

                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: '800', fontSize: '12px', color: '#0F172A' }}>
                          {a.requestedByName || a.requestedBy?.name || a.employee?.name || 'Applicant'}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>
                          {a.requestedBy?.email || a.employee?.email}
                        </div>
                      </td>

                      <td style={{ padding: '8px 12px', fontSize: '11.5px', color: '#334155' }}>
                        {a.subject || a.description || 'Verification review'}
                      </td>

                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          backgroundColor: statusTheme.bg,
                          color: statusTheme.color,
                          border: `1px solid ${statusTheme.border}`,
                          fontSize: '9.5px',
                          fontWeight: '900',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {statusTheme.text}
                        </span>
                      </td>

                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        {isPending ? (
                          <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleDecision(a._id, 'Approved')}
                              style={{
                                backgroundColor: '#ECFDF5',
                                border: '1px solid #34D399',
                                color: '#059669',
                                fontSize: '10.5px',
                                fontWeight: '900',
                                padding: '4px 8px',
                                borderRadius: '5px',
                                cursor: 'pointer'
                              }}
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleDecision(a._id, 'Rejected')}
                              style={{
                                backgroundColor: '#FEE2E2',
                                border: '1px solid #FCA5A5',
                                color: '#DC2626',
                                fontSize: '10.5px',
                                fontWeight: '900',
                                padding: '4px 8px',
                                borderRadius: '5px',
                                cursor: 'pointer'
                              }}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '700' }}>
                            Resolved
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
