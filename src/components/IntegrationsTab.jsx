import React, { useState } from 'react';

export default function IntegrationsTab() {
  const [integrations, setIntegrations] = useState([
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API',
      icon: '💬',
      category: 'Messaging',
      color: '#25D366',
      status: 'Connected',
      account: '+91 99000 11223',
      leadsSynced: 48,
      lastWebhook: '2 mins ago',
      description: 'Capture inbound customer chats directly as CRM Leads & Tickets with instant auto-response.'
    },
    {
      id: 'instagram',
      name: 'Instagram Direct & Lead Ads',
      icon: '📸',
      category: 'Social Media',
      color: '#E1306C',
      status: 'Connected',
      account: '@omnicrm_official',
      leadsSynced: 32,
      lastWebhook: '14 mins ago',
      description: 'Sync DM enquiries, story replies, and Instagram Lead Generation Forms into pipeline.'
    },
    {
      id: 'facebook',
      name: 'Facebook Lead Ads & Messenger',
      icon: '📘',
      category: 'Social Media',
      color: '#1877F2',
      status: 'Connected',
      account: 'OmniCRM Technologies Page',
      leadsSynced: 65,
      lastWebhook: '1 hour ago',
      description: 'Instant webhook ingestion from Facebook Instant Forms and Messenger chat conversations.'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Lead Gen Forms',
      icon: '💼',
      category: 'B2B Network',
      color: '#0A66C2',
      status: 'Connected',
      account: 'OmniCRM Enterprise Solutions',
      leadsSynced: 19,
      lastWebhook: '4 hours ago',
      description: 'High-ticket B2B enterprise leads automatically qualified and matched with executives.'
    },
    {
      id: 'website',
      name: 'Website Lead API & Webhooks',
      icon: '🌐',
      category: 'Web Inbound',
      color: '#4338CA',
      status: 'Connected',
      account: 'https://omnicrm.app/api/v1/inbound',
      leadsSynced: 124,
      lastWebhook: 'Just now',
      description: 'Direct REST webhook receiving project quotes from customer web portals and landing pages.'
    },
    {
      id: 'google_ads',
      name: 'Google Ads Inbound Extensions',
      icon: '🔍',
      category: 'Paid Acquisition',
      color: '#EA4335',
      status: 'Ready',
      account: 'CID: 481-992-0012',
      leadsSynced: 28,
      lastWebhook: 'Yesterday',
      description: 'Call extensions and search lead form submission directly linked to dedicated reps.'
    }
  ]);

  const [testingId, setTestingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const handleTestConnection = (id) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
      alert(`Webhook Test Ping Successful: Server returned HTTP 200 OK for ${id.toUpperCase()}`);
    }, 1200);
  };

  const handleToggle = (id) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'Connected' ? 'Disconnected' : 'Connected';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  // Metrics
  const connectedCount = integrations.filter(i => i.status === 'Connected').length;
  const disconnectedCount = integrations.filter(i => i.status !== 'Connected').length;
  const totalLeadsSynced = integrations.reduce((acc, curr) => acc + (curr.leadsSynced || 0), 0);

  // Deep multi-field filtering
  const filteredIntegrations = integrations.filter(item => {
    const isConn = item.status === 'Connected';
    if (filterStatus === 'Connected' && !isConn) return false;
    if (filterStatus === 'Disconnected' && isConn) return false;

    if (search) {
      const q = search.trim().toLowerCase();
      const name = (item.name || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      const acc = (item.account || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      return name.includes(q) || cat.includes(q) || acc.includes(q) || desc.includes(q);
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      
      {/* 🌟 CSS Keyframe Animations & Micro-interactions */}
      <style>{`
        @keyframes pulseIntegAmbient {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 0.85; }
        }
        @keyframes subtleIntegFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerIntegAccent {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .integration-hero-banner {
          animation: subtleIntegFadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          width: 100%;
          box-sizing: border-box;
        }
        .integration-metric-card {
          animation: subtleIntegFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) backwards;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
        }
        .integration-metric-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08) !important;
          border-color: #CBD5E1 !important;
        }
        .integration-bento-card {
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
        }
        .integration-bento-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08) !important;
          border-color: #CBD5E1 !important;
        }
        .integration-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          width: 100%;
          box-sizing: border-box;
        }
        .integration-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 14px;
          width: 100%;
          box-sizing: border-box;
        }
        .integration-bento-card {
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .integration-bento-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12) !important;
        }
        .integ-btn-glow {
          transition: all 0.2s ease !important;
        }
        .integ-btn-glow:hover {
          transform: translateY(-1px) scale(1.02) !important;
          opacity: 0.95 !important;
        }

        /* Mobile & Tablet Responsive */
        @media (max-width: 900px) {
          .integration-metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
        }
        @media (max-width: 600px) {
          .integration-hero-banner {
            padding: 14px 16px !important;
          }
          .integration-hero-title {
            font-size: 18px !important;
          }
          .integration-metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }
          .integration-cards-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .integration-metric-card {
            padding: 10px 12px !important;
            min-height: 80px !important;
          }
          .integration-metric-val {
            font-size: 18px !important;
          }
          .integration-metric-icon {
            width: 32px !important;
            height: 32px !important;
            font-size: 15px !important;
          }
        }
      `}</style>

      {/* 🌟 1. Compact Sleek Multi-Channel Billboard Banner */}
      <div 
        className="integration-hero-banner"
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
        {/* Shimmer Accent Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3.5px',
          background: 'linear-gradient(90deg, #4338CA, #6366F1, #818CF8, #4338CA)',
          backgroundSize: '200% 100%',
          animation: 'shimmerIntegAccent 3.5s linear infinite'
        }} />

        {/* Glow ambient background sphere */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129, 140, 248, 0.3) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
          animation: 'pulseIntegAmbient 5s ease-in-out infinite'
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.12)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '10.5px',
            fontWeight: '900',
            letterSpacing: '0.6px',
            marginBottom: '6px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            color: '#E0E7FF'
          }}>
            <span>🔌</span> OMNICHANNEL PLATFORM INTEGRATIONS
          </div>
          <h2 className="integration-hero-title" style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.4px', color: '#FFFFFF' }}>
            Multi-Source Webhook & Lead Connectors
          </h2>
          <p style={{ fontSize: '12px', color: '#C7D2FE', margin: '4px 0 0 0', fontWeight: '500', maxWidth: '580px' }}>
            Connect WhatsApp Business, Meta Ads, Instagram, LinkedIn & Website Webhooks for zero-delay lead sync.
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            background: 'rgba(236, 253, 245, 0.15)',
            border: '1px solid rgba(167, 243, 208, 0.35)',
            borderRadius: '12px',
            padding: '8px 16px',
            textAlign: 'center',
            backdropFilter: 'blur(8px)'
          }}>
            <span style={{ fontSize: '10px', color: '#A7F3D0', fontWeight: '800', textTransform: 'uppercase', display: 'block', letterSpacing: '0.4px' }}>Active Connectors</span>
            <span style={{ fontSize: '20px', fontWeight: '900', color: '#FFFFFF' }}>
              {connectedCount} <span style={{ fontSize: '13px', color: '#A7F3D0' }}>/ {integrations.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 🌟 2. Spacious 4-Col KPI Metrics */}
      <div className="integration-metrics-grid">
        
        {/* Metric 1 */}
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
            ⚡
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Connected Channels
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#065F46', lineHeight: '1' }}>
                {connectedCount}
              </div>
              <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: '800', backgroundColor: '#D1FAE5', padding: '2px 7px', borderRadius: '6px' }}>
                Live Stream
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
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
            📥
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Total Leads Ingested
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#1E1B4B', lineHeight: '1' }}>
                {totalLeadsSynced}
              </div>
              <span style={{ fontSize: '10.5px', color: '#4338CA', fontWeight: '800', backgroundColor: '#E0E7FF', padding: '2px 7px', borderRadius: '6px' }}>
                Synced
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
            ⚠️
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#BE123C', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Inactive / Paused
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#881337', lineHeight: '1' }}>
                {disconnectedCount}
              </div>
              <span style={{ fontSize: '10.5px', color: '#BE123C', fontWeight: '800', backgroundColor: '#FFE4E6', padding: '2px 7px', borderRadius: '6px' }}>
                Requires Setup
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
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
              Webhook Engine
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#0C4A6E', lineHeight: '1' }}>
                Zero-Delay
              </div>
              <span style={{ fontSize: '10.5px', color: '#0284C7', fontWeight: '800', backgroundColor: '#E0F2FE', padding: '2px 7px', borderRadius: '6px' }}>
                HTTP 200
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
        border: '1.5px solid #CBD5E1',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
      }}>
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'All', label: 'All Connectors', count: integrations.length, color: '#0F172A', bg: '#F8FAFC' },
            { id: 'Connected', label: 'Live Connected', count: connectedCount, color: '#059669', bg: '#ECFDF5' },
            { id: 'Disconnected', label: 'Disconnected / Ready', count: disconnectedCount, color: '#DC2626', bg: '#FEF2F2' }
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
            background: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.3)'
          }}>
            🔍
          </div>
          <input
            type="text"
            placeholder="Search by connector name, channel, target account..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px 11px 48px',
              borderRadius: '12px',
              border: '1.5px solid #94A3B8',
              backgroundColor: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: '600',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0F172A';
              e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.14)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#94A3B8';
              e.target.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.06)';
            }}
          />
        </div>
      </div>

      {/* 🌟 4. Integration Bento Cards Grid */}
      <div className="integration-cards-grid">
        {filteredIntegrations.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '36px 14px',
            textAlign: 'center',
            border: '2px dashed #CBD5E1',
            color: '#64748B'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔌</div>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', margin: 0 }}>
              No Connectors Match Your Search
            </h3>
            <p style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '3px' }}>
              Try searching with another keyword like 'WhatsApp', 'Instagram', 'Meta', or 'API'.
            </p>
          </div>
        ) : (
          filteredIntegrations.map((integ, idx) => {
            const isConnected = integ.status === 'Connected';
            const isTesting = testingId === integ.id;

            return (
              <div
                key={integ.id}
                className="integration-bento-card"
                style={{
                  background: isConnected 
                    ? 'linear-gradient(180deg, #FFFFFF 0%, #FAFCFF 100%)' 
                    : 'linear-gradient(180deg, #FFFFFF 0%, #FFF5F5 100%)',
                  borderRadius: '18px',
                  border: isConnected ? `1.5px solid ${integ.color}35` : '1.5px solid #FDA4AF',
                  padding: '18px 20px',
                  boxShadow: isConnected 
                    ? `0 6px 20px rgba(15, 23, 42, 0.05), 0 0 0 1px ${integ.color}15`
                    : '0 6px 20px rgba(239, 68, 68, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `subtleIntegFadeUp 0.4s ease-out ${idx * 0.05}s both`
                }}
              >
                {/* Top Colorful Accent Line with Dynamic Glow */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: isConnected 
                    ? `linear-gradient(90deg, ${integ.color}, #FFFFFF 95%)`
                    : 'linear-gradient(90deg, #EF4444, #FCA5A5)',
                  boxShadow: isConnected ? `0 2px 10px ${integ.color}60` : 'none'
                }} />

                <div>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '14px',
                        background: `linear-gradient(135deg, ${integ.color}20 0%, ${integ.color}08 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        border: `1.5px solid ${integ.color}50`,
                        boxShadow: `0 6px 14px ${integ.color}25`,
                        flexShrink: 0
                      }}>
                        {integ.icon}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.2px' }}>
                          {integ.name}
                        </h4>
                        <span style={{ 
                          fontSize: '11px', 
                          color: integ.color, 
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          letterSpacing: '0.4px',
                          display: 'inline-block',
                          marginTop: '2px'
                        }}>
                          {integ.category}
                        </span>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '10px',
                      fontWeight: '900',
                      color: isConnected ? '#047857' : '#B91C1C',
                      background: isConnected ? '#ECFDF5' : '#FEF2F2',
                      border: isConnected ? '1.2px solid #6EE7B7' : '1.2px solid #FCA5A5',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: isConnected ? '0 2px 6px rgba(16, 185, 129, 0.15)' : 'none'
                    }}>
                      <span style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        backgroundColor: isConnected ? '#10B981' : '#EF4444',
                        boxShadow: isConnected ? '0 0 6px #10B981' : 'none'
                      }} />
                      {isConnected ? 'LIVE CONNECTED' : 'PAUSED / SETUP'}
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#475569', lineHeight: '1.5', fontWeight: '500' }}>
                    {integ.description}
                  </p>

                  {/* Account Telemetry Container */}
                  <div style={{
                    background: isConnected ? '#F8FAFC' : '#FFF7F7',
                    borderRadius: '12px',
                    padding: '11px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11.5px',
                    marginTop: '14px',
                    border: isConnected ? '1px solid #E2E8F0' : '1px solid #FECACA'
                  }}>
                    <div style={{ minWidth: 0, flex: 1, marginRight: '10px' }}>
                      <span style={{ color: '#94A3B8', display: 'block', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px' }}>TARGET ACCOUNT</span>
                      <strong style={{ color: '#0F172A', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap', marginTop: '2px' }}>
                        {integ.account}
                      </strong>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ color: '#94A3B8', display: 'block', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px' }}>LEADS SYNCED</span>
                      <strong style={{ color: integ.color, fontWeight: '900', fontSize: '14px', display: 'block', marginTop: '1px' }}>
                        {integ.leadsSynced} Leads
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid #F1F5F9',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94A3B8' }} />
                    <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                      Ping: {integ.lastWebhook}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="integ-btn-glow"
                      onClick={() => handleTestConnection(integ.id)}
                      disabled={isTesting || !isConnected}
                      style={{
                        background: '#FFFFFF',
                        border: '1.2px solid #CBD5E1',
                        color: '#1E293B',
                        padding: '7px 14px',
                        borderRadius: '9px',
                        fontSize: '11px',
                        fontWeight: '800',
                        cursor: isConnected ? 'pointer' : 'not-allowed',
                        opacity: isConnected ? 1 : 0.45,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {isTesting ? 'Testing...' : '⚡ Test Webhook'}
                    </button>

                    <button
                      className="integ-btn-glow"
                      onClick={() => handleToggle(integ.id)}
                      style={{
                        background: isConnected 
                          ? 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)' 
                          : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        border: isConnected ? '1.2px solid #FCA5A5' : 'none',
                        color: isConnected ? '#DC2626' : '#FFFFFF',
                        padding: '7px 14px',
                        borderRadius: '9px',
                        fontSize: '11px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        boxShadow: isConnected 
                          ? 'none' 
                          : '0 3px 10px rgba(16, 185, 129, 0.35)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {isConnected ? 'Disconnect' : '✓ Connect'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
