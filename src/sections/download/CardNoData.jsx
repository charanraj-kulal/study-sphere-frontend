import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Iconify from "../../components/iconify";

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
      <Iconify
        icon="eva:search-fill"
        sx={{
          width: 40,
          height: 40,
          color: "text.secondary",
          mb: 3,
        }}
      />

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
