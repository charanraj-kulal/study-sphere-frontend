// src/pages/Home.jsx
import React from "react";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import Features from "../components/Features";
import AboutUs from "../components/AboutUs";
import Domain from "../components/Domains";

import Footer from "../components/Footer";

const Home = () => {
  return (
    <div>
      <Header />
      <HeroSection />
      <Features />
      <AboutUs />
      <Domain />
      <Footer />
    </div>
  );
};

export default Home;
