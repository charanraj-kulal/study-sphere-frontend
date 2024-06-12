// src/components/Testimonials.jsx
import React from "react";

const Domain = () => {
  return (
    <section id="domains" className="container">
      <h2>Testimonials</h2>
      <div className="testimonial">
        <p>
          "Study Sphere has transformed the way I study. The verified materials
          are incredibly helpful!"
        </p>
        <p>
          <strong>- Alex, Student</strong>
        </p>
      </div>
      <div className="testimonial">
        <p>
          "As a lecturer, I find it rewarding to verify materials and help
          students access quality resources."
        </p>
        <p>
          <strong>- Dr. Smith, Lecturer</strong>
        </p>
      </div>
      <div className="testimonial">
        <p>
          "The leaderboard and points system motivate me to contribute more to
          the community."
        </p>
        <p>
          <strong>- Jessica, Student</strong>
        </p>
      </div>
    </section>
  );
};

export default Domain;
