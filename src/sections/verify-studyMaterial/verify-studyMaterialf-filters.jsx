import React from "react";
import PropTypes from "prop-types";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import Iconify from "../../components/iconify";

export default function StudyMaterialFilters({
  filterValue,
  onFilterChange,
  onToggleDomainFilter,
  showMyDomain,
}) {
  return (
    <Toolbar
      sx={{
        height: 96,
        display: "flex",
        justifyContent: "space-between",
        p: 2,
      }}
    >
      <Typography variant="h6" component="div">
        Study Materials
      </Typography>
      <div>
        <OutlinedInput
          value={filterValue}
          onChange={onFilterChange}
          placeholder="Search documents..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{ color: "text.disabled", width: 20, height: 20 }}
              />
            </InputAdornment>
          }
        />
        <Tooltip title={showMyDomain ? "Show All" : "Show My Domain"}>
          <IconButton onClick={onToggleDomainFilter}>
            <Iconify icon="ic:round-filter-list" />
          </IconButton>
        </Tooltip>
      </div>
    </Toolbar>
  );
}

StudyMaterialFilters.propTypes = {
  filterValue: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onToggleDomainFilter: PropTypes.func.isRequired,
  showMyDomain: PropTypes.bool.isRequired,
};
