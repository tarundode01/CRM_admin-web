import React, { useState } from 'react';

export default function DealsTab({ deals = [], onOpenAddDeal }) {
  const [filterStage, setFilterStage] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' (Bento Grid) or 'table'

  // Stage configurations with luxury glassmorphic vibrant themes
  const stageThemes = {
    'Won': {
      color: '#059669',
      bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
      cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
      border: '#34D399',
      glow: 'rgba(16, 185, 129, 0.25)',
      badgeBg: '#10B981',
      badgeText: '#FFFFFF',
      icon: '🏆',
      label: 'Closed Won'
    },
    'Closed Won': {
      color: '#059669',
      bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
      cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
      border: '#34D399',
      glow: 'rgba(16, 185, 129, 0.25)',
      badgeBg: '#10B981',
      badgeText: '#FFFFFF',
      icon: '🏆',
      label: 'Closed Won'
    },
    'Proposal Sent': {
      color: '#0284C7',
      bg: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
      cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)',
      border: '#38BDF8',
      glow: 'rgba(2, 132, 199, 0.2)',
      badgeBg: '#0284C7',
      badgeText: '#FFFFFF',
      icon: '📄',
      label: 'Proposal Sent'
    },
    'Negotiation': {
      color: '#D97706',
      bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
      cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFFDF8 100%)',
      border: '#FBBF24',
      glow: 'rgba(217, 119, 6, 0.2)',
      badgeBg: '#D97706',
      badgeText: '#FFFFFF',
      icon: '🤝',
      label: 'Negotiation'
    },
    'Lead': {
      color: '#7C3AED',
      bg: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
      cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #FAF5FF 100%)',
      border: '#A78BFA',
      glow: 'rgba(124, 58, 237, 0.2)',
      badgeBg: '#7C3AED',
      badgeText: '#FFFFFF',
      icon: '🌱',
      label: 'Discovery / Lead'
    },
    'Lost': {
      color: '#DC2626',
      bg: 'linear-gradient(135deg, #FEE2E2 0%, #FECDD3 100%)',
      cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFF1F2 100%)',
      border: '#F87171',
      glow: 'rgba(220, 38, 38, 0.2)',
      badgeBg: '#DC2626',
      badgeText: '#FFFFFF',
      icon: '❌',
      label: 'Closed Lost'
    }
  };

  const getStageTheme = (stage = '') => {
    const s = stage.trim();
    if (stageThemes[s]) return stageThemes[s];
    if (s.toLowerCase().includes('won')) return stageThemes['Won'];
    if (s.toLowerCase().includes('proposal')) return stageThemes['Proposal Sent'];
    if (s.toLowerCase().includes('negotiat')) return stageThemes['Negotiation'];
    if (s.toLowerCase().includes('lost')) return stageThemes['Lost'];
    return stageThemes['Lead'];
  };

  // Compute metrics
  const totalPipelineVal = deals.reduce((acc, d) => acc + (Number(d.value || d.amount) || 0), 0);
  const wonDeals = deals.filter(d => (d.stage || '').toLowerCase().includes('won'));
  const wonRevenue = wonDeals.reduce((acc, d) => acc + (Number(d.value || d.amount) || 0), 0);
  const winRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;

  // Filter deals
  const filteredDeals = deals.filter(d => {
    const st = (d.stage || 'Lead').toLowerCase();
    if (filterStage !== 'All') {
      if (filterStage === 'Won' && !st.includes('won')) return false;
      if (filterStage === 'Negotiation' && !st.includes('negotiat')) return false;
      if (filterStage === 'Proposal' && !st.includes('proposal') && !st.includes('quotation')) return false;
      if (filterStage === 'Lead' && (st.includes('won') || st.includes('negotiat') || st.includes('proposal'))) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const client = (d.customerName || d.customerId?.name || '').toLowerCase();
      const title = (d.title || '').toLowerCase();
      const id = (d._id || '').toLowerCase();
      return title.includes(q) || client.includes(q) || id.includes(q);
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* 🔮 Executive Deals Tab Keyframe Animations */}
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
        @keyframes pulseDealsBanner {
          0%, 100% {
            box-shadow: 0 8px 30px rgba(120, 53, 15, 0.28), 0 0 20px rgba(245, 158, 11, 0.2);
          }
          50% {
            box-shadow: 0 14px 38px rgba(120, 53, 15, 0.4), 0 0 30px rgba(245, 158, 11, 0.35);
          }
        }
        .deals-hero-banner {
          animation: subtleFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards, pulseDealsBanner 6s ease-in-out infinite;
        }
        .deals-metric-card {
          animation: subtleFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .deals-metric-card:hover {
          transform: translateY(-4px) scale(1.015);
        }
        .deal-bento-card {
          animation: subtleFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) backwards;
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .deal-bento-card:hover {
          transform: translateY(-4px) scale(1.015);
        }
      `}</style>

      {/* 🌟 1. Luxury Gold/Amber Executive Hero Billboard Banner */}
      <div 
        className="deals-hero-banner"
        style={{
          background: 'linear-gradient(135deg, #451A03 0%, #78350F 35%, #B45309 70%, #D97706 100%)',
          borderRadius: '16px',
          padding: '16px 20px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          border: '1.5px solid rgba(254, 243, 199, 0.4)',
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
          background: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 25%, #10B981 50%, #6366F1 75%, #EC4899 100%)'
        }} />

        {/* Ambient multi-color glow orbs */}
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(253, 230, 138, 0.45) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-25px', left: '25%', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(52, 211, 153, 0.3) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(254, 243, 199, 0.4)',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '10px',
            fontWeight: '900',
            letterSpacing: '0.6px',
            color: '#FEF3C7',
            marginBottom: '6px'
          }}>
            <span className="pulse-beacon" style={{ width: '6px', height: '6px' }} />
            <span>COMMERCIAL REVENUE ENGINE</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #FFFFFF 0%, #FEF3C7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Commercial Deals & Enterprise Contracts
          </h1>
          <p style={{ margin: '3px 0 0 0', opacity: 0.95, fontSize: '12px', maxWidth: '580px', lineHeight: '1.4', color: '#FEF3C7' }}>
            Real-time pipeline tracking, deal valuations, conversion odds, and contract booking.
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
                padding: '5px 12px',
                borderRadius: '7px',
                fontSize: '11px',
                fontWeight: '900',
                border: 'none',
                backgroundColor: viewMode === 'cards' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'cards' ? '#B45309' : '#FFFFFF',
                boxShadow: viewMode === 'cards' ? '0 2px 6px rgba(0,0,0,0.18)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '5px 12px',
                borderRadius: '7px',
                fontSize: '11px',
                fontWeight: '900',
                border: 'none',
                backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'table' ? '#B45309' : '#FFFFFF',
                boxShadow: viewMode === 'table' ? '0 2px 6px rgba(0,0,0,0.18)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Table
            </button>
          </div>

          {onOpenAddDeal && (
            <button
              onClick={onOpenAddDeal}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#B45309',
                padding: '7px 16px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '12px',
                fontWeight: '900',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span>➕</span> Log Deal
            </button>
          )}
        </div>
      </div>

      {/* 🌟 2. Telemetry Intelligence Metric Cards (Spacious, Clear & Animated Bento) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        
        {/* KPI 1: Total Pipeline Pool */}
        <div 
          className="deals-metric-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #FDE68A',
            padding: '16px 18px',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF7 50%, #FEF3C7 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '105px',
            cursor: 'default',
            animationDelay: '0.05s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#F59E0B';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(245, 158, 11, 0.22)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#FDE68A';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.08)';
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
              💼
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
              Pipeline
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#B45309', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Pipeline Value
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#78350F', lineHeight: '1' }}>
                ₹{(totalPipelineVal / 100000).toFixed(1)}L
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                Total Deals
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Realized Won Revenue */}
        <div 
          className="deals-metric-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #A7F3D0',
            padding: '16px 18px',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)',
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
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.08)';
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
              🏆
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
              Closed Won
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#047857', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Closed Won
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#064E3B', lineHeight: '1' }}>
                ₹{(wonRevenue / 100000).toFixed(1)}L
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                Booked ARR
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Closing Win Ratio */}
        <div 
          className="deals-metric-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #C7D2FE',
            padding: '16px 18px',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 50%, #EEF2FF 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '105px',
            cursor: 'default',
            animationDelay: '0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#6366F1';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(99, 102, 241, 0.22)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#C7D2FE';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.08)';
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #4F46E5 0%, #6366F1 50%, #818CF8 100%)'
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
              flexShrink: 0
            }}>
              🎯
            </div>
            <span style={{
              fontSize: '10.5px',
              fontWeight: '800',
              color: '#4338CA',
              backgroundColor: '#E0E7FF',
              padding: '3px 8px',
              borderRadius: '7px',
              border: '1px solid #C7D2FE',
              whiteSpace: 'nowrap'
            }}>
              Efficiency
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#4338CA', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Win Ratio
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#1E1B4B', lineHeight: '1' }}>
                {winRate}%
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                Conversion Rate
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Total Deals */}
        <div 
          className="deals-metric-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #FECDD3',
            padding: '16px 18px',
            boxShadow: '0 4px 16px rgba(244, 63, 94, 0.08)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF7F8 50%, #FFE4E6 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '105px',
            cursor: 'default',
            animationDelay: '0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#F43F5E';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(244, 63, 94, 0.22)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#FECDD3';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(244, 63, 94, 0.08)';
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #E11D48 0%, #F43F5E 50%, #FB7185 100%)'
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #BE123C 0%, #F43F5E 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(244, 63, 94, 0.35)',
              flexShrink: 0
            }}>
              📑
            </div>
            <span style={{
              fontSize: '10.5px',
              fontWeight: '800',
              color: '#BE123C',
              backgroundColor: '#FFE4E6',
              padding: '3px 8px',
              borderRadius: '7px',
              border: '1px solid #FECDD3',
              whiteSpace: 'nowrap'
            }}>
              Active Total
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#BE123C', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Active Deals
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#881337', lineHeight: '1' }}>
                {deals.length} Contracts
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                Tracked Pipeline
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 🌟 3. Filter Tabs & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: '8px 12px',
        borderRadius: '12px',
        border: '1.2px solid var(--border)',
        gap: '8px',
        flexWrap: 'wrap',
        boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '1px' }}>
          {[
            { id: 'All', label: 'All Deals', count: deals.length, color: '#4338CA', bg: '#EEF2FF', border: '#C7D2FE' },
            { id: 'Won', label: '🏆 Won', count: wonDeals.length, color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
            { id: 'Negotiation', label: '🤝 Negotiation', count: deals.filter(d => (d.stage || '').toLowerCase().includes('negotiat')).length, color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
            { id: 'Proposal', label: '📄 Proposal', count: deals.filter(d => (d.stage || '').toLowerCase().includes('proposal')).length, color: '#0284C7', bg: '#E0F2FE', border: '#BAE6FD' },
            { id: 'Lead', label: '🌱 Discovery', count: deals.filter(d => (d.stage || '').toLowerCase().includes('lead')).length, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' }
          ].map(tab => {
            const isSelected = filterStage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterStage(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '7px',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  backgroundColor: isSelected ? tab.color : '#F8FAFC',
                  border: isSelected ? `1.5px solid ${tab.color}` : '1.2px solid #E2E8F0',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? `0 2px 8px ${tab.color}40` : 'none'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : tab.bg,
                  color: isSelected ? '#FFFFFF' : tab.color,
                  fontSize: '9px',
                  fontWeight: '900',
                  padding: '1px 5px',
                  borderRadius: '8px'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <input
          type="text"
          placeholder="🔍 Search title, client, ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            minWidth: '180px',
            flex: 1,
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1.2px solid #CBD5E1',
            fontSize: '11.5px',
            color: 'var(--text-dark)'
          }}
        />
      </div>

      {/* 🌟 4. HIGHLY ATTRACTIVE COLOURFUL BENTO CARDS GRID VIEW */}
      {viewMode === 'cards' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px'
        }}>
          {filteredDeals.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '36px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.2px solid var(--border)', color: 'var(--text-muted)', fontSize: '13px' }}>
              No commercial deals found under the selected category.
            </div>
          ) : (
            filteredDeals.map((d, idx) => {
              const theme = getStageTheme(d.stage);
              const dealVal = Number(d.value || d.amount) || 0;
              const clientName = d.customerName || d.customerId?.name || 'Enterprise Client';
              const targetDate = d.closingDate || d.expectedCloseDate;
              const isWon = (d.stage || '').toLowerCase().includes('won');

              return (
                <div
                  key={d._id || idx}
                  className="deal-bento-card"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: `1.5px solid ${theme.border}`,
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isWon ? `0 4px 20px ${theme.glow}` : '0 4px 16px rgba(0,0,0,0.04)',
                    background: theme.cardBg,
                    position: 'relative',
                    overflow: 'hidden',
                    animationDelay: `${Math.min(idx * 0.05, 0.4)}s`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.color;
                    e.currentTarget.style.boxShadow = `0 12px 28px ${theme.glow || 'rgba(0,0,0,0.1)'}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.border;
                    e.currentTarget.style.boxShadow = isWon ? `0 4px 20px ${theme.glow}` : '0 4px 16px rgba(0,0,0,0.04)';
                  }}
                >
                  {/* Top Ambient Card Accent Stripe */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${theme.color} 0%, ${theme.border} 100%)`
                  }} />
                  {/* Decorative glowing accent ribbon at top right for high-value won deals */}
                  {isWon && (
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      width: '40px',
                      height: '40px',
                      background: 'radial-gradient(circle at 100% 0%, #10B981 0%, rgba(0,0,0,0) 70%)',
                      pointerEvents: 'none'
                    }} />
                  )}

                  {/* Top Bar: Deal ID & Stage Capsule */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        backgroundColor: '#1E1B4B',
                        color: '#F5E4C3',
                        fontSize: '9.5px',
                        fontWeight: '900',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        letterSpacing: '0.4px',
                        boxShadow: '0 1px 4px rgba(30, 27, 75, 0.2)'
                      }}>
                        #{d._id?.slice(-6).toUpperCase() || `DEAL-${idx+1}`}
                      </span>

                      <span style={{
                        background: theme.bg,
                        color: theme.color,
                        border: `1.2px solid ${theme.border}`,
                        fontSize: '10px',
                        fontWeight: '900',
                        padding: '3px 8px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: `0 1px 6px ${theme.glow}`
                      }}>
                        <span>{theme.icon}</span>
                        <span>{d.stage || 'Negotiation'}</span>
                      </span>
                    </div>

                    {/* Deal Title & Client */}
                    <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0F172A', margin: '0 0 6px 0', lineHeight: '1.3' }}>
                      {d.title || 'Enterprise Commercial Contract'}
                    </h3>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '10px',
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      padding: '5px 8px',
                      borderRadius: '8px',
                      border: '1.2px solid rgba(226, 232, 240, 0.95)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}>
                      <span style={{ fontSize: '13px' }}>🏢</span>
                      <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {clientName}
                      </span>
                    </div>
                  </div>

                  {/* Valuation & Closing Timeline Footer */}
                  <div style={{ borderTop: '1.2px solid rgba(226, 232, 240, 0.8)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: '9px', color: '#64748B', fontWeight: '800' }}>CONTRACT VALUE</div>
                        <div style={{
                          fontSize: '17.5px',
                          fontWeight: '900',
                          color: isWon ? '#059669' : '#0F172A',
                          marginTop: '1px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          ₹{dealVal.toLocaleString('en-IN')}
                          {isWon && <span style={{ fontSize: '12px' }}>👑</span>}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '9px', color: '#94A3B8', fontWeight: '800' }}>TARGET CLOSE</div>
                        <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#1E293B', marginTop: '1px' }}>
                          📅 {targetDate ? new Date(targetDate).toLocaleDateString('en-GB') : 'Q4 FY2026'}
                        </div>
                      </div>
                    </div>

                    {/* Highly vibrant Progress Bar reflecting funnel stage */}
                    <div style={{
                      height: '6px',
                      backgroundColor: 'rgba(226, 232, 240, 0.65)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      marginTop: '8px'
                    }}>
                      <div style={{
                        height: '100%',
                        width: isWon ? '100%' : (d.stage || '').toLowerCase().includes('negotiat') ? '75%' : (d.stage || '').toLowerCase().includes('proposal') ? '50%' : '25%',
                        background: isWon
                          ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                          : (d.stage || '').toLowerCase().includes('negotiat')
                          ? 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)'
                          : (d.stage || '').toLowerCase().includes('proposal')
                          ? 'linear-gradient(90deg, #38BDF8 0%, #0284C7 100%)'
                          : 'linear-gradient(90deg, #C084FC 0%, #7C3AED 100%)',
                        borderRadius: '3px',
                        boxShadow: `0 0 8px ${theme.glow}`,
                        transition: 'width 0.6s ease'
                      }} />
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* 🌟 5. CLASSIC RESPONSIVE TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="table-responsive" style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '13px',
          border: '1.2px solid var(--border)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
        }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.2px solid var(--border)' }}>
                <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>DEAL CONTRACT</th>
                <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>CLIENT ACCOUNT</th>
                <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>CONTRACT VALUE</th>
                <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>PIPELINE STAGE</th>
                <th style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>TARGET CLOSE</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No deals logged in the pipeline yet.
                  </td>
                </tr>
              ) : (
                filteredDeals.map(d => {
                  const theme = getStageTheme(d.stage);
                  const dealVal = Number(d.value || d.amount) || 0;
                  const targetDate = d.closingDate || d.expectedCloseDate;

                  return (
                    <tr key={d._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: '800', fontSize: '12.5px', color: 'var(--text-dark)' }}>
                          {d.title}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                          ID: #{d._id?.slice(-6).toUpperCase()}
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12px', fontWeight: '800', color: '#1E293B' }}>
                        🏢 {d.customerName || d.customerId?.name || 'Enterprise Client'}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: '900', color: theme.color, fontSize: '13.5px' }}>
                        ₹{dealVal.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          background: theme.bg,
                          border: `1.2px solid ${theme.border}`,
                          color: theme.color,
                          fontSize: '10px',
                          fontWeight: '900',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: `0 1px 4px ${theme.glow}`
                        }}>
                          <span>{theme.icon}</span>
                          <span>{d.stage || 'Negotiation'}</span>
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>
                        📅 {targetDate ? new Date(targetDate).toLocaleDateString('en-GB') : 'Q4 FY2026'}
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
