import { useEffect, useMemo } from "react";
import PropTypes from "prop-types";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";

import Avatar from "@mui/material/Avatar";
import { alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import ListItemButton from "@mui/material/ListItemButton";

import { usePathname } from "../../routes/hooks";
import { RouterLink } from "../../routes/components";

import { useResponsive } from "../../hooks/use-responsive";
import { useUser } from "../../hooks/UserContext";

import Logo from "../../components/logo";
// import Scrollbar from "../../components/scrollbar";
import CustomScrollbar from "../../components/CustomScrollbar";

import { NAV } from "./config-layout";
import navConfig from "./config-navigation";
// import IllustrationAvatar from "../../assets/illustrations/illustration_avatar.png";
import IllustrationAvatar from "../../assets/illustrations/illustration_donation.png";

// ----------------------------------------------------------------------

export default function Nav({ openNav, onCloseNav }) {
  const pathname = usePathname();
  const { userData } = useUser();
  const upLg = useResponsive("up", "lg");

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  const filteredNavConfig = useMemo(() => {
    return navConfig.filter((item) => item.roles.includes(userData.userRole));
  }, [userData.userRole]);
  const renderAccount = (
    <Box
      sx={{
        my: 3,
        mx: 2.5,
        py: 2,
        px: 2.5,
        display: "flex",
        borderRadius: 1.5,
        alignItems: "center",
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
      }}
    >
      <Avatar src={userData.photoURL} alt="photoURL" />

      <Box sx={{ ml: 2 }}>
        <Typography variant="subtitle2">{userData.displayName}</Typography>

        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {userData.userRole === 3
            ? "Student"
            : userData.userRole === 2
              ? "Lecturer"
              : userData.userRole === 1
                ? "Admin"
                : "Unknown Role"}
        </Typography>
      </Box>
    </Box>
  );

  const renderMenu = (
    <Stack component="nav" spacing={0.5} sx={{ px: 2 }}>
      {filteredNavConfig.map((item) => (
        <NavItem key={item.title} item={item} />
      ))}
    </Stack>
  );

  const renderUpgrade = (
    <Box sx={{ px: 2.5, pb: 3, mt: 10 }}>
      <Stack
        alignItems="center"
        spacing={3}
        sx={{ pt: 5, borderRadius: 2, position: "relative" }}
      >
        <Box
          component="img"
          src={IllustrationAvatar}
          sx={{ width: 100, position: "absolute", top: -50 }}
        />

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6">Felt useful?</Typography>

          <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
            Donate something..
          </Typography>
        </Box>

        <Button
          href="https://razorpay.me/@agnisia"
          target="_blank"
          variant="contained"
          sx={{
            backgroundColor: "#0a4191",
            color: "white",
            "&:hover": {
              backgroundColor: "#f9a825",
              color: "black",
            },
          }}
          // color="inherit"
          // backgr
        >
          Donate now
        </Button>

        {/* <Box component="form">
          <script
            src="https://checkout.razorpay.com/v1/payment-button.js"
            data-payment_button_id="pl_OfWyROq0DgW0kE"
            async
          />
        </Box> */}
      </Stack>
    </Box>
  );
  const renderContent = (
    <CustomScrollbar
    // sx={{
    //   height: "100vh",
    //   "& > div": {
    //     display: "flex",
    //     flexDirection: "column",
    //     minHeight: "100%",
    //   },
    // }}
    >
      <Stack>
        <Logo sx={{ mt: 3, ml: 4 }} />
      </Stack>
      {renderAccount}

      {renderMenu}

      <Box sx={{ flexGrow: 1 }} />

      {renderUpgrade}
    </CustomScrollbar>
  );

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.WIDTH },
      }}
    >
      {upLg ? (
        <Box
          sx={{
            height: 1,
            position: "fixed",
            width: NAV.WIDTH,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
        </Box>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.WIDTH,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

// ----------------------------------------------------------------------

function NavItem({ item }) {
  const pathname = usePathname();

  const active = item.path === pathname;

  return (
    <ListItemButton
      component={RouterLink}
      href={item.path}
      sx={{
        minHeight: 44,
        borderRadius: 0.75,
        typography: "body2",
        color: "text.secondary",
        textTransform: "capitalize",
        fontWeight: "fontWeightMedium",
        ...(active && {
          color: "primary.main",
          fontWeight: "fontWeightSemiBold",
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          "&:hover": {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
          },
        }),
      }}
    >
      <Box component="span" sx={{ width: 24, height: 24, mr: 2 }}>
        {item.icon}
      </Box>

      <Box component="span">{item.title} </Box>
    </ListItemButton>
  );
}

NavItem.propTypes = {
  item: PropTypes.object,
};
