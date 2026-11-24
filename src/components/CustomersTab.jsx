import React, { useState } from 'react';

export default function CustomersTab({ customers = [], leads = [], onToggleStatus, onDeleteCustomer, onUpdateCustomer, onOpenCustomerHistory }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' (Bento Grid) or 'table'
  const [togglingId, setTogglingId] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', phone: '', company: '', businessType: '' });

  // Avatar Gradient generator
  const getAvatarGradient = (name = 'C', idx = 0) => {
    const gradients = [
      'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', // Teal
      'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)', // Cyan
      'linear-gradient(135deg, #4338CA 0%, #312E81 100%)', // Indigo
      'linear-gradient(135deg, #059669 0%, #047857 100%)', // Emerald
      'linear-gradient(135deg, #D97706 0%, #B45309 100%)', // Amber
      'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', // Violet
    ];
    return gradients[idx % gradients.length];
  };

  // Metrics
  const activeCount = customers.filter(c => (c.status || 'active').toLowerCase() === 'active').length;
  const suspendedCount = customers.filter(c => (c.status || '').toLowerCase() === 'suspended').length;
  const corporateCount = customers.filter(c => c.company && c.company !== 'Private Account').length;

  // Filter list
  const filteredCustomers = customers.filter(c => {
    const st = (c.status || 'active').toLowerCase();
    if (filterStatus === 'Active' && st !== 'active') return false;
    if (filterStatus === 'Suspended' && st !== 'suspended') return false;
    if (filterStatus === 'Corporate' && (!c.company || c.company === 'Private Account')) return false;

    if (search) {
      const q = search.toLowerCase();
      const n = (c.name || '').toLowerCase();
      const comp = (c.company || '').toLowerCase();
      const em = (c.email || '').toLowerCase();
      const gst = (c.gstNumber || '').toLowerCase();
      const ph = (c.phone || '').toLowerCase();
      return n.includes(q) || comp.includes(q) || em.includes(q) || gst.includes(q) || ph.includes(q);
    }
    return true;
  });

  const handleToggle = async (c) => {
    const isActive = (c.status || 'active').toLowerCase() === 'active';
    const nextStatus = isActive ? 'suspended' : 'active';
    setTogglingId(c._id);
    try {
      await onToggleStatus(c._id, nextStatus, !isActive);
    } finally {
      setTogglingId(null);
    }
  };

  const openEditModal = (c) => {
    setEditingCustomer(c);
    setEditFormData({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      company: c.company || '',
      businessType: c.businessType || 'Individual'
    });
  };

  const handleSaveCustomerEdit = async (e) => {
    e.preventDefault();
    if (!editingCustomer || !onUpdateCustomer) return;
    const ok = await onUpdateCustomer(editingCustomer._id, editFormData);
    if (ok) {
      setEditingCustomer(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* 🔮 Executive Customers Tab Animations */}
      <style>{`
        @keyframes subtleFadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulseCustBanner {
          0%, 100% {
            box-shadow: 0 8px 30px rgba(15, 118, 110, 0.28), 0 0 20px rgba(13, 148, 136, 0.2);
          }
          50% {
            box-shadow: 0 14px 38px rgba(15, 118, 110, 0.4), 0 0 30px rgba(45, 212, 191, 0.35);
          }
        }
        .customers-hero-banner {
          animation: subtleFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards, pulseCustBanner 6s ease-in-out infinite;
        }
        .customer-bento-card {
          animation: subtleFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .customer-bento-card:hover {
          transform: translateY(-4px) scale(1.015);
        }
      `}</style>

      {/* 🌟 1. Executive Emerald/Teal Billboard Banner */}
      <div 
        className="customers-hero-banner"
        style={{
          background: 'linear-gradient(135deg, #134E4A 0%, #115E59 35%, #0F766E 70%, #0D9488 100%)',
          borderRadius: '16px',
          padding: '18px 22px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          border: '1.5px solid rgba(153, 246, 228, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated Top Spectrum Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #0D9488 0%, #2DD4BF 25%, #F59E0B 50%, #6366F1 75%, #EC4899 100%)'
        }} />

        {/* Glow ambient background spheres */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(94, 234, 212, 0.45) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '20%',
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '10px',
            fontWeight: '900',
            letterSpacing: '0.5px',
            marginBottom: '6px',
            border: '1px solid rgba(255,255,255,0.25)'
          }}>
            <span>🏢</span> ENTERPRISE CLIENT DIRECTORY
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px', color: '#FFFFFF' }}>
            Enterprise Clients & Accounts
          </h1>
          <p style={{ margin: '3px 0 0 0', opacity: 0.95, fontSize: '12px', color: '#CCFBF1', fontWeight: '500' }}>
            Verified corporate accounts, GSTIN tax credentials, and active portal authorizations.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
          {/* View Toggle */}
          <div style={{ 
            display: 'flex', 
            backgroundColor: 'rgba(255,255,255,0.18)', 
            backdropFilter: 'blur(8px)',
            borderRadius: '10px', 
            padding: '3px', 
            border: '1px solid rgba(255,255,255,0.3)' 
          }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                backgroundColor: viewMode === 'cards' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'cards' ? '#0F766E' : '#FFFFFF',
                border: 'none',
                borderRadius: '7px',
                padding: '5px 12px',
                fontSize: '11px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: viewMode === 'cards' ? '0 2px 6px rgba(0,0,0,0.18)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span>🗂️</span> Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'table' ? '#0F766E' : '#FFFFFF',
                border: 'none',
                borderRadius: '7px',
                padding: '5px 12px',
                fontSize: '11px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: viewMode === 'table' ? '0 2px 6px rgba(0,0,0,0.18)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span>📑</span> List
            </button>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            color: '#0F766E',
            fontSize: '12px',
            fontWeight: '900',
            padding: '7px 16px',
            borderRadius: '10px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>🏢</span> {corporateCount} Corporate Accounts
          </div>
        </div>
      </div>

      {/* 🌟 2. Telemetry Intelligence Metric Cards (Spacious, Clear & Animated Bento) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        
        {/* Metric 1 */}
        <div 
          className="customer-bento-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #99F6E4',
            padding: '16px 18px',
            boxShadow: '0 4px 16px rgba(15, 118, 110, 0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5FDFB 50%, #F0FDFA 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '105px',
            cursor: 'default',
            animationDelay: '0.05s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0D9488';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(13, 148, 136, 0.22)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#99F6E4';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 118, 110, 0.08)';
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #0F766E 0%, #0D9488 50%, #2DD4BF 100%)'
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.35)',
              flexShrink: 0
            }}>
              🏢
            </div>
            <span style={{
              fontSize: '10.5px',
              fontWeight: '800',
              color: '#0F766E',
              backgroundColor: '#CCFBF1',
              padding: '3px 8px',
              borderRadius: '7px',
              border: '1px solid #99F6E4',
              whiteSpace: 'nowrap'
            }}>
              Directory
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#0F766E', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Total Clients
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#134E4A', lineHeight: '1' }}>
                {customers.length}
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                All Accounts
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          className="customer-bento-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #A7F3D0',
            padding: '16px 18px',
            boxShadow: '0 4px 16px rgba(5, 150, 105, 0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F5FDF8 50%, #ECFDF5 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '105px',
            cursor: 'default',
            animationDelay: '0.1s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#10B981';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(16, 185, 129, 0.22)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#A7F3D0';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(5, 150, 105, 0.08)';
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #059669 0%, #10B981 50%, #34D399 100%)'
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #047857 0%, #10B981 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
              flexShrink: 0
            }}>
              ✓
            </div>
            <span style={{
              fontSize: '10.5px',
              fontWeight: '800',
              color: '#047857',
              backgroundColor: '#D1FAE5',
              padding: '3px 8px',
              borderRadius: '7px',
              border: '1px solid #A7F3D0',
              whiteSpace: 'nowrap'
            }}>
              Operational
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#047857', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Active Portals
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#064E3B', lineHeight: '1' }}>
                {activeCount}
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                Online Logins
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          className="customer-bento-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #FDE68A',
            padding: '16px 18px',
            boxShadow: '0 4px 16px rgba(217, 119, 6, 0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF7 50%, #FEF3C7 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '105px',
            cursor: 'default',
            animationDelay: '0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#F59E0B';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(245, 158, 11, 0.22)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#FDE68A';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(217, 119, 6, 0.08)';
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #D97706 0%, #F59E0B 50%, #FBBF24 100%)'
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
              flexShrink: 0
            }}>
              ⏸
            </div>
            <span style={{
              fontSize: '10.5px',
              fontWeight: '800',
              color: '#B45309',
              backgroundColor: '#FEF3C7',
              padding: '3px 8px',
              borderRadius: '7px',
              border: '1px solid #FDE68A',
              whiteSpace: 'nowrap'
            }}>
              Attention
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#B45309', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Suspended
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#78350F', lineHeight: '1' }}>
                {suspendedCount}
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                Paused Access
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          className="customer-bento-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #BAE6FD',
            padding: '16px 18px',
            boxShadow: '0 4px 16px rgba(2, 132, 199, 0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 50%, #E0F2FE 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '105px',
            cursor: 'default',
            animationDelay: '0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0284C7';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(2, 132, 199, 0.22)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#BAE6FD';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(2, 132, 199, 0.08)';
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #0369A1 0%, #0284C7 50%, #38BDF8 100%)'
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0369A1 0%, #0284C7 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
              flexShrink: 0
            }}>
              📋
            </div>
            <span style={{
              fontSize: '10.5px',
              fontWeight: '800',
              color: '#0284C7',
              backgroundColor: '#E0F2FE',
              padding: '3px 8px',
              borderRadius: '7px',
              border: '1px solid #BAE6FD',
              whiteSpace: 'nowrap'
            }}>
              Compliance
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#0284C7', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Tax Status
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#0C4A6E', lineHeight: '1' }}>
                GST Verified
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                B2B Ready
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 🌟 3. Filter Controls & Colorful Active Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        padding: '12px 16px',
        borderRadius: '14px',
        border: '1.5px solid #CBD5E1',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
      }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'All', label: 'All', count: customers.length, color: '#0D9488', bg: '#F0FDFA' },
            { id: 'Active', label: 'Active', count: activeCount, color: '#059669', bg: '#ECFDF5' },
            { id: 'Corporate', label: 'Corporate', count: corporateCount, color: '#4338CA', bg: '#EEF2FF' },
            { id: 'Suspended', label: 'Suspended', count: suspendedCount, color: '#DC2626', bg: '#FEF2F2' }
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
                  padding: '6px 12px',
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

        {/* Colorful & Attractive Search Bar with Deep Proper Filtering */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
          <div style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            boxShadow: '0 2px 6px rgba(13, 148, 136, 0.3)'
          }}>
            🔍
          </div>
          <input
            type="text"
            placeholder="Search by client name, company, email, phone or GST..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 40px',
              borderRadius: '10px',
              border: '1.5px solid #99F6E4',
              backgroundColor: '#FFFFFF',
              fontSize: '12px',
              fontWeight: '600',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.06)',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0D9488';
              e.target.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#99F6E4';
              e.target.style.boxShadow = '0 2px 6px rgba(13, 148, 136, 0.06)';
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
          {filteredCustomers.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '36px 14px',
              textAlign: 'center',
              border: '2px dashed #CBD5E1',
              color: '#64748B'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>🏢</div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', margin: 0 }}>
                No Enterprise Clients Found
              </h3>
              <p style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '3px' }}>
                {search ? 'No client accounts match your active search keyword.' : 'Convert sales leads or onboard corporate clients to build your directory.'}
              </p>
            </div>
          ) : (
            filteredCustomers.map((c, idx) => {
              const isActive = (c.status || 'active').toLowerCase() === 'active';
              const avatarGrad = getAvatarGradient(c.name, idx);
              const isToggling = togglingId === c._id;

              return (
                <div
                  key={c._id || idx}
                  className="customer-bento-card"
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
                    animation: `subtleFadeUp 0.4s ease-out ${idx * 0.04}s both`,
                    transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(13, 148, 136, 0.12)';
                    e.currentTarget.style.borderColor = '#5EEAD4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = '0 4px 18px rgba(15, 23, 42, 0.04)';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  {/* Top Colorful Accent Gradient Line */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3.5px',
                    background: isActive ? 'linear-gradient(90deg, #0D9488 0%, #2DD4BF 100%)' : 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)'
                  }} />

                  <div>
                    {/* Header Row: Company & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', marginTop: '2px' }}>
                      <span style={{
                        backgroundColor: '#F0FDFA',
                        color: '#0F766E',
                        border: '1px solid #99F6E4',
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        maxWidth: '65%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        <span>🏢</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.company || 'Enterprise Account'}</span>
                      </span>

                      <span style={{
                        backgroundColor: isActive ? '#ECFDF5' : '#FEF3C7',
                        color: isActive ? '#047857' : '#B45309',
                        border: isActive ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                        fontSize: '9.5px',
                        fontWeight: '900',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        letterSpacing: '0.4px'
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: isActive ? '#10B981' : '#F59E0B' }} />
                        {isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </div>

                    {/* Client Identity */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: avatarGrad,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '900',
                        fontSize: '15px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                        flexShrink: 0
                      }}>
                        {c.name?.[0]?.toUpperCase() || 'C'}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.name}
                        </h4>
                        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.email}
                        </span>
                      </div>
                    </div>

                    {/* Tax & Phone Metadata Capsule */}
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: '10px',
                      padding: '9px 12px',
                      fontSize: '11px',
                      lineHeight: '1.4',
                      color: '#334155',
                      marginBottom: '12px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', letterSpacing: '0.4px' }}>GSTIN:</span>
                        <span style={{ fontWeight: '800', color: c.gstNumber ? '#0D9488' : '#94A3B8', fontSize: '11px' }}>
                          {c.gstNumber || 'Not Linked'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#94A3B8', letterSpacing: '0.4px' }}>PHONE:</span>
                        <span style={{ fontWeight: '700', color: '#1E293B' }}>
                          {c.phone || '+91 98765 00000'}
                        </span>
                      </div>
                    </div>

                    {/* Enquiry History Quick Action */}
                    <div style={{ marginBottom: '12px' }}>
                      <button
                        onClick={() => onOpenCustomerHistory && onOpenCustomerHistory(c)}
                        style={{
                          width: '100%',
                          padding: '7px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#F0FDFA',
                          border: '1.2px solid #99F6E4',
                          color: '#0F766E',
                          fontSize: '11px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#CCFBF1';
                          e.currentTarget.style.borderColor = '#5EEAD4';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#F0FDFA';
                          e.currentTarget.style.borderColor = '#99F6E4';
                        }}
                      >
                        <span>📜</span>
                        <span>View Multi-Platform Enquiry History</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div style={{
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <button
                      disabled={isToggling}
                      onClick={() => handleToggle(c)}
                      style={{
                        backgroundColor: isActive ? '#FEF3C7' : '#ECFDF5',
                        border: isActive ? '1.2px solid #FDE68A' : '1.2px solid #A7F3D0',
                        color: isActive ? '#B45309' : '#047857',
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '6px 10px',
                        borderRadius: '7px',
                        cursor: isToggling ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{isActive ? '⏸' : '▶'}</span>
                      <span>{isActive ? 'Suspend' : 'Activate'}</span>
                    </button>

                    <button
                      onClick={() => openEditModal(c)}
                      style={{
                        backgroundColor: '#EFF6FF',
                        border: '1.2px solid #BFDBFE',
                        color: '#1D4ED8',
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '6px 12px',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>✏️</span>
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => onDeleteCustomer(c._id, c.name)}
                      style={{
                        backgroundColor: '#FEF2F2',
                        border: '1.2px solid #FECACA',
                        color: '#DC2626',
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '6px 10px',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>🗑️</span> Remove
                    </button>
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
                <th style={{ padding: '10px 12px', fontSize: '10.5px', fontWeight: '900', color: '#64748B' }}>CLIENT / COMPANY</th>
                <th style={{ padding: '10px 12px', fontSize: '10.5px', fontWeight: '900', color: '#64748B' }}>CONTACT</th>
                <th style={{ padding: '10px 12px', fontSize: '10.5px', fontWeight: '900', color: '#64748B' }}>GST NUMBER</th>
                <th style={{ padding: '10px 12px', fontSize: '10.5px', fontWeight: '900', color: '#64748B' }}>STATUS</th>
                <th style={{ padding: '10px 12px', fontSize: '10.5px', fontWeight: '900', color: '#64748B', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '11.5px' }}>
                    No client records found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => {
                  const isActive = (c.status || 'active').toLowerCase() === 'active';

                  return (
                    <tr key={c._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: '800', fontSize: '12.5px', color: '#0F172A' }}>
                          {c.name}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#0F766E', fontWeight: '700' }}>
                          🏢 {c.company || 'Enterprise Account'}
                        </div>
                      </td>

                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: '700', fontSize: '12px', color: '#334155' }}>{c.email}</div>
                        <div style={{ fontSize: '10px', color: '#94A3B8' }}>{c.phone || '+91 98765 00000'}</div>
                      </td>

                      <td style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '800', color: c.gstNumber ? '#B45309' : '#94A3B8' }}>
                        {c.gstNumber || 'Not Linked'}
                      </td>

                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          backgroundColor: isActive ? '#ECFDF5' : '#FEF3C7',
                          color: isActive ? '#047857' : '#B45309',
                          border: isActive ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                          fontSize: '9.5px',
                          fontWeight: '900',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {isActive ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>

                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => onOpenCustomerHistory && onOpenCustomerHistory(c)}
                            title="View Multi-Platform Enquiry History"
                            style={{
                              backgroundColor: '#F0FDFA',
                              border: '1.2px solid #99F6E4',
                              color: '#0F766E',
                              fontSize: '11px',
                              fontWeight: '800',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            📜 History
                          </button>
                          <button
                            onClick={() => handleToggle(c)}
                            style={{
                              backgroundColor: isActive ? '#FEF3C7' : '#ECFDF5',
                              border: isActive ? '1px solid #FDE68A' : '1px solid #A7F3D0',
                              color: isActive ? '#B45309' : '#047857',
                              fontSize: '10.5px',
                              fontWeight: '800',
                              padding: '3px 8px',
                              borderRadius: '5px',
                              cursor: 'pointer'
                            }}
                          >
                            {isActive ? '⏸' : '▶'}
                          </button>
                          <button
                            onClick={() => openEditModal(c)}
                            title="Edit Customer Profile"
                            style={{
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              color: '#1D4ED8',
                              fontSize: '10.5px',
                              fontWeight: '800',
                              padding: '3px 8px',
                              borderRadius: '5px',
                              cursor: 'pointer'
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => onDeleteCustomer(c._id, c.name)}
                            style={{
                              backgroundColor: '#FEE2E2',
                              border: '1px solid #FCA5A5',
                              color: '#DC2626',
                              fontSize: '10.5px',
                              fontWeight: '800',
                              padding: '3px 8px',
                              borderRadius: '5px',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Customer Profile Modal */}
      {editingCustomer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            padding: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1.5px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>✏️</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#0F172A' }}>
                  Edit Customer Profile
                </h3>
              </div>
              <button
                onClick={() => setEditingCustomer(null)}
                style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#94A3B8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomerEdit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '3px' }}>
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.2px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '3px' }}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.2px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '3px' }}>
                    PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.2px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '3px' }}>
                    COMPANY / BUSINESS
                  </label>
                  <input
                    type="text"
                    value={editFormData.company}
                    onChange={e => setEditFormData({ ...editFormData, company: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.2px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '3px' }}>
                    BUSINESS TYPE
                  </label>
                  <input
                    type="text"
                    value={editFormData.businessType}
                    onChange={e => setEditFormData({ ...editFormData, businessType: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.2px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#0F766E',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
