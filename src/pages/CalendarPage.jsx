// pages/CalendarPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import CalendarView from "../components/CalendarView";

const CalendarPage = ({
  language,
  onLanguageChange,
  currentUser,
  habits,
  completions,
  currentMonth,
  showAddHabit,
  setShowAddHabit,
  newHabitName,
  setNewHabitName,
  onAddHabit,
  onDeleteHabit,
  onToggleHabit,
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
    if (view === "stats") {
      navigate("/stats");
    }
  };

  const stats = calculateStats();
  const daysInMonth = getDaysInMonth(currentMonth);

  return (
    <div className="min-h-screen bg-white p-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <Header
          t={t}
          saving={saving}
          language={language}
          onLanguageChange={onLanguageChange}
          showLangMenu={showLangMenu}
          setShowLangMenu={setShowLangMenu}
          view="calendar"
          setView={handleViewChange}
          onReset={onReset}
          onLogout={handleLogout}
          currentUser={currentUser}
          stats={stats}
        />

        <CalendarView
          t={t}
          habits={habits}
          completions={completions}
          daysInMonth={daysInMonth}
          showAddHabit={showAddHabit}
          setShowAddHabit={setShowAddHabit}
          newHabitName={newHabitName}
          setNewHabitName={setNewHabitName}
          onAddHabit={onAddHabit}
          onDeleteHabit={onDeleteHabit}
          onToggleHabit={onToggleHabit}
          getHabitStats={getHabitStats}
          saving={saving}
        />

        <div className="mt-6 bg-blue-500/60 border border-blue-500/20 rounded-lg p-4">
          <p className="text-white text-lg text-center">{t.infoMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
