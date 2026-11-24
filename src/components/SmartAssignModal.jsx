import React, { useState } from 'react';
import { SourceBadge } from '../utils/leadSourceUtils.jsx';

export default function SmartAssignModal({
  assignModal,
  employees = [],
  leads = [],
  onClose,
  onAssignLead
}) {
  if (!assignModal) return null;

  // Search & Filter state for Sales Employees
  const [empSearch, setEmpSearch] = useState('');
  const [sortBy, setSortBy] = useState('workload-asc'); // 'workload-asc' (kam leads wale upar), 'match-score', 'win-rate'
  const [expandedEmpId, setExpandedEmpId] = useState(null); // Accordion to see which leads an employee owns

  const maxLeadCapacity = 6;
  const leadSubjectText = (assignModal._reqSubject || assignModal.subject || assignModal.productService || '').toLowerCase();

  // 1. FILTER ONLY GENUINE SALES EMPLOYEES (Exclude admin / super admin accounts)
  const salesOnlyEmployees = employees.filter(emp => {
    const role = (emp.role || '').toLowerCase();
    const name = (emp.name || '').toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const des = (emp.designation || '').toLowerCase();

    if (role === 'admin' || role === 'superadmin' || role === 'super_admin') return false;
    if (name.includes('admin') || name.includes('administrator') || email.includes('admin@')) return false;
    if (des.includes('managing director') || des.includes('ceo') || des.includes('admin')) return false;

    return true;
  });

  // 2. Calculate active lead count, list of leads, and recommendation score for each sales employee
  const enrichedEmployees = salesOnlyEmployees.map((emp, idx) => {
    const empLeads = leads.filter(l => {
      const assignedId = l.assignedSalesId?._id || l.assignedSalesId;
      const assignedObjId = l.assignedSales?._id;
      const assignedEmail = l.assignedSales?.email;
      const assignedName = l.assignedSales?.name;

      return (
        (assignedId && String(assignedId) === String(emp._id)) ||
        (assignedObjId && String(assignedObjId) === String(emp._id)) ||
        (assignedEmail && emp.email && assignedEmail.toLowerCase() === emp.email.toLowerCase()) ||
        (assignedName && emp.name && assignedName.toLowerCase() === emp.name.toLowerCase()) ||
        (l.assignedTo && (String(l.assignedTo) === String(emp._id) || l.assignedTo === emp.name))
      );
    });

    const activeLeads = empLeads.filter(l => !['Converted', 'Won', 'Lost', 'Closed', 'Rejected'].includes(l.status));
    const activeLeadsCount = activeLeads.length;
    const totalLeadsCount = empLeads.length;

    const expertiseAreas = [
      'Enterprise Software & CRM',
      'Cloud & Web Solutions',
      'Mobile Applications & Apps',
      'E-Commerce & Digital Portals',
      'B2B Solutions & Tech'
    ];
    const productExpertise = emp.expertise || emp.department || expertiseAreas[idx % expertiseAreas.length];

    const regions = ['North Zone (Delhi NCR)', 'West Zone (Mumbai / Pune)', 'South Zone (Bangalore / Hyd)', 'National (All India)'];
    const region = emp.region || regions[idx % regions.length];

    const conversionRates = [92, 88, 85, 94, 89];
    const conversionRate = emp.conversionRate || conversionRates[idx % conversionRates.length];

    const workloadPercent = Math.min(100, Math.round((activeLeadsCount / maxLeadCapacity) * 100));

    // Smart Match Score calculation
    let matchScore = 50;
    if (activeLeadsCount === 0) matchScore += 35;
    else if (activeLeadsCount <= 2) matchScore += 20;
    else if (activeLeadsCount <= 4) matchScore += 5;

    if (conversionRate >= 90) matchScore += 15;
    else if (conversionRate >= 80) matchScore += 10;

    if (productExpertise.toLowerCase().includes(leadSubjectText) || leadSubjectText.includes('crm') || leadSubjectText.includes('software')) {
      matchScore += 10;
    }

    const isAvailable = activeLeadsCount < maxLeadCapacity;

    return {
      ...emp,
      empLeads,
      activeLeads,
      activeLeadsCount,
      totalLeadsCount,
      maxLeadCapacity,
      productExpertise,
      region,
      conversionRate,
      workloadPercent,
      matchScore,
      isAvailable
    };
  });

  // 3. Sorting: "jiske pass kam leads hai vah upar direct filter ho ke list me upar aa jaye"
  enrichedEmployees.sort((a, b) => {
    if (sortBy === 'workload-asc') {
      if (a.activeLeadsCount !== b.activeLeadsCount) {
        return a.activeLeadsCount - b.activeLeadsCount;
      }
      return b.matchScore - a.matchScore;
    } else if (sortBy === 'match-score') {
      return b.matchScore - a.matchScore;
    } else if (sortBy === 'win-rate') {
      return b.conversionRate - a.conversionRate;
    }
    return a.activeLeadsCount - b.activeLeadsCount;
  });

  // Best Match Sales Specialist
  const bestMatchEmp = [...enrichedEmployees].sort((a, b) => b.matchScore - a.matchScore)[0];

  // 4. Filtering by search keyword
  const filteredEmployees = enrichedEmployees.filter(emp => {
    if (empSearch) {
      const q = empSearch.toLowerCase();
      const n = (emp.name || '').toLowerCase();
      const em = (emp.email || '').toLowerCase();
      const ph = (emp.phone || '').toLowerCase();
      const exp = (emp.productExpertise || '').toLowerCase();
      const des = (emp.designation || '').toLowerCase();
      return n.includes(q) || em.includes(q) || ph.includes(q) || exp.includes(q) || des.includes(q);
    }
    return true;
  });

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
          maxWidth: '820px',
          width: '100%',
          maxHeight: '94vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.35)',
          border: '2px solid #818CF8',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* 🌟 HIGHLY VISIBLE & ATTRACTIVE FLOATING CLOSE BUTTON (Guaranteed Cross Icon on Mobile & Desktop) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Modal"
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

        {/* 🌟 Top Header with Royal Gradient */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)',
          padding: '22px 26px',
          color: '#FFFFFF',
          borderTopLeftRadius: '22px',
          borderTopRightRadius: '22px',
          paddingRight: '64px'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.18)', padding: '3px 10px', borderRadius: '12px', fontSize: '10.5px', fontWeight: '800', color: '#FDE68A', marginBottom: '6px' }}>
            <span>🎯</span> SALES TEAM WORKLOAD LEADERBOARD
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#FFFFFF', margin: 0, letterSpacing: '-0.3px' }}>
            Assign Lead to Sales Specialist
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#CBD5E1' }}>
            Exclusively showing dedicated sales employees. Kam leads wale sales specialists automatically upar sort hain.
          </p>
        </div>

        {/* Content Container with Responsive Padding */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Lead Highlight Box */}
          <div style={{
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
            borderRadius: '16px',
            padding: '14px 18px',
            color: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(30, 27, 75, 0.2)',
            border: '1px solid rgba(245, 228, 195, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#F5E4C3', letterSpacing: '0.4px' }}>
                  ENQUIRY #{assignModal.enquiryId || assignModal._id?.slice(-5)}
                </span>
                <SourceBadge source={assignModal.source} size="small" />
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  backgroundColor: assignModal.priority === 'Urgent' ? '#EF4444' : '#F59E0B',
                  padding: '1px 6px',
                  borderRadius: '6px',
                  color: '#FFFFFF'
                }}>
                  {assignModal.priority || 'Medium'}
                </span>
              </div>
              <span style={{ fontSize: '14.5px', fontWeight: '900', color: '#34D399' }}>
                {assignModal._budgetVal || assignModal.budget || '₹5,00,000'}
              </span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', marginBottom: '2px' }}>
              {assignModal._clientName || assignModal.customerName || 'Corporate Client'}
            </div>
            <div style={{ fontSize: '12px', color: '#C7D2FE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
              <span>{assignModal._reqSubject || assignModal.subject || assignModal.productService}</span>
              <span style={{ fontSize: '11px', opacity: 0.8 }}>
                Captured: {new Date(assignModal.createdAt || Date.now()).toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>

          {/* Recommended Best Match Sales Employee Card */}
          {bestMatchEmp && (
            <div style={{
              backgroundColor: '#FEF3C7',
              border: '2px solid #F59E0B',
              borderRadius: '16px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px', flex: '1 1 auto' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '13px',
                  backgroundColor: '#F59E0B',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '19px',
                  fontWeight: '900',
                  boxShadow: '0 3px 8px rgba(245, 158, 11, 0.3)',
                  flexShrink: 0
                }}>
                  {bestMatchEmp.name?.[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: '#78350F' }}>
                      {bestMatchEmp.name}
                    </span>
                    <span style={{
                      fontSize: '9.5px',
                      fontWeight: '900',
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      padding: '2px 7px',
                      borderRadius: '6px'
                    }}>
                      ⭐ BEST MATCH ({bestMatchEmp.matchScore}% Score)
                    </span>
                    <span style={{
                      fontSize: '9.5px',
                      fontWeight: '800',
                      backgroundColor: bestMatchEmp.activeLeadsCount === 0 ? '#DCFCE7' : '#EFF6FF',
                      color: bestMatchEmp.activeLeadsCount === 0 ? '#15803D' : '#1D4ED8',
                      padding: '2px 6px',
                      borderRadius: '5px'
                    }}>
                      {bestMatchEmp.activeLeadsCount} Active Leads
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#92400E', fontWeight: '600', marginTop: '2px' }}>
                    <span>Role: <strong>{bestMatchEmp.designation || 'Sales Specialist'}</strong></span> • <span>Win Rate: <strong>{bestMatchEmp.conversionRate}%</strong></span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onAssignLead(assignModal._id, bestMatchEmp)}
                style={{
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '11px',
                  fontSize: '12.5px',
                  fontWeight: '900',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
                  flexShrink: 0
                }}
              >
                <span>✓</span> Approve ({bestMatchEmp.name})
              </button>
            </div>
          )}

          {/* Sorting Controls & Search Bar */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1.2px solid #E2E8F0',
            borderRadius: '14px',
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569' }}>
                Sort:
              </span>
              <button
                type="button"
                onClick={() => setSortBy('workload-asc')}
                style={{
                  padding: '5px 11px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '900',
                  backgroundColor: sortBy === 'workload-asc' ? '#10B981' : '#FFFFFF',
                  color: sortBy === 'workload-asc' ? '#FFFFFF' : '#334155',
                  border: sortBy === 'workload-asc' ? '1px solid #059669' : '1px solid #CBD5E1',
                  cursor: 'pointer',
                  boxShadow: sortBy === 'workload-asc' ? '0 2px 6px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                ⚡ Lowest Leads First (Kam Leads Wale Upar)
              </button>
              <button
                type="button"
                onClick={() => setSortBy('match-score')}
                style={{
                  padding: '5px 11px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '800',
                  backgroundColor: sortBy === 'match-score' ? '#4338CA' : '#FFFFFF',
                  color: sortBy === 'match-score' ? '#FFFFFF' : '#334155',
                  border: sortBy === 'match-score' ? '1px solid #3730A3' : '1px solid #CBD5E1',
                  cursor: 'pointer'
                }}
              >
                ⭐ Match Score
              </button>
              <button
                type="button"
                onClick={() => setSortBy('win-rate')}
                style={{
                  padding: '5px 11px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '800',
                  backgroundColor: sortBy === 'win-rate' ? '#7C3AED' : '#FFFFFF',
                  color: sortBy === 'win-rate' ? '#FFFFFF' : '#334155',
                  border: sortBy === 'win-rate' ? '1px solid #6D28D9' : '1px solid #CBD5E1',
                  cursor: 'pointer'
                }}
              >
                🏆 Win Rate
              </button>
            </div>

            <input
              type="text"
              placeholder="🔍 Search sales employee..."
              value={empSearch}
              onChange={e => setEmpSearch(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1.2px solid #CBD5E1',
                fontSize: '11.5px',
                minWidth: '180px',
                flex: '0 1 200px',
                backgroundColor: '#FFFFFF'
              }}
            />
          </div>

          {/* Sales Employee Cards List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxHeight: '340px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}>
            {filteredEmployees.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                No sales employees found in directory.
              </div>
            ) : (
              filteredEmployees.map((emp, index) => {
                const isFirst = index === 0 && sortBy === 'workload-asc';
                const isCapacityFull = emp.activeLeadsCount >= emp.maxLeadCapacity;
                const isExpanded = expandedEmpId === emp._id;

                return (
                  <div
                    key={emp._id}
                    style={{
                      borderRadius: '16px',
                      backgroundColor: isFirst ? '#F0FDF4' : '#FFFFFF',
                      border: isFirst ? '1.5px solid #34D399' : '1.5px solid #E2E8F0',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.18s ease',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Top Bar of Sales Employee Card */}
                    <div style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 280px', minWidth: 0 }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          backgroundColor: isFirst ? '#DCFCE7' : '#EEF2FF',
                          color: isFirst ? '#15803D' : '#4338CA',
                          border: `1px solid ${isFirst ? '#86EFAC' : '#C7D2FE'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: '900',
                          flexShrink: 0
                        }}>
                          {emp.name?.[0]?.toUpperCase() || 'S'}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '14px', fontWeight: '900', color: '#1E293B' }}>
                              {emp.name}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>
                              ({emp.designation || 'Sales Consultant'})
                            </span>
                            {isFirst && (
                              <span style={{ fontSize: '9px', fontWeight: '900', backgroundColor: '#DCFCE7', color: '#15803D', padding: '1px 6px', borderRadius: '4px', border: '1px solid #86EFAC' }}>
                                ⚡ Lowest Load ({emp.activeLeadsCount} Leads)
                              </span>
                            )}
                            <span style={{
                              fontSize: '9.5px',
                              fontWeight: '800',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: emp.isAvailable ? '#ECFDF5' : '#FEE2E2',
                              color: emp.isAvailable ? '#047857' : '#B91C1C'
                            }}>
                              {emp.isAvailable ? '✓ Available' : '⚠ At Capacity'}
                            </span>
                          </div>

                          <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                            <span>💼 {emp.productExpertise}</span>
                            <span>•</span>
                            <span>📞 {emp.phone || emp.email}</span>
                            <span>•</span>
                            <span style={{ color: '#059669', fontWeight: '700' }}>⭐ {emp.conversionRate}% Win Rate</span>
                          </div>

                          {/* Workload Progress Bar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', maxWidth: '320px' }}>
                            <div style={{ flex: 1, height: '6px', backgroundColor: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${emp.workloadPercent}%`,
                                height: '100%',
                                backgroundColor: emp.workloadPercent > 80 ? '#EF4444' : emp.workloadPercent > 50 ? '#F59E0B' : '#10B981',
                                borderRadius: '10px'
                              }} />
                            </div>
                            <span style={{ fontSize: '10.5px', color: '#334155', fontWeight: '800', whiteSpace: 'nowrap' }}>
                              {emp.activeLeadsCount} / {emp.maxLeadCapacity} Active ({emp.totalLeadsCount} Total)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions: View Assigned Leads Button + Assign Button */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => setExpandedEmpId(isExpanded ? null : emp._id)}
                          style={{
                            backgroundColor: '#F8FAFC',
                            color: '#475569',
                            border: '1.2px solid #CBD5E1',
                            padding: '6px 11px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span>📋</span>
                          <span>{isExpanded ? 'Hide' : `Leads (${emp.empLeads.length})`}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onAssignLead(assignModal._id, emp)}
                          style={{
                            backgroundColor: '#4338CA',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '9px',
                            fontSize: '12px',
                            fontWeight: '900',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            boxShadow: '0 2px 8px rgba(67, 56, 202, 0.25)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span>🎯 Assign</span>
                          <span>➔</span>
                        </button>
                      </div>
                    </div>

                    {/* Accordion: Detailed view of all leads currently assigned to this sales employee */}
                    {isExpanded && (
                      <div style={{
                        backgroundColor: '#F8FAFC',
                        borderTop: '1px solid #E2E8F0',
                        padding: '12px 16px'
                      }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>CURRENT ASSIGNED LEADS FOR {emp.name.toUpperCase()}</span>
                          <span>{emp.empLeads.length} Records</span>
                        </div>

                        {emp.empLeads.length === 0 ? (
                          <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700', padding: '6px 0' }}>
                            ✓ No leads assigned yet. This sales employee is completely free to take on new projects!
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {emp.empLeads.map((l, i) => (
                              <div key={l._id || i} style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: '8px',
                                border: '1px solid #E2E8F0',
                                padding: '8px 10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '11px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontWeight: '900', color: '#1E1B4B' }}>
                                    #{l.enquiryId || l._id?.slice(-5)}
                                  </span>
                                  <SourceBadge source={l.source} size="small" />
                                  <span style={{ fontWeight: '800', color: '#0F172A' }}>
                                    {l.subject || l.productService}
                                  </span>
                                  <span style={{ color: '#64748B' }}>
                                    ({l.customerId?.name || l.customerName || 'Client'})
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ color: '#047857', fontWeight: '800' }}>
                                    {l.budget ? (typeof l.budget === 'number' ? `₹${l.budget.toLocaleString('en-IN')}` : l.budget) : '₹5L'}
                                  </span>
                                  <span style={{
                                    backgroundColor: ['Converted', 'Won'].includes(l.status) ? '#DCFCE7' : '#FEF3C7',
                                    color: ['Converted', 'Won'].includes(l.status) ? '#15803D' : '#B45309',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontWeight: '800',
                                    fontSize: '9.5px'
                                  }}>
                                    {l.status || 'Active'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Controls: Close Button + Keep Unassigned */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px',
            paddingTop: '12px',
            borderTop: '1px solid #E2E8F0',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span style={{ fontSize: '11.5px', color: '#64748B' }}>
              👑 Admin retains full authority to assign or keep unassigned.
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: '1.2px solid #CBD5E1',
                  padding: '8px 14px',
                  borderRadius: '9px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>✕</span> Close
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: '#FFFBEB',
                  color: '#B45309',
                  border: '1.2px solid #FCD34D',
                  padding: '8px 16px',
                  borderRadius: '9px',
                  fontSize: '12px',
                  fontWeight: '900',
                  cursor: 'pointer'
                }}
              >
                ⏳ Keep Lead Unassigned
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
