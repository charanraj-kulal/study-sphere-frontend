import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Container, Button } from "@mui/material";
import { styled } from "@mui/system";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DomainImage from "/assets/images/landingpage_illustrations/domain.png";

gsap.registerPlugin(ScrollTrigger);

const StyledDomainsSection = styled("section")(({ theme }) => ({
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
  alignItems: "center",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));

const DomainsImageStyled = styled(Box)(({ theme }) => ({
  flex: 1,
  marginRight: "20px",
  [theme.breakpoints.down("md")]: {
    marginRight: 0,
    marginBottom: "20px",
    textAlign: "center",
  },
}));

const DomainsText = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
  marginTop: "20px",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginRight: "10px",
}));

const Domains = () => {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current.querySelector("img");
    const textElements = textRef.current.querySelectorAll("h2, p, button");

    gsap.set(image, { scale: 0.8, opacity: 0, x: -50 });
    gsap.set(textElements, { y: 30, opacity: 0 });

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
      x: 0,
      duration: 1,
      ease: "power2.out",
    }).to(
      textElements,
      {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.5"
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <StyledDomainsSection id="domains" ref={sectionRef}>
      <SectionTitle variant="h4">Join Study Sphere Today</SectionTitle>

      <StyledContainer>
        <DomainsImageStyled ref={imageRef}>
          <img
            src={DomainImage}
            alt="Teacher Illustration"
            style={{ maxWidth: "80%", height: "auto" }}
          />
        </DomainsImageStyled>
        <DomainsText ref={textRef}>
          <Typography
            variant="h2"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 3 }}
          >
            Join Our Community
          </Typography>
          <Typography variant="body1" paragraph>
            Become part of a growing community of learners and educators. Sign
            up now and start sharing, learning, and growing together!
          </Typography>
          <ButtonGroup>
            <StyledButton variant="contained" color="primary">
              Explore
            </StyledButton>
            <StyledButton variant="outlined" color="primary">
              Donate
            </StyledButton>
          </ButtonGroup>
        </DomainsText>
      </StyledContainer>
    </StyledDomainsSection>
  );
};

export default Domains;
