import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import { registerCustomer } from '../config/api';
import { useAuthStore } from '../store/authStore';
import { Footer, useSectionReveal } from './HomeSections';

const initialForm = {
  email: '',
  password: '',
  password_confirmation: '',
  first_name: '',
  last_name: '',
  middle_name: '',
  sirb_no: '',
  mobile_no: '',
  permanent_address: '',
  rank: '',
  agency: '',
  icoe_name: '',
  icoe_relation: '',
  icoe_contact: '',
  note: '',
};

function FieldGroup({ title, description, children }) {
  return (
    <Box className="register-form-group">
      <Box className="register-form-group-heading">
        <Typography component="h2" className="register-form-group-title">{title}</Typography>
        {description && <Typography className="register-form-group-description">{description}</Typography>}
      </Box>
      <Box className="register-form-grid">{children}</Box>
    </Box>
  );
}

export default function RegisterPage() {
  useSectionReveal();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSubmitError('');
    setErrors({});

    try {
      const response = await registerCustomer({
        ...form,
        location_id: 0,
      });

      setAuth({
        user: response.data.user,
        token: response.data.token,
      });
      window.location.href = '/';
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      }
      setSubmitError(error.message || 'Unable to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (name) => errors[name]?.[0];

  return (
    <>
      <main>
        <section className="page-hero register-hero" data-scroll-section>
          <Container className="site-container page-hero-layout">
            <Box className="page-hero-copy">
              <Typography className="eyebrow">Customer account</Typography>
              <Typography component="h1" className="page-title">Create your account</Typography>
              <Typography className="section-description">
                Register once to save your seafarer details and manage your stay with Atlantic Seaman&apos;s Dormitory.
              </Typography>
            </Box>
          </Container>
        </section>

        <section className="section register-section" data-scroll-section>
          <Container className="site-container">
            <Box component="form" className="register-form" onSubmit={handleSubmit} noValidate>
              {submitError && (
                <Alert severity="error" className="register-alert">
                  {submitError}
                </Alert>
              )}

              <FieldGroup title="Account details" description="Use your email and password to access your account.">
                  <TextField label="Email" type="email" required fullWidth value={form.email} onChange={updateField('email')} error={Boolean(fieldError('email'))} helperText={fieldError('email')} />
                  <TextField label="Password" type="password" required fullWidth value={form.password} onChange={updateField('password')} error={Boolean(fieldError('password'))} helperText={fieldError('password') || 'Minimum 8 characters'} />
                  <TextField label="Confirm password" type="password" required fullWidth value={form.password_confirmation} onChange={updateField('password_confirmation')} error={Boolean(fieldError('password_confirmation'))} helperText={fieldError('password_confirmation')} />
                </FieldGroup>

                <FieldGroup title="Personal information" description="These details will be saved to your customer profile.">
                  <TextField label="First name" required fullWidth value={form.first_name} onChange={updateField('first_name')} error={Boolean(fieldError('first_name'))} helperText={fieldError('first_name')} />
                  <TextField label="Middle name" fullWidth value={form.middle_name} onChange={updateField('middle_name')} error={Boolean(fieldError('middle_name'))} helperText={fieldError('middle_name')} />
                  <TextField label="Last name" required fullWidth value={form.last_name} onChange={updateField('last_name')} error={Boolean(fieldError('last_name'))} helperText={fieldError('last_name')} />
                  <TextField label="SIRB number" required fullWidth value={form.sirb_no} onChange={updateField('sirb_no')} error={Boolean(fieldError('sirb_no'))} helperText={fieldError('sirb_no')} />
                  <TextField label="Mobile number" required fullWidth value={form.mobile_no} onChange={updateField('mobile_no')} error={Boolean(fieldError('mobile_no'))} helperText={fieldError('mobile_no')} />
                  <TextField label="Permanent address" required fullWidth className="register-field-full" value={form.permanent_address} onChange={updateField('permanent_address')} error={Boolean(fieldError('permanent_address'))} helperText={fieldError('permanent_address')} />
                  <TextField label="Rank" required fullWidth value={form.rank} onChange={updateField('rank')} error={Boolean(fieldError('rank'))} helperText={fieldError('rank')} />
                  <TextField label="Agency" required fullWidth value={form.agency} onChange={updateField('agency')} error={Boolean(fieldError('agency'))} helperText={fieldError('agency')} />
                </FieldGroup>

                <FieldGroup title="In case of emergency" description="Provide a contact person we can reach if needed.">
                  <TextField label="Contact name" required fullWidth value={form.icoe_name} onChange={updateField('icoe_name')} error={Boolean(fieldError('icoe_name'))} helperText={fieldError('icoe_name')} />
                  <TextField label="Relationship" required fullWidth value={form.icoe_relation} onChange={updateField('icoe_relation')} error={Boolean(fieldError('icoe_relation'))} helperText={fieldError('icoe_relation')} />
                  <TextField label="Contact number" required fullWidth value={form.icoe_contact} onChange={updateField('icoe_contact')} error={Boolean(fieldError('icoe_contact'))} helperText={fieldError('icoe_contact')} />
                </FieldGroup>

                <FieldGroup title="Additional notes">
                  <TextField label="Notes" fullWidth multiline minRows={3} className="register-field-full" value={form.note} onChange={updateField('note')} error={Boolean(fieldError('note'))} helperText={fieldError('note')} />
                </FieldGroup>

                <Box className="register-form-actions">
                  <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create account'}
                  </Button>
                  <Typography className="register-form-footnote">
                    By registering, your account will be created with customer access and your profile will be saved for future stays.
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
