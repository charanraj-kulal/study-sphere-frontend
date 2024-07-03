// src/components/Header.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/header.css"; // Create this CSS file for header specific styles

const Header = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section");
      const navLinks = document.querySelectorAll("nav ul li a");

      let current = "";
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 60) {
          current = section.getAttribute("id");
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
          link.classList.add("active");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 50, // Adjust 50 to your header height
        behavior: "smooth",
      });
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <img src="/images/logo.png" alt="Study Sphere Logo" />
        </div>
        <nav>
          <ul>
            <li>
              <a href="#home" onClick={handleClick}>
                Home
              </a>
            </li>
            <li>
              <a href="#features" onClick={handleClick}>
                Features
              </a>
            </li>
            <li>
              <a href="#about" onClick={handleClick}>
                About Us
              </a>
            </li>
            <li>
              <a href="#domains" onClick={handleClick}>
                Domains
              </a>
            </li>
            <li>
              <a href="#contact" onClick={handleClick}>
                Contact
              </a>
            </li>
          </ul>
        </nav>
        <a href="/login" className="btn-login" onClick={handleLoginClick}>
          Login
        </a>
      </div>
    </header>
  );
};

export default Header;
