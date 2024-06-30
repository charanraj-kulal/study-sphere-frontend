import React, { useEffect } from "react";
// import { BrowserRouter as Router } from "react-router-dom";
import LocomotiveScroll from "locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";
import HeaderAndRoutes from "./routes/hooks/HeaderAndRoutes"; // Import the new wrapper component
import "./styles/App.css";
import Router from "./routes/sections";
import ThemeProvider from "./theme";

const App = () => {
  useEffect(() => {
    const scroll = new LocomotiveScroll({
      el: document.querySelector("#smooth-content"),
      smooth: true,
    });

    return () => {
      scroll.destroy();
    };
  }, []);

  return (
    <ThemeProvider>
      <Router />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="App" data-scroll-container>
            <HeaderAndRoutes />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
