import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

/**
 * MainLayout
 * Wraps every page with the sticky Navbar and Footer.
 * Swap this out to create alternate layouts (e.g. AuthLayout, DashboardLayout).
 */
const MainLayout = ({ children }) => {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
