import { useEffect, useState } from 'react';
import {
  Close,
  ExpandMore,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { Box, Button, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { branches, navItems } from '../data';
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
  if (path === '/about') return 'About';
  if (path === '/rooms' || path === '/room') return 'Rooms';
  if (path === '/branches' || path.startsWith('/branch/')) return 'Branches';
  if (path === '/architecture') return 'Other Offers';
  if (path === '/contacts' || path === '/contacts2') return 'Contacts';
  return null;
}

function Navigation({ mobile = false, onNavigate }) {
  const [expanded, setExpanded] = useState(null);
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const activeLabel = getActiveNavigationLabel(path);
  const submenuItems = {
    News: [{ label: 'News', href: '/news' }, { label: 'Single post', href: '/post' }],
    Branches: branches.map(({ name, id, upcoming }) => ({ label: name, href: `/branch/${id}`, upcoming })),
    'Other Offers': [{ label: 'Architecture', href: 'https://zm-design-sigma.vercel.app/', external: true }],
    Pages: [{ label: 'Gallery', href: '/gallery' }, { label: 'FAQ V1', href: '/faq' }, { label: 'FAQ V2', href: '/faq2' }, { label: 'Error Page', href: '/error' }],
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

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const close = () => setOpen(false);

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
          {/* <Button href="/contacts" className="header-contact">Contact us</Button> */}
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
          <Button href="/contacts" className="header-contact mobile-drawer-contact" onClick={close}>Contact us</Button>
        </Box>
      </Drawer>
    </>
  );
}
