import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircleOutline, CloseOutlined, EventAvailableOutlined, Search } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Typography,
} from '@mui/material';
import { apiGet, apiPost } from '../../config/api';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: '0', label: 'Pending' },
  { value: '1', label: 'Approved' },
  { value: '2', label: 'Rejected' },
  { value: '3', label: 'Cancelled' },
];

function formatMoney(value) {
  if (value == null || value === '') return '—';

  return `₱${Number(value).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const MANILA_TZ = 'Asia/Manila';

function formatDateTime(value) {
  if (!value) return '—';

  try {
    return new Intl.DateTimeFormat('en-PH', {
      timeZone: MANILA_TZ,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

function formatCheckInParts(value) {
  if (!value) {
    return { date: '—', time: '' };
  }

  try {
    const parsed = new Date(value);

    return {
      date: new Intl.DateTimeFormat('en-PH', {
        timeZone: MANILA_TZ,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(parsed),
      time: new Intl.DateTimeFormat('en-PH', {
        timeZone: MANILA_TZ,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(parsed),
    };
  } catch {
    return { date: String(value), time: '' };
  }
}

function formatCustomerName(name) {
  if (!name) return '—';

  return name
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusChip(status, label) {
  const color = {
    0: 'warning',
    1: 'success',
    2: 'error',
    3: 'default',
  }[status] || 'default';

  return <Chip size="small" color={color} label={label || 'Pending'} />;
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
            <Typography key={pageNumber} className="dashboard-pagination-ellipsis">…</Typography>
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

export default function ReservationsPanel() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('0');
  const [confirmAction, setConfirmAction] = useState(null);
  const [approvalPreview, setApprovalPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const searchTimer = useRef(null);

  const loadReservations = useCallback(async (nextPage = page, nextSearch = search, nextStatus = statusFilter) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        per_page: '10',
      });

      if (nextSearch.trim()) {
        params.set('search', nextSearch.trim());
      }

      if (nextStatus !== 'all') {
        params.set('status', nextStatus);
      }

      const response = await apiGet(`/api/reservations/manage?${params.toString()}`);
      setRows(response.data?.data || []);
      setPage(response.data?.current_page || 1);
      setLastPage(response.data?.last_page || 1);
      setTotal(response.data?.total || 0);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load reservations.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);

    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    searchTimer.current = setTimeout(() => {
      setPage(1);
      loadReservations(1, value, statusFilter);
    }, 350);
  };

  const handleStatusChange = (event) => {
    const value = event.target.value;
    setStatusFilter(value);
    setPage(1);
    loadReservations(1, search, value);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    loadReservations(nextPage, search, statusFilter);
  };

  const openApproveDialog = async (reservation) => {
    setConfirmAction({ type: 'approve', reservation });
    setApprovalPreview(null);
    setPreviewLoading(true);

    try {
      const response = await apiGet(`/api/reservations/${reservation.id}/approval-preview`);
      setApprovalPreview(response.data || null);
    } catch (previewError) {
      setApprovalPreview({
        can_approve: false,
        available_beds_count: 0,
        available_beds: [],
        error: previewError.message || 'Unable to check bed availability.',
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const closeConfirmDialog = () => {
    if (actionLoading) return;
    setConfirmAction(null);
    setApprovalPreview(null);
    setPreviewLoading(false);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    setActionLoading(true);
    setError('');
    setNotice('');

    try {
      const endpoint = confirmAction.type === 'approve'
        ? `/api/reservations/${confirmAction.reservation.id}/approve`
        : `/api/reservations/${confirmAction.reservation.id}/reject`;

      const response = await apiPost(endpoint, {});

      if (confirmAction.type === 'approve') {
        const reference = response.data?.transaction?.reference;
        setNotice(reference
          ? `Reservation approved. Transaction ${reference} created.`
          : 'Reservation approved.');
      } else {
        setNotice('Reservation rejected.');
      }

      setConfirmAction(null);
      setApprovalPreview(null);
      await loadReservations(page, search, statusFilter);
    } catch (actionError) {
      setError(actionError.message || 'Unable to update reservation.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      {error && (
        <Alert severity="error" className="dashboard-notice" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {notice && (
        <Alert severity="success" className="dashboard-notice" onClose={() => setNotice('')}>
          {notice}
        </Alert>
      )}

      <Box className="dashboard-tx-card dashboard-reservations-card">
        <Box className="dashboard-tx-toolbar dashboard-reservations-toolbar">
          <Box className="dashboard-tx-heading">
            <span className="dashboard-tx-heading-icon"><EventAvailableOutlined /></span>
            <Box>
              <Typography className="dashboard-tx-title">Reservation requests</Typography>
              <Typography className="dashboard-tx-subtitle">
                {total.toLocaleString()} record{total === 1 ? '' : 's'} · review and approve customer applications
              </Typography>
            </Box>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            className="dashboard-reservations-filters"
          >
            <TextField
              size="small"
              placeholder="Search customer, SIRB, or room..."
              value={search}
              onChange={handleSearchChange}
              className="dashboard-tx-search dashboard-reservations-search"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={handleStatusChange}
              className="dashboard-reservations-status-filter"
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>

        {loading ? (
          <Box className="dashboard-loading dashboard-reservations-loading">
            <CircularProgress size={28} />
            <Typography>Loading reservations...</Typography>
          </Box>
        ) : !rows.length ? (
          <Box className="dashboard-empty-state dashboard-reservations-empty">
            <EventAvailableOutlined />
            <Typography className="dashboard-empty-title">No reservations found</Typography>
            <Typography className="dashboard-empty-copy">
              Pending customer requests will appear here for review.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer className="dashboard-tx-table-wrap dashboard-reservations-table-wrap">
              <Table size="small" className="dashboard-tx-table dashboard-reservations-table">
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Branch</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Available beds</TableCell>
                    <TableCell>Check-in (MNL)</TableCell>
                    <TableCell>Stay</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right" className="dashboard-reservations-actions-head">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    const checkIn = formatCheckInParts(row.preferred_check_in);

                    return (
                      <TableRow key={row.id} hover>
                        <TableCell className="dashboard-reservations-customer-cell">
                          <Typography className="dashboard-reservations-customer-name">
                            {formatCustomerName(row.customer?.name)}
                          </Typography>
                          <Typography className="dashboard-reservations-customer-meta">
                            {row.customer?.sirb_no || row.customer?.email || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>{row.type_label || '—'}</TableCell>
                        <TableCell>{row.location?.name || '—'}</TableCell>
                        <TableCell>{row.room?.name || '—'}</TableCell>
                        <TableCell>
                          {row.status === 0 ? (
                            <Chip
                              size="small"
                              color={(row.available_beds_count ?? 0) > 0 ? 'success' : 'error'}
                              variant="outlined"
                              label={`${row.available_beds_count ?? 0} bed(s)`}
                            />
                          ) : (
                            <Typography className="dashboard-tx-muted">—</Typography>
                          )}
                        </TableCell>
                        <TableCell className="dashboard-reservations-date-cell">
                          <Typography className="dashboard-reservations-date">{checkIn.date}</Typography>
                          {checkIn.time && (
                            <Typography className="dashboard-reservations-date-time">{checkIn.time}</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {row.type === 'walkin'
                            ? `${row.hours || '—'} hr(s)`
                            : `${row.no_day || '—'} day(s)`}
                        </TableCell>
                        <TableCell align="right" className="dashboard-tx-cell-money is-strong">
                          {formatMoney(row.estimated_amount)}
                        </TableCell>
                        <TableCell>{statusChip(row.status, row.status_label)}</TableCell>
                        <TableCell align="right" className="dashboard-reservations-actions-cell">
                          {row.status === 0 ? (
                            <Box className="dashboard-reservations-actions">
                              <Button
                                size="small"
                                color="success"
                                variant="outlined"
                                startIcon={<CheckCircleOutline />}
                                disabled={(row.available_beds_count ?? 0) < 1}
                                onClick={() => openApproveDialog(row)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                startIcon={<CloseOutlined />}
                                onClick={() => {
                                  setApprovalPreview(null);
                                  setConfirmAction({ type: 'reject', reservation: row });
                                }}
                              >
                                Reject
                              </Button>
                            </Box>
                          ) : (
                            <Typography className="dashboard-tx-muted">—</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              page={page}
              lastPage={lastPage}
              total={total}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </Box>

      <Dialog
        open={Boolean(confirmAction)}
        onClose={closeConfirmDialog}
        maxWidth="sm"
        fullWidth
        className="dashboard-reservations-dialog"
      >
        <DialogTitle>
          {confirmAction?.type === 'approve' ? 'Approve reservation' : 'Reject reservation'}
        </DialogTitle>
        <DialogContent className="dashboard-dialog-content">
          {confirmAction && (
            <Stack spacing={1.5}>
              <Typography>
                {confirmAction.type === 'approve'
                  ? 'This will approve the reservation and automatically create the corresponding transaction with an available bed in the reserved room.'
                  : 'This will mark the reservation as rejected. No transaction will be created.'}
              </Typography>
              <Typography><strong>Customer:</strong> {formatCustomerName(confirmAction.reservation.customer?.name)}</Typography>
              <Typography><strong>Type:</strong> {confirmAction.reservation.type_label}</Typography>
              <Typography><strong>Branch:</strong> {confirmAction.reservation.location?.name || '—'}</Typography>
              <Typography><strong>Room:</strong> {confirmAction.reservation.room?.name || '—'}</Typography>
              <Typography>
                <strong>Check-in (Asia/Manila):</strong> {formatDateTime(confirmAction.reservation.preferred_check_in)}
              </Typography>

              {confirmAction.type === 'approve' && (
                previewLoading ? (
                  <Box className="dashboard-reservations-preview-loading">
                    <CircularProgress size={20} />
                    <Typography>Checking available beds in this room...</Typography>
                  </Box>
                ) : approvalPreview?.error ? (
                  <Alert severity="error">{approvalPreview.error}</Alert>
                ) : (
                  <Alert severity={approvalPreview?.can_approve ? 'success' : 'warning'}>
                    {approvalPreview?.can_approve
                      ? `${approvalPreview.available_beds_count} available bed(s) in ${approvalPreview.room?.name || 'this room'}: ${(approvalPreview.available_beds || []).map((bed) => bed.name).join(', ')}`
                      : `No available bed in ${approvalPreview?.room?.name || confirmAction.reservation.room?.name || 'this room'} for the requested dates. The room may be fully occupied.`}
                  </Alert>
                )
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions className="dashboard-dialog-actions dashboard-reservations-dialog-actions">
          <Button onClick={closeConfirmDialog} disabled={actionLoading}>Cancel</Button>
          <Button
            variant="contained"
            color={confirmAction?.type === 'approve' ? 'success' : 'error'}
            onClick={handleConfirmAction}
            disabled={
              actionLoading
              || (confirmAction?.type === 'approve' && (previewLoading || !approvalPreview?.can_approve))
            }
          >
            {actionLoading
              ? 'Processing...'
              : confirmAction?.type === 'approve'
                ? 'Approve'
                : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
