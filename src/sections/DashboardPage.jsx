import { useEffect, useState } from 'react';
import {
  AdminPanelSettingsOutlined,
  EmailOutlined,
  LocationOnOutlined,
  PersonOutline,
} from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import ResourceCrudPanel from '../components/dashboard/ResourceCrudPanel';
import ReservationsPanel from '../components/dashboard/ReservationsPanel';
import { dashboardSections, getDashboardSection } from '../components/dashboard/DashboardSidebar';
import { useAuthStore } from '../store/authStore';

function SettingsPanel({ user }) {
  const cards = [
    { icon: PersonOutline, label: 'Full name', value: user?.name || '—' },
    { icon: EmailOutlined, label: 'Email address', value: user?.email || '—' },
    { icon: AdminPanelSettingsOutlined, label: 'Role', value: 'Administrator' },
    { icon: LocationOnOutlined, label: 'Assigned branch', value: user?.location?.name || 'Not assigned' },
  ];

  return (
    <Box className="dashboard-settings-grid">
      {cards.map(({ icon: Icon, label, value }) => (
        <Box className="dashboard-stat-card" key={label}>
          <span className="dashboard-stat-icon"><Icon /></span>
          <Typography className="dashboard-stat-label">{label}</Typography>
          <Typography className="dashboard-stat-value">{value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function DashboardSectionContent({ section, user }) {
  if (section === 'dashboard') {
    return <DashboardOverview />;
  }

  if (section === 'settings') {
    return <SettingsPanel user={user} />;
  }

  if (section === 'reservations') {
    return <ReservationsPanel />;
  }

  if (['branches', 'rates', 'rooms', 'beds', 'customers'].includes(section)) {
    return <ResourceCrudPanel section={section} />;
  }

  return null;
}

export default function DashboardPage({ path = '/dashboard' }) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const section = getDashboardSection(path);
  const meta = dashboardSections[section] || dashboardSections.dashboard;

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    if (!isAdmin) {
      window.location.href = '/';
    }
  }, [token, isAdmin]);

  if (!token || !isAdmin) {
    return null;
  }

  return (
    <DashboardLayout
      activeSection={section}
      title={meta.title}
      description={meta.description}
    >
      <DashboardSectionContent section={section} user={user} />
    </DashboardLayout>
  );
}
