import React, { useState } from 'react';
import { SourceBadge, detectLeadDuplicates, normalizeSource, SOURCE_CONFIG } from '../utils/leadSourceUtils.jsx';

// Status badge styling with authentic colors and glowing indicators
const getStatusBadge = (status = 'New') => {
  const s = String(status).toLowerCase().trim();
  if (s === 'submitted' || s === 'received' || s === 'new' || s === 'open') {
    return {
      bg: '#EFF6FF',
      border: '#BFDBFE',
      text: '#1D4ED8',
      dot: '#3B82F6',
      label: 'Submitted'
    };
  }
  if (s === 'assigned') {
    return {
      bg: '#ECFDF5',
      border: '#A7F3D0',
      text: '#047857',
      dot: '#10B981',
      label: 'Assigned'
    };
  }
  if (s === 'contacted' || s === 'in discussion' || s === 'in_progress') {
    return {
      bg: '#F5F3FF',
      border: '#DDD6FE',
      text: '#6D28D9',
      dot: '#8B5CF6',
      label: 'In Discussion'
    };
  }
  if (s === 'qualified' || s === 'proposal sent' || s === 'negotiation') {
    return {
      bg: '#FFFBEB',
      border: '#FDE68A',
      text: '#B45309',
      dot: '#F59E0B',
      label: 'Qualified'
    };
  }
  if (s === 'converted' || s === 'won' || s === 'closed' || s === 'accepted') {
    return {
      bg: '#F0FDF4',
      border: '#86EFAC',
      text: '#15803D',
      dot: '#22C55E',
      label: 'Converted'
    };
  }
  return {
    bg: '#F1F5F9',
    border: '#CBD5E1',
    text: '#475569',
    dot: '#94A3B8',
    label: status
  };
};

const getPriorityBadge = (priority = 'Medium') => {
  const p = String(priority).toLowerCase().trim();
  if (p === 'urgent' || p === 'high') {
    return {
      bg: '#FEF2F2',
      border: '#FECACA',
      text: '#DC2626',
      icon: '⚡',
      label: priority || 'High'
    };
  }
  if (p === 'low') {
    return {
      bg: '#F8FAFC',
      border: '#E2E8F0',
      text: '#64748B',
      icon: '🌱',
      label: priority || 'Low'
    };
  }
  return {
    bg: '#EEF2FF',
    border: '#C7D2FE',
    text: '#4338CA',
    icon: '⚡',
    label: priority || 'Medium'
  };
};

