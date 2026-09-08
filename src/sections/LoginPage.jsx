import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import { login } from '../config/api';
import { useAuthStore } from '../store/authStore';
import { getPostLoginPath } from '../utils/auth';
import { Footer, useSectionReveal } from './HomeSections';

export default function LoginPage() {
  useSectionReveal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const fieldError = (name) => errors[name]?.[0];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSubmitError('');
    setErrors({});

    try {
      const response = await login({ email, password });
      setAuth({
        user: response.data.user,
        token: response.data.token,
      });
      window.location.href = getPostLoginPath(response.data.user);
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      }
      setSubmitError(error.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main>
        <section className="page-hero register-hero" data-scroll-section>
          <Container className="site-container page-hero-layout">
            <Box className="page-hero-copy">
              <Typography className="eyebrow">Customer account</Typography>
              <Typography component="h1" className="page-title">Sign in</Typography>
              <Typography className="section-description">
                Use your email and password to access your Atlantic Seaman&apos;s Dormitory account.
              </Typography>
            </Box>
          </Container>
        </section>

        <section className="section register-section" data-scroll-section>
          <Container className="site-container">
            <Box component="form" className="register-form login-form" onSubmit={handleSubmit} noValidate>
              {submitError && (
                <Alert severity="error" className="register-alert">
                  {submitError}
                </Alert>
              )}

              <TextField
                label="Email"
                type="email"
                required
                fullWidth
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={Boolean(fieldError('email'))}
                helperText={fieldError('email')}
              />
              <TextField
                label="Password"
                type="password"
                required
                fullWidth
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={Boolean(fieldError('password'))}
                helperText={fieldError('password')}
              />

              <Box className="register-form-actions">
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? 'Signing in...' : 'Login'}
                </Button>
                <Typography className="register-form-footnote">
                  Don&apos;t have an account? <Box component="a" href="/register" sx={{ color: 'var(--blue)', fontWeight: 700 }}>Register here</Box>
                </Typography>
              </Box>
            </Box>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
