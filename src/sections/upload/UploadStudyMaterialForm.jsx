import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/system";
import { useTranslation } from "react-i18next";
import { storage, db } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { useToast } from "../../hooks/ToastContext";
import LottieLoader from "../../components/LottieLoader";
import InfoIcon from "@mui/icons-material/Info";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { ConfettiButton } from "../../components/magicui/confetti-button";
import UploadDocumentTopics from "./upload-document-topics";

const StyledForm = styled("form")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  position: "relative",
}));

const PointsInfo = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
}));

const PointsInfoMain = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(3),
  left: theme.spacing(4),
  textAlign: "left",
}));

const UploadStudyMaterialForm = ({ currentUser }) => {
  const { t } = useTranslation(); // Initialize translation hook
  const [formData, setFormData] = useState({
    documentName: "",
    document: null,
    documentTopics: [],
    description: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [points, setPoints] = useState(0);
  const { showToast } = useToast();
  const confettiRef = useRef(null);

  const calculatePoints = () => {
    let totalPoints = 10;
    totalPoints += Math.min(formData.documentTopics.length, 3) * 5;
    totalPoints += Math.min(formData.description.length, 20);
    setPoints(totalPoints);
  };

  useEffect(() => {
    calculatePoints();
  }, [formData]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setFormData((prevData) => ({ ...prevData, document: file }));
    } else {
      showToast("error", t("upload_error"));
    }
  };

  const handleTopicsChange = (newValue) => {
    setFormData((prevData) => ({ ...prevData, documentTopics: newValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!agreedToTerms) {
      showToast("error", t("terms_error"));
      return;
    }

    if (!formData.documentName || !formData.document) {
      showToast("error", t("warning_document_required"));
      return;
    }

    setIsUploading(true);

    try {
      const storageRef = ref(
        storage,
        `StudyMaterials/${currentUser.displayName}/${formData.documentName}.pdf`
      );
      const snapshot = await uploadBytes(storageRef, formData.document);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "documents"), {
        documentName: formData.documentName,
        documentTopics: formData.documentTopics,
        description: formData.description,
        documentUrl: downloadURL,
        uploadedBy: currentUser.displayName,
        uploaderCourse: currentUser.course,
        uploaderPhotoUrl: currentUser.photoURL,
        uploaderUid: currentUser.uid,
        uploaderEmail: currentUser.email,
        uploadedOn: serverTimestamp(),
        visibility: "private",
        Approved: "No",
        downloadCount: 0,
        star: [0, 0, 0, 0, 0],
      });

      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        points: increment(points),
      });

      showToast("success", t("success_upload", { points }));
      confettiRef.current.fire();
      setFormData({
        documentName: "",
        document: null,
        documentTopics: [],
        description: "",
      });
      setAgreedToTerms(false);
    } catch (error) {
      console.error("Error uploading document:", error);
      showToast("error", t("upload_error"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      {isUploading && <LottieLoader />}
      <PointsInfoMain>
        <Typography
          variant="subtitle2"
          sx={{
            typography: { sm: "body1", xs: "body2" },
            color: "#b71c1c",
            display: "flex",
            alignItems: "center",
          }}
        >
          {t("points_info")}
          <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5 }} />
        </Typography>
      </PointsInfoMain>
      <PointsInfo>
        <Tooltip title={t("upload_pdf_tooltip")}>
          <Box display="flex" alignItems="center">
            <IconButton size="small">
              <InfoIcon sx={{ color: "warning.main" }} />
            </IconButton>
            <Typography variant="subtitle2" sx={{ color: "info.main", mr: 1 }}>
              {t("pointing_system")}
            </Typography>
          </Box>
        </Tooltip>
      </PointsInfo>
      <TextField
        name="documentName"
        label={t("document_name")}
        sx={{ mt: 7 }}
        value={formData.documentName}
        onChange={handleInputChange}
        required
        fullWidth
      />
      <Box>
        <input
          accept=".pdf"
          style={{ display: "none" }}
          id="raised-button-file"
          type="file"
          onChange={handleFileChange}
          required
        />
        <label htmlFor="raised-button-file">
          <Button
            variant="contained"
            component="span"
            sx={{ backgroundColor: "#0A4191" }}
          >
            {t("upload_pdf")}
          </Button>
        </label>
        {formData.document && <Typography>{formData.document.name}</Typography>}
      </Box>
      {(!formData.documentName || !formData.document) && (
        <Alert severity="warning">{t("warning_document_required")}</Alert>
      )}
      <UploadDocumentTopics
        value={formData.documentTopics}
        onChange={handleTopicsChange}
      />
      <TextField
        name="description"
        label={t("description")}
        value={formData.description}
        onChange={handleInputChange}
        multiline
        rows={4}
        fullWidth
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            name="agreedToTerms"
            color="primary"
          />
        }
        label={t("agree_terms")}
      />
      <ConfettiButton
        type="submit"
        variant="contained"
        color="primary"
        sx={{ backgroundColor: "#0A4191" }}
        disabled={isUploading || !agreedToTerms}
        ref={confettiRef}
        fullWidth
      >
        {isUploading ? (
          <CircularProgress size={24} />
        ) : (
          t("upload_now", { points })
        )}
      </ConfettiButton>
    </StyledForm>
  );
};

export default UploadStudyMaterialForm;
