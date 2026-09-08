import { useCallback, useEffect, useRef, useState } from 'react';
import { HistoryOutlined, Search } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
import { apiGet } from '../../config/api';

function todayInputValue() {
  return new Date().toLocaleDateString('en-CA');
}

function formatMoney(value) {
  if (value == null || value === '') return '0.00';

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

function formatDisplayDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildPanelTitle(dateStart, dateEnd) {
  const today = todayInputValue();

  if (dateStart === today && dateEnd === today) {
    return `Transaction Details (Walkin) Today (${formatDisplayDate(dateStart)})`;
  }

  if (dateStart === dateEnd) {
    return `Transaction Details (Walkin) (${formatDisplayDate(dateStart)})`;
  }

  return `Transaction Details (Walkin) (${formatDisplayDate(dateStart)} – ${formatDisplayDate(dateEnd)})`;
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

export default function WalkInTransactionDetailsPanel({ refreshKey = 0 }) {
  const initialLoadRef = useRef(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [dateStart, setDateStart] = useState(() => todayInputValue());
  const [dateEnd, setDateEnd] = useState(() => todayInputValue());
  const [appliedDateStart, setAppliedDateStart] = useState(() => todayInputValue());
  const [appliedDateEnd, setAppliedDateEnd] = useState(() => todayInputValue());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
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
        per_page: String(perPage),
        date_start: appliedDateStart,
        date_end: appliedDateEnd,
      });

      if (debouncedQuery) {
        params.set('search', debouncedQuery);
      }

      const response = await apiGet(`/api/dashboard/walkin-transaction-details?${params.toString()}`);
      const payload = response.data || {};

      setItems(Array.isArray(payload.data) ? payload.data : []);
      setPagination({
        current_page: payload.current_page || requestPage,
        per_page: payload.per_page || perPage,
        total: payload.total || 0,
        last_page: payload.last_page || 1,
      });
    } catch (loadError) {
      setError(loadError.message || 'Unable to load walk-in transaction details.');
    } finally {
      initialLoadRef.current = false;
      setLoading(false);
      setTableLoading(false);
    }
  }, [appliedDateEnd, appliedDateStart, debouncedQuery, page, perPage]);

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

  const handleSearchDates = () => {
    setAppliedDateStart(dateStart);
    setAppliedDateEnd(dateEnd);
    setPage(1);
  };

  const handlePerPageChange = (event) => {
    setPerPage(Number(event.target.value));
    setPage(1);
  };

  if (loading) {
    return (
      <Box className="dashboard-tx-card dashboard-loading dashboard-tx-details-card">
        <CircularProgress size={32} />
        <Typography>Loading walk-in transaction details...</Typography>
      </Box>
    );
  }

  return (
    <Box className="dashboard-tx-card dashboard-tx-details-card">
      <Box className="dashboard-tx-toolbar dashboard-tx-details-toolbar">
        <Box className="dashboard-tx-heading">
          <span className="dashboard-tx-heading-icon"><HistoryOutlined /></span>
          <Box>
            <Typography className="dashboard-tx-title">
              {buildPanelTitle(appliedDateStart, appliedDateEnd)}
            </Typography>
            <Typography className="dashboard-tx-subtitle">
              Walk-in activity log for login, extend, and logout events
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box className="dashboard-tx-date-filter">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'flex-end' }}>
          <TextField
            label="Date Start"
            type="date"
            value={dateStart}
            onChange={(event) => setDateStart(event.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
          />
          <TextField
            label="Date End"
            type="date"
            value={dateEnd}
            onChange={(event) => setDateEnd(event.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
          />
          <Button variant="contained" className="dashboard-tx-date-search-btn" onClick={handleSearchDates}>
            Search
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" className="dashboard-notice" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box className="dashboard-tx-details-controls">
        <TextField
          select
          size="small"
          label="Show"
          value={perPage}
          onChange={handlePerPageChange}
          className="dashboard-tx-per-page"
        >
          {[10, 25, 50, 100].map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        <Typography component="span" className="dashboard-tx-per-page-label">entries</Typography>

        <TextField
          className="dashboard-tx-search dashboard-tx-details-search"
          placeholder="Search"
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
      </Box>

      {!items.length ? (
        <Box className="dashboard-empty-state">
          <Typography className="dashboard-empty-title">No walk-in details found</Typography>
          <Typography className="dashboard-empty-copy">
            Try adjusting the date range or search term.
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer className={`dashboard-tx-table-wrap ${tableLoading ? 'is-loading' : ''}`}>
            {tableLoading && (
              <Box className="dashboard-table-loading">
                <CircularProgress size={24} />
              </Box>
            )}
            <Table size="small" stickyHeader className="dashboard-tx-table dashboard-tx-details-table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Hour</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Date Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow hover key={item.id}>
                    <TableCell className="dashboard-tx-guest-name">{item.customer_name ?? '—'}</TableCell>
                    <TableCell>
                      <span className={`dashboard-tx-detail-status is-status-${item.status}`}>
                        {item.status_label ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell align="right" className="dashboard-tx-cell-num">{item.hours ?? 0}</TableCell>
                    <TableCell align="right" className="dashboard-tx-cell-money">{formatMoney(item.amount)}</TableCell>
                    <TableCell className="dashboard-tx-cell-date">{formatDateTime(item.created_at)}</TableCell>
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
  );
}
