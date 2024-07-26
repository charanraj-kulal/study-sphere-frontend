import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Adjust the import path as needed

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import { alpha } from "@mui/material/styles";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";

import { fDate } from "../../utils/format-time";
import { fShortenNumber } from "../../utils/format-number";
import Iconify from "../../components/iconify";
import SvgColor from "../../components/svg-color";

// ----------------------------------------------------------------------

export default function PostCard({ post, index, onCardClick }) {
  const {
    title,
    blogPostDate,
    viewCount,
    commentCount,
    shareCount,
    blogPosterUid,
  } = post;

  const [authorInfo, setAuthorInfo] = useState({
    name: "",
    role: "",
    avatar: null,
  });
  useEffect(() => {
    const fetchAuthorInfo = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", blogPosterUid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setAuthorInfo({
            name: userData.name,
            role: getUserRole(userData.userrole),
            avatar: userData.profilePhotoURL,
          });
        }
      } catch (error) {
        console.error("Error fetching author info:", error);
      }
    };

    fetchAuthorInfo();
  }, [blogPosterUid]);

  const getUserRole = (userrole) => {
    switch (userrole) {
      case 1:
        return "Admin";
      case 2:
        return "Lecturer";
      case 3:
        return "";
      default:
        return "";
    }
  };

  const latestPostLarge = index === 0;
  const latestPost = index === 1 || index === 2;

  const coverImage = `../../src/assets/images/covers/cover_${(index % 24) + 1}.jpg`;

  const renderAvatar = (
    <Avatar
      alt="Author Avatar"
      src={authorInfo.avatar}
      sx={{
        zIndex: 9,
        width: 32,
        height: 32,
        position: "absolute",
        left: (theme) => theme.spacing(3),
        bottom: (theme) => theme.spacing(-2),
        ...((latestPostLarge || latestPost) && {
          zIndex: 9,
          top: 24,
          left: 24,
          width: 40,
          height: 40,
        }),
      }}
    />
  );

  const renderTitle = (
    <>
      <Typography
        onClick={() => onCardClick(post)}
        color="inherit"
        variant="subtitle2"
        underline="hover"
        sx={{
          height: 44,
          overflow: "hidden",
          WebkitLineClamp: 2,
          cursor: "pointer",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          ...(latestPostLarge && { typography: "h5", height: 60 }),
          ...((latestPostLarge || latestPost) && {
            color: "common.white",
          }),
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          mt: 1,
          display: "block",
          ...((latestPostLarge || latestPost) && {
            color: "common.white",
            opacity: 0.72,
          }),
        }}
      >
        {authorInfo.name} {authorInfo.role && `  (${authorInfo.role})`}
      </Typography>
    </>
  );

  const renderInfo = (
    <Stack
      direction="row"
      flexWrap="wrap"
      spacing={1.5}
      justifyContent="flex-end"
      sx={{
        mt: 3,
        color: "text.disabled",
      }}
    >
      {[
        { number: commentCount || 0, icon: "eva:message-circle-fill" },
        { number: viewCount || 0, icon: "eva:eye-fill" },
        { number: shareCount || 0, icon: "eva:share-fill" },
      ].map((info, _index) => (
        <Stack
          key={_index}
          direction="row"
          sx={{
            ...((latestPostLarge || latestPost) && {
              opacity: 0.48,
              color: "common.white",
            }),
          }}
        >
          <Iconify width={16} icon={info.icon} sx={{ mr: 0.5 }} />
          <Typography variant="caption">
            {fShortenNumber(info.number)}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );

  const renderCover = (
    <Box
      component="img"
      alt={title}
      src={coverImage}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: "cover",
        position: "absolute",
      }}
    />
  );

  const renderDate = (
    <Typography
      variant="caption"
      component="div"
      sx={{
        mb: 2,
        color: "text.disabled",
        ...((latestPostLarge || latestPost) && {
          opacity: 0.48,
          color: "common.white",
        }),
      }}
    >
      {fDate(blogPostDate.toDate())}
    </Typography>
  );

  const renderShape = (
    <SvgColor
      color="paper"
      src="/assets/icons/shape-avatar.svg"
      sx={{
        width: 80,
        height: 36,
        zIndex: 9,
        bottom: -15,
        position: "absolute",
        color: "background.paper",
        ...((latestPostLarge || latestPost) && { display: "none" }),
      }}
    />
  );

  return (
    <Grid xs={12} sm={latestPostLarge ? 12 : 6} md={latestPostLarge ? 6 : 3}>
      <Card>
        <Box
          sx={{
            position: "relative",
            pt: "calc(100% * 3 / 4)",
            ...((latestPostLarge || latestPost) && {
              pt: "calc(100% * 4 / 3)",
              "&:after": {
                top: 0,
                content: "''",
                width: "100%",
                height: "100%",
                position: "absolute",
                bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
              },
            }),
            ...(latestPostLarge && {
              pt: {
                xs: "calc(100% * 4 / 3)",
                sm: "calc(100% * 3 / 4.66)",
              },
            }),
          }}
        >
          {renderShape}

          {renderAvatar}

          {renderCover}
        </Box>

        <Box
          sx={{
            p: (theme) => theme.spacing(4, 3, 3, 3),
            ...((latestPostLarge || latestPost) && {
              width: 1,
              bottom: 0,
              position: "absolute",
            }),
          }}
        >
          {renderDate}

          {renderTitle}

          {renderInfo}
        </Box>
      </Card>
    </Grid>
  );
}

PostCard.propTypes = {
  post: PropTypes.object.isRequired,
  index: PropTypes.number,
  onCardClick: PropTypes.func.isRequired,
};
