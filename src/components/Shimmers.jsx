import React from 'react';

// Shimmer Loader for Dashboard Tab
export function DashboardShimmer() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Banner Shimmer */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        padding: '24px 28px',
        border: '1.5px solid var(--border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div className="shimmer-box" style={{ width: '220px', height: '20px' }} />
          <div className="shimmer-box" style={{ width: '120px', height: '24px', borderRadius: '12px' }} />
        </div>
        <div className="shimmer-box" style={{ width: '180px', height: '38px', marginBottom: '16px' }} />
        <div className="shimmer-box" style={{ width: '100%', height: '12px', borderRadius: '6px', marginBottom: '16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="shimmer-box" style={{ width: '140px', height: '28px', borderRadius: '8px' }} />
          <div className="shimmer-box" style={{ width: '160px', height: '36px', borderRadius: '10px' }} />
        </div>
      </div>

      {/* KPI Cards Shimmer Grid */}
      <div className="kpi-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1.5px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="shimmer-box" style={{ width: '100px', height: '14px' }} />
              <div className="shimmer-box" style={{ width: '50px', height: '14px', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="shimmer-box" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
              <div className="shimmer-box" style={{ width: '80px', height: '26px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Two Big Graphs Shimmer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {[1, 2].map(i => (
          <div key={i} style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '24px',
            border: '1.5px solid var(--border)',
            height: '280px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div className="shimmer-box" style={{ width: '180px', height: '18px', marginBottom: '8px' }} />
              <div className="shimmer-box" style={{ width: '260px', height: '12px' }} />
            </div>
            <div className="shimmer-box" style={{ width: '100%', height: '150px', borderRadius: '10px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Shimmer Loader for Table Views (Leads, Employees, Deals, Approvals, Customers)
export function TableShimmer({ rows = 5, cols = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Title & Button Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="shimmer-box" style={{ width: '200px', height: '24px', marginBottom: '6px' }} />
          <div className="shimmer-box" style={{ width: '280px', height: '14px' }} />
        </div>
        <div className="shimmer-box" style={{ width: '130px', height: '36px', borderRadius: '9px' }} />
      </div>

      {/* Filter / Search Bar Shimmer */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '12px 16px',
        border: '1.5px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shimmer-box" style={{ width: '70px', height: '26px', borderRadius: '6px' }} />
          ))}
        </div>
        <div className="shimmer-box" style={{ width: '220px', height: '30px', borderRadius: '6px' }} />
      </div>

      {/* Table Shimmer Rows */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1.5px solid var(--border)',
        padding: '16px'
      }}>
        {/* Table Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid var(--border)', paddingBottom: '12px', marginBottom: '14px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="shimmer-box" style={{ width: '100px', height: '14px' }} />
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 0',
            borderBottom: r !== rows - 1 ? '1px solid #F1F5F9' : 'none'
          }}>
            <div className="shimmer-box" style={{ width: '70px', height: '16px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="shimmer-box" style={{ width: '130px', height: '14px' }} />
              <div className="shimmer-box" style={{ width: '90px', height: '10px' }} />
            </div>
            <div className="shimmer-box" style={{ width: '90px', height: '14px' }} />
            <div className="shimmer-box" style={{ width: '80px', height: '22px', borderRadius: '6px' }} />
            <div className="shimmer-box" style={{ width: '60px', height: '26px', borderRadius: '6px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Shimmer Loader for Live Chat Console
export function ChatShimmer() {
  return (
    <div className="support-split" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Left Chat List */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        padding: '20px',
        border: '1.5px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div className="shimmer-box" style={{ width: '140px', height: '20px', marginBottom: '8px' }} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid #F1F5F9',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="shimmer-box" style={{ width: '100px', height: '14px' }} />
              <div className="shimmer-box" style={{ width: '40px', height: '10px' }} />
            </div>
            <div className="shimmer-box" style={{ width: '180px', height: '12px' }} />
          </div>
        ))}
      </div>

      {/* Right Chat Screen */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        padding: '24px',
        border: '1.5px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1.5px solid var(--border)', paddingBottom: '14px' }}>
          <div className="shimmer-box" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <div>
            <div className="shimmer-box" style={{ width: '140px', height: '16px', marginBottom: '6px' }} />
            <div className="shimmer-box" style={{ width: '100px', height: '12px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
          <div className="shimmer-box" style={{ width: '55%', height: '45px', borderRadius: '12px', alignSelf: 'flex-start' }} />
          <div className="shimmer-box" style={{ width: '50%', height: '40px', borderRadius: '12px', alignSelf: 'flex-end' }} />
          <div className="shimmer-box" style={{ width: '60%', height: '45px', borderRadius: '12px', alignSelf: 'flex-start' }} />
        </div>

        <div className="shimmer-box" style={{ width: '100%', height: '48px', borderRadius: '12px' }} />
      </div>
    </div>
  );
}
