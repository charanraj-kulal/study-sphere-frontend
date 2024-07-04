// src/components/LottieLoader.jsx
import React from "react";
import Lottie from "lottie-react";
import loaderAnimation from "../assets/images/loader/Animation - 1720094628516 (1).json"; // Adjust the path to your lottie JSON file

const LottieLoader = () => {
  return (
    // <div
    //   style={{
    //     position: "fixed",
    //     top: 0,
    //     left: 0,
    //     right: 0,
    //     bottom: 0,
    //     display: "flex",
    //     justifyContent: "center",
    //     alignItems: "center",
    //     backgroundColor: "rgba(0, 0, 0, 0.5)",
    //     zIndex: 9999,
    //   }}
    // >
    <div className="lottie-loader">
      <Lottie
        animationData={loaderAnimation}
        loop={true}
        // style={{ width: 200, height: 200 }}
      />
    </div>
  );
};

export default LottieLoader;
