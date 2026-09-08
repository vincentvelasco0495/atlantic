import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { apiGet, apiPost } from '../config/api';
import { useAuthStore } from '../store/authStore';
import { Footer, useSectionReveal } from './HomeSections';

const RESERVATION_TYPES = {
  transaction: 'transaction',
  walkin: 'walkin',
};

const initialForm = {
  location_id: '',
  preferred_check_in: '',
  note: '',
  room_id: '',
  no_day: '5',
  transaction_type: '',
  custom_rate_id: '',
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

function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return null;
  }

  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function SearchSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  getOptionLabel,
  disabled = false,
  loading = false,
  required = false,
  error,
  helperText,
  noOptionsText = 'No matches found',
}) {
  return (
    <Autocomplete
      className="register-autocomplete"
      options={options}
      value={value}
      onChange={(_, option) => onChange(option)}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      disabled={disabled}
      loading={loading}
      openOnFocus
      autoHighlight
      clearOnEscape
      noOptionsText={noOptionsText}
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
          <li key={key} {...optionProps}>
            {getOptionLabel(option)}
          </li>
        );
      }}
    />
  );
}

export default function ReservePage() {
  useSectionReveal();

  const token = useAuthStore((state) => state.token);
  const isCustomer = useAuthStore((state) => state.isCustomer());
  const isAdmin = useAuthStore((state) => state.isAdmin());

  const [reservationType, setReservationType] = useState(RESERVATION_TYPES.transaction);
  const [form, setForm] = useState(initialForm);
  const [locations, setLocations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [rates, setRates] = useState([]);
  const [preview, setPreview] = useState(null);
  const [hasRemainingBalance, setHasRemainingBalance] = useState(false);
  const [upgradePenalty, setUpgradePenalty] = useState(0);
  const [loadingBalancePreview, setLoadingBalancePreview] = useState(false);
  const remainingDaysRef = useRef(null);
  const autoFillLocationRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [submitted, setSubmitted] = useState(null);

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

  useEffect(() => {
    if (!token || !isCustomer) {
      return;
    }

    let cancelled = false;

    async function loadBaseOptions() {
      setOptionsLoading(true);

      try {
        const response = await apiGet('/api/reservations/form-options');
        if (!cancelled) {
          setLocations(response.data.locations || []);
          setTransactionTypes(response.data.transaction_types || []);
        }
      } catch (error) {
        if (!cancelled) {
          setSubmitError(error.message || 'Unable to load reservation options.');
        }
      } finally {
        if (!cancelled) {
          setOptionsLoading(false);
        }
      }
    }

    loadBaseOptions();

    return () => {
      cancelled = true;
    };
  }, [token, isCustomer]);

  useEffect(() => {
    if (!token || !isCustomer || !form.location_id || !form.preferred_check_in) {
      setRooms([]);
      return undefined;
    }

    let cancelled = false;

    async function loadRooms() {
      setLoadingRooms(true);

      try {
        const params = new URLSearchParams({
          location_id: String(form.location_id),
          type: reservationType,
          preferred_check_in: form.preferred_check_in,
        });

        if (reservationType === RESERVATION_TYPES.transaction) {
          params.set('no_day', String(form.no_day || 1));
        }

        if (reservationType === RESERVATION_TYPES.walkin) {
          const selectedRate = rates.find(
            (rate) => String(rate.id) === String(form.custom_rate_id),
          );
          params.set('hours', String(selectedRate?.hours ?? 3));
        }

        const response = await apiGet(`/api/reservations/form-options?${params.toString()}`);

        if (!cancelled) {
          const nextRooms = response.data.rooms || [];
          setRooms(nextRooms);
          setForm((current) => {
            if (!current.room_id) {
              return current;
            }

            const stillAvailable = nextRooms.some(
              (room) => String(room.id) === String(current.room_id),
            );

            return stillAvailable ? current : { ...current, room_id: '' };
          });
        }
      } catch {
        if (!cancelled) {
          setRooms([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingRooms(false);
        }
      }
    }

    const timer = setTimeout(loadRooms, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    token,
    isCustomer,
    form.location_id,
    form.preferred_check_in,
    form.no_day,
    form.custom_rate_id,
    reservationType,
    rates,
  ]);

  useEffect(() => {
    if (
      reservationType !== RESERVATION_TYPES.walkin
      || !form.location_id
      || form.transaction_type === ''
    ) {
      setRates([]);
      return;
    }

    let cancelled = false;

    async function loadRates() {
      try {
        const params = new URLSearchParams({
          location_id: String(form.location_id),
          transaction_type: String(form.transaction_type),
        });
        const response = await apiGet(`/api/reservations/rates?${params.toString()}`);

        if (!cancelled) {
          setRates(response.data.rates || []);
        }
      } catch {
        if (!cancelled) {
          setRates([]);
        }
      }
    }

    loadRates();

    return () => {
      cancelled = true;
    };
  }, [reservationType, form.location_id, form.transaction_type]);

  useEffect(() => {
    if (reservationType !== RESERVATION_TYPES.transaction || !form.location_id) {
      setHasRemainingBalance(false);
      setUpgradePenalty(0);
      remainingDaysRef.current = null;
      autoFillLocationRef.current = null;
      if (reservationType === RESERVATION_TYPES.transaction) {
        setPreview(null);
      }
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoadingBalancePreview(true);

      try {
        const params = new URLSearchParams({
          type: reservationType,
          location_id: String(form.location_id),
        });

        if (form.room_id) {
          params.set('room_id', String(form.room_id));
        }

        if (form.no_day && !remainingDaysRef.current) {
          params.set('no_day', String(form.no_day));
        }

        const response = await apiGet(`/api/reservations/preview?${params.toString()}`);
        if (cancelled) {
          return;
        }

        const data = response.data || {};
        const usingBalance = Boolean(data.has_remaining_balance);

        if (usingBalance && data.no_day != null && remainingDaysRef.current === null) {
          remainingDaysRef.current = String(data.no_day);
        }

        const lockedRemainingDays = remainingDaysRef.current;
        const hasBalance = lockedRemainingDays !== null;
        const shouldAutoFill = hasBalance
          && data.suggested_room_id
          && form.preferred_check_in
          && autoFillLocationRef.current !== String(form.location_id);

        if (shouldAutoFill) {
          autoFillLocationRef.current = String(form.location_id);
        }

        setHasRemainingBalance(hasBalance);
        setUpgradePenalty(Number(data.upgrade_penalty ?? 0));
        setPreview(data);
        setForm((current) => {
          const nextRoomId = shouldAutoFill ? String(data.suggested_room_id) : current.room_id;
          const roomStillAvailable = !nextRoomId || rooms.some(
            (room) => String(room.id) === String(nextRoomId),
          );

          return {
            ...current,
            no_day: hasBalance ? lockedRemainingDays : current.no_day,
            room_id: shouldAutoFill && roomStillAvailable ? nextRoomId : current.room_id,
          };
        });
      } catch {
        if (!cancelled) {
          setPreview(null);
          setHasRemainingBalance(false);
          setUpgradePenalty(0);
        }
      } finally {
        if (!cancelled) {
          setLoadingBalancePreview(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    reservationType,
    form.location_id,
    form.room_id,
    form.no_day,
    form.preferred_check_in,
    rooms,
  ]);

  useEffect(() => {
    if (reservationType !== RESERVATION_TYPES.walkin || !form.location_id) {
      return undefined;
    }

    if (!form.custom_rate_id) {
      setPreview(null);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          type: reservationType,
          location_id: String(form.location_id),
          custom_rate_id: String(form.custom_rate_id),
        });
        const response = await apiGet(`/api/reservations/preview?${params.toString()}`);

        if (!cancelled) {
          setPreview(response.data);
        }
      } catch {
        if (!cancelled) {
          setPreview(null);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reservationType, form.location_id, form.custom_rate_id]);

  const resetBalanceState = () => {
    remainingDaysRef.current = null;
    autoFillLocationRef.current = null;
    setHasRemainingBalance(false);
    setUpgradePenalty(0);
  };

  const selectedBedspaceRoom = useMemo(
    () => rooms.find((room) => String(room.id) === String(form.room_id)) ?? null,
    [rooms, form.room_id],
  );

  const selectedWalkinRoom = useMemo(
    () => rooms.find((room) => String(room.id) === String(form.room_id)) ?? null,
    [rooms, form.room_id],
  );

  const walkinHours = useMemo(() => {
    const selectedRate = rates.find(
      (rate) => String(rate.id) === String(form.custom_rate_id),
    );

    return selectedRate?.hours ?? 3;
  }, [rates, form.custom_rate_id]);

  const updateField = (field) => (event) => {
    const value = event.target.value;

    if (field === 'location_id') {
      resetBalanceState();
      setForm((current) => ({
        ...current,
        location_id: value,
        room_id: '',
        no_day: '5',
      }));
      setPreview(null);
      setErrors((current) => ({ ...current, [field]: undefined }));
      setSubmitError('');
      return;
    }

    if (field === 'preferred_check_in') {
      setForm((current) => ({
        ...current,
        preferred_check_in: value,
        room_id: '',
      }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setSubmitError('');
      return;
    }

    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError('');
  };

  const handleTypeChange = (_event, nextType) => {
    if (!nextType) {
      return;
    }

    resetBalanceState();
    setReservationType(nextType);
    setForm((current) => ({
      ...initialForm,
      location_id: current.location_id,
    }));
    setPreview(null);
    setErrors({});
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSubmitError('');
    setErrors({});

    const payload = {
      type: reservationType,
      location_id: Number(form.location_id),
      preferred_check_in: form.preferred_check_in,
      note: form.note || null,
    };

    if (reservationType === RESERVATION_TYPES.transaction) {
      payload.no_day = Number(form.no_day);
      if (form.room_id) {
        payload.room_id = Number(form.room_id);
      }
    }

    if (reservationType === RESERVATION_TYPES.walkin) {
      payload.room_id = Number(form.room_id);
      payload.transaction_type = Number(form.transaction_type);
      payload.custom_rate_id = Number(form.custom_rate_id);
    }

    try {
      const response = await apiPost('/api/reservations', payload);
      setSubmitted(response.data);
      setForm(initialForm);
      setPreview(null);
      resetBalanceState();
    } catch (error) {
      if (error.errors) {
        setErrors(error.errors);
      }
      setSubmitError(error.message || 'Unable to submit reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (name) => errors[name]?.[0];

  if (!token || !isCustomer) {
    return null;
  }

  return (
    <>
      <main>
        <section className="page-hero register-hero" data-scroll-section>
          <Container className="site-container page-hero-layout">
            <Box className="page-hero-copy">
              <Typography className="eyebrow">Customer reservation</Typography>
              <Typography component="h1" className="page-title">Apply for a reservation</Typography>
              <Typography className="section-description">
                Submit a bedspace or walk-in room reservation request. Our team will review your application and confirm availability.
              </Typography>
            </Box>
          </Container>
        </section>

        <section className="section register-section" data-scroll-section>
          <Container className="site-container">
            {submitted ? (
              <Box className="register-success-card">
                <Typography component="h2" className="register-form-group-title">
                  Reservation submitted
                </Typography>
                <Typography className="register-form-group-description">
                  Your {submitted.type_label?.toLowerCase()} reservation for {submitted.location?.name} is pending review.
                  {submitted.estimated_amount != null && (
                    <> Estimated amount: PHP {formatCurrency(submitted.estimated_amount)}.</>
                  )}
                </Typography>
                <Box className="register-form-actions">
                  <Button variant="contained" onClick={() => setSubmitted(null)}>
                    Submit another reservation
                  </Button>
                  <Button href="/" variant="outlined">Back to home</Button>
                </Box>
              </Box>
            ) : (
              <Box component="form" className="register-form" onSubmit={handleSubmit} noValidate>
                {submitError && (
                  <Alert severity="error" className="register-alert">
                    {submitError}
                  </Alert>
                )}

                <FieldGroup
                  title="Reservation type"
                  description="Choose whether you need a bedspace stay or a private walk-in room."
                >
                  <Box className="register-field-full">
                    <Tabs
                      value={reservationType}
                      onChange={handleTypeChange}
                      variant="fullWidth"
                      className="reserve-type-tabs"
                    >
                      <Tab label="Bedspace" value={RESERVATION_TYPES.transaction} />
                      <Tab label="Walk-in Room" value={RESERVATION_TYPES.walkin} />
                    </Tabs>
                  </Box>
                </FieldGroup>

                <FieldGroup
                  title="Stay details"
                  description="Select Adriatico, Modesto, or Mabini branch and your preferred check-in date."
                >
                  <FormControl fullWidth required error={Boolean(fieldError('location_id'))}>
                    <InputLabel id="reserve-location-label">Branch</InputLabel>
                    <Select
                      labelId="reserve-location-label"
                      label="Branch"
                      value={form.location_id}
                      onChange={updateField('location_id')}
                      disabled={optionsLoading}
                    >
                      <MenuItem value="">
                        <em>Select branch</em>
                      </MenuItem>
                      {locations.map((location) => (
                        <MenuItem key={location.id} value={String(location.id)}>
                          {location.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldError('location_id') && (
                      <Typography variant="caption" color="error">{fieldError('location_id')}</Typography>
                    )}
                  </FormControl>

                  <TextField
                    label="Preferred check-in"
                    type="datetime-local"
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={form.preferred_check_in}
                    onChange={updateField('preferred_check_in')}
                    error={Boolean(fieldError('preferred_check_in'))}
                    helperText={fieldError('preferred_check_in')}
                  />
                </FieldGroup>

                {reservationType === RESERVATION_TYPES.transaction && (
                  <FieldGroup
                    title="Bedspace preferences"
                    description={
                      hasRemainingBalance
                        ? 'Your prepaid balance days will be used for this reservation.'
                        : 'Minimum stay is 5 days for new bedspace reservations.'
                    }
                  >
                    {hasRemainingBalance && (
                      <Alert severity="info" className="register-alert register-field-full">
                        Prepaid balance: {preview?.remaining_balance ?? form.no_day} day(s).
                        {form.room_id ? ' Preferred room auto-filled from your balance record.' : '' }
                      </Alert>
                    )}

                    <TextField
                      label="Number of days"
                      type="number"
                      required
                      fullWidth
                      inputProps={{ min: hasRemainingBalance ? 1 : 5, readOnly: hasRemainingBalance }}
                      value={form.no_day}
                      onChange={updateField('no_day')}
                      disabled={!form.location_id || loadingBalancePreview || hasRemainingBalance}
                      error={Boolean(fieldError('no_day'))}
                      helperText={
                        fieldError('no_day')
                        || (hasRemainingBalance
                          ? 'Using customer prepaid balance days. Room changes will not update this value.'
                          : 'Minimum 5 days')
                      }
                    />

                    <SearchSelect
                      label="Preferred room (optional)"
                      placeholder="Search available room..."
                      options={rooms}
                      value={selectedBedspaceRoom}
                      onChange={(room) => {
                        setForm((current) => ({ ...current, room_id: room?.id ? String(room.id) : '' }));
                        setErrors((current) => ({ ...current, room_id: undefined }));
                        setSubmitError('');
                      }}
                      getOptionLabel={(room) => room.name}
                      disabled={!form.location_id || !form.preferred_check_in || loadingBalancePreview}
                      loading={loadingRooms}
                      error={fieldError('room_id')}
                      helperText={
                        fieldError('room_id')
                        || (!form.preferred_check_in
                          ? 'Select preferred check-in first to see available rooms.'
                          : loadingRooms
                            ? 'Checking room availability...'
                            : hasRemainingBalance && form.room_id
                              ? 'Auto-filled from prepaid balance room when available.'
                              : rooms.length
                                ? `${rooms.length} room(s) available on your check-in date.`
                                : 'No rooms available for the selected check-in date.')
                      }
                      noOptionsText="No available rooms for this check-in date"
                    />

                    {upgradePenalty > 0 && (
                      <Alert severity="warning" className="register-alert register-field-full">
                        Room upgrade penalty: PHP {formatCurrency(upgradePenalty)}
                        {' '}
                        ({form.no_day} prepaid day(s) × higher rate)
                      </Alert>
                    )}
                  </FieldGroup>
                )}

                {reservationType === RESERVATION_TYPES.walkin && (
                  <FieldGroup
                    title="Walk-in room preferences"
                    description="Select a private room, transaction type, and rate package."
                  >
                    <SearchSelect
                      label="Room"
                      placeholder="Search available room..."
                      options={rooms}
                      value={selectedWalkinRoom}
                      onChange={(room) => {
                        setForm((current) => ({ ...current, room_id: room?.id ? String(room.id) : '' }));
                        setErrors((current) => ({ ...current, room_id: undefined }));
                        setSubmitError('');
                      }}
                      getOptionLabel={(room) => room.name}
                      disabled={!form.location_id || !form.preferred_check_in}
                      loading={loadingRooms}
                      required
                      error={fieldError('room_id')}
                      helperText={
                        fieldError('room_id')
                        || (!form.preferred_check_in
                          ? 'Select preferred check-in first to see available rooms.'
                          : loadingRooms
                            ? 'Checking room availability...'
                            : rooms.length
                              ? `${rooms.length} room(s) available for ${walkinHours} hour(s) from check-in.`
                              : 'No rooms available for the selected check-in date.')
                      }
                      noOptionsText="No available rooms for this check-in date"
                    />

                    <FormControl fullWidth required error={Boolean(fieldError('transaction_type'))}>
                      <InputLabel id="reserve-transaction-type-label">Transaction type</InputLabel>
                      <Select
                        labelId="reserve-transaction-type-label"
                        label="Transaction type"
                        value={form.transaction_type}
                        onChange={updateField('transaction_type')}
                      >
                        {transactionTypes.map((type) => (
                          <MenuItem key={type.id} value={String(type.id)}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldError('transaction_type') && (
                        <Typography variant="caption" color="error">{fieldError('transaction_type')}</Typography>
                      )}
                    </FormControl>

                    <FormControl fullWidth required error={Boolean(fieldError('custom_rate_id'))}>
                      <InputLabel id="reserve-rate-label">Rate package</InputLabel>
                      <Select
                        labelId="reserve-rate-label"
                        label="Rate package"
                        value={form.custom_rate_id}
                        onChange={updateField('custom_rate_id')}
                        disabled={!form.transaction_type || rates.length === 0}
                      >
                        {rates.map((rate) => (
                          <MenuItem key={rate.id} value={String(rate.id)}>
                            {rate.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {fieldError('custom_rate_id') && (
                        <Typography variant="caption" color="error">{fieldError('custom_rate_id')}</Typography>
                      )}
                    </FormControl>
                  </FieldGroup>
                )}

                {preview?.estimated_amount != null && preview.estimated_amount > 0 && (
                  <Alert severity="info" className="register-alert">
                    Estimated amount: PHP {formatCurrency(preview.estimated_amount)}
                    {preview.no_day ? ` for ${preview.no_day} day(s)` : ''}
                    {preview.hours ? ` for ${preview.hours} hour(s)` : ''}
                  </Alert>
                )}

                {hasRemainingBalance && (preview?.estimated_amount == null || preview.estimated_amount === 0) && upgradePenalty === 0 && (
                  <Alert severity="success" className="register-alert">
                    This reservation will use your prepaid balance with no new stay charge.
                  </Alert>
                )}

                <FieldGroup title="Additional notes">
                  <TextField
                    label="Notes"
                    fullWidth
                    multiline
                    minRows={3}
                    className="register-field-full"
                    value={form.note}
                    onChange={updateField('note')}
                    error={Boolean(fieldError('note'))}
                    helperText={fieldError('note') || 'Optional message for the branch team'}
                  />
                </FieldGroup>

                <Box className="register-form-actions">
                  <Button type="submit" variant="contained" disabled={loading || optionsLoading}>
                    {loading ? 'Submitting...' : 'Submit reservation request'}
                  </Button>
                  <Typography className="register-form-footnote">
                    Your request will be reviewed by the branch team. You will be contacted once it is confirmed.
                  </Typography>
                </Box>
              </Box>
            )}
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
