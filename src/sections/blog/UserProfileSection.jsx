import React from "react";
import { Box, Avatar, Typography, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";

const UserProfileSection = ({ user }) => {
  console.log(user.BlogPosterUid);
  const navigate = useNavigate();
  const getRoleLabel = (roleNumber) => {
    switch (roleNumber) {
      case 1:
        return "Admin";
      case 2:
        return "Lecturer";
      case 3:
        return "Student";
      default:
        return "User";
    }
  };
  //user profile navigation
  const handleUserClick = (userId) => {
    navigate(`/dashboard/profile/${userId}`);
  };

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", mb: 2, cursor: "pointer" }}
      onClick={() => handleUserClick(user.BlogPosterUid)}
    >
      <Avatar
        src={user.photoURL}
        alt={user.displayName}
        sx={{ width: 40, height: 40, mr: 2 }}
      />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h6" sx={{ mr: 1 }}>
            {user.displayName}
          </Typography>
          {user.role && (
            <Chip
              label={getRoleLabel(user.role)}
              size="small"
              color={
                user.role === 1
                  ? "error"
                  : user.role === 2
                    ? "primary"
                    : "default"
              }
            />
          )}
        </Box>
        {user.email && (
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default UserProfileSection;
