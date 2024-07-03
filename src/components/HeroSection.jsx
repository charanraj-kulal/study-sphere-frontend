import React, { useEffect, useRef } from "react";

// import { loadFull } from "tsparticles";
import { gsap } from "gsap";
import "../styles/HeroSection.css";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const image = imageRef.current;

    // Zoom out animation on load
    gsap.fromTo(
      image,
      { scale: 1.5 },
      {
        scale: 1,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
          // Continuous floating animation
          gsap.to(image, {
            y: "-=20",
            yoyo: true,
            repeat: -1,
            duration: 1,
            ease: "power1.inOut",
          });
        },
      }
    );
  }, []);

  // Particle configuration

  return (
    <div className="hero-section">
      <div className="container">
        <div className="hero-text">
          <h1>
            Welcome to
            <span className="hero glitch layers" data-text="Study Sphere">
              <span>Study Sphere</span>
            </span>
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
          <img ref={imageRef} src="/images/hero_image_2.png" alt="Hero" />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
