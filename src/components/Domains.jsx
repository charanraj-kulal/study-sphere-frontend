// src/components/Domains.jsx
import React from "react";
import "../styles/Domains.css";

const Domains = () => {
  return (
    <section id="Domains" className="Domains-section">
      <div className="container">
        <div className="Domains-text">
          <h2>Join Study Sphere Today</h2>
          <p>
            Become part of a growing community of learners and educators. Sign
            up now and start sharing, learning, and growing together!
          </p>
          <div className="Domains-buttons">
            <button className="explore-button">Explore</button>
            <button className="donate-button">Donate</button>
          </div>
        </div>
        <div className="Domains-image">
          <img src="/images/contact_us.png" alt="Teacher Illustration" />
        </div>
      </div>
    </section>
  );
};

export default Domains;
