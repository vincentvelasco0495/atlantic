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
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { apiGet, apiPost } from '../../config/api';

const emptyForm = {
  customer_id: '',
  room_id: '',
  bed_id: '',
  room_rate: '',
  previous_room_rate: '',
  no_day: '',
};

function formatRate(value) {
  if (value == null || value === '') return '';
  return Number(value).toFixed(2);
}

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

export default function AddTransactionDialog({ open, onClose, onCreated }) {
  const [options, setOptions] = useState({ customers: [], rooms: [], customers_total: 0 });
  const [beds, setBeds] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasRemainingBalance, setHasRemainingBalance] = useState(false);
  const [upgradePenalty, setUpgradePenalty] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const customerSearchTimerRef = useRef(null);
  const autoFillCustomerRef = useRef(null);
  const remainingDaysRef = useRef(null);

  const selectedRoom = useMemo(
    () => options.rooms.find((room) => String(room.id) === String(form.room_id)) ?? null,
    [form.room_id, options.rooms],
  );

  const selectedBed = useMemo(
    () => beds.find((bed) => String(bed.id) === String(form.bed_id)) ?? null,
    [beds, form.bed_id],
  );

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
        ? `/api/transactions/form-options?${params.toString()}`
        : '/api/transactions/form-options';
      const response = await apiGet(path);

      setOptions((current) => ({
        ...current,
        customers: response.data?.customers || [],
        customers_total: response.data?.customers_total ?? current.customers_total,
      }));
    } catch (loadError) {
      setErrors({ form: loadError.message || 'Unable to search customers.' });
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
        const response = await apiGet('/api/transactions/form-options');
        if (active) {
          setOptions({
            customers: response.data?.customers || [],
            rooms: response.data?.rooms || [],
            customers_total: response.data?.customers_total || 0,
          });
        }
      } catch (loadError) {
        if (active) {
          setErrors({ form: loadError.message || 'Unable to load transaction form.' });
        }
      } finally {
        if (active) {
          setLoadingOptions(false);
        }
      }
    }

    setForm(emptyForm);
    setBeds([]);
    setHasRemainingBalance(false);
    setUpgradePenalty(0);
    setSelectedCustomer(null);
    autoFillCustomerRef.current = null;
    remainingDaysRef.current = null;
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
    if (!open || !form.customer_id) return undefined;

    let active = true;

    async function loadPreview() {
      setLoadingPreview(true);

      try {
        const params = new URLSearchParams({
          customer_id: String(form.customer_id),
        });

        if (form.room_id) {
          params.set('room_id', String(form.room_id));
        }

        const response = await apiGet(`/api/transactions/form-preview?${params.toString()}`);

        if (!active) return;

        const preview = response.data || {};
        const usingBalance = Boolean(preview.has_remaining_balance);

        if (usingBalance && preview.no_day != null && remainingDaysRef.current === null) {
          remainingDaysRef.current = String(preview.no_day);
        }

        const lockedRemainingDays = remainingDaysRef.current;
        const hasBalance = lockedRemainingDays !== null;
        const shouldAutoFill = hasBalance
          && preview.suggested_room_id
          && autoFillCustomerRef.current !== String(form.customer_id);

        if (shouldAutoFill) {
          autoFillCustomerRef.current = String(form.customer_id);
        }

        setBeds(Array.isArray(preview.beds) ? preview.beds : []);
        setHasRemainingBalance(hasBalance);
        setUpgradePenalty(Number(preview.upgrade_penalty ?? 0));
        setForm((current) => {
          const nextRoomId = shouldAutoFill
            ? String(preview.suggested_room_id)
            : current.room_id;
          const roomChanged = current.room_id && String(current.room_id) !== String(nextRoomId);

          return {
            ...current,
            room_id: nextRoomId,
            room_rate: preview.room_rate != null ? formatRate(preview.room_rate) : current.room_rate,
            previous_room_rate: formatRate(preview.previous_room_rate ?? 0),
            no_day: hasBalance ? lockedRemainingDays : current.no_day,
            bed_id: shouldAutoFill && preview.suggested_bed_id
              ? String(preview.suggested_bed_id)
              : roomChanged
                ? ''
                : current.bed_id,
          };
        });
      } catch (previewError) {
        if (active) {
          setErrors({ form: previewError.message || 'Unable to load transaction details.' });
        }
      } finally {
        if (active) {
          setLoadingPreview(false);
        }
      }
    }

    loadPreview();

    return () => {
      active = false;
    };
  }, [open, form.customer_id, form.room_id]);

  const updateField = (name, value) => {
    setForm((current) => {
      const next = { ...current, [name]: value };

      if (name === 'room_id') {
        next.bed_id = '';
        const selected = options.rooms.find((room) => String(room.id) === String(value));
        next.room_rate = selected?.rate != null ? formatRate(selected.rate) : '';
      }

      if (name === 'customer_id') {
        next.room_id = '';
        next.bed_id = '';
        next.room_rate = '';
        next.no_day = '';
        autoFillCustomerRef.current = null;
        remainingDaysRef.current = null;
        setHasRemainingBalance(false);
        setUpgradePenalty(0);
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
      await apiPost('/api/transactions', {
        customer_id: Number(form.customer_id),
        bed_id: Number(form.bed_id),
        no_day: Number(form.no_day || 0),
        rates: Number(form.room_rate || 0),
        amount: 0,
        isContinue: hasRemainingBalance ? 1 : 0,
        login: new Date().toISOString(),
      });

      onCreated?.('Transaction created successfully.');
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

  const bedHelperText = errors.bed_id?.[0]
    || (form.room_id && !loadingPreview && !beds.length ? 'No available beds in this room.' : undefined);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" className="dashboard-dialog dashboard-tx-create-dialog">
      <DialogTitle className="dashboard-tx-create-title">
        Add New Transaction
        <IconButton aria-label="Close dialog" onClick={handleClose} disabled={saving}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent className="dashboard-dialog-content dashboard-tx-create-content">
          {errors.form && <Alert severity="error" sx={{ mb: 2 }}>{errors.form}</Alert>}

          {loadingOptions ? (
            <Box className="dashboard-dialog-loading">
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Stack spacing={0} className="dashboard-tx-create-fields">
              <SearchSelect
                label="Customer Name"
                placeholder="Search by name, SIRB, or mobile..."
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
                  || `${options.customers_total.toLocaleString()} active customers · type to search all records`
                }
                noOptionsText="No customers found"
              />

              <SearchSelect
                label="Room"
                placeholder="Search room..."
                options={options.rooms}
                value={selectedRoom}
                onChange={(room) => updateField('room_id', room?.id ?? '')}
                getOptionLabel={(room) => room.name}
                disabled={!form.customer_id}
                required
                error={errors.room_id?.[0]}
                helperText={
                  errors.room_id?.[0]
                  || (hasRemainingBalance && form.room_id ? 'Auto-filled from prepaid balance room.' : undefined)
                }
                noOptionsText="No rooms found"
              />

              <TextField
                label="Room rates"
                fullWidth
                value={form.room_rate}
                InputProps={{ readOnly: true }}
                className="dashboard-tx-readonly-field"
              />

              <SearchSelect
                label="Bed"
                placeholder="Search bed..."
                options={beds}
                value={selectedBed}
                onChange={(bed) => updateField('bed_id', bed?.id ?? '')}
                getOptionLabel={(bed) => bed.name}
                disabled={!form.room_id || loadingPreview}
                loading={loadingPreview}
                required
                error={errors.bed_id?.[0]}
                helperText={
                  errors.bed_id?.[0]
                  || bedHelperText
                  || (hasRemainingBalance && form.bed_id ? 'Auto-filled from previous stay bed.' : undefined)
                }
                noOptionsText={form.room_id ? 'No available beds in this room' : 'Select a room first'}
              />

              <TextField
                label="Number of day"
                type="number"
                fullWidth
                required
                value={form.no_day}
                onChange={(event) => updateField('no_day', event.target.value)}
                inputProps={{ min: 1, step: 1, readOnly: hasRemainingBalance }}
                disabled={!form.customer_id || loadingPreview || hasRemainingBalance}
                className={hasRemainingBalance ? 'dashboard-tx-readonly-field' : undefined}
                helperText={
                  hasRemainingBalance
                    ? 'Using customer prepaid balance days. Room changes will not update this value.'
                    : 'Enter the number of days for this stay.'
                }
              />

              <TextField
                label="Previous Room Rate"
                fullWidth
                value={form.previous_room_rate}
                InputProps={{ readOnly: true }}
                className="dashboard-tx-readonly-field"
              />

              {upgradePenalty > 0 && (
                <Alert severity="warning" className="dashboard-tx-upgrade-penalty">
                  Room upgrade penalty: ₱{upgradePenalty.toFixed(2)} ({form.no_day} prepaid day(s) × higher rate)
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions className="dashboard-dialog-actions dashboard-tx-create-actions">
          <Button onClick={handleClose} disabled={saving}>Close</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving || loadingOptions || !form.customer_id || !form.room_id || !form.bed_id || !form.no_day}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
