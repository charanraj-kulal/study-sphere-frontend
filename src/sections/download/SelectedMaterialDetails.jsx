import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Iconify from "../../components/iconify";
import StarRatingDialog from "../../components/starRateHandler/StarRatingDialog";

const SelectedMaterialDetails = ({
  selectedMaterial,
  calculateAverageRating,
  setStarDialogOpen,
  handleShare,
  starDialogOpen,
  handleStarRating,
  userData,
  updateMaterialDownloadCount,
}) => {
  const [localDownloadCount, setLocalDownloadCount] = useState(
    selectedMaterial.downloadCount
  );
  const [isDownloadDisabled, setIsDownloadDisabled] = useState(false);

  useEffect(() => {
    setLocalDownloadCount(selectedMaterial.downloadCount);
    setIsDownloadDisabled(false);
  }, [selectedMaterial]);

  const handleDownload = async () => {
    if (isDownloadDisabled) return;

    try {
      const updatedCount = await updateMaterialDownloadCount(
        selectedMaterial.id,
        userData.uid
      );
      setLocalDownloadCount(updatedCount);
      setIsDownloadDisabled(true);
    } catch (error) {
      console.error("Error updating download count:", error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="outlined"
          sx={{ borderColor: "#0A4191", mr: 1 }}
          onClick={() => setStarDialogOpen(true)}
        >
          <Iconify
            icon="tabler:star"
            sx={{ color: "#FFD700", width: 20, height: 20 }}
          />
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              ml: 0.5,
              fontSize: 20,
              color: "#0A4191",
            }}
          >
            {selectedMaterial && selectedMaterial.star
              ? calculateAverageRating(selectedMaterial.star)
              : "0.00"}
          </Typography>
        </Button>
        <Tooltip
          title={
            isDownloadDisabled
              ? "Download restricted for multiple downloads"
              : ""
          }
        >
          <span>
            <Button
              variant="outlined"
              sx={{ borderColor: "#0A4191", mr: 1 }}
              onClick={handleDownload}
              disabled={isDownloadDisabled}
            >
              <Iconify
                icon="tabler:cloud-download"
                sx={{ color: "#FFD700", width: 20, height: 20 }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  ml: 1,
                  fontSize: 20,
                  color: "#0A4191",
                }}
              >
                {localDownloadCount}
              </Typography>
            </Button>
          </span>
        </Tooltip>
        <Button variant="outlined" sx={{ borderColor: "#0A4191" }}>
          <Iconify
            icon="tabler:share-3"
            sx={{ color: "#FFD700", width: 20, height: 20 }}
            onClick={handleShare}
          />
        </Button>
      </Box>
      <Typography variant="commonpdfname" gutterBottom>
        {selectedMaterial.documentName}.pdf
      </Typography>
      <Typography variant="body1" gutterBottom>
        {selectedMaterial.description}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Avatar src={selectedMaterial.uploaderPhotoUrl} sx={{ mr: 1 }} />
        <Typography variant="body2">{selectedMaterial.uploadedBy}</Typography>
      </Box>
      <StarRatingDialog
        open={starDialogOpen}
        onClose={() => setStarDialogOpen(false)}
        onRate={handleStarRating}
        currentRating={selectedMaterial?.userRatings?.[userData.uid] || 0}
      />
      <Box sx={{ display: "flex", width: "100%", height: "600px" }}>
        <Card
          sx={{
            width: "75%",
            height: "100%",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 3,
            border: 1,
            borderColor: "#000000",
          }}
        >
          <iframe
            src={`${selectedMaterial.documentUrl}#toolbar=0&navpanes=0`}
            width="100%"
            height="100%"
            title={selectedMaterial.documentName}
            style={{ border: "none" }}
          />
        </Card>
        <Card
          sx={{
            width: "25%",
            ml: 3,
            borderRadius: 2,
            border: "1px solid #ccc",
            overflow: "auto",
            height: "100%",
            boxShadow: 3,

            borderColor: "#000000",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Add a comment"
                multiline
                rows={4}
                variant="outlined"
                fullWidth
              />
              <Button variant="contained" color="primary">
                Submit
              </Button>
              {/* Example comments */}
              <Box sx={{ display: "flex", alignItems: "flex-start", mt: 2 }}>
                <Avatar sx={{ mr: 2 }}>A</Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Alice
                  </Typography>
                  <Typography variant="body2">
                    Great material! Helped me a lot.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", mt: 2 }}>
                <Avatar sx={{ mr: 2 }}>B</Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Bob
                  </Typography>
                  <Typography variant="body2">
                    Very informative and well-organized.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SelectedMaterialDetails;
