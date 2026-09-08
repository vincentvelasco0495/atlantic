import { useCallback, useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { apiGet } from '../../config/api';
import TransactionsPanel from './TransactionsPanel';
import TransactionDetailsPanel from './TransactionDetailsPanel';
import WalkInTransactionsPanel from './WalkInTransactionsPanel';
import WalkInTransactionDetailsPanel from './WalkInTransactionDetailsPanel';

function MetricBars() {
  return (
    <Box className="dashboard-metric-bars" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </Box>
  );
}

function DashboardMetricCard({ value, label, tone, href }) {
  const card = (
    <Box className={`dashboard-metric-card ${tone}`}>
      <Box className="dashboard-metric-card-top">
        <Box className="dashboard-metric-copy">
          <Typography className="dashboard-metric-value">{value}</Typography>
          <Typography className="dashboard-metric-label">{label}</Typography>
        </Box>
        <MetricBars />
      </Box>
      <Box className="dashboard-metric-card-bottom" />
    </Box>
  );

  if (!href) {
    return card;
  }

  return (
    <Box component="a" href={href} className="dashboard-metric-link">
      {card}
    </Box>
  );
}

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [detailsRefreshKey, setDetailsRefreshKey] = useState(0);

  const loadStats = useCallback(async (silent = false) => {
    if (!silent) {
      setStatsLoading(true);
    }
    setStatsError('');

    try {
      const response = await apiGet('/api/dashboard/stats');
      setStats(response.data || {});
    } catch (loadError) {
      setStatsError(loadError.message || 'Unable to load dashboard stats.');
    } finally {
      if (!silent) {
        setStatsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refreshStats = useCallback(() => {
    loadStats(true);
    setDetailsRefreshKey((current) => current + 1);
  }, [loadStats]);

  const earnings = Number(stats?.all_earnings ?? 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const branchLabel = stats?.location_name || 'Assigned branch';
  const dateLabel = stats?.earnings_date
    ? new Date(`${stats.earnings_date}T00:00:00`).toLocaleDateString('en-PH', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    : 'Today';

  return (
    <Box>
      {statsLoading ? (
        <Box className="dashboard-card dashboard-loading">
          <CircularProgress size={32} />
          <Typography>Loading dashboard stats...</Typography>
        </Box>
      ) : statsError ? (
        <Box className="dashboard-card dashboard-empty-state" sx={{ mb: 3 }}>
          <Typography className="dashboard-empty-title">Stats unavailable</Typography>
          <Typography className="dashboard-empty-copy">{statsError}</Typography>
        </Box>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {branchLabel} · {dateLabel}
          </Typography>
          <Box className="dashboard-metrics-grid">
            <DashboardMetricCard value={earnings} label="Today's Earnings" tone="is-earnings" />
            <DashboardMetricCard
              value={stats?.total_occupants ?? 0}
              label="Total Occupants"
              tone="is-occupants"
              href="#dashboard-transactions"
            />
            <DashboardMetricCard
              value={stats?.available_beds ?? 0}
              label="Available Bed"
              tone="is-beds"
            />
          </Box>
        </>
      )}

      <Box id="dashboard-transactions" className="dashboard-transactions-section">
        <TransactionsPanel onStatsChange={refreshStats} />
      </Box>

      <Box id="dashboard-transaction-details" className="dashboard-transactions-section">
        <TransactionDetailsPanel refreshKey={detailsRefreshKey} />
      </Box>

      <Box id="dashboard-walkin-transactions" className="dashboard-transactions-section">
        <WalkInTransactionsPanel refreshKey={detailsRefreshKey} onStatsChange={refreshStats} />
      </Box>

      <Box id="dashboard-walkin-transaction-details" className="dashboard-transactions-section">
        <WalkInTransactionDetailsPanel refreshKey={detailsRefreshKey} />
      </Box>
    </Box>
  );
}
