// src/components/SkeletonLoader.jsx
import React from "react";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

const SkeletonLoader = () => {
  return (
    <Box>
      <Skeleton variant="text" height={40} width="80%" />
      <Skeleton variant="rectangular" height={200} />
      <Skeleton variant="text" height={40} width="60%" />
    </Box>
  );
};

export default SkeletonLoader;
