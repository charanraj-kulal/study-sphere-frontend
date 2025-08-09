import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import { useToast } from "../../../hooks/ToastContext";
import LottieLoader from "../../../components/LottieLoader";
import SearchBar from "../searchbar-for-study-material";
import StudyMaterialCards from "../download-studyMaterial-card";
import { useUser } from "../../../hooks/UserContext";
import BreadcrumbsNavigation from "../BreadcrumbsNavigation";
import SelectedMaterialDetails from "../SelectedMaterialDetails";
import { useTranslation } from "react-i18next";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import IllustrationGif from "assets/illustrations/illustration_download_pdf.gif";

export default function DownloadStudyMaterialView() {
  const { t } = useTranslation(); // Translation hook
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useUser();

  const [studyMaterials, setStudyMaterials] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState([
    t("dashboard"),
    t("download"),
  ]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [starDialogOpen, setStarDialogOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const documentId = urlParams.get("documentId");
    const searchParam = urlParams.get("search");
    if (documentId) {
      handleCardClick({ id: documentId });
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    const fetchStudyMaterials = async () => {
      if (!searchQuery) {
        setStudyMaterials([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const materialsRef = collection(db, "documents");
      const q = query(
        materialsRef,
        where("visibility", "==", "public"),
        where("Approved", "==", "Yes"),
        orderBy("uploadedOn", "desc")
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
      setLoading(false);
    };

    fetchStudyMaterials();
  }, [searchQuery, location]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setLoading(true);
    setSelectedMaterial(null);
    navigate(`/dashboard/download?search=${encodeURIComponent(query)}`, {
      replace: true,
    });
  };

  const handleCardClick = async (material) => {
    setIsProcessing(true);
    try {
      const docRef = doc(db, "documents", material.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const updatedMaterial = { id: docSnap.id, ...docSnap.data() };
        setSelectedMaterial(updatedMaterial);
        setBreadcrumbs([
          t("dashboard"),
          t("download"),
          updatedMaterial.documentName,
        ]);
        // Update URL without redirecting
        navigate(`/dashboard/download?documentId=${material.id}`, {
          replace: true,
        });
      } else {
        console.log("No such document!");
        showToast("error", t("error_document_not_found"));
      }
    } catch (error) {
      console.error("Error fetching updated document:", error);
      showToast("error", t("error_fetching_document"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBreadcrumbClick = (event, index) => {
    event.preventDefault();
    if (index === 0) {
      navigate("/dashboard");
      setBreadcrumbs([t("dashboard"), t("download")]);
      setSelectedMaterial(null);
      // Remove documentId from URL
    } else if (index === 1) {
      setBreadcrumbs([t("dashboard"), t("download")]);
      setSelectedMaterial(null);
      // Remove documentId from URL
      navigate("/dashboard/download", { replace: true });
    }
  };

  const handleDownload = async (material) => {
    if (!material || !material.id) {
      console.error("Invalid material object:", material);
      showToast("error", t("error_invalid_material_data"));
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/download/${material.id}?userId=${userData.uid}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${material.documentName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      showToast("success", t("success_document_downloaded"));
    } catch (error) {
      console.error("Error initiating download:", error);
      showToast(
        "error",
        `${t("failed_to_initiate_download")}: ${error.message}`
      );
    }
  };

  const handleStarRating = async (rating) => {
    if (!selectedMaterial || !userData) return;

    const docRef = doc(db, "documents", selectedMaterial.id);
    setIsProcessing(true);
    try {
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.data();

      let newStarArray = Array.isArray(currentData.star)
        ? [...currentData.star]
        : [0, 0, 0, 0, 0];
      let userRatings = currentData.userRatings || {};

      const previousRating = userRatings[userData.uid];
      if (previousRating) {
        newStarArray[previousRating - 1] = Math.max(
          0,
          newStarArray[previousRating - 1] - 1
        );
      }

      newStarArray[rating - 1] += 1;

      userRatings[userData.uid] = rating;

      await updateDoc(docRef, {
        star: newStarArray,
        userRatings: userRatings,
      });

      setSelectedMaterial((prevMaterial) => ({
        ...prevMaterial,
        star: newStarArray,
        userRatings: userRatings,
      }));

      showToast(
        "success",
        previousRating ? t("rating_updated") : t("thank_you_for_rating")
      );
    } catch (error) {
      console.error("Error updating rating:", error.message, error.code);
      showToast("error", `${t("failed_to_update_rating")}: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateAverageRating = (starArray) => {
    if (!Array.isArray(starArray) || starArray.length === 0) {
      console.warn("Invalid star array:", starArray);
      return 0;
    }

    const totalRatings = starArray.reduce(
      (sum, count, index) => sum + count * (index + 1),
      0
    );
    const totalVotes = starArray.reduce((sum, count) => sum + count, 0);

    return totalVotes > 0 ? (totalRatings / totalVotes).toFixed(2) : 0;
  };

  const handleShare = () => {};

  if (!userData) {
    return <Typography>{t("loading_user_data")}</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 5 }}>
        {t("download_study_materials")}
      </Typography>
      {isProcessing && <LottieLoader />}
      <Card sx={{ p: 4, mt: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
        </Box>

        <BreadcrumbsNavigation
          breadcrumbs={breadcrumbs}
          handleBreadcrumbClick={handleBreadcrumbClick}
        />

        {selectedMaterial ? (
          <SelectedMaterialDetails
            selectedMaterial={selectedMaterial}
            calculateAverageRating={calculateAverageRating}
            setStarDialogOpen={setStarDialogOpen}
            handleDownload={handleDownload}
            handleShare={handleShare}
            starDialogOpen={starDialogOpen}
            handleStarRating={handleStarRating}
            userData={userData}
          />
        ) : !searchQuery ? (
          <Box sx={{ textAlign: "center", my: 5 }}>
            <img
              src={IllustrationGif}
              alt={t("search_illustration")}
              style={{ maxWidth: "300px", marginBottom: "20px" }}
            />
            <Typography variant="h5" gutterBottom>
              {t("discover_study_materials")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("search_for_materials")}
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 3, fontWeight: "bold" }}>
              {loading
                ? t("searching")
                : `${studyMaterials.length} ${t("results_found", { count: studyMaterials.length })}`}
            </Typography>
            <StudyMaterialCards
              studyMaterials={studyMaterials}
              loading={loading || isProcessing}
              searchQuery={searchQuery}
              onCardClick={handleCardClick}
              onDownload={handleDownload}
            />
          </>
        )}
      </Card>
    </Container>
  );
}
