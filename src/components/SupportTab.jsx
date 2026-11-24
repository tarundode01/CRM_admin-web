import React, { useState } from 'react';

export default function SupportTab({ tickets = [], onSendReply, sendingReply, onTicketSeen }) {
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?._id || null);
  const [replyText, setReplyText] = useState('');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  // Track seen message counts per ticket in localStorage so admin can see/clear new message badge
  const [seenMsgCounts, setSeenMsgCounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('admin_seen_ticket_msg_counts') || '{}');
    } catch {
      return {};
    }
  });

  // Dynamic sorting: Tickets with unread customer messages or latest messages appear at the top
  const sortedTickets = [...tickets].sort((a, b) => {
    const aMsgs = a.messages || [];
    const bMsgs = b.messages || [];
    const aLast = aMsgs.length > 0 ? aMsgs[aMsgs.length - 1] : null;
    const bLast = bMsgs.length > 0 ? bMsgs[bMsgs.length - 1] : null;

    const aSeen = seenMsgCounts[a._id];
    const bSeen = seenMsgCounts[b._id];

    const aHasUnread = (aSeen === undefined ? (aLast && aLast.sender === 'customer') : (aMsgs.length > aSeen && aLast && aLast.sender === 'customer')) ? 1 : 0;
    const bHasUnread = (bSeen === undefined ? (bLast && bLast.sender === 'customer') : (bMsgs.length > bSeen && bLast && bLast.sender === 'customer')) ? 1 : 0;

    if (aHasUnread !== bHasUnread) return bHasUnread - aHasUnread;

    const aTime = aLast?.createdAt ? new Date(aLast.createdAt).getTime() : new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = bLast?.createdAt ? new Date(bLast.createdAt).getTime() : new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });

  const activeTicket = sortedTickets.find(t => t._id === selectedTicketId) || sortedTickets[0] || tickets[0];

  // When activeTicket loads or changes, mark it as seen
  const markTicketAsSeen = (ticket) => {
    if (!ticket || !ticket._id) return;
    const newCount = ticket.messages?.length || 0;
    setSeenMsgCounts(prev => {
      const updated = { ...prev, [ticket._id]: newCount };
      try {
        localStorage.setItem('admin_seen_ticket_msg_counts', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (onTicketSeen) {
      onTicketSeen(ticket._id, newCount);
    }
  };

  const selectTicket = (id) => {
    setSelectedTicketId(id);
    setMobileChatOpen(true);
    const target = tickets.find(t => t._id === id);
    if (target) {
      markTicketAsSeen(target);
    }
  };
  const getCategoryTheme = (cat = '') => {
    const c = (cat || '').toLowerCase();
    if (c.includes('billing') || c.includes('invoice') || c.includes('payment')) {
      return { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A', icon: '💳' };
    }
    if (c.includes('technical') || c.includes('bug') || c.includes('api')) {
      return { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD', icon: '💻' };
    }
    if (c.includes('onboarding') || c.includes('kyc') || c.includes('account')) {
      return { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE', icon: '🛡️' };
    }
    return { bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE', icon: '💬' };
  };

  // Metrics
  const openCount = tickets.filter(t => (t.status || 'open').toLowerCase() !== 'closed').length;
  const urgentCount = tickets.filter(t => (t.priority || '').toLowerCase() === 'urgent' || (t.priority || '').toLowerCase() === 'high').length;

  // Filter list with deep multi-field search
  const filteredTickets = sortedTickets.filter(t => {
    const cat = (t.category || 'General').toLowerCase();
    if (filterCategory !== 'All') {
      if (filterCategory === 'Billing' && !cat.includes('billing') && !cat.includes('payment')) return false;
      if (filterCategory === 'Technical' && !cat.includes('tech') && !cat.includes('bug')) return false;
      if (filterCategory === 'Urgent' && (t.priority || '').toLowerCase() !== 'urgent' && (t.priority || '').toLowerCase() !== 'high') return false;
    }
    if (search) {
      const q = search.trim().toLowerCase();
      const num = (t.ticketNumber || t._id || '').toLowerCase();
      const sub = (t.subject || '').toLowerCase();
      const client = (t.customerId?.name || '').toLowerCase();
      const comp = (t.customerId?.company || '').toLowerCase();
      const email = (t.customerId?.email || '').toLowerCase();
      const phone = (t.customerId?.phone || '').toLowerCase();
      const staff = (t.assignedStaff?.name || '').toLowerCase();
      const msgs = (t.messages || []).map(m => (m.text || '')).join(' ').toLowerCase();
      return num.includes(q) || sub.includes(q) || client.includes(q) || comp.includes(q) || email.includes(q) || phone.includes(q) || staff.includes(q) || msgs.includes(q);
    }
    return true;
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;
    onSendReply(activeTicket._id, replyText.trim());
    setReplyText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      
      {/* 🌟 CSS Keyframes and Ambient Shimmers */}
      <style>{`
        @keyframes pulseSupportAmbient {
          0% { transform: scale(0.98); opacity: 0.8; }
          50% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(0.98); opacity: 0.8; }
        }
        @keyframes subtleQueueSlide {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .support-ticket-item {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .support-ticket-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(67, 56, 202, 0.12) !important;
        }
      `}</style>

      {/* 🌟 1. Compact Sleek Indigo/Cyan Billboard Banner */}
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
          animation: 'pulseSupportAmbient 5s ease-in-out infinite'
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
            <span>🎧</span> 24/7 LIVE SUPPORT & DISPATCH
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.4px', textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
            Live Support Desk & Client Chat
          </h1>
          <p style={{ margin: '4px 0 0 0', opacity: 0.94, fontSize: '12.5px', color: '#E0E7FF', maxWidth: '560px' }}>
            Real-time multi-channel communication with active enterprise clients.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
          <div style={{
            backgroundColor: 'rgba(236, 253, 245, 0.95)',
            color: '#059669',
            border: '1.5px solid #A7F3D0',
            fontSize: '11.5px',
            fontWeight: '900',
            padding: '6px 14px',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.15)'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <span>DISPATCH LIVE</span>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            color: '#312E81',
            fontSize: '12px',
            fontWeight: '900',
            padding: '8px 16px',
            borderRadius: '12px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ fontSize: '14px' }}>💬</span>
            <span>{openCount} Active Conversations</span>
          </div>
        </div>
      </div>

      {/* 🌟 2. Spacious & Modern 4-Col KPI Metrics */}
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
            🎧
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Total Inbound
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#1E1B4B', lineHeight: '1' }}>
                {tickets.length}
              </div>
              <span style={{ fontSize: '10.5px', color: '#4338CA', fontWeight: '800', backgroundColor: '#E0E7FF', padding: '2px 7px', borderRadius: '6px' }}>
                All Channels
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
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
            💬
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Open Tickets
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#0C4A6E', lineHeight: '1' }}>
                {openCount}
              </div>
              <span style={{ fontSize: '10.5px', color: '#0284C7', fontWeight: '800', backgroundColor: '#E0F2FE', padding: '2px 7px', borderRadius: '6px' }}>
                In Queue
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
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
              High Priority
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#78350F', lineHeight: '1' }}>
                {urgentCount}
              </div>
              <span style={{ fontSize: '10.5px', color: '#B45309', fontWeight: '800', backgroundColor: '#FEF3C7', padding: '2px 7px', borderRadius: '6px' }}>
                Escalated
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
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
            ⏱️
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Response Speed
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#065F46', lineHeight: '1' }}>
                ~1.8 mins
              </div>
              <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: '800', backgroundColor: '#D1FAE5', padding: '2px 7px', borderRadius: '6px' }}>
                Ultra Fast
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 🌟 3. Main 2-Column Responsive Split Console */}
      <div className="support-split" style={{ alignItems: 'start' }}>
        
        {/* Left Column: Tickets Queue Cards */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid var(--border)',
          overflowY: 'auto',
          maxHeight: '620px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          {/* Queue Filter & Prominent Search Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '6px' }}>
            {/* Colorful & Bada Search Input */}
            <div style={{ position: 'relative', width: '100%' }}>
              <div style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '26px',
                height: '26px',
                borderRadius: '7px',
                background: 'linear-gradient(135deg, #312E81 0%, #4338CA 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                boxShadow: '0 2px 6px rgba(49, 46, 129, 0.3)'
              }}>
                🔍
              </div>
              <input
                type="text"
                placeholder="Search ticket #, client, email, phone, text..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 42px',
                  borderRadius: '10px',
                  border: '1.5px solid #C7D2FE',
                  fontSize: '12px',
                  color: '#0F172A',
                  fontWeight: '600',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box',
                  boxShadow: '0 2px 6px rgba(67, 56, 202, 0.04)',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4338CA';
                  e.target.style.boxShadow = '0 0 0 3px rgba(67, 56, 202, 0.16)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#C7D2FE';
                  e.target.style.boxShadow = '0 2px 6px rgba(67, 56, 202, 0.04)';
                }}
              />
            </div>

            {/* Quick Filter Pills */}
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {[
                { id: 'All', label: 'All', count: tickets.length, color: '#4338CA' },
                { id: 'Technical', label: 'Tech', count: tickets.filter(t => (t.category || '').toLowerCase().includes('tech')).length, color: '#0284C7' },
                { id: 'Billing', label: 'Billing', count: tickets.filter(t => (t.category || '').toLowerCase().includes('bill')).length, color: '#B45309' },
                { id: 'Urgent', label: 'Urgent', count: urgentCount, color: '#DC2626' }
              ].map(f => {
                const isSel = filterCategory === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilterCategory(f.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '10.5px',
                      fontWeight: '800',
                      border: isSel ? `1.2px solid ${f.color}` : '1px solid #E2E8F0',
                      backgroundColor: isSel ? f.color : '#FFFFFF',
                      color: isSel ? '#FFFFFF' : '#64748B',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{f.label}</span>
                    <span style={{
                      backgroundColor: isSel ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                      color: isSel ? '#FFFFFF' : '#64748B',
                      borderRadius: '6px',
                      padding: '1px 4px',
                      fontSize: '9.5px',
                      fontWeight: '900'
                    }}>
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 4px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '900', color: '#64748B', letterSpacing: '0.5px' }}>
              INCOMING QUEUE ({filteredTickets.length})
            </span>
          </div>

          {filteredTickets.length === 0 ? (
            <div style={{ padding: '24px 10px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
              No support tickets found.
            </div>
          ) : (
            filteredTickets.map((t, idx) => {
              const isSelected = activeTicket?._id === t._id;
              const catTheme = getCategoryTheme(t.category);
              const msgCount = t.messages?.length || 0;
              const lastMsg = msgCount > 0 ? t.messages[msgCount - 1] : null;

              const seenCount = seenMsgCounts[t._id];
              const hasUnread = (seenCount === undefined ? (lastMsg && lastMsg.sender === 'customer') : (msgCount > seenCount && lastMsg && lastMsg.sender === 'customer')) && !isSelected;
              
              // Resolve clear customer name
              const customerName = t.customerId?.name || (lastMsg?.sender === 'customer' ? lastMsg.senderName : null) || 'Customer';
              const customerCompany = t.customerId?.company || 'Corporate Client';
              const lastMsgSenderName = lastMsg?.sender === 'customer' ? (lastMsg.senderName || customerName) : 'Admin / Staff';
              const lastMsgTime = lastMsg?.createdAt ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

              return (
                <div
                  key={t._id || idx}
                  onClick={() => selectTicket(t._id)}
                  style={{
                    backgroundColor: isSelected ? '#FFFFFF' : hasUnread ? '#FFFBEB' : '#FFFFFF',
                    border: isSelected ? '2px solid #4338CA' : hasUnread ? '2px solid #EF4444' : '1.5px solid #E2E8F0',
                    borderLeft: isSelected ? '5px solid #4338CA' : hasUnread ? '5px solid #DC2626' : '1.5px solid #CBD5E1',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: isSelected ? '0 6px 18px rgba(67, 56, 202, 0.14)' : hasUnread ? '0 4px 14px rgba(220, 38, 38, 0.14)' : '0 2px 6px rgba(0,0,0,0.02)',
                    position: 'relative',
                    marginBottom: '2px'
                  }}
                >
                  {/* Top Bar: Customer Identity & Time */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '900',
                        boxShadow: '0 2px 6px rgba(67, 56, 202, 0.25)'
                      }}>
                        {customerName?.[0]?.toUpperCase() || 'C'}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '900', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>{customerName}</span>
                          {hasUnread && (
                            <span style={{
                              backgroundColor: '#DC2626',
                              color: '#FFFFFF',
                              fontSize: '9px',
                              fontWeight: '900',
                              padding: '1px 6px',
                              borderRadius: '8px',
                              letterSpacing: '0.3px',
                              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.35)'
                            }}>
                              NEW MESSAGE
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                          🏢 {customerCompany}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        backgroundColor: isSelected ? '#EEF2FF' : '#F1F5F9',
                        color: isSelected ? '#4338CA' : '#475569',
                        fontSize: '10px',
                        fontWeight: '900',
                        padding: '2px 6px',
                        borderRadius: '5px'
                      }}>
                        #{t.ticketNumber || t._id?.slice(-5) || 'TCK' + idx}
                      </span>
                      {lastMsgTime && (
                        <div style={{ fontSize: '9.5px', color: '#94A3B8', marginTop: '2px', fontWeight: '700' }}>
                          {lastMsgTime}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#1E293B', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.subject}
                  </div>

                  {/* Badges: Category & Staff */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      backgroundColor: catTheme.bg,
                      color: catTheme.color,
                      border: `1px solid ${catTheme.border}`,
                      fontSize: '9.5px',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '5px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <span>{catTheme.icon}</span>
                      <span>{t.category || 'General'}</span>
                    </span>

                    <span style={{
                      backgroundColor: t.assignedTo ? '#ECFDF5' : '#FFFBEB',
                      color: t.assignedTo ? '#047857' : '#B45309',
                      border: `1px solid ${t.assignedTo ? '#A7F3D0' : '#FDE68A'}`,
                      fontSize: '9.5px',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '5px'
                    }}>
                      🎯 {t.assignedTo?.name ? `Staff: ${t.assignedTo.name}` : 'Admin Desk'}
                    </span>
                  </div>

                  {/* Last Message Preview with Clear Customer Name Tag */}
                  {lastMsg && (
                    <div style={{
                      backgroundColor: hasUnread ? '#FEF2F2' : '#F8FAFC',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: hasUnread ? '#991B1B' : '#334155',
                      border: hasUnread ? '1.2px solid #FECACA' : '1px solid #E2E8F0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      <strong style={{ color: lastMsg.sender === 'customer' ? '#DC2626' : '#4338CA' }}>
                        {lastMsg.sender === 'customer' ? `💬 ${lastMsgSenderName}: ` : '🎧 Support / Admin: '}
                      </strong>
                      <span>{lastMsg.message}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: High-Impact Vibrant Live Chat Console */}
        {activeTicket ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #C7D2FE',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(67,56,202,0.08)',
            minHeight: '480px'
          }}>
            {/* Chat Header - Vibrant Champagne Gold & Navy Ribbon */}
            <div style={{
              background: 'linear-gradient(135deg, #F5E4C3 0%, #FDE68A 100%)',
              borderBottom: '1.5px solid #E2C799',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '15px' }}>💬</span>
                  <span style={{ fontSize: '14px', fontWeight: '900', color: '#1E1B4B' }}>
                    #{activeTicket.ticketNumber || activeTicket._id?.slice(-5)} • {activeTicket.subject}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                  <span style={{
                    backgroundColor: '#4338CA',
                    color: '#FFFFFF',
                    fontSize: '9.5px',
                    fontWeight: '900',
                    padding: '1px 5px',
                    borderRadius: '4px'
                  }}>
                    {activeTicket.category?.toUpperCase() || 'SUPPORT'}
                  </span>
                  {activeTicket.customerId?.name && (
                    <span style={{
                      backgroundColor: '#EEF2FF',
                      border: '1px solid #C7D2FE',
                      color: '#4338CA',
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}>
                      👤 Client: {activeTicket.customerId.name} ({activeTicket.customerId.company || 'Enterprise'})
                    </span>
                  )}
                  <span style={{
                    backgroundColor: activeTicket.assignedTo ? '#ECFDF5' : '#FFFBEB',
                    border: `1px solid ${activeTicket.assignedTo ? '#A7F3D0' : '#FDE68A'}`,
                    color: activeTicket.assignedTo ? '#047857' : '#B45309',
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}>
                    🎯 Sales Staff: {activeTicket.assignedTo?.name ? `${activeTicket.assignedTo.name} (${activeTicket.assignedTo.designation || 'Sales Officer'})` : 'Admin Overseeing'}
                  </span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                padding: '3px 8px',
                borderRadius: '8px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }} />
                <span style={{ fontSize: '10px', fontWeight: '900', color: '#047857' }}>
                  LIVE
                </span>
              </div>
            </div>

            {/* Amber Problem Statement Banner */}
            <div style={{
              backgroundColor: '#FFFBEB',
              border: '1.2px solid #FDE68A',
              borderLeft: '4px solid #D97706',
              margin: '8px 12px',
              padding: '7px 10px',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '1px' }}>
                <span style={{ fontSize: '11px' }}>📋</span>
                <span style={{ fontSize: '9.5px', fontWeight: '900', color: '#B45309' }}>
                  INITIAL CUSTOMER QUERY
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: '#78350F', lineHeight: '1.4', margin: 0 }}>
                {activeTicket.description}
              </p>
            </div>

            {/* Messages Scroll Canvas */}
            <div style={{
              flex: 1,
              backgroundColor: '#F8FAFC',
              padding: '12px 14px',
              overflowY: 'auto',
              maxHeight: '340px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {activeTicket.messages?.length > 0 ? (
                activeTicket.messages.map((m, idx) => {
                  const isStaff = m.sender === 'support';
                  const isCustomer = m.sender === 'customer';
                  const activeCustomerName = activeTicket.customerId?.name || 'Customer';
                  const senderName = isCustomer
                    ? (m.senderName || activeCustomerName)
                    : (m.senderName || 'Super Admin');

                  return (
                    <div
                      key={idx}
                      style={{
                        alignSelf: isStaff ? 'flex-end' : 'flex-start',
                        maxWidth: '82%',
                        backgroundColor: isStaff ? '#4338CA' : '#FFFFFF',
                        color: isStaff ? '#FFFFFF' : '#0F172A',
                        borderRadius: '14px',
                        borderBottomRightRadius: isStaff ? '3px' : '14px',
                        borderBottomLeftRadius: isStaff ? '14px' : '3px',
                        padding: '10px 14px',
                        border: isStaff ? 'none' : '1.5px solid #E2E8F0',
                        boxShadow: isStaff ? '0 4px 14px rgba(67, 56, 202, 0.22)' : '0 2px 8px rgba(0,0,0,0.04)'
                      }}
                    >
                      {/* Explicit, clean customer name & sender tag */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        marginBottom: '4px',
                        borderBottom: isStaff ? '1px solid rgba(255,255,255,0.15)' : '1px solid #F1F5F9',
                        paddingBottom: '3px'
                      }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '900',
                          color: isStaff ? '#E0E7FF' : '#4338CA',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>{isStaff ? '🎧' : '👤'}</span>
                          <span>{senderName}</span>
                          {isCustomer && (
                            <span style={{ fontSize: '9.5px', fontWeight: '800', backgroundColor: '#EEF2FF', color: '#4338CA', padding: '1px 5px', borderRadius: '4px' }}>
                              Client
                            </span>
                          )}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{
                            fontSize: '9.5px',
                            fontWeight: '700',
                            color: isStaff ? '#C7D2FE' : '#94A3B8'
                          }}>
                            {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                          {/* Seen / Unread Status Marker */}
                          {m.seen ? (
                            <span style={{ fontSize: '10px', fontWeight: '900', color: isStaff ? '#4ADE80' : '#16A34A' }} title="Seen">
                              ✓✓
                            </span>
                          ) : (
                            <span style={{ fontSize: '10px', fontWeight: '900', color: '#EF4444' }} title="Unread">
                              ●
                            </span>
                          )}
                        </div>
                      </div>

                      <p style={{ fontSize: '13px', lineHeight: '1.45', fontWeight: '500', margin: '4px 0 0 0' }}>
                        {m.message}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                  No messages exchanged yet. Type below to respond.
                </div>
              )}
            </div>

            {/* Quick Prompt Dispatch Dock */}
            <form
              onSubmit={handleSend}
              style={{
                backgroundColor: '#FFFFFF',
                borderTop: '1.5px solid #E2E8F0',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <input
                type="text"
                placeholder="Type reply to client..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                style={{
                  flex: 1,
                  backgroundColor: '#F8FAFC',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '18px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={sendingReply || !replyText.trim()}
                style={{
                  backgroundColor: '#4338CA',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: '800',
                  padding: '8px 16px',
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(67,56,202,0.25)',
                  opacity: (!replyText.trim() || sendingReply) ? 0.6 : 1,
                  cursor: (!replyText.trim() || sendingReply) ? 'not-allowed' : 'pointer'
                }}
              >
                {sendingReply ? '...' : 'Send 🚀'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94A3B8',
            padding: '30px'
          }}>
            Select a ticket from the left to view conversation.
          </div>
        )}
      </div>

    </div>
  );
}
