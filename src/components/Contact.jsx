// src/components/CallToAction.jsx
import React from "react";

const Contact = () => {
  return (
    <section id="contact" className="container">
      <h2>Join Study Sphere Today</h2>
      <p>
        Become part of a growing community of learners and educators. Sign up
        now and start sharing, learning, and growing together!
      </p>
      <a href="/register" className="btn btn-primary">
        Sign Up
      </a>
      <a href="/login" className="btn btn-secondary">
        Login
      </a>
    </section>
  );
};

export default Contact;
