import React, { useState } from 'react';

export default function Header({ 
  user, 
  companyInfo,
  onRefresh, 
  refreshing, 
  onLogout, 
  toggleSidebar,
  notifications = [],
  unreadNotifsCount = 0,
  onMarkNotificationRead,
  onSelectTab
}) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all', 'unread', 'leads'

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === 'unread') return !n.read;
    if (notifFilter === 'leads') return n.type === 'enquiry';
    if (notifFilter === 'approvals') return n.type === 'approval';
    return true;
  });

  return (
    <header className="header-container">
      {/* Left Section: Brand & Hamburger */}
      <div className="header-brand-section">
        <button
          onClick={toggleSidebar}
          className="header-hamburger-btn"
          title="Toggle Navigation Menu"
        >
          ☰
        </button>

        {/* Diamond Glowing Brand Icon */}
        <div className="header-brand-logo">
          💎
        </div>

        <div className="header-brand-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="header-title">
              {companyInfo?.name || user?.company || 'OmniCRM Enterprise'}
            </span>
            <div className="header-live-badge">
              <span className="pulse-beacon" style={{ width: '6px', height: '6px' }} />
              <span className="header-live-text">
                LIVE ATLAS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls: Notification Bell, Database Sync, User Profile & Logout */}
      <div className="header-controls-section" style={{ position: 'relative' }}>
        
        {/* 🔔 Premium Real-Time Notification Bell & Drawer */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifDropdown(prev => !prev)}
            title="Real-time Client & Employee Alerts"
            className="header-alert-btn"
            style={{
              position: 'relative',
              background: showNotifDropdown ? 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)' : '#FFFFFF',
              border: unreadNotifsCount > 0 ? '1.5px solid #F59E0B' : '1px solid #CBD5E1',
              borderRadius: '12px',
              padding: '7px 11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: unreadNotifsCount > 0 ? '0 3px 12px rgba(245, 158, 11, 0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <span style={{ fontSize: '15px' }}>🔔</span>
            <span className="header-alert-text" style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B' }}>Alerts</span>
            {unreadNotifsCount > 0 && (
              <span style={{
                background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: '900',
                padding: '1px 5px',
                borderRadius: '10px',
                lineHeight: '13px',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)'
              }}>
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* 🌟 ULTRA ATTRACTIVE & PROFESSIONAL NOTIFICATIONS PANEL */}
          {showNotifDropdown && (
            <div style={{
              position: 'absolute',
              top: '50px',
              right: '0',
              width: '390px',
              maxWidth: '92vw',
              background: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.22)',
              border: '1.5px solid #CBD5E1',
              overflow: 'hidden',
              zIndex: 99999,
              animation: 'menuSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              {/* Top Banner Header */}
              <div style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#FFFFFF'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>⚡</span>
                    <span style={{ fontWeight: '900', fontSize: '14px', letterSpacing: '-0.2px' }}>
                      Real-Time Activity Alerts
                    </span>
                    {unreadNotifsCount > 0 && (
                      <span style={{
                        background: '#EF4444',
                        color: '#FFF',
                        fontSize: '9.5px',
                        fontWeight: '900',
                        padding: '1px 7px',
                        borderRadius: '8px'
                      }}>
                        {unreadNotifsCount} Unread
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '3px' }}>
                    Customer requirements, lead dispatches & system alerts
                  </div>
                </div>

                {unreadNotifsCount > 0 && onMarkNotificationRead && (
                  <button
                    onClick={() => onMarkNotificationRead('all')}
                    style={{
                      background: 'rgba(255,255,255,0.18)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      color: '#FDE68A',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '4px 9px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Mark All Read
                  </button>
                )}
              </div>

              {/* Filter Tabs Inside Notification Box */}
              <div style={{
                display: 'flex',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0'
              }}>
                {[
                  { id: 'all', label: `All (${notifications.length})` },
                  { id: 'unread', label: `Unread (${unreadNotifsCount})` },
                  { id: 'approvals', label: `Approvals (${notifications.filter(n => n.type === 'approval').length})` },
                  { id: 'leads', label: `Lead Alerts` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setNotifFilter(tab.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '800',
                      backgroundColor: notifFilter === tab.id ? '#4338CA' : '#FFFFFF',
                      color: notifFilter === tab.id ? '#FFFFFF' : '#475569',
                      border: notifFilter === tab.id ? '1px solid #4338CA' : '1px solid #CBD5E1',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Notification Items List */}
              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {filteredNotifications && filteredNotifications.length > 0 ? (
                  filteredNotifications.map((n) => {
                    const isNew = !n.read;
                    const getIconData = () => {
                      if (n.type === 'approval') return { icon: '👤', bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' };
                      if (n.type === 'enquiry') return { icon: '🎯', bg: '#DCFCE7', color: '#166534', border: '#86EFAC' };
                      if (n.type === 'chat' || n.type === 'ticket') return { icon: '💬', bg: '#E0F2FE', color: '#075985', border: '#7DD3FC' };
                      if (n.type === 'quotation') return { icon: '📜', bg: '#F5F3FF', color: '#5B21B6', border: '#DDD6FE' };
                      if (n.type === 'meeting') return { icon: '📅', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' };
                      return { icon: '🔔', bg: '#F1F5F9', color: '#334155', border: '#CBD5E1' };
                    };
                    const iconStyle = getIconData();

                    return (
                      <div
                        key={n._id}
                        onClick={() => {
                          if (onMarkNotificationRead && !n.read) {
                            onMarkNotificationRead(n._id);
                          }
                          if (onSelectTab) {
                            if (n.type === 'approval') onSelectTab('approvals');
                            else if (n.type === 'chat' || n.type === 'ticket') onSelectTab('support');
                            else if (n.type === 'enquiry') onSelectTab('leads');
                            else if (n.type === 'quotation') onSelectTab('deals');
                          }
                          setShowNotifDropdown(false);
                        }}
                        style={{
                          padding: '12px 14px',
                          borderBottom: '1px solid #F1F5F9',
                          background: isNew ? 'linear-gradient(90deg, #FFFBEB 0%, #FFFFFF 100%)' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          position: 'relative'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = isNew ? '#FFFBEB' : '#FFFFFF'}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: iconStyle.bg,
                          color: iconStyle.color,
                          border: `1px solid ${iconStyle.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          flexShrink: 0
                        }}>
                          {iconStyle.icon}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                            <p style={{
                              margin: 0,
                              fontSize: '12.5px',
                              fontWeight: isNew ? '900' : '700',
                              color: isNew ? '#0F172A' : '#334155',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {n.title}
                            </p>
                            {isNew && (
                              <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#2563EB',
                                boxShadow: '0 0 6px #2563EB',
                                flexShrink: 0
                              }} />
                            )}
                          </div>
                          <p style={{
                            margin: '3px 0 0 0',
                            fontSize: '11.5px',
                            color: '#64748B',
                            lineHeight: '1.4',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {n.message}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '600' }}>
                              {n.senderName ? `${n.senderName} • ` : ''}{n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Just now'}
                            </span>
                            <span style={{ fontSize: '10px', color: '#4338CA', fontWeight: '800' }}>
                              View →
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '36px 16px', textAlign: 'center', color: '#94A3B8' }}>
                    <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🎉</span>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#1E293B' }}>All caught up!</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748B' }}>No unread alerts in this category</p>
                  </div>
                )}
              </div>

              {/* Box Footer */}
              <div style={{
                backgroundColor: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                padding: '8px 14px',
                textAlign: 'center'
              }}>
                <button
                  onClick={() => setShowNotifDropdown(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Close Panel ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Real-time sync button */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="header-sync-btn"
          title="Sync with Live Database"
        >
          <span style={{
            display: 'inline-block',
            animation: refreshing ? 'spin 1s linear infinite' : 'none',
            fontSize: '14px'
          }}>
            🔄
          </span>
          <span className="header-sync-text">
            {refreshing ? 'Syncing...' : 'Sync Atlas'}
          </span>
        </button>

        {/* Super Admin User Profile Pill (Luxury Executive Badge) */}
        <div className="header-user-pill-container" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF8 100%)',
          border: '1.5px solid #F5E4C3',
          padding: '4px 12px 4px 6px',
          borderRadius: '30px',
          boxShadow: '0 2px 8px rgba(120, 53, 15, 0.08)'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
            color: '#F5E4C3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '900',
            boxShadow: '0 2px 6px rgba(30, 27, 75, 0.25)',
            border: '1px solid #F5E4C3',
            flexShrink: 0
          }}>
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="header-user-labels" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '900', color: '#1E1B4B', lineHeight: '1.2' }}>
              {user?.name || 'Administrator'}
            </span>
            <span style={{
              fontSize: '9px',
              fontWeight: '900',
              color: '#B45309',
              letterSpacing: '0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <span>👑</span>
              <span>SUPER ADMIN</span>
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="header-logout-btn"
          title="Secure Exit / Logout"
        >
          <span>🚪</span>
          <span className="header-logout-text">Exit</span>
        </button>

      </div>
    </header>
  );
}
