import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import {
  updateDoc,
  doc,
  increment,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db, storage } from "../../firebase";
import { ref, deleteObject } from "firebase/storage";

import { useToast } from "../../hooks/ToastContext";
import LottieLoader from "../../components/LottieLoader";
import { useUser } from "../../hooks/UserContext";
import Iconify from "../../components/iconify";
import { formatTimeAgo } from "../../utils/timeUtils";

function VerifyStudyMaterialCard({ material, onApprove, onReject }) {
  const [open, setOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { userData } = useUser();
  const [isDeciding, setIsDeciding] = useState(false);
  const { showToast } = useToast();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRejectDialogOpen = () => {
    setRejectDialogOpen(true);
  };

  const handleRejectDialogClose = () => {
    setRejectDialogOpen(false);
    setRejectionReason("");
  };

  const handleApprove = async () => {
    setIsDeciding(true);
    try {
      await updateDoc(doc(db, "documents", material.id), {
        visibility: "public",
        Approved: "Yes",
        verifiedOn: serverTimestamp(),
      });
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + "/api/approve-document",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: material.id,
            userEmail: material.uploaderEmail,
            documentName: material.documentName,
            docupDate: material.uploadedOn,
            verifiedBy: userData.displayName,
            verifiedOn: material.verifiedOn,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      await updateDoc(doc(db, "users", material.uploaderUid), {
        uploadCount: increment(1),
        points: increment(20),
        countOfApprove: increment(1),
        uploadedDoc: arrayUnion(material.id),
      });
      await updateDoc(doc(db, "users", userData.uid), {
        contribution: increment(1),
      });
      onApprove(material.id);
      setIsDeciding(false);
      handleClose();
      showToast("success", "Document successfully Approved");
    } catch (error) {
      console.error("Error Approving document:", error);
      showToast("error", "Error while Approving this document!!");
    } finally {
      setIsDeciding(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showToast("error", "Please provide a reason for rejection");
      return;
    }
    setIsDeciding(true);
    try {
      await updateDoc(doc(db, "users", material.uploaderUid), {
        countOfRejection: increment(1),
        points: increment(-45),
      });
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + "/api/reject-document",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: material.id,
            userEmail: material.uploaderEmail,
            documentName: material.documentName,
            verifiedBy: userData.displayName,
            verifiedOn: material.verifiedOn,
            rejectionReason,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      await deleteDoc(doc(db, "documents", material.id));
      const storageRef = ref(storage, material.documentUrl);
      await deleteObject(storageRef);
      onReject(material.id, rejectionReason);
      handleClose();
      handleRejectDialogClose();
      showToast("success", "Document successfully Rejected");
    } catch (error) {
      console.error("Error rejecting document:", error);
      showToast("error", "Error while rejecting this document!!");
    } finally {
      setIsDeciding(false);
    }
  };

  return (
    <>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          p: 2,
          height: "100%",
          cursor: "pointer",
          boxShadow: 3,
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#101010" : "#fff",
          borderRadius: 2,
        }}
        onClick={handleClickOpen}
      >
        <Box
          sx={{
            width: "100%",
            height: 120,
            mb: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "grey.200",
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
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" noWrap sx={{ mb: 1 }}>
            {material.documentName}.pdf
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {material.description}
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar src={material.uploaderPhotoUrl} alt={material.uploadedBy} />
          <Stack direction="column" sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap>
              {material.uploadedBy}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary" }}
              noWrap
            >
              {material.uploaderCourse} •{" "}
              {formatTimeAgo(material.uploadedOn.toDate())}
            </Typography>
          </Stack>
        </Stack>
      </Card>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        style={{
          backdropFilter: "blur(3px)",
          backgroundColor: "rgba(0,0,30,0.4)",
        }}
      >
        {isDeciding && <LottieLoader />}
        <DialogTitle>{material.documentName}</DialogTitle>
        <DialogContent>
          <iframe
            src={`${material.documentUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            width="100%"
            height="600px"
            title={material.documentName}
            style={{ border: "none", borderRadius: 8 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleRejectDialogOpen}
            color="error"
            variant="contained"
          >
            <Iconify
              icon="fluent:text-change-reject-20-filled"
              sx={{ width: 20, height: 20, mr: 1 }}
            />
            Reject
          </Button>
          <Button onClick={handleApprove} color="success" variant="contained">
            <Iconify
              icon="material-symbols:order-approve"
              sx={{ width: 20, height: 20, mr: 1 }}
            />
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectDialogOpen} onClose={handleRejectDialogClose}>
        {isDeciding && <LottieLoader />}
        <DialogTitle>Reject Document</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reject this document?
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="rejection-reason"
            label="Reason for Rejection"
            type="text"
            fullWidth
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleReject} color="error">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

VerifyStudyMaterialCard.propTypes = {
  material: PropTypes.object.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};

export default VerifyStudyMaterialCard;
