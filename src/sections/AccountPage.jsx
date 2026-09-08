import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  apiDelete,
  apiDownload,
  apiGet,
  apiPut,
  apiUpload,
} from '../config/api';
import { useAuthStore } from '../store/authStore';
import { Footer, useSectionReveal } from './HomeSections';

const TABS = {
  transactions: 'transactions',
  balance: 'balance',
  profile: 'profile',
  documents: 'documents',
};

const emptyProfile = {
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

function formatDateTime(value) {
  if (!value) return '—';

  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—';
  }

  return `PHP ${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function AccountPage() {
  useSectionReveal();

  const token = useAuthStore((state) => state.token);
  const isCustomer = useAuthStore((state) => state.isCustomer());
  const isAdmin = useAuthStore((state) => state.isAdmin());

  const [tab, setTab] = useState(TABS.transactions);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [transactions, setTransactions] = useState([]);
  const [balanceData, setBalanceData] = useState({ account_balance: 0, penalty_amount: 0, records: [] });
  const [files, setFiles] = useState([]);
  const [fileTitle, setFileTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [profileErrors, setProfileErrors] = useState({});

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    if (isAdmin) {
      window.location.href = '/dashboard';
      return;
    }

    if (!isCustomer) {
      window.location.href = '/';
    }
  }, [token, isCustomer, isAdmin]);

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);

    try {
      const response = await apiGet('/api/account');
      setProfile(response.data);
      setProfileForm({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        middle_name: response.data.middle_name || '',
        sirb_no: response.data.sirb_no || '',
        mobile_no: response.data.mobile_no || '',
        permanent_address: response.data.permanent_address || '',
        rank: response.data.rank || '',
        agency: response.data.agency || '',
        icoe_name: response.data.icoe_name || '',
        icoe_relation: response.data.icoe_relation || '',
        icoe_contact: response.data.icoe_contact || '',
        note: response.data.note || '',
      });
    } catch (loadError) {
      setError(loadError.message || 'Unable to load your account.');
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoadingTransactions(true);
    setError('');

    try {
      const response = await apiGet('/api/account/transactions?per_page=50');
      setTransactions(response.data?.data || []);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load transactions.');
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  const loadBalance = useCallback(async () => {
    setLoadingBalance(true);
    setError('');

    try {
      const response = await apiGet('/api/account/balance');
      setBalanceData(response.data || { account_balance: 0, penalty_amount: 0, records: [] });
    } catch (loadError) {
      setError(loadError.message || 'Unable to load balance.');
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const loadFiles = useCallback(async () => {
    setLoadingFiles(true);
    setError('');

    try {
      const response = await apiGet('/api/account/files');
      setFiles(Array.isArray(response.data) ? response.data : []);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load documents.');
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    if (!token || !isCustomer) {
      return;
    }

    loadProfile();
  }, [token, isCustomer, loadProfile]);

  useEffect(() => {
    if (!token || !isCustomer) {
      return;
    }

    if (tab === TABS.transactions) {
      loadTransactions();
    }

    if (tab === TABS.balance) {
      loadBalance();
    }

    if (tab === TABS.documents) {
      loadFiles();
    }
  }, [tab, token, isCustomer, loadTransactions, loadBalance, loadFiles]);

  const updateProfileField = (field) => (event) => {
    setProfileForm((current) => ({ ...current, [field]: event.target.value }));
    setProfileErrors((current) => ({ ...current, [field]: undefined }));
    setNotice('');
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileErrors({});
    setNotice('');
    setError('');

    try {
      const response = await apiPut('/api/account/profile', profileForm);
      setProfile(response.data);
      setNotice('Profile updated successfully.');
    } catch (submitError) {
      if (submitError.errors) {
        setProfileErrors(submitError.errors);
      }
      setError(submitError.message || 'Unable to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setError('Please choose a file to upload.');
      return;
    }

    setUploadingFile(true);
    setError('');
    setNotice('');

    try {
      const formData = new FormData();
      formData.append('title', fileTitle);
      formData.append('file', selectedFile);

      await apiUpload('/api/account/files', formData);
      setFileTitle('');
      setSelectedFile(null);
      setNotice('Document uploaded successfully.');
      await loadFiles();
    } catch (uploadError) {
      setError(uploadError.message || 'Unable to upload document.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      await apiDownload(`/api/account/files/${file.id}/download`, file.filename || file.title);
    } catch (downloadError) {
      setError(downloadError.message || 'Unable to download document.');
    }
  };

  const handleDeleteFile = async (fileId) => {
    setError('');
    setNotice('');

    try {
      await apiDelete(`/api/account/files/${fileId}`);
      setNotice('Document deleted.');
      await loadFiles();
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete document.');
    }
  };

  const fieldError = (name) => profileErrors[name]?.[0];
  const activeBalanceRecords = (balanceData.records || []).filter((record) => Number(record.balance) > 0);

  if (!token || !isCustomer) {
    return null;
  }

  return (
    <>
      <main>
        <section className="page-hero register-hero" data-scroll-section>
          <Container className="site-container page-hero-layout">
            <Box className="page-hero-copy">
              <Typography className="eyebrow">My account</Typography>
              <Typography component="h1" className="page-title">Account overview</Typography>
              <Typography className="section-description">
                View your stay history, remaining balance, update your profile, and manage your documents.
              </Typography>
            </Box>
          </Container>
        </section>

        <section className="section register-section" data-scroll-section>
          <Container className="site-container">
            <Box className="register-form account-page">
              {error && <Alert severity="error" className="register-alert">{error}</Alert>}
              {notice && <Alert severity="success" className="register-alert">{notice}</Alert>}

              {!loadingProfile && profile && (
                <Box className="account-summary-grid">
                  <Box className="account-summary-card">
                    <Typography className="account-summary-label">Account balance</Typography>
                    <Typography className="account-summary-value">{profile.balance ?? 0} day(s)</Typography>
                  </Box>
                  <Box className="account-summary-card">
                    <Typography className="account-summary-label">SIRB number</Typography>
                    <Typography className="account-summary-value">{profile.sirb_no || '—'}</Typography>
                  </Box>
                  <Box className="account-summary-card account-summary-card-wide">
                    <Typography className="account-summary-label">Email</Typography>
                    <Typography className="account-summary-value is-text" title={profile.email || undefined}>
                      {profile.email || '—'}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Tabs
                value={tab}
                onChange={(_, value) => {
                  if (value) {
                    setTab(value);
                    setError('');
                    setNotice('');
                  }
                }}
                variant="scrollable"
                scrollButtons="auto"
                className="account-tabs reserve-type-tabs register-field-full"
              >
                <Tab label="Transactions" value={TABS.transactions} />
                <Tab label="Balance" value={TABS.balance} />
                <Tab label="Profile" value={TABS.profile} />
                <Tab label="Documents" value={TABS.documents} />
              </Tabs>

              {tab === TABS.transactions && (
                <Box className="account-panel">
                  <Typography component="h2" className="register-form-group-title">Past transactions</Typography>
                  <Typography className="register-form-group-description">
                    Your bedspace stay history across all branches.
                  </Typography>

                  {loadingTransactions ? (
                    <Typography className="account-empty-state">Loading transactions...</Typography>
                  ) : !transactions.length ? (
                    <Typography className="account-empty-state">No transactions recorded yet.</Typography>
                  ) : (
                    <TableContainer className="account-table-wrap">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Reference</TableCell>
                            <TableCell>Branch</TableCell>
                            <TableCell>Room / Bed</TableCell>
                            <TableCell>Days</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Check-in</TableCell>
                            <TableCell>Check-out</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>{transaction.reference}</TableCell>
                              <TableCell>{transaction.branch || '—'}</TableCell>
                              <TableCell>
                                {[transaction.room, transaction.bed].filter(Boolean).join(' / ') || '—'}
                              </TableCell>
                              <TableCell>{transaction.days || '—'}</TableCell>
                              <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                              <TableCell>{transaction.status}</TableCell>
                              <TableCell>{formatDateTime(transaction.check_in)}</TableCell>
                              <TableCell>{formatDateTime(transaction.check_out)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}

              {tab === TABS.balance && (
                <Box className="account-panel">
                  <Typography component="h2" className="register-form-group-title">Remaining balance</Typography>
                  <Typography className="register-form-group-description">
                    Prepaid days available for your next bedspace stay.
                  </Typography>

                  {loadingBalance ? (
                    <Typography className="account-empty-state">Loading balance...</Typography>
                  ) : (
                    <>
                      <Box className="account-summary-grid">
                        <Box className="account-summary-card">
                          <Typography className="account-summary-label">Account balance</Typography>
                          <Typography className="account-summary-value">
                            {balanceData.account_balance ?? 0} day(s)
                          </Typography>
                        </Box>
                        <Box className="account-summary-card">
                          <Typography className="account-summary-label">Penalty amount</Typography>
                          <Typography className="account-summary-value">
                            {formatCurrency(balanceData.penalty_amount ?? 0)}
                          </Typography>
                        </Box>
                      </Box>

                      {!activeBalanceRecords.length ? (
                        <Typography className="account-empty-state">No branch balance records found.</Typography>
                      ) : (
                        <TableContainer className="account-table-wrap">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Branch</TableCell>
                                <TableCell>Room</TableCell>
                                <TableCell>Remaining days</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {activeBalanceRecords.map((record) => (
                                <TableRow key={record.balance_id}>
                                  <TableCell>{record.location?.name ?? '—'}</TableCell>
                                  <TableCell>{record.room?.name ?? '—'}</TableCell>
                                  <TableCell>{record.balance ?? '—'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </>
                  )}
                </Box>
              )}

              {tab === TABS.profile && (
                <Box component="form" className="account-panel" onSubmit={handleProfileSubmit} noValidate>
                  <Typography component="h2" className="register-form-group-title">Personal information</Typography>
                  <Typography className="register-form-group-description">
                    Update your seafarer details used for reservations and check-in.
                  </Typography>

                  {loadingProfile ? (
                    <Typography className="account-empty-state">Loading profile...</Typography>
                  ) : (
                    <>
                      <FieldGroup title="Personal information">
                        <TextField label="First name" required fullWidth value={profileForm.first_name} onChange={updateProfileField('first_name')} error={Boolean(fieldError('first_name'))} helperText={fieldError('first_name')} />
                        <TextField label="Middle name" fullWidth value={profileForm.middle_name} onChange={updateProfileField('middle_name')} error={Boolean(fieldError('middle_name'))} helperText={fieldError('middle_name')} />
                        <TextField label="Last name" required fullWidth value={profileForm.last_name} onChange={updateProfileField('last_name')} error={Boolean(fieldError('last_name'))} helperText={fieldError('last_name')} />
                        <TextField label="SIRB number" required fullWidth value={profileForm.sirb_no} onChange={updateProfileField('sirb_no')} error={Boolean(fieldError('sirb_no'))} helperText={fieldError('sirb_no')} />
                        <TextField label="Mobile number" required fullWidth value={profileForm.mobile_no} onChange={updateProfileField('mobile_no')} error={Boolean(fieldError('mobile_no'))} helperText={fieldError('mobile_no')} />
                        <TextField label="Permanent address" required fullWidth className="register-field-full" value={profileForm.permanent_address} onChange={updateProfileField('permanent_address')} error={Boolean(fieldError('permanent_address'))} helperText={fieldError('permanent_address')} />
                        <TextField label="Rank" required fullWidth value={profileForm.rank} onChange={updateProfileField('rank')} error={Boolean(fieldError('rank'))} helperText={fieldError('rank')} />
                        <TextField label="Agency" required fullWidth value={profileForm.agency} onChange={updateProfileField('agency')} error={Boolean(fieldError('agency'))} helperText={fieldError('agency')} />
                      </FieldGroup>

                      <FieldGroup title="In case of emergency">
                        <TextField label="Contact name" required fullWidth value={profileForm.icoe_name} onChange={updateProfileField('icoe_name')} error={Boolean(fieldError('icoe_name'))} helperText={fieldError('icoe_name')} />
                        <TextField label="Relationship" required fullWidth value={profileForm.icoe_relation} onChange={updateProfileField('icoe_relation')} error={Boolean(fieldError('icoe_relation'))} helperText={fieldError('icoe_relation')} />
                        <TextField label="Contact number" required fullWidth value={profileForm.icoe_contact} onChange={updateProfileField('icoe_contact')} error={Boolean(fieldError('icoe_contact'))} helperText={fieldError('icoe_contact')} />
                      </FieldGroup>

                      <FieldGroup title="Notes">
                        <TextField label="Notes" fullWidth multiline minRows={3} className="register-field-full" value={profileForm.note} onChange={updateProfileField('note')} error={Boolean(fieldError('note'))} helperText={fieldError('note')} />
                      </FieldGroup>

                      <Box className="register-form-actions">
                        <Button type="submit" variant="contained" disabled={savingProfile}>
                          {savingProfile ? 'Saving...' : 'Save profile'}
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              )}

              {tab === TABS.documents && (
                <Box className="account-panel">
                  <Typography component="h2" className="register-form-group-title">Documents</Typography>
                  <Typography className="register-form-group-description">
                    Upload supporting documents such as IDs or certificates.
                  </Typography>

                  <Box component="form" className="account-upload-form" onSubmit={handleFileUpload}>
                    <TextField
                      label="Document title"
                      required
                      fullWidth
                      value={fileTitle}
                      onChange={(event) => setFileTitle(event.target.value)}
                    />
                    <Button variant="outlined" component="label">
                      Choose file
                      <input
                        hidden
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf,.webp"
                        onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                      />
                    </Button>
                    <Typography className="account-file-name">
                      {selectedFile ? selectedFile.name : 'No file selected'}
                    </Typography>
                    <Button type="submit" variant="contained" disabled={uploadingFile}>
                      {uploadingFile ? 'Uploading...' : 'Upload document'}
                    </Button>
                  </Box>

                  {loadingFiles ? (
                    <Typography className="account-empty-state">Loading documents...</Typography>
                  ) : !files.length ? (
                    <Typography className="account-empty-state">No documents uploaded yet.</Typography>
                  ) : (
                    <TableContainer className="account-table-wrap">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Uploaded</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {files.map((file) => (
                            <TableRow key={file.id}>
                              <TableCell>{file.title}</TableCell>
                              <TableCell>{formatDateTime(file.created_at)}</TableCell>
                              <TableCell align="right">
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <Button size="small" onClick={() => handleDownloadFile(file)} disabled={!file.has_uploaded_file}>
                                    Download
                                  </Button>
                                  <Button size="small" color="error" onClick={() => handleDeleteFile(file.id)}>
                                    Delete
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}
            </Box>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
