import { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import UploadStudyMaterialForm from "../UploadStudyMaterialForm"; // Adjust the import path as needed
import { useUser } from "../../../hooks/UserContext";
import { useTranslation } from "react-i18next";

export default function UploadView() {
  const { userData } = useUser();
  const [greeting, setGreeting] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return t("good_morning");
      if (hour < 18) return t("good_afternoon");
      return t("good_evening");
    };

    setGreeting(getGreeting());
  }, [t]);

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 5 }}>
        {greeting}, {userData.displayName}👋
      </Typography>
      <Card>
        <Typography variant="h4" sx={{ mb: 3, mt: 2, ml: 4 }}>
          {t("upload_study_materials")}
        </Typography>
        <UploadStudyMaterialForm currentUser={userData} />
      </Card>
    </Container>
  );
}
