// src/components/Header.jsx
import React from "react";
import "../styles/header.css"; // Create this CSS file for header specific styles

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <img src="/images/logo.png" alt="Study Sphere Logo" />
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
              <a href="#domain">Domains</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </nav>
        <a href="/login" className="btn-login">
          Login
        </a>
      </div>
    </header>
  );
};

export default Header;
