import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import { migrateLegacyAuthStorage } from './store/authStore';
import './styles.css';

migrateLegacyAuthStorage();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CssBaseline />
    <App />
  </StrictMode>,
);
