import React, { useState } from "react";
import PropTypes from "prop-types";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";

import Iconify from "../../components/iconify";

export const CATEGORY_OPTIONS = [
  "All",
  "Pens",
  "Pencils",
  "Notebooks",
  "Paper",
  "Folders",
  "Binders",
  "Staplers",
  "Scissors",
  "Markers",
  "Highlighters",
  "Erasers",
];

export const PRICE_OPTIONS = [
  { value: "1-100", label: "$1 - $100" },
  { value: "100-200", label: "$100 - $200" },
  { value: "200-300", label: "$200 - $300" },
  { value: "300-400", label: "$300 - $400" },
  { value: "400-500", label: "$400 - $500" },
  { value: "500+", label: "$500 and more" },
];

export const COLOR_OPTIONS = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#800000",
  "#008000",
  "#000080",
  "#808000",
  "#800080",
  "#008080",
  "#FFA500",
  "#A52A2A",
  "#DEB887",
  "#5F9EA0",
  "#7FFF00",
  "#D2691E",
];

export default function ProductFilters({
  openFilter,
  onOpenFilter,
  onCloseFilter,
  onFilter,
}) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedColors, setSelectedColors] = useState([]);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handlePriceChange = (event) => {
    setSelectedPrice(event.target.value);
  };

  const handleColorChange = (color) => {
    setSelectedColors((prevColors) =>
      prevColors.includes(color)
        ? prevColors.filter((c) => c !== color)
        : [...prevColors, color]
    );
  };

  const handleApplyFilters = () => {
    onFilter({
      categories: selectedCategories,
      price: selectedPrice,
      colors: selectedColors,
    });
    onCloseFilter();
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedPrice("");
    setSelectedColors([]);
    onFilter({});
    onCloseFilter();
  };

  const renderCategory = (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Category</Typography>
      <FormGroup>
        {CATEGORY_OPTIONS.map((item) => (
          <FormControlLabel
            key={item}
            control={
              <Checkbox
                checked={selectedCategories.includes(item)}
                onChange={() => handleCategoryChange(item)}
              />
            }
            label={item}
          />
        ))}
      </FormGroup>
    </Stack>
  );

  const renderColors = (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Colors</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {COLOR_OPTIONS.map((color) => (
          <Box
            key={color}
            sx={{
              width: 24,
              height: 24,
              bgcolor: color,
              borderRadius: "50%",
              cursor: "pointer",
              border: selectedColors.includes(color)
                ? "2px solid #000"
                : "none",
              "&:hover": {
                opacity: 0.8,
              },
            }}
            onClick={() => handleColorChange(color)}
          />
        ))}
      </Box>
    </Stack>
  );

  const renderPrice = (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Price</Typography>
      <RadioGroup value={selectedPrice} onChange={handlePriceChange}>
        {PRICE_OPTIONS.map((item) => (
          <FormControlLabel
            key={item.value}
            value={item.value}
            control={<Radio />}
            label={item.label}
          />
        ))}
      </RadioGroup>
    </Stack>
  );

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        endIcon={<Iconify icon="ic:round-filter-list" />}
        onClick={onOpenFilter}
      >
        Filters&nbsp;
      </Button>
      <Drawer
        anchor="right"
        open={openFilter}
        onClose={onCloseFilter}
        PaperProps={{
          sx: { width: 280, border: "none", overflow: "hidden" },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 1, py: 2 }}
        >
          <Typography variant="h6" sx={{ ml: 1 }}>
            Filters
          </Typography>
          <IconButton onClick={onCloseFilter}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
        <Divider />

        <Box sx={{ flexGrow: 1, overflow: "auto", p: 3 }}>
          <Stack spacing={3} sx={{ p: 1 }}>
            {renderCategory}
            {renderColors}
            {renderPrice}
          </Stack>
        </Box>

        <Box sx={{ p: 3 }}>
          <Button
            fullWidth
            size="large"
            type="submit"
            color="inherit"
            variant="outlined"
            onClick={handleApplyFilters}
            startIcon={<Iconify icon="ic:round-filter-list" />}
          >
            Apply Filters
          </Button>
          <Button
            fullWidth
            size="large"
            type="submit"
            color="inherit"
            variant="outlined"
            onClick={handleClearFilters}
            startIcon={<Iconify icon="ic:round-clear-all" />}
            sx={{ mt: 1 }}
          >
            Clear All
          </Button>
        </Box>
      </Drawer>
    </>
  );
}

ProductFilters.propTypes = {
  openFilter: PropTypes.bool,
  onOpenFilter: PropTypes.func,
  onCloseFilter: PropTypes.func,
  onFilter: PropTypes.func,
};
