import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Box,
} from "@mui/material";
import { NeonGradientCard } from "../../components/magicui/neon-gradient-card";

const TopRankCard = ({ user, rank, medalImage }) => {
  return (
    <Card
      sx={{
        width: rank === 1 ? "100%" : "90%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
            mt: -3,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 3 }}>
            <Avatar
              src={user.profilePhotoURL}
              alt={user.name}
              sx={{ width: 60, height: 60 }}
            />
            <Stack>
              <Typography variant="h6">{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.course}
              </Typography>
            </Stack>
          </Stack>
          <img
            src={medalImage}
            alt={`Rank ${rank}`}
            style={{
              width:
                rank === 1 ? 150 : rank === 2 ? 130 : rank === 3 ? 110 : 100,
              height:
                rank === 1 ? 150 : rank === 2 ? 130 : rank === 3 ? 110 : 100,
            }}
          />
        </Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ mt: "auto" }}
        >
          <Box align="center">
            <Typography variant="h6">{user.uploadCount || 0}</Typography>
            <Typography variant="body2">Uploads</Typography>
          </Box>
          <Box align="center">
            <Typography variant="h6">{user.downloadCount || 0}</Typography>
            <Typography variant="body2">Downloads</Typography>
          </Box>
          <Box align="center">
            <Typography variant="h6">{user.points || 0}</Typography>
            <Typography variant="body2">Points</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TopRankCard;
