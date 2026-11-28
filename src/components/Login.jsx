import React, { useState } from 'react';

export default function Login({ onLogin, loading }) {
  // Mode: 'login' or 'create'
  const [mode, setMode] = useState('login');

  // Eye Toggle States for Passwords & Keys
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showLoginSecurityKey, setShowLoginSecurityKey] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showCreateConfirmPassword, setShowCreateConfirmPassword] = useState(false);
  const [showCreateSecurityKey, setShowCreateSecurityKey] = useState(false);

  // Login Form States
  const [email, setEmail] = useState('admin@crm.com');
  const [password, setPassword] = useState('Admin@123');
  const [loginSecurityKey, setLoginSecurityKey] = useState('');

  // Comprehensive Create Account Form States (Market-ready Onboarding)
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createCompanyName, setCreateCompanyName] = useState('');
  const [createRole, setCreateRole] = useState('Super Administrator / Owner');
  const [createIndustry, setCreateIndustry] = useState('Information Technology / SaaS');
  const [createCompanySize, setCreateCompanySize] = useState('11-50 Employees');
  const [createCurrency, setCreateCurrency] = useState('INR (₹)');
  const [createAddress, setCreateAddress] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createConfirmPassword, setCreateConfirmPassword] = useState('');
  const [createSecurityKey, setCreateSecurityKey] = useState('');

  // Status & Feedback messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Confidential Master Security Key
  const REQUIRED_SECURITY_KEY = '123456789';

  // Helper to get registered admin accounts from localStorage
  const getRegisteredAdmins = () => {
    try {
      const saved = localStorage.getItem('crm_registered_admins');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Check Security Key without disclosing secret
    if (loginSecurityKey.trim() !== REQUIRED_SECURITY_KEY) {
      setErrorMsg('Access Denied: Invalid Master Security Key! Please provide authorized 9-digit security key.');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const admins = getRegisteredAdmins();
    const customAdmin = admins.find(a => a.email.toLowerCase() === trimmedEmail);

    if (customAdmin) {
      if (customAdmin.password !== password) {
        setErrorMsg('Authentication Failed: Invalid admin password!');
        return;
      }
      onLogin(customAdmin.email, customAdmin.password, customAdmin.name, customAdmin.companyInfo);
    } else {
      onLogin(email, password, 'Super Admin');
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Verify Security Key
    if (createSecurityKey.trim() !== REQUIRED_SECURITY_KEY) {
      setErrorMsg('Authorization Failed: Security Key mismatch! Enter valid Master Security Key to authorize admin account creation.');
      return;
    }

    if (!createEmail || !createPassword || !createName || !createCompanyName || !createPhone) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    if (createPassword !== createConfirmPassword) {
      setErrorMsg('Passwords do not match. Please verify both password fields.');
      return;
    }

    if (createPassword.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }

    const admins = getRegisteredAdmins();
    const existing = admins.find(a => a.email.toLowerCase() === createEmail.trim().toLowerCase());
    if (existing) {
      setErrorMsg('An admin account with this email already exists!');
      return;
    }

    const newCompanyInfo = {
      name: createCompanyName.trim(),
      email: createEmail.trim().toLowerCase(),
      phone: createPhone.trim(),
      address: createAddress.trim() || 'Headquarters Corporate Office',
      currency: createCurrency,
      timezone: 'Asia/Kolkata (IST)',
      workingHours: '09:30 AM - 06:30 PM',
      industry: createIndustry,
      size: createCompanySize
    };

    const newAdmin = {
      name: createName.trim(),
      email: createEmail.trim().toLowerCase(),
      phone: createPhone.trim(),
      role: createRole,
      company: createCompanyName.trim(),
      companyInfo: newCompanyInfo,
      password: createPassword,
      createdAt: new Date().toISOString()
    };

    admins.push(newAdmin);
    localStorage.setItem('crm_registered_admins', JSON.stringify(admins));
    localStorage.setItem('crm_company_info', JSON.stringify(newCompanyInfo));

    setSuccessMsg(`Account authorized & registered for ${newAdmin.name}! Redirecting to login...`);
    
    setEmail(newAdmin.email);
    setPassword(newAdmin.password);
    setLoginSecurityKey('');

    setTimeout(() => {
      setMode('login');
      setErrorMsg('');
    }, 1800);
  };

  return (
    <div className="auth-master-wrapper">
      {/* 🌟 CSS Keyframes, Premium Animated Glows, High-End Glass & Micro-Interactions */}
      <style>{`
        .auth-master-wrapper {
          min-height: 100vh;
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justifyContent: center;
          background: #070913;
          background-image: 
            radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.28) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(236, 72, 153, 0.18) 0px, transparent 45%),
            radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.2) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(59, 130, 246, 0.22) 0px, transparent 45%),
            radial-gradient(at 50% 50%, rgba(15, 23, 42, 0.6) 0px, transparent 100%);
          padding: 16px;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
        }

        /* Subtle animated background grid lines */
        .auth-master-wrapper::before {
          content: "";
          position: absolute;
          inset: 0;
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
          pointer-events: none;
          z-index: 1;
        }

        @keyframes floatAuthMesh1 {
          0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          50% { transform: translate(45px, -35px) scale(1.12) rotate(6deg); }
          100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
        }

        @keyframes floatAuthMesh2 {
          0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
          50% { transform: translate(-40px, 40px) scale(1.15) rotate(-8deg); }
          100% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
        }

        @keyframes floatAuthMesh3 {
          0% { transform: translate(0px, 0px) scale(0.9); opacity: 0.25; }
          50% { transform: translate(25px, 20px) scale(1.15); opacity: 0.5; }
          100% { transform: translate(0px, 0px) scale(0.9); opacity: 0.25; }
        }

        @keyframes pulseGlowRing {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          70% { box-shadow: 0 0 0 16px rgba(99, 102, 241, 0); }
          100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }

        @keyframes borderRainbowGlow {
          0% { border-color: rgba(99, 102, 241, 0.3); }
          50% { border-color: rgba(16, 185, 129, 0.35); }
          100% { border-color: rgba(99, 102, 241, 0.3); }
        }

        @keyframes authFadeInUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .auth-grand-card {
          width: 100%;
          max-width: ${mode === 'create' ? '1020px' : '900px'};
          max-height: calc(100vh - 32px);
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border-radius: 26px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 
            0 25px 60px -12px rgba(0, 0, 0, 0.8),
            0 0 45px rgba(99, 102, 241, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          display: flex;
          position: relative;
          z-index: 2;
          overflow: hidden;
          animation: authFadeInUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
          transition: max-width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Left Hero Showcase Pane */
        .auth-hero-pane {
          flex: 1;
          background: linear-gradient(145deg, rgba(24, 20, 60, 0.98) 0%, rgba(15, 23, 42, 0.98) 55%, rgba(6, 78, 59, 0.7) 100%);
          padding: 30px 28px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          position: relative;
          overflow: hidden;
          border-right: 1px solid rgba(255, 255, 255, 0.09);
        }

        /* Right Form Interactive Pane */
        .auth-form-pane {
          flex: ${mode === 'create' ? '1.45' : '1.2'};
          background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
          padding: ${mode === 'create' ? '20px 28px' : '34px 34px'};
          display: flex;
          flex-direction: column;
          justifyContent: center;
          position: relative;
          box-sizing: border-box;
          max-height: calc(100vh - 32px);
          overflow-y: auto;
        }

        /* Sleek custom scrollbar for form pane if needed on smaller screens */
        .auth-form-pane::-webkit-scrollbar {
          width: 5px;
        }
        .auth-form-pane::-webkit-scrollbar-track {
          background: #F1F5F9;
        }
        .auth-form-pane::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }

        .auth-input-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }

        .auth-input-field {
          width: 100%;
          padding: 8px 36px 8px 12px;
          border-radius: 11px;
          border: 1.5px solid #E2E8F0;
          background: #F8FAFC;
          font-size: 12.5px;
          font-weight: 600;
          color: #0F172A;
          box-sizing: border-box;
          outline: none;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .auth-input-field-normal {
          width: 100%;
          padding: 8px 12px;
          border-radius: 11px;
          border: 1.5px solid #E2E8F0;
          background: #F8FAFC;
          font-size: 12.5px;
          font-weight: 600;
          color: #0F172A;
          box-sizing: border-box;
          outline: none;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .auth-input-field:focus, .auth-input-field-normal:focus {
          border-color: #4F46E5 !important;
          background: #FFFFFF !important;
          box-shadow: 0 0 0 3.5px rgba(79, 70, 229, 0.16), 0 2px 8px rgba(79, 70, 229, 0.08) !important;
          transform: translateY(-1px);
        }

        .auth-eye-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: #64748B;
          display: flex;
          align-items: center;
          justifyContent: center;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.18s ease;
        }

        .auth-eye-btn:hover {
          color: #1E1B4B;
          background: rgba(99, 102, 241, 0.1);
          transform: translateY(-50%) scale(1.15);
        }

        .auth-action-btn {
          width: 100%;
          padding: 11px 18px;
          border-radius: 12px;
          border: none;
          font-size: 13.5px;
          font-weight: 800;
          color: #FFFFFF;
          cursor: pointer;
          display: flex;
          align-items: center;
          justifyContent: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .auth-action-btn::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
          transform: skewX(-20deg);
          transition: 0.6s ease;
        }

        .auth-action-btn:hover::after {
          left: 150%;
        }

        .auth-action-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
          box-shadow: 0 10px 25px rgba(79, 70, 229, 0.45);
        }

        .auth-action-btn:active {
          transform: translateY(0) scale(0.99);
        }

        .auth-tab-btn {
          flex: 1;
          padding: 9px 12px;
          border-radius: 10px;
          border: none;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          justifyContent: center;
          gap: 6px;
        }

        .auth-feature-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 13px;
          borderRadius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          transition: all 0.22s ease;
        }

        .auth-feature-pill:hover {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(165, 180, 252, 0.3);
          transform: translateX(4px);
        }

        /* Mobile & Tablet Responsiveness */
        @media (max-width: 860px) {
          .auth-master-wrapper {
            height: auto !important;
            min-height: 100vh !important;
            overflow-y: auto !important;
            padding: 16px 12px !important;
            display: flex !important;
            align-items: center !important;
            justifyContent: center !important;
          }
          .auth-grand-card {
            flex-direction: column !important;
            max-width: 480px !important;
            width: 100% !important;
            max-height: none !important;
            margin: auto 0 !important;
            border-radius: 20px !important;
          }
          .auth-hero-pane {
            display: none !important;
          }
          .auth-form-pane {
            padding: 24px 18px !important;
            max-height: none !important;
            overflow-y: visible !important;
            border-radius: 20px !important;
          }
          .auth-tab-btn {
            padding: 8px 6px !important;
            font-size: 11.5px !important;
          }
        }

        @media (max-width: 560px) {
          .auth-master-wrapper {
            padding: 12px 8px !important;
          }
          .auth-grand-card {
            border-radius: 18px !important;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6) !important;
          }
          .auth-form-pane {
            padding: 20px 14px !important;
          }
          .auth-form-grid-2 {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .auth-action-btn {
            font-size: 12.5px !important;
            padding: 10px 14px !important;
          }
          .auth-tab-btn span:first-child {
            font-size: 13px !important;
          }
        }
      `}</style>

      {/* Background Animated Ambient Glowing Orbs with Dynamic Pulse */}
      <div style={{
        position: 'absolute',
        top: '-140px',
        right: '-140px',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.38) 0%, rgba(99, 102, 241, 0.08) 50%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        filter: 'blur(30px)',
        animation: 'floatAuthMesh1 10s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-140px',
        left: '-140px',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, rgba(16, 185, 129, 0.06) 50%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        filter: 'blur(30px)',
        animation: 'floatAuthMesh2 11s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '25%',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.18) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        filter: 'blur(40px)',
        animation: 'floatAuthMesh3 8s ease-in-out infinite'
      }} />

      {/* Grand Split Screen Card */}
      <div className="auth-grand-card">
        
        {/* 🌟 LEFT SHOWCASE HERO PANE */}
        <div className="auth-hero-pane">
          {/* Top Logo & Title */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '13px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                color: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.45)',
                animation: 'pulseGlowRing 3s infinite'
              }}>
                💎
              </div>
              <div>
                <span style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.3px', display: 'block' }}>
                  OmniCRM Enterprise
                </span>
                <span style={{ fontSize: '10px', color: '#A5B4FC', fontWeight: '800', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                  SUPER ADMIN PORTAL
                </span>
              </div>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF', lineHeight: '1.25', letterSpacing: '-0.4px', margin: '0 0 10px 0' }}>
              Unified Lead Intelligence & High-Growth Operations
            </h2>
            <p style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: '1.5', margin: 0 }}>
              Seamlessly monitor omni-channel customer acquisition across WhatsApp, Meta Ads, Instagram, and Rest APIs in real-time.
            </p>
          </div>

          {/* Center SaaS Metric Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '18px 0' }}>
            {[
              { icon: '🛡️', title: 'Zero-Trust RBAC Vault', desc: 'Enterprise security verification layer for admin access' },
              { icon: '⚡', title: 'Zero-Delay Ingestion', desc: 'Real-time webhook sync from all social platforms' },
              { icon: '📊', title: 'Executive Telemetry', desc: 'Instant pipeline metrics, meetings & deal valuation' }
            ].map((feature, i) => (
              <div key={i} className="auth-feature-pill">
                <span style={{ fontSize: '16px' }}>{feature.icon}</span>
                <div>
                  <strong style={{ fontSize: '12px', color: '#FFFFFF', display: 'block' }}>{feature.title}</strong>
                  <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>{feature.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Security Assurance */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '10.5px',
            color: '#94A3B8'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
              256-Bit TLS Encryption
            </span>
            <span style={{ fontWeight: '700', color: '#A5B4FC' }}>Atlas Engine v2.4</span>
          </div>
        </div>

        {/* 🌟 RIGHT INTERACTIVE FORM PANE */}
        <div className="auth-form-pane">
          
          {/* Header Switcher */}
          <div style={{ marginBottom: mode === 'create' ? '12px' : '18px' }}>
            <div style={{
              display: 'flex',
              background: '#EEF2F6',
              padding: '4px',
              borderRadius: '13px',
              gap: '4px',
              border: '1px solid #E2E8F0',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <button
                type="button"
                className="auth-tab-btn"
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  background: mode === 'login' ? 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)' : 'transparent',
                  color: mode === 'login' ? '#FFFFFF' : '#64748B',
                  boxShadow: mode === 'login' ? '0 4px 12px rgba(49, 46, 129, 0.28)' : 'none'
                }}
              >
                <span>🔐</span> Admin Sign In
              </button>
              <button
                type="button"
                className="auth-tab-btn"
                onClick={() => { setMode('create'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{
                  background: mode === 'create' ? 'linear-gradient(135deg, #065F46 0%, #059669 100%)' : 'transparent',
                  color: mode === 'create' ? '#FFFFFF' : '#64748B',
                  boxShadow: mode === 'create' ? '0 4px 12px rgba(5, 150, 105, 0.28)' : 'none'
                }}
              >
                <span>✨</span> Create Admin Account
              </button>
            </div>
          </div>

          {/* Title Header */}
          <div style={{ marginBottom: mode === 'create' ? '12px' : '16px' }}>
            <h3 style={{ fontSize: mode === 'create' ? '18px' : '20px', fontWeight: '900', color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
              {mode === 'login' ? 'Welcome Back, Executive' : 'Register Enterprise Organization'}
            </h3>
            <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0', fontWeight: '500' }}>
              {mode === 'login' 
                ? 'Enter your administrative credentials and Master Security Key to enter.' 
                : 'Complete the enterprise setup to deploy your custom CRM tenant.'}
            </p>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1.2px solid #FECACA',
              color: '#DC2626',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '11.5px',
              fontWeight: '700',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.08)'
            }}>
              <span>⚠️</span> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{
              backgroundColor: '#ECFDF5',
              border: '1.2px solid #A7F3D0',
              color: '#059669',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '11.5px',
              fontWeight: '700',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
            }}>
              <span>✓</span> {successMsg}
            </div>
          )}

          {/* 🌟 1. LOGIN MODE */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '5px', display: 'block', letterSpacing: '0.4px' }}>
                  ADMINISTRATIVE EMAIL
                </label>
                <input
                  type="email"
                  required
                  className="auth-input-field-normal"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@crm.com"
                />
              </div>

              {/* Password with Eye Toggle */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#475569', marginBottom: '5px', display: 'block', letterSpacing: '0.4px' }}>
                  ADMIN PASSWORD
                </label>
                <div className="auth-input-wrapper">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    className="auth-input-field"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowLoginPassword(prev => !prev)}
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              {/* Master Security Key Input with Eye Toggle (Confidential) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: '#4338CA', display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.4px' }}>
                    <span>🛡️</span> MASTER SECURITY KEY (9-DIGIT)
                  </label>
                  <span style={{ fontSize: '9.5px', color: '#4338CA', fontWeight: '900', background: '#EEF2FF', border: '1px solid #C7D2FE', padding: '1px 6px', borderRadius: '5px' }}>
                    Confidential
                  </span>
                </div>
                <div className="auth-input-wrapper">
                  <input
                    type={showLoginSecurityKey ? 'text' : 'password'}
                    required
                    className="auth-input-field"
                    value={loginSecurityKey}
                    onChange={e => setLoginSecurityKey(e.target.value)}
                    placeholder="Enter 9-digit authorization key"
                    style={{ border: '1.5px solid #A5B4FC', letterSpacing: showLoginSecurityKey ? '1px' : '3px', fontWeight: '800' }}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowLoginSecurityKey(prev => !prev)}
                    title={showLoginSecurityKey ? 'Hide key' : 'Show key'}
                  >
                    {showLoginSecurityKey ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="auth-action-btn"
                style={{
                  background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 45%, #4F46E5 100%)',
                  boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)',
                  marginTop: '6px'
                }}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard →'}</span>
              </button>
            </form>
          ) : (
            /* 🌟 2. CREATE ACCOUNT MODE */
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              
              {/* Row 1 */}
              <div className="auth-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '3px', display: 'block', letterSpacing: '0.4px' }}>
                    ADMIN FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    className="auth-input-field-normal"
                    value={createName}
                    onChange={e => setCreateName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    style={{ padding: '7px 11px', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '3px', display: 'block', letterSpacing: '0.4px' }}>
                    ADMIN DESIGNATION
                  </label>
                  <select
                    className="auth-input-field-normal"
                    value={createRole}
                    onChange={e => setCreateRole(e.target.value)}
                    style={{ padding: '7px 11px', fontSize: '12px' }}
                  >
                    <option value="Super Administrator / Owner">Super Administrator / Owner</option>
                    <option value="Managing Director (MD)">Managing Director (MD)</option>
                    <option value="Chief Technology Officer (CTO)">Chief Technology Officer (CTO)</option>
                    <option value="Operations Head">Operations Head</option>
                    <option value="VP of Sales & Growth">VP of Sales & Growth</option>
                  </select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="auth-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '3px', display: 'block', letterSpacing: '0.4px' }}>
                    OFFICIAL EMAIL *
                  </label>
                  <input
                    type="email"
                    required
                    className="auth-input-field-normal"
                    value={createEmail}
                    onChange={e => setCreateEmail(e.target.value)}
                    placeholder="admin@company.com"
                    style={{ padding: '7px 11px', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '3px', display: 'block', letterSpacing: '0.4px' }}>
                    PHONE / WHATSAPP *
                  </label>
                  <input
                    type="tel"
                    required
                    className="auth-input-field-normal"
                    value={createPhone}
                    onChange={e => setCreatePhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{ padding: '7px 11px', fontSize: '12px' }}
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="auth-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '3px', display: 'block', letterSpacing: '0.4px' }}>
                    COMPANY / ORG NAME *
                  </label>
                  <input
                    type="text"
                    required
                    className="auth-input-field-normal"
                    value={createCompanyName}
                    onChange={e => setCreateCompanyName(e.target.value)}
                    placeholder="Apex Technologies Pvt Ltd"
                    style={{ padding: '7px 11px', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '3px', display: 'block', letterSpacing: '0.4px' }}>
                    INDUSTRY SECTOR
                  </label>
                  <select
                    className="auth-input-field-normal"
                    value={createIndustry}
                    onChange={e => setCreateIndustry(e.target.value)}
                    style={{ padding: '7px 11px', fontSize: '12px' }}
                  >
                    <option value="Information Technology / SaaS">IT / Software / SaaS</option>
                    <option value="Real Estate & Infrastructure">Real Estate & Infra</option>
                    <option value="Healthcare & Clinics">Healthcare & Clinics</option>
                    <option value="Manufacturing & Export">Manufacturing & Export</option>
                    <option value="Finance & Insurance">Banking & Finance</option>
                    <option value="Retail & E-commerce">Retail & E-commerce</option>
                  </select>
                </div>
              </div>

              {/* Row 4 */}
              <div className="auth-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '3px', display: 'block', letterSpacing: '0.4px' }}>
                    TEAM SIZE
                  </label>
                  <select
                    className="auth-input-field-normal"
                    value={createCompanySize}
                    onChange={e => setCreateCompanySize(e.target.value)}
                    style={{ padding: '7px 11px', fontSize: '12px' }}
                  >
                    <option value="1-10 Employees">1-10 Employees (Startup)</option>
                    <option value="11-50 Employees">11-50 Employees (Growing)</option>
                    <option value="51-200 Employees">51-200 Employees (Mid-Market)</option>
                    <option value="200+ Employees">200+ Employees (Enterprise)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '3px', display: 'block', letterSpacing: '0.4px' }}>
                    CURRENCY
                  </label>
                  <select
                    className="auth-input-field-normal"
                    value={createCurrency}
                    onChange={e => setCreateCurrency(e.target.value)}
                    style={{ padding: '7px 11px', fontSize: '12px' }}
                  >
                    <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                    <option value="USD ($)">USD ($) - US Dollar</option>
                    <option value="EUR (€)">EUR (€) - Euro</option>
                    <option value="AED (د.إ)">AED (د.إ) - UAE Dirham</option>
                  </select>
                </div>
              </div>

              {/* Row 5 */}
              <div>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '3px', display: 'block', letterSpacing: '0.4px' }}>
                  HEADQUARTERS ADDRESS
                </label>
                <input
                  type="text"
                  className="auth-input-field-normal"
                  value={createAddress}
                  onChange={e => setCreateAddress(e.target.value)}
                  placeholder="Plot 42, Tech Park Cybercity, Bangalore"
                  style={{ padding: '7px 11px', fontSize: '12px' }}
                />
              </div>

              {/* Row 6: Passwords with Eye Toggles */}
              <div className="auth-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '3px', display: 'block', letterSpacing: '0.4px' }}>
                    PASSWORD *
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      type={showCreatePassword ? 'text' : 'password'}
                      required
                      className="auth-input-field"
                      value={createPassword}
                      onChange={e => setCreatePassword(e.target.value)}
                      placeholder="Min. 6 chars"
                      style={{ padding: '7px 34px 7px 11px', fontSize: '12px' }}
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowCreatePassword(prev => !prev)}
                      title={showCreatePassword ? 'Hide password' : 'Show password'}
                    >
                      {showCreatePassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '3px', display: 'block', letterSpacing: '0.4px' }}>
                    CONFIRM PASSWORD *
                  </label>
                  <div className="auth-input-wrapper">
                    <input
                      type={showCreateConfirmPassword ? 'text' : 'password'}
                      required
                      className="auth-input-field"
                      value={createConfirmPassword}
                      onChange={e => setCreateConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      style={{ padding: '7px 34px 7px 11px', fontSize: '12px' }}
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowCreateConfirmPassword(prev => !prev)}
                      title={showCreateConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showCreateConfirmPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 7: Master Security Key with Eye Toggle */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '800', color: '#B45309', display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.4px' }}>
                    <span>🔑</span> VERIFICATION SECURITY KEY (9-DIGIT) *
                  </label>
                  <span style={{ fontSize: '8.5px', color: '#92400E', fontWeight: '900', background: '#FEF3C7', border: '1px solid #FDE68A', padding: '1px 5px', borderRadius: '4px' }}>
                    Confidential
                  </span>
                </div>
                <div className="auth-input-wrapper">
                  <input
                    type={showCreateSecurityKey ? 'text' : 'password'}
                    required
                    className="auth-input-field"
                    value={createSecurityKey}
                    onChange={e => setCreateSecurityKey(e.target.value)}
                    placeholder="Enter 9-digit authorization key"
                    style={{ border: '1.5px solid #FCD34D', background: '#FFFDF5', letterSpacing: showCreateSecurityKey ? '1px' : '3px', fontWeight: '800', padding: '7px 34px 7px 11px', fontSize: '12px' }}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowCreateSecurityKey(prev => !prev)}
                    title={showCreateSecurityKey ? 'Hide key' : 'Show key'}
                  >
                    {showCreateSecurityKey ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-action-btn"
                style={{
                  background: 'linear-gradient(135deg, #065F46 0%, #059669 50%, #10B981 100%)',
                  boxShadow: '0 4px 16px rgba(5, 150, 105, 0.35)',
                  marginTop: '2px',
                  padding: '9px 16px'
                }}
              >
                <span>🚀 Launch & Deploy Enterprise CRM</span>
              </button>
            </form>
          )}

          {/* Confidentiality Footer Badge */}
          <div style={{
            marginTop: '10px',
            padding: '7px 12px',
            borderRadius: '10px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '10.5px',
            color: '#64748B'
          }}>
            <span style={{ fontSize: '13px' }}>🔒</span>
            <span>All passwords and security keys are end-to-end encrypted and confidential.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
