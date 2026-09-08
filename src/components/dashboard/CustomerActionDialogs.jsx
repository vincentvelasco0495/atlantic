import { useCallback, useEffect, useRef, useState } from 'react';
import { DeleteOutline, DownloadOutlined } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { apiDelete, apiDownload, apiGet, apiUpload } from '../../config/api';
import { formatDateTime, getResourceItemLabel } from '../../config/resources';

function LoadingState({ label }) {
  return (
    <Box className="dashboard-loading dashboard-dialog-loading">
      <CircularProgress size={28} />
      <Typography>{label}</Typography>
    </Box>
  );
}

function CustomerFilesDialog({ customer, config, onClose, onNotice }) {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiGet(`/api/customers/${customer.id}/files`);
      setFiles(Array.isArray(response.data) ? response.data : []);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load files.');
    } finally {
      setLoading(false);
    }
  }, [customer.id]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormErrors({});

    if (!selectedFile) {
      setFormErrors({ file: ['Please choose a file to upload.'] });
      setSaving(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', selectedFile);

      await apiUpload(`/api/customers/${customer.id}/files`, formData);
      setTitle('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onNotice('File uploaded successfully.');
      await loadFiles();
    } catch (submitError) {
      setFormErrors(submitError.errors || { form: submitError.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (file) => {
    setDownloadingId(file.id);
    setError('');

    try {
      await apiDownload(
        `/api/customers/${customer.id}/files/${file.id}/download`,
        file.filename,
      );
    } catch (downloadError) {
      setError(downloadError.message || 'Unable to download file.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (fileId) => {
    setDeletingId(fileId);

    try {
      await apiDelete(`/api/customers/${customer.id}/files/${fileId}`);
      onNotice('File deleted successfully.');
      await loadFiles();
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete file record.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md" className="dashboard-dialog">
      <DialogTitle>Customer files</DialogTitle>
      <DialogContent className="dashboard-dialog-content">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Files for {getResourceItemLabel(config, customer)}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {formErrors.form && <Alert severity="error" sx={{ mb: 2 }}>{formErrors.form}</Alert>}

        <Box component="form" onSubmit={handleSubmit} className="dashboard-inline-form">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }} alignItems={{ sm: 'flex-start' }}>
            <TextField
              label="Title"
              required
              fullWidth
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              error={Boolean(formErrors.title)}
              helperText={formErrors.title?.[0]}
            />
            <Box className="dashboard-file-picker">
              <Button variant="outlined" component="label" fullWidth>
                {selectedFile ? selectedFile.name : 'Choose file'}
                <input
                  ref={fileInputRef}
                  hidden
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.webp,image/*,application/pdf"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                />
              </Button>
              {formErrors.file?.[0] && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {formErrors.file[0]}
                </Typography>
              )}
            </Box>
            <Button type="submit" variant="contained" disabled={saving} sx={{ minWidth: 120, alignSelf: { sm: 'center' } }}>
              {saving ? 'Uploading...' : 'Upload file'}
            </Button>
          </Stack>
        </Box>

        {loading ? (
          <LoadingState label="Loading files..." />
        ) : !files.length ? (
          <Typography color="text.secondary">No files recorded for this customer.</Typography>
        ) : (
          <TableContainer className="dashboard-table-wrap">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Filename</TableCell>
                  <TableCell>Added</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>{file.title}</TableCell>
                    <TableCell>
                      <Typography variant="body2" className="dashboard-file-name">
                        {file.filename}
                      </Typography>
                      {!file.has_uploaded_file && (
                        <Typography variant="caption" color="warning.main">
                          File missing on server
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{formatDateTime(file.created_at)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title={file.has_uploaded_file ? 'Download file' : 'File not available'}>
                          <span>
                            <IconButton
                              aria-label={`Download file ${file.title}`}
                              onClick={() => handleDownload(file)}
                              disabled={!file.has_uploaded_file || downloadingId === file.id}
                            >
                              <DownloadOutlined fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <IconButton
                          aria-label={`Delete file ${file.title}`}
                          onClick={() => handleDelete(file.id)}
                          disabled={deletingId === file.id}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions className="dashboard-dialog-actions">
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function CustomerBalanceDialog({ customer, config, onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBalances = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiGet(`/api/customers/${customer.id}/balances`);
      setRecords(Array.isArray(response.data?.records) ? response.data.records : []);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load balance.');
    } finally {
      setLoading(false);
    }
  }, [customer.id]);

  useEffect(() => {
    loadBalances();
  }, [loadBalances]);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" className="dashboard-dialog">
      <DialogTitle>Customer balance</DialogTitle>
      <DialogContent className="dashboard-dialog-content">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Remaining balance for {getResourceItemLabel(config, customer)}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <LoadingState label="Loading balance..." />
        ) : !records.length ? (
          <Typography color="text.secondary">No remaining balance records for this customer.</Typography>
        ) : (
          <TableContainer className="dashboard-table-wrap">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Branch</TableCell>
                  <TableCell>Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.balance_id}>
                    <TableCell>{record.location?.name ?? '—'}</TableCell>
                    <TableCell>{record.balance ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions className="dashboard-dialog-actions">
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function CustomerHistoryDialog({ customer, config, onClose }) {
  const [data, setData] = useState({ transactions: [], bed_histories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      setLoading(true);
      setError('');

      try {
        const response = await apiGet(`/api/customers/${customer.id}/history`);
        if (active) {
          setData({
            transactions: response.data?.transactions || [],
            bed_histories: response.data?.bed_histories || [],
          });
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Unable to load history.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      active = false;
    };
  }, [customer.id]);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="lg" className="dashboard-dialog">
      <DialogTitle>Customer history</DialogTitle>
      <DialogContent className="dashboard-dialog-content">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Stay and activity history for {getResourceItemLabel(config, customer)}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <LoadingState label="Loading history..." />
        ) : (
          <Stack spacing={3}>
            <Box>
              <Typography className="dashboard-dialog-section-title">Transactions</Typography>
              {!data.transactions.length ? (
                <Typography color="text.secondary">No transactions recorded.</Typography>
              ) : (
                <TableContainer className="dashboard-table-wrap">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Reference</TableCell>
                        <TableCell>Branch</TableCell>
                        <TableCell>Bed</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Check-in</TableCell>
                        <TableCell>Check-out</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.unique_id ?? `#${transaction.id}`}</TableCell>
                          <TableCell>{transaction.location?.name ?? '—'}</TableCell>
                          <TableCell>{transaction.bed?.name ?? '—'}</TableCell>
                          <TableCell>{transaction.final_amount != null ? `₱${transaction.final_amount}` : '—'}</TableCell>
                          <TableCell>{transaction.status ?? '—'}</TableCell>
                          <TableCell>{formatDateTime(transaction.login)}</TableCell>
                          <TableCell>{formatDateTime(transaction.logout)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>

            <Box>
              <Typography className="dashboard-dialog-section-title">Bed history</Typography>
              {!data.bed_histories.length ? (
                <Typography color="text.secondary">No bed history recorded.</Typography>
              ) : (
                <TableContainer className="dashboard-table-wrap">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Bed</TableCell>
                        <TableCell>Room</TableCell>
                        <TableCell>Branch</TableCell>
                        <TableCell>Transaction</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.bed_histories.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.bed?.name ?? '—'}</TableCell>
                          <TableCell>{entry.bed?.room?.name ?? '—'}</TableCell>
                          <TableCell>{entry.bed?.room?.location?.name ?? '—'}</TableCell>
                          <TableCell>{entry.transaction_id ? `#${entry.transaction_id}` : '—'}</TableCell>
                          <TableCell>{formatDateTime(entry.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions className="dashboard-dialog-actions">
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function CustomerActionDialogs({ action, config, onClose, onNotice, onUpdated }) {
  if (!action?.customer || !action?.type) {
    return null;
  }

  if (action.type === 'files') {
    return (
      <CustomerFilesDialog
        customer={action.customer}
        config={config}
        onClose={onClose}
        onNotice={onNotice}
      />
    );
  }

  if (action.type === 'balance') {
    return (
      <CustomerBalanceDialog
        customer={action.customer}
        config={config}
        onClose={onClose}
      />
    );
  }

  if (action.type === 'history') {
    return (
      <CustomerHistoryDialog
        customer={action.customer}
        config={config}
        onClose={onClose}
      />
    );
  }

  return null;
}
