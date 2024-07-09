import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import StarIcon from "@mui/icons-material/Star";
import GetAppIcon from "@mui/icons-material/GetApp";
import Stack from "@mui/material/Stack";
import CardNoData from "./CardNoData";
import { formatTimeAgo } from "../../utils/timeUtils";

export default function StudyMaterialCards({
  studyMaterials,
  loading,
  searchQuery,
}) {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {Array.from(new Array(6)).map((_, index) => (
          <Grid item xs={12} key={index}>
            {/* Skeleton or loading state */}
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
            }}
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
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" noWrap>
                {material.documentName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {material.description}
              </Typography>
              <Box
                sx={{
                  mt: "auto",
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
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconButton size="small">
                    <StarIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body2">{material.starCount}</Typography>
                  <IconButton size="small">
                    <GetAppIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body2">
                    {material.downloadCount}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
