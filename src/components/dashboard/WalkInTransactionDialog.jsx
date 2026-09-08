import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { apiGet, apiPost } from '../../config/api';

const emptyForm = {
  customer_id: '',
  room_id: '',
  bed_id: '',
  transaction_type: '',
  custom_rate_id: '',
};

function SearchSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  getOptionLabel,
  onInputChange,
  filterOptions,
  disabled = false,
  loading = false,
  required = false,
  error,
  helperText,
  noOptionsText = 'No matches found',
}) {
  return (
    <Autocomplete
      className="dashboard-tx-autocomplete"
      options={options}
      value={value}
      onChange={(_, option) => onChange(option)}
      onInputChange={onInputChange}
      filterOptions={filterOptions}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      disabled={disabled}
      loading={loading}
      openOnFocus
      autoHighlight
      clearOnEscape
      noOptionsText={noOptionsText}
      ListboxProps={{ className: 'dashboard-tx-autocomplete-listbox' }}
      componentsProps={{
        paper: { className: 'dashboard-tx-autocomplete-paper' },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          placeholder={placeholder}
          error={Boolean(error)}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;

        return (
          <li key={key} {...optionProps} className="dashboard-tx-autocomplete-option">
            <span>{getOptionLabel(option)}</span>
          </li>
        );
      }}
    />
  );
}

