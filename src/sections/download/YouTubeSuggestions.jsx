import React, { useState, useEffect } from "react";
import { Box, Typography, Dialog, IconButton } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API; // Replace with your actual API key

const CustomArrow = ({ direction, onClick }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 2,
      [direction === "left" ? "left" : "right"]: -20,
      bgcolor: "rgba(255, 255, 255, 0.8)",
      "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
    }}
  >
    {direction === "left" ? <ArrowBackIosIcon /> : <ArrowForwardIosIcon />}
  </IconButton>
);

const YouTubeSuggestions = ({ documentName, documentTopics }) => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const query = `${documentName} ${documentTopics.join(" ")}`;
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
            query
          )}&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`
        );
        const data = await response.json();
        setVideos(data.items);
      } catch (error) {
        console.error("Error fetching YouTube videos:", error);
      }
    };

    fetchVideos();
  }, [documentName, documentTopics]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    prevArrow: <CustomArrow direction="left" />,
    nextArrow: <CustomArrow direction="right" />,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3, slidesToScroll: 1 },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 2, slidesToScroll: 1 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
    ],
  };

  return (
    <Box sx={{ mt: 4, position: "relative" }}>
      <Typography variant="h6" gutterBottom>
        Suggested Videos
      </Typography>
      {videos.length > 0 ? (
        <Slider {...settings}>
          {videos.map((video) => (
            <Box key={video.id.videoId} sx={{ px: 1 }}>
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: 1,
                  height: 250,
                  cursor: "pointer",
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: 3,
                  },
                }}
                onClick={() => setSelectedVideo(video)}
              >
                <img
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  style={{ width: "100%", height: 180, objectFit: "cover" }}
                />
                <Typography
                  variant="body2"
                  sx={{ p: 1, height: 70, overflow: "hidden" }}
                >
                  {video.snippet.title}
                </Typography>
              </Box>
            </Box>
          ))}
        </Slider>
      ) : (
        <Typography>Loading videos...</Typography>
      )}
      <Dialog
        open={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        maxWidth="md"
        sx={{
          backdropFilter: "blur(3px)",
          backgroundColor: "rgba(0,0,30,0.4)",
        }}
        fullWidth
      >
        {selectedVideo && (
          <>
            <IconButton
              onClick={() => setSelectedVideo(null)}
              sx={{ position: "absolute", right: 8, top: 8, color: "white" }}
            >
              <CloseIcon />
            </IconButton>
            <iframe
              width="100%"
              height="480"
              src={`https://www.youtube.com/embed/${selectedVideo.id.videoId}`}
              title={selectedVideo.snippet.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default YouTubeSuggestions;
