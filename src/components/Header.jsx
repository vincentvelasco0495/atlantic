import { useEffect, useState } from 'react';
import {
  Close,
  ExpandMore,
  Menu as MenuIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { logout as logoutRequest } from '../config/api';
import { useAuthStore } from '../store/authStore';
import { navItems } from '../data';
import logo from '../assets/images/logo/logo.png';

function Brand({ onClick }) {
  return (
    <Box component="a" href="/" className="brand" onClick={onClick}>
      <span className="brand-mark"><img src={logo} alt="" /></span>
      <Typography component="span" className="brand-name">Atlantic Seaman's Dormitory</Typography>
    </Box>
  );
}

function getActiveNavigationLabel(path) {
  if (path === '/') return 'Home';
  if (path === '/about') return 'Amenities';
  if (path === '/rooms' || path === '/room') return 'Rooms & Rates';
  if (path === '/gallery') return 'Gallery';
  if (path === '/faq' || path === '/faq2') return 'FAQ';
  if (path === '/contacts' || path === '/contacts2') return 'Contacts';
  return null;
}

function Navigation({ mobile = false, onNavigate }) {
  const [expanded, setExpanded] = useState(null);
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const activeLabel = getActiveNavigationLabel(path);
  const submenuItems = {
    'Rooms & Rates': [{ label: 'All Rooms', href: '/rooms' }, { label: 'Bedspace', href: '/rooms' }, { label: 'Solo Room', href: '/rooms' }, { label: 'Couple Room', href: '/rooms' }],
    Amenities: [{ label: 'About Us', href: '/about' }, { label: 'Branches', href: '/branches' }],
    FAQ: [{ label: 'FAQ V1', href: '/faq' }, { label: 'FAQ V2', href: '/faq2' }],
  };

  return (
    <Stack component="nav" className={mobile ? 'mobile-navigation' : 'desktop-navigation'}>
      {navItems.map((item) => {
        const submenu = submenuItems[item.label];
        return (
          <Box className={`nav-item ${expanded === item.label ? 'is-expanded' : ''} ${activeLabel === item.label ? 'is-active' : ''}`} key={item.label}>
            <Box
              component="a"
              href={item.href}
              onClick={(event) => {
                if (item.noNavigation) {
                  event.preventDefault();
                  if (mobile) setExpanded(expanded === item.label ? null : item.label);
                } else if (mobile && item.dropdown) {
                  event.preventDefault();
                  setExpanded(expanded === item.label ? null : item.label);
                } else {
                  onNavigate?.();
                }
              }}
              className="nav-link"
            >
              {item.label}
              {item.dropdown && <ExpandMore className="nav-chevron" />}
            </Box>
            {item.dropdown && submenu && (
              <Box className="nav-submenu">
                {submenu.map(({ label, href, external, upcoming }) => <Box component="a" className={upcoming ? 'is-upcoming' : undefined} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} onClick={onNavigate} key={label}>{label}</Box>)}
              </Box>
            )}
          </Box>
        );
      })}
    </Stack>
  );
}

function UserAccountMenu({ user, isAdmin, isCustomer, onLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const displayName = user?.name || user?.email || 'Account';

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigate = (href) => {
    handleClose();
    window.location.href = href;
  };

  const handleLogoutClick = async () => {
    handleClose();
    await onLogout();
  };

  return (
    <Box className="header-user-menu">
      <Button
        type="button"
        className="header-user-trigger"
        onClick={handleOpen}
        aria-controls={open ? 'header-user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        endIcon={<ExpandMore className={`header-user-chevron ${open ? 'is-open' : ''}`} />}
      >
        <Typography component="span" className="header-user-name">
          {displayName}
        </Typography>
      </Button>
      <Menu
        id="header-user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        className="header-user-menu-panel"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{ className: 'header-user-menu-list' }}
      >
        {isAdmin && (
          <MenuItem onClick={() => navigate('/dashboard')}>Dashboard</MenuItem>
        )}
        {isCustomer && (
          <MenuItem onClick={() => navigate('/account')}>My Account</MenuItem>
        )}
        {isCustomer && (
          <MenuItem onClick={() => navigate('/reserve')}>Reserve</MenuItem>
        )}
        <MenuItem onClick={handleLogoutClick} className="header-user-menu-logout">
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const isAuthenticated = Boolean(token);
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const isCustomer = useAuthStore((state) => state.isCustomer());

  const close = () => setOpen(false);

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch {
      // Clear local session even if the API call fails.
    } finally {
      clearAuth();
      close();
      window.location.href = '/';
    }
  };

  const authActions = isAuthenticated ? (
    <UserAccountMenu
      user={user}
      isAdmin={isAdmin}
      isCustomer={isCustomer}
      onLogout={handleLogout}
    />
  ) : (
    <>
      <Button href="/register" className="header-register-btn">Register</Button>
      <Button href="/login" className="header-reserve-btn">Login</Button>
    </>
  );

  const mobileAuthActions = isAuthenticated ? (
    <>
      <Typography component="p" className="header-user-name mobile-header-user">
        Signed in as {user?.name || user?.email}
      </Typography>
      {isAdmin && (
        <Button href="/dashboard" className="header-reserve-btn mobile-drawer-contact" onClick={close}>
          Dashboard
        </Button>
      )}
      {isCustomer && (
        <Button href="/account" className="header-register-btn" onClick={close}>My Account</Button>
      )}
      {isCustomer && (
        <Button href="/reserve" className="header-reserve-btn mobile-drawer-contact" onClick={close}>
          Reserve
        </Button>
      )}
      <Button type="button" className="header-register-btn" onClick={handleLogout}>
        Logout
      </Button>
    </>
  ) : (
    <>
      <Button href="/register" className="header-register-btn" onClick={close}>Register</Button>
      <Button href="/login" className="header-reserve-btn mobile-drawer-contact" onClick={close}>Login</Button>
    </>
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`} id="top">
        <Box className="site-container header-inner">
          <Brand onClick={close} />
          <Navigation />
          <Stack direction="row" spacing={1.5} className="header-actions">
            {authActions}
          </Stack>
          <IconButton
            className="menu-trigger"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </header>
      <Drawer anchor="right" open={open} onClose={close}>
        <Box className="mobile-drawer">
          <Box className="mobile-drawer-top">
            <Brand onClick={close} />
            <IconButton onClick={close} aria-label="Close navigation">
              <Close />
            </IconButton>
          </Box>
          <Navigation mobile onNavigate={close} />
          <Stack spacing={1.5} className="mobile-drawer-actions">
            {mobileAuthActions}
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
