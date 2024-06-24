// src/components/Features.jsx
import React, { useEffect } from "react";
import "../styles/Features.css";

const Features = () => {
  useEffect(() => {
    // Clean up function to remove scroll trigger
    return () => {};
  }, []);

  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="features-text">
          <h2>Features</h2>
          <ol>
            <li>
              <div className="feature">
                <h3 className="eczar-font">Collaborative Learning</h3>
                <p>
                  Join a community of students and lecturers sharing and
                  verifying study materials.
                </p>
              </div>
            </li>
            <li>
              <div className="feature">
                <h3 className="eczar-font">Upload and Share</h3>
                <p>
                  Upload your study materials and share them with others to help
                  them learn and succeed.
                </p>
              </div>
            </li>
            <li>
              <div className="feature">
                <h3 className="eczar-font">Verified Resources</h3>
                <p>
                  Access study materials verified by lecturers and ensure you
                  are using quality resources.
                </p>
              </div>
            </li>
            <li>
              <div className="feature">
                <h3 className="eczar-font">Leaderboard and Points</h3>
                <p>
                  Earn points for uploading materials and climb the leaderboard.
                  Recognition and rewards await!
                </p>
              </div>
            </li>
            <li>
              <div className="feature">
                <h3 className="eczar-font">Real-Time Notifications</h3>
                <p>
                  Stay updated with real-time notifications about your uploads
                  and the materials you follow.
                </p>
              </div>
            </li>
          </ol>
        </div>
        <div className="features-image">
          <img src="/images/hero_image.png" alt="Features Illustration" />
        </div>
      </div>
    </section>
  );
};

export default Features;
