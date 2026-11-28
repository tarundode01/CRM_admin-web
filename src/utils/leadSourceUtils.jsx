import React from 'react';

/**
 * Platform Source Configuration with authentic branding colors, icons and labels
 */
export const SOURCE_CONFIG = {
  WhatsApp: {
    label: 'WhatsApp',
    icon: '💬',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
    color: '#16A34A',
    bg: '#DCFCE7',
    border: '#86EFAC',
    pillBg: '#F0FDF4'
  },
  Instagram: {
    label: 'Instagram',
    icon: '📸',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg',
    color: '#E11D48',
    bg: '#FFE4E6',
    border: '#FDA4AF',
    pillBg: '#FFF1F2'
  },
  Facebook: {
    label: 'Facebook',
    icon: '👥',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png',
    color: '#1D4ED8',
    bg: '#DBEAFE',
    border: '#93C5FD',
    pillBg: '#EFF6FF'
  },
  LinkedIn: {
    label: 'LinkedIn',
    icon: '💼',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
    color: '#0284C7',
    bg: '#E0F2FE',
    border: '#7DD3FC',
    pillBg: '#F0F9FF'
  },
  Website: {
    label: 'Website',
    icon: '🌐',
    color: '#059669',
    bg: '#D1FAE5',
    border: '#6EE7B7',
    pillBg: '#ECFDF5'
  },
  Phone: {
    label: 'Phone Call',
    icon: '📞',
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FCD34D',
    pillBg: '#FFFBEB'
  },
  Referral: {
    label: 'Referral',
    icon: '🤝',
    color: '#7C3AED',
    bg: '#EDE9FE',
    border: '#C4B5FD',
    pillBg: '#F5F3FF'
  },
  'Manual Entry': {
    label: 'Manual Entry',
    icon: '✍️',
    color: '#475569',
    bg: '#F1F5F9',
    border: '#CBD5E1',
    pillBg: '#F8FAFC'
  }
};

/**
 * Standardize source name into recognized category
 */
export const normalizeSource = (src = '') => {
  const s = String(src).toLowerCase();
  if (s.includes('whats') || s.includes('wa')) return 'WhatsApp';
  if (s.includes('insta') || s.includes('ig')) return 'Instagram';
  if (s.includes('face') || s.includes('fb')) return 'Facebook';
  if (s.includes('link') || s.includes('li')) return 'LinkedIn';
  if (s.includes('web') || s.includes('online') || s.includes('customer app') || s.includes('portal')) return 'Website';
  if (s.includes('phone') || s.includes('call') || s.includes('ivr') || s.includes('tele')) return 'Phone';
  if (s.includes('ref') || s.includes('partner')) return 'Referral';
  return 'Manual Entry';
};

/**
 * Reusable Source Badge
 */
export const SourceBadge = ({ source, size = 'normal', showIcon = true }) => {
  const normKey = normalizeSource(source);
  const cfg = SOURCE_CONFIG[normKey] || SOURCE_CONFIG['Website'];
  const isSmall = size === 'small';

  return (
    <span
      className="lead-channel-pill"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '3px' : '5px',
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1.2px solid ${cfg.border}`,
        padding: isSmall ? '1px 6px' : '2px 8px',
        borderRadius: '6px',
        fontSize: isSmall ? '9.5px' : '10.5px',
        fontWeight: '900',
        letterSpacing: '0.2px',
        lineHeight: '1.2'
      }}
      title={`Acquisition Channel: ${cfg.label}`}
    >
      {showIcon && <span>{cfg.icon}</span>}
      <span>{cfg.label}</span>
    </span>
  );
};

/**
 * Helper to compute duplicate leads and prior enquiry history
 */
export const detectLeadDuplicates = (targetLead, allLeads = [], allCustomers = []) => {
  if (!targetLead) return { isDuplicate: false, priorEnquiries: [], matchReasons: [], existingCustomer: null };

  const targetId = String(targetLead._id || targetLead.enquiryId || '');
  const targetPhone = String(targetLead.phone || targetLead.customerId?.phone || targetLead._clientPhone || '').replace(/\D/g, '');
  const targetEmail = String(targetLead.email || targetLead.customerId?.email || targetLead._clientEmail || '').toLowerCase().trim();
  const targetName = String(targetLead.name || targetLead.customerName || targetLead.customerId?.name || targetLead._clientName || '').toLowerCase().trim();
  const targetCustId = targetLead.customerId?._id ? String(targetLead.customerId._id) : (typeof targetLead.customerId === 'string' ? targetLead.customerId : null);

  // If already dismissed by admin
  if (targetLead.duplicateDismissed) {
    return { isDuplicate: false, isDismissed: true, priorEnquiries: [], matchReasons: [], existingCustomer: null };
  }

  const matchReasons = [];
  const priorEnquiries = [];

  // 1. Find matching customer profile
  let existingCustomer = null;
  if (targetCustId) {
    existingCustomer = allCustomers.find(c => String(c._id) === targetCustId) || null;
  }
  if (!existingCustomer && (targetEmail || targetPhone)) {
    existingCustomer = allCustomers.find(c => {
      const cEmail = (c.email || '').toLowerCase().trim();
      const cPhone = String(c.phone || '').replace(/\D/g, '');
      return (targetEmail && cEmail && cEmail === targetEmail) ||
             (targetPhone && cPhone && (targetPhone.endsWith(cPhone.slice(-8)) || cPhone.endsWith(targetPhone.slice(-8))));
    }) || null;
  }

  // 2. Scan other leads in system
  allLeads.forEach(l => {
    const lId = String(l._id || l.enquiryId || '');
    if (lId === targetId) return; // skip self

    const lPhone = String(l.phone || l.customerId?.phone || l._clientPhone || '').replace(/\D/g, '');
    const lEmail = String(l.email || l.customerId?.email || l._clientEmail || '').toLowerCase().trim();
    const lName = String(l.name || l.customerName || l.customerId?.name || l._clientName || '').toLowerCase().trim();
    const lCustId = l.customerId?._id ? String(l.customerId._id) : (typeof l.customerId === 'string' ? l.customerId : null);

    let matched = false;
    const reasons = [];

    // Match conditions
    if (targetPhone && lPhone && targetPhone.length >= 7 && lPhone.length >= 7) {
      if (targetPhone === lPhone || targetPhone.endsWith(lPhone.slice(-8)) || lPhone.endsWith(targetPhone.slice(-8))) {
        matched = true;
        reasons.push('Matching Mobile Number');
      }
    }
    if (targetEmail && lEmail && targetEmail === lEmail && !targetEmail.includes('prospect.crm')) {
      matched = true;
      reasons.push('Matching Email Address');
    }
    if (targetCustId && lCustId && targetCustId === lCustId) {
      matched = true;
      reasons.push('Same Customer Profile');
    }
    if (matched && targetName && lName && targetName === lName) {
      reasons.push('Matching Name');
    }

    if (matched) {
      priorEnquiries.push({
        ...l,
        matchReasons: reasons
      });
      reasons.forEach(r => {
        if (!matchReasons.includes(r)) matchReasons.push(r);
      });
    }
  });

  // Sort prior enquiries by creation date descending
  priorEnquiries.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const isDuplicate = priorEnquiries.length > 0 || !!targetLead.isDuplicateFlagged;

  return {
    isDuplicate,
    priorEnquiries,
    matchReasons: matchReasons.length > 0 ? matchReasons : (targetLead.duplicateMatchReason ? [targetLead.duplicateMatchReason] : ['Prior Enquiries on Record']),
    existingCustomer
  };
};
