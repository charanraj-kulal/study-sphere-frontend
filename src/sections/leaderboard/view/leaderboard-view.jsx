import React, { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../../firebase";
import LeaderboardTable from "../leaderboard-table-rows";
import TopRankCard from "../top-rank-cards";

import rank1Image from "../../../assets/images/medals/1_medal.png";
import rank2Image from "../../../assets/images/medals/2_medal.png";
import rank3Image from "../../../assets/images/medals/3_medal.png";

export default function LeaderboardView() {
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("userrole", "==", 3),
          orderBy("points", "desc"),
          limit(3)
        );
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          rank: index + 1,
          ...doc.data(),
        }));

        setTopUsers(data);
      } catch (error) {
        console.error("Error fetching top users:", error);
      }
    };

    fetchTopUsers();
  }, []);

  return (
    <Container>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={5}
      >
        <Typography variant="h4">Leaderboard</Typography>
      </Stack>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 4,
        }}
      >
        {topUsers.map((user, index) => (
          <Box
            key={user.id}
            sx={{
              flex: index === 0 ? 1.2 : 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <TopRankCard
              user={user}
              rank={user.rank}
              medalImage={
                index === 0 ? rank1Image : index === 1 ? rank2Image : rank3Image
              }
            />
          </Box>
        ))}
      </Box>

      <LeaderboardTable />
    </Container>
  );
}
