// src/routes/BordioRoutes.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import DashboardI from "../pages/DashboardI";
import DashboardII from "../pages/DashboardII";
import DashboardIII from "../pages/DashboardIII";

export default function BordioRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard-i" element={<DashboardI />} />
        <Route path="/dashboard-ii" element={<DashboardII />} />
        <Route path="/dashboard-iii" element={<DashboardIII />} />
      </Routes>
    </BrowserRouter>
  );
}