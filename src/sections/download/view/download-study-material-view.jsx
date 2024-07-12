import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  getDoc,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../../../firebase";
import IllustrationGif from "../../../assets/illustrations/illustration_download_pdf.gif";

export default function DownloadStudyMaterialView() {
  const navigate = useNavigate();
  const { userData } = useUser();

  const [studyMaterials, setStudyMaterials] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState(["Dashboard", "Download"]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [starDialogOpen, setStarDialogOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
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
  }, [searchQuery]);

  const handleBreadcrumbClick = (event, index) => {
    event.preventDefault();
    if (index === 0) {
      navigate("/dashboard");
      setBreadcrumbs(["Dashboard", "Download"]);
      setSelectedMaterial(null);
    } else if (index === 1) {
      setBreadcrumbs(["Dashboard", "Download"]);
      setSelectedMaterial(null);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setLoading(true);
    setSelectedMaterial(null);
  };

  const handleCardClick = async (material) => {
    setIsProcessing(true);
    try {
      const docRef = doc(db, "documents", material.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const updatedMaterial = { id: docSnap.id, ...docSnap.data() };
        setSelectedMaterial(updatedMaterial);
        setBreadcrumbs(["Dashboard", "Download", updatedMaterial.documentName]);
      } else {
        console.log("No such document!");
        setSelectedMaterial(material);
        setBreadcrumbs(["Dashboard", "Download", material.documentName]);
      }
    } catch (error) {
      console.error("Error fetching updated document:", error);
      setSelectedMaterial(material);
      setBreadcrumbs(["Dashboard", "Download", material.documentName]);
    } finally {
      setIsProcessing(false);
    }
  };

  //download and update study material
  const updateMaterialDownloadCount = async (material) => {
    if (!material || !material.id) {
      console.error("Invalid material object:", material);
      showToast("error", "Error: Invalid material data");
      return;
    }

    try {
      // Initiate the download
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL +
          `/api/download/${material.id}?userId=${userData.uid}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the updated download count from the response header
      const newDownloadCount = parseInt(
        response.headers.get("X-Download-Count"),
        10
      );

      // Update the local state to reflect the new download count
      setSelectedMaterial((prevMaterial) => ({
        ...prevMaterial,
        downloadCount: newDownloadCount,
      }));

      // Trigger the actual download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${material.documentName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      showToast("success", "Document downloaded successfully");
    } catch (error) {
      console.error("Error initiating download:", error);
      showToast("error", `Failed to initiate download: ${error.message}`);
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
        previousRating
          ? "Your rating has been updated!"
          : "Thank you for rating!"
      );
    } catch (error) {
      console.error("Error updating rating:", error.message, error.code);
      showToast("error", `Failed to update rating: ${error.message}`);
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
    return <Typography>Loading user data...</Typography>;
  }

  return (
    <Container>
      {isProcessing && <LottieLoader />}
      <Card sx={{ p: 4, mt: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <SearchBar onSearch={handleSearch} />
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
            updateMaterialDownloadCount={() =>
              updateMaterialDownloadCount(selectedMaterial)
            }
            handleShare={handleShare}
            starDialogOpen={starDialogOpen}
            handleStarRating={handleStarRating}
            userData={userData}
          />
        ) : !searchQuery ? (
          <Box sx={{ textAlign: "center", my: 5 }}>
            <img
              src={IllustrationGif}
              alt="Search Illustration"
              style={{ maxWidth: "300px", marginBottom: "20px" }}
            />
            <Typography variant="h5" gutterBottom>
              Discover Your Study Materials
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Search for the study materials you need to excel in your studies.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 3, fontWeight: "bold" }}>
              {loading
                ? "Searching..."
                : `${studyMaterials.length} results found`}
            </Typography>
            <StudyMaterialCards
              studyMaterials={studyMaterials}
              loading={loading || isProcessing}
              searchQuery={searchQuery}
              onCardClick={handleCardClick}
              onDownload={updateMaterialDownloadCount}
            />
          </>
        )}
      </Card>
    </Container>
  );
}
