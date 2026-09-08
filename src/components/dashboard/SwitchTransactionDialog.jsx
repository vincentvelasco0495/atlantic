import { useEffect, useMemo, useState } from 'react';
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
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { apiGet, apiPut } from '../../config/api';

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
      className="dashboard-tx-autocomplete"
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

function formatRate(value) {
  if (value == null || value === '') return '';
  return Number(value).toFixed(2);
}

export default function SwitchTransactionDialog({ open, transaction, onClose, onSwitched }) {
  const [rooms, setRooms] = useState([]);
  const [previousRoomRate, setPreviousRoomRate] = useState('');
  const [roomId, setRoomId] = useState('');
  const [bedId, setBedId] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedRoom = useMemo(
    () => rooms.find((room) => String(room.id) === String(roomId)) ?? null,
    [roomId, rooms],
  );

  const beds = selectedRoom?.beds ?? [];

  const selectedBed = useMemo(
    () => beds.find((bed) => String(bed.id) === String(bedId)) ?? null,
    [bedId, beds],
  );

  useEffect(() => {
    if (!open || !transaction?.id) return undefined;

    let active = true;

    async function loadOptions() {
      setLoading(true);
      setError('');
      setRoomId('');
      setBedId('');
      setPreview(null);

      try {
        const response = await apiGet(`/api/transactions/${transaction.id}/switch-options`);
        if (!active) return;

        setRooms(Array.isArray(response.data?.rooms) ? response.data.rooms : []);
        setPreviousRoomRate(formatRate(response.data?.current_rate ?? transaction?.rates ?? 0));
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Unable to load switch options.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOptions();

    return () => {
      active = false;
    };
  }, [open, transaction?.id, transaction?.rates]);

  useEffect(() => {
    if (!open || !transaction?.id || !bedId) {
      setPreview(null);
      return undefined;
    }

    let active = true;

    async function loadPreview() {
      setLoadingPreview(true);

      try {
        const response = await apiGet(
          `/api/transactions/${transaction.id}/switch-options?bed_id=${bedId}`,
        );
        if (active) {
          setPreview(response.data?.preview ?? null);
        }
      } catch {
        if (active) {
          setPreview(null);
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
  }, [open, transaction?.id, bedId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!transaction?.id || !bedId) return;

    setSaving(true);
    setError('');

    try {
      await apiPut(`/api/transactions/${transaction.id}/switch`, {
        bed_id: Number(bedId),
      });

      onSwitched?.('Guest switched successfully.');
      onClose();
    } catch (submitError) {
      setError(submitError.message || 'Unable to switch guest.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} fullWidth maxWidth="sm" className="dashboard-dialog dashboard-tx-create-dialog dashboard-tx-switch-dialog">
      <DialogTitle className="dashboard-tx-create-title">
        Switch Available Bed
        <IconButton aria-label="Close dialog" onClick={onClose} disabled={saving}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent className="dashboard-dialog-content dashboard-tx-create-content">
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Box className="dashboard-dialog-loading">
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Stack spacing={0} className="dashboard-tx-create-fields">
              <SearchSelect
                label="Room"
                placeholder="Search room..."
                options={rooms}
                value={selectedRoom}
                onChange={(room) => {
                  setRoomId(room?.id ?? '');
                  setBedId('');
                }}
                getOptionLabel={(room) => room.name}
                required
                noOptionsText="No available rooms"
              />

              <TextField
                label="Room rates"
                fullWidth
                value={selectedRoom ? formatRate(selectedRoom.rate) : ''}
                InputProps={{ readOnly: true }}
                className="dashboard-tx-readonly-field"
              />

              <SearchSelect
                label="Bed"
                placeholder="Search bed..."
                options={beds}
                value={selectedBed}
                onChange={(bed) => setBedId(bed?.id ?? '')}
                getOptionLabel={(bed) => bed.name}
                disabled={!roomId}
                loading={loadingPreview}
                required
                noOptionsText={roomId ? 'No available beds in this room' : 'Select a room first'}
              />

              <TextField
                label="Previous room rates"
                fullWidth
                value={previousRoomRate}
                InputProps={{ readOnly: true }}
                className="dashboard-tx-readonly-field"
              />

              {preview?.switch_amount > 0 && (
                <Alert severity="warning" className="dashboard-tx-upgrade-penalty">
                  Rate upgrade charge: ₱{Number(preview.switch_amount).toFixed(2)}
                  {preview.balance_days > 0 ? ` (${preview.balance_days} remaining day(s))` : ''}
                </Alert>
              )}

              {preview?.overdue_penalty_amount > 0 && (
                <Alert severity="error" className="dashboard-tx-upgrade-penalty">
                  Overdue penalty applies for this switch.
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions className="dashboard-dialog-actions dashboard-tx-create-actions dashboard-tx-switch-actions">
          <Button
            type="submit"
            variant="contained"
            className="dashboard-tx-switch-btn"
            disabled={saving || loading || !bedId}
          >
            {saving ? 'Switching...' : 'Switch'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
