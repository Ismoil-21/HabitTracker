// App.jsx
import React, { useState, useEffect } from "react";
import { translations } from "./translations";
import LoginPage from "./pages/LoginPage";
import LoadingScreen from "./components/LoadingScreen";
import Header from "./components/Header";
import CalendarView from "./components/CalendarView";
import StatsView from "./components/StatsView";

const App = () => {
  const VALID_CODES = ["Ismoil_17", "initiative", "Oyatilloh8576"];

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
  const [view, setView] = useState("calendar");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

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
    setShowLangMenu(false);
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
    } else {
      setLoginError(t.loginError);
    }
  };

  const handleLogout = () => {
    if (confirm(t.logoutConfirm)) {
      setIsLoggedIn(false);
      setCurrentUser("");
      localStorage.removeItem("currentUser");
      setHabits([]);
      setCompletions({});
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
            name: "Проснуться в 05:00 утра",
            emoji: "⏰",
            color: "bg-cyan-100",
          },
          { id: 2, name: "тренировка", emoji: "💪", color: "bg-cyan-100" },
          {
            id: 3,
            name: "Чтение / Обучение",
            emoji: "📚",
            color: "bg-cyan-100",
          },
          { id: 4, name: "Отслеживание бюджета", emoji: "💰", color: "bg-cyan-100" },
          { id: 5, name: "Project Work", emoji: "🎯", color: "bg-cyan-100" },
          {
            id: 6,
            name: "Хватит смотреть порно",
            emoji: "💧",
            color: "bg-cyan-100",
          },
          { id: 7, name: "Без алкоголя", emoji: "🥤", color: "bg-cyan-100" },
          {
            id: 8,
            name: "Детокс от социальных сетей",
            emoji: "🌿",
            color: "bg-cyan-100",
          },
          { id: 9, name: "Журналирование целей", emoji: "📝", color: "bg-cyan-100" },
          { id: 10, name: "Холодный душ", emoji: "🚿", color: "bg-cyan-100" },
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

  if (!isLoggedIn) {
    return (
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
    );
  }

  if (loading) {
    return <LoadingScreen t={t} />;
  }

  const stats = calculateStats();
  const daysInMonth = getDaysInMonth(currentMonth);

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto">
        <Header
          t={t}
          saving={saving}
          language={language}
          onLanguageChange={changeLanguage}
          showLangMenu={showLangMenu}
          setShowLangMenu={setShowLangMenu}
          view={view}
          setView={setView}
          onReset={resetAllData}
          onLogout={handleLogout}
          currentUser={currentUser}
          stats={stats}
        />

        {view === "calendar" ? (
          <CalendarView
            t={t}
            habits={habits}
            completions={completions}
            daysInMonth={daysInMonth}
            showAddHabit={showAddHabit}
            setShowAddHabit={setShowAddHabit}
            newHabitName={newHabitName}
            setNewHabitName={setNewHabitName}
            onAddHabit={addHabit}
            onDeleteHabit={deleteHabit}
            onToggleHabit={toggleHabit}
            getHabitStats={getHabitStats}
            saving={saving}
          />
        ) : (
          <StatsView
            t={t}
            habits={habits}
            completions={completions}
            daysInMonth={daysInMonth}
            getHabitStats={getHabitStats}
            stats={stats}
          />
        )}

        <div className="mt-6 bg-blue-500/60 border border-blue-500/20 rounded-lg p-4">
          <p className="text-white text-lg text-center">{t.infoMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default App;
