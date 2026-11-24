import React, { useState } from 'react';

export default function Login({ onLogin, loading }) {
  const [email, setEmail] = useState('admin@crm.com');
  const [password, setPassword] = useState('Admin@123');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '36px 40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        border: '1.5px solid #818CF8'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            backgroundColor: '#1E1B4B',
            color: '#F5E4C3',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            marginBottom: '12px',
            boxShadow: '0 4px 12px rgba(30,27,75,0.25)'
          }}>
            💎
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-navy)', letterSpacing: '-0.3px' }}>
            OmniCRM Admin Portal
          </h1>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            CRM Operations & Management Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '5px', display: 'block' }}>
              ADMINISTRATIVE EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@crm.com"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '13.5px'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '5px', display: 'block' }}>
              MASTER PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '13.5px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '800',
              padding: '12px',
              borderRadius: '12px',
              marginTop: '8px',
              boxShadow: '0 4px 14px rgba(67,56,202,0.3)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard →'}
          </button>
        </form>

        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1.5px solid #FDE68A',
          borderRadius: '12px',
          padding: '12px',
          marginTop: '20px',
          fontSize: '11.5px'
        }}>
          <strong style={{ color: '#B45309', display: 'block', marginBottom: '2px' }}>QUICK ACCESS CREDENTIALS:</strong>
          <span style={{ color: '#78350F' }}>Email: <strong>admin@crm.com</strong> | Password: <strong>Admin@123</strong></span>
        </div>
      </div>
    </div>
  );
}
