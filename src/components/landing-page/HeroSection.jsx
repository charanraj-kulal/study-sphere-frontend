import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Box, Typography, Button, Container } from "@mui/material";
import { styled } from "@mui/system";
import { useUser } from "../../hooks/UserContext";
import HeroImage from "../../assets/images/landingpage_illustrations/hero_image.png";
import { Section } from "lucide-react";

const StyledHeroSection = styled("section")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "100px 0",
  backgroundColor: "#fff",
  marginTop: "50px",
  [theme.breakpoints.down("md")]: {
    padding: "50px 0",
  },
}));

const StyledContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    textAlign: "center",
  },
}));

const HeroText = styled(Box)(({ theme }) => ({
  flex: 1,
  [theme.breakpoints.down("md")]: {
    marginBottom: "30px",
  },
}));

const HeroTitle = styled(Typography)(({ theme }) => ({
  fontSize: "3rem",
  fontWeight: "bold",
  marginBottom: "20px",
  fontFamily: "Telegraf, sans-serif",
  [theme.breakpoints.down("sm")]: {
    fontSize: "2.5rem",
  },
}));

const HeroSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  marginBottom: "30px",
  fontFamily: "Telegraf, sans-serif",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, #fdbf2d 30%, #0033a0 90%)`,
  border: 0,
  borderRadius: 5,

  boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
  color: "white",
  height: 48,
  padding: "20px 40px",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    background: `linear-gradient(45deg, #0033a0 30%, #fdbf2d 90%)`,
    transform: "scale(1.05)",
    transition: "all 0.3s ease-in-out",
  },
}));

const StyledHeroImage = styled("img")(({ theme }) => ({
  maxWidth: "80%",
  height: "auto",
  // marginLeft: 90,
  [theme.breakpoints.down("md")]: {
    width: "80%",
  },
}));

const HeroSection = () => {
  const imageRef = useRef(null);
  const { userData } = useUser();

  const handleAuthButtonClick = (e) => {
    e.preventDefault();
    if (userData) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    const image = imageRef.current;

    gsap.fromTo(
      image,
      { scale: 1.5 },
      {
        scale: 1,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(image, {
            y: "-=20",
            yoyo: true,
            repeat: -1,
            duration: 1,
            ease: "power1.inOut",
          });
        },
      }
    );
  }, []);

  return (
    <section id="home-section">
      <StyledHeroSection>
        <StyledContainer>
          <HeroText>
            <HeroTitle variant="h1">
              Welcome to{" "}
              <Box component="span" sx={{ color: "#0033a0" }}>
                Sphere
              </Box>{" "}
              <Box component="span" sx={{ color: "#fdbf2d;" }}>
                Sphere
              </Box>
            </HeroTitle>
            <HeroSubtitle>
              Your ultimate destination for collaborative learning and resource
              sharing
            </HeroSubtitle>
            <StyledButton onClick={handleAuthButtonClick}>
              {userData ? "Dashboard" : "Login"}
            </StyledButton>
          </HeroText>
          <Box>
            <StyledHeroImage ref={imageRef} src={HeroImage} alt="Hero" />
          </Box>
        </StyledContainer>
      </StyledHeroSection>
    </section>
  );
};

export default HeroSection;
