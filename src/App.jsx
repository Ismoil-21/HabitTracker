// App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { translations } from "./translations";
import LoginPage from "./pages/LoginPage";
import CalendarPage from "./pages/CalendarPage";
import StatsPage from "./pages/StatsPage";
import LoadingScreen from "./components/LoadingScreen";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  const VALID_CODES = ["admin_ismoil", "admin-mustafo", "admin-oyatillo", "toxir"];
  const navigate = useNavigate();

  const [language, setLanguage] = useState("uz");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginCode, setLoginCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [currentUser, setCurrentUser] = useState("");

  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const t = translations[language];

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    const savedLanguage = localStorage.getItem("language");

    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    if (savedUser && VALID_CODES.includes(savedUser)) {
      setCurrentUser(savedUser);
      setIsLoggedIn(true);
      loadData(savedUser);
    } else {
      setLoading(false);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const handleLogin = () => {
    const code = loginCode.trim();
    if (VALID_CODES.includes(code)) {
      setCurrentUser(code);
      setIsLoggedIn(true);
      localStorage.setItem("currentUser", code);
      loadData(code);
      setLoginError("");
      setLoginCode("");
      return true;
    } else {
      setLoginError(t.loginError);
      return false;
    }
  };

  const handleLogout = () => {
    if (confirm(t.logoutConfirm)) {
      setIsLoggedIn(false);
      setCurrentUser("");
      localStorage.removeItem("currentUser");
      setHabits([]);
      setCompletions([]);
      navigate("/login");
    }
  };

  const loadData = (userCode) => {
    try {
      setLoading(true);
      const habitsKey = `habits_${userCode}`;
      const savedHabits = localStorage.getItem(habitsKey);

      if (savedHabits) {
        setHabits(JSON.parse(savedHabits));
      } else {
        const defaultHabits = [
          {
            id: 1,
            name: "Проснуться в 06:00 утра",
            emoji: "⏰"
          },
          { id: 2, name: "Тренировка", emoji: "💪" },
          {
            id: 3,
            name: "Чтение / Обучение",
            emoji: "📚"
          },
          { id: 4, name: "Отслеживание бюджета", emoji: "💰"},
          { id: 5, name: "Проектная работа", emoji: "🎯" },
          { id: 6, name: "Без алкоголя", emoji: "🥤" },
          {
            id: 7,
            name: "Детокс от социальных сетей",
            emoji: "🌿"
          },
          { id: 8, name: "Журналирование целей", emoji: "📝" },
          { id: 9, name: "Холодный душ", emoji: "🚿"},
        ];
        setHabits(defaultHabits);
        localStorage.setItem(habitsKey, JSON.stringify(defaultHabits));
      }

      const completionsKey = `completions_${userCode}`;
      const savedCompletions = localStorage.getItem(completionsKey);
      if (savedCompletions) {
        setCompletions(JSON.parse(savedCompletions));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveHabits = (newHabits) => {
    try {
      setSaving(true);
      const habitsKey = `habits_${currentUser}`;
      localStorage.setItem(habitsKey, JSON.stringify(newHabits));
      setHabits(newHabits);
    } catch (error) {
      console.error("Error saving habits:", error);
      alert(t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const saveCompletions = (newCompletions) => {
    try {
      setSaving(true);
      const completionsKey = `completions_${currentUser}`;
      localStorage.setItem(completionsKey, JSON.stringify(newCompletions));
      setCompletions(newCompletions);
    } catch (error) {
      console.error("Error saving completions:", error);
      alert(t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const toggleHabit = (habitId, day) => {
    const key = `${habitId}-${day}`;
    const newCompletions = {
      ...completions,
      [key]: !completions[key],
    };
    saveCompletions(newCompletions);
  };

  const addHabit = () => {
    if (newHabitName.trim()) {
      const newHabit = {
        id: Date.now(),
        name: newHabitName,
        emoji: "✨",
        color: "bg-cyan-100",
      };
      saveHabits([...habits, newHabit]);
      setNewHabitName("");
      setShowAddHabit(false);
    }
  };

  const deleteHabit = (habitId) => {
    const newHabits = habits.filter((h) => h.id !== habitId);
    saveHabits(newHabits);
  };

  const calculateStats = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    let totalPossible = habits.length * daysInMonth;
    let totalCompleted = 0;

    habits.forEach((habit) => {
      for (let day = 0; day <= daysInMonth; day++) {
        const key = `${habit.id}-${day}`;
        if (completions[key]) totalCompleted++;
      }
    });

    return {
      percentage:
        totalPossible > 0
          ? Math.round((totalCompleted / totalPossible) * 100)
          : 0,
      completed: totalCompleted,
      total: totalPossible,
    };
  };

  const getHabitStats = (habitId) => {
    const daysInMonth = getDaysInMonth(currentMonth);
    let completed = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${habitId}-${day}`;
      if (completions[key]) completed++;
    }
    return {
      completed,
      total: daysInMonth,
      percentage: Math.round((completed / daysInMonth) * 100),
    };
  };

  const resetAllData = () => {
    if (confirm(t.resetConfirm)) {
      try {
        const habitsKey = `habits_${currentUser}`;
        const completionsKey = `completions_${currentUser}`;
        localStorage.removeItem(habitsKey);
        localStorage.removeItem(completionsKey);
        loadData(currentUser);
      } catch (error) {
        console.error("Error deleting data:", error);
        alert(t.error);
      }
    }
  };

  if (loading) {
    return <LoadingScreen t={t} />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage
              language={language}
              onLanguageChange={changeLanguage}
              loginCode={loginCode}
              setLoginCode={setLoginCode}
              loginError={loginError}
              setLoginError={setLoginError}
              onLogin={handleLogin}
              t={t}
            />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <CalendarPage
              language={language}
              onLanguageChange={changeLanguage}
              currentUser={currentUser}
              habits={habits}
              completions={completions}
              currentMonth={currentMonth}
              showAddHabit={showAddHabit}
              setShowAddHabit={setShowAddHabit}
              newHabitName={newHabitName}
              setNewHabitName={setNewHabitName}
              onAddHabit={addHabit}
              onDeleteHabit={deleteHabit}
              onToggleHabit={toggleHabit}
              getHabitStats={getHabitStats}
              calculateStats={calculateStats}
              getDaysInMonth={getDaysInMonth}
              onReset={resetAllData}
              onLogout={handleLogout}
              saving={saving}
              t={t}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stats"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <StatsPage
              language={language}
              onLanguageChange={changeLanguage}
              currentUser={currentUser}
              habits={habits}
              completions={completions}
              currentMonth={currentMonth}
              getHabitStats={getHabitStats}
              calculateStats={calculateStats}
              getDaysInMonth={getDaysInMonth}
              onReset={resetAllData}
              onLogout={handleLogout}
              saving={saving}
              t={t}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
};

export default App;