export default function WalkInTransactionDialog({ open, onClose, onCreated }) {
  const [options, setOptions] = useState({
    customers: [],
    rooms: [],
    transaction_types: [],
    customers_total: 0,
  });
  const [beds, setBeds] = useState([]);
  const [rates, setRates] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingBeds, setLoadingBeds] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const customerSearchTimerRef = useRef(null);

  const canLoadBeds = Boolean(form.room_id);
  const canLoadRates = Boolean(form.room_id && form.transaction_type !== '');

  const customerOptions = useMemo(() => {
    if (!selectedCustomer) {
      return options.customers;
    }

    if (options.customers.some((customer) => customer.id === selectedCustomer.id)) {
      return options.customers;
    }

    return [selectedCustomer, ...options.customers];
  }, [options.customers, selectedCustomer]);

  const loadCustomers = async (search = '') => {
    setLoadingCustomers(true);

    try {
      const params = new URLSearchParams();
      if (search.trim()) {
        params.set('search', search.trim());
      }

      const path = params.toString()
        ? `/api/transactions/walkin/form-options?${params.toString()}`
        : '/api/transactions/walkin/form-options';
      const response = await apiGet(path);

      setOptions((current) => ({
        ...current,
        customers: response.data?.customers || [],
        customers_total: response.data?.customers_total ?? current.customers_total,
      }));
    } catch (loadError) {
      setErrors({ form: loadError.message || 'Unable to search walk-in customers.' });
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    if (!open) return undefined;

    let active = true;

    async function loadOptions() {
      setLoadingOptions(true);
      setErrors({});

      try {
        const response = await apiGet('/api/transactions/walkin/form-options');
        if (active) {
          setOptions({
            customers: response.data?.customers || [],
            rooms: response.data?.rooms || [],
            transaction_types: response.data?.transaction_types || [],
            customers_total: response.data?.customers_total || 0,
          });
        }
      } catch (loadError) {
        if (active) {
          setErrors({ form: loadError.message || 'Unable to load walk-in form.' });
        }
      } finally {
        if (active) {
          setLoadingOptions(false);
        }
      }
    }

    setForm(emptyForm);
    setBeds([]);
    setRates([]);
    setSelectedCustomer(null);
    loadOptions();

    return () => {
      active = false;
    };
  }, [open]);

  const handleCustomerSearch = (_, value, reason) => {
    if (reason !== 'input') {
      return;
    }

    window.clearTimeout(customerSearchTimerRef.current);
    customerSearchTimerRef.current = window.setTimeout(() => {
      loadCustomers(value);
    }, 300);
  };

  useEffect(() => () => {
    window.clearTimeout(customerSearchTimerRef.current);
  }, []);

  useEffect(() => {
    if (!open || !canLoadBeds) {
      setBeds([]);
      return undefined;
    }

    let active = true;

    async function loadBeds() {
      setLoadingBeds(true);

      try {
        const params = new URLSearchParams({
          room_id: String(form.room_id),
        });
        const response = await apiGet(`/api/transactions/walkin/form-preview?${params.toString()}`);

        if (!active) return;

        setBeds(Array.isArray(response.data?.beds) ? response.data.beds : []);
        setForm((current) => ({
          ...current,
          bed_id: '',
        }));
      } catch (previewError) {
        if (active) {
          setErrors({ form: previewError.message || 'Unable to load room beds.' });
        }
      } finally {
        if (active) {
          setLoadingBeds(false);
        }
      }
    }

    loadBeds();

    return () => {
      active = false;
    };
  }, [open, canLoadBeds, form.room_id]);

  useEffect(() => {
    if (!open || !canLoadRates) {
      setRates([]);
      return undefined;
    }

    let active = true;

    async function loadRates() {
      setLoadingRates(true);

      try {
        const params = new URLSearchParams({
          room_id: String(form.room_id),
          transaction_type: String(form.transaction_type),
        });
        const response = await apiGet(`/api/transactions/walkin/form-preview?${params.toString()}`);

        if (!active) return;

        setRates(Array.isArray(response.data?.rates) ? response.data.rates : []);
        setForm((current) => ({
          ...current,
          custom_rate_id: '',
        }));
      } catch (previewError) {
        if (active) {
          setErrors({ form: previewError.message || 'Unable to load rates.' });
        }
      } finally {
        if (active) {
          setLoadingRates(false);
        }
      }
    }

    loadRates();

    return () => {
      active = false;
    };
  }, [open, canLoadRates, form.room_id, form.transaction_type]);

  const updateField = (name, value) => {
    setForm((current) => {
      const next = { ...current, [name]: value };

      if (name === 'room_id') {
        next.bed_id = '';
        next.custom_rate_id = '';
      }

      if (name === 'transaction_type') {
        next.custom_rate_id = '';
      }

      return next;
    });
    setErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      await apiPost('/api/transactions/walkin', {
        customer_id: Number(form.customer_id),
        bed_id: Number(form.bed_id),
        transaction_type: Number(form.transaction_type),
        custom_rate_id: Number(form.custom_rate_id),
        login: new Date().toISOString(),
      });

      onCreated?.('Walk-in transaction created successfully.');
      onClose();
    } catch (submitError) {
      setErrors({
        ...(submitError.errors || {}),
        form: submitError.errors ? undefined : submitError.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  const bedHelperText = useMemo(() => {
    if (errors.bed_id?.[0]) return errors.bed_id[0];
    if (!canLoadBeds) return undefined;
    if (loadingBeds) return 'Loading beds...';
    if (!beds.length) return 'No available beds in this room.';
    return undefined;
  }, [beds.length, canLoadBeds, errors.bed_id, loadingBeds]);

  const rateHelperText = useMemo(() => {
    if (errors.custom_rate_id?.[0]) return errors.custom_rate_id[0];
    if (!canLoadRates) return 'Select a transaction type to load rates.';
    if (loadingRates) return 'Loading rates...';
    if (!rates.length) return 'No rates configured for this transaction type.';
    return undefined;
  }, [canLoadRates, errors.custom_rate_id, loadingRates, rates.length]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" className="dashboard-dialog dashboard-tx-create-dialog dashboard-walkin-dialog">
      <DialogTitle className="dashboard-tx-create-title">
        Add New Walk In Transaction
        <IconButton aria-label="Close dialog" onClick={handleClose} disabled={saving}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent className="dashboard-dialog-content dashboard-tx-create-content dashboard-walkin-content">
          {errors.form && <Alert severity="error" sx={{ mb: 2 }}>{errors.form}</Alert>}

          {loadingOptions ? (
            <Box className="dashboard-dialog-loading">
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Stack spacing={2.25} className="dashboard-walkin-fields">
              <SearchSelect
                label="Customer Name"
                placeholder="Search by name or ID presented..."
                options={customerOptions}
                value={selectedCustomer}
                onChange={(customer) => {
                  setSelectedCustomer(customer);
                  updateField('customer_id', customer?.id ?? '');
                }}
                onInputChange={handleCustomerSearch}
                filterOptions={(items) => items}
                loading={loadingCustomers}
                getOptionLabel={(customer) => customer.label}
                required
                error={errors.customer_id?.[0]}
                helperText={
                  errors.customer_id?.[0]
                  || `${options.customers_total.toLocaleString()} walk-in customers · type to search all records`
                }
                noOptionsText="No walk-in customers found"
              />

              <TextField
                select
                fullWidth
                required
                label="Room"
                value={form.room_id}
                onChange={(event) => updateField('room_id', event.target.value)}
                error={Boolean(errors.room_id?.[0])}
                helperText={errors.room_id?.[0] || 'Non-bedspace rooms only'}
              >
                <MenuItem value="">
                  <em>Select Room</em>
                </MenuItem>
                {options.rooms.map((room) => (
                  <MenuItem key={room.id} value={String(room.id)}>
                    {room.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                required
                label="Bed"
                value={form.bed_id}
                onChange={(event) => updateField('bed_id', event.target.value)}
                disabled={!canLoadBeds || loadingBeds}
                error={Boolean(errors.bed_id?.[0])}
                helperText={bedHelperText}
              >
                <MenuItem value="">
                  <em>Select Bed</em>
                </MenuItem>
                {beds.map((bed) => (
                  <MenuItem key={bed.id} value={String(bed.id)}>
                    {bed.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                required
                label="Transaction Type"
                value={form.transaction_type}
                onChange={(event) => updateField('transaction_type', event.target.value)}
                error={Boolean(errors.transaction_type?.[0])}
                helperText={errors.transaction_type?.[0]}
              >
                <MenuItem value="">
                  <em>Select Transaction Type</em>
                </MenuItem>
                {options.transaction_types.map((type) => (
                  <MenuItem key={type.value} value={String(type.value)}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                required
                label="Rates"
                value={form.custom_rate_id}
                onChange={(event) => updateField('custom_rate_id', event.target.value)}
                disabled={!canLoadRates || loadingRates}
                error={Boolean(errors.custom_rate_id?.[0])}
                helperText={rateHelperText}
              >
                <MenuItem value="">
                  <em>Select Rate</em>
                </MenuItem>
                {rates.map((rate) => (
                  <MenuItem key={rate.id} value={String(rate.id)}>
                    {rate.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          )}
        </DialogContent>

        <DialogActions className="dashboard-dialog-actions dashboard-tx-create-actions">
          <Button onClick={handleClose} disabled={saving}>Close</Button>
          <Button
            type="submit"
            variant="contained"
            className="dashboard-walkin-save-btn"
            disabled={
              saving
              || loadingOptions
              || !form.customer_id
              || !form.room_id
              || !form.bed_id
              || form.transaction_type === ''
              || !form.custom_rate_id
            }
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
