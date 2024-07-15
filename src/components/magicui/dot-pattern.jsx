import React from "react";

const DotPattern = ({ className, ...props }) => {
  return (
    <svg
      className={`w-full h-full ${className}`}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
    >
      <pattern
        id="dot-pattern"
        x="0"
        y="0"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="10" cy="10" r="1" fill="currentColor" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#dot-pattern)" />
    </svg>
  );
};
export default DotPattern;
