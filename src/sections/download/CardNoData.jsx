import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import IllustrationBadSearch from "../../assets/illustrations/illustration_bad_search.png";
import Box from "@mui/material/Box";

export default function CardNoData({ query }) {
  return (
    <Card
      sx={{
        textAlign: "center",
        p: 3,
        width: "100%",
        boxShadow: (theme) => theme.customShadows.z8,
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: 80,
          mb: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Add your image here */}
        <img
          src={IllustrationBadSearch}
          alt="Search Illustration"
          style={{ maxWidth: "150px", marginBottom: "10px" }}
        />
      </Box>

      <Typography variant="h6" paragraph>
        No Results Found
      </Typography>

      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        No results found for &nbsp;
        <strong>&quot;{query}&quot;</strong>.
        <br /> Try checking for typos or using complete words.
      </Typography>
    </Card>
  );
}

CardNoData.propTypes = {
  query: PropTypes.string,
};
