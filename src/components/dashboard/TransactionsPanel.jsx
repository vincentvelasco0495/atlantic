import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Add,
  ExitToApp,
  ReceiptLongOutlined,
  Search,
  SwapHoriz,
} from '@mui/icons-material';
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
import AddTransactionDialog from './AddTransactionDialog';
import SwitchTransactionDialog from './SwitchTransactionDialog';

function formatMoney(value) {
  if (value == null || value === '') return '—';

  return `₱${Number(value).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDay(value) {
  if (value == null || value === '') return '—';
  return String(value);
}

function formatShortDate(value) {
  if (!value) return '—';

  try {
    return new Intl.DateTimeFormat('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
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

function TablePagination({ page, lastPage, total, onPageChange }) {
  const pages = buildPageNumbers(page, lastPage);
  const start = total === 0 ? 0 : ((page - 1) * 10) + 1;
  const end = Math.min(page * 10, total);

  return (
    <Box className="dashboard-tx-pagination">
      <Typography className="dashboard-tx-pagination-summary">
        Showing {start}–{end} of {total.toLocaleString()} entries
      </Typography>
      <Box className="dashboard-pagination">
        <Button className="dashboard-pagination-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        {pages.map((pageNumber) => (
          pageNumber === 'ellipsis-start' || pageNumber === 'ellipsis-end' ? (
            <span key={pageNumber} className="dashboard-pagination-ellipsis">...</span>
          ) : (
            <Button
              key={pageNumber}
              className={`dashboard-pagination-btn ${pageNumber === page ? 'is-active' : ''}`}
              variant={pageNumber === page ? 'contained' : 'text'}
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

function TransactionFormDialog({
  open,
  title,
  form,
  errors,
  saving,
  fields,
  onClose,
  onChange,
  onSubmit,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" className="dashboard-dialog">
      <DialogTitle>{title}</DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent className="dashboard-dialog-content">
          {errors.form && <Alert severity="error" sx={{ mb: 2 }}>{errors.form}</Alert>}
          <Stack spacing={2}>
            {fields.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                type={field.type === 'number' ? 'number' : 'text'}
                select={field.type === 'select'}
                required={field.required}
                fullWidth
                value={form[field.name] ?? ''}
                onChange={(event) => onChange(field.name, event.target.value)}
                error={Boolean(errors[field.name])}
                helperText={errors[field.name]?.[0] || field.helperText}
                inputProps={field.step ? { step: field.step, min: field.min ?? 0 } : undefined}
              >
                {field.type === 'select' && field.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions className="dashboard-dialog-actions">
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

function StatusBadge({ status, label }) {
  return (
    <span className={`dashboard-tx-pill ${status === '1' ? 'is-in' : 'is-out'}`}>
      {label ?? status}
    </span>
  );
}

function ContinueBadge({ isContinue, label }) {
  const isYes = Number(isContinue) === 1;

  return (
    <span className={`dashboard-tx-pill ${isYes ? 'is-yes' : 'is-no'}`}>
      {label ?? (isYes ? 'Yes' : 'No')}
    </span>
  );
}

export default function TransactionsPanel({ onStatsChange }) {
  const initialLoadRef = useRef(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [form, setForm] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [checkoutTarget, setCheckoutTarget] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [switchTarget, setSwitchTarget] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

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
        status: '1',
      });

      if (debouncedQuery) {
        params.set('search', debouncedQuery);
      }

      const response = await apiGet(`/api/transactions?${params.toString()}`);
      const payload = response.data || {};

      setItems(Array.isArray(payload.data) ? payload.data : []);
      setPagination({
        current_page: payload.current_page || requestPage,
        per_page: payload.per_page || 10,
        total: payload.total || 0,
        last_page: payload.last_page || 1,
      });
    } catch (loadError) {
      setError(loadError.message || 'Unable to load transactions.');
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
  }, [loadItems]);

  const openActionDialog = (type, item) => {
    setActionType(type);
    setActionTarget(item);

    if (type === 'extend') {
      setForm({
        extend_day: '',
      });
    }

    setFormErrors({});
  };

  const closeActionDialog = () => {
    if (!saving) {
      setActionTarget(null);
      setActionType(null);
    }
  };

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setFormErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
  };

  const handleActionSubmit = async (event) => {
    event.preventDefault();
    if (!actionTarget || !actionType) return;

    setSaving(true);
    setFormErrors({});

    try {
      if (actionType === 'extend') {
        await apiPut(`/api/transactions/${actionTarget.id}/extend`, {
          extend_day: Number(form.extend_day),
        });
        setNotice('Stay extended successfully.');
      }

      setActionTarget(null);
      setActionType(null);
      await refreshDashboard();
    } catch (submitError) {
      setFormErrors({
        ...(submitError.errors || {}),
        form: submitError.errors ? undefined : submitError.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCheckout = async () => {
    if (!checkoutTarget) return;

    setCheckingOut(true);

    try {
      await apiPost(`/api/transactions/${checkoutTarget.id}/checkout`);
      setNotice(`${formatCustomerName(checkoutTarget.customer_name) || 'Guest'} checked out successfully.`);
      setCheckoutTarget(null);
      await refreshDashboard();
    } catch (checkoutError) {
      setError(checkoutError.message || 'Unable to check out guest.');
      setCheckoutTarget(null);
    } finally {
      setCheckingOut(false);
    }
  };

  const extendFields = [
    {
      name: 'extend_day',
      label: 'Extend day',
      type: 'number',
      required: true,
      min: 1,
      helperText: '30 days or more uses monthly rate (rate × 30 − 500).',
    },
  ];

  if (loading) {
    return (
      <Box className="dashboard-tx-card dashboard-loading">
        <CircularProgress size={32} />
        <Typography>Loading transactions...</Typography>
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
            <span className="dashboard-tx-heading-icon"><ReceiptLongOutlined /></span>
            <Box>
              <Typography className="dashboard-tx-title">Transactions</Typography>
              <Typography className="dashboard-tx-subtitle">
                {pagination.total.toLocaleString()} records · active guest stays and history
              </Typography>
            </Box>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <TextField
              className="dashboard-tx-search"
              placeholder="Search guest, room, bed, or ID..."
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
              className="dashboard-add-btn dashboard-tx-add-btn"
              startIcon={<Add />}
              onClick={() => setCreateOpen(true)}
            >
              Add Transaction
            </Button>
          </Stack>
        </Box>

        {!items.length ? (
          <Box className="dashboard-empty-state">
            <Typography className="dashboard-empty-title">No transactions found</Typography>
            <Typography className="dashboard-empty-copy">
              There are no active check-ins for your branch.
            </Typography>
            <Button
              variant="contained"
              className="dashboard-add-btn dashboard-tx-add-btn"
              startIcon={<Add />}
              onClick={() => setCreateOpen(true)}
              sx={{ mt: 2 }}
            >
              Add Transaction
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
                    <TableCell className="col-sticky-left">ID</TableCell>
                    <TableCell className="col-sticky-left col-customer">Guest</TableCell>
                    <TableCell>Room / Bed</TableCell>
                    <TableCell align="right">Days</TableCell>
                    <TableCell align="right">Rate</TableCell>
                    <TableCell align="right">Paid</TableCell>
                    <TableCell align="right">Final</TableCell>
                    <TableCell>Check-in</TableCell>
                    <TableCell>Expected out</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right" className="col-sticky-right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow
                      hover
                      key={item.id}
                      className={item.is_overdue ? 'is-overdue' : undefined}
                    >
                      <TableCell className="col-sticky-left dashboard-tx-cell-id">
                        {item.unique_id ?? item.id}
                      </TableCell>
                      <TableCell className="col-sticky-left col-customer">
                        <Typography className="dashboard-tx-guest-name">
                          {formatCustomerName(item.customer_name)}
                        </Typography>
                        {item.is_overdue && (
                          <span className="dashboard-tx-overdue-badge">Overdue</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography className="dashboard-tx-room">{item.room_name ?? '—'}</Typography>
                        <Typography className="dashboard-tx-bed">{item.bed_name ?? '—'}</Typography>
                      </TableCell>
                      <TableCell align="right" className="dashboard-tx-cell-num">
                        <span>{formatDay(item.no_day)}</span>
                        {item.extend_day ? (
                          <span className="dashboard-tx-extend">+{formatDay(item.extend_day)}</span>
                        ) : null}
                      </TableCell>
                      <TableCell align="right" className="dashboard-tx-cell-money">
                        {formatMoney(item.rates)}
                      </TableCell>
                      <TableCell align="right" className="dashboard-tx-cell-money">
                        {formatMoney(item.amount)}
                      </TableCell>
                      <TableCell align="right" className="dashboard-tx-cell-money is-strong">
                        {formatMoney(item.final_amount)}
                      </TableCell>
                      <TableCell className="dashboard-tx-cell-date">
                        {formatShortDate(item.login)}
                      </TableCell>
                      <TableCell className={`dashboard-tx-cell-date ${item.is_overdue ? 'is-overdue' : ''}`}>
                        {item.expected_out ? formatShortDate(item.expected_out) : '—'}
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5} alignItems="flex-start" className="dashboard-tx-status-cell">
                          <StatusBadge status={item.status} label={item.status_label} />
                          <ContinueBadge isContinue={item.isContinue} label={item.is_continue_label} />
                        </Stack>
                      </TableCell>
                      <TableCell align="right" className="col-sticky-right dashboard-actions-cell">
                        {item.status === '1' ? (
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
                                onClick={() => openActionDialog('extend', item)}
                              >
                                <Add fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Switch room / bed">
                              <IconButton
                                className="dashboard-tx-action is-switch"
                                aria-label={`Switch room for ${item.customer_name}`}
                                onClick={() => setSwitchTarget(item)}
                              >
                                <SwapHoriz fontSize="small" />
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
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Box>

      <TransactionFormDialog
        open={Boolean(actionTarget && actionType === 'extend')}
        title={`Extend stay · ${formatCustomerName(actionTarget?.customer_name) ?? ''}`}
        form={form}
        errors={formErrors}
        saving={saving}
        fields={extendFields}
        onClose={closeActionDialog}
        onChange={updateField}
        onSubmit={handleActionSubmit}
      />

      <Dialog open={Boolean(checkoutTarget)} onClose={() => !checkingOut && setCheckoutTarget(null)} maxWidth="xs" fullWidth className="dashboard-dialog">
        <DialogTitle>Check out guest</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Check out
            {' '}
            <strong>{formatCustomerName(checkoutTarget?.customer_name)}</strong>
            {' '}
            from
            {' '}
            <strong>{checkoutTarget?.bed_name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This marks the transaction as out and frees the bed.
          </Typography>
        </DialogContent>
        <DialogActions className="dashboard-dialog-actions">
          <Button onClick={() => setCheckoutTarget(null)} disabled={checkingOut}>Cancel</Button>
          <Button color="primary" variant="contained" onClick={handleCheckout} disabled={checkingOut}>
            {checkingOut ? 'Checking out...' : 'Check out'}
          </Button>
        </DialogActions>
      </Dialog>

      <SwitchTransactionDialog
        open={Boolean(switchTarget)}
        transaction={switchTarget}
        onClose={() => setSwitchTarget(null)}
        onSwitched={async (message) => {
          setNotice(message);
          await refreshDashboard();
        }}
      />

      <AddTransactionDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async (message) => {
          setNotice(message);
          await refreshDashboard();
        }}
      />
    </>
  );
}
