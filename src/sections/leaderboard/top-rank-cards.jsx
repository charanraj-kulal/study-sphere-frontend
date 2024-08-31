import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Box,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next"; // Import translation hook

const neonBoxShadowChange = keyframes`
  0% { box-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff; }
  33% { box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff; }
  66% { box-shadow: 0 0 10px #ffff00, 0 0 20px #ffff00, 0 0 30px #ffff00; }
  100% { box-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff; }
`;

const neonBorderChange = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const StyledCard = styled(Card)`
  transition: transform 0.3s ease;
  cursor: pointer;
  border-radius: 16px;
  overflow: hidden;
  position: relative;

  &:hover {
    transform: scale(1.05);
  }

  &::before {
    content: "";
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(
      45deg,
      #ff00ff,
      #00ffff,
      #ffff00,
      #ff00ff,
      #00ffff,
      #ffff00
    );
    background-size: 400% 400%;
    z-index: -1;
    animation: ${neonBorderChange} 10s linear infinite;
    border-radius: 18px;
  }

  ${(props) =>
    props.rank === 1 &&
    `
    &::before {
      animation: ${neonBoxShadowChange} 10s linear infinite, ${neonBorderChange} 10s linear infinite;
    }
  `}
`;

const ContentWrapper = styled(Box)`
  background-color: ${(props) => props.theme.palette.background.paper};
  border-radius: 14px;
  margin: 4px;
  height: calc(100% - 8px);
`;

const TopRankCard = ({ user, rank, medalImage }) => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Translation hook

  const handleCardClick = (userId) => {
    navigate(`/dashboard/profile/${userId}`);
  };

  return (
    <StyledCard
      rank={rank}
      sx={{
        width: rank === 1 ? "100%" : "90%",
        height: "100%",
      }}
      onClick={() => handleCardClick(user.id)}
      style={{ cursor: "pointer" }}
    >
      <ContentWrapper>
        <CardContent
          sx={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
              mt: -1,
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mt: 1 }}
            >
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
              alt={t("rank", { rank })} // Translate rank
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
              <Typography variant="body2">{t("uploads")}</Typography>
            </Box>
            <Box align="center">
              <Typography variant="h6">{user.downloadCount || 0}</Typography>
              <Typography variant="body2">{t("downloads")}</Typography>
            </Box>
            <Box align="center">
              <Typography variant="h6">{user.points || 0}</Typography>
              <Typography variant="body2">{t("points")}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </ContentWrapper>
    </StyledCard>
  );
};

export default TopRankCard;
