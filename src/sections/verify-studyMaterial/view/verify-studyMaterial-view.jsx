import { useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import UploadStudyMaterialForm from "../verify-studyMaterial"; // Adjust the import path as needed
import { useUser } from "../../../hooks/UserContext";

export default function VerifyView() {
  const { userData } = useUser();

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Upload Study Materials
      </Typography>
      <Card>
        <UploadStudyMaterialForm currentUser={userData} />
      </Card>
    </Container>
  );
}
