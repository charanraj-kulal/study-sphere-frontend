// src/pages/Home.jsx

import React from "react";

import Header from "../components/landing-page/Header";
import HeroSection from "../components/landing-page/HeroSection";
import SearchbarSection from "../components/landing-page/Search_docs";
import Features from "../components/landing-page/Features";
import AboutUs from "../components/landing-page/AboutUs";
import Domain from "../components/landing-page/Domains";
import Contact from "../components/landing-page/Contact";
import Footer from "../components/landing-page/Footer";

const Home = () => {
  return (
    <div>
      <Header />
      <HeroSection />
      <SearchbarSection />
      <Features />
      <AboutUs />
      <Domain />
      <Contact />
      <Footer />
    </div>
  );
};
export default Home;
