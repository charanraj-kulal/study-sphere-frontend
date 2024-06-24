// src/components/AboutUs.jsx
import React from "react";
import "../styles/AboutUs.css";

const AboutUs = () => {
  return (
    <section id="about-us" className="about-us-section">
      <div className="container">
        <div className="about-us-image">
          <img src="/images/about_us_img.png" alt="Students" />
        </div>
        <div className="about-us-text">
          <h2>ABOUT US</h2>
          <p>
            Study Sphere is dedicated to creating a collaborative and
            resource-rich learning environment for students and educators. Our
            mission is to make quality study materials accessible to everyone,
            fostering a community of knowledge sharing and continuous learning.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
