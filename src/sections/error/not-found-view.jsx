import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { RouterLink } from "../../routes/components";

import Logo from "../../components/logo";
import { useUser } from "../../hooks/UserContext";

import { useNavigate } from "react-router-dom";
import Iconify from "../../components/iconify";

// ----------------------------------------------------------------------

export default function NotFoundView() {
  const { userData } = useUser();
  const navigate = useNavigate();
  const HandleGoBack = () => {
    navigate(-1);
  };

  const renderHeader = (
    <Box
      component="header"
      sx={{
        top: 0,
        left: 0,
        width: 1,
        lineHeight: 0,
        position: "fixed",
        p: (theme) => ({
          xs: theme.spacing(3, 3, 0),
          sm: theme.spacing(5, 5, 0),
        }),
      }}
    >
      <Logo />
    </Box>
  );

  return (
    <>
      {renderHeader}

      <Container>
        <Box
          sx={{
            py: 8,
            maxWidth: 480,
            mx: "auto",
            display: "flex",
            minHeight: "100vh",
            textAlign: "center",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography variant="h3" sx={{ mb: 3 }}>
            Congarts {userData.displayName}, you Broke it!!!
          </Typography>

          <Typography sx={{ color: "text.secondary" }}>
            Sorry, we couldn’t find the page you’re looking for. Perhaps you’ve
            mistyped the URL? Be sure to check your spelling.
          </Typography>

          <Box
            component="img"
            src="src/assets/illustrations/illustration_404_1.png"
            sx={{
              mx: "auto",
              height: 300,
              my: { xs: 5, sm: 10 },
            }}
          />

          <Button
            onClick={HandleGoBack}
            size="large"
            variant="contained"
            component={RouterLink}
            sx={{
              backgroundColor: "#0a4191",
              "&:hover": {
                backgroundColor: "#f9a825",
                color: "black",
              },
            }}
          >
            <Iconify
              icon="humbleicons:arrow-go-back"
              width={22}
              height={22}
              sx={{ mr: 1 }}
            />
            Go Back
          </Button>
        </Box>
      </Container>
    </>
  );
}
