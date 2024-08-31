import { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import UploadStudyMaterialForm from "../UploadStudyMaterialForm"; // Adjust the import path as needed
import { useUser } from "../../../hooks/UserContext";

export default function UploadView() {
  const { userData } = useUser();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Morning";
      if (hour < 18) return "Afternoon";
      return "Evening";
    };

    setGreeting(getGreeting());
  }, []);

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Good {greeting}, {userData.displayName}👋
      </Typography>
      <Card>
        <Typography variant="h4" sx={{ mb: 3, mt: 2, ml: 4 }}>
          Upload study materials
        </Typography>
        <UploadStudyMaterialForm currentUser={userData} />
      </Card>
    </Container>
  );
}
