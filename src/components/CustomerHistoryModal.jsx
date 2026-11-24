import React from 'react';
import { SourceBadge } from '../utils/leadSourceUtils.jsx';

export default function CustomerHistoryModal({ customer, leads = [], onClose, onOpenLeadDetails }) {
  if (!customer) return null;

  const custId = String(customer._id || '');
  const custPhone = String(customer.phone || '').replace(/\D/g, '');
  const custEmail = String(customer.email || '').toLowerCase().trim();

  // Find all enquiries belonging to this customer across all sources
  const customerLeads = leads.filter(l => {
    const lCustId = l.customerId?._id ? String(l.customerId._id) : (typeof l.customerId === 'string' ? l.customerId : null);
    if (custId && lCustId && custId === lCustId) return true;

    const lPhone = String(l.phone || l.customerId?.phone || l._clientPhone || '').replace(/\D/g, '');
    const lEmail = String(l.email || l.customerId?.email || l._clientEmail || '').toLowerCase().trim();

    if (custEmail && lEmail && custEmail === lEmail && !custEmail.includes('prospect.crm')) return true;
    if (custPhone && lPhone && custPhone.length >= 7 && (custPhone === lPhone || custPhone.endsWith(lPhone.slice(-8)) || lPhone.endsWith(custPhone.slice(-8)))) return true;
    return false;
  }).sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)); // Chronological: oldest first

  // Unique sources breakdown
  const sourceSet = new Set(customerLeads.map(l => l.source || 'Website'));

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        maxWidth: '750px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
        border: '1.5px solid #CBD5E1',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0F766E 0%, #115E59 50%, #134E4A 100%)',
          padding: '20px 24px',
          color: '#FFFFFF',
          borderTopLeftRadius: '19px',
          borderTopRightRadius: '19px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', marginBottom: '6px' }}>
              <span>🏢</span> CUSTOMER 360° ENQUIRY TIMELINE
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#FFFFFF' }}>
              {customer.name || 'Customer Account'}
            </h2>
            <div style={{ fontSize: '12px', color: '#CCFBF1', marginTop: '4px' }}>
              📞 {customer.phone || 'N/A'} • ✉️ {customer.email || 'N/A'} • {customer.company || 'Enterprise Account'}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#FFFFFF',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '900'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px'
          }}>
            <div style={{ backgroundColor: '#F0FDFA', border: '1.2px solid #99F6E4', borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#0F766E' }}>TOTAL ENQUIRIES</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#115E59', marginTop: '2px' }}>
                {customerLeads.length}
              </div>
            </div>
            <div style={{ backgroundColor: '#EEF2FF', border: '1.2px solid #C7D2FE', borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#4338CA' }}>CHANNELS TOUCHED</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#312E81', marginTop: '2px' }}>
                {sourceSet.size}
              </div>
            </div>
            <div style={{ backgroundColor: '#FEF3C7', border: '1.2px solid #FDE68A', borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#B45309' }}>FIRST TOUCHPOINT</div>
              <div style={{ fontSize: '12px', fontWeight: '900', color: '#92400E', marginTop: '4px' }}>
                {customerLeads[0] ? (customerLeads[0].source || 'Website') : 'None'}
              </div>
            </div>
            <div style={{ backgroundColor: '#ECFDF5', border: '1.2px solid #A7F3D0', borderRadius: '10px', padding: '12px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: '800', color: '#047857' }}>LATEST TOUCHPOINT</div>
              <div style={{ fontSize: '12px', fontWeight: '900', color: '#065F46', marginTop: '4px' }}>
                {customerLeads.length > 0 ? (customerLeads[customerLeads.length - 1].source || 'Website') : 'None'}
              </div>
            </div>
          </div>

          {/* Chronological Timeline */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0F172A', marginBottom: '14px' }}>
              📜 Multi-Platform Inquiries Journey (Chronological Order)
            </h3>

            {customerLeads.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1.2px solid #E2E8F0', color: '#64748B', fontSize: '12px' }}>
                No enquiry records found for this customer profile yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                {customerLeads.map((item, index) => {
                  const isLatest = index === customerLeads.length - 1;
                  return (
                    <div
                      key={item._id || index}
                      style={{
                        display: 'flex',
                        gap: '14px',
                        position: 'relative'
                      }}
                    >
                      {/* Timeline Node */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '28px'
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: isLatest ? '#10B981' : '#0284C7',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: '900',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          flexShrink: 0
                        }}>
                          {index + 1}
                        </div>
                        {index < customerLeads.length - 1 && (
                          <div style={{
                            width: '2px',
                            flex: 1,
                            backgroundColor: '#CBD5E1',
                            margin: '4px 0'
                          }} />
                        )}
                      </div>

                      {/* Card Content */}
                      <div style={{
                        flex: 1,
                        backgroundColor: isLatest ? '#F0FDF4' : '#FFFFFF',
                        border: isLatest ? '1.5px solid #86EFAC' : '1.2px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '14px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '900', color: '#1E1B4B' }}>
                              #{item.enquiryId || item._id?.slice(-6)}
                            </span>
                            <SourceBadge source={item.source} size="small" />
                            {isLatest && (
                              <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '9.5px', fontWeight: '900', padding: '1px 6px', borderRadius: '4px' }}>
                                LATEST
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>
                            📅 {item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Logged'}
                          </span>
                        </div>

                        <div style={{ fontSize: '13px', fontWeight: '900', color: '#0F172A', marginBottom: '4px' }}>
                          {item.subject || item.productService || 'Commercial Solution Requirement'}
                        </div>

                        <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: '1.4', marginBottom: '8px' }}>
                          {item.description || item.notes || 'Inbound prospect enquiry via dedicated platform channel.'}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '8px', fontSize: '11px' }}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <span style={{ color: '#047857', fontWeight: '800' }}>
                              Budget: {item.budget ? (typeof item.budget === 'number' ? `₹${item.budget.toLocaleString('en-IN')}` : item.budget) : '₹5,00,000'}
                            </span>
                            <span style={{ color: '#475569', fontWeight: '700' }}>
                              Status: <strong style={{ color: '#0F172A' }}>{item.status || 'Active'}</strong>
                            </span>
                          </div>

                          {onOpenLeadDetails && (
                            <button
                              onClick={() => {
                                onClose();
                                onOpenLeadDetails(item);
                              }}
                              style={{
                                backgroundColor: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                color: '#1D4ED8',
                                padding: '3px 8px',
                                borderRadius: '5px',
                                fontSize: '10.5px',
                                fontWeight: '800',
                                cursor: 'pointer'
                              }}
                            >
                              View Details →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
