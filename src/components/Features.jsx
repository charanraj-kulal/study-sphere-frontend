// src/components/Features.jsx
import React from "react";

const Features = () => {
  return (
    <section id="features" className="container">
      <h2>Features</h2>
      <div className="feature">
        <h3>Collaborative Learning</h3>
        <p>
          Join a community of students and lecturers sharing and verifying study
          materials.
        </p>
      </div>
      <div className="feature">
        <h3>Upload and Share</h3>
        <p>
          Upload your study materials and share them with others to help them
          learn and succeed.
        </p>
      </div>
      <div className="feature">
        <h3>Verified Resources</h3>
        <p>
          Access study materials verified by lecturers and ensure you are using
          quality resources.
        </p>
      </div>
      <div className="feature">
        <h3>Leaderboard and Points</h3>
        <p>
          Earn points for uploading materials and climb the leaderboard.
          Recognition and rewards await!
        </p>
      </div>
      <div className="feature">
        <h3>Real-Time Notifications</h3>
        <p>
          Stay updated with real-time notifications about your uploads and the
          materials you follow.
        </p>
      </div>
    </section>
  );
};

export default Features;
