import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Add, AccountBalanceWalletOutlined, AttachFileOutlined, DeleteOutline, EditOutlined, HistoryOutlined, Search, VpnKeyOutlined } from '@mui/icons-material';
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
import { apiDelete, apiGet, apiPost, apiPut } from '../../config/api';
import {
  buildOptionLabel,
  formatDateTime,
  getResourceItemLabel,
  mapFormToPayload,
  mapItemToForm,
  resourceConfigs,
} from '../../config/resources';
import CustomerActionDialogs from './CustomerActionDialogs';

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

function TablePagination({ page, lastPage, onPageChange }) {
  const pages = buildPageNumbers(page, lastPage);

  return (
    <Box className="dashboard-pagination">
      <Button
        className="dashboard-pagination-btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
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
      <Button
        className="dashboard-pagination-btn"
        disabled={page >= lastPage}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </Box>
  );
}

function renderCellValue(column, item) {
  const value = column.getValue(item);

  if (column.type === 'status') {
    return <StatusChip value={value} />;
  }

  if (column.type === 'datetime') {
    return <span className="dashboard-datetime-cell">{formatDateTime(value)}</span>;
  }

  return value ?? '—';
}

function StatusChip({ value }) {
  const active = value === 1 || value === '1';

  return (
    <Chip
      label={active ? 'Active' : 'Inactive'}
      size="small"
      className={`dashboard-status-chip ${active ? 'is-active' : 'is-inactive'}`}
    />
  );
}

