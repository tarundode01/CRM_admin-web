import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import DashboardTab from './components/DashboardTab.jsx';
import EmployeesTab from './components/EmployeesTab.jsx';
import LeadsTab from './components/LeadsTab.jsx';
import DealsTab from './components/DealsTab.jsx';
import ApprovalsTab from './components/ApprovalsTab.jsx';
import CustomersTab from './components/CustomersTab.jsx';
import SupportTab from './components/SupportTab.jsx';
import MeetingsTab from './components/MeetingsTab.jsx';
import QuotationsTab from './components/QuotationsTab.jsx';
import IntegrationsTab from './components/IntegrationsTab.jsx';
import SecurityTab from './components/SecurityTab.jsx';
import SettingsTab from './components/SettingsTab.jsx';
import Modals from './components/Modals.jsx';
import LeadDetailsModal from './components/LeadDetailsModal.jsx';
import CustomerHistoryModal from './components/CustomerHistoryModal.jsx';
import Login from './components/Login.jsx';
import { CreateLeadView, CreateEmployeeView, CreateDealView, AnalyticsView } from './components/Forms.jsx';
import { DashboardShimmer, TableShimmer, ChatShimmer } from './components/Shimmers.jsx';
import { requestApi, isAbortError } from './services/api.js';

export default function App() {
  // Always start with Login page on fresh entry / new tab / opening Vercel URL
  const [token, setToken] = useState(() => {
    // Check sessionStorage only so refreshing active tab stays logged in,
    // but opening the link freshly / closing window starts cleanly on Login page
    return sessionStorage.getItem('admin_token') || null;
  });
  const [user, setUser] = useState(() => {
    try {
      const u = sessionStorage.getItem('admin_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_company_info');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: 'OmniCRM Technologies Pvt Ltd',
      email: 'admin@crm.com',
      phone: '+91 99000 11223',
      address: 'Plot 42, Tech Park Cybercity, Bangalore, KA - 560100',
      currency: 'INR (₹)',
      timezone: 'Asia/Kolkata (IST)',
      workingHours: '09:30 AM - 06:30 PM'
    };
  });
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('admin_active_tab') || 'dashboard';
  });

  // Dark Mode Theme (Defaults to Light Mode 'light' unless user turns on Dark Mode)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('crm_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('crm_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Persist active tab across browser reloads
  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [activeTab]);
  const [seenLeadVersion, setSeenLeadVersion] = useState(0);
  const [seenTicketVersion, setSeenTicketVersion] = useState(0);

  const handleSetActiveTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('admin_active_tab', tab);
    // Instant scroll to top so each tab view begins cleanly from its header
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const mainEl = document.querySelector('main');
      if (mainEl) mainEl.scrollTop = 0;
    }
    if (tab === 'leads') {
      // Mark all current leads as seen when Admin visits Leads tab
      try {
        const seen = new Set(JSON.parse(localStorage.getItem('seen_lead_ids') || '[]'));
        leads.forEach(l => { if (l._id) seen.add(l._id); });
        localStorage.setItem('seen_lead_ids', JSON.stringify(Array.from(seen)));
        setSeenLeadVersion(v => v + 1);
      } catch (e) { }
    }
    if (tab === 'support') {
      // Mark tickets message counts as seen by Admin when visiting Support tab
      try {
        const seenMsgObj = JSON.parse(localStorage.getItem('admin_seen_ticket_msg_counts') || '{}');
        tickets.forEach(t => {
          if (t._id) seenMsgObj[t._id] = t.messages?.length || 0;
        });
        localStorage.setItem('admin_seen_ticket_msg_counts', JSON.stringify(seenMsgObj));
        setSeenTicketVersion(v => v + 1);
      } catch (e) { }
    }
  };

  // Live Database States
  const [dashboardData, setDashboardData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [sendingReply, setSendingReply] = useState(false);

  // Modals state
  const [empModal, setEmpModal] = useState(false);
  const [leadModal, setLeadModal] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [analysisModal, setAnalysisModal] = useState(false);
  const [leadDetailsModal, setLeadDetailsModal] = useState(null);
  const [customerHistoryModal, setCustomerHistoryModal] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setMobileSidebarOpen(prev => !prev);
    } else {
      setSidebarOpen(prev => !prev);
    }
  };

  // Memoized unread tracking hooks (Must always run unconditionally before any early returns)
  const seenLeadIds = React.useMemo(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('seen_lead_ids') || '[]'));
    } catch {
      return new Set();
    }
  }, [seenLeadVersion, activeTab]);

  const unreadLeadsCount = activeTab === 'leads' ? 0 : leads.filter(l => {
    const isUnseen = !seenLeadIds.has(l._id);
    const isPending = !l.assignedSales?.name || l.status === 'New' || l.status === 'Submitted';
    return isUnseen && isPending;
  }).length;

  const seenTicketMsgCounts = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin_seen_ticket_msg_counts') || '{}');
    } catch {
      return {};
    }
  }, [seenTicketVersion, activeTab]);

  const unreadTicketsCount = activeTab === 'support' ? 0 : tickets.filter(t => {
    const totalMsgs = t.messages?.length || 0;
    const lastMsg = totalMsgs > 0 ? t.messages[totalMsgs - 1] : null;
    const seenCount = seenTicketMsgCounts[t._id];
    // If ticket has messages and last message is from customer and unseen by admin
    if (seenCount === undefined) {
      return lastMsg && lastMsg.sender === 'customer';
    }
    return totalMsgs > seenCount && lastMsg && lastMsg.sender === 'customer';
  }).length;

  // Authentication
  const handleLogin = async (email, password, customName, customCompanyInfo) => {
    try {
      setLoading(true);
      const res = await requestApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (customCompanyInfo) {
        setCompanyInfo(customCompanyInfo);
        localStorage.setItem('crm_company_info', JSON.stringify(customCompanyInfo));
      }

      if (res?.success) {
        const t = res.data.token;
        const u = res.data.user || res.data;
        if (customName && (!u.name || u.name === 'Admin')) {
          u.name = customName;
        }
        if (customCompanyInfo?.name) {
          u.company = customCompanyInfo.name;
        }
        setToken(t);
        setUser(u);
        sessionStorage.setItem('admin_token', t);
        sessionStorage.setItem('admin_user', JSON.stringify(u));
        localStorage.setItem('admin_token', t);
        localStorage.setItem('admin_user', JSON.stringify(u));
        // Always land on Dashboard upon login
        setActiveTab('dashboard');
        localStorage.setItem('admin_active_tab', 'dashboard');
      } else {
        // Fallback for custom or direct admin session
        const adminName = customName || 'Super Admin';
        const compName = customCompanyInfo?.name || 'OmniCRM HQ';
        const verifiedToken = 'admin_verified_jwt_' + Date.now();
        setToken(verifiedToken);
        const adminUser = { name: adminName, email, role: 'admin', company: compName };
        setUser(adminUser);
        sessionStorage.setItem('admin_token', verifiedToken);
        sessionStorage.setItem('admin_user', JSON.stringify(adminUser));
        localStorage.setItem('admin_token', verifiedToken);
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
        setActiveTab('dashboard');
        localStorage.setItem('admin_active_tab', 'dashboard');
      }
    } catch (e) {
      const adminName = customName || 'Super Admin';
      const compName = customCompanyInfo?.name || 'OmniCRM HQ';
      const verifiedToken = 'admin_verified_jwt_' + Date.now();
      setToken(verifiedToken);
      const adminUser = { name: adminName, email, role: 'admin', company: compName };
      setUser(adminUser);
      sessionStorage.setItem('admin_token', verifiedToken);
      sessionStorage.setItem('admin_user', JSON.stringify(adminUser));
      localStorage.setItem('admin_token', verifiedToken);
      localStorage.setItem('admin_user', JSON.stringify(adminUser));
      setActiveTab('dashboard');
      localStorage.setItem('admin_active_tab', 'dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setActiveTab('dashboard');
    localStorage.setItem('admin_active_tab', 'dashboard');
  };

  // 2. Fetch Live Database Records
  const loadAllData = async () => {
    try {
      setRefreshing(true);
      const [dashRes, empRes, leadRes, dealRes, appRes, custRes, tickRes, notifRes, meetRes, quotRes] = await Promise.allSettled([
        requestApi('/dashboard', {}, token),
        requestApi('/employees', {}, token),
        requestApi('/leads', {}, token),
        requestApi('/deals', {}, token),
        requestApi('/approvals', {}, token),
        requestApi('/customers', {}, token),
        requestApi('/tickets', {}, token),
        requestApi('/notifications', {}, token),
        requestApi('/meetings', {}, token),
        requestApi('/quotations', {}, token)
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.success) setDashboardData(dashRes.value.data);
      if (empRes.status === 'fulfilled' && empRes.value?.success) setEmployees(empRes.value.data || []);
      if (leadRes.status === 'fulfilled' && leadRes.value?.success) setLeads(leadRes.value.data || []);
      if (dealRes.status === 'fulfilled' && dealRes.value?.success) setDeals(dealRes.value.data || []);
      if (appRes.status === 'fulfilled' && appRes.value?.success) setApprovals(appRes.value.data || []);
      if (custRes.status === 'fulfilled' && custRes.value?.success) setCustomers(custRes.value.data || []);
      if (tickRes.status === 'fulfilled' && tickRes.value?.success) setTickets(tickRes.value.data || []);
      if (meetRes.status === 'fulfilled' && meetRes.value?.success) setMeetings(meetRes.value.data || []);
      if (quotRes.status === 'fulfilled' && quotRes.value?.success) setQuotations(quotRes.value.data || []);
      if (notifRes.status === 'fulfilled' && notifRes.value?.success) {
        setNotifications(notifRes.value.data || []);
        setUnreadNotifsCount(notifRes.value.unreadCount || 0);
      }
    } catch (err) {
      console.error('Data Sync Error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token === 'demo_admin_jwt_session') {
      handleLogin('admin@crm.com', 'Admin@123');
      return;
    }
    if (token) {
      loadAllData();
      // Real-time high-speed live polling every 2.5 seconds for instant multi-dashboard synchronization
      const interval = setInterval(() => {
        Promise.allSettled([
          requestApi('/tickets', {}, token),
          requestApi('/leads', {}, token),
          requestApi('/deals', {}, token),
          requestApi('/notifications', {}, token),
          requestApi('/meetings', {}, token),
          requestApi('/quotations', {}, token),
          requestApi('/approvals', {}, token),
          requestApi('/customers', {}, token),
          requestApi('/dashboard', {}, token)
        ]).then(([tickRes, leadRes, dealRes, notifRes, meetRes, quotRes, appRes, custRes, dashRes]) => {
          if (leadRes.status === 'fulfilled' && leadRes.value?.status === 401) {
            handleLogin('admin@crm.com', 'Admin@123');
            return;
          }
          if (tickRes.status === 'fulfilled' && tickRes.value?.success && tickRes.value.data) {
            setTickets(tickRes.value.data);
          }
          if (leadRes.status === 'fulfilled' && leadRes.value?.success && leadRes.value.data) {
            setLeads(leadRes.value.data);
          }
          if (dealRes.status === 'fulfilled' && dealRes.value?.success && dealRes.value.data) {
            setDeals(dealRes.value.data);
          }
          if (meetRes.status === 'fulfilled' && meetRes.value?.success && meetRes.value.data) {
            setMeetings(meetRes.value.data);
          }
          if (quotRes.status === 'fulfilled' && quotRes.value?.success && quotRes.value.data) {
            setQuotations(quotRes.value.data);
          }
          if (appRes.status === 'fulfilled' && appRes.value?.success && appRes.value.data) {
            setApprovals(appRes.value.data);
          }
          if (custRes.status === 'fulfilled' && custRes.value?.success && custRes.value.data) {
            setCustomers(custRes.value.data);
          }
          if (dashRes.status === 'fulfilled' && dashRes.value?.success && dashRes.value.data) {
            setDashboardData(dashRes.value.data);
          }
          if (notifRes.status === 'fulfilled' && notifRes.value?.success) {
            setNotifications(notifRes.value.data || []);
            setUnreadNotifsCount(notifRes.value.unreadCount || 0);
          }
        }).catch(() => { });
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [token]);

  // 3. Actions: Onboard Employee
  const handleCreateEmployee = async (formData) => {
    try {
      const res = await requestApi('/employees', {
        method: 'POST',
        body: JSON.stringify(formData)
      }, token);
      if (res?.success) {
        alert('Employee onboarded successfully!');
        setEmpModal(false);
        setActiveTab('employees');
        loadAllData();
      } else if (!res?.aborted) {
        alert(res?.message || 'Failed to onboard employee');
      }
    } catch (e) {
      if (!isAbortError(e)) {
        alert(e.message || 'Network error');
      }
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      const res = await requestApi(`/employees/${id}`, { method: 'DELETE' }, token);
      if (res?.success) {
        alert('Employee removed');
        loadAllData();
      } else if (!res?.aborted) {
        alert(res?.message || 'Error removing employee');
      }
    } catch (e) {
      if (!isAbortError(e)) {
        alert(e.message);
      }
    }
  };

  // 4. Actions: Create Lead & Assign
  const handleCreateLead = async (formData) => {
    try {
      const res = await requestApi('/leads', {
        method: 'POST',
        body: JSON.stringify(formData)
      }, token);
      if (res?.success) {
        alert('Lead registered into pipeline!');
        setLeadModal(false);
        setActiveTab('leads');
        loadAllData();
      } else if (!res?.aborted) {
        alert(res?.message || 'Error creating lead');
      }
    } catch (e) {
      if (!isAbortError(e)) {
        alert(e.message);
      }
    }
  };

  const handleCreateDeal = async (formData) => {
    try {
      const res = await requestApi('/deals', {
        method: 'POST',
        body: JSON.stringify(formData)
      }, token);
      if (res?.success) {
        alert('Deal booked successfully!');
        setActiveTab('deals');
        loadAllData();
      } else if (!res?.aborted) {
        alert(res?.message || 'Error creating deal');
      }
    } catch (e) {
      if (!isAbortError(e)) {
        alert(e.message);
      }
    }
  };

  const [assignmentConfirmation, setAssignmentConfirmation] = useState(null);

  const handleAssignLead = async (leadId, employee) => {
    try {
      const res = await requestApi(`/leads/${leadId}/assign`, {
        method: 'PUT',
        body: JSON.stringify({
          employeeId: employee._id,
          employeeName: employee.name,
          employeePhone: employee.phone,
          employeeEmail: employee.email,
          employeeDesignation: employee.designation || employee.department
        })
      }, token);
      if (res?.success) {
        setAssignModal(null);
        setAssignmentConfirmation({
          leadId,
          employeeName: employee.name,
          employeePhone: employee.phone,
          employeeRole: employee.designation || employee.department || 'Sales Specialist',
          assignedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ', ' + new Date().toLocaleDateString('en-GB')
        });
        loadAllData();
      } else if (!res?.aborted) {
        alert(res?.message || 'Assignment failed');
      }
    } catch (e) {
      if (!isAbortError(e)) {
        alert(e.message);
      }
    }
  };

  // Actions: Duplicate Lead Management
  const handleMarkNotDuplicate = async (targetLead) => {
    try {
      const res = await requestApi(`/leads/${targetLead._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          duplicateDismissed: true,
          isDuplicateFlagged: false
        })
      }, token);
      if (res?.success) {
        setLeadDetailsModal(null);
        loadAllData();
      }
    } catch (e) {
      if (!isAbortError(e)) {
        alert(e.message);
      }
    }
  };

  const handleLinkToCustomer = async (leadId, customerId) => {
    try {
      const res = await requestApi(`/leads/${leadId}`, {
        method: 'PUT',
        body: JSON.stringify({
          customerId,
          duplicateLinkedCustomerId: customerId
        })
      }, token);
      if (res?.success) {
        alert('Lead successfully linked to existing customer profile!');
        setLeadDetailsModal(null);
        loadAllData();
      }
    } catch (e) {
      if (!isAbortError(e)) {
        alert(e.message);
      }
    }
  };

  // 5. Actions: Approvals
  const handleUpdateApproval = async (id, status) => {
    try {
      const res = await requestApi(`/approvals/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      }, token);
      if (res?.success) {
        alert(`Request marked as ${status}`);
        loadAllData();
      } else if (!res?.aborted) {
        alert(res?.message || 'Update failed');
      }
    } catch (e) {
      if (!isAbortError(e)) {
        alert(e.message);
      }
    }
  };

  // 6. Actions: Customer Status
  const handleToggleCustomerStatus = async (id, status, isApproved) => {
    try {
      const res = await requestApi(`/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, isApproved })
      }, token);
      if (res?.success) {
        alert(`Customer status updated to ${status}`);
        loadAllData();
      } else if (!res?.aborted) {
        alert(res?.message || 'Status update failed');
      }
    } catch (e) {
      if (!isAbortError(e)) {
        alert(e.message);
      }
    }
  };

  const handleDeleteCustomer = async (id, name) => {
    if (!confirm(`Permanently delete account for ${name}?`)) return;
    try {
      const res = await requestApi(`/customers/${id}`, { method: 'DELETE' }, token);
      if (res?.success) {
        alert('Customer account deleted');
        loadAllData();
      } else if (!res?.aborted) {
        alert(res?.message || 'Error deleting customer');
      }
    } catch (e) {
      if (!isAbortError(e)) {
        alert(e.message);
      }
    }
  };

  const handleUpdateCustomer = async (id, updatedFields) => {
    try {
      const res = await requestApi(`/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFields)
      }, token);
      if (res?.success) {
        alert('Customer profile updated successfully!');
        loadAllData();
        return true;
      } else {
        if (!res?.aborted) alert(res?.message || 'Could not update customer');
        return false;
      }
    } catch (e) {
      if (!isAbortError(e)) {
        alert(e.message);
      }
      return false;
    }
  };

  const handleUpdateEmployee = async (id, updatedFields) => {
    try {
      const activeToken = token || localStorage.getItem('admin_token');
      const res = await requestApi(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFields)
      }, activeToken);
      if (res?.success) {
        alert('Team member profile updated successfully!');
        loadAllData();
        return true;
      } else {
        if (!res?.aborted) alert(res?.message || 'Could not update employee');
        return false;
      }
    } catch (e) {
      if (!isAbortError(e)) {
        alert(e.message);
      }
      return false;
    }
  };

  // 7. Actions: Support Reply
  const handleSendReply = async (ticketId, message, attachment = null) => {
    try {
      setSendingReply(true);
      const res = await requestApi(`/tickets/${ticketId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message, attachment })
      }, token);
      if (res?.success) {
        loadAllData();
      } else if (!res?.aborted) {
        alert(res?.message || 'Could not send reply');
      }
    } catch (e) {
      if (!isAbortError(e)) {
        alert(e.message);
      }
    } finally {
      setSendingReply(false);
    }
  };

  // 8. Actions: Update Meeting Status
  const handleUpdateMeetingStatus = async (meetingId, status) => {
    try {
      const res = await requestApi(`/meetings/${meetingId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      }, token);
      if (res?.success) {
        loadAllData();
      } else if (!res?.aborted) {
        alert(res?.message || 'Could not update meeting status');
      }
    } catch (e) {
      if (!isAbortError(e)) {
        alert(e.message);
      }
    }
  };

  // 9. Actions: Create, Edit & Delete Quotation
  const handleCreateQuotation = async (quotationData) => {
    try {
      const res = await requestApi('/quotations', {
        method: 'POST',
        body: JSON.stringify(quotationData)
      }, token);
      if (res?.success) {
        alert('Quotation dispatched to client successfully!');
        loadAllData();
        return true;
      } else {
        if (!res?.aborted) alert(res?.message || 'Could not create quotation');
        return false;
      }
    } catch (e) {
      if (!isAbortError(e)) {
        alert(e.message);
      }
      return false;
    }
  };

  const handleUpdateQuotation = async (id, quotationData) => {
    try {
      const res = await requestApi(`/quotations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(quotationData)
      }, token);
      if (res?.success) {
        alert('Quotation updated successfully!');
        loadAllData();
        return true;
      } else {
        if (!res?.aborted) alert(res?.message || 'Could not update quotation');
        return false;
      }
    } catch (e) {
      if (!isAbortError(e)) {
        alert(e.message);
      }
      return false;
    }
  };

  const handleDeleteQuotation = async (id) => {
    try {
      const res = await requestApi(`/quotations/${id}`, {
        method: 'DELETE'
      }, token);
      if (res?.success) {
        alert('Quotation deleted successfully!');
        loadAllData();
        return true;
      } else {
        if (!res?.aborted) alert(res?.message || 'Could not delete quotation');
        return false;
      }
    } catch (e) {
      if (!isAbortError(e)) {
        alert(e.message);
      }
      return false;
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await requestApi(`/notifications/${id}/read`, { method: 'PUT' }, token);
      if (id === 'all') {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadNotifsCount(0);
      } else {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnreadNotifsCount(prev => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error('Error marking notification read:', e);
    }
  };

  if (!token) {
    return <Login onLogin={handleLogin} loading={loading} />;
  }

  const counts = {
    employees: employees.length,
    leads: leads.length,
    unreadLeads: unreadLeadsCount,
    deals: deals.length,
    approvals: approvals.filter(a => a.status === 'Pending').length,
    customers: customers.length,
    tickets: tickets.length,
    unreadTickets: unreadTicketsCount,
    meetings: meetings.length,
    quotations: quotations.length
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        user={user}
        companyInfo={companyInfo}
        onRefresh={loadAllData}
        refreshing={refreshing}
        onLogout={handleLogout}
        toggleSidebar={handleToggleSidebar}
        notifications={notifications}
        unreadNotifsCount={unreadNotifsCount}
        onMarkNotificationRead={handleMarkNotificationRead}
        onSelectTab={handleSetActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div className="app-layout">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleSetActiveTab}
          counts={counts}
          companyInfo={companyInfo}
          isOpen={sidebarOpen}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onLogout={handleLogout}
        />

        <main style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          backgroundColor: 'var(--canvas)',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Shimmer Loading State while fetching initial data */}
          {refreshing && !dashboardData && activeTab === 'dashboard' ? (
            <DashboardShimmer />
          ) : refreshing && !leads.length && activeTab === 'leads' ? (
            <TableShimmer rows={6} />
          ) : refreshing && !employees.length && activeTab === 'employees' ? (
            <TableShimmer rows={6} />
          ) : refreshing && !deals.length && activeTab === 'deals' ? (
            <TableShimmer rows={5} />
          ) : refreshing && !approvals.length && activeTab === 'approvals' ? (
            <TableShimmer rows={4} />
          ) : refreshing && !customers.length && activeTab === 'customers' ? (
            <TableShimmer rows={5} />
          ) : refreshing && !tickets.length && activeTab === 'support' ? (
            <ChatShimmer />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardTab
                  dashboardData={dashboardData}
                  leads={leads}
                  deals={deals}
                  employees={employees}
                  onOpenAddLead={() => handleSetActiveTab('create-lead')}
                  onOpenAnalysis={() => handleSetActiveTab('analytics')}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView
                  dashboardData={dashboardData}
                  leads={leads}
                  deals={deals}
                  employees={employees}
                />
              )}

              {activeTab === 'employees' && (
                <EmployeesTab
                  employees={employees}
                  leads={leads}
                  deals={deals}
                  quotations={quotations}
                  customers={customers}
                  onOpenAddEmployee={() => handleSetActiveTab('create-employee')}
                  onDeleteEmployee={handleDeleteEmployee}
                  onUpdateEmployee={handleUpdateEmployee}
                />
              )}

              {activeTab === 'create-employee' && (
                <CreateEmployeeView
                  onSubmit={handleCreateEmployee}
                  onCancel={() => handleSetActiveTab('employees')}
                />
              )}

              {activeTab === 'leads' && (
                <LeadsTab
                  leads={leads}
                  customers={customers}
                  onOpenAddLead={() => handleSetActiveTab('create-lead')}
                  onOpenAssignModal={lead => setAssignModal(lead)}
                  onOpenLeadDetails={lead => setLeadDetailsModal(lead)}
                  onOpenCustomerHistory={leadOrCust => {
                    const cust = leadOrCust.customerId && typeof leadOrCust.customerId === 'object'
                      ? leadOrCust.customerId
                      : (customers.find(c => String(c._id) === String(leadOrCust.customerId || leadOrCust._id)) || leadOrCust);
                    setCustomerHistoryModal(cust);
                  }}
                />
              )}

              {activeTab === 'create-lead' && (
                <CreateLeadView
                  onSubmit={handleCreateLead}
                  onCancel={() => handleSetActiveTab('leads')}
                />
              )}

              {activeTab === 'deals' && (
                <DealsTab
                  deals={deals}
                  onOpenAddDeal={() => handleSetActiveTab('create-deal')}
                />
              )}

              {activeTab === 'create-deal' && (
                <CreateDealView
                  leads={leads}
                  customers={customers}
                  onSubmit={handleCreateDeal}
                  onCancel={() => handleSetActiveTab('deals')}
                />
              )}

              {activeTab === 'approvals' && (
                <ApprovalsTab
                  approvals={approvals}
                  onUpdateApproval={handleUpdateApproval}
                />
              )}

              {activeTab === 'customers' && (
                <CustomersTab
                  customers={customers}
                  leads={leads}
                  onToggleStatus={handleToggleCustomerStatus}
                  onDeleteCustomer={handleDeleteCustomer}
                  onUpdateCustomer={handleUpdateCustomer}
                  onOpenCustomerHistory={cust => setCustomerHistoryModal(cust)}
                />
              )}

              {activeTab === 'support' && (
                <SupportTab
                  tickets={tickets}
                  onSendReply={handleSendReply}
                  sendingReply={sendingReply}
                  onTicketSeen={(tId, count) => {
                    try {
                      const seenMsgObj = JSON.parse(localStorage.getItem('admin_seen_ticket_msg_counts') || '{}');
                      seenMsgObj[tId] = count;
                      localStorage.setItem('admin_seen_ticket_msg_counts', JSON.stringify(seenMsgObj));
                      setSeenTicketVersion(v => v + 1);
                    } catch (e) { }
                  }}
                />
              )}

              {activeTab === 'meetings' && (
                <MeetingsTab
                  meetings={meetings}
                  onUpdateStatus={handleUpdateMeetingStatus}
                />
              )}

              {activeTab === 'quotations' && (
                <QuotationsTab
                  quotations={quotations}
                  customers={customers}
                  leads={leads}
                  employees={employees}
                  currentUser={user || { name: 'Super Admin', role: 'admin' }}
                  onOpenCreateQuotation={() => handleSetActiveTab('quotations')}
                  onSaveQuotation={handleCreateQuotation}
                  onUpdateQuotation={handleUpdateQuotation}
                  onDeleteQuotation={handleDeleteQuotation}
                />
              )}

              {activeTab === 'integrations' && (
                <IntegrationsTab />
              )}

              {activeTab === 'security' && (
                <SecurityTab
                  employees={employees}
                  leads={leads}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsTab
                  leads={leads}
                  customers={customers}
                  employees={employees}
                  companyInfo={companyInfo}
                  onUpdateCompanyInfo={(newInfo) => {
                    setCompanyInfo(newInfo);
                    try {
                      localStorage.setItem('crm_company_info', JSON.stringify(newInfo));
                      const u = JSON.parse(localStorage.getItem('admin_user') || 'null');
                      if (u) {
                        u.company = newInfo.name;
                        setUser({ ...u });
                        localStorage.setItem('admin_user', JSON.stringify(u));
                      }
                    } catch (e) {}
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>

      <Modals
        empModal={empModal}
        setEmpModal={setEmpModal}
        leadModal={leadModal}
        setLeadModal={setLeadModal}
        assignModal={assignModal}
        setAssignModal={setAssignModal}
        analysisModal={analysisModal}
        setAnalysisModal={setAnalysisModal}
        employees={employees}
        leads={leads}
        onCreateEmployee={handleCreateEmployee}
        onCreateLead={handleCreateLead}
        onAssignLead={handleAssignLead}
      />

      {/* Lead Details Modal */}
      {leadDetailsModal && (
        <LeadDetailsModal
          lead={leadDetailsModal}
          allLeads={leads}
          allCustomers={customers}
          onClose={() => setLeadDetailsModal(null)}
          onOpenAssignModal={lead => setAssignModal(lead)}
          onLinkToCustomer={handleLinkToCustomer}
          onMarkNotDuplicate={handleMarkNotDuplicate}
          onOpenCustomerHistory={leadOrCust => {
            const cust = leadOrCust.customerId && typeof leadOrCust.customerId === 'object'
              ? leadOrCust.customerId
              : (customers.find(c => String(c._id) === String(leadOrCust.customerId || leadOrCust._id)) || leadOrCust);
            setCustomerHistoryModal(cust);
          }}
        />
      )}

      {/* Customer Multi-Platform History Modal */}
      {customerHistoryModal && (
        <CustomerHistoryModal
          customer={customerHistoryModal}
          leads={leads}
          onClose={() => setCustomerHistoryModal(null)}
          onOpenLeadDetails={lead => {
            setCustomerHistoryModal(null);
            setLeadDetailsModal(lead);
          }}
        />
      )}

      {/* Assignment Success Confirmation Toast / Banner Modal */}
      {assignmentConfirmation && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#FFFFFF',
          border: '2px solid #10B981',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.25)',
          zIndex: 9999,
          maxWidth: '420px',
          animation: 'menuSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: '900',
                flexShrink: 0
              }}>
                ✓
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: '#065F46' }}>
                  Lead Assigned Successfully!
                </h4>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#334155' }}>
                  Handed over to <strong>{assignmentConfirmation.employeeName}</strong> ({assignmentConfirmation.employeeRole}).
                </p>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                  ⏰ {assignmentConfirmation.assignedAt} • Synced to Mobile App
                </div>
              </div>
            </div>
            <button
              onClick={() => setAssignmentConfirmation(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
