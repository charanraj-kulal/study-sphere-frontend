import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Iconify from "../../../components/iconify";
import { useUser } from "../../../hooks/UserContext";
import { db } from "../../../firebase";

export default function PointsDisplay() {
  const [points, setPoints] = useState(0);
  const { userData } = useUser();

  useEffect(() => {
    const fetchPoints = async () => {
      if (userData) {
        const userDocRef = doc(db, "users", userData.uid);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          setPoints(userSnapshot.data()?.points || 0);
        }
      }
    };

    fetchPoints();
  }, [userData, db]);

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Iconify
        icon="material-symbols-light:diamond-outline"
        sx={{ ml: 1, color: "black" }}
      />

      <Typography variant="body2" sx={{ ml: 1, color: "black" }}>
        {points}
      </Typography>
    </Box>
  );
}
