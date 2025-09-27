import React from "react";
import { Outlet } from "react-router-dom";
import "./globals.css";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar and header components would go here */}
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
