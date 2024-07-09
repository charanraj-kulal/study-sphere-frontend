import React, { useState, useRef, useEffect } from "react";
import Confetti from "react-dom-confetti";
import { Button } from "@mui/material";
import { styled } from "@mui/system";

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
  position: "relative",
  overflow: "visible",
}));

const ConfettiWrapper = styled("div")({
  position: "absolute",
  left: "50%",
  bottom: "100%",
  transform: "translateX(-50%)",
  width: "10px",
  height: "10px",
  pointerEvents: "none",
});

const confettiConfig = {
  angle: 90,
  spread: 60,
  startVelocity: 50,
  elementCount: 200,
  dragFriction: 0.08,
  duration: 4000,
  stagger: 4,
  width: "10px",
  height: "10px",
  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
  gravity: 0.7,
};

export const ConfettiButton = React.forwardRef((props, ref) => {
  const [isFiring, setIsFiring] = useState(false);

  useEffect(() => {
    if (isFiring) {
      const timer = setTimeout(() => setIsFiring(false), 4000); // Match this with the duration in confettiConfig
      return () => clearTimeout(timer);
    }
  }, [isFiring]);

  React.useImperativeHandle(ref, () => ({
    fire: () => {
      setIsFiring(true);
    },
  }));

  return (
    <StyledButton ref={ref} {...props}>
      <ConfettiWrapper>
        <Confetti active={isFiring} config={confettiConfig} />
      </ConfettiWrapper>
      {props.children}
    </StyledButton>
  );
});
