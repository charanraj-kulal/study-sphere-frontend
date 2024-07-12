import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Iconify from "../../components/iconify";
import { useToast } from "../../hooks/ToastContext";
import StarRatingDialog from "../../components/starRateHandler/StarRatingDialog";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkIcon from "@mui/icons-material/Link";

import DownloadIcon from "@mui/icons-material/Download";
import { QRCodeSVG } from "qrcode.react";

const SelectedMaterialDetails = ({
  selectedMaterial,
  calculateAverageRating,
  setStarDialogOpen,

  starDialogOpen,
  handleStarRating,
  userData,
  handleDownload,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { showToast } = useToast();

  const handleShareClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "share-popover" : undefined;

  const shareUrl = `${window.location.origin}/dashboard/download?documentId=${selectedMaterial.id}`;

  const handleEmailShare = () => {
    window.location.href = `mailto:?subject=Check out this document&body=I thought you might be interested in this document: ${shareUrl}`;
    handleShareClose();
  };

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=Check out this document: ${shareUrl}`);
    handleShareClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);

    handleShareClose();
    showToast("success", "Link copied to your clipboard");
    // You might want to show a toast or some feedback here
  };

  const handleQrCodeDownload = () => {
    const svg = document.getElementById("QRCode");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 1, 1);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "Study_sphere_shared_QRCode";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
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
        <Button
          variant="outlined"
          sx={{ borderColor: "#0A4191", mr: 1 }}
          onClick={() => handleDownload(selectedMaterial)} // Change this line
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
            {selectedMaterial.downloadCount || 0}
          </Typography>
        </Button>
        <Button
          variant="outlined"
          sx={{ borderColor: "#0A4191" }}
          onClick={handleShareClick}
        >
          <Iconify
            icon="tabler:share-3"
            sx={{ color: "#FFD700", width: 20, height: 20 }}
          />
        </Button>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleShareClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <List>
            <ListItem button onClick={handleEmailShare}>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText primary="Email" />
            </ListItem>
            <ListItem button onClick={handleWhatsAppShare}>
              <ListItemIcon>
                <WhatsAppIcon />
              </ListItemIcon>
              <ListItemText primary="WhatsApp" />
            </ListItem>
            <ListItem button onClick={handleCopyLink}>
              <ListItemIcon>
                <LinkIcon />
              </ListItemIcon>
              <ListItemText primary="Copy Link" />
            </ListItem>
          </List>
          <Box
            sx={{
              p: 2,
              // textAlign: "center",
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              QR Code
            </Typography>
            <QRCodeSVG id="QRCode" value={shareUrl} size={128} level="M" />
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleQrCodeDownload}
              sx={{ mt: 1, backgroundColor: "#0A4191", color: "#ffff", p: -1 }}
            >
              Download QR Code
            </Button>
          </Box>
        </Popover>
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
