import { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import SearchBar from "../searchbar-for-study-material";
import StudyMaterialCards from "../download-studyMaterial-card";
import { useUser } from "../../../hooks/UserContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../firebase";
import IllustrationImage from "../../../assets/illustrations/illustration_avatar.png"; // Import your illustration image

export default function DownloadStudyMaterialView() {
  const { userData } = useUser();

  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState(["Home", "Study Materials"]);

  useEffect(() => {
    const fetchStudyMaterials = async () => {
      setLoading(true);
      const materialsRef = collection(db, "documents");
      let q = query(
        materialsRef,
        where("visibility", "==", "public"),
        where("Approved", "==", "Yes"),
        orderBy("uploadedOn", "desc")
      );

      if (searchQuery) {
        q = query(
          materialsRef,
          where("visibility", "==", "public"),
          where("Approved", "==", "Yes"),
          where("documentName", ">=", searchQuery),
          where("documentName", "<=", searchQuery + "\uf8ff")
        );
      }

      const querySnapshot = await getDocs(q);
      const materials = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudyMaterials(
        materials.filter(
          (material) =>
            material.documentName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            material.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            material.documentTopics.some((topic) =>
              topic.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
      );
      setLoading(false);
    };

    fetchStudyMaterials();
  }, [searchQuery]);

  const handleBreadcrumbClick = (event, index) => {
    event.preventDefault();
    // Handle breadcrumb navigation logic here if needed
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
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

        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          {breadcrumbs.map((breadcrumb, index) => (
            <Link
              key={index}
              color="inherit"
              href="#"
              onClick={(event) => handleBreadcrumbClick(event, index)}
            >
              {breadcrumb}
            </Link>
          ))}
        </Breadcrumbs>

        {!searchQuery && (
          <Box sx={{ textAlign: "center", my: 5 }}>
            <img
              src={IllustrationImage}
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
        )}

        {searchQuery && (
          <Typography variant="body1" sx={{ mb: 3, fontWeight: "bold" }}>
            {studyMaterials.length} results found
          </Typography>
        )}

        <StudyMaterialCards
          studyMaterials={studyMaterials}
          loading={loading}
          searchQuery={searchQuery}
        />
      </Card>
    </Container>
  );
}
