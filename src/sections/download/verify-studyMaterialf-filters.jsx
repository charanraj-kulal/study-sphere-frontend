import React from "react";
import PropTypes from "prop-types";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Iconify from "../../components/iconify";

export default function VerifyStudyMaterialFilters({
  filterValue,
  onFilterChange,
  onSortChange,
  sortBy,
  domainFilter,
  onDomainFilterChange,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSortChange = (value) => {
    onSortChange(value);
    handleClose();
  };

  return (
    <Toolbar
      sx={{
        height: 96,
        display: "flex",
        justifyContent: "space-between",
        p: 2,
      }}
    >
      <Box>
        <Button
          variant={domainFilter === "My domain" ? "contained" : "outlined"}
          onClick={() => onDomainFilterChange("My domain")}
          sx={{ mr: 1 }}
        >
          My domain
        </Button>
        <Button
          variant={domainFilter === "All" ? "contained" : "outlined"}
          onClick={() => onDomainFilterChange("All")}
        >
          All
        </Button>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <OutlinedInput
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="Search documents..."
          sx={{ mr: 1 }}
          startAdornment={
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{ color: "text.disabled", width: 20, height: 20 }}
              />
            </InputAdornment>
          }
        />
        <Tooltip title="Sort">
          <IconButton onClick={handleClick}>
            <Iconify icon="ic:round-filter-list" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem
            onClick={() => handleSortChange("newest")}
            selected={sortBy === "newest"}
          >
            Newest
          </MenuItem>
          <MenuItem
            onClick={() => handleSortChange("oldest")}
            selected={sortBy === "oldest"}
          >
            Oldest
          </MenuItem>
        </Menu>
      </Box>
    </Toolbar>
  );
}

VerifyStudyMaterialFilters.propTypes = {
  filterValue: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  domainFilter: PropTypes.string.isRequired,
  onDomainFilterChange: PropTypes.func.isRequired,
};
