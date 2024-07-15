import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
} from "@mui/material";
import { styled } from "@mui/system";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FeatureImage from "../../assets/images/landingpage_illustrations/feature_gif.gif";

const StyledFeaturesSection = styled("section")(({ theme }) => ({
  background: "#fff",
  padding: "100px 0 50px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  scrollMarginTop: "80px",
}));

const StyledContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));

const FeaturesImageStyled = styled(Box)(({ theme }) => ({
  flex: 1,
  marginRight: "20px",
  [theme.breakpoints.down("md")]: {
    marginRight: 0,
    marginBottom: "20px",
    textAlign: "center",
  },
}));

const FeaturesText = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: "10px",
  "&:before": {
    display: "none",
  },
  transition: "all 0.3s ease-in-out",
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  "& .MuiAccordionSummary-content": {
    marginLeft: "10px",
  },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  transition: "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out",
  maxHeight: 0,
  opacity: 0,
  overflow: "hidden",
  "&.expanded": {
    maxHeight: "500px", // Adjust this value as needed
    opacity: 1,
  },
}));

const FeatureTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "Eczar-bold, sans-serif",
  fontWeight: "bold",
}));
const features = [
  {
    title: "Collaborative Learning",
    description:
      "Join a community of students and lecturers sharing and verifying study materials.",
  },
  {
    title: "Upload and Share",
    description:
      "Upload your study materials and share them with others to help them learn and succeed.",
  },
  {
    title: "Verified Resources",
    description:
      "Access study materials verified by lecturers and ensure you are using quality resources.",
  },
  {
    title: "Leaderboard and Points",
    description:
      "Earn points for uploading materials and climb the leaderboard. Recognition and rewards await!",
  },
  {
    title: "Real-Time Notifications",
    description:
      "Stay updated with real-time notifications about your uploads and the materials you follow.",
  },
];

const Features = () => {
  const [expanded, setExpanded] = useState(null);

  const handleHover = (panel) => () => {
    setExpanded(panel);
  };

  const handleLeave = () => {
    setExpanded(null);
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#features") {
      const featuresSection = document.getElementById("features");
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  return (
    <section id="features">
      <StyledFeaturesSection>
        <StyledContainer>
          <FeaturesImageStyled>
            <img
              src={FeatureImage}
              alt="Features Illustration"
              style={{ maxWidth: "80%", height: "auto" }}
            />
          </FeaturesImageStyled>
          <FeaturesText>
            <Typography
              variant="h2"
              gutterBottom
              sx={{ fontWeight: "bold", mb: 3 }}
            >
              Features
            </Typography>
            {features.map((feature, index) => (
              <StyledAccordion
                key={index}
                expanded={expanded === `panel${index}`}
                onMouseEnter={handleHover(`panel${index}`)}
                onMouseLeave={handleLeave}
              >
                <StyledAccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${index}a-content`}
                  id={`panel${index}a-header`}
                >
                  <Typography
                    component="span"
                    sx={{ fontFamily: "Graduate, sans-serif", mr: 2 }}
                  >
                    {index + 1}.
                  </Typography>
                  <FeatureTitle variant="h6">{feature.title}</FeatureTitle>
                </StyledAccordionSummary>
                <StyledAccordionDetails
                  className={expanded === `panel${index}` ? "expanded" : ""}
                >
                  <Typography>{feature.description}</Typography>
                </StyledAccordionDetails>
              </StyledAccordion>
            ))}
          </FeaturesText>
        </StyledContainer>
      </StyledFeaturesSection>
    </section>
  );
};

export default Features;
