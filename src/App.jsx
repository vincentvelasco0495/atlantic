import { ThemeProvider } from '@mui/material/styles';
import Header from './components/Header';
import ArchitecturePage from './sections/ArchitecturePage';
import HomeSections from './sections/HomeSections';
import { RoutePage } from './sections/InnerPages';
import { theme } from './theme';

export default function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const innerPaths = ['/about', '/rooms', '/gallery', '/faq', '/faq2', '/room', '/news', '/post', '/branches', '/contacts', '/contacts2', '/error', '/404', '/architecture'];
  const isBranchPath = /^\/branch\/[^/]+$/.test(path);

  return (
    <ThemeProvider theme={theme}>
      <Header />
      {path === '/architecture' ? <ArchitecturePage /> : innerPaths.includes(path) || isBranchPath ? <RoutePage path={path} /> : <main><HomeSections /></main>}
    </ThemeProvider>
  );
}
