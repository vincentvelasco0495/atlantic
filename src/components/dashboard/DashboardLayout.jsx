import { useState } from 'react';
import {
  ArrowBack,
  LogoutOutlined,
  Menu as MenuIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material';
import { logout as logoutRequest } from '../../config/api';
import { useAuthStore } from '../../store/authStore';
import DashboardSidebar from './DashboardSidebar';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A';
}

export default function DashboardLayout({ activeSection, title, description, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch {
      // Clear local session even if the API call fails.
    } finally {
      clearAuth();
      window.location.href = '/';
    }
  };

  return (
    <Box className="dashboard-layout">
      <Box className="dashboard-layout-shell">
        <DashboardSidebar activeSection={activeSection} />

        <Box className="dashboard-main">
          <Box className="dashboard-topbar">
            <Box className="dashboard-topbar-left">
              <IconButton
                className="dashboard-menu-trigger"
                aria-label="Open dashboard menu"
                onClick={() => setMobileOpen(true)}
              >
                <MenuIcon />
              </IconButton>
              <Button href="/" className="dashboard-back-link" startIcon={<ArrowBack />}>
                Public site
              </Button>
            </Box>

            <Box className="dashboard-topbar-user">
              <Avatar className="dashboard-user-avatar">{getInitials(user?.name)}</Avatar>
              <Box className="dashboard-user-copy">
                <Typography className="dashboard-user-name">{user?.name || 'Admin'}</Typography>
                <Typography className="dashboard-user-email">{user?.email}</Typography>
              </Box>
              <IconButton className="dashboard-logout-btn" aria-label="Logout" onClick={handleLogout}>
                <LogoutOutlined />
              </IconButton>
            </Box>
          </Box>

          <Box className="dashboard-main-body">
            <Box className="dashboard-page-header">
              <Typography component="h1" className="dashboard-main-title">{title}</Typography>
              {description && (
                <Typography className="dashboard-main-description">{description}</Typography>
              )}
            </Box>

            <Box className="dashboard-main-content">
              {children}
            </Box>
          </Box>
        </Box>
      </Box>

      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ className: 'dashboard-drawer-paper' }}>
        <DashboardSidebar
          activeSection={activeSection}
          mobile
          onNavigate={() => setMobileOpen(false)}
        />
      </Drawer>
    </Box>
  );
}
