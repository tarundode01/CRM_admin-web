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
      
      {/* 🌟 CSS Keyframe Animations */}
      <style>{`
        @keyframes pulseIntegAmbient {
          0% { transform: scale(0.98); opacity: 0.8; }
          50% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(0.98); opacity: 0.8; }
        }
        @keyframes subtleIntegFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .integration-bento-card {
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .integration-bento-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08) !important;
          border-color: #94A3B8 !important;
        }
      `}</style>

      {/* 🌟 1. Compact Sleek Multi-Channel Billboard Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
        borderRadius: '16px',
        padding: '18px 24px',
        color: '#FFFFFF',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.25)',
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
          background: 'radial-gradient(circle, rgba(148, 163, 184, 0.35) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
          animation: 'pulseIntegAmbient 5s ease-in-out infinite'
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
            <span>🔌</span> OMNICHANNEL PLATFORM INTEGRATIONS
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.4px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            Multi-Source Webhook & Lead Connectors
          </h2>
          <p style={{ fontSize: '12.5px', color: '#CBD5E1', margin: '4px 0 0 0', fontWeight: '500', maxWidth: '580px' }}>
            Connect WhatsApp Business, Meta Ads, Instagram, LinkedIn & Website Webhooks for zero-delay lead sync
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
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '12px',
            padding: '9px 18px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
          }}>
            <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase', display: 'block', letterSpacing: '0.4px' }}>Active Connectors</span>
            <span style={{ fontSize: '22px', fontWeight: '900', color: '#34D399' }}>
              {connectedCount} / {integrations.length}
            </span>
          </div>
        </div>
      </div>

      {/* 🌟 2. Spacious 4-Col KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '14px'
      }}>
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
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: isConnected ? '1.5px solid #E2E8F0' : '1.5px solid #FECACA',
                  padding: '16px',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: `subtleIntegFadeUp 0.4s ease-out ${idx * 0.05}s both`
                }}
              >
                {/* Top Colorful Accent Line */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: isConnected ? integ.color : '#94A3B8'
                }} />

                <div>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginTop: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: `${integ.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        border: `1.5px solid ${integ.color}40`,
                        boxShadow: `0 4px 10px ${integ.color}20`
                      }}>
                        {integ.icon}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: '900', color: '#0F172A' }}>
                          {integ.name}
                        </h4>
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>
                          {integ.category}
                        </span>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '10px',
                      fontWeight: '900',
                      color: isConnected ? '#059669' : '#DC2626',
                      background: isConnected ? '#ECFDF5' : '#FEF2F2',
                      border: isConnected ? '1px solid #A7F3D0' : '1px solid #FECACA',
                      padding: '3px 8px',
                      borderRadius: '10px',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: isConnected ? '#10B981' : '#EF4444' }} />
                      {isConnected ? 'LIVE CONNECTED' : 'DISABLED'}
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#475569', lineHeight: '1.45' }}>
                    {integ.description}
                  </p>

                  {/* Account Telemetry */}
                  <div style={{
                    background: '#F8FAFC',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11.5px',
                    marginTop: '12px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ minWidth: 0, flex: 1, marginRight: '10px' }}>
                      <span style={{ color: '#94A3B8', display: 'block', fontSize: '10px', fontWeight: '800', letterSpacing: '0.4px' }}>TARGET ACCOUNT</span>
                      <strong style={{ color: '#0F172A', fontSize: '11.5px', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}>
                        {integ.account}
                      </strong>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ color: '#94A3B8', display: 'block', fontSize: '10px', fontWeight: '800', letterSpacing: '0.4px' }}>LEADS SYNCED</span>
                      <strong style={{ color: integ.color, fontWeight: '900', fontSize: '13px' }}>
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
                  paddingTop: '10px',
                  borderTop: '1px solid #F1F5F9'
                }}>
                  <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '700' }}>
                    Ping: {integ.lastWebhook}
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleTestConnection(integ.id)}
                      disabled={isTesting || !isConnected}
                      style={{
                        background: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        color: '#334155',
                        padding: '6px 12px',
                        borderRadius: '7px',
                        fontSize: '11px',
                        fontWeight: '800',
                        cursor: isConnected ? 'pointer' : 'not-allowed',
                        opacity: isConnected ? 1 : 0.5,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isTesting ? 'Testing...' : '⚡ Test Webhook'}
                    </button>

                    <button
                      onClick={() => handleToggle(integ.id)}
                      style={{
                        background: isConnected ? '#FEF2F2' : '#ECFDF5',
                        border: isConnected ? '1.2px solid #FECACA' : '1.2px solid #A7F3D0',
                        color: isConnected ? '#DC2626' : '#059669',
                        padding: '6px 12px',
                        borderRadius: '7px',
                        fontSize: '11px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isConnected ? 'Disconnect' : 'Connect'}
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
