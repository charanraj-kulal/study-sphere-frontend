import React, { useEffect, useRef } from "react";
import { Box, Typography, Container, Grid } from "@mui/material";
import { styled } from "@mui/system";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AboutUsImage from "../../assets/images/landingpage_illustrations/about_us.png";

gsap.registerPlugin(ScrollTrigger);

const StyledAboutUsSection = styled("section")(({ theme }) => ({
  background: "#fff",
  paddingTop: "80px",
  paddingBottom: "50px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  scrollMarginTop: "80px",
  minHeight: "100vh",
  position: "relative",
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

const AboutUsText = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  height: "100%",
}));
const AboutUsImageStyled = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "auto",
  overflow: "hidden",
  "& img": {
    width: "100%",
    height: "auto",
    transformOrigin: "center center",
  },
}));
const StyledParagraph = styled(Typography)(({ theme }) => ({
  fontSize: "1.1rem",
  lineHeight: 1.6,
  marginBottom: "1.5rem",
  color: "#333",
  "&:first-of-type::first-letter": {
    initialLetter: 2,
    fontSize: 40,
    color: "#fdbf2d",
    fontWeight: "bold",
    marginRight: "2px",
  },
}));

const CounterContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-around",
  marginTop: "2rem",
}));

const CounterItem = styled(Box)(({ theme }) => ({
  textAlign: "left",
  borderLeft: "4px solid #0033a0",
  paddingLeft: "1rem",
}));

const CounterNumber = styled(Typography)(({ theme }) => ({
  fontSize: "3rem",
  fontWeight: "bold",
  color: "#fdbf2d",
  lineHeight: 1,
}));

const CounterText = styled(Typography)(({ theme }) => ({
  fontSize: "1rem",
  color: "#666",
}));
const AboutUs = () => {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);
  const counterRef = useRef(null);

  useEffect(() => {
    const counters = counterRef.current.querySelectorAll(".counter-number");
    const section = sectionRef.current;
    const image = imageRef.current.querySelector("img");
    const textElements = textRef.current.querySelectorAll("h2, p, CounterItem");

    gsap.set(image, { scale: 0.8, opacity: 0, rotation: -5 });
    gsap.set(textElements, { y: 50, opacity: 0 });
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute("data-target"));
      let count = 0;
      const updateCounter = () => {
        const increment = target / 200;
        if (count < target) {
          count += increment;
          counter.innerText = Math.ceil(count);
          requestAnimationFrame(updateCounter);
        } else {
          counter.innerText = target + "+";
        }
      };

      ScrollTrigger.create({
        trigger: counter,
        start: "top 80%",
        onEnter: updateCounter,
      });
    });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "center bottom",
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
    }).to(
      textElements,
      {
        y: 0,
        opacity: 1,
        stagger: 0.2,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.5"
    );

    // const reverseTl = gsap.timeline({
    //   scrollTrigger: {
    //     trigger: section,
    //     start: "center center",
    //     end: "center top",
    //     scrub: 1,
    //   },
    // });

    // reverseTl
    //   .to(image, {
    //     scale: 0.8,
    //     opacity: 0,
    //     rotation: 5,
    //     duration: 1,
    //     ease: "power2.in",
    //   })
    //   .to(
    //     textElements,
    //     {
    //       y: -50,
    //       opacity: 0,
    //       stagger: 0.1,
    //       duration: 0.5,
    //       ease: "power2.in",
    //     },
    //     "-=0.5"
    //   );

    // return () => {
    //   tl.kill();
    //   reverseTl.kill();
    // };
  }, []);

  return (
    <StyledAboutUsSection id="about-us" ref={sectionRef}>
      <SectionTitle variant="h4">About Our Platform</SectionTitle>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
            <AboutUsText ref={textRef}>
              <Typography
                variant="h2"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#0033a0" }}
              >
                ABOUT US
              </Typography>
              <StyledParagraph>
                Study Sphere is dedicated to creating a collaborative and
                resource-rich learning environment for students and educators.
                Our mission is to make quality study materials accessible to
                everyone, fostering a community of knowledge sharing and
                continuous learning.
              </StyledParagraph>
              <StyledParagraph>
                With our innovative platform, we aim to revolutionize the way
                students access and share educational resources, making learning
                more efficient and engaging for all.
              </StyledParagraph>

              <CounterContainer ref={counterRef}>
                <CounterItem>
                  <CounterNumber className="counter-number" data-target="320">
                    0
                  </CounterNumber>
                  <CounterText>
                    Total number of
                    <br />
                    Users
                  </CounterText>
                </CounterItem>
                <CounterItem>
                  <CounterNumber className="counter-number" data-target="897">
                    0
                  </CounterNumber>
                  <CounterText>
                    Total number of
                    <br />
                    Documents
                  </CounterText>
                </CounterItem>
              </CounterContainer>
            </AboutUsText>
          </Grid>
          <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
            <AboutUsImageStyled ref={imageRef}>
              <img src={AboutUsImage} alt="Students" />
            </AboutUsImageStyled>
          </Grid>
        </Grid>
      </Container>
    </StyledAboutUsSection>
  );
};

export default AboutUs;
