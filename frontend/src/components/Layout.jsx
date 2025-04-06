import React from "react";
import NavHeader from "../components/NavHeader";
import Footer from "../components/Footer";
import "../../src/index.css"

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <NavHeader />
        <main className="main-content">
            {children}
        </main>
      <Footer />
    </div>
  );
};

export default Layout;
