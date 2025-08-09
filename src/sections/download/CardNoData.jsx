import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import IllustrationBadSearch from "/assets/illustrations/illustration_bad_search.png";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";

export default function CardNoData({ query }) {
  const { t } = useTranslation(); // Translation hook

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
          alt={t("searchIllustrationAlt")}
          style={{ maxWidth: "150px", marginBottom: "10px" }}
        />
      </Box>

      <Typography variant="h6" paragraph>
        {t("noResultsFound")}
      </Typography>

      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {t("noResultsDescription", { query })}
      </Typography>
    </Card>
  );
}

CardNoData.propTypes = {
  query: PropTypes.string,
};
