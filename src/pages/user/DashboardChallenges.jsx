import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getRaisedGradient, getSurfaceBackground } from "../../theme";

const challengeBadges = [
  { id: "h1", label: "Hydration Hero", icon: "💧", earned: true, level: "Gold", color: "#0284c7" },
  { id: "s1", label: "Sleep Master", icon: "🌙", earned: true, level: "Silver", color: "#7c3aed" },
  { id: "st", label: "Stress Buster", icon: "🧘", earned: false, level: "Bronze", color: "#ea580c" },
  { id: "g1", label: "Green Eater", icon: "🥗", earned: true, level: "Bronze", color: "#16a34a" },
  { id: "a1", label: "Active Star", icon: "🏃", earned: false, level: "Silver", color: "#f59e0b" },
  { id: "b1", label: "Banyan Legend", icon: "🌳", earned: false, level: "Legend", color: "#ca8a04" },
];

const leaderboard = [
  { name: "Priya S.", team: "Engineering - Delhi", delta: "+42%" },
  { name: "Rahul M.", team: "Product - Mumbai", delta: "+38%" },
  { name: "Anjali K.", team: "HR - BLR", delta: "+35%" },
  { name: "Amit R.", team: "Finance - Delhi", delta: "+31%", current: true },
  { name: "Sneha P.", team: "Marketing - Pune", delta: "+28%" },
];

const createChallengeStateFromItems = (challenges) =>
  challenges.reduce((accumulator, challenge) => {
    const challengeType = String(challenge.challenge_type || "").toLowerCase();

    accumulator[challenge.challenge_key] = {
      count: 0,
      done: false,
      chosen: challengeType === "multi" ? [] : null,
      timer: challengeType === "timer" ? Math.max(1, Number(challenge.target_value) || 60) : 0,
      rating: null,
    };

    return accumulator;
  }, {});

const getChallengeTypeOptions = (challengeType) => {
  const type = String(challengeType || "").toLowerCase();

  if (type === "choice") return ["Option 1", "Option 2", "Option 3"];
  if (type === "multi") return ["Choice 1", "Choice 2", "Choice 3"];
  if (type === "rating") return ["😞", "😕", "😐", "🙂", "😄"];
  if (type === "toggle") return ["Mark Complete"];

  return [];
};

function SectionCard({ children, sx }) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: getSurfaceBackground(theme),
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

function ChallengeActionButton({
  active = false,
  color,
  children,
  disabled = false,
  onClick,
}) {
  return (
    <Button
      variant={active ? "contained" : "outlined"}
      onClick={onClick}
      disabled={disabled}
      sx={{
        textTransform: "none",
        fontWeight: 700,
        borderRadius: 2.5,
        color: active ? "#fff" : color,
        borderColor: alpha(color, 0.35),
        bgcolor: active ? color : alpha(color, 0.06),
        "&:hover": {
          borderColor: color,
          bgcolor: active ? color : alpha(color, 0.12),
        },
      }}
    >
      {children}
    </Button>
  );
}

