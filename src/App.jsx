// src/App.jsx
import React, { useEffect } from "react";
// import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import LocomotiveScroll from "locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";
import Home from "./pages/Home";
import "./styles/App.css";

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
    // <Router>
    <div id="smooth-wrapper">
      <div id="smooth-content">
        <div className="App" data-scroll-container>
          <Home />
        </div>
      </div>
    </div>
    // </Router>
  );
};

export default App;
