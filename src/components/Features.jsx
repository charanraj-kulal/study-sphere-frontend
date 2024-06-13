// src/components/Features.jsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/Features.scss";

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
  const containerRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    // Initialize Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasRef.current.appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    let model;

    loader.load(
      "/images/paladins_book__ancient_knights_secrets/scene.gltf",
      (gltf) => {
        model = gltf.scene;
        scene.add(model);
        model.position.set(0, 0, 0);
      }
    );

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // GSAP animation
    gsap.fromTo(
      model.position,
      { x: 3 },
      {
        x: 0,
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 75%",
          end: "bottom 25%",
          scrub: true,
        },
      }
    );

    // Clean up function
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      if (renderer) renderer.dispose();
      if (scene) scene.clear();
    };
  }, []);

  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="features-text">
          <h2>Features</h2>
          <div className="feature">
            <h3>Collaborative Learning</h3>
            <p>
              Join a community of students and lecturers sharing and verifying
              study materials.
            </p>
          </div>
          <div className="feature">
            <h3>Upload and Share</h3>
            <p>
              Upload your study materials and share them with others to help
              them learn and succeed.
            </p>
          </div>
          <div className="feature">
            <h3>Verified Resources</h3>
            <p>
              Access study materials verified by lecturers and ensure you are
              using quality resources.
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
              Stay updated with real-time notifications about your uploads and
              the materials you follow.
            </p>
          </div>
        </div>
        <div className="features-image" ref={containerRef}>
          <div ref={canvasRef} />
        </div>
      </div>
    </section>
  );
};

export default Features;
