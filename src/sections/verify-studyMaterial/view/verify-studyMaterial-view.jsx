import { useState, useEffect } from "react";
import axios from "axios";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import Card from "@mui/material/Card";
import VerifyStudyMaterialCard from "../verify-studyMaterial-card";
import VerifyStudyMaterialSkeleton from "../../../components/skeletons/verifyStudyMaterial/VerifyStudyMaterialSkeleton";
import VerifyStudyMaterialFilters from "../verify-studyMaterialf-filters";
import { useUser } from "../../../hooks/UserContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../firebase";
import CardNoData from "../CardNoData";

export default function VerifyView() {
  const { userData } = useUser();

  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("My domain");
  const [count, setCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchStudyMaterials = async () => {
      setLoading(true);
      const materialsRef = collection(db, "documents");
      let q;

      if (filter === "My domain") {
        q = query(
          materialsRef,
          where("uploaderCourse", "==", userData.course),
          where("Approved", "==", "No"),
          orderBy("uploadedOn", sortBy === "newest" ? "desc" : "asc")
        );
      } else {
        q = query(
          materialsRef,
          where("Approved", "==", "No"),
          orderBy("uploadedOn", sortBy === "newest" ? "desc" : "asc")
        );
      }

      const querySnapshot = await getDocs(q);
      const materials = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudyMaterials(materials);
      setCount(querySnapshot.size);
      setLoading(false);
    };

    if (userData) {
      fetchStudyMaterials();
    }
  }, [filter, userData, sortBy]);

  const handleApprove = async (id) => {
    try {
      const material = studyMaterials.find((m) => m.id === id);
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + "/api/approve-document",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: id,
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

      const updatedMaterials = studyMaterials.filter(
        (material) => material.id !== id
      );
      setStudyMaterials(updatedMaterials);
      setCount(count - 1);
    } catch (error) {
      console.error("Error approving document:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const handleReject = async (id, rejectionReason) => {
    try {
      const material = studyMaterials.find((m) => m.id === id);
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + "/api/reject-document",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: id,
            userEmail: material.uploaderEmail,
            documentName: material.documentName,
            rejectionReason,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const updatedMaterials = studyMaterials.filter(
        (material) => material.id !== id
      );
      setStudyMaterials(updatedMaterials);
      setCount(count - 1);
    } catch (error) {
      console.error("Error rejecting document:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };
  const filteredMaterials = studyMaterials.filter((material) =>
    material.documentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!userData) {
    return <Typography>Loading user data...</Typography>;
  }

  const showNoDataCard = !loading && filteredMaterials.length === 0;

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Verify Study Material
      </Typography>
      <Card sx={{ ml: 2, p: 4 }}>
        <VerifyStudyMaterialFilters
          filterValue={searchQuery}
          onFilterChange={setSearchQuery}
          onSortChange={setSortBy}
          sortBy={sortBy}
          domainFilter={filter}
          onDomainFilterChange={setFilter}
        />

        <Typography
          variant="body1"
          sx={{ mb: 3, fontWeight: "bold", ml: 2, mt: 4 }}
        >
          {filteredMaterials.length.toLocaleString()} results
        </Typography>
        <Grid container spacing={3}>
          {loading ? (
            Array.from(new Array(6)).map((_, index) => (
              <Grid xs={12} sm={6} md={4} key={index}>
                <VerifyStudyMaterialSkeleton />
              </Grid>
            ))
          ) : showNoDataCard ? (
            <Grid xs={12}>
              <CardNoData query={searchQuery} />
            </Grid>
          ) : (
            filteredMaterials.map((material) => (
              <Grid xs={12} sm={6} md={4} key={material.id}>
                <VerifyStudyMaterialCard
                  material={material}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </Grid>
            ))
          )}
        </Grid>
      </Card>
    </Container>
  );
}