function CustomerCredentialsDialog({
  open,
  customer,
  form,
  errors,
  saving,
  onClose,
  onChange,
  onSubmit,
}) {
  const hasAccount = Boolean(customer?.user?.email);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" className="dashboard-dialog">
      <DialogTitle>{hasAccount ? 'Update seafarer login' : 'Create seafarer login'}</DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent className="dashboard-dialog-content">
          {errors.form && <Alert severity="error" sx={{ mb: 2 }}>{errors.form}</Alert>}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {hasAccount
              ? 'Update the email and optionally set a new password for this seafarer.'
              : 'Create login credentials so this seafarer can sign in to the site.'}
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              value={form.email}
              onChange={(event) => onChange('email', event.target.value)}
              error={Boolean(errors.email)}
              helperText={errors.email?.[0]}
            />
            <TextField
              label={hasAccount ? 'New password' : 'Password'}
              type="password"
              required={!hasAccount}
              fullWidth
              value={form.password}
              onChange={(event) => onChange('password', event.target.value)}
              error={Boolean(errors.password)}
              helperText={errors.password?.[0] || (hasAccount ? 'Leave blank to keep the current password.' : 'Minimum 8 characters.')}
            />
            <TextField
              label="Confirm password"
              type="password"
              required={!hasAccount || Boolean(form.password)}
              fullWidth
              value={form.password_confirmation}
              onChange={(event) => onChange('password_confirmation', event.target.value)}
              error={Boolean(errors.password_confirmation)}
              helperText={errors.password_confirmation?.[0]}
            />
          </Stack>
        </DialogContent>
        <DialogActions className="dashboard-dialog-actions">
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : hasAccount ? 'Save login' : 'Create login'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

function ResourceFormField({ field, form, errors, optionSets, onChange }) {
  return (
    <TextField
      label={field.label}
      type={field.type === 'number' ? 'number' : 'text'}
      select={field.type === 'select'}
      required={field.required}
      fullWidth
      multiline={Boolean(field.multiline)}
      minRows={field.multiline ? field.rows || 3 : undefined}
      value={form[field.name] ?? ''}
      onChange={(event) => onChange(field.name, event.target.value)}
      error={Boolean(errors[field.name])}
      helperText={errors[field.name]?.[0]}
      inputProps={field.step ? { step: field.step } : undefined}
      className={field.fullWidth ? 'dashboard-form-field-full' : undefined}
    >
      {field.type === 'select' && field.optional && (
        <MenuItem value="">None</MenuItem>
      )}
      {field.type === 'select' && (field.options || optionSets[field.optionSource] || []).map((option) => (
        <MenuItem value={option.value ?? option.id} key={option.value ?? option.id}>
          {option.label ?? buildOptionLabel(field.optionSource, option)}
        </MenuItem>
      ))}
    </TextField>
  );
}

function ResourceFormDialog({
  open,
  mode,
  config,
  form,
  errors,
  optionSets,
  saving,
  item,
  onClose,
  onChange,
  onSubmit,
}) {
  const formColumns = config.formColumns || 1;
  const dialogMaxWidth = formColumns > 1 ? 'md' : 'sm';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={dialogMaxWidth} className="dashboard-dialog">
      <DialogTitle>{mode === 'edit' ? `Edit ${config.singular}` : `Add ${config.singular}`}</DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent className="dashboard-dialog-content">
          {errors.form && <Alert severity="error" sx={{ mb: 2 }}>{errors.form}</Alert>}
          <Box
            className={`dashboard-form-grid ${formColumns > 1 ? 'is-two-column' : ''}`}
          >
            {config.fields.map((field) => (
              <Box
                key={field.name}
                className={`dashboard-form-grid-item ${field.fullWidth ? 'is-full-width' : ''}`}
              >
                <ResourceFormField
                  field={field}
                  form={form}
                  errors={errors}
                  optionSets={optionSets}
                  onChange={onChange}
                />
              </Box>
            ))}
            {mode === 'edit' && item && (
              <Box className="dashboard-audit-meta dashboard-form-grid-item is-full-width">
                <Typography variant="body2" color="text.secondary">
                  Created:
                  {' '}
                  {formatDateTime(item.created_at)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Updated:
                  {' '}
                  {formatDateTime(item.updated_at)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Updated by:
                  {' '}
                  {item.user?.name ?? '—'}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions className="dashboard-dialog-actions">
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : mode === 'edit' ? 'Save changes' : `Create ${config.singular.toLowerCase()}`}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function ResourceCrudPanel({ section }) {
  const config = resourceConfigs[section];
  const isPaginated = Boolean(config.pagination);
  const initialLoadRef = useRef(true);
  const [items, setItems] = useState([]);
  const [optionSets, setOptionSets] = useState({});
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: config.pagination?.perPage || 10,
    total: 0,
    last_page: 1,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [mode, setMode] = useState('create');
  const [activeItem, setActiveItem] = useState(null);
  const [form, setForm] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState('');
  const [credentialsTarget, setCredentialsTarget] = useState(null);
  const [credentialsForm, setCredentialsForm] = useState({
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [credentialsErrors, setCredentialsErrors] = useState({});
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [customerAction, setCustomerAction] = useState(null);

  const optionSources = useMemo(
    () => [...new Set(config.fields.map((field) => field.optionSource).filter(Boolean))],
    [config.fields],
  );

  const loadItems = useCallback(async (pageOverride) => {
    const requestPage = pageOverride ?? page;

    if (initialLoadRef.current) {
      setLoading(true);
    } else if (isPaginated) {
      setTableLoading(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      let path = `/api/${config.apiPath}`;

      if (isPaginated) {
        const params = new URLSearchParams({
          page: String(requestPage),
          per_page: String(config.pagination.perPage),
        });

        if (debouncedQuery) {
          params.set('search', debouncedQuery);
        }

        path = `${path}?${params.toString()}`;
      }

      const response = await apiGet(path);

      if (isPaginated) {
        const payload = response.data || {};
        setItems(Array.isArray(payload.data) ? payload.data : []);
        setPagination({
          current_page: payload.current_page || requestPage,
          per_page: payload.per_page || config.pagination.perPage,
          total: payload.total || 0,
          last_page: payload.last_page || 1,
        });
      } else {
        setItems(Array.isArray(response.data) ? response.data : response.data?.data || []);
      }
    } catch (loadError) {
      setError(loadError.message || `Unable to load ${config.plural.toLowerCase()}.`);
    } finally {
      initialLoadRef.current = false;
      setLoading(false);
      setTableLoading(false);
    }
  }, [config.apiPath, config.pagination, config.plural, debouncedQuery, isPaginated, page]);

  const loadOptions = useCallback(async () => {
    const paginatedSources = ['locations', 'rates', 'rooms'];

    const entries = await Promise.all(optionSources.map(async (source) => {
      const path = paginatedSources.includes(source) ? `/api/${source}?all=1` : `/api/${source}`;
      const response = await apiGet(path);
      const list = Array.isArray(response.data) ? response.data : response.data?.data || [];
      return [source, list];
    }));

    setOptionSets(Object.fromEntries(entries));
  }, [optionSources]);

  useEffect(() => {
    if (!isPaginated) return undefined;

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
  }, [isPaginated, query]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (optionSources.length) {
      loadOptions().catch(() => {});
    }
  }, [loadOptions, optionSources.length]);

  const filteredItems = useMemo(() => {
    if (isPaginated) {
      return items;
    }

    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;

    return items.filter((item) => config.columns.some(({ getValue }) => (
      String(getValue(item) ?? '').toLowerCase().includes(normalized)
    )));
  }, [config.columns, isPaginated, items, query]);

  const handleQueryChange = (value) => {
    setQuery(value);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  const reloadItems = async () => {
    if (isPaginated && items.length === 1 && page > 1) {
      setPage(page - 1);
      return;
    }

    await loadItems();
  };

  const openCreateDialog = () => {
    setMode('create');
    setActiveItem(null);
    setForm(mapItemToForm(config));
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setMode('edit');
    setActiveItem(item);
    setForm(mapItemToForm(config, item));
    setFormErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (!saving) {
      setDialogOpen(false);
    }
  };

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setFormErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormErrors({});

    try {
      const payload = mapFormToPayload(config, form);

      if (mode === 'edit' && activeItem) {
        await apiPut(`/api/${config.apiPath}/${activeItem.id}`, payload);
        setNotice(`${config.singular} updated successfully.`);
      } else {
        await apiPost(`/api/${config.apiPath}`, payload);
        setNotice(`${config.singular} created successfully.`);
      }

      setDialogOpen(false);
      await reloadItems();
    } catch (submitError) {
      setFormErrors({
        ...(submitError.errors || {}),
        form: submitError.errors ? undefined : submitError.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await apiDelete(`/api/${config.apiPath}/${deleteTarget.id}`);
      setNotice(`${config.singular} deleted successfully.`);
      setDeleteTarget(null);
      await reloadItems();
    } catch (deleteError) {
      setError(deleteError.message || `Unable to delete ${config.singular.toLowerCase()}.`);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const openCustomerAction = (type, item) => {
    setCustomerAction({ type, customer: item });
  };

  const closeCustomerAction = () => {
    setCustomerAction(null);
  };

  const openCredentialsDialog = (item) => {
    setCredentialsTarget(item);
    setCredentialsForm({
      email: item.user?.email ?? '',
      password: '',
      password_confirmation: '',
    });
    setCredentialsErrors({});
  };

  const closeCredentialsDialog = () => {
    if (!savingCredentials) {
      setCredentialsTarget(null);
    }
  };

  const updateCredentialsField = (name, value) => {
    setCredentialsForm((current) => ({ ...current, [name]: value }));
    setCredentialsErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
  };

  const handleCredentialsSubmit = async (event) => {
    event.preventDefault();
    if (!credentialsTarget) return;

    setSavingCredentials(true);
    setCredentialsErrors({});

    try {
      const payload = {
        email: credentialsForm.email,
      };

      if (!credentialsTarget.user?.email || credentialsForm.password) {
        payload.password = credentialsForm.password;
        payload.password_confirmation = credentialsForm.password_confirmation;
      }

      await apiPut(`/api/${config.apiPath}/${credentialsTarget.id}/credentials`, payload);
      setNotice(credentialsTarget.user?.email ? 'Login credentials updated successfully.' : 'Login credentials created successfully.');
      setCredentialsTarget(null);
      await reloadItems();
    } catch (submitError) {
      setCredentialsErrors({
        ...(submitError.errors || {}),
        form: submitError.errors ? undefined : submitError.message,
      });
    } finally {
      setSavingCredentials(false);
    }
  };

  if (loading) {
    return (
      <Box className="dashboard-card dashboard-loading">
        <CircularProgress size={32} />
        <Typography>Loading {config.plural.toLowerCase()}...</Typography>
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

      <Box className="dashboard-card dashboard-table-card">
        <Box className="dashboard-card-toolbar">
          <Box className="dashboard-card-toolbar-copy">
            <Typography className="dashboard-card-title">{config.plural}</Typography>
            <Typography className="dashboard-card-subtitle">
              {isPaginated
                ? `${pagination.total ? items.length : 0} of ${pagination.total} shown`
                : `${filteredItems.length} of ${items.length} shown`}
            </Typography>
          </Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            className="dashboard-toolbar-actions"
            sx={{ flexWrap: { sm: 'nowrap' } }}
          >
            <TextField
              className="dashboard-search"
              placeholder={`Search ${config.plural.toLowerCase()}...`}
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="contained" className="dashboard-add-btn" startIcon={<Add />} onClick={openCreateDialog}>
              Add {config.singular}
            </Button>
          </Stack>
        </Box>

        {!filteredItems.length ? (
          <Box className="dashboard-empty-state">
            <Typography className="dashboard-empty-title">No {config.plural.toLowerCase()} found</Typography>
            <Typography className="dashboard-empty-copy">
              Create your first {config.singular.toLowerCase()} to get started.
            </Typography>
            <Button variant="contained" className="dashboard-add-btn" startIcon={<Add />} onClick={openCreateDialog} sx={{ mt: 2 }}>
              Add {config.singular}
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer className={`dashboard-table-wrap ${tableLoading ? 'is-loading' : ''}`}>
              {tableLoading && (
                <Box className="dashboard-table-loading">
                  <CircularProgress size={24} />
                </Box>
              )}
              <Table>
                <TableHead>
                  <TableRow>
                    {config.columns.map((column) => (
                      <TableCell key={column.id}>{column.label}</TableCell>
                    ))}
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow hover key={item.id}>
                      {config.columns.map((column) => (
                        <TableCell key={column.id}>
                          {renderCellValue(column, item)}
                        </TableCell>
                      ))}
                      <TableCell align="right" className="dashboard-actions-cell">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end" className="dashboard-actions-stack">
                          {config.customerActions?.files && (
                            <Tooltip title="Files">
                              <IconButton
                                aria-label={`Files for ${getResourceItemLabel(config, item)}`}
                                onClick={() => openCustomerAction('files', item)}
                              >
                                <AttachFileOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {config.customerActions?.balance && (
                            <Tooltip title="Balance">
                              <IconButton
                                aria-label={`Balance for ${getResourceItemLabel(config, item)}`}
                                onClick={() => openCustomerAction('balance', item)}
                              >
                                <AccountBalanceWalletOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {config.customerActions?.history && (
                            <Tooltip title="History">
                              <IconButton
                                aria-label={`History for ${getResourceItemLabel(config, item)}`}
                                onClick={() => openCustomerAction('history', item)}
                              >
                                <HistoryOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {config.accountCredentials && (
                            <Tooltip title={item.user?.email ? 'Update login' : 'Create login'}>
                              <IconButton
                                aria-label={`Manage login for ${getResourceItemLabel(config, item)}`}
                                onClick={() => openCredentialsDialog(item)}
                              >
                                <VpnKeyOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <IconButton aria-label={`Edit ${config.singular}`} onClick={() => openEditDialog(item)}>
                            <EditOutlined fontSize="small" />
                          </IconButton>
                          <IconButton aria-label={`Delete ${config.singular}`} onClick={() => setDeleteTarget(item)}>
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {isPaginated && pagination.total > 0 && (
              <TablePagination
                page={pagination.current_page}
                lastPage={Math.max(pagination.last_page, 1)}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </Box>

      <ResourceFormDialog
        open={dialogOpen}
        mode={mode}
        config={config}
        form={form}
        errors={formErrors}
        optionSets={optionSets}
        saving={saving}
        item={activeItem}
        onClose={closeDialog}
        onChange={updateField}
        onSubmit={handleSubmit}
      />

      <CustomerActionDialogs
        action={customerAction}
        config={config}
        onClose={closeCustomerAction}
        onNotice={setNotice}
        onUpdated={reloadItems}
      />

      <CustomerCredentialsDialog
        open={Boolean(credentialsTarget)}
        customer={credentialsTarget}
        form={credentialsForm}
        errors={credentialsErrors}
        saving={savingCredentials}
        onClose={closeCredentialsDialog}
        onChange={updateCredentialsField}
        onSubmit={handleCredentialsSubmit}
      />

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth className="dashboard-dialog">
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Are you sure you want to delete
            {' '}
            <strong>{getResourceItemLabel(config, deleteTarget)}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will remove the {config.singular.toLowerCase()} from the list. The record is kept in the system and is not permanently erased.
          </Typography>
        </DialogContent>
        <DialogActions className="dashboard-dialog-actions">
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Yes, delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
