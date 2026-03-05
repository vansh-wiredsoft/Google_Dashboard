import { Avatar, Grid, Paper, Stack, Typography } from "@mui/material";
import Layout from "../../layouts/commonLayout/Layout";
import { getUserProfile } from "../../utils/roleHelper";

export default function Profile() {
  const profile = getUserProfile();
  const role = profile?.role || "admin";
  const name = profile?.name || "Portal User";
  const email = profile?.email || "user@example.com";

  return (
    <Layout role={role} title="My Profile">
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "rgba(255,255,255,0.86)",
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} alignItems="center">
              <Avatar sx={{ width: 80, height: 80, fontSize: 30, bgcolor: "primary.main" }}>
                {name.charAt(0).toUpperCase()}
              </Avatar>
              <Stack spacing={0.6}>
                <Typography variant="h5">{name}</Typography>
                <Typography color="text.secondary">{email}</Typography>
                <Typography sx={{ textTransform: "capitalize" }} color="text.secondary">
                  Role: {role}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}
