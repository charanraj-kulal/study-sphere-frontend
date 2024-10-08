import React, { useState, useEffect } from "react";
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
import SkeletonCard from "../../components/skeletons/downloadStudyMaterial/DownloadStudyMaterialSkeleton";
import { formatTimeAgo } from "../../utils/timeUtils";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase";

const formatCount = (count) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)} M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)} K`;
  }
  return count.toString();
};

const calculateAverageRating = (starArray) => {
  if (!Array.isArray(starArray) || starArray.length === 0) return "0.00";
  const totalRatings = starArray.reduce(
    (sum, count, index) => sum + count * (index + 1),
    0
  );
  const totalVotes = starArray.reduce((sum, count) => sum + count, 0);
  return totalVotes > 0 ? (totalRatings / totalVotes).toFixed(2) : "0.00";
};

export default function StudyMaterialCards({
  searchQuery,
  onCardClick,
  onDownload,
}) {
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const materialsRef = collection(db, "documents");
        const q = query(
          materialsRef,
          where("visibility", "==", "public"),
          where("Approved", "==", "Yes"),
          orderBy("uploadedOn", "desc"),
          limit(20)
        );

        const querySnapshot = await getDocs(q);
        const materials = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filteredMaterials = materials.filter(
          (material) =>
            material.documentName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            material.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            material.documentTopics.some((topic) =>
              topic.toLowerCase().includes(searchQuery.toLowerCase())
            ) ||
            material.uploadedBy
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            material.uploaderCourse
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );

        setStudyMaterials(filteredMaterials);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [searchQuery]);

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
                  pointerEvents: "none",
                  overflow: "hidden",
                  transform: "scale(1.5)",
                  transformOrigin: "center center",
                  borderRadius: 6,
                  border: "1px solid rgba(0, 0, 0, 0.1)",
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
                      {calculateAverageRating(material.star)}
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
