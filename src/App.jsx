import { ThemeProvider } from '@mui/material/styles';
import Header from './components/Header';
import ArchitecturePage from './sections/ArchitecturePage';
import HomeSections from './sections/HomeSections';
import DashboardPage from './sections/DashboardPage';
import LoginPage from './sections/LoginPage';
import RegisterPage from './sections/RegisterPage';
import ReservePage from './sections/ReservePage';
import AccountPage from './sections/AccountPage';
import { RoutePage } from './sections/InnerPages';
import { useAuthStore } from './store/authStore';
import { theme } from './theme';
import { isAdminPanelPath } from './utils/routes';

export default function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';

  if (path === '/transactions') {
    window.location.replace('/dashboard#dashboard-transactions');
    return null;
  }

  const isAdmin = useAuthStore((state) => state.isAdmin());
  const innerPaths = ['/about', '/rooms', '/gallery', '/faq', '/faq2', '/room', '/news', '/post', '/branches', '/contacts', '/contacts2', '/register', '/login', '/reserve', '/account', '/error', '/404', '/architecture'];
  const isBranchPath = /^\/branch\/[^/]+$/.test(path);
  const showAdminPanel = isAdminPanelPath(path, isAdmin);

  return (
    <ThemeProvider theme={theme}>
      {!showAdminPanel && <Header />}
      {path === '/architecture' ? <ArchitecturePage /> : path === '/register' ? <RegisterPage /> : path === '/login' ? <LoginPage /> : path === '/reserve' ? <ReservePage /> : path === '/account' ? <AccountPage /> : showAdminPanel ? <DashboardPage path={path} /> : innerPaths.includes(path) || isBranchPath ? <RoutePage path={path} /> : <main><HomeSections /></main>}
    </ThemeProvider>
  );
}
