import { useState, useCallback } from "react";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import Iconify from "../../components/iconify";
import debounce from "lodash/debounce";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const debouncedSearch = useCallback(
    debounce((value) => {
      onSearch(value);
    }, 300),
    [onSearch]
  );

  const handleSearchChange = (event) => {
    const { value } = event.target;
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <Paper
      sx={{
        p: "4px 4px",
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: 600,
        boxShadow: 3,
        borderRadius: 2,
        border: "1px solid #ddd", // Added border
        backgroundColor: "#fff", // Ensured background color is white
      }}
    >
      <SearchIcon sx={{ p: "10px" }} />
      <InputBase
        sx={{ ml: 1, flex: 1, borderColor: "#00000" }}
        placeholder="Search study materials..."
        inputProps={{ "aria-label": "search study materials" }}
        value={query}
        onChange={handleSearchChange}
        startAdornment={
          <InputAdornment position="start">
            <Iconify
              icon="eva:search-fill"
              sx={{ color: "#0A4191", width: 20, height: 20, mb: 0.5, mr: 1 }}
            />
          </InputAdornment>
        }
      />
    </Paper>
  );
}
