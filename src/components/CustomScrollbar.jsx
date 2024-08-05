import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

const ScrollContainer = styled("div")(({ theme, $isHovering }) => ({
  height: "100%",
  overflow: "auto",
  scrollbarWidth: "thin",
  scrollbarColor: $isHovering
    ? `${theme.palette.grey[400]} transparent`
    : "transparent transparent",
  transition: "scrollbar-color 0.3s ease",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.grey[400],
    borderRadius: "4px",
    opacity: $isHovering ? 1 : 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover::-webkit-scrollbar-thumb": {
    opacity: 1,
  },
}));

const CustomScrollbar = ({ children, onScroll, ...props }) => {
  const scrollRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (onScroll) {
        onScroll({
          scrollTop: scrollRef.current.scrollTop,
          scrollHeight: scrollRef.current.scrollHeight,
          clientHeight: scrollRef.current.clientHeight,
        });
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [onScroll]);

  return (
    <ScrollContainer
      ref={scrollRef}
      $isHovering={isHovering}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      {children}
    </ScrollContainer>
  );
};

CustomScrollbar.propTypes = {
  children: PropTypes.node.isRequired,
  onScroll: PropTypes.func,
};

export default CustomScrollbar;
