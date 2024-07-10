// SkeletonCard.jsx
import React from "react";
import { Card, Box, Skeleton } from "@mui/material";

export default function SkeletonCard() {
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "row",
        p: 2,
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Skeleton
        variant="rectangular"
        width={120}
        height={160}
        sx={{ borderRadius: 2, mr: 2 }}
      />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          ml: 4,
        }}
      >
        <Box>
          <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="100%" />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            mt: 2,
          }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ ml: 1, flexGrow: 1 }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              sx={{ mr: 1 }}
            />
            <Skeleton variant="text" width={30} />
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              sx={{ ml: 2, mr: 1 }}
            />
            <Skeleton variant="text" width={30} />
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
