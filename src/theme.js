import { createTheme } from '@mui/material/styles';

export const colors = {
  primary: '#123f86',
  primaryDark: '#071a43',
  paleBlue: '#edf2f9',
  background: '#f7f9fc',
  surface: '#ffffff',
  text: '#33415a',
  heading: '#061735',
  muted: '#738096',
  border: '#d8e0ec',
  gold: '#e8a62f',
};

export const theme = createTheme({
  palette: {
    primary: { main: colors.primary, dark: colors.primaryDark, contrastText: '#fff' },
    background: { default: colors.surface, paper: colors.surface },
    text: { primary: colors.text, secondary: colors.muted },
  },
  typography: {
    fontFamily: 'Open Sans, Arial, sans-serif',
    h1: { fontFamily: 'Mulish, Arial, sans-serif', fontWeight: 800 },
    h2: { fontFamily: 'Mulish, Arial, sans-serif', fontWeight: 800 },
    h3: { fontFamily: 'Mulish, Arial, sans-serif', fontWeight: 800 },
    button: { fontFamily: 'Open Sans, Arial, sans-serif', fontWeight: 700, textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 6, padding: '12px 24px' },
      },
    },
    MuiDrawer: {
      styleOverrides: { paper: { backgroundColor: colors.surface } },
    },
    MuiContainer: {
      defaultProps: { disableGutters: true, maxWidth: false },
    },
  },
});
