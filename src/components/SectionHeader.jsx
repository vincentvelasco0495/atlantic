import { Box, Button, Typography } from '@mui/material';

export default function SectionHeader({ title, action, href = '#' }) {
  return (
    <Box className="section-header">
      <Typography component="h2" className="section-title">{title}</Typography>
      {action && <Button href={href} className="text-action">{action}</Button>}
    </Box>
  );
}
