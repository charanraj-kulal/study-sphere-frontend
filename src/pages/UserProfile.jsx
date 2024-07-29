// src/pages/UserProfile.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserDetailsDialog from "../sections/user/user-details-dialog";
import { Box, Typography, Button } from "@mui/material";
import { db, auth } from "../firebase"; // Adjust this import based on your Firebase setup
import { doc, getDoc } from "firebase/firestore";
import { useUser } from "../hooks/UserContext";
const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userData } = useUser();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleClose = () => {
    navigate(-1);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!user) {
    return <Typography>User not found</Typography>;
  }

  return (
    <Box>
      <UserDetailsDialog
        open={true}
        onClose={handleClose}
        userId={userId}
        user={user}
        currentUser={userData}
      />
    </Box>
  );
};

export default UserProfile;
