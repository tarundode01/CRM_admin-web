# OmniCRM Enterprise - Super Admin Web Application

Full-featured React web portal matching the Super Admin Android application with 100% component-based architecture and direct unified backend connectivity.

## Backend Connectivity
- Connects directly to existing backend endpoints:
  - `https://reposetry5.vercel.app/api/admin` (Cloud priority)
  - `http://localhost:5000/api/admin` (Local fallback)
- Real-time polling enabled for Support desk (live customer messages & tickets every 4 seconds).

## Project Structure
```
Admin-web/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── services/
    │   └── api.js                  # Dynamic API client with URL failover
    └── components/
        ├── Header.jsx              # Executive Champagne Gold Top Bar
        ├── Sidebar.jsx             # Left Navigation Console with badge counters
        ├── DashboardTab.jsx        # Annual Sales Target, Progress, and KPI Cards
        ├── EmployeesTab.jsx        # Workforce management & Onboard Employee
        ├── LeadsTab.jsx            # Lead capture, search, filtering & Specialist assignment
        ├── DealsTab.jsx            # Sales pipeline & Commercial volume tracking
        ├── ApprovalsTab.jsx        # Compliance, KYC, and account verification approvals
        ├── CustomersTab.jsx        # Client directory, GSTIN records & access toggles
        ├── SupportTab.jsx          # Real-time Split Live Chat & Support Ticket desk
        ├── Modals.jsx              # Reusable modal overlays (Employee, Lead, Assign, Analysis)
        └── Login.jsx               # Executive Sign-in portal with quick demo credentials
```

## Running the Web Portal
```bash
cd Admin-web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in any browser.
