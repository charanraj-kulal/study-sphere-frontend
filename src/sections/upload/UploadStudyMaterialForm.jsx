import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Chip,
  Autocomplete,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/system";
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

//magic Ui
// import TypingAnimation from "../../components/magicui/typing-animation";
import ShinyButton from "../../components/magicui/shiny-button";

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

  const calculatePoints = () => {
    let totalPoints = 10; // Base points for uploading a PDF
    totalPoints += Math.min(formData.documentTopics.length, 3) * 5; // Points for topics (max 3)
    totalPoints += Math.min(formData.description.length, 20); // Points for description (max 20)
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
      showToast("error", "Please upload only PDF files.");
    }
  };

  const handleTopicsChange = (event, newValue) => {
    setFormData((prevData) => ({ ...prevData, documentTopics: newValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!agreedToTerms) {
      showToast("error", "Please agree to the terms before submitting.");
      return;
    }

    if (!formData.documentName || !formData.document) {
      showToast("error", "Document Name and File are required.");
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
        uploadedOn: serverTimestamp(),
        visibility: "private",
      });

      // Update user document in Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        uploadCount: increment(1),
        points: increment(points),
      });

      showToast(
        "success",
        `Document uploaded successfully! You earned ${points} points!`
      );
      setFormData({
        documentName: "",
        document: null,
        documentTopics: [],
        description: "",
      });
      setAgreedToTerms(false);
    } catch (error) {
      console.error("Error uploading document:", error);
      showToast("error", "An error occurred while uploading the document.");
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
          {/* <TypingAnimation loop> */}
          Earn up to 45 points for each upload! Check out our pointing system
          here
          <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5 }} />
          {/* </TypingAnimation> */}
        </Typography>
      </PointsInfoMain>
      <PointsInfo>
        <Tooltip
          title="Upload PDF: +10 points&#10;Each topic (max 3): +5 points&#10;Description (max 20 chars): +1 point per char"
        >
          <Box display="flex" alignItems="center">
            <IconButton size="small">
              <InfoIcon sx={{ color: "warning.main" }} />
            </IconButton>
            <Typography variant="subtitle2" sx={{ color: "info.main", mr: 1 }}>
              Pointing System
            </Typography>
          </Box>
        </Tooltip>
      </PointsInfo>
      <TextField
        name="documentName"
        label="Document Name"
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
          <Button variant="contained" component="span">
            Upload PDF Document
          </Button>
        </label>
        {formData.document && <Typography>{formData.document.name}</Typography>}
      </Box>
      {(!formData.documentName || !formData.document) && (
        <Alert severity="warning">Document Name and File are required.</Alert>
      )}
      <Autocomplete
        multiple
        id="documentTopics"
        options={["js", "css", "chemistry", "physics"]}
        freeSolo
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Document Topics"
            placeholder="Add topics"
          />
        )}
        value={formData.documentTopics}
        onChange={handleTopicsChange}
      />
      <TextField
        name="description"
        label="Description"
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
        label="I agree that the submitted document is genuine. I understand that submitting non-genuine documents may result in being banned from the system."
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isUploading || !agreedToTerms}
      >
        {isUploading ? (
          <CircularProgress size={24} />
        ) : (
          `Upload Now and Get ${points} Points`
        )}
      </Button>
    </StyledForm>
  );
};

export default UploadStudyMaterialForm;