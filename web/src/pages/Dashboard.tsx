import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

export default function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Active Patients
            </Typography>
            <Typography component="p" variant="h4">
              24
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="secondary" gutterBottom>
              Critical Alerts
            </Typography>
            <Typography component="p" variant="h4">
              3
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Unread Messages
            </Typography>
            <Typography component="p" variant="h4">
              5
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
