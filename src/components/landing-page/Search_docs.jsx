import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Autocomplete,
  TextField,
  InputAdornment,
  Box,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import debounce from "lodash/debounce";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { useUser } from "../../hooks/UserContext";

const StyledSearchSection = styled("section")(({ theme }) => ({
  padding: theme.spacing(4, 0),
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "Pacifico, cursive",
  color: "#0033a0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 0 30px 0",
  padding: "20px 0",
  width: "30%",
  background: "#fff",
  "&::before, &::after": {
    content: '""',
    flex: 1,
    height: 2,
    borderBottom: "2px solid #0033a0",
    margin: "0px 15px",
  },
}));

const SearchBoxContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  maxWidth: "800px",
  backgroundColor: "#fff",

  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  padding: theme.spacing(0.5),
}));

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  flex: 1,
  borderColor: "1px solid #0000",
  "& .MuiInputBase-root": {
    border: "none",
    "&:hover": {
      border: "none",
    },
  },
}));

const SearchButton = styled(Button)(({ theme }) => ({
  height: "100%",
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1, 3),
  marginLeft: theme.spacing(1),
}));

const SearchBar = () => {
  const [options, setOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { userData } = useUser();
  const sectionRef = useRef(null);

  const fetchSuggestions = async (searchTerm) => {
    if (!searchTerm) {
      setOptions([]);
      return;
    }

    setLoading(true);
    const materialsRef = collection(db, "documents");
    const q = query(
      materialsRef,
      where("visibility", "==", "public"),
      where("Approved", "==", "Yes"),
      orderBy("uploadedOn", "desc")
    );

    const querySnapshot = await getDocs(q);
    const materials = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const filteredMaterials = materials.filter(
      (material) =>
        material.documentName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.documentTopics.some((topic) =>
          topic.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        material.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.uploaderCourse.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setOptions(filteredMaterials.slice(0, 4));
    setLoading(false);
  };

  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 300),
    []
  );

  useEffect(() => {
    debouncedFetchSuggestions(searchQuery);
  }, [searchQuery, debouncedFetchSuggestions]);

  const handleInputChange = (event, newInputValue) => {
    setSearchQuery(newInputValue);
  };

  const handleOptionSelect = (event, value) => {
    if (value) {
      if (value === "viewMore") {
        navigate("/dashboard/download");
      } else if (userData) {
        navigate(`/dashboard/download?documentId=${value.id}`);
      } else {
        navigate("/login");
      }
    }
  };

  const handleSearch = () => {
    navigate(`/dashboard/download?search=${searchQuery}`);
  };

  const getOptionLabel = (option) => {
    if (option === "viewMore") return "View more results";
    return option.documentName || "";
  };

  const renderOption = (props, option) => {
    if (option === "viewMore") {
      return (
        <li {...props}>
          <Typography color="primary">View more results</Typography>
        </li>
      );
    }

    const truncatedDescription =
      option.description.split(" ").slice(0, 10).join(" ") +
      (option.description.split(" ").length > 10 ? "..." : "");
    const displayedTopics = option.documentTopics.slice(0, 3).join(", ");

    return (
      <li {...props}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Box>
            <Typography color="#0033a0" fontWeight="bold">
              {option.documentName}
            </Typography>
            <Typography variant="body2">{truncatedDescription}</Typography>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ minWidth: "30%", textAlign: "right" }}
          >
            {displayedTopics}
          </Typography>
        </Box>
      </li>
    );
  };

  return (
    <StyledSearchSection id="searchSection" ref={sectionRef}>
      <SectionTitle variant="h4">Search Study Materials</SectionTitle>
      <SearchBoxContainer>
        <StyledAutocomplete
          freeSolo
          options={[...options, "viewMore"]}
          getOptionLabel={getOptionLabel}
          renderOption={renderOption}
          onInputChange={handleInputChange}
          onChange={handleOptionSelect}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search study materials..."
              variant="standard"
              fullWidth
              InputProps={{
                ...params.InputProps,
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#0A4191", ml: 1 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                    {loading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </Box>
                ),
              }}
            />
          )}
        />
        <SearchButton
          variant="contained"
          color="primary"
          onClick={handleSearch}
        >
          Search
        </SearchButton>
      </SearchBoxContainer>
    </StyledSearchSection>
  );
};

export default SearchBar;
