import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Iconify from "../../components/iconify";

const BreadcrumbsNavigation = ({ breadcrumbs, handleBreadcrumbClick }) => {
  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      sx={{ mb: 3 }}
      separator={
        <Iconify
          icon="ic:round-navigate-next"
          sx={{
            width: 30,
            height: 30,
            color: "text.secondary",
          }}
        />
      }
    >
      {breadcrumbs.map((breadcrumb, index) => (
        <Link
          key={index}
          color="inherit"
          href="#"
          onClick={(event) => handleBreadcrumbClick(event, index)}
          sx={{ textDecoration: "none", color: "#0A4191" }}
        >
          {breadcrumb}
        </Link>
      ))}
    </Breadcrumbs>
  );
};

export default BreadcrumbsNavigation;
