import React from "react";
import NavHeader from "../components/NavHeader";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import "../../src/index.css"

const Layout = () => {
  return (
    <div className="app-container">
      <NavHeader />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