export default function DashboardChallenges({ challenges, loading, error }) {
  const theme = useTheme();
  const timerRef = useRef(null);
  const [activeTimerKey, setActiveTimerKey] = useState("");
  const [challengeState, setChallengeState] = useState({});

  useEffect(() => {
    setChallengeState((current) => ({
      ...createChallengeStateFromItems(challenges),
      ...current,
    }));
  }, [challenges]);

  useEffect(() => {
    if (!activeTimerKey || !challengeState[activeTimerKey]?.timer) {
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setChallengeState((current) => {
        const nextTimer = (current[activeTimerKey]?.timer || 0) - 1;

        if (nextTimer <= 0) {
          setActiveTimerKey("");
          return {
            ...current,
            [activeTimerKey]: {
              ...current[activeTimerKey],
              timer: 0,
              done: true,
            },
          };
        }

        return {
          ...current,
          [activeTimerKey]: {
            ...current[activeTimerKey],
            timer: nextTimer,
          },
        };
      });
    }, 1000);

    return () => window.clearInterval(timerRef.current);
  }, [activeTimerKey, challengeState]);

  useEffect(() => () => window.clearInterval(timerRef.current), []);

  const updateChallenge = (id, payload) => {
    setChallengeState((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...payload,
      },
    }));
  };

  const formatTimer = (seconds) =>
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  const isDone = (challenge) => {
    const state = challengeState[challenge.challenge_key];
    const challengeType = String(challenge.challenge_type || "").toLowerCase();
    const targetValue = Math.max(1, Number(challenge.target_value) || 1);

    if (!state) return false;
    if (challengeType === "counter") return state.count >= targetValue;
    if (challengeType === "toggle") return state.done;
    if (challengeType === "choice") return state.chosen !== null;
    if (challengeType === "multi") return state.chosen.length > 0;
    if (challengeType === "timer") return state.done;
    if (challengeType === "rating") return state.rating !== null;
    return false;
  };

  const getXp = (challenge) => {
    if (!isDone(challenge)) return 0;

    if (String(challenge.challenge_type || "").toLowerCase() === "multi") {
      const optionCount = Math.max(getChallengeTypeOptions(challenge.challenge_type).length, 1);
      return Math.round(
        (Number(challenge.xp_reward) || 0) *
          ((challengeState[challenge.challenge_key]?.chosen?.length || 0) / optionCount),
      );
    }

    return Number(challenge.xp_reward) || 0;
  };

  const completedCount = challenges.filter((challenge) => isDone(challenge)).length;
  const earnedXp = challenges.reduce((sum, challenge) => sum + getXp(challenge), 0);

  if (loading) {
    return (
      <SectionCard>
        <Typography>Loading challenges...</Typography>
      </SectionCard>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!challenges.length) {
    return (
      <SectionCard>
        <Typography>No active challenges available right now.</Typography>
      </SectionCard>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Grid container spacing={2}>
        {[
          {
            label: "Active streak",
            value: "7 Days",
            note: "Day 8 unlocks a badge",
            color: "#ea580c",
          },
          {
            label: "XP today",
            value: `${earnedXp} pts`,
            note: "Earn XP from today&apos;s live challenges",
            color: "#ca8a04",
          },
          {
            label: "Current level",
            value: "Banyan Sapling",
            note: "Challenge progress keeps your streak alive",
            color: "#4d7c0f",
          },
          {
            label: "Progress",
            value: `${completedCount} / ${challenges.length}`,
            note: "Challenges completed today",
            color: "#1d4ed8",
          },
        ].map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 6, xl: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: alpha(item.color, 0.22),
                background: getRaisedGradient(theme, item.color),
                height: "100%",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 28, fontWeight: 800, color: item.color }}>
                {item.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                {item.note}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <SectionCard>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={1}
          sx={{ mb: 1.5 }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Today&apos;s Challenges
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Daily challenges are rendered from the KPI dashboard API response.
            </Typography>
          </Box>
          <Chip
            label={`${earnedXp} XP earned today`}
            sx={{
              fontWeight: 700,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
            }}
          />
        </Stack>

        <Box sx={{ mb: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 0.75 }}
          >
            <Typography variant="caption" color="text.secondary">
              Today&apos;s completion
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {completedCount}/{challenges.length} challenges
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={(completedCount / Math.max(challenges.length, 1)) * 100}
            sx={{
              height: 8,
              borderRadius: 999,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              "& .MuiLinearProgress-bar": {
                borderRadius: 999,
              },
            }}
          />
        </Box>

        <Grid container spacing={2}>
          {challenges.map((challenge) => {
            const challengeType = String(challenge.challenge_type || "").toLowerCase();
            const options = getChallengeTypeOptions(challenge.challenge_type);
            const targetValue = Math.max(1, Number(challenge.target_value) || 1);
            const state =
              challengeState[challenge.challenge_key] ||
              createChallengeStateFromItems([challenge])[challenge.challenge_key];
            const done = isDone(challenge);
            const xp = getXp(challenge);
            const color = challenge.color || theme.palette.primary.main;

            return (
              <Grid key={challenge.challenge_key} size={{ xs: 12, md: 6, xl: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    borderColor: alpha(color, done ? 0.4 : 0.18),
                    background: done
                      ? `linear-gradient(180deg, ${alpha(color, 0.08)} 0%, ${getSurfaceBackground(theme, theme.palette.mode === "dark" ? 0.98 : 0.94)} 100%)`
                      : getSurfaceBackground(theme),
                    height: "100%",
                  }}
                >
                  <Stack spacing={1.5} sx={{ height: "100%" }}>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Typography sx={{ fontSize: 24, lineHeight: 1 }}>
                          {challenge.icon || "🎯"}
                        </Typography>
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: done ? color : "text.primary" }}>
                            {challenge.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color, fontWeight: 700 }}>
                            {challenge.challenge_type} · {Number(challenge.xp_reward) || 0} XP
                          </Typography>
                        </Box>
                      </Stack>
                      {done && (
                        <Chip
                          size="small"
                          label={`+${xp} XP`}
                          sx={{
                            bgcolor: alpha(color, 0.12),
                            color,
                            fontWeight: 700,
                          }}
                        />
                      )}
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      {challenge.description || "Complete this challenge to earn XP."}
                    </Typography>

                    {challengeType === "counter" && (
                      <Stack spacing={1.25}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <ChallengeActionButton
                            active={state.count >= targetValue}
                            color={color}
                            disabled={state.count >= targetValue}
                            onClick={() =>
                              updateChallenge(challenge.challenge_key, {
                                count: Math.min(targetValue, state.count + 1),
                              })
                            }
                          >
                            + 1
                          </ChallengeActionButton>
                          {state.count > 0 && (
                            <Button
                              variant="outlined"
                              onClick={() =>
                                updateChallenge(challenge.challenge_key, {
                                  count: Math.max(0, state.count - 1),
                                })
                              }
                              sx={{ minWidth: 0, px: 1.25, borderRadius: 2.5 }}
                            >
                              -
                            </Button>
                          )}
                          <Typography sx={{ fontWeight: 800, color }}>
                            {state.count} / {targetValue}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={(state.count / targetValue) * 100}
                          sx={{
                            height: 7,
                            borderRadius: 999,
                            bgcolor: alpha(color, 0.12),
                            "& .MuiLinearProgress-bar": {
                              bgcolor: color,
                              borderRadius: 999,
                            },
                          }}
                        />
                      </Stack>
                    )}

                    {challengeType === "toggle" && (
                      <ChallengeActionButton
                        active={state.done}
                        color={color}
                        onClick={() =>
                          updateChallenge(challenge.challenge_key, { done: !state.done })
                        }
                      >
                        {state.done ? `✓ ${options[0]}` : options[0]}
                      </ChallengeActionButton>
                    )}

                    {challengeType === "choice" && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {options.map((option, index) => (
                          <ChallengeActionButton
                            key={option}
                            active={state.chosen === index}
                            color={color}
                            onClick={() =>
                              updateChallenge(challenge.challenge_key, {
                                chosen: state.chosen === index ? null : index,
                              })
                            }
                          >
                            {option}
                          </ChallengeActionButton>
                        ))}
                      </Stack>
                    )}

                    {challengeType === "multi" && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {options.map((option, index) => {
                          const selected = state.chosen.includes(index);
                          return (
                            <ChallengeActionButton
                              key={option}
                              active={selected}
                              color={color}
                              onClick={() =>
                                updateChallenge(challenge.challenge_key, {
                                  chosen: selected
                                    ? state.chosen.filter((value) => value !== index)
                                    : [...state.chosen, index],
                                })
                              }
                            >
                              {option}
                            </ChallengeActionButton>
                          );
                        })}
                      </Stack>
                    )}

                    {challengeType === "timer" && (
                      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                        {!state.done ? (
                          <>
                            <ChallengeActionButton
                              active={activeTimerKey === challenge.challenge_key}
                              color={color}
                              disabled={Boolean(activeTimerKey)}
                              onClick={() => setActiveTimerKey(challenge.challenge_key)}
                            >
                              {activeTimerKey === challenge.challenge_key ? "Running..." : "Start Timer"}
                            </ChallengeActionButton>
                            <Typography
                              sx={{
                                fontFamily: "monospace",
                                fontWeight: 800,
                                fontSize: 24,
                                color,
                              }}
                            >
                              {formatTimer(state.timer)}
                            </Typography>
                          </>
                        ) : (
                          <Typography sx={{ fontWeight: 700, color }}>
                            Timer complete. Well done.
                          </Typography>
                        )}
                      </Stack>
                    )}

                    {challengeType === "rating" && (
                      <Stack direction="row" spacing={1}>
                        {options.map((emoji, index) => (
                          <Button
                            key={emoji}
                            variant={state.rating === index ? "contained" : "outlined"}
                            onClick={() =>
                              updateChallenge(challenge.challenge_key, { rating: index })
                            }
                            sx={{
                              minWidth: 0,
                              px: 1.2,
                              fontSize: 24,
                              lineHeight: 1,
                              borderRadius: 2.5,
                              borderColor: alpha(color, 0.3),
                              bgcolor:
                                state.rating === index
                                  ? alpha(color, 0.14)
                                  : "transparent",
                            }}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </SectionCard>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard sx={{ height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              My Badges
            </Typography>
            <Grid container spacing={1.5}>
              {challengeBadges.map((badge) => (
                <Grid key={badge.id} size={{ xs: 6, sm: 4 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      textAlign: "center",
                      borderColor: badge.earned ? alpha(badge.color, 0.35) : "divider",
                      bgcolor: badge.earned ? alpha(badge.color, 0.08) : "transparent",
                      opacity: badge.earned ? 1 : 0.45,
                      height: "100%",
                    }}
                  >
                    <Typography sx={{ fontSize: 26 }}>{badge.icon}</Typography>
                    <Typography sx={{ mt: 0.75, fontWeight: 700, color: badge.earned ? badge.color : "text.secondary" }}>
                      {badge.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {badge.level}
                      {!badge.earned ? " Locked" : ""}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard sx={{ height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Weekly Leaderboard
            </Typography>
            <Stack spacing={1.2}>
              {leaderboard.map((item, index) => (
                <Paper
                  key={item.name}
                  variant="outlined"
                  sx={{
                    p: 1.4,
                    borderRadius: 2.5,
                    borderColor: item.current ? alpha("#0f766e", 0.3) : "divider",
                    bgcolor: item.current ? alpha("#0f766e", 0.06) : "transparent",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Typography
                        sx={{
                          width: 24,
                          fontWeight: 800,
                          color: index < 3 ? "#c2410c" : "text.secondary",
                        }}
                      >
                        {index + 1}
                      </Typography>
                      <Box>
                        <Typography sx={{ fontWeight: item.current ? 800 : 700 }}>
                          {item.current ? `You (${item.name})` : item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.team}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: item.current ? "#15803d" : "#0f766e",
                      }}
                    >
                      {item.delta}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );
}
