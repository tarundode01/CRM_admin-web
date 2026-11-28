import React, { useState } from 'react';

export default function ApprovalsTab({ approvals = [], onUpdateApproval }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'cards' (Bento Grid) or 'table'
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
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.12);
            opacity: 0.85;
          }
        }
        @keyframes subtleApprFadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmerTopBar {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes subtleFloatAction {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes pulseAttentionBadge {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.4); }
          50% { transform: scale(1.04); box-shadow: 0 0 0 5px rgba(217, 119, 6, 0); }
        }
        .approvals-hero-banner {
          animation: subtleApprFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .approval-metric-card {
          animation: subtleApprFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .approval-metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08) !important;
          border-color: #CBD5E1 !important;
        }
        .approval-bento-card {
          animation: subtleApprFadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .approval-bento-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 30px rgba(67, 56, 202, 0.1) !important;
          border-color: #A5B4FC !important;
        }
        .approval-btn-approve:hover {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25) !important;
        }
        .approval-btn-reject:hover {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25) !important;
        }
        .table-row-approval {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .table-row-approval:hover {
          background-color: #F8FAFC !important;
          transform: scale(1.002);
        }
      `}</style>

      {/* 🌟 1. Executive Midnight Royal Indigo Billboard Banner */}
      <div 
        className="approvals-hero-banner"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 40%, #312E81 75%, #4338CA 100%)',
          borderRadius: '16px',
          padding: '20px 24px',
          color: '#FFFFFF',
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.22)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated Royal Indigo Shimmer Top Accent Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3.5px',
          background: 'linear-gradient(90deg, #4338CA, #6366F1, #818CF8, #4338CA)',
          backgroundSize: '200% 100%',
          animation: 'shimmerTopBar 3.5s linear infinite'
        }} />

        {/* Ambient Glowing Spheres */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129, 140, 248, 0.3) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
          animation: 'pulseAmbientAppr 5s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '25%',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.12)',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '10px',
            fontWeight: '900',
            letterSpacing: '0.6px',
            marginBottom: '6px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: '#E0E7FF'
          }}>
            <span>⚖️</span> ACCOUNT VERIFICATION & AUTHORIZATIONS
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px', color: '#FFFFFF' }}>
            New Account Approval Queue
          </h1>
          <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '12px', color: '#C7D2FE', maxWidth: '560px', fontWeight: '500' }}>
            Review new customer & employee signup requests. Authorize accounts to grant CRM portal access.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
          {/* View Toggle */}
          <div style={{ display: 'flex', backgroundColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px', padding: '3px', border: '1px solid rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(8px)' }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                backgroundColor: viewMode === 'cards' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'cards' ? '#1E1B4B' : '#FFFFFF',
                border: 'none',
                borderRadius: '7px',
                padding: '6px 14px',
                fontSize: '11px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: viewMode === 'cards' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.18s ease'
              }}
            >
              <span>🗂️</span> Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'table' ? '#1E1B4B' : '#FFFFFF',
                border: 'none',
                borderRadius: '7px',
                padding: '6px 14px',
                fontSize: '11px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: viewMode === 'table' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.18s ease'
              }}
            >
              <span>📑</span> List
            </button>
          </div>

          <div 
            style={{
              backgroundColor: '#FFFFFF',
              color: '#1E1B4B',
              fontSize: '12px',
              fontWeight: '900',
              padding: '8px 16px',
              borderRadius: '10px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              animation: pendingCount > 0 ? 'pulseAttentionBadge 2.5s infinite' : 'none'
            }}
          >
            <span style={{ fontSize: '14px' }}>⏳</span>
            <span>{pendingCount} Pending</span>
          </div>
        </div>
      </div>

      {/* 🌟 2. Executive Crisp White SaaS Metric Cards with Subtle Stagger Animation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        
        {/* Metric 1 - Pending Approvals */}
        <div 
          className="approval-metric-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E2E8F0',
            padding: '16px 18px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '105px',
            position: 'relative',
            overflow: 'hidden',
            animationDelay: '0.05s'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3.5px',
            background: 'linear-gradient(90deg, #D97706 0%, #F59E0B 100%)'
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#FFFBEB',
              border: '1.2px solid #FDE68A',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0
            }}>
              ⏳
            </div>
            <span style={{ fontSize: '10.5px', color: '#B45309', fontWeight: '800', backgroundColor: '#FEF3C7', padding: '3px 8px', borderRadius: '6px', border: '1px solid #FDE68A' }}>
              Action Required
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pending Approvals
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', lineHeight: '1' }}>
                {pendingCount}
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                Awaiting Review
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2 - Approved */}
        <div 
          className="approval-metric-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E2E8F0',
            padding: '16px 18px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '105px',
            position: 'relative',
            overflow: 'hidden',
            animationDelay: '0.1s'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3.5px',
            background: 'linear-gradient(90deg, #059669 0%, #10B981 100%)'
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#ECFDF5',
              border: '1.2px solid #A7F3D0',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0
            }}>
              ✓
            </div>
            <span style={{ fontSize: '10.5px', color: '#047857', fontWeight: '800', backgroundColor: '#ECFDF5', padding: '3px 8px', borderRadius: '6px', border: '1px solid #A7F3D0' }}>
              Authorized
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Approved
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', lineHeight: '1' }}>
                {approvedCount}
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                Access Granted
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3 - Rejected */}
        <div 
          className="approval-metric-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E2E8F0',
            padding: '16px 18px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '105px',
            position: 'relative',
            overflow: 'hidden',
            animationDelay: '0.15s'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3.5px',
            background: 'linear-gradient(90deg, #DC2626 0%, #EF4444 100%)'
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#FEF2F2',
              border: '1.2px solid #FECACA',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0
            }}>
              ✕
            </div>
            <span style={{ fontSize: '10.5px', color: '#DC2626', fontWeight: '800', backgroundColor: '#FEF2F2', padding: '3px 8px', borderRadius: '6px', border: '1px solid #FECACA' }}>
              Declined
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Rejected
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', lineHeight: '1' }}>
                {rejectedCount}
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                Blocked Logins
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4 - Access Protocol */}
        <div 
          className="approval-metric-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E2E8F0',
            padding: '16px 18px',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '105px',
            position: 'relative',
            overflow: 'hidden',
            animationDelay: '0.2s'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3.5px',
            background: 'linear-gradient(90deg, #4338CA 0%, #6366F1 100%)'
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#EEF2FF',
              border: '1.2px solid #C7D2FE',
              color: '#4338CA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0
            }}>
              🛡️
            </div>
            <span style={{ fontSize: '10.5px', color: '#4338CA', fontWeight: '800', backgroundColor: '#EEF2FF', padding: '3px 8px', borderRadius: '6px', border: '1px solid #C7D2FE' }}>
              Strict
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Access Protocol
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', lineHeight: '1' }}>
                RBAC Live
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                Zero-Trust
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 🌟 3. Filter Controls & Executive Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#FFFFFF',
        padding: '12px 16px',
        borderRadius: '14px',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)'
      }}>
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'All', label: 'All', count: approvals.length, color: '#4338CA', bg: '#EEF2FF' },
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
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '800',
                  border: isSel ? `1.5px solid ${f.color}` : '1.2px solid #E2E8F0',
                  backgroundColor: isSel ? f.color : '#FFFFFF',
                  color: isSel ? '#FFFFFF' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSel ? `0 2px 8px ${f.color}35` : 'none'
                }}
              >
                <span>{f.label}</span>
                <span style={{
                  backgroundColor: isSel ? 'rgba(255,255,255,0.25)' : f.bg,
                  color: isSel ? '#FFFFFF' : f.color,
                  borderRadius: '8px',
                  padding: '1px 6px',
                  fontSize: '9.5px',
                  fontWeight: '900'
                }}>
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Clean Executive Search Bar */}
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748B',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
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
              padding: '9px 14px 9px 38px',
              borderRadius: '10px',
              border: '1.5px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontSize: '12px',
              fontWeight: '600',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4338CA';
              e.target.style.backgroundColor = '#FFFFFF';
              e.target.style.boxShadow = '0 0 0 3px rgba(67, 56, 202, 0.12)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E2E8F0';
              e.target.style.backgroundColor = '#F8FAFC';
              e.target.style.boxShadow = 'none';
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
                    border: '1.5px solid #E2E8F0',
                    boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: `subtleApprFadeUp 0.4s ease-out ${idx * 0.04}s both`
                  }}
                >
                  {/* Top Subtle Accent Line */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3.5px',
                    background: '#4338CA'
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
        /* Executive SaaS List Table View - Clean, High Contrast & Polished */
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase' }}>REQUEST TYPE</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase' }}>APPLICANT</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase' }}>SPECIFICATION & DETAILS</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase' }}>STATUS</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredApprovals.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontSize: '12.5px', fontWeight: '600' }}>
                      <div style={{ fontSize: '30px', marginBottom: '8px' }}>⚖️</div>
                      No compliance records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredApprovals.map((a, idx) => {
                    const typeTheme = getTypeTheme(a.requestType);
                    const statusTheme = getStatusBadge(a.status);
                    const isPending = (a.status || 'Pending').toLowerCase() === 'pending';
                    const isEven = idx % 2 === 0;
                    const requestorName = a.requestedByName || a.requestedBy?.name || a.employee?.name || 'Applicant';
                    const requestorEmail = a.requestedBy?.email || a.employee?.email;

                    return (
                      <tr
                        key={a._id || idx}
                        className="table-row-approval"
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          backgroundColor: isEven ? '#FFFFFF' : '#FAFAFC'
                        }}
                      >
                        {/* 1. Request Type */}
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                          <span style={{
                            backgroundColor: '#EEF2FF',
                            color: '#4338CA',
                            border: '1px solid #C7D2FE',
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            <span>{typeTheme.icon}</span>
                            <span>{a.requestType || 'KYC Check'}</span>
                          </span>
                        </td>

                        {/* 2. Applicant */}
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '9px',
                              background: 'linear-gradient(135deg, #4338CA 0%, #312E81 100%)',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '900',
                              fontSize: '14px',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                              flexShrink: 0
                            }}>
                              {requestorName?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '800', fontSize: '13px', color: '#0F172A' }}>
                                {requestorName}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                                {requestorEmail || 'No Email Listed'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Specification */}
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                          <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#1E293B' }}>
                            {a.subject || a.description || 'Verification review'}
                          </div>
                          {a.description && a.description !== a.subject && (
                            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                              {a.description}
                            </div>
                          )}
                        </td>

                        {/* 4. Status Badge */}
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                          <span style={{
                            backgroundColor: statusTheme.bg,
                            color: statusTheme.color,
                            border: `1px solid ${statusTheme.border}`,
                            fontSize: '10px',
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
                        </td>

                        {/* 5. Modern Actions */}
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'right' }}>
                          {isPending ? (
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button
                                className="approval-btn-approve"
                                onClick={() => handleDecision(a._id, 'Approved')}
                                style={{
                                  backgroundColor: '#ECFDF5',
                                  border: '1.2px solid #A7F3D0',
                                  color: '#059669',
                                  fontSize: '11px',
                                  fontWeight: '900',
                                  padding: '6px 12px',
                                  borderRadius: '7px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'all 0.18s ease'
                                }}
                              >
                                <span>✓</span> Approve
                              </button>
                              <button
                                className="approval-btn-reject"
                                onClick={() => handleDecision(a._id, 'Rejected')}
                                style={{
                                  backgroundColor: '#FEF2F2',
                                  border: '1.2px solid #FECACA',
                                  color: '#DC2626',
                                  fontSize: '11px',
                                  fontWeight: '900',
                                  padding: '6px 12px',
                                  borderRadius: '7px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'all 0.18s ease'
                                }}
                              >
                                <span>✕</span> Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{
                              fontSize: '11px',
                              color: '#94A3B8',
                              fontWeight: '700',
                              backgroundColor: '#F8FAFC',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0'
                            }}>
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
        </div>
      )}

    </div>
  );
}
