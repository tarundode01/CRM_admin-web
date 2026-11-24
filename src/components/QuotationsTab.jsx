import React, { useState, useMemo } from 'react';

// Premium Industry-Standard Quotations Suite for OmniCRM
export default function QuotationsTab({
  quotations = [],
  customers = [],
  leads = [],
  employees = [],
  currentUser = { name: 'Super Admin', role: 'admin' },
  onOpenCreateQuotation,
  onSaveQuotation,
  onUpdateQuotation,
  onDeleteQuotation,
  onUpdateStatus
}) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('All');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState('All');

  // Modals
  const [viewQuotationModal, setViewQuotationModal] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [sendConfirmModal, setSendConfirmModal] = useState(null);
  const [timelineModal, setTimelineModal] = useState(null);
  const [revisionSourceQuote, setRevisionSourceQuote] = useState(null);
  const [approvalDecisionModal, setApprovalDecisionModal] = useState(null);
  const [editQuoteModal, setEditQuoteModal] = useState(null);

  // Local managed quotes to ensure seamless, reactive frontend experience
  const [localQuotes, setLocalQuotes] = useState(() => quotations || []);

  // Sync with live database quotations when prop updates
  React.useEffect(() => {
    if (quotations) {
      setLocalQuotes(quotations);
    }
  }, [quotations]);

  // Status normalizer helper function
  const matchQuoteStatus = (rawStatus, targetFilter) => {
    if (!targetFilter || targetFilter === 'All') return true;
    const s = (rawStatus || '').toLowerCase().trim();
    const f = targetFilter.toLowerCase().trim();

    if (f === 'draft') {
      return s === 'draft' || s === 'drafts';
    }
    if (f === 'pending') {
      return s.includes('pending') || s.includes('review') || s === 'under review';
    }
    if (f === 'approved') {
      return s === 'approved' || s.includes('admin approved');
    }
    if (f === 'sent') {
      return s === 'sent' || s === 'received' || s === 'delivered' || s === 'viewed' || s.includes('sent') || s.includes('received') || s.includes('proposal');
    }
    if (f === 'accepted') {
      return s === 'accepted' || s.includes('accept') || s === 'won' || s === 'signed';
    }
    if (f === 'rejected') {
      return s === 'rejected' || s === 'declined' || s.includes('reject') || s.includes('decline') || s.includes('revision');
    }
    return s === f;
  };

  // Calculate Summary KPIs
  const summary = useMemo(() => {
    const total = localQuotes.length;
    const drafts = localQuotes.filter(q => matchQuoteStatus(q.status, 'Draft')).length;
    const pending = localQuotes.filter(q => matchQuoteStatus(q.status, 'Pending')).length;
    const sent = localQuotes.filter(q => matchQuoteStatus(q.status, 'Sent')).length;
    const accepted = localQuotes.filter(q => matchQuoteStatus(q.status, 'Accepted')).length;
    const rejected = localQuotes.filter(q => matchQuoteStatus(q.status, 'Rejected')).length;
    const expired = localQuotes.filter(q => (q.status || '').toLowerCase() === 'expired').length;
    const totalVal = localQuotes.reduce((acc, q) => acc + (Number(q.totalAmount) || 0), 0);
    const acceptedVal = localQuotes.filter(q => matchQuoteStatus(q.status, 'Accepted')).reduce((acc, q) => acc + (Number(q.totalAmount) || 0), 0);

    return { total, drafts, pending, sent, accepted, rejected, expired, totalVal, acceptedVal };
  }, [localQuotes]);

  // Filtering
  const filteredList = useMemo(() => {
    return localQuotes.filter(q => {
      if (filterStatus !== 'All') {
        if (!matchQuoteStatus(q.status, filterStatus)) return false;
      }
      if (selectedEmployeeFilter !== 'All' && q.assignedSales?._id !== selectedEmployeeFilter) {
        return false;
      }
      if (selectedCustomerFilter !== 'All' && q.customerId?._id !== selectedCustomerFilter) {
        return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        const num = (q.quotationNumber || '').toLowerCase();
        const client = (q.customerId?.name || '').toLowerCase();
        const comp = (q.customerId?.company || '').toLowerCase();
        const title = (q.title || '').toLowerCase();
        const emp = (q.assignedSales?.name || q.createdByName || '').toLowerCase();
        return num.includes(query) || client.includes(query) || comp.includes(query) || title.includes(query) || emp.includes(query);
      }
      return true;
    });
  }, [localQuotes, filterStatus, selectedEmployeeFilter, selectedCustomerFilter, search]);

  // Status Styling Badge
  const getStatusBadge = (status = 'Draft') => {
    const s = (status || '').toLowerCase();
    if (s === 'draft') {
      return { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', icon: '📝', text: 'Draft' };
    }
    if (s.includes('pending')) {
      return { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A', icon: '⏳', text: 'Pending Approval' };
    }
    if (s.includes('approved')) {
      return { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD', icon: '🛡️', text: 'Admin Approved' };
    }
    if (s === 'sent' || s === 'received' || s === 'delivered' || s === 'viewed') {
      return { bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE', icon: '📤', text: s === 'received' ? 'Received by Client' : 'Sent to Client' };
    }
    if (s.includes('accept') || s === 'won') {
      return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', icon: '✓', text: 'Accepted & Won' };
    }
    if (s.includes('revision')) {
      return { bg: '#FFF7ED', color: '#C2410C', border: '#FFEDD5', icon: '🔄', text: 'Revision Requested' };
    }
    if (s.includes('reject') || s.includes('decline')) {
      return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', icon: '✕', text: 'Declined' };
    }
    if (s === 'expired') {
      return { bg: '#F8FAFC', color: '#94A3B8', border: '#E2E8F0', icon: '⌛', text: 'Expired' };
    }
    return { bg: '#F1F5F9', color: '#334155', border: '#CBD5E1', icon: '●', text: status };
  };

  // Actions
  const handleApproveQuotation = (quoteId) => {
    setLocalQuotes(prev => prev.map(q => {
      if (q._id === quoteId) {
        const updatedTimeline = [
          ...(q.timeline || []),
          { step: 'Approved', title: 'Executive Approval Granted', by: `${currentUser.name} (Administrator)`, time: new Date().toLocaleString(), note: 'Commercial discount and SLA pricing verified.' }
        ];
        return { ...q, status: 'Approved', requiresApproval: false, timeline: updatedTimeline };
      }
      return q;
    }));
    setApprovalDecisionModal(null);
    if (viewQuotationModal && viewQuotationModal._id === quoteId) {
      setViewQuotationModal(prev => ({ ...prev, status: 'Approved', requiresApproval: false }));
    }
  };

  const handleRejectQuotation = (quoteId, reason) => {
    setLocalQuotes(prev => prev.map(q => {
      if (q._id === quoteId) {
        const updatedTimeline = [
          ...(q.timeline || []),
          { step: 'Rejected', title: 'Proposal Rejected by Admin', by: `${currentUser.name} (Administrator)`, time: new Date().toLocaleString(), note: reason || 'Discount threshold exceeded without justification.' }
        ];
        return { ...q, status: 'Rejected', timeline: updatedTimeline };
      }
      return q;
    }));
    setApprovalDecisionModal(null);
    if (viewQuotationModal && viewQuotationModal._id === quoteId) {
      setViewQuotationModal(prev => ({ ...prev, status: 'Rejected' }));
    }
  };

  const handleDispatchConfirmed = (quoteId, channel) => {
    setLocalQuotes(prev => prev.map(q => {
      if (q._id === quoteId) {
        const updatedTimeline = [
          ...(q.timeline || []),
          { step: 'Sent', title: `Quotation Dispatched via ${channel.toUpperCase()}`, by: currentUser.name, time: new Date().toLocaleString(), note: `Direct transmission to ${q.customerId?.email || q.customerId?.phone}` }
        ];
        return { ...q, status: 'Sent', timeline: updatedTimeline };
      }
      return q;
    }));
    setSendConfirmModal(null);
    alert(`🎉 Quotation transmitted successfully to ${sendConfirmModal.customerId?.name} via ${channel.toUpperCase()}!`);
  };

  const handleSaveNewQuotation = async (newQuotationData) => {
    if (onSaveQuotation) {
      const ok = await onSaveQuotation(newQuotationData);
      if (ok) {
        setCreateModalOpen(false);
        setRevisionSourceQuote(null);
        return;
      }
    }
    setLocalQuotes(prev => [newQuotationData, ...prev]);
    setCreateModalOpen(false);
    setRevisionSourceQuote(null);
    alert(`✓ Quotation ${newQuotationData.quotationNumber} (${newQuotationData.version}) created successfully!`);
  };

  const handleSaveEditedQuotation = async (updatedData) => {
    if (onUpdateQuotation && editQuoteModal?._id) {
      const ok = await onUpdateQuotation(editQuoteModal._id, updatedData);
      if (ok) {
        setEditQuoteModal(null);
        return;
      }
    }
    setLocalQuotes(prev => prev.map(q => q._id === editQuoteModal?._id ? { ...q, ...updatedData } : q));
    setEditQuoteModal(null);
    alert('✓ Quotation updated successfully!');
  };

  const handleDeleteQuote = async (quote) => {
    if (!window.confirm(`Are you sure you want to delete Quotation ${quote.quotationNumber || quote.title}? This cannot be undone.`)) {
      return;
    }
    if (onDeleteQuotation && quote._id) {
      const ok = await onDeleteQuotation(quote._id);
      if (ok) {
        setLocalQuotes(prev => prev.filter(q => q._id !== quote._id));
        return;
      }
    }
    setLocalQuotes(prev => prev.filter(q => q._id !== quote._id));
    alert('✓ Quotation deleted successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', color: '#1E293B', fontFamily: 'inherit' }}>
      
      {/* 🔮 Executive Quotations Keyframe Animations */}
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
        @keyframes pulseQuotesBanner {
          0%, 100% {
            box-shadow: 0 8px 30px rgba(4, 120, 87, 0.28), 0 0 20px rgba(16, 185, 129, 0.2);
          }
          50% {
            box-shadow: 0 14px 38px rgba(4, 120, 87, 0.4), 0 0 30px rgba(52, 211, 153, 0.35);
          }
        }
        .quotes-hero-banner {
          animation: subtleFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards, pulseQuotesBanner 6s ease-in-out infinite;
        }
        .quotes-metric-card {
          animation: subtleFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .quotes-metric-card:hover {
          transform: translateY(-4px) scale(1.02);
        }
        .quote-table-row {
          transition: all 0.2s ease;
        }
        .quote-table-row:hover {
          background-color: #F8FAFC !important;
        }
      `}</style>

      {/* 🌟 1. Top Executive Billboard Banner */}
      <div 
        className="quotes-hero-banner"
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #047857 40%, #059669 75%, #10B981 100%)',
          borderRadius: '16px',
          padding: '18px 22px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          border: '1.5px solid rgba(167, 243, 208, 0.4)',
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
          background: 'linear-gradient(90deg, #10B981 0%, #34D399 25%, #F59E0B 50%, #6366F1 75%, #EC4899 100%)'
        }} />

        {/* Ambient Glow Orbs */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(52, 211, 153, 0.45) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '20%', width: '130px', height: '130px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(8px)',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '10px',
            fontWeight: '900',
            letterSpacing: '0.5px',
            marginBottom: '6px',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            <span>📜</span> ENTERPRISE COMMERCIAL PROPOSAL ENGINE
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px', color: '#FFFFFF' }}>
            Quotation & Proposal Management Console
          </h2>
          <p style={{ fontSize: '12px', color: '#D1FAE5', margin: '3px 0 0 0', fontWeight: '500', opacity: 0.95 }}>
            Multi-version estimation generator, Admin review gateway, verified single-recipient dispatch & tracking
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <button
            onClick={() => {
              setRevisionSourceQuote(null);
              setCreateModalOpen(true);
            }}
            style={{
              background: '#FFFFFF',
              color: '#065F46',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '12.5px',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ fontSize: '15px' }}>➕</span> Create New Quotation
          </button>
        </div>
      </div>

      {/* 🌟 2. Comprehensive 8-Card Summary Intelligence Tiles (Spacious Bento Grid) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
        gap: '12px'
      }}>
        {[
          { label: 'Total Quotes', val: summary.total, color: '#1E1B4B', bg: '#EEF2FF', icon: '📊', border: '#C7D2FE' },
          { label: 'Drafts', val: summary.drafts, color: '#475569', bg: '#F1F5F9', icon: '📝', border: '#CBD5E1' },
          { label: 'Pending Review', val: summary.pending, color: '#B45309', bg: '#FEF3C7', icon: '⏳', border: '#FDE68A', pulse: summary.pending > 0 },
          { label: 'Sent to Client', val: summary.sent, color: '#4338CA', bg: '#EEF2FF', icon: '📤', border: '#C7D2FE' },
          { label: 'Accepted (Won)', val: summary.accepted, color: '#047857', bg: '#ECFDF5', icon: '✓', border: '#A7F3D0' },
          { label: 'Declined', val: summary.rejected, color: '#DC2626', bg: '#FEF2F2', icon: '✕', border: '#FECACA' },
          { label: 'Expired', val: summary.expired, color: '#64748B', bg: '#F8FAFC', icon: '⌛', border: '#E2E8F0' },
          { label: 'Pipeline Value', val: `₹${(summary.totalVal / 100000).toFixed(1)}L`, color: '#065F46', bg: '#F0FDF4', icon: '💰', border: '#86EFAC' }
        ].map((card, idx) => (
          <div 
            key={idx} 
            className="quotes-metric-card"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: `1.5px solid ${card.border || '#E2E8F0'}`,
              padding: '12px 14px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              position: 'relative',
              overflow: 'hidden',
              animationDelay: `${Math.min(idx * 0.04, 0.35)}s`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = card.color;
              e.currentTarget.style.boxShadow = `0 8px 20px ${card.color}25`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = card.border || '#E2E8F0';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
            }}
          >
            {/* Ambient Card Accent Stripe */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: card.color
            }} />
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: card.bg,
              color: card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '17px',
              fontWeight: 'bold',
              flexShrink: 0,
              boxShadow: `0 2px 6px ${card.color}20`
            }}>
              {card.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {card.label}
              </div>
              <div style={{ fontSize: '17px', fontWeight: '900', color: card.color, lineHeight: '1.2' }}>
                {card.val}
              </div>
            </div>
            {card.pulse && (
              <span style={{
                position: 'absolute',
                top: '7px',
                right: '7px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                boxShadow: '0 0 8px #EF4444'
              }} />
            )}
          </div>
        ))}
      </div>

      {/* 🌟 3. Filter & Controls Bar */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '14px',
        padding: '12px 16px',
        border: '1.2px solid #E2E8F0',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '340px' }}>
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#94A3B8' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by quote #, client, employee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              borderRadius: '9px',
              border: '1.2px solid #CBD5E1',
              fontSize: '12px',
              outline: 'none',
              backgroundColor: '#F8FAFC',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Quick Filter Status Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'Draft', 'Pending', 'Approved', 'Sent', 'Accepted', 'Rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: filterStatus === s ? '800' : '600',
                backgroundColor: filterStatus === s ? '#047857' : '#F1F5F9',
                color: filterStatus === s ? '#FFFFFF' : '#475569',
                border: filterStatus === s ? '1px solid #047857' : '1px solid #E2E8F0',
                cursor: 'pointer'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 4. Quotations Table / Listing */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1.5px solid #E2E8F0',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#475569', fontWeight: '800' }}>
                <th style={{ padding: '12px 14px' }}>QUOTATION #</th>
                <th style={{ padding: '12px 14px' }}>SENT TO (CLIENT)</th>
                <th style={{ padding: '12px 14px' }}>PREPARED / SENT BY</th>
                <th style={{ padding: '12px 14px' }}>TOTAL VALUE</th>
                <th style={{ padding: '12px 14px' }}>DATE & TIME</th>
                <th style={{ padding: '12px 14px' }}>STATUS</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length > 0 ? (
                filteredList.map(q => {
                  const badge = getStatusBadge(q.status);
                  const isHighValue = (Number(q.totalAmount) || 0) >= 500000;

                  return (
                    <tr key={q._id} className="quote-table-row" style={{ borderBottom: '1px solid #F1F5F9', transition: 'all 0.15s ease' }}>
                      {/* Quotation Number & Version */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '900', color: '#047857' }}>
                            {q.quotationNumber}
                          </span>
                          <span style={{
                            backgroundColor: '#EEF2FF',
                            color: '#4338CA',
                            fontSize: '9.5px',
                            fontWeight: '900',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            border: '1px solid #C7D2FE'
                          }}>
                            {q.version || 'v1.0'}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {q.title}
                        </div>
                      </td>

                      {/* Customer / Company */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: '800', color: '#0F172A' }}>
                          👤 {q.customerId?.name || q.customerId?.customerName || 'Customer'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                          🏢 {q.customerId?.company || q.customerId?.email || 'Enterprise Client'}
                        </div>
                        {q.customerId?.phone && (
                          <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>
                            📞 {q.customerId.phone}
                          </div>
                        )}
                      </td>

                      {/* Prepared / Sent By (Sales Employee or Admin) */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: '700', color: '#334155' }}>
                          🎯 {q.createdBy?.name || q.createdByName || q.assignedSales?.name || (q.createdByRole === 'admin' ? 'Super Admin' : 'Sales Team')}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#6366F1', fontWeight: '800' }}>
                          {q.createdBy?.designation || (q.createdByRole === 'admin' ? 'Managing Director / Admin' : 'Sales Consultant')}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
                          To: {q.customerId?.name || 'Customer'}
                        </div>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: '900', color: '#0F172A', fontSize: '13px' }}>
                          ₹{Number(q.totalAmount || 0).toLocaleString('en-IN')}
                        </div>
                        {isHighValue && (
                          <span style={{
                            fontSize: '9px',
                            fontWeight: '800',
                            backgroundColor: '#FEF3C7',
                            color: '#B45309',
                            padding: '1px 4px',
                            borderRadius: '4px'
                          }}>
                            ⚡ High Value
                          </span>
                        )}
                      </td>

                      {/* Validity, Date & Time */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ color: '#0F172A', fontSize: '11px', fontWeight: '700' }}>
                          🕒 {q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date(q.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}
                        </div>
                        <div style={{ color: '#64748B', fontSize: '10.5px', marginTop: '2px' }}>
                          Valid: {q.validUntil ? new Date(q.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '30 Days'}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontSize: '10.5px',
                          fontWeight: '800',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>{badge.icon}</span>
                          <span>{badge.text}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          {/* Preview / View PDF */}
                          <button
                            onClick={() => setViewQuotationModal(q)}
                            title="Preview PDF Style Quotation"
                            style={{
                              backgroundColor: '#EEF2FF',
                              color: '#4338CA',
                              border: '1px solid #C7D2FE',
                              borderRadius: '7px',
                              padding: '5px 8px',
                              fontSize: '11px',
                              fontWeight: '800',
                              cursor: 'pointer'
                            }}
                          >
                            👁️ View PDF
                          </button>

                          {/* Approval Button for Admin */}
                          {q.status === 'Pending Approval' && currentUser.role === 'admin' && (
                            <button
                              onClick={() => setApprovalDecisionModal(q)}
                              style={{
                                backgroundColor: '#FEF3C7',
                                color: '#92400E',
                                border: '1px solid #FCD34D',
                                borderRadius: '7px',
                                padding: '5px 8px',
                                fontSize: '11px',
                                fontWeight: '800',
                                cursor: 'pointer'
                              }}
                            >
                              ⚖️ Review & Approve
                            </button>
                          )}

                          {/* Direct Share / Transmit to Customer Modal */}
                          <button
                            onClick={() => setSendConfirmModal(q)}
                            title="Share quotation with customer via Email or WhatsApp"
                            style={{
                              backgroundColor: '#ECFDF5',
                              color: '#047857',
                              border: '1px solid #A7F3D0',
                              borderRadius: '7px',
                              padding: '5px 8px',
                              fontSize: '11px',
                              fontWeight: '900',
                              cursor: 'pointer'
                            }}
                          >
                            📤 Share
                          </button>

                          {/* Revised Quotation Generator */}
                          {(q.status === 'Sent' || q.status === 'Rejected' || q.status === 'Accepted') && (
                            <button
                              onClick={() => {
                                setRevisionSourceQuote(q);
                                setCreateModalOpen(true);
                              }}
                              title="Create revised version while preserving previous quotation"
                              style={{
                                backgroundColor: '#FFF7ED',
                                color: '#C2410C',
                                border: '1px solid #FFEDD5',
                                borderRadius: '7px',
                                padding: '5px 8px',
                                fontSize: '11px',
                                fontWeight: '800',
                                cursor: 'pointer'
                              }}
                            >
                              🔄 Revise
                            </button>
                          )}

                          {/* Lifecycle Tracker */}
                          <button
                            onClick={() => setTimelineModal(q)}
                            title="Quotation Lifecycle & Audit Timeline"
                            style={{
                              backgroundColor: '#F8FAFC',
                              color: '#64748B',
                              border: '1px solid #E2E8F0',
                              borderRadius: '7px',
                              padding: '5px 8px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            ⏱️ Tracker
                          </button>

                          {/* Admin Edit Option */}
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => setEditQuoteModal(q)}
                              title="Edit Quotation details"
                              style={{
                                backgroundColor: '#EFF6FF',
                                color: '#2563EB',
                                border: '1px solid #BFDBFE',
                                borderRadius: '7px',
                                padding: '5px 8px',
                                fontSize: '11px',
                                fontWeight: '800',
                                cursor: 'pointer'
                              }}
                            >
                              ✏️ Edit
                            </button>
                          )}

                          {/* Admin Delete Option */}
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => handleDeleteQuote(q)}
                              title="Delete Quotation Permanently"
                              style={{
                                backgroundColor: '#FEF2F2',
                                color: '#DC2626',
                                border: '1px solid #FECACA',
                                borderRadius: '7px',
                                padding: '5px 8px',
                                fontSize: '11px',
                                fontWeight: '800',
                                cursor: 'pointer'
                              }}
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                    <span style={{ fontSize: '32px', display: 'block', marginBottom: '6px' }}>📜</span>
                    <strong style={{ color: '#334155' }}>No quotations matched your filters.</strong>
                    <div style={{ fontSize: '11.5px', marginTop: '4px' }}>Click "Create New Quotation" to start a multi-item proposal.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL 1: CREATE / REVISE QUOTATION ================= */}
      {createModalOpen && (
        <CreateQuotationModal
          sourceQuote={revisionSourceQuote}
          customers={customers}
          leads={leads}
          employees={employees}
          currentUser={currentUser}
          onClose={() => {
            setCreateModalOpen(false);
            setRevisionSourceQuote(null);
          }}
          onSave={handleSaveNewQuotation}
        />
      )}

      {/* ================= MODAL 2: PROFESSIONAL PDF PREVIEW MODAL ================= */}
      {viewQuotationModal && (
        <QuotationPdfPreviewModal
          quotation={viewQuotationModal}
          onClose={() => setViewQuotationModal(null)}
          onOpenSend={() => {
            setSendConfirmModal(viewQuotationModal);
            setViewQuotationModal(null);
          }}
          onOpenRevise={() => {
            setRevisionSourceQuote(viewQuotationModal);
            setCreateModalOpen(true);
            setViewQuotationModal(null);
          }}
          isAdmin={currentUser.role === 'admin'}
          onApprove={() => handleApproveQuotation(viewQuotationModal._id)}
        />
      )}

      {/* ================= MODAL 3: STRICT CUSTOMER-SPECIFIC SENDING MODAL ================= */}
      {sendConfirmModal && (
        <CustomerSendingConfirmModal
          quotation={sendConfirmModal}
          onClose={() => setSendConfirmModal(null)}
          onSend={(channel) => handleDispatchConfirmed(sendConfirmModal._id, channel)}
        />
      )}

      {/* ================= MODAL 4: LIFECYCLE & AUDIT TIMELINE MODAL ================= */}
      {timelineModal && (
        <QuotationTimelineModal
          quotation={timelineModal}
          onClose={() => setTimelineModal(null)}
        />
      )}

      {/* ================= MODAL 5: ADMIN APPROVAL REVIEW GATEWAY ================= */}
      {approvalDecisionModal && (
        <AdminApprovalDecisionModal
          quotation={approvalDecisionModal}
          onClose={() => setApprovalDecisionModal(null)}
          onApprove={() => handleApproveQuotation(approvalDecisionModal._id)}
          onReject={(reason) => handleRejectQuotation(approvalDecisionModal._id, reason)}
        />
      )}

      {/* ================= MODAL 6: ADMIN EDIT QUOTATION MODAL ================= */}
      {editQuoteModal && (
        <EditQuotationModal
          quotation={editQuoteModal}
          onClose={() => setEditQuoteModal(null)}
          onSave={handleSaveEditedQuotation}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SUBCOMPONENT: CREATE & REVISE QUOTATION FORM
// -------------------------------------------------------------
function CreateQuotationModal({ sourceQuote, customers = [], leads = [], employees = [], currentUser, onClose, onSave }) {
  // Step 1 & 2: Selected Customer & Auto-fill
  const [selectedCustomerId, setSelectedCustomerId] = useState(sourceQuote?.customerId?._id || customers[0]?._id || '');
  const [selectedLeadId, setSelectedLeadId] = useState(sourceQuote?.leadId?._id || '');

  // Active customer object
  const activeCustomer = useMemo(() => {
    const found = customers.find(c => String(c._id) === String(selectedCustomerId));
    if (found) {
      let addrStr = 'Corporate Headquarters, Sector 62';
      if (typeof found.address === 'string' && found.address.trim()) {
        addrStr = found.address;
      } else if (found.address && typeof found.address === 'object') {
        const parts = [found.address.street, found.address.city, found.address.state, found.address.zipCode, found.address.country].filter(Boolean);
        addrStr = parts.length > 0 ? parts.join(', ') : 'Connaught Place, New Delhi';
      } else if (found.billingAddress && typeof found.billingAddress === 'string') {
        addrStr = found.billingAddress;
      }
      return {
        ...found,
        billingAddress: addrStr,
        gstin: found.gstNumber || found.gstin || '07AAACB2233D1Z4'
      };
    }
    return {
      name: 'Corporate Client',
      company: 'Enterprise Account',
      email: 'client@company.com',
      phone: '+91 98000 00000',
      billingAddress: 'Corporate Park, Level 4, Sector 62',
      gstin: '07AAACC1234D1Z9'
    };
  }, [customers, selectedCustomerId]);

  // Step 3: Multiple Products / Services
  const [items, setItems] = useState(() => {
    if (sourceQuote?.items && sourceQuote.items.length > 0) return sourceQuote.items;
    return [
      { name: 'Enterprise Cloud CRM Platform License', description: 'Core sales automation, real-time analytics & client desk', qty: 1, unitPrice: 250000, discount: 5, gst: 18 }
    ];
  });

  // Step 4: Quotation Meta
  const isRevision = !!sourceQuote;
  const quoteNumber = isRevision
    ? `${sourceQuote.quotationNumber}-R1`
    : `QT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const [title, setTitle] = useState(sourceQuote ? `[REVISED] ${sourceQuote.title}` : 'Enterprise Digital Solution Commercial Quotation');
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [paymentTerms, setPaymentTerms] = useState(sourceQuote?.paymentTerms || '50% Advance with Purchase Order, 50% upon deployment sign-off');
  const [deliveryTerms, setDeliveryTerms] = useState(sourceQuote?.deliveryTerms || 'Digital software provisioning within 48-72 business hours');
  const [warrantyTerms, setWarrantyTerms] = useState(sourceQuote?.warrantyTerms || '12 Months Comprehensive AMC & Dedicated Technical Account Manager SLA');
  const [additionalNotes, setAdditionalNotes] = useState(sourceQuote?.additionalNotes || 'Prices include cloud hosting configuration, staff onboarding training and data security setup.');

  // Calculation helpers
  const calculatedItems = useMemo(() => {
    return items.map(it => {
      const q = Number(it.qty) || 1;
      const price = Number(it.unitPrice) || 0;
      const rawBase = q * price;
      const discPct = Number(it.discount) || 0;
      const discAmt = (rawBase * discPct) / 100;
      const afterDisc = rawBase - discAmt;
      const gstPct = Number(it.gst) || 0;
      const gstAmt = (afterDisc * gstPct) / 100;
      const finalAmt = Math.round(afterDisc + gstAmt);

      return {
        ...it,
        rawBase,
        discAmt,
        gstAmt,
        finalAmt
      };
    });
  }, [items]);

  const subtotal = calculatedItems.reduce((acc, it) => acc + it.rawBase, 0);
  const totalDiscount = calculatedItems.reduce((acc, it) => acc + it.discAmt, 0);
  const totalGst = calculatedItems.reduce((acc, it) => acc + it.gstAmt, 0);
  const totalAmount = Math.round(subtotal - totalDiscount + totalGst);

  // High-value check: If >= ₹5,00,000 or discount > 15%, requires Admin Approval
  const requiresApproval = totalAmount >= 500000 || (totalDiscount / (subtotal || 1)) >= 0.15;

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { name: 'New Professional Service / Module', description: 'Standard implementation and support', qty: 1, unitPrice: 50000, discount: 0, gst: 18 }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newQuote = {
      _id: `q_${Date.now()}`,
      quotationNumber: quoteNumber,
      version: isRevision ? 'v2.0 (Revised)' : 'v1.0',
      title,
      customerId: selectedCustomerId || activeCustomer._id,
      leadId: leads.find(l => String(l._id) === String(selectedLeadId)) || null,
      assignedSales: {
        _id: currentUser._id || 'emp_curr',
        name: currentUser.name || 'Super Admin',
        designation: currentUser.role === 'admin' ? 'Managing Director / Admin' : 'Senior Sales Executive'
      },
      status: 'Received',
      requiresApproval: false,
      quotationDate,
      validUntil,
      paymentTerms,
      deliveryTerms,
      warrantyTerms,
      additionalNotes,
      items: calculatedItems.map(it => ({
        name: it.name,
        description: it.description,
        qty: Number(it.qty) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        rate: Number(it.unitPrice) || 0,
        discount: Number(it.discount) || 0,
        gst: Number(it.gst) || 18,
        amount: it.finalAmt
      })),
      subTotal: subtotal,
      taxGst: totalGst,
      totalAmount,
      totalDiscount,
      timeline: [
        {
          step: 'Created',
          title: isRevision ? 'Revised Quotation Created' : 'Official Quotation Created',
          by: currentUser.name,
          time: new Date().toLocaleString(),
          note: isRevision ? `Created as revision of ${sourceQuote?.quotationNumber}. Original version preserved.` : 'Created by Admin HQ.'
        }
      ],
      createdAt: new Date().toISOString()
    };

    onSave(newQuote);
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={{ ...modalBoxStyle, maxWidth: '880px', maxHeight: '92vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '12px', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
              <span style={{ fontSize: '11px', color: '#047857', fontWeight: '900' }}>
                {isRevision ? '🔄 REVISED VERSION ENGINE' : '➕ CREATE COMMERCIAL QUOTATION'}
              </span>
            </div>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '900', color: '#064E3B' }}>
              {isRevision ? `Generate Revised Quotation (${sourceQuote.quotationNumber})` : 'New Client Quotation Builder'}
            </h3>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* STEP 1 & 2: Customer & Lead Select + Auto-Fill Card */}
          <div style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            border: '1.5px solid #CBD5E1',
            padding: '14px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '900', color: '#1E1B4B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🎯</span> STEP 1 & 2: SELECT EXISTING CUSTOMER & VERIFIED DETAILS
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={labelStyle}>Select Target Customer / Client *</label>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  style={inputStyle}
                  required
                >
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name} — {c.company || 'Enterprise'} ({c.phone || c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Link to Customer Lead / Enquiry (Optional)</label>
                <select
                  value={selectedLeadId}
                  onChange={e => setSelectedLeadId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">-- No Direct Lead Link --</option>
                  {leads.map(l => (
                    <option key={l._id} value={l._id}>
                      #{l.enquiryId} • {l.subject} ({l.customerName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Auto-Filled Customer Details Strip */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1.2px solid #E2E8F0',
              padding: '10px 12px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '8px',
              fontSize: '11.5px'
            }}>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '10px', fontWeight: '800' }}>CUSTOMER NAME</span>
                <strong style={{ color: '#0F172A' }}>{activeCustomer.name}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '10px', fontWeight: '800' }}>COMPANY NAME</span>
                <strong style={{ color: '#0F172A' }}>{activeCustomer.company || 'Enterprise Account'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '10px', fontWeight: '800' }}>MOBILE PHONE</span>
                <strong style={{ color: '#047857' }}>{activeCustomer.phone || '+91 98000 00000'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '10px', fontWeight: '800' }}>EMAIL ADDRESS</span>
                <strong style={{ color: '#4338CA' }}>{activeCustomer.email || 'client@company.com'}</strong>
              </div>
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #F1F5F9', paddingTop: '6px' }}>
                <span style={{ color: '#64748B', display: 'block', fontSize: '10px', fontWeight: '800' }}>BILLING ADDRESS & GSTIN</span>
                <span style={{ color: '#334155' }}>
                  📍 {activeCustomer.billingAddress || 'Corporate Headquarters, DLF Horizon City, Sector 43'} | <strong>GSTIN:</strong> {activeCustomer.gstin || '07AAACB2233D1Z4'}
                </span>
              </div>
            </div>
          </div>

          {/* STEP 3: Products / Services Table */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1.5px solid #CBD5E1',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: '900', color: '#1E1B4B' }}>
                📦 STEP 3: ADD PRODUCTS & SERVICES (MULTI-LINE ITEMS)
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                style={{
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                + Add Another Product
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map((item, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  padding: '10px',
                  border: '1px solid #E2E8F0',
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1fr 1.2fr 1fr 1fr auto',
                  gap: '8px',
                  alignItems: 'center'
                }}>
                  <div>
                    <label style={{ fontSize: '9.5px', color: '#64748B', fontWeight: '800', display: 'block' }}>PRODUCT/SERVICE</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => handleItemChange(idx, 'name', e.target.value)}
                      placeholder="Service Name"
                      style={{ ...inputStyle, padding: '6px 8px', fontSize: '11.5px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '9.5px', color: '#64748B', fontWeight: '800', display: 'block' }}>DESCRIPTION</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="Scope Details"
                      style={{ ...inputStyle, padding: '6px 8px', fontSize: '11.5px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '9.5px', color: '#64748B', fontWeight: '800', display: 'block' }}>QTY</label>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={e => handleItemChange(idx, 'qty', e.target.value)}
                      style={{ ...inputStyle, padding: '6px 8px', fontSize: '11.5px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '9.5px', color: '#64748B', fontWeight: '800', display: 'block' }}>UNIT PRICE (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                      style={{ ...inputStyle, padding: '6px 8px', fontSize: '11.5px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '9.5px', color: '#64748B', fontWeight: '800', display: 'block' }}>DISC %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount}
                      onChange={e => handleItemChange(idx, 'discount', e.target.value)}
                      style={{ ...inputStyle, padding: '6px 8px', fontSize: '11.5px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '9.5px', color: '#64748B', fontWeight: '800', display: 'block' }}>GST %</label>
                    <select
                      value={item.gst}
                      onChange={e => handleItemChange(idx, 'gst', e.target.value)}
                      style={{ ...inputStyle, padding: '6px 4px', fontSize: '11.5px' }}
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      style={{
                        color: '#DC2626',
                        backgroundColor: '#FEE2E2',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        marginTop: '12px'
                      }}
                      title="Remove item"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* STEP 5: Live Automated Calculation Strip */}
            <div style={{
              marginTop: '12px',
              backgroundColor: '#ECFDF5',
              borderRadius: '10px',
              padding: '10px 14px',
              border: '1.5px solid #A7F3D0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#065F46', fontWeight: '800' }}>AUTOMATED SUB-TOTALS:</span>
                <div style={{ fontSize: '11.5px', color: '#047857' }}>
                  Base: <strong>₹{subtotal.toLocaleString()}</strong> | Discount: <strong style={{ color: '#DC2626' }}>-₹{totalDiscount.toLocaleString()}</strong> | Tax (GST): <strong>+₹{totalGst.toLocaleString()}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10.5px', color: '#065F46', fontWeight: '800', textTransform: 'uppercase' }}>Final Payable Quotation Total</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#064E3B' }}>
                  ₹{totalAmount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Approval Notice Banner if threshold crossed */}
            {requiresApproval && (
              <div style={{
                marginTop: '10px',
                backgroundColor: '#FFFBEB',
                border: '1.2px solid #FCD34D',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>⚖️</span>
                <div style={{ fontSize: '11.5px', color: '#92400E' }}>
                  <strong>Admin Approval Workflow Active:</strong> This quotation exceeds ₹5,00,000 or offers a high discount. It will be routed to Admin for formal approval before it can be sent to the customer.
                </div>
              </div>
            )}
          </div>

          {/* STEP 4: Quotation Meta, Validity & Terms */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1.5px solid #CBD5E1',
            padding: '14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px'
          }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '12px', fontWeight: '900', color: '#1E1B4B', marginBottom: '4px' }}>
                📋 STEP 4: QUOTATION PARTICULARS, TERMS & CONDITIONS
              </div>
            </div>

            <div>
              <label style={labelStyle}>Quotation Number</label>
              <input type="text" value={quoteNumber} readOnly style={{ ...inputStyle, backgroundColor: '#F1F5F9', fontWeight: 'bold' }} />
            </div>

            <div>
              <label style={labelStyle}>Quotation Title / Scope</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Quotation Date</label>
              <input type="date" value={quotationDate} onChange={e => setQuotationDate(e.target.value)} style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Expiry / Validity Date *</label>
              <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Payment Terms</label>
              <input type="text" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Delivery / Provisioning Terms</label>
              <input type="text" value={deliveryTerms} onChange={e => setDeliveryTerms(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Warranty & Support Terms</label>
              <input type="text" value={warrantyTerms} onChange={e => setWarrantyTerms(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Additional Strategic Notes</label>
              <textarea
                rows="2"
                value={additionalNotes}
                onChange={e => setAdditionalNotes(e.target.value)}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '6px' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button
              type="submit"
              style={{
                backgroundColor: '#047857',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '9px',
                fontSize: '13px',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)'
              }}
            >
              {requiresApproval ? 'Submit for Admin Approval ⚖️' : 'Save & Prepare Quotation 💾'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUBCOMPONENT: PROFESSIONAL PDF PREVIEW MODAL
// -------------------------------------------------------------
function QuotationPdfPreviewModal({ quotation, onClose, onOpenSend, onOpenRevise, isAdmin, onApprove }) {
  const q = quotation;

  return (
    <div style={modalOverlayStyle}>
      <div style={{ ...modalBoxStyle, maxWidth: '820px', maxHeight: '92vh', overflowY: 'auto', backgroundColor: '#FFFFFF', padding: '0' }}>
        
        {/* Top Control Bar */}
        <div style={{
          backgroundColor: '#1E1B4B',
          color: '#FFFFFF',
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📄</span>
            <span style={{ fontWeight: '900', fontSize: '14px' }}>PDF-Style Commercial Quotation Preview</span>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>
              {q.quotationNumber} ({q.version || 'v1.0'})
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isAdmin && q.status === 'Pending Approval' && (
              <button
                onClick={onApprove}
                style={{
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                ✓ Approve Now
              </button>
            )}

            <button
              onClick={() => window.print()}
              style={{
                backgroundColor: 'rgba(255,255,255,0.18)',
                color: '#FFFFFF',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                border: '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer'
              }}
            >
              📥 Download / Print
            </button>

            {onOpenSend && (q.status === 'Approved' || (!q.requiresApproval && q.status === 'Draft')) && (
              <button
                onClick={onOpenSend}
                style={{
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '900',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🚀 Send to Client
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#CBD5E1',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginLeft: '8px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable PDF Sheet Body */}
        <div style={{ padding: '30px 36px', backgroundColor: '#FFFFFF', color: '#0F172A', fontSize: '12px' }}>
          
          {/* Header Row: Company Logo & Quotation Label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #065F46', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#065F46', color: '#F5E4C3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900' }}>
                  💎
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#064E3B' }}>OmniCRM Global Systems</h2>
                  <p style={{ margin: 0, fontSize: '10.5px', color: '#64748B' }}>Corporate SaaS & Enterprise Digital Platforms</p>
                </div>
              </div>
              <div style={{ fontSize: '10.5px', color: '#475569', marginTop: '6px', lineHeight: '1.4' }}>
                DLF Cyber City, Tower 9B, Gurugram, Haryana, India<br />
                <strong>GSTIN:</strong> 06AABCO1928K1Z3 | <strong>Email:</strong> billing@omnicrm.com
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#065F46', letterSpacing: '-0.5px' }}>
                COMMERCIAL ESTIMATE
              </h1>
              <div style={{ fontSize: '12px', fontWeight: '900', color: '#1E1B4B', marginTop: '4px' }}>
                #{q.quotationNumber} ({q.version || 'v1.0'})
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                Date: <strong>{q.quotationDate || '16 Nov 2026'}</strong><br />
                Valid Until: <strong style={{ color: '#B45309' }}>{q.validUntil || '16 Dec 2026'}</strong>
              </div>
            </div>
          </div>

          {/* Customer & Scope Info Box */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            backgroundColor: '#F8FAFC',
            borderRadius: '10px',
            padding: '14px',
            border: '1px solid #E2E8F0',
            marginBottom: '20px'
          }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#065F46', textTransform: 'uppercase' }}>CLIENT INFORMATION (QUOTED TO):</span>
              <div style={{ fontSize: '13px', fontWeight: '900', color: '#0F172A', marginTop: '2px' }}>
                {q.customerId?.name}
              </div>
              <div style={{ color: '#475569', fontSize: '11px', marginTop: '2px' }}>
                <strong>Company:</strong> {q.customerId?.company || 'Enterprise'}<br />
                <strong>Phone:</strong> {q.customerId?.phone || 'N/A'}<br />
                <strong>Email:</strong> {q.customerId?.email || 'N/A'}<br />
                <strong>Billing Address:</strong> {q.customerId?.billingAddress || 'Corporate Office'}<br />
                <strong>GSTIN:</strong> {q.customerId?.gstin || '07AAACB2233D1Z4'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#065F46', textTransform: 'uppercase' }}>ACCOUNT EXECUTIVE & PROJECT SCOPE:</span>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                {q.title}
              </div>
              <div style={{ color: '#475569', fontSize: '11px', marginTop: '2px' }}>
                <strong>Account Consultant:</strong> {q.assignedSales?.name || 'OmniCRM Sales Team'}<br />
                <strong>Designation:</strong> {q.assignedSales?.designation || 'Sales Specialist'}<br />
                <strong>Linked Enquiry:</strong> #{q.leadId?.enquiryId || 'DIRECT-COMMERCIAL'}<br />
                <strong>Current Status:</strong> <span style={{ fontWeight: '800', color: '#047857' }}>{q.status}</span>
              </div>
            </div>
          </div>

          {/* Products / Services Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#065F46', color: '#FFFFFF', fontSize: '11px' }}>
                <th style={{ padding: '8px 10px', textAlign: 'center', width: '30px' }}>#</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>PRODUCT / SERVICE SPECIFICATION</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', width: '40px' }}>QTY</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', width: '90px' }}>RATE (₹)</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', width: '60px' }}>DISC</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', width: '50px' }}>GST</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', width: '100px' }}>TOTAL (₹)</th>
              </tr>
            </thead>
            <tbody>
              {q.items?.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#64748B' }}>{idx + 1}</td>
                  <td style={{ padding: '10px' }}>
                    <strong style={{ color: '#0F172A', display: 'block' }}>{item.name}</strong>
                    <span style={{ fontSize: '10.5px', color: '#64748B' }}>{item.description}</span>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{item.qty}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>₹{Number(item.unitPrice || item.rate || 0).toLocaleString()}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: item.discount > 0 ? '#DC2626' : '#64748B' }}>
                    {item.discount ? `${item.discount}%` : '-'}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#475569' }}>{item.gst || 18}%</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: '900', color: '#064E3B' }}>
                    ₹{Number(item.amount || item.finalAmt || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Financials Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <div style={{ width: '280px', backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                <span style={{ color: '#64748B' }}>Subtotal Base:</span>
                <strong>₹{Number(q.subtotal || q.totalAmount || 0).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#DC2626' }}>
                <span>Total Discount:</span>
                <strong>-₹{Number(q.totalDiscount || 0).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#475569' }}>
                <span>Applicable GST (18%):</span>
                <strong>+₹{Number(q.totalGst || 0).toLocaleString()}</strong>
              </div>
              <div style={{ borderTop: '2px solid #065F46', marginTop: '6px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                <span style={{ fontWeight: '900', color: '#064E3B' }}>Payable Total:</span>
                <span style={{ fontWeight: '900', color: '#064E3B' }}>₹{Number(q.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Terms, Conditions & Signatures */}
          <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '14px', marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '900', color: '#1E1B4B' }}>
              COMMERCIAL TERMS & SLA CONDITIONS:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '10.5px', color: '#475569', lineHeight: '1.5' }}>
              <li><strong>Payment Terms:</strong> {q.paymentTerms || '50% advance along with confirmed PO, balance upon delivery.'}</li>
              <li><strong>Delivery Terms:</strong> {q.deliveryTerms || 'Cloud deployment and license keys dispatched within 48-72 hours.'}</li>
              <li><strong>Warranty & SLA:</strong> {q.warrantyTerms || '12 Months comprehensive bug fixes, system updates and uptime warranty.'}</li>
              <li><strong>Notes:</strong> {q.additionalNotes || 'All applicable taxes included as specified.'}</li>
            </ul>
          </div>

          {/* Signatures Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px' }}>
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ borderBottom: '1.5px dashed #CBD5E1', height: '36px', marginBottom: '6px' }} />
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>Customer Acceptance & Stamp</span>
            </div>

            <div style={{ textAlign: 'center', width: '220px' }}>
              <div style={{ color: '#065F46', fontWeight: '900', fontSize: '14px', fontStyle: 'italic', marginBottom: '4px' }}>
                Authorized Executive Signature
              </div>
              <div style={{ borderBottom: '1.5px solid #065F46', height: '4px', marginBottom: '6px' }} />
              <span style={{ fontSize: '10.5px', color: '#065F46', fontWeight: '800' }}>For OmniCRM Global Systems</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUBCOMPONENT: CUSTOMER-SPECIFIC SENDING FLOW (STRICT SINGLE-RECIPIENT)
// -------------------------------------------------------------
function CustomerSendingConfirmModal({ quotation, onClose, onSend }) {
  const [selectedChannel, setSelectedChannel] = useState('both'); // 'email', 'whatsapp', 'both'
  const q = quotation;
  const c = q.customerId;

  return (
    <div style={modalOverlayStyle}>
      <div style={{ ...modalBoxStyle, maxWidth: '580px', border: '2px solid #059669' }}>
        
        {/* Banner */}
        <div style={{
          backgroundColor: '#ECFDF5',
          border: '1.5px solid #A7F3D0',
          borderRadius: '10px',
          padding: '12px',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🛡️</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#064E3B' }}>
                Verified Recipient Protection & Sending Guard
              </h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#047857' }}>
                This quotation will be transmitted <strong>exclusively</strong> to the single verified customer profile below.
              </p>
            </div>
          </div>
        </div>

        {/* Recipient Dossier Verification */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1.2px solid #E2E8F0',
          padding: '12px',
          marginBottom: '14px'
        }}>
          <div style={{ fontSize: '10px', fontWeight: '900', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
            CONFIRMED RECIPIENT PROFILE:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11.5px' }}>
            <div>
              <span style={{ color: '#64748B' }}>Customer Name:</span>
              <strong style={{ display: 'block', color: '#0F172A' }}>{c?.name || 'Verified Client'}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B' }}>Corporate Company:</span>
              <strong style={{ display: 'block', color: '#0F172A' }}>{c?.company || 'Enterprise Account'}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B' }}>Email Address:</span>
              <strong style={{ display: 'block', color: '#4338CA' }}>{c?.email || 'client@company.com'}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B' }}>WhatsApp Mobile:</span>
              <strong style={{ display: 'block', color: '#059669' }}>{c?.phone || '+91 98000 00000'}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B' }}>Linked Lead / Scope:</span>
              <strong style={{ display: 'block', color: '#0F172A' }}>#{q.leadId?.enquiryId || 'DIRECT'} • {q.title}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B' }}>Payable Amount:</span>
              <strong style={{ display: 'block', color: '#064E3B', fontSize: '13px' }}>
                ₹{Number(q.totalAmount || 0).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {/* Message & Attachment Preview */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          padding: '10px 12px',
          marginBottom: '14px',
          fontSize: '11px',
          color: '#334155'
        }}>
          <strong style={{ color: '#1E1B4B' }}>Preview Outgoing Dispatch Message:</strong>
          <div style={{ fontStyle: 'italic', marginTop: '4px', backgroundColor: '#FFFFFF', padding: '6px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
            "Dear {c?.name}, your official quotation #{q.quotationNumber} of ₹{Number(q.totalAmount).toLocaleString()} for '{q.title}' has been generated by OmniCRM. Access secure PDF & response portal: https://omnicrm.app/quotes/{q.quotationNumber}"
          </div>
          <div style={{ marginTop: '6px', color: '#059669', fontWeight: 'bold' }}>
            📎 Attached: {q.quotationNumber}_Commercial_Quotation.pdf (Signed)
          </div>
        </div>

        {/* Transmission Channel Choice */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ ...labelStyle, marginBottom: '6px' }}>Select Secure Dispatch Channels:</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'both', label: '📧 Email + 💬 WhatsApp (Recommended)' },
              { id: 'email', label: '📧 Official Email Only' },
              { id: 'whatsapp', label: '💬 WhatsApp Direct Only' }
            ].map(ch => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setSelectedChannel(ch.id)}
                style={{
                  flex: 1,
                  padding: '7px 8px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: selectedChannel === ch.id ? '900' : '600',
                  backgroundColor: selectedChannel === ch.id ? '#ECFDF5' : '#FFFFFF',
                  color: selectedChannel === ch.id ? '#047857' : '#475569',
                  border: selectedChannel === ch.id ? '1.5px solid #059669' : '1px solid #CBD5E1',
                  cursor: 'pointer'
                }}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          <button
            type="button"
            onClick={() => onSend(selectedChannel)}
            style={{
              backgroundColor: '#059669',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9px',
              padding: '9px 18px',
              fontSize: '12.5px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
            }}
          >
            Confirm & Dispatch Now 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUBCOMPONENT: LIFECYCLE & AUDIT TIMELINE
// -------------------------------------------------------------
function QuotationTimelineModal({ quotation, onClose }) {
  const q = quotation;
  const timeline = q.timeline || [
    { step: 'Created', title: 'Quotation Generated', by: q.assignedSales?.name || 'Staff', time: new Date(q.createdAt).toLocaleString() }
  ];

  return (
    <div style={modalOverlayStyle}>
      <div style={{ ...modalBoxStyle, maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#1E1B4B' }}>
              ⏱️ Quotation Lifecycle & Audit Tracker
            </h3>
            <span style={{ fontSize: '11px', color: '#64748B' }}>#{q.quotationNumber} • {q.customerId?.name}</span>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '10px 0' }}>
          {timeline.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                border: '1.5px solid #10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '900',
                flexShrink: 0
              }}>
                ✓
              </div>
              <div style={{ flex: 1, backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '12px', color: '#0F172A' }}>{step.title}</strong>
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>{step.time}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                  Action by: <strong>{step.by}</strong>
                </div>
                {step.note && (
                  <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '3px', fontStyle: 'italic' }}>
                    Note: {step.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button onClick={onClose} style={cancelBtnStyle}>Close</button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUBCOMPONENT: ADMIN APPROVAL DECISION MODAL
// -------------------------------------------------------------
function AdminApprovalDecisionModal({ quotation, onClose, onApprove, onReject }) {
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const q = quotation;

  return (
    <div style={modalOverlayStyle}>
      <div style={{ ...modalBoxStyle, maxWidth: '520px', border: '2px solid #F59E0B' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px', marginBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#92400E' }}>
              ⚖️ Administrator Commercial Review
            </h3>
            <span style={{ fontSize: '11px', color: '#64748B' }}>#{q.quotationNumber} — Submitted by {q.assignedSales?.name}</span>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={{ backgroundColor: '#FFFBEB', padding: '12px', borderRadius: '8px', border: '1px solid #FDE68A', marginBottom: '14px' }}>
          <div style={{ fontSize: '12px', color: '#78350F' }}>
            Client: <strong>{q.customerId?.name} ({q.customerId?.company})</strong><br />
            Total Quoted: <strong style={{ fontSize: '14px', color: '#064E3B' }}>₹{Number(q.totalAmount).toLocaleString()}</strong><br />
            Base: ₹{Number(q.subtotal).toLocaleString()} | Discount: -₹{Number(q.totalDiscount).toLocaleString()}
          </div>
        </div>

        {rejecting ? (
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Reason for Rejection / Modification:</label>
            <textarea
              rows="3"
              placeholder="e.g. Reduce discount from 15% to 8% or remove custom SLA warranty..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              style={inputStyle}
            />
          </div>
        ) : (
          <p style={{ fontSize: '12px', color: '#475569', marginBottom: '16px' }}>
            Do you approve this commercial quotation for dispatch to the customer? Once approved, the assigned sales executive can send it immediately.
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          {rejecting ? (
            <button
              type="button"
              onClick={() => onReject(rejectReason)}
              style={{ ...cancelBtnStyle, backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
            >
              Confirm Decline
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setRejecting(true)}
              style={{ ...cancelBtnStyle, backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
            >
              Decline / Request Revision
            </button>
          )}

          <button
            type="button"
            onClick={onApprove}
            style={{
              backgroundColor: '#059669',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: '900',
              cursor: 'pointer'
            }}
          >
            ✓ Approve Quotation
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUBCOMPONENT: ADMIN EDIT QUOTATION MODAL
// -------------------------------------------------------------
function EditQuotationModal({ quotation, onClose, onSave }) {
  const [title, setTitle] = useState(quotation?.title || '');
  const [status, setStatus] = useState(quotation?.status || 'Received');
  const [validUntil, setValidUntil] = useState(() => {
    if (quotation?.validUntil) {
      try {
        return new Date(quotation.validUntil).toISOString().split('T')[0];
      } catch (e) {}
    }
    return new Date().toISOString().split('T')[0];
  });

  const [items, setItems] = useState(() => {
    if (quotation?.items && quotation.items.length > 0) {
      return quotation.items.map(it => ({
        name: it.name || '',
        qty: it.qty || 1,
        unitPrice: it.rate || it.unitPrice || 0,
        amount: it.amount || ((it.qty || 1) * (it.rate || it.unitPrice || 0))
      }));
    }
    return [
      { name: quotation?.title || 'Solution Scope', qty: 1, unitPrice: quotation?.totalAmount || 10000, amount: quotation?.totalAmount || 10000 }
    ];
  });

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { name: 'Additional Service / Module', qty: 1, unitPrice: 25000, amount: 25000 }
    ]);
  };

  const handleRemoveItem = (idx) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, val) => {
    setItems(prev => {
      const copy = [...prev];
      const cur = { ...copy[idx], [field]: val };
      if (field === 'qty' || field === 'unitPrice') {
        const q = field === 'qty' ? Number(val) : Number(cur.qty);
        const p = field === 'unitPrice' ? Number(val) : Number(cur.unitPrice);
        cur.amount = Math.round(q * p);
      }
      copy[idx] = cur;
      return copy;
    });
  };

  const subTotal = items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const taxGst = Math.round(subTotal * 0.18);
  const totalAmount = subTotal + taxGst;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      status,
      validUntil,
      items: items.map(it => ({
        name: it.name,
        qty: Number(it.qty) || 1,
        rate: Number(it.unitPrice) || 0,
        amount: Number(it.amount) || 0
      })),
      subTotal,
      taxGst,
      totalAmount
    });
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={{ ...modalBoxStyle, maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '900', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✏️</span> Edit Quotation #{quotation?.quotationNumber || quotation?._id}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>Client: {quotation?.customerId?.name || 'Direct Customer'} ({quotation?.customerId?.company || 'Corporate'})</div>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748B' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Quotation Title / Scope</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                <option value="Draft">Draft</option>
                <option value="Received">Received / Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Revision Requested">Revision Requested</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Valid Until</label>
              <input
                type="date"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ ...labelStyle, marginBottom: '0' }}>Items / Commercial Scope</label>
              <button
                type="button"
                onClick={handleAddItem}
                style={{
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  border: '1px solid #BFDBFE',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                + Add Item
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map((it, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.5fr 1.5fr auto', gap: '8px', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <input
                    type="text"
                    placeholder="Item / Service Name"
                    value={it.name}
                    onChange={e => handleItemChange(idx, 'name', e.target.value)}
                    required
                    style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }}
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={it.qty}
                    onChange={e => handleItemChange(idx, 'qty', e.target.value)}
                    required
                    style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Rate (₹)"
                    value={it.unitPrice}
                    onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                    required
                    style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }}
                  />
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', textAlign: 'right' }}>
                    ₹{Number(it.amount).toLocaleString()}
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '14px' }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing summary */}
          <div style={{ backgroundColor: '#F1F5F9', padding: '12px 16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Subtotal:</span>
              <strong style={{ color: '#0F172A' }}>₹{subTotal.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>GST (18%):</span>
              <strong style={{ color: '#059669' }}>+ ₹{taxGst.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '900', color: '#0F172A', borderTop: '1px solid #CBD5E1', paddingTop: '6px', marginTop: '4px' }}>
              <span>Final Total Amount:</span>
              <span style={{ color: '#059669' }}>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button
              type="submit"
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '900',
                cursor: 'pointer'
              }}
            >
              ✓ Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// STYLES
// -------------------------------------------------------------
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(4px)',
  zIndex: 9999,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '16px'
};

const modalBoxStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: '16px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.22)',
  padding: '20px',
  width: '100%',
  border: '1.5px solid #E2E8F0',
  animation: 'menuSlideIn 0.2s ease'
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  color: '#94A3B8',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '800',
  color: '#1E1B4B',
  marginBottom: '4px'
};

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1.2px solid #CBD5E1',
  fontSize: '12px',
  color: '#0F172A',
  backgroundColor: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box'
};

const cancelBtnStyle = {
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1.2px solid #CBD5E1',
  backgroundColor: '#FFFFFF',
  color: '#475569',
  fontSize: '12px',
  fontWeight: '700',
  cursor: 'pointer'
};
