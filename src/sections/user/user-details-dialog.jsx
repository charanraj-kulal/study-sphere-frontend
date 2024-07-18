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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Iconify from "../../components/iconify";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const UserDetailsDialog = ({ open, onClose, userId, user }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [userDocuments, setUserDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleGoBack = () => {
    onClose();
    navigate(1);
  };

  const handleDocumentClick = (documentId) => {
    navigate(`/dashboard/download?documentId=${documentId}`);
  };

  if (!user) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        maxWidth="md"
        fullWidth
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
                <Box>
                  <Typography variant="h5">{user.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
              </Box>
              <Button startIcon={<ShareIcon />}>Share</Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Studies
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Iconify icon="mdi:school" sx={{ mr: 1 }} />
                    <Typography variant="body2">{user.collegeName}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Iconify icon="mdi:book-open-variant" sx={{ mr: 1 }} />
                    <Typography variant="body2">{user.course}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Iconify icon="mdi:star" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {user.points} Points
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Stats
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Iconify icon="mdi:upload" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Uploads: {user.uploadCount}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Iconify icon="mdi:check-circle" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Approved: {user.countOfApprove}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Iconify icon="mdi:close-circle" sx={{ mr: 1 }} />
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
              {loading ? (
                <Typography>Loading documents...</Typography>
              ) : (
                userDocuments.map((doc) => (
                  <Card
                    key={doc.id}
                    sx={{ mb: 2, cursor: "pointer" }}
                    onClick={() => handleDocumentClick(doc.id)}
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
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
                            src={`${doc.documentUrl}#page=1&view=FitBH&viewrect=0,0,100,100`}
                            width="100%"
                            height="100%"
                            title={`${doc.documentName} thumbnail`}
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
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">
                            {doc.documentName}
                          </Typography>
                          <Typography variant="body2">
                            {doc.description}
                          </Typography>
                          <Typography variant="body2">
                            Uploaded on:{" "}
                            {doc.uploadedOn.toDate().toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2">
                            Download Count: {doc.downloadCount}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

UserDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  user: PropTypes.object,
};
export default UserDetailsDialog;
