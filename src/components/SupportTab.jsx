import React, { useState, useRef } from 'react';

export default function SupportTab({ tickets = [], onSendReply, sendingReply, onTicketSeen }) {
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?._id || null);
  const [replyText, setReplyText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // { url, fileType: 'image' | 'pdf', fileName, previewUrl }
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller file.');
      return;
    }

    const isImg = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (!isImg && !isPdf) {
      alert('Please upload an Image (JPG, PNG, WebP) or PDF document.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        url: reader.result,
        fileType: isImg ? 'image' : 'pdf',
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if ((!replyText.trim() && !selectedFile) || !activeTicket) return;
    onSendReply(activeTicket._id, replyText.trim(), selectedFile);
    setReplyText('');
    setSelectedFile(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      
      {/* 🌟 CSS Keyframes and Micro-animations */}
      <style>{`
        @keyframes pulseSupportAmbient {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 0.85; }
        }
        @keyframes subtleQueueSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerSupportBar {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulseNewMsgGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          50% { transform: scale(1.04); box-shadow: 0 0 0 4px rgba(220, 38, 38, 0); }
        }
        .support-hero-banner {
          animation: subtleQueueSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          width: 100%;
          box-sizing: border-box;
        }
        .support-metric-card {
          animation: subtleQueueSlide 0.45s cubic-bezier(0.16, 1, 0.3, 1) backwards;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
          min-width: 0 !important;
        }
        .support-metric-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08) !important;
          border-color: #CBD5E1 !important;
        }
        .support-ticket-item {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
          min-width: 0;
        }
        .support-ticket-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(67, 56, 202, 0.12) !important;
        }

        .support-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          width: 100%;
          box-sizing: border-box;
        }

        .support-split,
        .support-split-container {
          display: grid;
          grid-template-columns: 360px minmax(0, 1fr);
          gap: 16px;
          align-items: start;
          width: 100%;
          box-sizing: border-box;
        }

        .support-queue-column {
          width: 100%;
          box-sizing: border-box;
          min-width: 0;
        }

        .support-chat-column {
          width: 100%;
          box-sizing: border-box;
          min-width: 0;
        }

        /* Responsive Mobile Layout Fixes */
        @media (max-width: 1024px) {
          .support-metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
        }

        @media (max-width: 850px) {
          .support-split,
          .support-split-container {
            display: flex !important;
            flex-direction: column !important;
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .mobile-view-tabs {
            display: flex !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .mobile-back-btn {
            display: inline-flex !important;
          }
          .support-queue-column.mobile-hidden {
            display: none !important;
          }
          .support-chat-column.mobile-hidden {
            display: none !important;
          }
        }

        @media (max-width: 600px) {
          .support-hero-banner {
            padding: 12px 14px !important;
          }
          .support-hero-title {
            font-size: 16px !important;
          }
          .support-metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .support-metric-card {
            padding: 8px 10px !important;
            min-height: 72px !important;
          }
          .support-metric-val {
            font-size: 16px !important;
          }
          .support-metric-icon {
            width: 28px !important;
            height: 28px !important;
            font-size: 13px !important;
          }
          .support-chat-messages {
            max-height: 300px !important;
            padding: 8px !important;
          }
        }
      `}</style>

      {/* 🌟 1. Executive Midnight Royal Indigo Billboard Banner */}
      <div 
        className="support-hero-banner"
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
        {/* Shimmer Royal Indigo Accent Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3.5px',
          background: 'linear-gradient(90deg, #4338CA, #6366F1, #818CF8, #4338CA)',
          backgroundSize: '200% 100%',
          animation: 'shimmerSupportBar 3.5s linear infinite'
        }} />

        {/* Ambient Glow Sphere */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129, 140, 248, 0.3) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
          animation: 'pulseSupportAmbient 5s ease-in-out infinite'
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
            <span>🎧</span> 24/7 LIVE SUPPORT & DISPATCH
          </div>
          <h1 className="support-hero-title" style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px', color: '#FFFFFF' }}>
            Live Support Desk & Client Chat
          </h1>
          <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '12px', color: '#C7D2FE', maxWidth: '560px', fontWeight: '500' }}>
            Real-time multi-channel communication with active enterprise clients.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
          <div style={{
            backgroundColor: 'rgba(236, 253, 245, 0.15)',
            color: '#A7F3D0',
            border: '1px solid rgba(167, 243, 208, 0.35)',
            fontSize: '11px',
            fontWeight: '900',
            padding: '6px 14px',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(8px)'
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <span>DISPATCH LIVE</span>
          </div>

          <div style={{
            backgroundColor: '#FFFFFF',
            color: '#1E1B4B',
            fontSize: '12px',
            fontWeight: '900',
            padding: '8px 16px',
            borderRadius: '10px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ fontSize: '14px' }}>💬</span>
            <span>{openCount} Active Conversations</span>
          </div>
        </div>
      </div>

      {/* 🌟 2. Executive Crisp White SaaS Metric Cards */}
      <div className="support-metrics-grid">
        
        {/* Metric 1 - Total Inbound */}
        <div 
          className="support-metric-card"
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
            background: 'linear-gradient(90deg, #4338CA 0%, #6366F1 100%)'
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div className="support-metric-icon" style={{
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
              🎧
            </div>
            <span style={{ fontSize: '10.5px', color: '#4338CA', fontWeight: '800', backgroundColor: '#EEF2FF', padding: '3px 8px', borderRadius: '6px', border: '1px solid #C7D2FE' }}>
              All Channels
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Inbound
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div className="support-metric-val" style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', lineHeight: '1' }}>
                {tickets.length}
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                Captured Queries
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2 - Open Tickets */}
        <div 
          className="support-metric-card"
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
            background: 'linear-gradient(90deg, #0284C7 0%, #38BDF8 100%)'
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div className="support-metric-icon" style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#F0F9FF',
              border: '1.2px solid #BAE6FD',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0
            }}>
              💬
            </div>
            <span style={{ fontSize: '10.5px', color: '#0284C7', fontWeight: '800', backgroundColor: '#E0F2FE', padding: '3px 8px', borderRadius: '6px', border: '1px solid #BAE6FD' }}>
              In Queue
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Open Tickets
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div className="support-metric-val" style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', lineHeight: '1' }}>
                {openCount}
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                Active Threads
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3 - High Priority */}
        <div 
          className="support-metric-card"
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
            background: 'linear-gradient(90deg, #D97706 0%, #F59E0B 100%)'
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div className="support-metric-icon" style={{
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
              ⚡
            </div>
            <span style={{ fontSize: '10.5px', color: '#B45309', fontWeight: '800', backgroundColor: '#FEF3C7', padding: '3px 8px', borderRadius: '6px', border: '1px solid #FDE68A' }}>
              Escalated
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              High Priority
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div className="support-metric-val" style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', lineHeight: '1' }}>
                {urgentCount}
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                SLA Alert
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4 - Response Speed */}
        <div 
          className="support-metric-card"
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
            background: 'linear-gradient(90deg, #059669 0%, #10B981 100%)'
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div className="support-metric-icon" style={{
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
              ⏱️
            </div>
            <span style={{ fontSize: '10.5px', color: '#047857', fontWeight: '800', backgroundColor: '#ECFDF5', padding: '3px 8px', borderRadius: '6px', border: '1px solid #A7F3D0' }}>
              Ultra Fast
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Response Speed
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div className="support-metric-val" style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', lineHeight: '1' }}>
                ~1.8 mins
              </div>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                Avg Turnaround
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 🌟 Mobile Navigation Switcher (Shown on screens <= 768px when ticket is selected) */}
      {activeTicket && (
        <div style={{
          display: 'none',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '4px',
          border: '1.5px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
        }} className="mobile-view-tabs">
          <button
            onClick={() => setMobileChatOpen(false)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              backgroundColor: !mobileChatOpen ? '#4338CA' : 'transparent',
              color: !mobileChatOpen ? '#FFFFFF' : '#64748B',
              transition: 'all 0.15s ease'
            }}
          >
            📋 Tickets Queue ({filteredTickets.length})
          </button>
          <button
            onClick={() => setMobileChatOpen(true)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              backgroundColor: mobileChatOpen ? '#4338CA' : 'transparent',
              color: mobileChatOpen ? '#FFFFFF' : '#64748B',
              transition: 'all 0.15s ease'
            }}
          >
            💬 Live Chat (#{activeTicket.ticketNumber || activeTicket._id?.slice(-4)})
          </button>
        </div>
      )}

      {/* 🌟 3. Main 2-Column Responsive Split Console */}
      <div className="support-split support-split-container" style={{ alignItems: 'start' }}>
        
        {/* Left Column: Tickets Queue Cards */}
        <div 
          className={`support-queue-column ${mobileChatOpen && activeTicket ? 'mobile-hidden' : ''}`}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E2E8F0',
            overflowY: 'auto',
            maxHeight: '620px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.03)'
          }}
        >
          {/* Queue Filter & Prominent Search Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '6px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%' }}>
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
                placeholder="Search ticket #, client, email, phone, text..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: '10px',
                  border: '1.5px solid #E2E8F0',
                  fontSize: '12px',
                  color: '#0F172A',
                  fontWeight: '600',
                  backgroundColor: '#F8FAFC',
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

            {/* Quick Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'All', label: 'All', count: tickets.length, color: '#4338CA' },
                { id: 'Technical', label: 'Tech', count: tickets.filter(t => (t.category || '').toLowerCase().includes('tech')).length, color: '#0284C7' },
                { id: 'Billing', label: 'Billing', count: tickets.filter(t => (t.category || '').toLowerCase().includes('bill')).length, color: '#D97706' },
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
                      gap: '5px',
                      padding: '5px 10px',
                      borderRadius: '7px',
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
                      backgroundColor: isSel ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                      color: isSel ? '#FFFFFF' : '#64748B',
                      borderRadius: '6px',
                      padding: '1px 5px',
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 2px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              INCOMING QUEUE ({filteredTickets.length})
            </span>
          </div>

          {filteredTickets.length === 0 ? (
            <div style={{ padding: '30px 10px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
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
                  className="support-ticket-item"
                  onClick={() => selectTicket(t._id)}
                  style={{
                    backgroundColor: isSelected ? '#FFFFFF' : hasUnread ? '#FFFBEB' : '#FFFFFF',
                    border: isSelected ? '1.5px solid #4338CA' : hasUnread ? '1.5px solid #EF4444' : '1.5px solid #E2E8F0',
                    borderLeft: isSelected ? '4.5px solid #4338CA' : hasUnread ? '4.5px solid #DC2626' : '1.5px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 6px 18px rgba(67, 56, 202, 0.12)' : hasUnread ? '0 4px 14px rgba(220, 38, 38, 0.12)' : '0 2px 6px rgba(15, 23, 42, 0.02)',
                    position: 'relative',
                    marginBottom: '2px'
                  }}
                >
                  {/* Top Bar: Customer Identity & Time */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #4338CA 0%, #312E81 100%)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '900',
                        boxShadow: '0 2px 6px rgba(67, 56, 202, 0.2)'
                      }}>
                        {customerName?.[0]?.toUpperCase() || 'C'}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '900', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>{customerName}</span>
                          {hasUnread && (
                            <span 
                              style={{
                                backgroundColor: '#DC2626',
                                color: '#FFFFFF',
                                fontSize: '9px',
                                fontWeight: '900',
                                padding: '1px 6px',
                                borderRadius: '8px',
                                letterSpacing: '0.3px',
                                animation: 'pulseNewMsgGlow 2s infinite'
                              }}
                            >
                              NEW
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
                        backgroundColor: isSelected ? '#EEF2FF' : '#F8FAFC',
                        color: isSelected ? '#4338CA' : '#64748B',
                        fontSize: '10px',
                        fontWeight: '900',
                        padding: '2px 6px',
                        borderRadius: '5px',
                        border: '1px solid #E2E8F0'
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
                      backgroundColor: '#EEF2FF',
                      color: '#4338CA',
                      border: '1px solid #C7D2FE',
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
          <div 
            className={`support-chat-column ${!mobileChatOpen ? 'mobile-hidden' : ''}`}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1.5px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
              minHeight: '480px'
            }}
          >
            {/* Chat Header - Royal Midnight Navy Ribbon */}
            <div style={{
              background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              color: '#FFFFFF'
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Mobile Back Button */}
                <button
                  type="button"
                  className="mobile-back-btn"
                  onClick={() => setMobileChatOpen(false)}
                  style={{
                    display: 'none',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  ← Queue
                </button>

                {/* Customer Avatar */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.18)',
                  border: '1.2px solid rgba(255,255,255,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: '900',
                  color: '#FFFFFF',
                  flexShrink: 0
                }}>
                  {(activeTicket.customerId?.name || 'Customer')?.[0]?.toUpperCase()}
                </div>

                {/* Clean Customer Info: Name & Phone Number Only */}
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{activeTicket.customerId?.name || 'Customer'}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#C7D2FE', fontWeight: '700', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>📞</span>
                    <span>{activeTicket.customerId?.phone || activeTicket.phone || 'No phone provided'}</span>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(52, 211, 153, 0.5)',
                padding: '4px 10px',
                borderRadius: '20px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34D399', boxShadow: '0 0 6px #34D399' }} />
                <span style={{ fontSize: '10.5px', fontWeight: '900', color: '#6EE7B7' }}>
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
              padding: '8px 12px',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                <span style={{ fontSize: '11px' }}>📋</span>
                <span style={{ fontSize: '10px', fontWeight: '900', color: '#B45309', letterSpacing: '0.4px' }}>
                  INITIAL CUSTOMER QUERY
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#78350F', lineHeight: '1.4', margin: 0, fontWeight: '500' }}>
                {activeTicket.description}
              </p>
            </div>

            {/* Messages Scroll Canvas */}
            <div 
              className="support-chat-messages"
              style={{
                flex: 1,
                backgroundColor: '#F8FAFC',
                padding: '14px 16px',
                overflowY: 'auto',
                maxHeight: '340px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
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
                      {/* Explicit customer name & sender tag */}
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

                      {/* Attachment Rendering (Image or PDF) */}
                      {m.attachment?.url && (
                        <div style={{ marginTop: '8px', marginBottom: '4px' }}>
                          {m.attachment.fileType === 'pdf' || m.attachment.url.startsWith('data:application/pdf') ? (
                            <a
                              href={m.attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={m.attachment.fileName || 'document.pdf'}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                backgroundColor: isStaff ? 'rgba(255,255,255,0.18)' : '#FEF2F2',
                                border: isStaff ? '1px solid rgba(255,255,255,0.25)' : '1px solid #FECACA',
                                color: isStaff ? '#FFFFFF' : '#DC2626',
                                textDecoration: 'none',
                                fontSize: '12px',
                                fontWeight: '800',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <span style={{ fontSize: '18px' }}>📄</span>
                              <div>
                                <div style={{ textDecoration: 'underline' }}>{m.attachment.fileName || 'View PDF Document'}</div>
                                <div style={{ fontSize: '9.5px', opacity: 0.8, fontWeight: '600' }}>Click to open / download</div>
                              </div>
                            </a>
                          ) : (
                            <div style={{ borderRadius: '8px', overflow: 'hidden', border: isStaff ? '1px solid rgba(255,255,255,0.3)' : '1px solid #E2E8F0', maxWidth: '280px' }}>
                              <img
                                src={m.attachment.url}
                                alt={m.attachment.fileName || 'Attachment'}
                                style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                                onClick={() => {
                                  const win = window.open();
                                  if (win) win.document.write(`<img src="${m.attachment.url}" style="max-width:100%;height:auto;margin:auto;display:block;" />`);
                                }}
                              />
                              {m.attachment.fileName && (
                                <div style={{
                                  fontSize: '10px',
                                  padding: '4px 8px',
                                  backgroundColor: isStaff ? 'rgba(0,0,0,0.2)' : '#F1F5F9',
                                  color: isStaff ? '#E0E7FF' : '#475569',
                                  fontWeight: '700',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  📎 {m.attachment.fileName}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {m.message && (
                        <p style={{ fontSize: '13px', lineHeight: '1.45', fontWeight: '500', margin: '4px 0 0 0' }}>
                          {m.message}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                  No messages exchanged yet. Type below to respond.
                </div>
              )}
            </div>

            {/* Quick Prompt Dispatch Dock with File/Image Attachment */}
            <form
              onSubmit={handleSend}
              style={{
                backgroundColor: '#FFFFFF',
                borderTop: '1.5px solid #E2E8F0',
                padding: '10px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {/* Attachment Preview Box */}
              {selectedFile && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 12px',
                  backgroundColor: '#EEF2FF',
                  border: '1.2px solid #C7D2FE',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#4338CA'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <span style={{ fontSize: '16px' }}>{selectedFile.fileType === 'pdf' ? '📄' : '🖼️'}</span>
                    <span style={{ fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                      {selectedFile.fileName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      fontWeight: '900',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '2px 6px'
                    }}
                    title="Remove attachment"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Visual Attachment Trigger Button (Image / PDF) */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  title="Upload Image or PDF"
                  style={{
                    backgroundColor: selectedFile ? '#EEF2FF' : '#F1F5F9',
                    border: selectedFile ? '2px solid #4338CA' : '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '800',
                    color: selectedFile ? '#4338CA' : '#334155',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '15px' }}>📷</span>
                  <span style={{ fontSize: '11px' }}>Image / PDF</span>
                </button>

                <input
                  type="text"
                  placeholder={selectedFile ? "Add message with file..." : "Type reply to client..."}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: '#F8FAFC',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    padding: '9px 12px',
                    fontSize: '12px',
                    color: '#0F172A',
                    outline: 'none',
                    minWidth: '0',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#4338CA';
                    e.target.style.backgroundColor = '#FFFFFF';
                    e.target.style.boxShadow = '0 0 0 3px rgba(67, 56, 202, 0.12)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#CBD5E1';
                    e.target.style.backgroundColor = '#F8FAFC';
                    e.target.style.boxShadow = 'none';
                  }}
                />

                <button
                  type="submit"
                  disabled={sendingReply || (!replyText.trim() && !selectedFile)}
                  style={{
                    backgroundColor: '#4338CA',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: '800',
                    padding: '9px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(67,56,202,0.25)',
                    opacity: ((!replyText.trim() && !selectedFile) || sendingReply) ? 0.6 : 1,
                    cursor: ((!replyText.trim() && !selectedFile) || sendingReply) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {sendingReply ? '...' : 'Send 🚀'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94A3B8',
            padding: '40px',
            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.03)'
          }}>
            Select a ticket from the left to view conversation.
          </div>
        )}
      </div>

    </div>
  );
}
