import { useRef, useState } from 'react';
import {
  Add,
  CalendarMonth,
  ExpandMore,
  Remove,
} from '@mui/icons-material';
import { Box, Button, Divider, IconButton, Stack, Typography } from '@mui/material';

function DateField({ label, value, onChange }) {
  const inputRef = useRef(null);
  return (
    <Box className="booking-field booking-date-field" onClick={() => inputRef.current?.showPicker?.()}>
      <CalendarMonth className="booking-icon" />
      <Box className="booking-field-copy">
        <Typography className="field-label">{label}</Typography>
        <Typography className="field-value">{value || 'Add date'}</Typography>
      </Box>
      <input ref={inputRef} aria-label={label} type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </Box>
  );
}

export default function BookingForm() {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState({ adults: 1, children: 0 });
  const [guestOpen, setGuestOpen] = useState(false);

  const updateGuest = (key, amount) => {
    setGuests((current) => ({ ...current, [key]: Math.max(key === 'adults' ? 1 : 0, current[key] + amount) }));
  };

  return (
    <Box component="form" className="booking-card" onSubmit={(event) => event.preventDefault()}>
      <DateField label="Check-in" value={checkIn} onChange={setCheckIn} />
      <Divider orientation="vertical" flexItem className="booking-divider" />
      <DateField label="Check-out" value={checkOut} onChange={setCheckOut} />
      <Divider orientation="vertical" flexItem className="booking-divider" />
      <Button className="booking-field guest-field" onClick={() => setGuestOpen((open) => !open)} endIcon={<ExpandMore />}>
        <span className="guest-icon">{guests.adults + guests.children}</span>
        <span className="booking-field-copy">
          <span className="field-label">Guests</span>
          <span className="field-value">{guests.adults + guests.children} guests</span>
        </span>
      </Button>
      <Button type="submit" variant="contained" className="search-button">
        Search
      </Button>
      {guestOpen && <Box className="guest-popup">
        {['adults', 'children'].map((key) => (
          <Box className="guest-popup-row" key={key}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: 220 }}>
              <Box>
                <Typography sx={{ fontWeight: 700, color: 'var(--heading)', textTransform: 'capitalize' }}>{key}</Typography>
                <Typography variant="caption" color="text.secondary">{key === 'adults' ? 'Age 13+' : 'Age 0-12'}</Typography>
              </Box>
              <Stack direction="row" alignItems="center" gap={0.5}>
                <IconButton size="small" onClick={() => updateGuest(key, -1)}><Remove fontSize="small" /></IconButton>
                <Typography sx={{ minWidth: 18, textAlign: 'center', fontWeight: 700 }}>{guests[key]}</Typography>
                <IconButton size="small" onClick={() => updateGuest(key, 1)}><Add fontSize="small" /></IconButton>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Box>}
    </Box>
  );
}
