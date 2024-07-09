import { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import Button from "@mui/material/Button";
import VerifyStudyMaterialCard from "../verify-studyMaterial-card";
import VerifyStudyMaterialSkeleton from "../../../components/skeletons/verifyStudyMaterial/VerifyStudyMaterialSkeleton"; // Import the skeleton component
import { useUser } from "../../../hooks/UserContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";

export default function VerifyView() {
  const { userData } = useUser();

  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading
  const [filter, setFilter] = useState("My domain");
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchStudyMaterials = async () => {
      setLoading(true); // Set loading to true when fetching starts
      const materialsRef = collection(db, "documents");
      let q;

      if (filter === "My domain") {
        q = query(
          materialsRef,
          where("uploaderCourse", "==", userData.course),
          where("Approved", "==", "No")
        );
      } else {
        q = query(materialsRef, where("Approved", "==", "No"));
      }

      const querySnapshot = await getDocs(q);
      const materials = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudyMaterials(materials);
      setCount(querySnapshot.size);
      setLoading(false); // Set loading to false after data is fetched
    };

    if (userData) {
      fetchStudyMaterials();
    }
  }, [filter, userData]);

  const handleApprove = async (id) => {
    const updatedMaterials = studyMaterials.filter(
      (material) => material.id !== id
    );
    setStudyMaterials(updatedMaterials);
    setCount(count - 1);
  };

  const handleReject = async (id) => {
    const updatedMaterials = studyMaterials.filter(
      (material) => material.id !== id
    );
    setStudyMaterials(updatedMaterials);
    setCount(count - 1);
  };

  if (!userData) {
    return <Typography>Loading user data...</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Verify Study Materials
      </Typography>

      <div style={{ marginBottom: "16px" }}>
        <Button
          variant={filter === "My domain" ? "contained" : "outlined"}
          onClick={() => setFilter("My domain")}
        >
          My domain
        </Button>
        <Button
          variant={filter === "All" ? "contained" : "outlined"}
          onClick={() => setFilter("All")}
          sx={{ ml: 2 }}
        >
          All
        </Button>
      </div>
      <Typography
        variant="body1"
        sx={{ mb: 3, fontWeight: "bold", ml: 2, mt: 4 }}
      >
        {count.toLocaleString()} results
      </Typography>
      <Grid container spacing={3}>
        {loading
          ? Array.from(new Array(6)).map((_, index) => (
              <Grid xs={12} sm={6} md={4} key={index}>
                <VerifyStudyMaterialSkeleton />
              </Grid>
            ))
          : studyMaterials.map((material) => (
              <Grid xs={12} sm={6} md={4} key={material.id}>
                <VerifyStudyMaterialCard
                  material={material}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </Grid>
            ))}
      </Grid>
    </Container>
  );
}
