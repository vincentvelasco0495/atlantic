import { useCallback, useEffect, useRef, useState } from 'react';
import { Add, DoorFrontOutlined, ExitToApp, Search } from '@mui/icons-material';
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
  InputAdornment,
  MenuItem,
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
import { apiGet, apiPost, apiPut } from '../../config/api';
import WalkInTransactionDialog from './WalkInTransactionDialog';

function formatMoney(value) {
  if (value == null || value === '') return '—';

  return Number(value).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDateTime(value) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const pad = (part) => String(part).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatCustomerName(name) {
  if (!name) return '—';

  return name
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildPageNumbers(currentPage, lastPage) {
  if (lastPage <= 1) {
    return lastPage === 1 ? [1] : [];
  }

  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  const pages = [1];

  if (currentPage > 3) {
    pages.push('ellipsis-start');
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(lastPage - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (currentPage < lastPage - 2) {
    pages.push('ellipsis-end');
  }

  pages.push(lastPage);

  return pages;
}

function TablePagination({ page, lastPage, total, perPage, onPageChange }) {
  const pages = buildPageNumbers(page, lastPage);
  const start = total === 0 ? 0 : ((page - 1) * perPage) + 1;
  const end = Math.min(page * perPage, total);

  return (
    <Box className="dashboard-tx-pagination">
      <Typography className="dashboard-tx-pagination-summary">
        Showing {start} to {end} of {total.toLocaleString()} entries
      </Typography>
      <Box className="dashboard-pagination">
        <Button className="dashboard-pagination-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        {pages.map((pageNumber) => (
          pageNumber === 'ellipsis-start' || pageNumber === 'ellipsis-end' ? (
            <span key={pageNumber} className="dashboard-pagination-ellipsis">…</span>
          ) : (
            <Button
              key={pageNumber}
              className={`dashboard-pagination-btn ${pageNumber === page ? 'is-active' : ''}`}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          )
        ))}
        <Button className="dashboard-pagination-btn" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </Box>
    </Box>
  );
}

export default function WalkInTransactionsPanel({ refreshKey = 0, onStatsChange }) {
  const initialLoadRef = useRef(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [checkoutTarget, setCheckoutTarget] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [extendTarget, setExtendTarget] = useState(null);
  const [extendRates, setExtendRates] = useState([]);
  const [loadingExtendRates, setLoadingExtendRates] = useState(false);
  const [extendForm, setExtendForm] = useState({ custom_rate_id: '' });
  const [extendErrors, setExtendErrors] = useState({});
  const [savingExtend, setSavingExtend] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  const loadItems = useCallback(async (pageOverride) => {
    const requestPage = pageOverride ?? page;

    if (initialLoadRef.current) {
      setLoading(true);
    } else {
      setTableLoading(true);
    }

    setError('');

    try {
      const params = new URLSearchParams({
        page: String(requestPage),
        per_page: '10',
      });

      if (debouncedQuery) {
        params.set('search', debouncedQuery);
      }

      const response = await apiGet(`/api/transactions/walkin?${params.toString()}`);
      const payload = response.data || {};

      setItems(Array.isArray(payload.data) ? payload.data : []);
      setPagination({
        current_page: payload.current_page || requestPage,
        per_page: payload.per_page || 10,
        total: payload.total || 0,
        last_page: payload.last_page || 1,
      });
    } catch (loadError) {
      setError(loadError.message || 'Unable to load walk-in transactions.');
    } finally {
      initialLoadRef.current = false;
      setLoading(false);
      setTableLoading(false);
    }
  }, [debouncedQuery, page]);

  const refreshDashboard = useCallback(async () => {
    await Promise.all([
      loadItems(),
      onStatsChange ? Promise.resolve(onStatsChange()) : Promise.resolve(),
    ]);
  }, [loadItems, onStatsChange]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextQuery = query.trim();
      setDebouncedQuery((current) => {
        if (current !== nextQuery) {
          setPage(1);
        }
        return nextQuery;
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    loadItems();
  }, [loadItems, refreshKey]);

  const openExtendDialog = async (item) => {
    setExtendTarget(item);
    setExtendForm({ custom_rate_id: '' });
    setExtendErrors({});
    setLoadingExtendRates(true);

    try {
      const params = new URLSearchParams({
        transaction_type: String(item.transaction_type),
      });
      const response = await apiGet(`/api/transactions/walkin/rates?${params.toString()}`);
      setExtendRates(Array.isArray(response.data?.rates) ? response.data.rates : []);
    } catch (loadError) {
      setExtendErrors({ form: loadError.message || 'Unable to load extend rates.' });
      setExtendRates([]);
    } finally {
      setLoadingExtendRates(false);
    }
  };

  const closeExtendDialog = () => {
    if (!savingExtend) {
      setExtendTarget(null);
      setExtendRates([]);
    }
  };

  const handleExtendSubmit = async (event) => {
    event.preventDefault();
    if (!extendTarget) return;

    setSavingExtend(true);
    setExtendErrors({});

    try {
      await apiPut(`/api/transactions/walkin/${extendTarget.id}/extend`, {
        custom_rate_id: Number(extendForm.custom_rate_id),
      });
      setNotice('Walk-in stay extended successfully.');
      setExtendTarget(null);
      setExtendRates([]);
      await refreshDashboard();
    } catch (submitError) {
      setExtendErrors({
        ...(submitError.errors || {}),
        form: submitError.errors ? undefined : submitError.message,
      });
    } finally {
      setSavingExtend(false);
    }
  };

  const handleCheckout = async () => {
    if (!checkoutTarget) return;

    setCheckingOut(true);

    try {
      await apiPost(`/api/transactions/walkin/${checkoutTarget.id}/checkout`);
      setNotice(`${formatCustomerName(checkoutTarget.customer_name) || 'Guest'} checked out successfully.`);
      setCheckoutTarget(null);
      await refreshDashboard();
    } catch (checkoutError) {
      setError(checkoutError.message || 'Unable to check out walk-in guest.');
      setCheckoutTarget(null);
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <Box className="dashboard-tx-card dashboard-loading">
        <CircularProgress size={32} />
        <Typography>Loading walk-in transactions...</Typography>
      </Box>
    );
  }

  return (
    <>
      {notice && (
        <Alert severity="success" className="dashboard-notice" onClose={() => setNotice('')}>
          {notice}
        </Alert>
      )}

      {error && (
        <Alert severity="error" className="dashboard-notice" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box className="dashboard-tx-card">
        <Box className="dashboard-tx-toolbar">
          <Box className="dashboard-tx-heading">
            <span className="dashboard-tx-heading-icon"><DoorFrontOutlined /></span>
            <Box>
              <Typography className="dashboard-tx-title">Transaction Walkin</Typography>
              <Typography className="dashboard-tx-subtitle">
                {pagination.total.toLocaleString()} active walk-in stays
              </Typography>
            </Box>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <TextField
              className="dashboard-tx-search"
              placeholder="Search guest, room, or ID..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              className="dashboard-add-btn dashboard-tx-add-btn dashboard-walkin-btn"
              onClick={() => setWalkInOpen(true)}
            >
              Walk In
            </Button>
          </Stack>
        </Box>

        {!items.length ? (
          <Box className="dashboard-empty-state">
            <Typography className="dashboard-empty-title">No walk-in transactions found</Typography>
            <Typography className="dashboard-empty-copy">
              There are no active walk-in check-ins for your branch.
            </Typography>
            <Button
              variant="contained"
              className="dashboard-add-btn dashboard-tx-add-btn dashboard-walkin-btn"
              onClick={() => setWalkInOpen(true)}
              sx={{ mt: 2 }}
            >
              Walk In
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer className={`dashboard-tx-table-wrap ${tableLoading ? 'is-loading' : ''}`}>
              {tableLoading && (
                <Box className="dashboard-table-loading">
                  <CircularProgress size={24} />
                </Box>
              )}
              <Table size="small" stickyHeader className="dashboard-tx-table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Hours</TableCell>
                    <TableCell align="right">Rate</TableCell>
                    <TableCell>Login</TableCell>
                    <TableCell>Expected Out</TableCell>
                    <TableCell>Logout</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow hover key={item.id}>
                      <TableCell className="dashboard-tx-cell-id">{item.unique_id ?? item.id}</TableCell>
                      <TableCell className="dashboard-tx-guest-name">{item.customer_name ?? '—'}</TableCell>
                      <TableCell>{item.room_name ?? '—'}</TableCell>
                      <TableCell>{item.transaction_type_label ?? '—'}</TableCell>
                      <TableCell align="right" className="dashboard-tx-cell-num">{item.hours ?? '—'}</TableCell>
                      <TableCell align="right" className="dashboard-tx-cell-money">{formatMoney(item.rates)}</TableCell>
                      <TableCell className="dashboard-tx-cell-date">{formatDateTime(item.login)}</TableCell>
                      <TableCell className="dashboard-tx-cell-date">{formatDateTime(item.expected_out)}</TableCell>
                      <TableCell className="dashboard-tx-cell-date">{formatDateTime(item.logout)}</TableCell>
                      <TableCell>
                        <span className={`dashboard-tx-detail-status is-status-${item.status}`}>
                          {item.status_label ?? '—'}
                        </span>
                      </TableCell>
                      <TableCell align="right" className="dashboard-actions-cell">
                        {item.status === 1 ? (
                          <Stack direction="row" spacing={0.75} justifyContent="flex-end" className="dashboard-tx-actions">
                            <Tooltip title="Check out">
                              <IconButton
                                className="dashboard-tx-action is-checkout"
                                aria-label={`Check out ${item.customer_name}`}
                                onClick={() => setCheckoutTarget(item)}
                              >
                                <ExitToApp fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Extend stay">
                              <IconButton
                                className="dashboard-tx-action is-extend"
                                aria-label={`Extend stay for ${item.customer_name}`}
                                onClick={() => openExtendDialog(item)}
                              >
                                <Add fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        ) : (
                          <Typography variant="body2" className="dashboard-tx-muted">—</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {pagination.total > 0 && (
              <TablePagination
                page={pagination.current_page}
                lastPage={Math.max(pagination.last_page, 1)}
                total={pagination.total}
                perPage={pagination.per_page}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Box>

      <WalkInTransactionDialog
        open={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        onCreated={async (message) => {
          setNotice(message);
          await refreshDashboard();
        }}
      />

      <Dialog open={Boolean(extendTarget)} onClose={closeExtendDialog} fullWidth maxWidth="sm" className="dashboard-dialog">
        <DialogTitle>
          Extend stay ·
          {' '}
          {formatCustomerName(extendTarget?.customer_name) ?? ''}
        </DialogTitle>
        <Box component="form" onSubmit={handleExtendSubmit}>
          <DialogContent className="dashboard-dialog-content">
            {extendErrors.form && <Alert severity="error" sx={{ mb: 2 }}>{extendErrors.form}</Alert>}
            {loadingExtendRates ? (
              <Box className="dashboard-dialog-loading">
                <CircularProgress size={28} />
              </Box>
            ) : (
              <TextField
                select
                fullWidth
                required
                label="Rates"
                value={extendForm.custom_rate_id}
                onChange={(event) => {
                  setExtendForm({ custom_rate_id: event.target.value });
                  setExtendErrors((current) => ({ ...current, custom_rate_id: undefined, form: undefined }));
                }}
                error={Boolean(extendErrors.custom_rate_id?.[0])}
                helperText={
                  extendErrors.custom_rate_id?.[0]
                  || (extendRates.length ? 'Select hours package to add.' : 'No rates available for this transaction type.')
                }
              >
                <MenuItem value="">
                  <em>Select Rate</em>
                </MenuItem>
                {extendRates.map((rate) => (
                  <MenuItem key={rate.id} value={String(rate.id)}>
                    {rate.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </DialogContent>
          <DialogActions className="dashboard-dialog-actions">
            <Button onClick={closeExtendDialog} disabled={savingExtend}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={savingExtend || loadingExtendRates || !extendForm.custom_rate_id}
            >
              {savingExtend ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(checkoutTarget)} onClose={() => !checkingOut && setCheckoutTarget(null)} maxWidth="xs" fullWidth className="dashboard-dialog">
        <DialogTitle>Check out walk-in guest</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Check out
            {' '}
            <strong>{formatCustomerName(checkoutTarget?.customer_name)}</strong>
            {' '}
            from
            {' '}
            <strong>{checkoutTarget?.room_name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will free the bed and mark the walk-in stay as completed.
          </Typography>
        </DialogContent>
        <DialogActions className="dashboard-dialog-actions">
          <Button onClick={() => setCheckoutTarget(null)} disabled={checkingOut}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleCheckout} disabled={checkingOut}>
            {checkingOut ? 'Checking out...' : 'Check out'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
