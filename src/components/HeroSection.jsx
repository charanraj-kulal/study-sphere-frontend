// src/components/HeroSection.jsx
import React from "react";

const HeroSection = () => {
  return (
    <div className="hero-section">
      <h1>Welcome to Study Sphere</h1>
      <p>
        Your ultimate destination for collaborative learning and resource
        sharing
      </p>
      <a href="/register" className="btn btn-primary">
        Get Started
      </a>
      <a href="/login" className="btn btn-secondary">
        Login
      </a>
    </div>
  );
};

export default HeroSection;
