import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Iconify from "../../components/iconify";
import { useToast } from "../../hooks/ToastContext";
import StarRatingDialog from "../../components/starRateHandler/StarRatingDialog";
import YouTubeSuggestions from "./YouTubeSuggestions";

import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkIcon from "@mui/icons-material/Link";
import DownloadIcon from "@mui/icons-material/Download";
import CommentSection from "./CommentSection";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
// import Draggable from "react-draggable";

import { QRCodeSVG } from "qrcode.react";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../firebase";
const SelectedMaterialDetails = ({
  selectedMaterial,
  calculateAverageRating,
  setStarDialogOpen,
  starDialogOpen,
  handleStarRating,
  userData,
  handleDownload,
}) => {
  const containerRef = useRef(null);
  const dividerRef = useRef(null);
  const [pdfWidth, setPdfWidth] = useState(75);

  const [anchorEl, setAnchorEl] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const { showToast } = useToast();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const divider = dividerRef.current;

    if (!container || !divider) return;

    let isDragging = false;
    let startX, startWidth;

    const onMouseDown = (e) => {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      startWidth = container.getBoundingClientRect().width * (pdfWidth / 100);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const delta = e.clientX - startX;
      const containerWidth = container.getBoundingClientRect().width;
      const newWidth = ((startWidth + delta) / containerWidth) * 100;
      const clampedWidth = Math.max(20, Math.min(95, newWidth));
      setPdfWidth(clampedWidth);
    };

    const onMouseUp = () => {
      isDragging = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    divider.addEventListener("mousedown", onMouseDown);

    return () => {
      divider.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [pdfWidth]);

  useEffect(() => {
    // Check if the current document is saved by the user
    if (userData && userData.savedDocuments) {
      setIsSaved(userData.savedDocuments.includes(selectedMaterial.id));
    }
  }, [userData, selectedMaterial]);

  const handleShareClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // const handleDrag = (e, ui) => {
  //   const newPdfWidth = Math.max(20, Math.min(95, pdfWidth - ui.deltaX / 10));
  //   setPdfWidth(newPdfWidth);
  // };

  //get summary
  const generateSummary = async (text, maxRetries = 3) => {
    const API_URL =
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
    const API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY;
    const MAX_INPUT_LENGTH = 1024;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const truncatedText = text.slice(0, MAX_INPUT_LENGTH);
        const response = await axios.post(
          API_URL,
          {
            inputs: truncatedText,
            parameters: { max_length: 150 },
          },
          { headers: { Authorization: `Bearer ${API_KEY}` } }
        );
        return response.data[0].summary_text;
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        if (error.response) {
          console.error("Error response:", error.response.data);
        }
        if (attempt === maxRetries - 1) {
          throw new Error(
            "Failed to generate summary after multiple attempts."
          );
        }
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  };
  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    try {
      const response = await fetch(
        `http://localhost:10000/api/get-pdf-text/${selectedMaterial.id}`
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch PDF text: ${response.status} ${response.statusText}`
        );
      }
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      const { text } = JSON.parse(responseText);

      // Generate summary
      const summary = await generateSummary(text);
      setSummary(summary);
      setSummaryDialogOpen(true);
    } catch (error) {
      console.error("Error generating summary:", error);
      showToast("error", "Failed to generate summary");
    } finally {
      setIsSummaryLoading(false);
    }
  };
  const handleShareClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  const handleSaveToggle = async () => {
    if (!userData || !userData.uid) {
      showToast("error", "You must be logged in to save documents");
      return;
    }

    const userRef = doc(db, "users", userData.uid);
    try {
      if (isSaved) {
        await updateDoc(userRef, {
          savedDocuments: arrayRemove(selectedMaterial.id),
        });
        setIsSaved(false);
        showToast("success", "Document removed from saved items");
      } else {
        await updateDoc(userRef, {
          savedDocuments: arrayUnion(selectedMaterial.id),
        });
        setIsSaved(true);
        showToast("success", "Document saved successfully");
      }
    } catch (error) {
      console.error("Error updating saved documents:", error);
      showToast("error", "Failed to update saved documents");
    }
    handleMenuClose();
  };

  const handleReport = () => {
    setReportDialogOpen(true);
    handleMenuClose();
  };

  const handleReportConfirm = async () => {
    if (!userData || !userData.uid) {
      showToast("error", "You must be logged in to report documents");
      setReportDialogOpen(false);
      return;
    }

    try {
      const docRef = doc(db, "documents", selectedMaterial.id);
      const userRef = doc(db, "users", selectedMaterial.uploaderUid);
      console.log(userRef);
      const reporterRef = doc(db, "users", userData.uid);

      const docSnap = await getDoc(docRef);
      const documentData = docSnap.data();

      if (
        documentData.reportedBy &&
        documentData.reportedBy.includes(userData.uid)
      ) {
        showToast("error", "You have already reported this document");
        setReportDialogOpen(false);
        return;
      }

      // Update document report count and add reporter to the list
      await updateDoc(docRef, {
        reportCount: increment(1),
        reportedBy: arrayUnion(userData.uid),
      });

      // Update uploader's report count
      await updateDoc(userRef, {
        reportCount: increment(1),
      });

      // Add reported document to reporter's list
      await updateDoc(reporterRef, {
        reportedDocuments: arrayUnion(selectedMaterial.id),
      });

      // Check if document report count reaches 5
      if (documentData.reportCount >= 4) {
        // It will become 5 after this report
        // Delete the document from Firestore
        await deleteDoc(docRef);

        // Delete the file from Firebase Storage
        const storageRef = ref(storage, `documents/${selectedMaterial.id}`);
        await deleteObject(storageRef);

        showToast("error", "Document has been removed due to multiple reports");
        // You might want to navigate the user away from this page or update the UI
      }

      // Check if uploader's report count reaches 8
      const uploaderSnap = await getDoc(userRef);
      const uploaderData = uploaderSnap.data();
      if (uploaderData.reportCount >= 7) {
        // It will become 8 after this report
        await updateDoc(userRef, {
          status: "banned",
        });
        showToast(
          "error",
          "The uploader has been banned due to multiple reports"
        );
      }

      showToast("success", "Document reported successfully");
    } catch (error) {
      console.error("Error reporting document:", error);
      showToast("error", "Failed to report document");
    }

    setReportDialogOpen(false);
  };

  const open = Boolean(anchorEl);
  const menuOpen = Boolean(menuAnchorEl);
  const shareId = open ? "share-popover" : undefined;
  const menuId = menuOpen ? "menu-popover" : undefined;

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

  //user profile navigate
  const navigate = useNavigate();

  const handleUserClick = (userId) => {
    navigate(`/dashboard/profile/${userId}`);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="outlined"
          sx={{
            borderColor: "#0A4191",
            mr: 1,
            position: "relative",
            color: "#0A4191",
          }}
          onClick={handleGenerateSummary}
          disabled={isSummaryLoading}
        >
          <Iconify
            icon="mdi:text-box-check-outline"
            sx={{ color: "#FFD700", width: 20, height: 20, mr: 1 }}
          />
          {isSummaryLoading ? "Generating..." : "Generate Summary"}
          <Box
            component="span"
            sx={{
              color: "green",
              fontSize: "0.4rem",
              padding: "0.5px 6px 0.5px",
              borderRadius: "10px",
              border: "1px solid green",
              marginLeft: "4px",
              position: "relative",
              top: "-8px",
            }}
          >
            BETA
          </Box>
        </Button>
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
          sx={{ borderColor: "#0A4191", mr: 1 }}
          onClick={handleShareClick}
        >
          <Iconify
            icon="tabler:share-3"
            sx={{ color: "#FFD700", width: 20, height: 20 }}
          />
        </Button>
        <Button
          variant="outlined"
          sx={{ borderColor: "#0A4191" }}
          onClick={handleMenuClick}
        >
          <Iconify icon="gg:more-vertical" sx={{ color: "#FFD700" }} />
        </Button>

        {/* dialog for summary  */}
        <Dialog
          open={summaryDialogOpen}
          onClose={() => setSummaryDialogOpen(false)}
          aria-labelledby="summary-dialog-title"
          aria-describedby="summary-dialog-description"
          maxWidth="md"
          fullWidth
        >
          <DialogTitle id="summary-dialog-title">Document Summary</DialogTitle>
          <DialogContent>
            <DialogContentText id="summary-dialog-description">
              {summary}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSummaryDialogOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        {/* popover of share  */}
        <Popover
          id={shareId}
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

        {/* popover of menu  */}

        <Popover
          id={menuId}
          open={menuOpen}
          anchorEl={menuAnchorEl}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <List>
            <ListItem button onClick={handleSaveToggle}>
              <Box>
                {isSaved ? (
                  <Iconify
                    icon="material-symbols:bookmark"
                    sx={{
                      color: "#0000FF",
                      width: 20,
                      height: 20,
                      mr: 1,
                      mt: 0.7,
                    }}
                  />
                ) : (
                  <Iconify
                    icon="material-symbols:bookmark-outline"
                    sx={{ width: 20, height: 20, mr: 1, mt: 0.7 }}
                  />
                )}
              </Box>

              <ListItemText
                primary={isSaved ? "Saved" : "Save"}
                primaryTypographyProps={{
                  color: isSaved ? "#0000FF" : "inherit",
                }}
              />
            </ListItem>
            <ListItem button onClick={handleReport}>
              <Iconify
                icon="ic:outline-report"
                sx={{ color: "#FF0000", width: 20, height: 20, mr: 1 }}
              />
              <ListItemText
                primary="Report"
                primaryTypographyProps={{ color: "error" }}
              />
            </ListItem>
          </List>
        </Popover>

        {/* Report dialog  */}

        <Dialog
          open={reportDialogOpen}
          onClose={() => setReportDialogOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          sx={{
            backdropFilter: "blur(3px)",
            backgroundColor: "rgba(0,0,30,0.4)",
          }}
        >
          <DialogTitle id="alert-dialog-title">{"Report Document"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to report "{selectedMaterial.documentName}"?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReportDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleReportConfirm} color="error" autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Typography variant="commonpdfname" gutterBottom>
        {selectedMaterial.documentName}.pdf
      </Typography>
      <Typography variant="body1" gutterBottom>
        {selectedMaterial.description}
      </Typography>
      <Box
        sx={{ display: "flex", alignItems: "center", mb: 2, cursor: "pointer" }}
        onClick={() => handleUserClick(userData.uid)}
      >
        <Avatar src={selectedMaterial.uploaderPhotoUrl} sx={{ mr: 1 }} />
        <Typography variant="body2">{selectedMaterial.uploadedBy}</Typography>
      </Box>
      <StarRatingDialog
        open={starDialogOpen}
        onClose={() => setStarDialogOpen(false)}
        onRate={handleStarRating}
        currentRating={selectedMaterial?.userRatings?.[userData.uid] || 0}
      />
      <Box sx={{ height: "600px", width: "100%" }}>
        <PanelGroup direction="horizontal">
          <Panel defaultSize={pdfWidth} minSize={20}>
            <Box
              sx={{
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
            </Box>
          </Panel>
          <PanelResizeHandle />
          <Panel>
            <Box sx={{ height: "100%", ml: 1 }}>
              <CommentSection
                documentId={selectedMaterial.id}
                currentUser={userData}
              />
            </Box>
          </Panel>
        </PanelGroup>
      </Box>
      <YouTubeSuggestions
        documentName={selectedMaterial.documentName}
        documentTopics={selectedMaterial.documentTopics || []}
      />
    </Box>
  );
};

export default SelectedMaterialDetails;
