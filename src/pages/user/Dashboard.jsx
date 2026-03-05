import { Grid, Paper, Stack, Typography } from "@mui/material";
import Layout from "../../layouts/commonLayout/Layout";
import StatsCards from "../../components/shared/StatsCards";
import DashboardChart from "../../components/shared/DashboardChart";

const stats = [
  { label: "Assigned Sessions", value: 6 },
  { label: "Completed Sessions", value: 4 },
  { label: "Average Score", value: "82%" },
  { label: "Upcoming Deadlines", value: 2 },
];

const progressData = [
  { name: "Mon", completed: 1, score: 76 },
  { name: "Tue", completed: 1, score: 84 },
  { name: "Wed", completed: 2, score: 82 },
  { name: "Thu", completed: 2, score: 88 },
  { name: "Fri", completed: 3, score: 85 },
  { name: "Sat", completed: 4, score: 83 },
];

export default function Dashboard() {
  return (
    <Layout role="user" title="User Dashboard">
      <Grid container spacing={2.5}>
        <Grid size={12}>
          <StatsCards items={stats} />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <DashboardChart
            title="Your Progress"
            data={progressData}
            lines={[
              { dataKey: "completed", color: "#2563eb" },
              { dataKey: "score", color: "#15803d" },
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "rgba(255,255,255,0.86)",
              height: "100%",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Upcoming Tasks
            </Typography>
            <Stack spacing={1.6}>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 600 }}>Aster Solutions - Round 2</Typography>
                <Typography variant="body2" color="text.secondary">
                  Deadline: 12 Mar 2026
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 600 }}>Nimbus Labs - SQL Quiz</Typography>
                <Typography variant="body2" color="text.secondary">
                  Deadline: 15 Mar 2026
                </Typography>
              </Paper>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}
