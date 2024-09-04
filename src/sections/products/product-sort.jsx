import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

import Menu from "@mui/material/Menu";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { listClasses } from "@mui/material/List";
import Typography from "@mui/material/Typography";

import Iconify from "../../components/iconify";

const SORT_OPTIONS = [
  { value: "featured", label: "sort_oldest" },
  { value: "newest", label: "sort_newest" },
  { value: "priceDesc", label: "sort_price_high_low" },
  { value: "priceAsc", label: "sort_price_low_high" },
];

export default function ShopProductSort({ onSort }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(null);
  const [selected, setSelected] = useState("newest");

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleMenuItemClick = (option) => {
    setSelected(option.value);
    onSort(option.value);
    handleClose();
  };

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        onClick={handleOpen}
        endIcon={
          <Iconify
            icon={open ? "eva:chevron-up-fill" : "eva:chevron-down-fill"}
          />
        }
      >
        {t("sort_by")}:&nbsp;
        <Typography
          component="span"
          variant="subtitle2"
          sx={{ color: "text.secondary" }}
        >
          {t(SORT_OPTIONS.find((option) => option.value === selected).label)}
        </Typography>
      </Button>

      <Menu
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 200, maxHeight: listClasses.length * 48 },
        }}
      >
        {SORT_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === selected}
            onClick={() => handleMenuItemClick(option)}
            sx={{ typography: "body2" }}
          >
            {t(option.label)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

ShopProductSort.propTypes = {
  onSort: PropTypes.func,
};
