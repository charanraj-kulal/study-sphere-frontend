import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  Avatar,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  useMediaQuery,
  useTheme,
  IconButton,
  Button,
  Stack,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkIcon from "@mui/icons-material/Link";
import DownloadIcon from "@mui/icons-material/Download";
import StarIcon from "@mui/icons-material/Star";
import GetAppIcon from "@mui/icons-material/GetApp";
import Iconify from "../../components/iconify";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { formatTimeAgo } from "../../utils/timeUtils";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "../../hooks/ToastContext";

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

const UserDetailsDialog = ({ open, onClose, userId, user, currentUser }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { showToast } = useToast();

  const [userDocuments, setUserDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchUserDocuments = async () => {
      if (!user || !user.uploadedDoc) return;

      setLoading(true);
      try {
        const documentsRef = collection(db, "documents");
        const q = query(
          documentsRef,
          where("__name__", "in", user.uploadedDoc)
        );
        const querySnapshot = await getDocs(q);

        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUserDocuments(docs);
      } catch (error) {
        console.error("Error fetching user documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDocuments();
  }, [user]);

  // following use effect
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (currentUser && currentUser.userRole === 3) {
        const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));
        const followingUsers = currentUserDoc.data().followingUsers || [];
        setIsFollowing(followingUsers.includes(userId));
      }
    };

    checkFollowStatus();
  }, [currentUser, userId]);
  const handleGoBack = () => {
    onClose();
    navigate(1);
  };

  const handleDocumentClick = (documentId) => {
    navigate(`/dashboard/download?documentId=${documentId}`);
  };

  const handleDownload = (material) => {
    // Implement download logic here
    console.log("Downloading:", material.documentName);
  };
  const handleShareClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setAnchorEl(null);
  };

  const shareUrl = `${window.location.origin}/dashboard/profile/${userId}`;

  const handleEmailShare = () => {
    window.location.href = `mailto:?subject=Check out this user profile&body=I thought you might be interested in this user profile: ${shareUrl}`;
    handleShareClose();
  };

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=Check out this user profile: ${shareUrl}`);
    handleShareClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    handleShareClose();
    showToast("success", "Link copied to your clipboard");
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
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "Study_sphere_user_profile_QRCode";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  //follow functionalities
  const handleFollowToggle = async () => {
    if (!currentUser || currentUser.userRole !== 3) return;

    const currentUserRef = doc(db, "users", currentUser.uid);
    const displayedUserRef = doc(db, "users", userId);
    try {
      if (isFollowing) {
        await updateDoc(currentUserRef, {
          followingUsers: arrayRemove(userId),
        });
        await updateDoc(displayedUserRef, {
          followers: arrayRemove(currentUser.uid),
        });
      } else {
        await updateDoc(currentUserRef, {
          followingUsers: arrayUnion(userId),
        });
        await updateDoc(displayedUserRef, {
          followers: arrayUnion(currentUser.uid),
        });
      }
      setIsFollowing(!isFollowing);
      showToast(
        "info",
        isFollowing ? `Unfollowed ${user.name}` : `Followed ${user.name}`
      );
    } catch (error) {
      console.error("Error updating follow status:", error);
      showToast("error", "Failed to update follow status");
    }
  };
  const isSharePopoverOpen = Boolean(anchorEl);
  const shareId = isSharePopoverOpen ? "share-popover" : undefined;

  if (!user) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        maxWidth="md"
        fullWidth
        sx={{
          backdropFilter: "blur(3px)",
          backgroundColor: "rgba(0,0,30,0.4)",
        }}
      >
        <DialogContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton onClick={handleGoBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">Go Back</Typography>
          </Box>

          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>

          <Grid container spacing={3}>
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={user.profilePhotoURL}
                  alt={user.name}
                  sx={{ width: 80, height: 80, mr: 2 }}
                />
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box>
                    <Typography variant="h5">{user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  {currentUser &&
                    currentUser.userRole === 3 &&
                    currentUser.uid !== userId && (
                      <Button
                        variant="contained"
                        onClick={handleFollowToggle}
                        sx={{
                          backgroundColor: isFollowing ? "#FFD700" : "#0A4191",
                          mr: -1,
                          color: isFollowing ? "#000000" : "#FFFFFF",
                          "&:hover": {
                            backgroundColor: isFollowing
                              ? "#E6C200"
                              : "#083470",
                          },
                        }}
                      >
                        <Iconify
                          width={15}
                          height={15}
                          icon={
                            isFollowing
                              ? "simple-line-icons:user-following"
                              : "simple-line-icons:user-follow"
                          }
                          sx={{ mr: 1, ml: -0.5 }}
                        />
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                    )}
                </Stack>
              </Box>
              <Button
                variant="outlined"
                sx={{ borderColor: "#0A4191" }}
                onClick={handleShareClick}
              >
                <Iconify
                  icon="tabler:share-3"
                  sx={{ color: "#FFD700", width: 20, height: 20, mr: 1 }}
                />
                Share
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Studies
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Iconify
                      icon="mdi:school"
                      sx={{ mr: 1, color: "#0033a0" }}
                    />
                    <Typography variant="body2">{user.collegeName}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Iconify
                      icon="mdi:book-open-variant"
                      sx={{ mr: 1, color: "#0033a0" }}
                    />
                    <Typography variant="body2">{user.course}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Iconify
                      icon="mdi:star-four-points-circle"
                      sx={{ mr: 1, color: "warning.main" }}
                    />
                    <Typography variant="body2">
                      {user.points} Points
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ alignItems: "center", justifyContent: "center" }}>
                <CardContent
                  sx={{ alignItems: "center", justifyContent: "center" }}
                >
                  <Typography variant="h6" gutterBottom>
                    Stats
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Iconify
                      icon="mdi:upload"
                      sx={{ mr: 1, color: "	#0033a0" }}
                    />
                    <Typography variant="body2">
                      Uploads: {user.uploadCount}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Iconify
                      icon="mdi:check-circle"
                      sx={{ mr: 1, color: "	#008000" }}
                    />
                    <Typography variant="body2">
                      Approved: {user.countOfApprove}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Iconify
                      icon="mdi:close-circle"
                      sx={{ mr: 1, color: "	#FF0000" }}
                    />
                    <Typography variant="body2">
                      Rejected: {user.countOfRejection}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Shared Documents ({userDocuments.length})
              </Typography>

              {userDocuments.map((material) => (
                <Grid item xs={12} key={material.id}>
                  <Card
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      p: 2,
                      boxShadow: 3,
                      borderRadius: 2,
                      cursor: "pointer",
                      mt: 2,
                      "&:hover": {
                        boxShadow: 6,
                      },
                    }}
                    onClick={() => handleDocumentClick(material.id)}
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
                          <Stack
                            direction="row"
                            alignItems="center"
                            marginRight={1}
                          >
                            <IconButton
                              size="small"
                              sx={{ color: "warning.main" }}
                            >
                              <StarIcon fontSize="small" />
                            </IconButton>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold" }}
                            >
                              {calculateAverageRating(material.star)}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center">
                            <IconButton
                              size="small"
                              sx={{ color: "primary.main" }}
                            >
                              <GetAppIcon fontSize="small" />
                            </IconButton>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold" }}
                            >
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
          </Grid>
          <Popover
            id={shareId}
            open={isSharePopoverOpen}
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
                sx={{ mt: 1, backgroundColor: "#0A4191", color: "#ffff", p: 1 }}
              >
                Download QR Code
              </Button>
            </Box>
          </Popover>
        </DialogContent>
      </Dialog>
    </>
  );
};

UserDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  currentUser: PropTypes.object.isRequired,
  user: PropTypes.object,
};
export default UserDetailsDialog;
