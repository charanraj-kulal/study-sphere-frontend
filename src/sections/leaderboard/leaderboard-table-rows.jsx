import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Avatar,
} from "@mui/material";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../../firebase";

import rank1Image from "/assets/images/medals/1_badge.png";
import rank2Image from "/assets/images/medals/2_badge.png";
import rank3Image from "/assets/images/medals/3_badge.png";
import { useTranslation } from "react-i18next"; // Import translation hook

const LeaderboardTable = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation(); // Translation hook

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("userrole", "==", 3),
          orderBy("points", "desc")
        );
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          rank: index + 1,
          ...doc.data(),
        }));

        setLeaderboardData(data);
      } catch (error) {
        console.error(t("fetchErrorLeader"), error);
      }
    };

    fetchLeaderboardData();
  }, [t]);

  const handleRowClick = (userId) => {
    navigate(`/dashboard/profile/${userId}`);
  };

  const getRankDisplay = (rank) => {
    switch (rank) {
      case 1:
        return (
          <img
            src={rank1Image}
            alt={t("first")}
            style={{ width: 30, height: 30 }}
          />
        );
      case 2:
        return (
          <img
            src={rank2Image}
            alt={t("second")}
            style={{ width: 33, height: 33 }}
          />
        );
      case 3:
        return (
          <img
            src={rank3Image}
            alt={t("third")}
            style={{ width: 30, height: 30 }}
          />
        );
      default:
        return (
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 20,
              height: 20,
              fontSize: 16,
              ml: 0.5,
            }}
          >
            {rank}
          </Avatar>
        );
    }
  };
  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" sx={{ p: 2 }}>
        {t("studentLeaderboard")}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t("rank")}</TableCell>
            <TableCell>{t("username")}</TableCell>
            <TableCell align="center">{t("uploads")}</TableCell>
            <TableCell align="center">{t("downloads")}</TableCell>
            <TableCell align="center">{t("docApproved")}</TableCell>
            <TableCell align="center">{t("docRejected")}</TableCell>
            <TableCell align="center">{t("points")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leaderboardData.map((user) => (
            <TableRow
              key={user.id}
              onClick={() => handleRowClick(user.id)}
              style={{ cursor: "pointer" }}
            >
              <TableCell>
                <div
                  style={{
                    display: "flex",
                  }}
                >
                  {getRankDisplay(user.rank)}
                </div>
              </TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell align="center">{user.uploadCount || 0}</TableCell>
              <TableCell align="center">{user.downloadCount || 0}</TableCell>
              <TableCell align="center">{user.countOfApprove || 0}</TableCell>
              <TableCell align="center">{user.countOfRejection || 0}</TableCell>
              <TableCell align="center">{user.points || 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LeaderboardTable;
