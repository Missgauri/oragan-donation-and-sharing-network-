import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home      from '../pages/Home';
import Donate    from '../pages/Donate';
import Find      from '../pages/Find';
import Dashboard from '../pages/Dashboard';

/**
 * AppRoutes
 * Central route registry. Add new routes here — keeps App.jsx clean.
 */
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/"          element={<Home />}      />
      <Route path="/donate"    element={<Donate />}    />
      <Route path="/find"      element={<Find />}      />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
};

export default AppRoutes;
