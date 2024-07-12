// src/components/LottieLoader.jsx
import React from "react";
import Lottie from "lottie-react";
import loaderAnimation from "../assets/images/loader/Animation - 1720094628516 (1).json";

const LottieLoader = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(3px)",
        backgroundColor: "rgba(0,0,30,0.4)",
        zIndex: 9999,
      }}
    >
      <Lottie
        animationData={loaderAnimation}
        loop={true}
        style={{ width: 100, height: 100 }}
      />
    </div>
  );
};

export default LottieLoader;
