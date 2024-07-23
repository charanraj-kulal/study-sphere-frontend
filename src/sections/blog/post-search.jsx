import PropTypes from "prop-types";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Autocomplete, { autocompleteClasses } from "@mui/material/Autocomplete";

import Iconify from "../../components/iconify";

// ----------------------------------------------------------------------

PostSearch.propTypes = {
  posts: PropTypes.array.isRequired,
};

export default function PostSearch({ posts, onSearch }) {
  return (
    <Autocomplete
      sx={{ width: 280 }}
      autoHighlight
      popupIcon={null}
      options={posts}
      getOptionLabel={(post) => post.title}
      onChange={(event, value) => onSearch(value ? value.title : "")}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search post..."
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Iconify
                  icon="eva:search-fill"
                  sx={{ ml: 1, width: 20, height: 20, color: "text.disabled" }}
                />
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
}
