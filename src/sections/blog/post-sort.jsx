import PropTypes from "prop-types";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

// ----------------------------------------------------------------------

PostSort.propTypes = {
  options: PropTypes.array,
  onSort: PropTypes.func,
  currentSort: PropTypes.string,
};

export default function PostSort({ options, onSort, currentSort }) {
  return (
    <TextField select size="small" value={currentSort} onChange={onSort}>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
