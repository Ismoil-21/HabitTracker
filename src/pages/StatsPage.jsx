// pages/StatsPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import StatsView from "../components/StatsView";

const StatsPage = ({
  language,
  onLanguageChange,
  currentUser,
  habits,
  completions,
  currentMonth,
  getHabitStats,
  calculateStats,
  getDaysInMonth,
  onReset,
  onLogout,
  saving,
  t,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const handleViewChange = (view) => {
    if (view === "calendar") {
      navigate("/dashboard");
    }
  };

  const stats = calculateStats();
  const daysInMonth = getDaysInMonth(currentMonth);

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto">
        <Header
          t={t}
          saving={saving}
          language={language}
          onLanguageChange={onLanguageChange}
          showLangMenu={showLangMenu}
          setShowLangMenu={setShowLangMenu}
          view="stats"
          setView={handleViewChange}
          onReset={onReset}
          onLogout={handleLogout}
          currentUser={currentUser}
          stats={stats}
        />

        <StatsView
          t={t}
          habits={habits}
          completions={completions}
          daysInMonth={daysInMonth}
          getHabitStats={getHabitStats}
          stats={stats}
        />

        <div className="mt-6 bg-blue-500/60 border border-blue-500/20 rounded-lg p-4">
          <p className="text-white text-lg text-center">{t.infoMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
