import {
  BedOutlined,
  DashboardOutlined,
  EventAvailableOutlined,
  LocationOnOutlined,
  MeetingRoomOutlined,
  PaymentsOutlined,
  PeopleOutlined,
  SettingsOutlined,
} from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import logo from '../../assets/images/logo/logo.png';
import { getAdminSection } from '../../utils/routes';

const managementItems = [
  { id: 'branches', label: 'Branches', href: '/branches', icon: LocationOnOutlined },
  { id: 'rates', label: 'Rates', href: '/rates', icon: PaymentsOutlined },
  { id: 'rooms', label: 'Rooms', href: '/rooms', icon: MeetingRoomOutlined },
  { id: 'beds', label: 'Beds', href: '/beds', icon: BedOutlined },
];

export default function DashboardSidebar({ activeSection, mobile = false, onNavigate }) {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const dashboardActive = activeSection === 'dashboard' || path === '/dashboard';
  const settingsActive = activeSection === 'settings' || path === '/settings';
  const customersActive = activeSection === 'customers' || path === '/customers';
  const reservationsActive = activeSection === 'reservations' || path === '/reservations';

  return (
    <Box component="aside" className={mobile ? 'dashboard-sidebar is-mobile' : 'dashboard-sidebar'}>
      <Box className="dashboard-sidebar-brand">
        <Box className="dashboard-sidebar-logo">
          <img src={logo} alt="" />
        </Box>
        <Box>
          <Typography className="dashboard-sidebar-brand-title">Atlantic Admin</Typography>
          <Typography className="dashboard-sidebar-brand-sub">Operations panel</Typography>
        </Box>
      </Box>

      <Box className="dashboard-sidebar-section">
        <Typography className="dashboard-sidebar-label">General</Typography>
        <Box
          component="a"
          href="/dashboard"
          className={`dashboard-sidebar-link ${dashboardActive ? 'is-active' : ''}`}
          onClick={onNavigate}
        >
          <span className="dashboard-sidebar-icon"><DashboardOutlined /></span>
          <span>Dashboard</span>
        </Box>
        <Box
          component="a"
          href="/settings"
          className={`dashboard-sidebar-link ${settingsActive ? 'is-active' : ''}`}
          onClick={onNavigate}
        >
          <span className="dashboard-sidebar-icon"><SettingsOutlined /></span>
          <span>Settings</span>
        </Box>
        <Box
          component="a"
          href="/customers"
          className={`dashboard-sidebar-link ${customersActive ? 'is-active' : ''}`}
          onClick={onNavigate}
        >
          <span className="dashboard-sidebar-icon"><PeopleOutlined /></span>
          <span>Customers</span>
        </Box>
        <Box
          component="a"
          href="/reservations"
          className={`dashboard-sidebar-link ${reservationsActive ? 'is-active' : ''}`}
          onClick={onNavigate}
        >
          <span className="dashboard-sidebar-icon"><EventAvailableOutlined /></span>
          <span>Reservations</span>
        </Box>
      </Box>

      <Box className="dashboard-sidebar-section">
        <Typography className="dashboard-sidebar-label">Management</Typography>
        {managementItems.map(({ id, label, href, icon: Icon }) => (
          <Box
            component="a"
            href={href}
            className={`dashboard-sidebar-link ${activeSection === id ? 'is-active' : ''}`}
            key={id}
            onClick={onNavigate}
          >
            <span className="dashboard-sidebar-icon"><Icon /></span>
            <span>{label}</span>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function getDashboardSection(path) {
  return getAdminSection(path);
}

export const dashboardSections = {
  dashboard: {
    title: 'Dashboard',
    description: 'Branch stats, earnings, and active transactions for your assigned branch.',
  },
  settings: {
    title: 'Settings',
    description: 'Manage your admin account and dashboard preferences.',
  },
  customers: {
    title: 'Customers',
    description: 'View and manage registered seafarer customer profiles.',
  },
  reservations: {
    title: 'Reservations',
    description: 'Review customer reservation requests and approve or reject them.',
  },
  branches: {
    title: 'Branches',
    description: 'View and manage dormitory branch locations.',
  },
  rates: {
    title: 'Rates',
    description: 'Configure pricing and rate plans.',
  },
  rooms: {
    title: 'Rooms',
    description: 'Manage room inventory across branches.',
  },
  beds: {
    title: 'Beds',
    description: 'Manage bed assignments and availability.',
  },
};
