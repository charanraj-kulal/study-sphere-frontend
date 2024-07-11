import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Iconify from "../../components/iconify/iconify";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import StarIcon from "@mui/icons-material/Star";
import GetAppIcon from "@mui/icons-material/GetApp";
import Stack from "@mui/material/Stack";
import CardNoData from "./CardNoData";
import SkeletonCard from "../../components/skeletons/downloadStudyMaterial/DownloadStudyMaterialSkeleton";
import { formatTimeAgo } from "../../utils/timeUtils";

const formatCount = (count) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)} M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)} K`;
  }
  return count.toString();
};

export default function StudyMaterialCards({
  studyMaterials,
  loading,
  searchQuery,
  onCardClick,
  onDownload,
}) {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {Array.from(new Array(6)).map((_, index) => (
          <Grid item xs={12} key={index}>
            <SkeletonCard />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (studyMaterials.length === 0 && searchQuery) {
    return <CardNoData query={searchQuery} />;
  }

  return (
    <Grid container spacing={3}>
      {studyMaterials.map((material) => (
        <Grid item xs={12} key={material.id}>
          <Card
            sx={{
              display: "flex",
              flexDirection: "row",
              p: 2,
              boxShadow: 3,
              borderRadius: 2,
              cursor: "pointer",
              "&:hover": {
                boxShadow: 6,
              },
            }}
            onClick={() => onCardClick(material)}
          >
            <Box
              sx={{
                width: "120px",
                height: "160px",
                mr: 2,
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              <iframe
                src={`${material.documentUrl}#page=1&view=FitBH&viewrect=0,0,100,100`}
                width="100%"
                height="100%"
                title={`${material.documentName} thumbnail`}
                style={{
                  border: "none",
                  pointerEvents: "none",
                  overflow: "hidden",
                  transform: "scale(1.5)",
                  transformOrigin: "center center",
                  borderRadius: 6,
                }}
                scrolling="no"
              />
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                ml: 4,
              }}
            >
              <div>
                <Typography variant="h6" sx={{ mb: 1 }} noWrap>
                  {material.documentName}.pdf
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {material.description}
                </Typography>
              </div>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Avatar
                    src={material.uploaderPhotoUrl}
                    alt={material.uploadedBy}
                  />
                  <Stack>
                    <Typography variant="body2" noWrap>
                      {material.uploadedBy}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {material.uploaderCourse} •{" "}
                      {formatTimeAgo(material.uploadedOn.toDate())}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" alignItems="center">
                  <Stack direction="row" alignItems="center" marginRight={1}>
                    <IconButton size="small" sx={{ color: "warning.main" }}>
                      <StarIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {formatCount(material.star)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <IconButton
                      size="small"
                      sx={{ color: "primary.main" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(material);
                      }}
                    >
                      <GetAppIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {formatCount(material.downloadCount)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
