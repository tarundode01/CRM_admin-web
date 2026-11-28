import React, { useState } from 'react';

const MENU_SECTIONS = [
  {
    id: 'overview',
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', themeColor: '#4338CA', lightBg: '#EEF2FF', border: '#C7D2FE', text: '#312E81', tag: 'HQ', keywords: 'home overview kpi telemetry revenue' },
      { id: 'analytics', label: 'Analytics & Reports', icon: '📈', themeColor: '#0284C7', lightBg: '#F0F9FF', border: '#BAE6FD', text: '#0369A1', tag: 'Live', keywords: 'charts reports conversion performance' }
    ]
  },
  {
    id: 'sales',
    title: 'SALES & PIPELINE',
    items: [
      { id: 'leads', label: 'Leads', icon: '🎯', themeColor: '#059669', lightBg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', countKey: 'unreadLeads', alertBadge: true, liveBeacon: true, tag: 'Inbound', keywords: 'prospects enquiries pipeline sales' },
      { id: 'deals', label: 'Deals & Pipeline', icon: '💼', themeColor: '#D97706', lightBg: '#FFFBEB', border: '#FDE68A', text: '#92400E', countKey: 'deals', tag: 'Revenue', keywords: 'won lost value closed pipeline' },
      { id: 'quotations', label: 'Quotations', icon: '📜', themeColor: '#0D9488', lightBg: '#F0FDFA', border: '#99F6E4', text: '#115E59', countKey: 'quotations', tag: 'Quotes', keywords: 'proposals invoices estimates prices' },
      { id: 'meetings', label: 'Follow-ups & Meetings', icon: '📅', themeColor: '#2563EB', lightBg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', countKey: 'meetings', tag: 'Calendar', keywords: 'calendar appointments schedule calls' }
    ]
  },
  {
    id: 'people',
    title: 'PEOPLE & CLIENTS',
    items: [
      { id: 'customers', label: 'Customers', icon: '🏢', themeColor: '#0F766E', lightBg: '#F0FDFA', border: '#99F6E4', text: '#134E4A', countKey: 'customers', tag: 'Accounts', keywords: 'clients companies buyers profiles' },
      { id: 'employees', label: 'Team Members', icon: '👥', themeColor: '#7C3AED', lightBg: '#FAF5FF', border: '#DDD6FE', text: '#5B21B6', countKey: 'employees', tag: 'Staff', keywords: 'sales team staff agents executive' },
      { id: 'approvals', label: 'Account Approvals', icon: '⚖️', themeColor: '#E11D48', lightBg: '#FFF1F2', border: '#FECDD3', text: '#9F1239', countKey: 'approvals', alertBadge: true, tag: 'RBAC', keywords: 'pending registration requests approve verify' },
      { id: 'support', label: 'Support & Inquiries', icon: '💬', themeColor: '#4F46E5', lightBg: '#EEF2FF', border: '#C7D2FE', text: '#3730A3', countKey: 'unreadTickets', alertBadge: true, liveBeacon: true, tag: 'Helpdesk', keywords: 'help desk tickets live chat complaints' }
    ]
  },
  {
    id: 'system',
    title: 'SYSTEM & TOOLS',
    items: [
      { id: 'integrations', label: 'Lead Sources & Webhooks', icon: '🔌', themeColor: '#334155', lightBg: '#F8FAFC', border: '#CBD5E1', text: '#1E293B', tag: 'Webhooks', keywords: 'whatsapp instagram facebook api website webhook' },
      { id: 'security', label: 'Activity Logs', icon: '🛡️', themeColor: '#475569', lightBg: '#F1F5F9', border: '#CBD5E1', text: '#0F172A', tag: 'Audit', keywords: 'audit security history logs tracking' },
      { id: 'settings', label: 'Data Export (CSV)', icon: '📥', themeColor: '#16A34A', lightBg: '#F0FDF4', border: '#BBF7D0', text: '#166534', tag: 'CSV', keywords: 'download excel backup reports export' }
    ]
  }
];

export default function Sidebar({ activeTab, setActiveTab, counts, companyInfo, isOpen = true, mobileOpen = false, onCloseMobile, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Collapsible state for each section (Persisted in localStorage)
  const [collapsedSections, setCollapsedSections] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_sidebar_collapsed_sections');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => {
      const updated = { ...prev, [sectionId]: !prev[sectionId] };
      try {
        localStorage.setItem('crm_sidebar_collapsed_sections', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Total active alerts calculation
  const totalAlerts = (counts?.unreadLeads || 0) + (counts?.unreadTickets || 0) + (counts?.approvals || 0);

  // Filter menu items dynamically according to search query
  const filteredSections = MENU_SECTIONS.map(section => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return section;

    const filteredItems = section.items.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.tag.toLowerCase().includes(q) ||
      (item.keywords && item.keywords.toLowerCase().includes(q))
    );

    return {
      ...section,
      items: filteredItems
    };
  }).filter(section => section.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop - Only on small mobile screens when drawer is open */}
      <div
        className={`mobile-sidebar-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={onCloseMobile}
      />

      <aside className={`app-sidebar ${isOpen ? 'desktop-open' : 'desktop-collapsed'} ${mobileOpen ? 'mobile-open' : ''}`}>
        
        {/* 🌟 1. Executive Omnichannel Quick Search Bar */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#F8FAFC',
          borderRadius: '12px',
          border: '1.5px solid #E2E8F0',
          padding: '4px 10px',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '7px',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #4338CA 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            marginRight: '8px',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(67, 56, 202, 0.25)'
          }}>
            🔍
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu or module..."
            style={{
              width: '100%',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '12px',
              fontWeight: '700',
              color: '#0F172A',
              padding: '6px 0',
              outline: 'none',
              boxShadow: 'none !important'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: '#E2E8F0',
                border: 'none',
                color: '#475569',
                fontSize: '11px',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                transition: 'background 0.2s'
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* 🌟 2. Mini Live Pulse Status Capsule */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 40%, #312E81 75%, #4338CA 100%)',
          borderRadius: '12px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#FFFFFF',
          boxShadow: '0 4px 14px rgba(67, 56, 202, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              display: 'inline-block',
              boxShadow: '0 0 10px #10B981'
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '11.5px', fontWeight: '900', letterSpacing: '0.2px', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                {companyInfo?.name || 'OmniCRM Suite'}
              </span>
              <span style={{ fontSize: '9.5px', color: '#C7D2FE', fontWeight: '700' }}>
                Atlas v2.0 • Live Cloud
              </span>
            </div>
          </div>
          {totalAlerts > 0 && (
            <span style={{
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: '900',
              padding: '2px 8px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              {totalAlerts} New
            </span>
          )}
        </div>

        {/* 🌟 3. Navigation Categories with Collapsible Headers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
          {filteredSections.length > 0 ? (
            filteredSections.map((section) => {
              const isCollapsed = Boolean(collapsedSections[section.id]);
              // Check if any active item belongs to this section so user knows
              const hasActiveItem = section.items.some(it => it.id === activeTab);

              return (
                <div key={section.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  
                  {/* Interactive Section Header (Click to collapse / expand subheadings) */}
                  <div
                    onClick={() => toggleSection(section.id)}
                    title={isCollapsed ? `Click to expand ${section.title}` : `Click to collapse ${section.title}`}
                    style={{
                      padding: '5px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      userSelect: 'none',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '900',
                        color: hasActiveItem ? '#4338CA' : '#64748B',
                        letterSpacing: '0.8px',
                        textTransform: 'uppercase'
                      }}>
                        {section.title}
                      </span>
                      {hasActiveItem && isCollapsed && (
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#4338CA',
                          display: 'inline-block',
                          boxShadow: '0 0 6px #4338CA'
                        }} />
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{
                        fontSize: '9.5px',
                        color: '#94A3B8',
                        fontWeight: '800',
                        transition: 'transform 0.2s ease',
                        transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'
                      }}>
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Subheadings / Animated Menu Items */}
                  {!isCollapsed && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', animation: 'menuSlideIn 0.2s ease' }}>
                      {section.items.map(item => {
                        const isActive = activeTab === item.id;
                        const count = item.countKey && counts?.[item.countKey] !== undefined ? counts[item.countKey] : null;

                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              if (onCloseMobile) onCloseMobile();
                            }}
                            className={`menu-item-btn ${isActive ? 'active' : ''}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 10px',
                              borderRadius: '10px',
                              backgroundColor: isActive ? '#EEF2FF' : 'transparent',
                              border: isActive ? '1.5px solid #C7D2FE' : '1.5px solid transparent',
                              color: isActive ? '#312E81' : '#334155',
                              fontWeight: isActive ? '900' : '700',
                              fontSize: '12.5px',
                              cursor: 'pointer',
                              outline: 'none',
                              textAlign: 'left',
                              boxShadow: isActive ? '0 4px 12px rgba(67, 56, 202, 0.12)' : 'none',
                              transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                              position: 'relative'
                            }}
                          >
                            {/* Left Active Indicator Bar */}
                            {isActive && (
                              <div style={{
                                position: 'absolute',
                                left: 0,
                                top: '6px',
                                bottom: '6px',
                                width: '3.5px',
                                borderRadius: '0 4px 4px 0',
                                backgroundColor: '#4338CA'
                              }} />
                            )}

                            {/* Left icon and label */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                              <span
                                className="menu-icon-box"
                                style={{
                                  fontSize: '14.5px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '8px',
                                  backgroundColor: isActive ? '#FFFFFF' : '#F8FAFC',
                                  border: isActive ? '1.5px solid #C7D2FE' : '1px solid #E2E8F0',
                                  boxShadow: isActive ? '0 2px 8px rgba(67, 56, 202, 0.12)' : '0 1px 2px rgba(0,0,0,0.02)',
                                  flexShrink: 0
                                }}
                              >
                                {item.icon}
                              </span>
                              <span style={{
                                color: isActive ? '#1E1B4B' : '#334155',
                                letterSpacing: '-0.1px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {item.label}
                              </span>
                            </div>

                            {/* Right Tags & Badges */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                              {item.liveBeacon && (
                                <div className="pulse-beacon" style={{ width: '7px', height: '7px' }} />
                              )}

                              {count !== null && (
                                <span
                                  className={item.alertBadge && count > 0 ? 'menu-badge-pulse' : ''}
                                  style={{
                                    backgroundColor: item.alertBadge && count > 0 ? '#FEE2E2' : isActive ? '#4338CA' : '#F1F5F9',
                                    color: item.alertBadge && count > 0 ? '#DC2626' : isActive ? '#FFFFFF' : '#64748B',
                                    fontSize: '10.5px',
                                    fontWeight: '900',
                                    padding: '2px 7px',
                                    borderRadius: '8px',
                                    minWidth: '20px',
                                    textAlign: 'center',
                                    border: item.alertBadge && count > 0 ? '1px solid #FCA5A5' : isActive ? 'none' : '1px solid #E2E8F0',
                                    boxShadow: item.alertBadge && count > 0 ? '0 2px 6px rgba(220, 38, 38, 0.25)' : 'none'
                                  }}
                                >
                                  {count}
                                </span>
                              )}

                              {!count && isActive && (
                                <span style={{
                                  fontSize: '9px',
                                  fontWeight: '900',
                                  backgroundColor: '#FFFFFF',
                                  color: '#4338CA',
                                  padding: '1px 6px',
                                  borderRadius: '5px',
                                  border: '1px solid #C7D2FE'
                                }}>
                                  {item.tag}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{
              padding: '24px 12px',
              textAlign: 'center',
              color: '#94A3B8',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>🔍</div>
              No tabs match "{searchQuery}"
            </div>
          )}
        </div>

        {/* 🌟 4. Bottom Logout Button */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '8px'
        }}>
          <button
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                window.location.reload();
              }
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '11px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
              border: '1.5px solid #FECACA',
              color: '#DC2626',
              fontSize: '13px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.08)',
              transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              letterSpacing: '0.3px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = '#B91C1C';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(220, 38, 38, 0.35)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)';
              e.currentTarget.style.color = '#DC2626';
              e.currentTarget.style.borderColor = '#FECACA';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            title="Sign out of Admin Portal"
          >
            <span style={{ fontSize: '16px' }}>🚪</span>
            <span>Logout Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
