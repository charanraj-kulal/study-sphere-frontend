import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

export default function VerifyStudyMaterialSkeleton() {
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 2,
        height: "100%",
        boxShadow: 3,
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "#101010" : "#fff",
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: 120,
          mb: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "grey.200",
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" sx={{ mb: 2 }} />
      </Box>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="text" width="30%" />
        </Box>
      </Stack>
    </Card>
  );
}
