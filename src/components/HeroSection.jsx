// src/components/HeroSection.jsx
import React from "react";
import "../styles/HeroSection.css"; // Create this CSS file for hero section specific styles

const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="container">
        <div className="hero-text">
          <h1>
            Welcome to <span className="highlight">Study Sphere</span>
          </h1>
          <p>
            Your ultimate destination for collaborative learning and resource
            sharing
          </p>
          <a href="/login" className="btn-login">
            Login
          </a>
        </div>
        <div className="hero-image">
          <img src="/images/hero_image_2.png" alt="Hero" />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
