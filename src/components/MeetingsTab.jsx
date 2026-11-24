import React, { useState } from 'react';

export default function MeetingsTab({ meetings = [], onUpdateStatus }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(null);

  const counts = {
    all: meetings.length,
    scheduled: meetings.filter(m => (m.status || 'Scheduled').toLowerCase().includes('schedule')).length,
    completed: meetings.filter(m => (m.status || '').toLowerCase().includes('complete')).length,
    cancelled: meetings.filter(m => (m.status || '').toLowerCase().includes('cancel')).length
  };

  const filteredMeetings = meetings.filter(m => {
    if (filter !== 'All' && (m.status || 'Scheduled').toLowerCase() !== filter.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const client = (m.customerId?.name || '').toLowerCase();
      const sub = (m.subject || '').toLowerCase();
      const type = (m.meetingType || '').toLowerCase();
      return client.includes(q) || sub.includes(q) || type.includes(q);
    }
    return true;
  });

  const getStatusBadge = (status = 'Scheduled') => {
    const s = status.toLowerCase();
    if (s.includes('complete')) {
      return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', text: 'Completed', icon: '✓' };
    }
    if (s.includes('cancel')) {
      return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', text: 'Cancelled', icon: '✕' };
    }
    return { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE', text: 'Scheduled', icon: '📅' };
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!onUpdateStatus) return;
    try {
      setStatusUpdating(id);
      await onUpdateStatus(id, newStatus);
    } finally {
      setStatusUpdating(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* 🔮 Executive Meetings Tab Animations & Keyframes */}
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
        @keyframes pulseMeetBanner {
          0%, 100% {
            box-shadow: 0 8px 30px rgba(3, 105, 161, 0.28), 0 0 20px rgba(14, 165, 233, 0.2);
          }
          50% {
            box-shadow: 0 14px 38px rgba(3, 105, 161, 0.4), 0 0 30px rgba(56, 189, 248, 0.35);
          }
        }
        .meetings-hero-banner {
          animation: subtleFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards, pulseMeetBanner 6s ease-in-out infinite;
        }
        .meeting-bento-card {
          animation: subtleFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .meeting-bento-card:hover {
          transform: translateY(-4px) scale(1.015);
        }
      `}</style>

      {/* 🌟 1. Executive Sapphire/Cyan Billboard Banner */}
      <div 
        className="meetings-hero-banner"
        style={{
          background: 'linear-gradient(135deg, #0C4A6E 0%, #0369A1 40%, #0284C7 75%, #0EA5E9 100%)',
          borderRadius: '16px',
          padding: '18px 22px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          border: '1.5px solid rgba(186, 230, 253, 0.4)',
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
          background: 'linear-gradient(90deg, #0EA5E9 0%, #38BDF8 25%, #10B981 50%, #6366F1 75%, #EC4899 100%)'
        }} />

        {/* Ambient Glow Orbs */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '20%', width: '130px', height: '130px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

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
            <span>📅</span> SCHEDULED CONSULTATIONS & MEETS
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px', color: '#FFFFFF' }}>
            Executive Appointments Desk
          </h2>
          <p style={{ fontSize: '12px', color: '#E0F2FE', margin: '3px 0 0 0', fontWeight: '500', opacity: 0.95 }}>
            Track client calls, online demonstrations, and physical meetings scheduled across all accounts
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
            background: 'rgba(255,255,255,0.16)',
            backdropFilter: 'blur(10px)',
            borderRadius: '14px',
            padding: '10px 18px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
          }}>
            <span style={{ fontSize: '10px', color: '#BAE6FD', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block' }}>Total Meetings</span>
            <span style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF' }}>{meetings.length}</span>
          </div>
        </div>
      </div>

      {/* 🌟 2. Telemetry Intelligence Metric Cards (Spacious, Clear & Animated Bento) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {[
          { label: 'All Consultations', val: counts.all, color: '#0284C7', bg: '#F0F9FF', icon: '📅', border: '#BAE6FD', sub: 'Total Records' },
          { label: 'Scheduled / Upcoming', val: counts.scheduled, color: '#2563EB', bg: '#EFF6FF', icon: '⏳', border: '#BFDBFE', sub: 'Action Required' },
          { label: 'Completed Meets', val: counts.completed, color: '#059669', bg: '#ECFDF5', icon: '✓', border: '#A7F3D0', sub: 'Successfully Closed' },
          { label: 'Cancelled / Rescheduled', val: counts.cancelled, color: '#DC2626', bg: '#FEF2F2', icon: '✕', border: '#FECACA', sub: 'Need Follow-up' }
        ].map((card, idx) => (
          <div
            key={idx}
            className="meeting-bento-card"
            style={{
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: `1.5px solid ${card.border}`,
              padding: '14px 16px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '95px',
              cursor: 'default',
              animationDelay: `${idx * 0.05}s`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = card.color;
              e.currentTarget.style.boxShadow = `0 10px 24px ${card.color}22`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = card.border;
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.03)';
            }}
          >
            {/* Ambient Card Accent Stripe */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3.5px',
              background: card.color
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: card.bg,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                flexShrink: 0,
                boxShadow: `0 2px 6px ${card.color}20`
              }}>
                {card.icon}
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                color: card.color,
                backgroundColor: card.bg,
                padding: '2px 7px',
                borderRadius: '6px',
                border: `1px solid ${card.border}`,
                whiteSpace: 'nowrap'
              }}>
                {card.sub}
              </span>
            </div>
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {card.label}
              </div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: card.color, lineHeight: '1.2' }}>
                {card.val}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🌟 3. Colorful & Modern Search & Filter Bar */}
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
        {/* Colorful & Attractive Search Bar */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '420px' }}>
          <div style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
          }}>
            🔍
          </div>
          <input
            type="text"
            placeholder="Search meetings by client name, subject, or type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 40px',
              borderRadius: '10px',
              border: '1.5px solid #BAE6FD',
              backgroundColor: '#FFFFFF',
              fontSize: '12px',
              fontWeight: '600',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.06)',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0284C7';
              e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#BAE6FD';
              e.target.style.boxShadow = '0 2px 6px rgba(2, 132, 199, 0.06)';
            }}
          />
        </div>

        {/* Filter Pills with Counts */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'All', label: 'All', count: counts.all, color: '#0284C7', bg: '#E0F2FE' },
            { id: 'Scheduled', label: 'Scheduled', count: counts.scheduled, color: '#2563EB', bg: '#EFF6FF' },
            { id: 'Completed', label: 'Completed', count: counts.completed, color: '#059669', bg: '#ECFDF5' },
            { id: 'Cancelled', label: 'Cancelled', count: counts.cancelled, color: '#DC2626', bg: '#FEF2F2' }
          ].map(f => {
            const isSelected = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: isSelected ? `1.5px solid ${f.color}` : '1.2px solid #E2E8F0',
                  background: isSelected ? f.color : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? `0 2px 8px ${f.color}35` : 'none'
                }}
              >
                <span>{f.label}</span>
                <span style={{
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : f.bg,
                  color: isSelected ? '#FFFFFF' : f.color,
                  fontSize: '9.5px',
                  fontWeight: '900',
                  padding: '1px 6px',
                  borderRadius: '6px'
                }}>
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌟 3. Bento Grid of Meetings */}
      {filteredMeetings.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '12px'
        }}>
          {filteredMeetings.map(m => {
            const badge = getStatusBadge(m.status);
            const isUpdating = statusUpdating === m._id;

            return (
              <div
                key={m._id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1.2px solid #E2E8F0',
                  padding: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  position: 'relative',
                  borderTop: '3.5px solid #0284C7'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      color: '#0284C7',
                      background: '#E0F2FE',
                      padding: '2px 7px',
                      borderRadius: '6px'
                    }}>
                      {m.meetingType || 'Google Meet / Zoom'}
                    </span>
                    <h4 style={{ margin: '6px 0 0 0', fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                      {m.subject || 'Consultation Discussion'}
                    </h4>
                  </div>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: '800',
                    color: badge.color,
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                    padding: '2px 8px',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap'
                  }}>
                    {badge.icon} {badge.text}
                  </span>
                </div>

                {/* Details */}
                <div style={{
                  background: '#F8FAFC',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  fontSize: '11.5px',
                  color: '#475569'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>👤</span>
                    <strong style={{ color: '#0F172A' }}>Client:</strong>
                    <span>{m.customerId?.name || 'Valued Client'}</span>
                    {m.customerId?.company && <span style={{ color: '#64748B' }}>({m.customerId.company})</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📅</span>
                    <strong style={{ color: '#0F172A' }}>Date & Slot:</strong>
                    <span style={{ color: '#0284C7', fontWeight: '700' }}>
                      {m.preferredDate || 'TBD'} • {m.timeSlot || 'Anytime'}
                    </span>
                  </div>
                  {m.notes && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '2px' }}>
                      <span>📝</span>
                      <span style={{ fontStyle: 'italic', color: '#64748B' }}>"{m.notes}"</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '6px',
                  borderTop: '1px solid #F1F5F9'
                }}>
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>
                    Created: {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recent'}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {m.status !== 'Completed' && (
                      <button
                        onClick={() => handleStatusChange(m._id, 'Completed')}
                        disabled={isUpdating}
                        style={{
                          background: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#059669',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Mark Done
                      </button>
                    )}
                    {m.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleStatusChange(m._id, 'Cancelled')}
                        disabled={isUpdating}
                        style={{
                          background: '#FEF2F2',
                          border: '1px solid #FECACA',
                          color: '#DC2626',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        ✕ Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div 
          className="meeting-bento-card"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
            borderRadius: '20px',
            border: '1.5px solid #E2E8F0',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top subtle blue accent */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '30%',
            right: '30%',
            height: '3px',
            background: 'linear-gradient(90deg, transparent 0%, #38BDF8 50%, transparent 100%)'
          }} />
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
            color: '#0284C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            margin: '0 auto 14px auto',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.2)'
          }}>
            📅
          </div>
          <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.3px' }}>
            No Meetings Found
          </h4>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748B', maxWidth: '420px', marginInline: 'auto', lineHeight: '1.4' }}>
            When clients book online consultations, product demonstrations, or meetings from the mobile app, they will automatically appear here live.
          </p>
        </div>
      )}
    </div>
  );
}
