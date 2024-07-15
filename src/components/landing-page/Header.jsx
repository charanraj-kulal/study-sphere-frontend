import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/UserContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Box,
  Container,
  Grid,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { styled } from "@mui/system";

const StyledAppBar = styled(AppBar)(({ theme, scrolled }) => ({
  background: scrolled ? "rgba(255, 255, 255, 0.9)" : "transparent",
  boxShadow: scrolled ? theme.shadows[4] : "none",
  transition: "all 0.3s ease-in-out",
  backdropFilter: scrolled ? "blur(3px)" : "none",
  height: 100, // Increased height
}));

const NavLink = styled(Typography)(({ theme, active }) => ({
  margin: theme.spacing(0, 2),
  cursor: "pointer",
  position: "relative",
  color: active ? theme.palette.primary.main : "black",
  fontWeight: 500,
  fontSize: "1.1rem", // Increased font size
  "&::after": {
    content: '""',
    position: "absolute",
    width: "100%",
    height: "3px",
    bottom: "-8px",
    left: 0,
    backgroundColor: theme.palette.primary.main,
    transform: active ? "scaleX(1)" : "scaleX(0)",
    transition: "transform 0.3s ease-in-out",
  },
  "&:hover": {
    color: theme.palette.primary.main,
  },
  "&:hover::after": {
    transform: "scaleX(1)",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  border: 0,
  borderRadius: 3,
  boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
  color: "white",
  height: 48,
  padding: "0 30px",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.primary.main} 90%)`,
    boxShadow: "0 5px 7px 2px rgba(255, 105, 135, .5)",
  },
}));
const Header = () => {
  const navigate = useNavigate();
  const { userData } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }

      const sections = [
        "home-section",
        "features",
        "about-us",
        "domains",
        "contact",
      ];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 150) {
          setActiveSection(section);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  const handleNavClick = (section) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setDrawerOpen(false);
  };

  const handleAuthButtonClick = () => {
    navigate(userData ? "/dashboard" : "/login");
  };

  const navItems = [
    { label: "Home", section: "home-section" },
    { label: "Features", section: "features" },
    { label: "About Us", section: "about-us" },
    { label: "Domains", section: "domains" },
    { label: "Contact", section: "contact" },
  ];

  const renderNavItems = () => (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.section}
          variant="button"
          onClick={() => handleNavClick(item.section)}
          active={activeSection === item.section}
        >
          {item.label}
        </NavLink>
      ))}
    </>
  );

  return (
    <StyledAppBar position="fixed" scrolled={scrolled ? 1 : 0}>
      <Container maxWidth="lg" sx={{ height: "100%" }}>
        <Toolbar disableGutters sx={{ height: "100%" }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={3}>
              <Typography variant="h6" component="div">
                <img
                  src="../src/assets/images/logo/logo.png"
                  alt="Study Sphere Logo"
                  height="70" // Increased logo size
                />
              </Typography>
            </Grid>
            {isMobile ? (
              <Grid item>
                <IconButton
                  edge="start"
                  color="#0000"
                  aria-label="menu"
                  onClick={() => setDrawerOpen(true)}
                >
                  <MenuIcon />
                </IconButton>
                <Drawer
                  anchor="right"
                  open={drawerOpen}
                  onClose={() => setDrawerOpen(false)}
                >
                  <Box sx={{ width: 250 }} role="presentation">
                    <List>
                      {navItems.map((item) => (
                        <ListItem
                          button
                          key={item.section}
                          onClick={() => handleNavClick(item.section)}
                        >
                          <ListItemText primary={item.label} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Drawer>
              </Grid>
            ) : (
              <>
                <Grid
                  item
                  xs={7}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  {renderNavItems()}
                </Grid>
                <Grid
                  item
                  xs={2}
                  sx={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <StyledButton onClick={handleAuthButtonClick}>
                    {userData ? "Dashboard" : "Login"}
                  </StyledButton>
                </Grid>
              </>
            )}
          </Grid>
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Header;