export default function LeadsTab({
  leads = [],
  customers = [],
  onOpenAddLead,
  onOpenAssignModal,
  onOpenLeadDetails,
  onOpenCustomerHistory
}) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'cards' (Bento grid) or 'table'

  // Map of customers by _id for instant lookup when customerId is just a string ID
  const customerMap = React.useMemo(() => {
    const map = {};
    customers.forEach(c => {
      if (c && c._id) map[String(c._id)] = c;
    });
    return map;
  }, [customers]);

  // 1. Normalize all leads data from MongoDB Enquiry records with duplicate detection
  const normalizedLeads = React.useMemo(() => {
    return leads.map(l => {
      const linkedCust = typeof l.customerId === 'object' && l.customerId !== null
        ? l.customerId
        : (customerMap[String(l.customerId)] || null);

      const clientName = linkedCust?.name || l.customerName || l.name || (linkedCust?.email ? linkedCust.email.split('@')[0] : 'Enterprise Client');
      const clientPhone = linkedCust?.phone || l.phone || 'N/A';
      const clientEmail = linkedCust?.email || l.email || '';
      const specialistName = l.assignedSales?.name || l.assignedSalesId?.name || null;
      const specialistDesignation = l.assignedSales?.designation || l.assignedSalesId?.designation || 'Sales Consultant';
      const reqSubject = l.subject || l.productService || 'Commercial Solution Requirement';
      const budgetVal = l.budget ? (typeof l.budget === 'number' ? `₹${l.budget.toLocaleString('en-IN')}` : l.budget) : '₹5,00,000';
      const priority = l.priority || 'High';
      const rawStatus = (l.status || 'New').trim();
      const normSource = normalizeSource(l.source || 'Website');

      // Duplicate lead check
      const dupInfo = detectLeadDuplicates(l, leads, customers);

      // Extract assignment date and time
      let assignedRaw = l.assignedSales?.assignedAt || l.assignedAt;
      if (!assignedRaw && Array.isArray(l.timeline)) {
        const assignEvent = l.timeline.slice().reverse().find(t => 
          (t.step && t.step.toLowerCase().includes('assign')) ||
          (t.title && t.title.toLowerCase().includes('assign')) ||
          (t.status && t.status.toLowerCase() === 'assigned')
        );
        if (assignEvent) {
          assignedRaw = assignEvent.timestamp || assignEvent.date;
        }
      }
      if (!assignedRaw && specialistName && (rawStatus.toLowerCase() === 'assigned')) {
        assignedRaw = l.updatedAt;
      }

      let assignedDateFormatted = null;
      if (assignedRaw) {
        try {
          const d = new Date(assignedRaw);
          if (!isNaN(d.getTime())) {
            assignedDateFormatted = d.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }) + ', ' + d.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
          }
        } catch (_) {}
      }

      // Received date tracking: Today / Yesterday / Exact Date
      const createdRaw = l.createdAt || l.date;
      let arrivalBadge = 'New Lead';
      let arrivalFormatted = '';
      if (createdRaw) {
        const cDate = new Date(createdRaw);
        const now = new Date();
        const isToday = cDate.toDateString() === now.toDateString();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = cDate.toDateString() === yesterday.toDateString();

        arrivalFormatted = cDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        arrivalBadge = isToday ? '✨ Today' : isYesterday ? '🕒 Yesterday' : `📅 ${arrivalFormatted}`;
      }

      return {
        ...l,
        _arrivalBadge: arrivalBadge,
        _arrivalFormatted: arrivalFormatted,
        _clientName: clientName,
        _clientPhone: clientPhone,
        _clientEmail: clientEmail,
        _specialistName: specialistName,
        _specialistDesignation: specialistDesignation,
        _assignedDateFormatted: assignedDateFormatted,
        _reqSubject: reqSubject,
        _budgetVal: budgetVal,
        _priority: priority,
        _status: rawStatus,
        _normSource: normSource,
        _isDuplicate: dupInfo.isDuplicate,
        _priorEnquiries: dupInfo.priorEnquiries,
        _matchReasons: dupInfo.matchReasons,
        _existingCustomer: dupInfo.existingCustomer || linkedCust
      };
    });
  }, [leads, customers, customerMap]);

  // 2. Count accurate totals per filter category (Requirement E)
  const isDateToday = (d) => {
    if (!d) return false;
    const target = new Date(d);
    const today = new Date();
    return target.toDateString() === today.toDateString();
  };

  const isDateYesterday = (d) => {
    if (!d) return false;
    const target = new Date(d);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return target.toDateString() === yesterday.toDateString();
  };

  const isDueOrPast = (d) => {
    if (!d) return false;
    const target = new Date(d).setHours(23, 59, 59, 999);
    return target <= Date.now();
  };

  const counts = {
    all: normalizedLeads.length,
    todayCalls: normalizedLeads.filter(l => isDateToday(l.reminderDate) || (l.reminderDate && isDueOrPast(l.reminderDate))).length,
    allReminders: normalizedLeads.filter(l => !!l.reminderDate).length,
    todayLeads: normalizedLeads.filter(l => isDateToday(l.createdAt || l.date)).length,
    yesterdayLeads: normalizedLeads.filter(l => isDateYesterday(l.createdAt || l.date)).length,
    new: normalizedLeads.filter(l => {
      const s = l._status.toLowerCase();
      return (s === 'new' || s === 'submitted' || s === 'open' || s === 'received' || s === 'under review') && !l._specialistName;
    }).length,
    contacted: normalizedLeads.filter(l => {
      const s = l._status.toLowerCase();
      return s === 'contacted' || s === 'in discussion' || s === 'in_progress';
    }).length,
    qualified: normalizedLeads.filter(l => {
      const s = l._status.toLowerCase();
      return s === 'qualified' || s === 'proposal sent' || s === 'negotiation';
    }).length,
    converted: normalizedLeads.filter(l => {
      const s = l._status.toLowerCase();
      return s === 'converted' || s === 'won' || s === 'closed' || s === 'accepted';
    }).length,
    duplicates: normalizedLeads.filter(l => l._isDuplicate).length,
    whatsapp: normalizedLeads.filter(l => l._normSource === 'WhatsApp').length,
    instagram: normalizedLeads.filter(l => l._normSource === 'Instagram').length,
    facebook: normalizedLeads.filter(l => l._normSource === 'Facebook').length,
    linkedin: normalizedLeads.filter(l => l._normSource === 'LinkedIn').length,
    website: normalizedLeads.filter(l => l._normSource === 'Website').length,
    other: normalizedLeads.filter(l => !['WhatsApp', 'Instagram', 'Facebook', 'LinkedIn', 'Website'].includes(l._normSource)).length
  };

  // 3. Filter matching against selection
  const filtered = normalizedLeads.filter(l => {
    const s = l._status.toLowerCase();
    const hasSpecialist = !!l._specialistName;
    const createD = l.createdAt || l.date;

    if (filter === 'TodayCalls') {
      if (!l.reminderDate) return false;
      return isDateToday(l.reminderDate) || isDueOrPast(l.reminderDate);
    } else if (filter === 'AllReminders') {
      if (!l.reminderDate) return false;
    } else if (filter === 'TodayLeads') {
      if (!isDateToday(createD)) return false;
    } else if (filter === 'YesterdayLeads') {
      if (!isDateYesterday(createD)) return false;
    } else if (filter === 'New') {
      const isNewStatus = s === 'new' || s === 'submitted' || s === 'open' || s === 'received' || s === 'under review';
      if (!isNewStatus && hasSpecialist) return false;
    } else if (filter === 'Contacted') {
      if (s !== 'contacted' && s !== 'in discussion' && s !== 'in_progress') return false;
    } else if (filter === 'Qualified') {
      if (s !== 'qualified' && s !== 'proposal sent' && s !== 'negotiation') return false;
    } else if (filter === 'Converted') {
      if (s !== 'converted' && s !== 'won' && s !== 'closed' && s !== 'accepted') return false;
    } else if (filter === 'Duplicates') {
      if (!l._isDuplicate) return false;
    } else if (filter === 'WhatsApp') {
      if (l._normSource !== 'WhatsApp') return false;
    } else if (filter === 'Instagram') {
      if (l._normSource !== 'Instagram') return false;
    } else if (filter === 'Facebook') {
      if (l._normSource !== 'Facebook') return false;
    } else if (filter === 'LinkedIn') {
      if (l._normSource !== 'LinkedIn') return false;
    } else if (filter === 'Website') {
      if (l._normSource !== 'Website') return false;
    } else if (filter === 'Other') {
      if (['WhatsApp', 'Instagram', 'Facebook', 'LinkedIn', 'Website'].includes(l._normSource)) return false;
    }

    if (search) {
      const q = search.toLowerCase();
      return (
        l._reqSubject?.toLowerCase().includes(q) ||
        l._clientName?.toLowerCase().includes(q) ||
        l._clientPhone?.toLowerCase().includes(q) ||
        l._clientEmail?.toLowerCase().includes(q) ||
        l.enquiryId?.toLowerCase().includes(q) ||
        l._specialistName?.toLowerCase().includes(q) ||
        l._status?.toLowerCase().includes(q) ||
        l.source?.toLowerCase().includes(q) ||
        l.platformLeadId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* 🔮 Executive Leads Tab Animations & Styling */}
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
        @keyframes pulseLeadsBanner {
          0%, 100% {
            box-shadow: 0 8px 30px rgba(6, 78, 59, 0.25), 0 0 20px rgba(16, 185, 129, 0.2);
          }
          50% {
            box-shadow: 0 14px 38px rgba(6, 78, 59, 0.38), 0 0 30px rgba(52, 211, 153, 0.35);
          }
        }
        .leads-hero-banner {
          animation: subtleFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards, pulseLeadsBanner 6s ease-in-out infinite;
        }
        .lead-bento-card {
          animation: subtleFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lead-bento-card:hover {
          transform: translateY(-4px) scale(1.012);
        }
      `}</style>

      {/* 🌟 1. Executive Emerald/Forest Hero Billboard Banner */}
      <div 
        className="leads-hero-banner"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 40%, #312E81 75%, #4338CA 100%)',
          padding: '18px 22px',
          borderRadius: '16px',
          color: '#FFFFFF',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.12)'
        }}
      >
        {/* Animated Top Indigo Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: '#4338CA'
        }} />

        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-25px', left: '20%', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(67, 56, 202, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            backgroundColor: 'rgba(255,255,255,0.12)', 
            backdropFilter: 'blur(8px)',
            padding: '4px 10px', 
            borderRadius: '16px', 
            fontSize: '10px', 
            fontWeight: '900', 
            letterSpacing: '0.5px', 
            marginBottom: '6px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <span>📋</span> REAL-TIME SALES PIPELINE • DUPLICATE DETECTION & SOURCE TRACKING
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px', color: '#FFFFFF' }}>
            Customer Enquiries & Sales Leads
          </h2>
          <p style={{ fontSize: '12px', margin: '3px 0 0 0', opacity: 0.9, color: '#C7D2FE' }}>
            Multi-channel inbound tracking, automated duplicate warnings, and instant specialist assignment.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
          {/* View Toggle */}
          <div style={{ 
            display: 'flex', 
            backgroundColor: 'rgba(255,255,255,0.14)', 
            backdropFilter: 'blur(8px)',
            borderRadius: '10px', 
            padding: '3px', 
            border: '1px solid rgba(255,255,255,0.25)' 
          }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                fontSize: '11px',
                fontWeight: '900',
                border: 'none',
                backgroundColor: viewMode === 'cards' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'cards' ? '#1E1B4B' : '#FFFFFF',
                boxShadow: viewMode === 'cards' ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                fontSize: '11px',
                fontWeight: '900',
                border: 'none',
                backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'table' ? '#1E1B4B' : '#FFFFFF',
                boxShadow: viewMode === 'table' ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Table
            </button>
          </div>

          <button
            onClick={onOpenAddLead}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#1E1B4B',
              fontSize: '12px',
              fontWeight: '900',
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span>➕</span> Capture Lead
          </button>
        </div>
      </div>

      {/* 🌟 2. Filter Bar with Dashboard Filters (Requirement E) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: '10px 14px',
        borderRadius: '14px',
        border: '1.2px solid #E2E8F0',
        gap: '10px',
        flexWrap: 'wrap',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
      }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', flex: '1 1 auto' }}>
          {[
            { id: 'All', label: 'All Leads', count: counts.all, color: '#4338CA', bg: '#EEF2FF' },
            { id: 'TodayCalls', label: '📞 Today Call Reminders', count: counts.todayCalls, color: '#DC2626', bg: '#FEE2E2' },
            { id: 'AllReminders', label: '⏰ All Scheduled Reminders', count: counts.allReminders, color: '#D97706', bg: '#FEF3C7' },
            { id: 'TodayLeads', label: '✨ Today Received', count: counts.todayLeads, color: '#059669', bg: '#ECFDF5' },
            { id: 'YesterdayLeads', label: '🕒 Yesterday Received', count: counts.yesterdayLeads, color: '#0284C7', bg: '#E0F2FE' },
            { id: 'New', label: '⏳ New Leads', count: counts.new, color: '#2563EB', bg: '#EFF6FF' },
            { id: 'Contacted', label: '💬 Contacted', count: counts.contacted, color: '#7C3AED', bg: '#F5F3FF' },
            { id: 'Qualified', label: '⚡ Qualified', count: counts.qualified, color: '#B45309', bg: '#FFFBEB' },
            { id: 'Converted', label: '🏆 Converted', count: counts.converted, color: '#15803D', bg: '#F0FDF4' },
            { id: 'Duplicates', label: '⚠️ Duplicate Leads', count: counts.duplicates, color: '#DC2626', bg: '#FEE2E2' },
            { id: 'WhatsApp', label: '💬 WhatsApp', count: counts.whatsapp, color: '#16A34A', bg: '#DCFCE7' },
            { id: 'Instagram', label: '📸 Instagram', count: counts.instagram, color: '#E11D48', bg: '#FFE4E6' },
            { id: 'Facebook', label: '👥 Facebook', count: counts.facebook, color: '#1D4ED8', bg: '#DBEAFE' },
            { id: 'LinkedIn', label: '💼 LinkedIn', count: counts.linkedin, color: '#0284C7', bg: '#E0F2FE' },
            { id: 'Website', label: '🌐 Website', count: counts.website, color: '#0D9488', bg: '#CCFBF1' },
            { id: 'Other', label: '📡 Other Sources', count: counts.other, color: '#475569', bg: '#F1F5F9' }
          ].map(tab => {
            const isSelected = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '800',
                  backgroundColor: isSelected ? tab.color : '#FFFFFF',
                  border: isSelected ? `1.5px solid ${tab.color}` : '1.2px solid #E2E8F0',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? `0 2px 8px ${tab.color}35` : 'none'
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : tab.bg,
                  color: isSelected ? '#FFFFFF' : tab.color,
                  fontSize: '9.5px',
                  fontWeight: '900',
                  padding: '1px 6px',
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
          placeholder="🔍 Search name, phone, email, source..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            minWidth: '220px',
            flex: '0 1 250px',
            padding: '7px 12px',
            borderRadius: '9px',
            border: '1.5px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            fontSize: '11.5px',
            fontWeight: '600',
            color: '#0F172A',
            outline: 'none'
          }}
        />
      </div>

      {/* 🌟 3. CARDS BENTO GRID VIEW WITH SOURCE TRACKING & DUPLICATE BADGES */}
      {viewMode === 'cards' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px'
        }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '36px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1.2px solid var(--border)', color: 'var(--text-muted)', fontSize: '13px' }}>
              No leads found under <strong>"{filter}"</strong> category in the live database.
            </div>
          ) : (
            filtered.map((l, idx) => {
              const isAssigned = !!l._specialistName;
              const isConverted = l._status.toLowerCase().includes('converted') || l._status.toLowerCase().includes('won');
              const isUrgent = l._priority === 'Urgent' || l._priority === 'High';
              const isDuplicate = l._isDuplicate;

              const cardBorder = '#E2E8F0';

              const cardGlow = 'rgba(15, 23, 42, 0.04)';

              const cardAccentTop = '#4338CA';

              return (
                <div
                  key={l._id || idx}
                  className="lead-bento-card"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: `1.5px solid ${cardBorder}`,
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: `0 4px 18px ${cardGlow}`,
                    position: 'relative',
                    overflow: 'hidden',
                    animationDelay: `${Math.min(idx * 0.04, 0.4)}s`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#94A3B8';
                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(15, 23, 42, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.boxShadow = '0 4px 18px rgba(15, 23, 42, 0.04)';
                  }}
                >
                  {/* Top Ambient Card Accent Stripe */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3.5px',
                    background: cardAccentTop
                  }} />
                  <div>
                    {/* Top Row: Enquiry ID, Source Badge, Priority & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{
                          backgroundColor: '#1E1B4B',
                          color: '#F5E4C3',
                          fontSize: '9.5px',
                          fontWeight: '900',
                          padding: '2px 6px',
                          borderRadius: '5px',
                          letterSpacing: '0.4px'
                        }}>
                          #{l.enquiryId || l._id?.slice(-5)}
                        </span>
                        {/* Requirement C: Lead Source Tracking Badge */}
                        <SourceBadge source={l.source} size="small" />

                        {/* 📅 Lead Arrival Date Badge (Today / Yesterday / Exact Date) */}
                        <span style={{
                          backgroundColor: l._arrivalBadge.includes('Today') ? '#ECFDF5' : l._arrivalBadge.includes('Yesterday') ? '#EFF6FF' : '#F8FAFC',
                          color: l._arrivalBadge.includes('Today') ? '#047857' : l._arrivalBadge.includes('Yesterday') ? '#1D4ED8' : '#475569',
                          border: `1px solid ${l._arrivalBadge.includes('Today') ? '#A7F3D0' : l._arrivalBadge.includes('Yesterday') ? '#BFDBFE' : '#E2E8F0'}`,
                          fontSize: '9px',
                          fontWeight: '800',
                          padding: '1px 6px',
                          borderRadius: '4px'
                        }}>
                          {l._arrivalBadge}
                        </span>

                        {isUrgent && (
                          <span style={{
                            backgroundColor: '#FEE2E2',
                            color: '#DC2626',
                            border: '1px solid #FCA5A5',
                            fontSize: '9px',
                            fontWeight: '800',
                            padding: '1px 5px',
                            borderRadius: '4px'
                          }}>
                            🔥 High
                          </span>
                        )}
                      </div>

                      <span style={{
                        backgroundColor: isConverted ? '#F5F3FF' : isAssigned ? '#ECFDF5' : '#FEF3C7',
                        color: isConverted ? '#7C3AED' : isAssigned ? '#065F46' : '#92400E',
                        border: `1px solid ${isConverted ? '#DDD6FE' : isAssigned ? '#A7F3D0' : '#FDE68A'}`,
                        fontSize: '9px',
                        fontWeight: '900',
                        padding: '2px 7px',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <span>{isConverted ? '🏆' : isAssigned ? '✓' : '⏳'}</span>
                        <span>{l._status.toUpperCase()}</span>
                      </span>
                    </div>

                    {/* ⚠️ DUPLICATE WARNING PILL ON LEAD CARD (Requirement B) */}
                    {isDuplicate && (
                      <div style={{
                        backgroundColor: '#FFFBEB',
                        border: '1px solid #FCD34D',
                        borderRadius: '8px',
                        padding: '5px 8px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '4px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', fontWeight: '800', color: '#92400E' }}>
                          <span>⚠️ Duplicate Warning</span>
                          <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '1px 5px', borderRadius: '4px', fontSize: '9px' }}>
                            {l._priorEnquiries.length} Prior Enq
                          </span>
                        </div>
                        {onOpenCustomerHistory && (
                          <button
                            onClick={() => onOpenCustomerHistory(l)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#D97706',
                              fontSize: '10px',
                              fontWeight: '900',
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            History →
                          </button>
                        )}
                      </div>
                    )}

                    {/* Client Name & Requirement Subject */}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0F172A', margin: '0 0 2px 0' }}>
                          {l._clientName}
                        </h3>
                        {l.platformLeadId && (
                          <span style={{ fontSize: '9px', color: '#64748B', fontWeight: '700' }}>
                            ID: {l.platformLeadId}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#475569', fontWeight: '600', margin: 0, lineHeight: '1.3' }}>
                        {l._reqSubject}
                      </p>
                    </div>

                    {/* Contact details */}
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      padding: '6px 8px',
                      borderRadius: '7px',
                      border: '1px solid #E2E8F0',
                      fontSize: '10.5px',
                      color: '#64748B',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      marginBottom: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>📞</span>
                        <span style={{ fontWeight: '800', color: '#0F172A' }}>{l._clientPhone}</span>
                      </div>
                      {l._clientEmail && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>✉️</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l._clientEmail}</span>
                        </div>
                      )}
                    </div>

                    {/* ⏰ Scheduled Callback Remainder Banner OR Quick Telemetry Badges */}
                    {l.reminderDate ? (
                      <div style={{
                        backgroundColor: '#FFFBEB',
                        border: '1.5px solid #FCD34D',
                        borderRadius: '10px',
                        padding: '8px 10px',
                        marginBottom: '10px',
                        boxShadow: '0 2px 6px rgba(245, 158, 11, 0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ fontSize: '10.5px', fontWeight: '900', color: '#92400E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            ⏰ Callback: {new Date(l.reminderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          {(() => {
                            const diffDays = Math.ceil((new Date(l.reminderDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                            const isDue = diffDays <= 0;
                            return (
                              <span style={{
                                fontSize: '9px',
                                fontWeight: '900',
                                padding: '2px 7px',
                                borderRadius: '6px',
                                backgroundColor: isDue ? '#EF4444' : '#D97706',
                                color: '#FFFFFF'
                              }}>
                                {isDue ? '📞 Call Due Today!' : `In ${diffDays}d`}
                              </span>
                            );
                          })()}
                        </div>
                        <div style={{ fontSize: '10px', color: '#B45309', fontWeight: '700' }}>
                          🕒 {l.reminderTime || '11:00 AM'}{l.reminderNote ? ` • "${l.reminderNote}"` : ''}
                        </div>
                      </div>
                    ) : (
                      /* Rich Telemetry & Stage Progress Bar when no reminder is scheduled */
                      <div style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '10px',
                        padding: '8px 10px',
                        marginBottom: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '9.5px', fontWeight: '800', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>⚡</span> Pipeline Stage
                          </span>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: '900',
                            color: isConverted ? '#059669' : isAssigned ? '#2563EB' : '#D97706',
                            backgroundColor: isConverted ? '#ECFDF5' : isAssigned ? '#EFF6FF' : '#FEF3C7',
                            padding: '1px 6px',
                            borderRadius: '5px'
                          }}>
                            {isConverted ? 'Deal Closed' : isAssigned ? 'Active Nurturing' : 'Inbound Capture'}
                          </span>
                        </div>
                        {/* Mini Visual Step Indicator */}
                        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                          {[
                            { label: 'Capture', active: true, color: '#3B82F6' },
                            { label: 'Assigned', active: isAssigned || isConverted, color: '#10B981' },
                            { label: 'Proposal', active: isConverted || l._status.toLowerCase().includes('proposal') || l._status.toLowerCase().includes('contacted'), color: '#8B5CF6' },
                            { label: 'Won', active: isConverted, color: '#059669' }
                          ].map((step, sIdx) => (
                            <div key={sIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{
                                height: '4px',
                                borderRadius: '2px',
                                backgroundColor: step.active ? step.color : '#E2E8F0',
                                boxShadow: step.active ? `0 0 6px ${step.color}60` : 'none',
                                transition: 'all 0.3s ease'
                              }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Valuation & Assignment Action Section */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderTop: '1px solid rgba(226, 232, 240, 0.7)', paddingTop: '8px' }}>
                      <div>
                        <div style={{ fontSize: '9px', color: '#94A3B8', fontWeight: '800' }}>BUDGET</div>
                        <div style={{ fontSize: '13.5px', fontWeight: '900', color: '#047857' }}>
                          {l._budgetVal}
                        </div>
                      </div>

                      {/* Specialist Tag */}
                      {isAssigned ? (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '9px', color: '#065F46', fontWeight: '800' }}>ASSIGNED SPECIALIST</div>
                          <div style={{ fontSize: '11px', fontWeight: '900', color: '#1E1B4B' }}>
                            🎯 {l._specialistName}
                          </div>
                          {l._assignedDateFormatted && (
                            <div style={{ fontSize: '9px', color: '#4338CA', fontWeight: '800', marginTop: '1px' }}>
                              🕒 {l._assignedDateFormatted}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{
                          backgroundColor: '#FFFBEB',
                          color: '#B45309',
                          fontSize: '9.5px',
                          fontWeight: '800',
                          padding: '2px 7px',
                          borderRadius: '5px',
                          border: '1px solid #FDE68A'
                        }}>
                          ⏳ Unassigned
                        </div>
                      )}
                    </div>

                    {/* 🚀 Quick Direct Actions: Call, WhatsApp, Email, Details & Assign */}
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <a
                        href={`tel:${l._clientPhone}`}
                        style={{
                          flex: 1,
                          minWidth: '54px',
                          padding: '6px 4px',
                          borderRadius: '7px',
                          backgroundColor: '#EFF6FF',
                          border: '1.2px solid #BFDBFE',
                          color: '#1D4ED8',
                          fontSize: '10.5px',
                          fontWeight: '800',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '3px'
                        }}
                        title={`Call ${l._clientPhone}`}
                      >
                        <span>📞</span> Call
                      </a>

                      <a
                        href={`https://wa.me/${String(l._clientPhone).replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(l._clientName)},%20following%20up%20on%20your%20enquiry.`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          flex: 1,
                          minWidth: '54px',
                          padding: '6px 4px',
                          borderRadius: '7px',
                          backgroundColor: '#ECFDF5',
                          border: '1.2px solid #A7F3D0',
                          color: '#047857',
                          fontSize: '10.5px',
                          fontWeight: '800',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '3px'
                        }}
                        title="Chat on WhatsApp"
                      >
                        <span>💬</span> Chat
                      </a>

                      <a
                        href={`mailto:${l._clientEmail}?subject=OmniCRM Proposal: ${encodeURIComponent(l._reqSubject)}`}
                        style={{
                          flex: 1,
                          minWidth: '54px',
                          padding: '6px 4px',
                          borderRadius: '7px',
                          backgroundColor: '#FFF7ED',
                          border: '1.2px solid #FED7AA',
                          color: '#C2410C',
                          fontSize: '10.5px',
                          fontWeight: '800',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '3px'
                        }}
                        title="Send Email"
                      >
                        <span>✉️</span> Email
                      </a>
                    </div>

                    {/* Action Buttons: View Details + Assign */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '6px' }}>
                      <button
                        onClick={() => onOpenLeadDetails && onOpenLeadDetails(l)}
                        style={{
                          padding: '7px 8px',
                          borderRadius: '7px',
                          backgroundColor: '#F8FAFC',
                          border: '1.2px solid #CBD5E1',
                          color: '#334155',
                          fontSize: '11px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>👁️</span> Details
                      </button>

                      <button
                        onClick={() => onOpenAssignModal(l)}
                        style={{
                          padding: '7px 10px',
                          borderRadius: '7px',
                          backgroundColor: isAssigned ? '#FFFFFF' : '#4338CA',
                          border: isAssigned ? '1.2px solid #818CF8' : 'none',
                          color: isAssigned ? '#4338CA' : '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: '900',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          boxShadow: isAssigned ? 'none' : '0 2px 6px rgba(67, 56, 202, 0.25)'
                        }}
                      >
                        <span>🎯</span>
                        <span>{isAssigned ? 'Reassign' : 'Assign'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 🌟 4. LUXURY EXECUTIVE TABLE VIEW - CLEAN, PROFESSIONAL & HIGH CLARITY */}
      {viewMode === 'table' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '880px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{
                  backgroundColor: '#F8FAFC',
                  borderBottom: '1.5px solid #E2E8F0'
                }}>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                    # ENQUIRY ID
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                    CLIENT & COMPANY
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                    SERVICE & CHANNEL
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                    STATUS
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                    ESTIMATE
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                    ASSIGNED SPECIALIST
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase', textAlign: 'center' }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontSize: '13px', fontWeight: '600' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                      No leads found matching your selected filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((l, index) => {
                    const stBadge = getStatusBadge(l._status);
                    const isEven = index % 2 === 0;

                    return (
                      <tr
                        key={l._id}
                        className="lead-table-row"
                        style={{
                          borderBottom: '1px solid var(--border, #F1F5F9)',
                          backgroundColor: isEven ? 'var(--card-bg, #FFFFFF)' : 'var(--canvas, #FAFAFC)',
                          transition: 'all 0.18s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary-light, #F1F5F9)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isEven ? 'var(--card-bg, #FFFFFF)' : 'var(--canvas, #FAFAFC)';
                        }}
                      >
                        {/* 1. Tracking ID */}
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: '#EEF2FF',
                            color: '#4338CA',
                            fontWeight: '900',
                            fontSize: '12px',
                            padding: '3px 9px',
                            borderRadius: '7px',
                            border: '1.2px solid #C7D2FE',
                            letterSpacing: '0.3px'
                          }}>
                            #{l.enquiryId || (l._id ? l._id.slice(-6).toUpperCase() : 'LEAD')}
                          </span>
                          {l._isDuplicate && (
                            <div style={{
                              display: 'inline-block',
                              backgroundColor: '#FEF3C7',
                              color: '#B45309',
                              fontSize: '9.5px',
                              fontWeight: '900',
                              padding: '2px 7px',
                              borderRadius: '5px',
                              border: '1px solid #FDE68A',
                              marginTop: '3px',
                              marginLeft: '4px'
                            }}>
                              ⚠️ Dup
                            </div>
                          )}
                        </td>

                        {/* 2. Client & Company */}
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              backgroundColor: '#EEF2FF',
                              border: '1.2px solid #C7D2FE',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: '900',
                              color: '#4338CA',
                              boxShadow: '0 2px 6px rgba(67, 56, 202, 0.1)',
                              flexShrink: 0
                            }}>
                              {String(l._clientName || 'C').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>
                                {l._clientName}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', marginTop: '2px' }}>
                                {l.company || (l.customerId && l.customerId.company) ? `🏢 ${l.company || l.customerId.company}` : (l._clientPhone || 'Client')}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Service & Channel */}
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                          <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#1E293B', marginBottom: '4px' }}>
                            {l._reqSubject}
                          </div>
                          <div style={{ display: 'inline-flex' }}>
                            <SourceBadge source={l.source} size="small" />
                          </div>
                        </td>

                        {/* 4. Status (Clean capsule badge) */}
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            backgroundColor: stBadge.bg,
                            border: `1.2px solid ${stBadge.border}`,
                            color: stBadge.text,
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '4px 10px',
                            borderRadius: '12px'
                          }}>
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '3px',
                              backgroundColor: stBadge.dot
                            }} />
                            {stBadge.label}
                          </span>
                        </td>

                        {/* 5. Budget Estimate */}
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: '#ECFDF5',
                            border: '1.2px solid #A7F3D0',
                            color: '#047857',
                            fontSize: '13px',
                            fontWeight: '900',
                            padding: '4px 10px',
                            borderRadius: '7px'
                          }}>
                            {l._budgetVal}
                          </span>
                        </td>

                        {/* 6. Assigned Specialist */}
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                          {l._specialistName ? (
                            <div>
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                backgroundColor: '#F0FDF4',
                                border: '1.2px solid #86EFAC',
                                color: '#15803D',
                                fontSize: '12px',
                                fontWeight: '800',
                                padding: '4px 10px',
                                borderRadius: '7px'
                              }}>
                                <span>🎯</span> {l._specialistName}
                              </div>
                              {l._assignedDateFormatted && (
                                <div style={{ fontSize: '10px', color: '#4338CA', fontWeight: '700', marginTop: '2px' }}>
                                  🕒 {l._assignedDateFormatted}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{
                              display: 'inline-block',
                              backgroundColor: '#FFFBEB',
                              border: '1.2px solid #FDE68A',
                              color: '#B45309',
                              fontSize: '11.5px',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '7px'
                            }}>
                              ⏳ Unassigned
                            </span>
                          )}
                        </td>

                        {/* 7. Action Buttons */}
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => onOpenLeadDetails && onOpenLeadDetails(l)}
                              style={{
                                backgroundColor: '#FFFFFF',
                                color: '#334155',
                                border: '1.2px solid #CBD5E1',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '11.5px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.18s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#F8FAFC';
                                e.currentTarget.style.borderColor = '#94A3B8';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFFFFF';
                                e.currentTarget.style.borderColor = '#CBD5E1';
                              }}
                            >
                              <span>👁️</span> View
                            </button>

                            <button
                              onClick={() => onOpenAssignModal(l)}
                              style={{
                                background: l._specialistName ? '#EEF2FF' : 'linear-gradient(135deg, #312E81 0%, #4338CA 100%)',
                                color: l._specialistName ? '#4338CA' : '#FFFFFF',
                                border: l._specialistName ? '1.2px solid #C7D2FE' : 'none',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontSize: '11.5px',
                                fontWeight: '900',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: l._specialistName ? 'none' : '0 2px 8px rgba(67, 56, 202, 0.28)',
                                transition: 'all 0.18s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (!l._specialistName) {
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(67, 56, 202, 0.38)';
                                } else {
                                  e.currentTarget.style.backgroundColor = '#E0E7FF';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!l._specialistName) {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(67, 56, 202, 0.28)';
                                } else {
                                  e.currentTarget.style.backgroundColor = '#EEF2FF';
                                }
                              }}
                            >
                              <span>🎯</span>
                              <span>{l._specialistName ? 'Reassign' : 'Assign'}</span>
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
        </div>
      )}

    </div>
  );
}
