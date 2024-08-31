import React, { useEffect, useRef } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import { styled } from "@mui/system";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/UserContext";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
// import FaviconImage from "../../assets/icons/favicon/favicon.png";
import FaviconImage from "../../assets/images/logo/logo.png";
import FooterImage from "../../assets/background/footer-image.png";

gsap.registerPlugin(ScrollTrigger);

// const StyledFooter = styled("footer")(({ theme }) => ({
//   backgroundColor: "#0033a0",
//   color: "#fdbf2d",
//   padding: theme.spacing(6, 0),
// }));

const StyledFooter = styled("footer")(({ theme }) => ({
  backgroundImage: `url(${FooterImage})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  padding: theme.spacing(6, 0),
  color: "white",
}));

const LogoTypography = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  marginBottom: theme.spacing(2),
}));

const StyledList = styled(List)(({ theme }) => ({
  padding: 0,
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(0.5, 0),
  "&:hover": {
    textDecoration: "underline",
  },
}));

const SocialIcon = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  marginRight: theme.spacing(2),
  cursor: "pointer",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.2)",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#fdbf2d",
  color: "#0033a0",
  "&:hover": {
    backgroundColor: "#fca000",
  },
}));

const Footer = () => {
  const navigate = useNavigate();
  const { userData } = useUser();
  const footerRef = useRef(null);

  const features = [
    "Collaborative Learning",
    "Upload Share",
    "Verified Resources",
    "Leaderboard Points",
    "Real-Time Notifications",
  ];

  const navLinks = [
    { label: "Home", section: "home-section" },
    { label: "Features", section: "features" },
    { label: "About Us", section: "about-us" },
    { label: "Domains", section: "domains" },
    { label: "Contact", section: "contact" },
  ];

  const handleAuthButtonClick = (e) => {
    e.preventDefault();
    if (userData) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    const footer = footerRef.current;
    const footerElements = footer.querySelectorAll("div, ul, li, p, h6");

    gsap.set(footerElements, { y: 50, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footer,
        start: "top bottom-=100",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    tl.to(footerElements, {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      duration: 0.5,
      ease: "power2.out",
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <StyledFooter ref={footerRef}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mt: 7 }}>
          <Grid item xs={12} sm={6} md={3}>
            <img
              src={FaviconImage}
              alt="logo"
              style={{
                width: 100,
                height: 100,
                marginLeft: 50,
                marginTop: 90,
                filter: "drop-shadow(5px 10px 15px  #fff",
              }}
            />
            {/* <LogoTypography variant="h6">Study Sphere</LogoTypography> */}

            <Typography variant="body2" sx={{ mt: 2 }}>
              Your collaborative learning platform
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Features
            </Typography>
            <StyledList>
              {features.map((feature, index) => (
                <StyledListItem key={index} disablePadding>
                  <ListItemText primary={feature} />
                </StyledListItem>
              ))}
            </StyledList>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <StyledList>
              {navLinks.map((link, index) => (
                <StyledListItem key={index} disablePadding>
                  <Link
                    to={`/#${link.section}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    <ListItemText primary={link.label} />
                  </Link>
                </StyledListItem>
              ))}
            </StyledList>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2">Phone: +91 9353649294</Typography>
            <Typography variant="body2">
              Email: contact@studysphere.com
            </Typography>
            <Box mt={2}>
              <StyledButton onClick={handleAuthButtonClick}>
                {userData ? "Dashboard" : "Login"}
              </StyledButton>
              <Box mt={4}>
                <SocialIcon
                  component="a"
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FacebookIcon />
                </SocialIcon>
                <SocialIcon
                  component="a"
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TwitterIcon />
                </SocialIcon>
                <SocialIcon
                  component="a"
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkedInIcon />
                </SocialIcon>
                <SocialIcon
                  component="a"
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InstagramIcon />
                </SocialIcon>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Typography
          variant="body2"
          align="center"
          style={{ marginTop: "1rem" }}
        >
          © {new Date().getFullYear()} Study Sphere. All rights reserved.
        </Typography>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
