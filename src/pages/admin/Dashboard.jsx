import { Grid } from "@mui/material";
import Layout from "../../layouts/commonLayout/Layout";
import StatsCards from "../../components/shared/StatsCards";
import DashboardChart from "../../components/shared/DashboardChart";

const stats = [
  { label: "Active Companies", value: 42 },
  { label: "Registered Users", value: 1287 },
  { label: "Question Bank Size", value: 963 },
  { label: "Live Sessions", value: 11 },
];

const trendData = [
  { name: "Jan", companies: 9, users: 180 },
  { name: "Feb", companies: 14, users: 260 },
  { name: "Mar", companies: 18, users: 420 },
  { name: "Apr", companies: 22, users: 580 },
  { name: "May", companies: 28, users: 790 },
  { name: "Jun", companies: 35, users: 1010 },
];

const sessionData = [
  { name: "Week 1", created: 3, completed: 1 },
  { name: "Week 2", created: 5, completed: 4 },
  { name: "Week 3", created: 6, completed: 5 },
  { name: "Week 4", created: 4, completed: 3 },
];

export default function Dashboard() {
  return (
    <Layout role="admin" title="Admin Dashboard">
      <Grid container spacing={2.5}>
        <Grid size={12}>
          <StatsCards items={stats} />
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <DashboardChart
            title="Company vs User Growth"
            data={trendData}
            lines={[
              { dataKey: "companies", color: "#0f766e" },
              { dataKey: "users", color: "#c2410c" },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <DashboardChart
            title="Session Lifecycle"
            data={sessionData}
            lines={[
              { dataKey: "created", color: "#1d4ed8" },
              { dataKey: "completed", color: "#4d7c0f" },
            ]}
          />
        </Grid>
      </Grid>
    </Layout>
  );
}
