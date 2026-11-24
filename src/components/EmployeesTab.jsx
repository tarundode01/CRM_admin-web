import React, { useState } from 'react';

export default function EmployeesTab({
  employees = [],
  leads = [],
  deals = [],
  quotations = [],
  customers = [],
  onOpenAddEmployee,
  onDeleteEmployee,
  onUpdateEmployee
}) {
  const [filterDept, setFilterDept] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' (Bento Grid) or 'table'
  const [editingEmp, setEditingEmp] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', phone: '', department: '', designation: '', role: 'sales', monthlyTarget: 1000000, targetTasks: 20 });
  const [targetEmp, setTargetEmp] = useState(null);
  const [targetFormData, setTargetFormData] = useState({ targetTasks: 20, monthlyTarget: 1000000 });
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [successToast, setSuccessToast] = useState(null); // { title, message, empName }

  const openTargetModal = (emp) => {
    setTargetEmp(emp);
    setTargetFormData({
      targetTasks: Number(emp.targetTasks) > 0 ? Number(emp.targetTasks) : 20,
      monthlyTarget: Number(emp.monthlyTarget) > 0 ? Number(emp.monthlyTarget) : 1000000
    });
  };

  const handleSaveTargetDirect = async (e) => {
    e.preventDefault();
    if (!targetEmp || !onUpdateEmployee) return;
    try {
      setIsSavingTarget(true);
      const payload = {
        name: targetEmp.name,
        targetTasks: Number(targetFormData.targetTasks) || 20,
        monthlyTarget: Number(targetFormData.monthlyTarget) || 1000000
      };
      const ok = await onUpdateEmployee(targetEmp._id, payload);
      if (ok) {
        const empName = targetEmp.name;
        const tasks = payload.targetTasks;
        const revLakh = (payload.monthlyTarget / 100000).toFixed(1);
        setTargetEmp(null);
        setSuccessToast({
          title: 'Target Successfully Updated & Synced! 🎉',
          empName,
          message: `Target for ${empName} has been configured to ${tasks} Tasks & ₹${revLakh} Lakhs. It is now live on their employee dashboard.`
        });
        setTimeout(() => {
          setSuccessToast(null);
        }, 5000);
      }
    } finally {
      setIsSavingTarget(false);
    }
  };

  // Calculate dedicated metrics per employee:
  // 1. Clients being handled (leads, deals, quotations, customers)
  // 2. Active leads count
  // 3. Won deals count
  // 4. Sent quotations count
  const getEmployeeClientStats = (emp) => {
    if (!emp) return { clientCount: 0, clients: [], activeLeads: 0, wonDeals: 0, quotesCount: 0 };
    const empId = (emp._id || '').toString();
    const empEmail = (emp.email || '').toLowerCase().trim();
    const empName = (emp.name || '').toLowerCase().trim();

    const clientMap = new Map();
    let activeLeads = 0;
    let wonDeals = 0;
    let quotesCount = 0;

    // Check leads assigned to this employee
    (leads || []).forEach(l => {
      const assignedId = (l.assignedSalesId?._id || l.assignedSalesId || l.assignedSales?._id || l.assignedSales || '').toString();
      const assignedEmail = (l.assignedSales?.email || '').toLowerCase().trim();
      const assignedName = (l.assignedSales?.name || '').toLowerCase().trim();

      const isMatch = (empId && assignedId === empId) || (empEmail && assignedEmail === empEmail) || (empName && assignedName === empName);
      if (isMatch) {
        activeLeads++;
        const cKey = (l.customerId?._id || l.customerId || l.email || l.customerName || l.phone || l._id).toString();
        const cName = l.customerName || l.customerId?.name || 'Client';
        const cComp = l.company || l.customerId?.company || 'Corporate Client';
        clientMap.set(cKey, { name: cName, company: cComp, type: 'Lead' });
      }
    });

    // Check deals assigned to this employee
    (deals || []).forEach(d => {
      const assignedId = (d.assignedSales?._id || d.assignedSales || d.assignedTo?._id || d.assignedTo || '').toString();
      const assignedEmail = (d.assignedSales?.email || '').toLowerCase().trim();
      const isMatch = (empId && assignedId === empId) || (empEmail && assignedEmail === empEmail);
      if (isMatch) {
        if ((d.stage || d.status || '').toLowerCase().includes('won')) wonDeals++;
        const cKey = (d.customerId?._id || d.customerId || d.customerName || d._id).toString();
        const cName = d.customerName || d.customerId?.name || 'Deal Client';
        const cComp = d.company || d.customerId?.company || 'Account';
        clientMap.set(cKey, { name: cName, company: cComp, type: 'Deal' });
      }
    });

    // Check quotations created by this employee
    (quotations || []).forEach(q => {
      const creatorId = (q.createdBy?._id || q.createdBy || '').toString();
      const creatorName = (q.createdByName || '').toLowerCase().trim();
      const isMatch = (empId && creatorId === empId) || (empName && creatorName === empName);
      if (isMatch) {
        quotesCount++;
        const cKey = (q.customerId?._id || q.customerId || q._id).toString();
        const cName = q.customerId?.name || 'Quote Client';
        const cComp = q.customerId?.company || 'Organization';
        clientMap.set(cKey, { name: cName, company: cComp, type: 'Quotation' });
      }
    });

    // Check direct customer accounts assigned if any
    (customers || []).forEach(c => {
      const assignedId = (c.assignedEmployee?._id || c.assignedEmployee || c.assignedSales?._id || c.assignedSales || '').toString();
      if (empId && assignedId === empId) {
        const cKey = c._id.toString();
        clientMap.set(cKey, { name: c.name || 'Direct Client', company: c.company || '', type: 'Direct' });
      }
    });

    return {
      clientCount: clientMap.size,
      clients: Array.from(clientMap.values()),
      activeLeads,
      wonDeals,
      quotesCount
    };
  };

  // Dynamic avatar gradient generator
  const getAvatarGradient = (name = 'E', idx = 0) => {
    const gradients = [
      'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)', // Indigo
      'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', // Violet
      'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', // Pink
      'linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)', // Cyan
      'linear-gradient(135deg, #10B981 0%, #047857 100%)', // Emerald
      'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)', // Amber
      'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', // Blue
    ];
    return gradients[idx % gradients.length];
  };

  // Department styling palette
  const getDeptBadgeStyle = (dept = '') => {
    const d = (dept || '').toLowerCase();
    if (d.includes('sales') || d.includes('commercial')) {
      return { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A', icon: '💼' };
    }
    if (d.includes('tech') || d.includes('dev') || d.includes('engineer')) {
      return { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD', icon: '💻' };
    }
    if (d.includes('operation') || d.includes('support')) {
      return { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE', icon: '⚙️' };
    }
    if (d.includes('market') || d.includes('growth')) {
      return { bg: '#FCE7F3', color: '#BE185D', border: '#FBCFE8', icon: '🚀' };
    }
    return { bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE', icon: '🏢' };
  };

  // Metrics
  const activeCount = employees.filter(e => (e.status || 'active').toLowerCase() === 'active').length;
  const salesForceCount = employees.filter(e => (e.role || '').toLowerCase() === 'sales' || (e.department || '').toLowerCase().includes('sales')).length;

  // Filter list with deep multi-field matching
  const filteredEmployees = employees.filter(emp => {
    const dept = (emp.department || 'Sales').toLowerCase();
    if (filterDept !== 'All') {
      if (filterDept === 'Sales' && !dept.includes('sales')) return false;
      if (filterDept === 'Tech' && !dept.includes('tech') && !dept.includes('dev')) return false;
      if (filterDept === 'Operations' && !dept.includes('operation') && !dept.includes('support')) return false;
    }
    if (search) {
      const q = search.trim().toLowerCase();
      const n = (emp.name || '').toLowerCase();
      const e = (emp.email || '').toLowerCase();
      const p = (emp.phone || '').toLowerCase();
      const r = (emp.role || '').toLowerCase();
      const d = (emp.department || '').toLowerCase();
      const des = (emp.designation || '').toLowerCase();
      const id = (emp.employeeId || emp._id || '').toLowerCase();
      return n.includes(q) || e.includes(q) || p.includes(q) || r.includes(q) || d.includes(q) || des.includes(q) || id.includes(q);
    }
    return true;
  });

  const openEditModal = (emp) => {
    setEditingEmp(emp);
    setEditFormData({
      name: emp.name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department || 'Sales',
      designation: emp.designation || 'Sales Executive',
      role: emp.role || 'sales',
      monthlyTarget: emp.monthlyTarget !== undefined ? emp.monthlyTarget : 1000000,
      targetTasks: emp.targetTasks !== undefined ? emp.targetTasks : 20
    });
  };

  const handleSaveEmpEdit = async (e) => {
    e.preventDefault();
    if (!editingEmp || !onUpdateEmployee) return;
    const ok = await onUpdateEmployee(editingEmp._id, editFormData);
    if (ok) {
      const empName = editFormData.name || editingEmp.name;
      setEditingEmp(null);
      setSuccessToast({
        title: 'Profile & Targets Saved! 🎉',
        empName,
        message: `${empName}'s profile credentials, role permissions and targets have been successfully saved and synced.`
      });
      setTimeout(() => {
        setSuccessToast(null);
      }, 5000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      
      {/* 🌟 Premium CSS Keyframe Styles & Animations */}
      <style>{`
        @keyframes cardGlowShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseDotGlow {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1.15); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes subtleFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
          100% { transform: translateY(0px); }
        }
        .premium-emp-card {
          background-color: #FFFFFF;
          border-radius: 18px;
          border: 1.5px solid rgba(226, 232, 240, 0.9);
          box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .premium-emp-card:hover {
          transform: translateY(-6px) scale(1.012);
          box-shadow: 0 18px 38px rgba(99, 102, 241, 0.12), 0 4px 14px rgba(15, 23, 42, 0.06);
          border-color: #A5B4FC;
        }
        .premium-emp-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3.5px;
          background: linear-gradient(90deg, #6366F1, #8B5CF6, #EC4899, #10B981, #6366F1);
          background-size: 300% 300%;
          animation: cardGlowShimmer 6s ease infinite;
          opacity: 0.85;
          transition: opacity 0.3s ease;
        }
        .premium-emp-card:hover::before {
          opacity: 1;
          height: 4.5px;
        }
        .pulse-live-indicator {
          width: 6.5px;
          height: 6.5px;
          border-radius: 50%;
          background-color: #10B981;
          display: inline-block;
          animation: pulseDotGlow 2s infinite;
        }
        .target-goal-bar {
          transition: all 0.25s ease;
        }
        .target-goal-bar:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.16) !important;
          border-color: #8B5CF6 !important;
        }
      `}</style>
      
      {/* 🌟 Best Attractive & Colourful Success Notification Toast */}
      {successToast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 999999,
          background: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)',
          color: '#FFFFFF',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 20px 45px rgba(5, 150, 105, 0.4), 0 0 0 1.5px rgba(167, 243, 208, 0.5)',
          maxWidth: '420px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
          }}>
            🎯
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#ECFDF5', letterSpacing: '0.2px' }}>
                {successToast.title}
              </h4>
              <button
                onClick={() => setSuccessToast(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#A7F3D0',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: 0,
                  marginLeft: '8px'
                }}
              >
                ✕
              </button>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#D1FAE5', lineHeight: '17px', fontWeight: '500' }}>
              {successToast.message}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#34D399', display: 'inline-block', boxShadow: '0 0 8px #34D399' }} />
              <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#6EE7B7', textTransform: 'uppercase' }}>
                Live Database Synchronized
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 1. Compact & Attractive Violet Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #3B0764 0%, #6D28D9 50%, #7C3AED 100%)',
        borderRadius: '16px',
        padding: '18px 24px',
        color: '#FFFFFF',
        boxShadow: '0 10px 30px rgba(109, 40, 217, 0.22)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        border: '1.5px solid rgba(221, 214, 254, 0.35)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow ambient background sphere */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(237, 233, 254, 0.35) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
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
            <span>👥</span> WORKFORCE & STAFF
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0, letterSpacing: '-0.4px', textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
            Workforce & Executive Staff
          </h1>
          <p style={{ margin: '4px 0 0 0', opacity: 0.94, fontSize: '12.5px', maxWidth: '540px', color: '#F5F3FF' }}>
            Multi-tier sales officers, in-field deployment, and team credentials.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
          {/* View Toggle */}
          <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: '12px', padding: '3px', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(8px)' }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                backgroundColor: viewMode === 'cards' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'cards' ? '#6D28D9' : '#FFFFFF',
                border: 'none',
                borderRadius: '9px',
                padding: '6px 14px',
                fontSize: '11.5px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: viewMode === 'cards' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🗂️</span> Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'table' ? '#6D28D9' : '#FFFFFF',
                border: 'none',
                borderRadius: '9px',
                padding: '6px 14px',
                fontSize: '11.5px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: viewMode === 'table' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <span>📑</span> List
            </button>
          </div>

          <button
            onClick={onOpenAddEmployee}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#6D28D9',
              fontSize: '12px',
              fontWeight: '900',
              padding: '9px 18px',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.16)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
          >
            <span>➕</span> Onboard Staff
          </button>
        </div>
      </div>

      {/* 🌟 2. Spacious & Modern 4-Col KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        
        {/* Metric 1 */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid #DDD6FE',
          padding: '14px 18px',
          boxShadow: '0 4px 14px rgba(109, 40, 217, 0.05)',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 100%)',
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
            background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
            border: '1.5px solid #C4B5FD',
            color: '#7C3AED',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)'
          }}>
            👥
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Total Staff
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#1E1B4B', lineHeight: '1' }}>
                {employees.length}
              </div>
              <span style={{ fontSize: '10.5px', color: '#7C3AED', fontWeight: '800', backgroundColor: '#EDE9FE', padding: '2px 7px', borderRadius: '6px' }}>
                Active Roster
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
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
            ⚡
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Active Now
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#065F46', lineHeight: '1' }}>
                {activeCount}
              </div>
              <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: '800', backgroundColor: '#D1FAE5', padding: '2px 7px', borderRadius: '6px' }}>
                Online
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
            💼
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Sales Force
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#78350F', lineHeight: '1' }}>
                {salesForceCount || employees.length}
              </div>
              <span style={{ fontSize: '10.5px', color: '#B45309', fontWeight: '800', backgroundColor: '#FEF3C7', padding: '2px 7px', borderRadius: '6px' }}>
                Field Team
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
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
            🛡️
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Security
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#0C4A6E', lineHeight: '1' }}>
                Verified
              </div>
              <span style={{ fontSize: '10.5px', color: '#0284C7', fontWeight: '800', backgroundColor: '#E0F2FE', padding: '2px 7px', borderRadius: '6px' }}>
                2FA Active
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 🌟 3. Filter Controls & Prominent Colorful Live Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#FFFFFF',
        padding: '12px 18px',
        borderRadius: '16px',
        border: '1.5px solid #DDD6FE',
        boxShadow: '0 4px 16px rgba(109, 40, 217, 0.04)'
      }}>
        {/* Department Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'All', label: 'All', count: employees.length },
            { id: 'Sales', label: 'Sales', count: salesForceCount },
            { id: 'Tech', label: 'Tech', count: employees.filter(e => (e.department || '').toLowerCase().includes('tech') || (e.department || '').toLowerCase().includes('dev')).length },
            { id: 'Operations', label: 'Operations', count: employees.filter(e => (e.department || '').toLowerCase().includes('operation') || (e.department || '').toLowerCase().includes('support')).length }
          ].map(f => {
            const isSel = filterDept === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilterDept(f.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  border: isSel ? '1.5px solid #7C3AED' : '1.5px solid #E2E8F0',
                  backgroundColor: isSel ? '#F5F3FF' : '#FFFFFF',
                  color: isSel ? '#6D28D9' : '#64748B',
                  cursor: 'pointer'
                }}
              >
                <span>{f.label}</span>
                <span style={{
                  backgroundColor: isSel ? '#6D28D9' : '#F1F5F9',
                  color: isSel ? '#FFFFFF' : '#64748B',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '10px',
                  fontWeight: '900'
                }}>
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Large, Colorful & Deeply Filtered Search Input */}
        <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: '460px' }}>
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            boxShadow: '0 2px 6px rgba(109, 40, 217, 0.3)'
          }}>
            🔍
          </div>
          <input
            type="text"
            placeholder="Search by staff name, email, phone, role, ID or dept..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px 11px 48px',
              borderRadius: '12px',
              border: '1.5px solid #C4B5FD',
              backgroundColor: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: '600',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 2px 8px rgba(109, 40, 217, 0.06)',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#7C3AED';
              e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.18)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#C4B5FD';
              e.target.style.boxShadow = '0 2px 8px rgba(109, 40, 217, 0.06)';
            }}
          />
        </div>
      </div>

      {/* 🌟 4. Main Body: Compact Staff Bento Cards OR Classic Table */}
      {viewMode === 'cards' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px'
        }}>
          {filteredEmployees.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '40px 16px',
              textAlign: 'center',
              border: '2px dashed #CBD5E1',
              color: '#64748B'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', margin: 0 }}>
                No Staff Members Found
              </h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                {search ? 'No team members match your active keyword.' : 'Onboard your first sales representative or staff member.'}
              </p>
              <button
                onClick={onOpenAddEmployee}
                style={{
                  marginTop: '12px',
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                + Onboard New Staff
              </button>
            </div>
          ) : (
            filteredEmployees.map((emp, idx) => {
              const deptStyle = getDeptBadgeStyle(emp.department);
              const avatarGrad = getAvatarGradient(emp.name, idx);
              const isSales = (emp.role || '').toLowerCase() === 'sales';

              return (
                <div
                  key={emp._id || idx}
                  className="premium-emp-card"
                >
                  <div>
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Avatar */}
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '13px',
                          background: avatarGrad,
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '900',
                          fontSize: '17px',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                          flexShrink: 0,
                          transition: 'transform 0.3s ease'
                        }}>
                          {emp.name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {emp.name}
                          </h4>
                          <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: '700' }}>
                            #{emp.employeeId || emp._id?.slice(-5) || 'EMP' + idx}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        color: '#059669',
                        fontSize: '9.5px',
                        fontWeight: '900',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        flexShrink: 0,
                        boxShadow: '0 2px 5px rgba(16, 185, 129, 0.1)'
                      }}>
                        <span className="pulse-live-indicator" />
                        ACTIVE
                      </span>
                    </div>

                    {/* Department & Role Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{
                        backgroundColor: deptStyle.bg,
                        color: deptStyle.color,
                        border: `1px solid ${deptStyle.border}`,
                        fontSize: '10.5px',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>{deptStyle.icon}</span>
                        <span>{emp.department || 'Enterprise Sales'}</span>
                      </span>

                      <span style={{
                        backgroundColor: isSales ? '#FEF3C7' : '#F1F5F9',
                        color: isSales ? '#B45309' : '#475569',
                        fontSize: '10px',
                        fontWeight: '800',
                        padding: '3px 7px',
                        borderRadius: '5px'
                      }}>
                        {emp.role?.toUpperCase() || 'SPECIALIST'}
                      </span>
                    </div>

                    {/* Contact Details */}
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: '10px',
                      padding: '9px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      fontSize: '11.5px',
                      marginBottom: '10px',
                      border: '1px solid #E2E8F0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                        <span>✉️</span>
                        <span style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {emp.email}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                        <span>📞</span>
                        <span style={{ fontWeight: '600' }}>
                          {emp.phone || '+91 98765 00000'}
                        </span>
                      </div>
                    </div>

                    {/* 🌟 Dedicated Client Handling Badge & Dynamic Color Stats */}
                    {(() => {
                      const stats = getEmployeeClientStats(emp);
                      return (
                        <div style={{
                          background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 50%, #EEF2FF 100%)',
                          borderRadius: '12px',
                          border: '1.5px solid #86EFAC',
                          padding: '10px 12px',
                          marginBottom: '12px',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ fontSize: '13px' }}>👥</span>
                              <span style={{ fontSize: '11px', fontWeight: '900', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                Clients Handled
                              </span>
                            </div>
                            <span style={{
                              background: stats.clientCount > 0 ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)' : '#E2E8F0',
                              color: stats.clientCount > 0 ? '#FFFFFF' : '#64748B',
                              fontSize: '11px',
                              fontWeight: '900',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              boxShadow: stats.clientCount > 0 ? '0 2px 6px rgba(5, 150, 105, 0.3)' : 'none'
                            }}>
                              {stats.clientCount} Active {stats.clientCount === 1 ? 'Client' : 'Clients'}
                            </span>
                          </div>

                          {/* Quick 3-Pill Breakdown: Leads | Quotes | Won */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginTop: '6px' }}>
                            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '5px 4px', textAlign: 'center', border: '1px solid #C7D2FE' }}>
                              <div style={{ fontSize: '9px', fontWeight: '800', color: '#4338CA' }}>LEADS</div>
                              <div style={{ fontSize: '12px', fontWeight: '900', color: '#312E81' }}>{stats.activeLeads}</div>
                            </div>
                            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '5px 4px', textAlign: 'center', border: '1px solid #DDD6FE' }}>
                              <div style={{ fontSize: '9px', fontWeight: '800', color: '#6D28D9' }}>QUOTES</div>
                              <div style={{ fontSize: '12px', fontWeight: '900', color: '#4C1D95' }}>{stats.quotesCount}</div>
                            </div>
                            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '5px 4px', textAlign: 'center', border: '1px solid #A7F3D0' }}>
                              <div style={{ fontSize: '9px', fontWeight: '800', color: '#047857' }}>WON</div>
                              <div style={{ fontSize: '12px', fontWeight: '900', color: '#064E3B' }}>{stats.wonDeals}</div>
                            </div>
                          </div>

                          {/* Preview of handled client names if available */}
                          {stats.clients.length > 0 && (
                            <div style={{ marginTop: '7px', fontSize: '10.5px', color: '#047857', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <span>👤 </span>
                              {stats.clients.slice(0, 2).map(c => c.name).join(', ')}
                              {stats.clients.length > 2 && ` +${stats.clients.length - 2} more`}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* 🎯 Target Goal Badge (Interactive & Ultra Colorful) */}
                    <div
                      onClick={() => openTargetModal(emp)}
                      title="Click to modify this employee's target goal"
                      className="target-goal-bar"
                      style={{
                        background: 'linear-gradient(135deg, #FAF5FF 0%, #F5F3FF 50%, #EDE9FE 100%)',
                        border: '1.5px solid #C4B5FD',
                        borderRadius: '12px',
                        padding: '8px 10px',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(124, 58, 237, 0.08)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px' }}>🎯</span>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '900', color: '#6D28D9', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>Target Goal</span>
                            <span style={{ fontSize: '9px', backgroundColor: '#7C3AED', color: '#FFFFFF', padding: '1px 5px', borderRadius: '4px' }}>✏️ Edit</span>
                          </div>
                          <div style={{ fontSize: '9.5px', color: '#7C3AED', fontWeight: '600' }}>Tasks & Revenue</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '900', color: '#5B21B6', backgroundColor: '#FFFFFF', border: '1px solid #DDD6FE', padding: '3px 8px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                          📝 {emp.targetTasks ?? 20} Tasks
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '900', color: '#047857', backgroundColor: '#FFFFFF', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                          💰 ₹{((emp.monthlyTarget ?? 1000000) / 100000).toFixed(1)}L
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '10px'
                  }}>
                    <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span>✓</span> Verified
                    </span>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => openEditModal(emp)}
                        style={{
                          backgroundColor: '#F5F3FF',
                          border: '1px solid #DDD6FE',
                          color: '#6D28D9',
                          fontSize: '10.5px',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>✏️</span> Edit
                      </button>

                      <button
                        onClick={() => onDeleteEmployee(emp._id, emp.name)}
                        style={{
                          backgroundColor: '#FEE2E2',
                          border: '1px solid #FCA5A5',
                          color: '#DC2626',
                          fontSize: '10.5px',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>🗑️</span> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Classic List Table View */
        <div className="table-responsive" style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px solid var(--border)',
          boxShadow: '0 3px 12px rgba(0,0,0,0.02)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid var(--border)' }}>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: '900', color: '#64748B' }}>STAFF</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: '900', color: '#64748B' }}>CONTACT</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: '900', color: '#64748B' }}>DEPARTMENT</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: '900', color: '#64748B' }}>CLIENTS HANDLED</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: '900', color: '#64748B' }}>STATUS</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: '900', color: '#64748B', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                    No employees onboarded yet.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, idx) => {
                  const deptStyle = getDeptBadgeStyle(emp.department);
                  const avatarGrad = getAvatarGradient(emp.name, idx);
                  const stats = getEmployeeClientStats(emp);

                  return (
                    <tr key={emp._id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: avatarGrad,
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '900',
                            fontSize: '13px'
                          }}>
                            {emp.name?.[0]?.toUpperCase() || 'E'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '13px', color: '#0F172A' }}>
                              {emp.name}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>
                              #{emp.employeeId || emp._id?.slice(-5) || 'EMP' + idx}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: '700', fontSize: '12px', color: '#334155' }}>{emp.email}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{emp.phone || '+91 98765 00000'}</div>
                      </td>

                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          backgroundColor: deptStyle.bg,
                          color: deptStyle.color,
                          border: `1px solid ${deptStyle.border}`,
                          fontSize: '10.5px',
                          fontWeight: '800',
                          padding: '2px 7px',
                          borderRadius: '5px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>{deptStyle.icon}</span>
                          <span>{emp.department || 'Enterprise Sales'}</span>
                        </span>
                      </td>

                      {/* Dynamic Clients Handled Column */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            background: stats.clientCount > 0 ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)' : '#F1F5F9',
                            color: stats.clientCount > 0 ? '#FFFFFF' : '#64748B',
                            fontSize: '11px',
                            fontWeight: '900',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span>👥</span>
                            <span>{stats.clientCount} {stats.clientCount === 1 ? 'Client' : 'Clients'}</span>
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>
                            ({stats.activeLeads} Leads • {stats.wonDeals} Won)
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          backgroundColor: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#059669',
                          fontSize: '10.5px',
                          fontWeight: '800',
                          padding: '2px 7px',
                          borderRadius: '5px'
                        }}>
                          ● ACTIVE
                        </span>
                      </td>

                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => openTargetModal(emp)}
                            style={{
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #93C5FD',
                              color: '#1D4ED8',
                              fontSize: '10.5px',
                              fontWeight: '800',
                              padding: '4px 8px',
                              borderRadius: '5px',
                              cursor: 'pointer'
                            }}
                          >
                            🎯 Target ({emp.targetTasks ?? 20})
                          </button>
                          <button
                            onClick={() => openEditModal(emp)}
                            style={{
                              backgroundColor: '#F5F3FF',
                              border: '1px solid #DDD6FE',
                              color: '#6D28D9',
                              fontSize: '10.5px',
                              fontWeight: '800',
                              padding: '4px 8px',
                              borderRadius: '5px',
                              cursor: 'pointer'
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => onDeleteEmployee(emp._id, emp.name)}
                            style={{
                              backgroundColor: '#FEE2E2',
                              border: '1px solid #FCA5A5',
                              color: '#DC2626',
                              fontSize: '10.5px',
                              fontWeight: '800',
                              padding: '4px 8px',
                              borderRadius: '5px',
                              cursor: 'pointer'
                            }}
                          >
                            Remove 🗑️
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
      )}

      {/* Edit Employee Profile Modal - Ultra Attractive & Colorful Redesign */}
      {editingEmp && (
        <div style={{
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
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAF5FF 100%)',
            borderRadius: '22px',
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            boxShadow: '0 25px 60px -15px rgba(109, 40, 217, 0.4), 0 0 0 1.5px rgba(196, 181, 253, 0.5)',
            border: '2px solid #DDD6FE',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Top decorative gradient ambient line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 35%, #EC4899 70%, #10B981 100%)'
            }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                }}>
                  ✏️
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: '#1E1B4B' }}>
                    Edit Team Member Profile
                  </h3>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#7C3AED', marginTop: '1px' }}>
                    Updating credentials, role permissions & performance target
                  </div>
                </div>
              </div>
              <button
                onClick={() => setEditingEmp(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: '#64748B',
                  fontWeight: '900'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmpEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Full Name */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '900', color: '#4338CA', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <span>👤</span> FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #C7D2FE',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#1E293B',
                    boxSizing: 'border-box',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
                  }}
                />
              </div>

              {/* Email & Phone Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '900', color: '#4338CA', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <span>✉️</span> EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #C7D2FE',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      color: '#1E293B',
                      boxSizing: 'border-box',
                      backgroundColor: '#FFFFFF',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '900', color: '#4338CA', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <span>📞</span> PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #C7D2FE',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      color: '#1E293B',
                      boxSizing: 'border-box',
                      backgroundColor: '#FFFFFF',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Department & Designation Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '900', color: '#6D28D9', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <span>🏢</span> DEPARTMENT
                  </label>
                  <input
                    type="text"
                    value={editFormData.department}
                    onChange={e => setEditFormData({ ...editFormData, department: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #DDD6FE',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      color: '#1E293B',
                      boxSizing: 'border-box',
                      backgroundColor: '#FFFFFF',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '900', color: '#6D28D9', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <span>💼</span> DESIGNATION
                  </label>
                  <input
                    type="text"
                    value={editFormData.designation}
                    onChange={e => setEditFormData({ ...editFormData, designation: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #DDD6FE',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      color: '#1E293B',
                      boxSizing: 'border-box',
                      backgroundColor: '#FFFFFF',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Role Permission */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '900', color: '#B45309', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <span>🛡️</span> ROLE PERMISSIONS
                </label>
                <select
                  value={editFormData.role}
                  onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #FDE68A',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    color: '#78350F',
                    backgroundColor: '#FFFBEB',
                    boxSizing: 'border-box',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="sales">Sales Executive (Deals, Leads & Calls)</option>
                  <option value="support">Customer Support (Helpdesk & Live Chat)</option>
                  <option value="employee">General Staff Member</option>
                  <option value="admin">Operations Admin</option>
                </select>
              </div>

              {/* 🎯 Target Setting for Individual Sales Executive - Colorful Bento Box */}
              <div style={{
                background: 'linear-gradient(135deg, #FAF5FF 0%, #F5F3FF 50%, #EDE9FE 100%)',
                border: '1.5px solid #C4B5FD',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '2px',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.08)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '16px' }}>🎯</span>
                    <span style={{ fontSize: '12px', fontWeight: '900', color: '#6D28D9' }}>
                      EMPLOYEE TARGET CONFIGURATION
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#FFFFFF', backgroundColor: '#7C3AED', padding: '2px 8px', borderRadius: '6px' }}>
                    Live App Sync
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '8px 10px', borderRadius: '10px', border: '1.2px solid #BFDBFE' }}>
                    <label style={{ fontSize: '10.5px', fontWeight: '900', color: '#1D4ED8', display: 'block', marginBottom: '3px' }}>
                      📝 TASK TARGET (COUNT)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editFormData.targetTasks ?? 20}
                      onChange={e => setEditFormData({ ...editFormData, targetTasks: Number(e.target.value) })}
                      placeholder="e.g. 20"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1.2px solid #60A5FA',
                        fontSize: '13px',
                        fontWeight: '800',
                        color: '#1E3A8A',
                        boxSizing: 'border-box',
                        backgroundColor: '#F8FAFC'
                      }}
                    />
                    <span style={{ fontSize: '9.5px', color: '#2563EB', marginTop: '2px', display: 'block', fontWeight: '600' }}>
                      Target based on tasks done
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '8px 10px', borderRadius: '10px', border: '1.2px solid #A7F3D0' }}>
                    <label style={{ fontSize: '10.5px', fontWeight: '900', color: '#047857', display: 'block', marginBottom: '3px' }}>
                      💰 REVENUE TARGET (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50000"
                      value={editFormData.monthlyTarget ?? 1000000}
                      onChange={e => setEditFormData({ ...editFormData, monthlyTarget: Number(e.target.value) })}
                      placeholder="e.g. 1000000"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1.2px solid #34D399',
                        fontSize: '13px',
                        fontWeight: '800',
                        color: '#064E3B',
                        boxSizing: 'border-box',
                        backgroundColor: '#F8FAFC'
                      }}
                    />
                    <span style={{ fontSize: '9.5px', color: '#059669', marginTop: '2px', display: 'block', fontWeight: '700' }}>
                      Goal: ₹{((editFormData.monthlyTarget ?? 1000000) / 100000).toFixed(1)} Lakhs
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setEditingEmp(null)}
                  style={{
                    background: '#F1F5F9',
                    border: '1.2px solid #CBD5E1',
                    color: '#475569',
                    padding: '9px 16px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '9px 22px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  ✓ Save Team Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🎯 Dedicated Super Attractive & Colourful Target Setting Modal */}
      {targetEmp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #FAF5FF 100%)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '460px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(109, 40, 217, 0.35)',
            border: '2px solid #C4B5FD',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Top decorative ambient gradient bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, #7C3AED 0%, #EC4899 50%, #10B981 100%)'
            }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                }}>
                  🎯
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: '#1E1B4B' }}>
                    Set Sales Performance Target
                  </h3>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#7C3AED', marginTop: '2px' }}>
                    👤 {targetEmp.name} ({targetEmp.designation || 'Sales Executive'})
                  </div>
                </div>
              </div>
              <button
                onClick={() => setTargetEmp(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: '#64748B',
                  fontWeight: '900'
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#475569', lineHeight: '18px', marginBottom: '16px', background: '#F5F3FF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #DDD6FE' }}>
              💡 Yeh target sales employee ke **Mobile Dashboard** par live show hoga aur unke completed tasks ke according dynamically update hota rahega.
            </p>

            <form onSubmit={handleSaveTargetDirect} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Task Target Card */}
              <div style={{
                background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                border: '1.5px solid #93C5FD',
                borderRadius: '14px',
                padding: '12px 14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: '900', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>📝</span> TASK COMPLETION TARGET
                  </label>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#1D4ED8', backgroundColor: '#FFFFFF', padding: '2px 8px', borderRadius: '6px' }}>
                    Real-time KPI
                  </span>
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  max="1000"
                  value={targetFormData.targetTasks}
                  onChange={e => setTargetFormData({ ...targetFormData, targetTasks: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #60A5FA',
                    fontSize: '15px',
                    fontWeight: '800',
                    color: '#1E3A8A',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  placeholder="e.g. 20 Tasks"
                />
                <span style={{ fontSize: '10.5px', color: '#2563EB', marginTop: '4px', display: 'block', fontWeight: '600' }}>
                  Employee app ka % completion is task count par based hoga.
                </span>
              </div>

              {/* Monthly Revenue Target Card */}
              <div style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                border: '1.5px solid #6EE7B7',
                borderRadius: '14px',
                padding: '12px 14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: '900', color: '#065F46', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>💰</span> MONTHLY REVENUE TARGET (₹)
                  </label>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#047857', backgroundColor: '#FFFFFF', padding: '2px 8px', borderRadius: '6px' }}>
                    ₹ In INR
                  </span>
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  step="25000"
                  value={targetFormData.monthlyTarget}
                  onChange={e => setTargetFormData({ ...targetFormData, monthlyTarget: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #34D399',
                    fontSize: '15px',
                    fontWeight: '800',
                    color: '#064E3B',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  placeholder="e.g. 1000000"
                />
                <span style={{ fontSize: '10.5px', color: '#059669', marginTop: '4px', display: 'block', fontWeight: '700' }}>
                  Preview: ₹{Number(targetFormData.monthlyTarget || 0).toLocaleString()} (₹{((Number(targetFormData.monthlyTarget || 0)) / 100000).toFixed(1)} Lakhs)
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setTargetEmp(null)}
                  style={{
                    backgroundColor: '#F1F5F9',
                    border: '1.2px solid #CBD5E1',
                    color: '#475569',
                    padding: '9px 16px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTarget}
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '9px 20px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isSavingTarget ? 'Saving Target...' : '✓ Save & Sync Target Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
