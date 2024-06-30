import React from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header";
import RouterComponent from "../../routes/sections"; // Import the modified Router

const HeaderAndRoutes = () => {
  const location = useLocation();
  const showHeader = location.pathname !== "/login";

  return (
    <>
      {showHeader && <Header />}
      <RouterComponent />
    </>
  );
};

export default HeaderAndRoutes;
