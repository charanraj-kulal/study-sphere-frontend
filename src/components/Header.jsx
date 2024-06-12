// src/components/Header.jsx
import React from "react";

const Header = () => {
  return (
    <header>
      <div className="container">
        <div className="logo">
          <h1>Study Sphere</h1>
        </div>
        <nav>
          <ul>
            <li>
              <a href="#">Home</a>
            </li>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#about">About Us</a>
            </li>
            <li>
              <a href="#domians">Domain</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
            <li>
              <a href="/login">Login</a>
            </li>
            <li>
              <a href="/register">Register</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
