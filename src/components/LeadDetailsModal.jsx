import React, { useState } from 'react';
import { SourceBadge } from '../utils/leadSourceUtils.jsx';

export default function LeadDetailsModal({
  lead,
  allLeads = [],
  allCustomers = [],
  onClose,
  onOpenAssignModal,
  onLinkToCustomer,
  onMarkNotDuplicate,
  onOpenCustomerHistory
}) {
  if (!lead) return null;

  // Compute duplicate info & prior enquiries
  const targetPhone = String(lead.phone || lead.customerId?.phone || lead._clientPhone || '').replace(/\D/g, '');
  const targetEmail = String(lead.email || lead.customerId?.email || lead._clientEmail || '').toLowerCase().trim();
  const targetCustId = lead.customerId?._id ? String(lead.customerId._id) : (typeof lead.customerId === 'string' ? lead.customerId : null);

  const priorEnquiries = allLeads.filter(l => {
    const lId = String(l._id || l.enquiryId || '');
    if (lId === String(lead._id || lead.enquiryId || '')) return false;

    const lPhone = String(l.phone || l.customerId?.phone || l._clientPhone || '').replace(/\D/g, '');
    const lEmail = String(l.email || l.customerId?.email || l._clientEmail || '').toLowerCase().trim();
    const lCustId = l.customerId?._id ? String(l.customerId._id) : (typeof l.customerId === 'string' ? l.customerId : null);

    if (targetPhone && lPhone && targetPhone.length >= 7 && (targetPhone === lPhone || targetPhone.endsWith(lPhone.slice(-8)) || lPhone.endsWith(targetPhone.slice(-8)))) return true;
    if (targetEmail && lEmail && targetEmail === lEmail && !targetEmail.includes('prospect.crm')) return true;
    if (targetCustId && lCustId && targetCustId === lCustId) return true;
    return false;
  }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const hasDuplicateWarning = (priorEnquiries.length > 0 || lead.isDuplicateFlagged) && !lead.duplicateDismissed;
  const isAssigned = !!(lead.assignedSales?.name || lead.assignedSalesId?.name || lead._specialistName);
  const specialistName = lead.assignedSales?.name || lead.assignedSalesId?.name || lead._specialistName;
  const specialistDesignation = lead.assignedSales?.designation || lead.assignedSalesId?.designation || 'Sales Consultant';
  const specialistPhone = lead.assignedSales?.phone || lead.assignedSalesId?.phone || null;
  const specialistEmail = lead.assignedSales?.email || lead.assignedSalesId?.email || null;

  // Extract assignment date and time
  let assignedRaw = lead.assignedSales?.assignedAt || lead.assignedAt || lead._assignedRaw;
  if (!assignedRaw && Array.isArray(lead.timeline)) {
    const assignEvent = lead.timeline.slice().reverse().find(t => 
      (t.step && t.step.toLowerCase().includes('assign')) ||
      (t.title && t.title.toLowerCase().includes('assign')) ||
      (t.status && t.status.toLowerCase() === 'assigned')
    );
    if (assignEvent) {
      assignedRaw = assignEvent.timestamp || assignEvent.date;
    }
  }
  if (!assignedRaw && specialistName && (lead.status?.toLowerCase() === 'assigned')) {
    assignedRaw = lead.updatedAt;
  }

  let assignedDateFormatted = lead._assignedDateFormatted || null;
  if (!assignedDateFormatted && assignedRaw) {
    try {
      const d = new Date(assignedRaw);
      if (!isNaN(d.getTime())) {
        assignedDateFormatted = d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' at ' + d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch (_) {}
  }

  const clientName = lead.customerId?.name || lead.customerName || lead.name || lead._clientName || 'Prospect Client';
  const clientEmail = lead.customerId?.email || lead.email || lead._clientEmail || 'N/A';
  const clientPhone = lead.customerId?.phone || lead.phone || lead._clientPhone || 'N/A';
  const clientCompany = lead.customerId?.company || lead.company || 'Enterprise Account';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '12px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '860px',
          width: '100%',
          maxHeight: '94vh',
          overflowY: 'auto',
          boxShadow: '0 30px 70px rgba(15, 23, 42, 0.35)',
          border: '2px solid #818CF8',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* 🌟 HIGHLY VISIBLE & ATTRACTIVE FLOATING CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Details Modal"
          title="Close (Esc)"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 1000,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            border: '2px solid #FFFFFF',
            boxShadow: '0 4px 14px rgba(220, 38, 38, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.18s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#B91C1C';
            e.currentTarget.style.transform = 'scale(1.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#DC2626';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* 🌟 Top Hero Billboard Banner (Deep Slate & Royal Emerald Glow) */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #064E3B 100%)',
          padding: '24px 28px',
          color: '#FFFFFF',
          borderTopLeftRadius: '22px',
          borderTopRightRadius: '22px',
          paddingRight: '64px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Ambient Glow Orb */}
          <div style={{ position: 'absolute', top: '-30px', right: '15%', width: '150px', height: '150px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(52, 211, 153, 0.3) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#F5E4C3',
                fontSize: '11px',
                fontWeight: '900',
                padding: '3px 9px',
                borderRadius: '6px',
                letterSpacing: '0.5px'
              }}>
                ENQUIRY #{lead.enquiryId || lead._id?.slice(-6)}
              </span>
              <SourceBadge source={lead.source} size="normal" />
              <span style={{
                backgroundColor: isAssigned ? '#ECFDF5' : '#FEF3C7',
                color: isAssigned ? '#065F46' : '#92400E',
                fontSize: '11px',
                fontWeight: '900',
                padding: '3px 9px',
                borderRadius: '6px',
                border: isAssigned ? '1px solid #A7F3D0' : '1px solid #FDE68A'
              }}>
                ● {lead.status?.toUpperCase() || 'SUBMITTED'}
              </span>
              {lead.priority && (
                <span style={{
                  backgroundColor: lead.priority === 'Urgent' ? '#FEE2E2' : '#EFF6FF',
                  color: lead.priority === 'Urgent' ? '#DC2626' : '#2563EB',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  {lead.priority === 'Urgent' ? '🔥 Urgent Priority' : `⚡ ${lead.priority} Priority`}
                </span>
              )}
            </div>

            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
              {lead.subject || lead.productService || 'Commercial Project Requirement'}
            </h2>

            <div style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span>📅 Logged on {lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently'}</span>
              <span>•</span>
              <span style={{ color: '#34D399', fontWeight: '900' }}>
                Budget: {lead.budget ? (typeof lead.budget === 'number' ? `₹${lead.budget.toLocaleString('en-IN')}` : lead.budget) : '₹5,00,000'}
              </span>
            </div>
          </div>
        </div>

        {/* 🌟 Content Container */}
        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* ⚠️ DUPLICATE LEAD ALERT (Prominent Card) */}
          {hasDuplicateWarning && (
            <div style={{
              backgroundColor: '#FFFBEB',
              border: '2px solid #F59E0B',
              borderRadius: '16px',
              padding: '16px 18px',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', minWidth: '240px', flex: '1 1 auto' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    fontSize: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    ⚠️
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#92400E' }}>
                      Duplicate Lead Detected ({priorEnquiries.length} Prior {priorEnquiries.length === 1 ? 'Enquiry' : 'Enquiries'} Found)
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#78350F', lineHeight: '1.4' }}>
                      This customer has reached out to your sales desk previously. Review past channel touches and previous specialist notes below.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => onMarkNotDuplicate && onMarkNotDuplicate(lead)}
                    style={{
                      padding: '7px 12px',
                      backgroundColor: '#FFFFFF',
                      border: '1.2px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '800',
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    Mark as Not Duplicate
                  </button>
                  {onOpenCustomerHistory && (
                    <button
                      type="button"
                      onClick={() => onOpenCustomerHistory(lead)}
                      style={{
                        padding: '7px 14px',
                        backgroundColor: '#D97706',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: '900',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)'
                      }}
                    >
                      View Full History →
                    </button>
                  )}
                </div>
              </div>

              {/* Duplicate Details Matrix */}
              {priorEnquiries.length > 0 && (
                <div style={{
                  marginTop: '12px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #FDE68A',
                  padding: '12px 14px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '10px'
                }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#92400E' }}>CUSTOMER NAME</div>
                    <div style={{ fontSize: '13px', fontWeight: '900', color: '#1E293B', marginTop: '2px' }}>{clientName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#92400E' }}>PREVIOUS ENQUIRY DATE</div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#1E293B', marginTop: '2px' }}>
                      {priorEnquiries[0].createdAt ? new Date(priorEnquiries[0].createdAt).toLocaleDateString('en-GB') : 'Past record'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#92400E' }}>PREVIOUS → NEW CHANNEL</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <SourceBadge source={priorEnquiries[0].source} size="small" />
                      <span>➔</span>
                      <SourceBadge source={lead.source} size="small" />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#92400E' }}>PREVIOUS SPECIALIST</div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#1E293B', marginTop: '2px' }}>
                      {priorEnquiries[0].assignedSales?.name ? `🎯 ${priorEnquiries[0].assignedSales.name}` : 'Unassigned'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 🌟 2-Column Responsive Bento Grid: Customer Profile & Lead Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            
            {/* Left Card: Customer Information */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '18px',
              border: '1.2px solid #E2E8F0',
              padding: '18px 20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: '900', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>👤</span> Customer & Corporate Entity
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EEF2FF', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748B', fontWeight: '700' }}>Client Name: </span>
                  <span style={{ fontWeight: '900', color: '#0F172A' }}>{clientName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EEF2FF', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748B', fontWeight: '700' }}>Mobile Phone: </span>
                  <a href={`tel:${clientPhone}`} style={{ fontWeight: '800', color: '#2563EB', textDecoration: 'none' }}>{clientPhone}</a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EEF2FF', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748B', fontWeight: '700' }}>Corporate Email: </span>
                  <a href={`mailto:${clientEmail}`} style={{ fontWeight: '800', color: '#2563EB', textDecoration: 'none' }}>{clientEmail}</a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: '700' }}>Company / Account: </span>
                  <span style={{ fontWeight: '800', color: '#0F172A' }}>{clientCompany}</span>
                </div>
              </div>
            </div>

            {/* Right Card: Lead Source & Campaign Tracking */}
            <div style={{
              backgroundColor: '#F0FDF4',
              borderRadius: '18px',
              border: '1.2px solid #BBF7D0',
              padding: '18px 20px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.05)'
            }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: '900', color: '#065F46', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📡</span> Lead Source & Campaign Tracking
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #DCFCE7', paddingBottom: '6px' }}>
                  <span style={{ color: '#065F46', fontWeight: '700' }}>Inbound Channel: </span>
                  <SourceBadge source={lead.source} size="normal" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #DCFCE7', paddingBottom: '6px' }}>
                  <span style={{ color: '#065F46', fontWeight: '700' }}>Platform Lead ID: </span>
                  <code style={{ backgroundColor: '#DCFCE7', padding: '3px 8px', borderRadius: '6px', fontWeight: '800', color: '#166534', fontSize: '11px' }}>
                    {lead.platformLeadId || `INB-${lead._id?.slice(-8).toUpperCase() || 'DIRECT'}`}
                  </code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #DCFCE7', paddingBottom: '6px' }}>
                  <span style={{ color: '#065F46', fontWeight: '700' }}>Marketing Campaign: </span>
                  <span style={{ fontWeight: '800', color: '#166534' }}>
                    {lead.campaign || 'Direct Search / Inbound Campaign'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#065F46', fontWeight: '700' }}>Budget Valuation: </span>
                  <span style={{ fontWeight: '900', color: '#047857', fontSize: '14px' }}>
                    {lead.budget ? (typeof lead.budget === 'number' ? `₹${lead.budget.toLocaleString('en-IN')}` : lead.budget) : '₹5,00,000'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Requirement Description Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            border: '1.2px solid #E2E8F0',
            padding: '16px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13.5px', fontWeight: '900', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>💬</span> Customer Message & Requirement Scope
            </h4>
            <div style={{
              backgroundColor: '#F8FAFC',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '12.5px',
              color: '#334155',
              lineHeight: '1.5',
              border: '1px solid #E2E8F0'
            }}>
              {lead.description || lead.notes || 'Inbound enterprise prospect requirement submitted through corporate sales portal.'}
            </div>
          </div>

          {/* 🌟 DEDICATED ASSIGNMENT & SPECIALIST DISPATCH BOX (Ultra-Attractive & Responsive) */}
          <div style={{
            backgroundColor: isAssigned ? '#EEF2FF' : '#FFFBEB',
            borderRadius: '20px',
            border: `2px solid ${isAssigned ? '#818CF8' : '#F59E0B'}`,
            padding: '18px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            boxShadow: `0 8px 24px ${isAssigned ? 'rgba(99, 102, 241, 0.18)' : 'rgba(245, 158, 11, 0.18)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px', flex: '1 1 auto' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '15px',
                backgroundColor: isAssigned ? '#4338CA' : '#D97706',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: '900',
                boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                flexShrink: 0
              }}>
                {isAssigned ? '🎯' : '⏳'}
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: isAssigned ? '#4338CA' : '#B45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {isAssigned ? 'ASSIGNED SALES SPECIALIST' : 'LEAD ASSIGNMENT STATUS'}
                </div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginTop: '2px' }}>
                  {isAssigned ? specialistName : 'Currently Unassigned (Pending Dispatch)'}
                </div>
                {isAssigned ? (
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span>Role: <strong>{specialistDesignation}</strong></span>
                    {specialistPhone && <span>• 📞 {specialistPhone}</span>}
                    {specialistEmail && <span>• ✉️ {specialistEmail}</span>}
                    {assignedDateFormatted && (
                      <span style={{ backgroundColor: '#EEF2FF', color: '#4338CA', padding: '2px 8px', borderRadius: '6px', fontWeight: '800' }}>
                        🕒 Assigned: {assignedDateFormatted}
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '11.5px', color: '#92400E', marginTop: '2px' }}>
                    Assign this lead to an available sales consultant to begin client outreach.
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAssignModal && onOpenAssignModal(lead);
              }}
              style={{
                backgroundColor: isAssigned ? '#4338CA' : '#059669',
                color: '#FFFFFF',
                border: 'none',
                padding: '11px 22px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isAssigned ? '0 4px 14px rgba(67, 56, 202, 0.35)' : '0 4px 14px rgba(5, 150, 105, 0.35)',
                transition: 'all 0.18s ease',
                flexShrink: 0
              }}
            >
              <span>🎯</span>
              <span>{isAssigned ? 'Reassign Specialist' : 'Assign Sales Specialist'}</span>
              <span>➔</span>
            </button>
          </div>

          {/* Chronological History preview */}
          {priorEnquiries.length > 0 && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              border: '1.2px solid #E2E8F0',
              padding: '16px 20px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '900', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📜</span> All Multi-Platform Inquiries for this Customer ({priorEnquiries.length + 1} Total)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  padding: '9px 12px',
                  borderRadius: '10px',
                  backgroundColor: '#ECFDF5',
                  border: '1.2px solid #10B981',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11.5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '900', color: '#047857' }}>● CURRENT</span>
                    <SourceBadge source={lead.source} size="small" />
                    <span style={{ fontWeight: '800', color: '#0F172A' }}>#{lead.enquiryId} • {lead.subject || lead.productService}</span>
                  </div>
                  <span style={{ color: '#065F46', fontWeight: '800' }}>{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-GB') : 'Today'}</span>
                </div>

                {priorEnquiries.map((pe, idx) => (
                  <div key={pe._id || idx} style={{
                    padding: '9px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11.5px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#64748B', fontWeight: '700' }}>#{idx + 1}</span>
                      <SourceBadge source={pe.source} size="small" />
                      <span style={{ fontWeight: '700', color: '#1E293B' }}>#{pe.enquiryId} • {pe.subject || pe.productService}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#B45309', backgroundColor: '#FEF3C7', padding: '1px 6px', borderRadius: '4px' }}>
                        {pe.status || 'Past Enquiry'}
                      </span>
                      <span style={{ color: '#64748B' }}>{pe.createdAt ? new Date(pe.createdAt).toLocaleDateString('en-GB') : 'Past'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '4px',
            paddingTop: '12px',
            borderTop: '1px solid #E2E8F0',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span style={{ fontSize: '11.5px', color: '#64748B' }}>
              Admin Console • Real-Time CRM Lead Intelligence
            </span>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#F1F5F9',
                color: '#475569',
                border: '1.2px solid #CBD5E1',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>✕</span> Close Details
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
