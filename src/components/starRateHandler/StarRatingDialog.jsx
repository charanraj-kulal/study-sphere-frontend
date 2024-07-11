import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Rating,
  Button,
  Box,
} from "@mui/material";

const StarRatingDialog = ({ open, onClose, onRate, currentRating }) => {
  const [rating, setRating] = useState(currentRating);

  useEffect(() => {
    setRating(currentRating);
  }, [currentRating]);

  const handleRate = () => {
    onRate(rating);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      style={{
        backdropFilter: "blur(5px)",
        backgroundColor: "rgba(0,0,30,0.1)",
      }}
    >
      <DialogTitle>
        {currentRating ? "Update your rating" : "Rate this document"}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Rating
            name="document-rating"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
            size="large"
          />
          <Button variant="contained" onClick={handleRate} disabled={!rating}>
            {currentRating ? "Update Rating" : "Submit Rating"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default StarRatingDialog;
