import React, { useState, useEffect, useRef } from "react";
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
import FeatureImage from "/assets/images/landingpage_illustrations/feature_gif.gif";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const StyledFeaturesSection = styled("section")(({ theme }) => ({
  background: "#fff",
  paddingTop: "80px",
  paddingBottom: "50px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  scrollMarginTop: "80px",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "Pacifico, cursive",
  color: "#0033a0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 0 30px 0",
  padding: "20px 0",
  width: "30%",
  background: "#fff",
  "&::before, &::after": {
    content: '""',
    flex: 1,
    height: 2,
    borderBottom: "2px solid #0033a0",
    margin: "0px 15px",
  },
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
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);
  const accordionRefs = useRef([]);

  const handleHover = (panel) => () => {
    setExpanded(panel);
  };

  const handleLeave = () => {
    setExpanded(null);
  };

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current.querySelector("img");
    const textElements = textRef.current.querySelectorAll("h2");
    const accordions = accordionRefs.current;

    gsap.set(image, { scale: 0.8, opacity: 0, rotation: -5 });
    gsap.set(textElements, { y: 50, opacity: 0 });
    gsap.set(accordions, { y: 30, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top center",
        end: "center center",
        scrub: 1,
      },
    });

    tl.to(image, {
      scale: 1,
      opacity: 1,
      rotation: 0,
      duration: 1,
      ease: "power2.out",
    })
      .to(
        textElements,
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.5"
      )
      .to(
        accordions,
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.3"
      );

    const hash = window.location.hash;
    if (hash === "#features") {
      const featuresSection = document.getElementById("features");
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: "smooth" });
      }
    }

    return () => {
      tl.kill();
    };
  }, []);
  return (
    <StyledFeaturesSection id="features" ref={sectionRef}>
      <SectionTitle variant="h4">Discover Our Amazing Features</SectionTitle>

      <StyledContainer>
        <FeaturesImageStyled ref={imageRef}>
          <img
            src={FeatureImage}
            alt="Features Illustration"
            style={{ maxWidth: "80%", height: "auto" }}
          />
        </FeaturesImageStyled>
        <FeaturesText ref={textRef}>
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
              ref={(el) => (accordionRefs.current[index] = el)}
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
  );
};

export default Features;
