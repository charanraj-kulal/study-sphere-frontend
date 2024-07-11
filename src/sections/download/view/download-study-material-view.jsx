import { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import { ThemeProvider, createTheme } from "@mui/material/styles";
// import RalewayWoff2 from "../../../assets/fonts/custom/Imprima/Imprima-Regular.ttf";
import RalewayWoff2 from "../../../assets/fonts/custom/LemonMilk/LEMONMILK-Bold.otf";
import SearchBar from "../searchbar-for-study-material";
import StudyMaterialCards from "../download-studyMaterial-card";
import { useUser } from "../../../hooks/UserContext";

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../../../firebase";
import IllustrationGif from "../../../assets/illustrations/illustration_download_pdf.gif";
import Iconify from "../../../components/iconify";

export default function DownloadStudyMaterialView() {
  const { userData } = useUser();

  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState(["Dashboard", "Download"]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const theme = createTheme({
    typography: {
      fontFamily: "Raleway, Arial",
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
        @font-face {
          font-family: 'Raleway';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: local('Raleway'), local('Raleway-Regular'), url(${RalewayWoff2}) format('woff2');
          unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
        }
      `,
      },
    },
  });

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
      // Navigate to Dashboard
      setBreadcrumbs(["Dashboard", "Download"]);
      setSelectedMaterial(null);
    } else if (index === 1) {
      // Navigate to Download
      setBreadcrumbs(["Dashboard", "Download"]);
      setSelectedMaterial(null);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setLoading(true);
    setSelectedMaterial(null);
  };

  const handleCardClick = (material) => {
    setSelectedMaterial(material);
    setBreadcrumbs(["Dashboard", "Download", material.documentName]);
  };

  const handleDownload = async (material) => {
    // Increment download count in Firestore
    const docRef = doc(db, "documents", material.id);
    await updateDoc(docRef, {
      downloadCount: increment(1),
    });

    // Trigger download
    window.open(material.documentUrl, "_blank");
  };
  const handleStarRating = async (rating) => {
    // Implement star rating functionality
    // Update Firestore with the new rating
  };

  const handleShare = () => {
    // Implement share functionality
    // You can use the Web Share API or create a custom sharing method
  };

  if (!userData) {
    return <Typography>Loading user data...</Typography>;
  }

  return (
    <Container>
      <Card sx={{ p: 4, mt: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <SearchBar onSearch={handleSearch} />
        </Box>

        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{ mb: 3 }}
          separator={
            <Iconify
              icon="ic:round-navigate-next"
              sx={{
                width: 30,
                height: 30,
                color: "text.secondary",
              }}
            />
          }
        >
          {breadcrumbs.map((breadcrumb, index) => (
            <Link
              key={index}
              color="inherit"
              href="#"
              onClick={(event) => handleBreadcrumbClick(event, index)}
              sx={{ textDecoration: "none", color: "#0A4191" }}
            >
              {breadcrumb}
            </Link>
          ))}
        </Breadcrumbs>

        {selectedMaterial ? (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              {/* <IconButton onClick={() => handleStarRating(selectedMaterial)}>
                <StarIcon />
              </IconButton> */}
              <Button variant="outlined" sx={{ borderColor: "#0A4191", mr: 1 }}>
                <Iconify
                  icon="tabler:star"
                  sx={{ color: "#FFD700", width: 20, height: 20 }}
                  onClick={() => handleStarRating(selectedMaterial)}
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
                  {/* {formatCount(material.star)} */}0
                </Typography>
              </Button>
              <Button variant="outlined" sx={{ borderColor: "#0A4191", mr: 1 }}>
                <Iconify
                  icon="tabler:cloud-download"
                  sx={{ color: "#FFD700", width: 20, height: 20 }}
                  onClick={() => handleDownload(selectedMaterial)}
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
                  {/* {formatCount(material.downloadCount)} */}0
                </Typography>
              </Button>
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
              <Typography variant="body2">
                {selectedMaterial.uploadedBy}
              </Typography>
            </Box>
            <Box sx={{ width: "100%", height: "600px" }}>
              <iframe
                src={`${selectedMaterial.documentUrl}#toolbar=0&navpanes=0`}
                width="100%"
                height="100%"
                title={selectedMaterial.documentName}
                style={{ border: "none" }}
              />
            </Box>
          </Box>
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
              loading={loading}
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
