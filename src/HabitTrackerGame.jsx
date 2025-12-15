import React, { useState, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  Award,
  Target,
  Plus,
  X,
  Check,
  Loader2,
  LogOut,
  Lock,
} from "lucide-react";
import Ballpit from "./Ballpit";

const HabitTrackerGame = () => {
  const VALID_CODES = ["Mustafo", "Oyatilloh", "Ismoil"];

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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser && VALID_CODES.includes(savedUser)) {
      setCurrentUser(savedUser);
      setIsLoggedIn(true);
      loadData(savedUser);
    }
  }, []);

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
      setLoginError("Noto'g'ri kod! Qaytadan urinib ko'ring.");
    }
  };

  const handleLogout = () => {
    if (confirm("Haqiqatan ham chiqmoqchimisiz?")) {
      setIsLoggedIn(false);
      setCurrentUser("");
      localStorage.removeItem("currentUser");
      setHabits([]);
      setCompletions({});
    }
  };

  const loadData = async (userCode) => {
    try {
      setLoading(true);

      const habitsKey = `habits_${userCode}`;
      const completionsKey = `completions_${userCode}`;

      const habitsData = localStorage.getItem(habitsKey);
      if (habitsData) {
        setHabits(JSON.parse(habitsData));
      } else {
        const defaultHabits = [
          {
            id: 1,
            name: "Erta tur 05:00",
            emoji: "⏰",
            color: "bg-cyan-100",
          },
          {
            id: 2,
            name: "Sport bilan shug'ullan",
            emoji: "💪",
            color: "bg-cyan-100",
          },
          {
            id: 3,
            name: "Behayo videolardan saqlan",
            emoji: "💧",
            color: "bg-cyan-100",
          },
          {
            id: 4,
            name: "Kitob o'qish",
            emoji: "📚",
            color: "bg-cyan-100",
          },
          { id: 5, name: "Budget Tracking", emoji: "💰", color: "bg-cyan-100" },
          { id: 6, name: "Project Work", emoji: "🎯", color: "bg-cyan-100" },
          { id: 7, name: "No Alcohol", emoji: "🥤", color: "bg-cyan-100" },
          {
            id: 8,
            name: "Social Media Detox",
            emoji: "🌿",
            color: "bg-cyan-100",
          },
          { id: 9, name: "Goal Journaling", emoji: "📝", color: "bg-cyan-100" },
          { id: 10, name: "Cold Shower", emoji: "🚿", color: "bg-cyan-100" },
        ];
        setHabits(defaultHabits);
        localStorage.setItem(habitsKey, JSON.stringify(defaultHabits));
      }

      const completionsData = localStorage.getItem(completionsKey);
      if (completionsData) {
        setCompletions(JSON.parse(completionsData));
      } else {
        setCompletions({});
      }
    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveHabits = async (newHabits) => {
    try {
      setSaving(true);
      const habitsKey = `habits_${currentUser}`;
      localStorage.setItem(habitsKey, JSON.stringify(newHabits));
      setHabits(newHabits);
    } catch (error) {
      console.error("Odatlarni saqlashda xatolik:", error);
      alert("Ma'lumotlarni saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const saveCompletions = async (newCompletions) => {
    try {
      setSaving(true);
      const completionsKey = `completions_${currentUser}`;
      localStorage.setItem(completionsKey, JSON.stringify(newCompletions));
      setCompletions(newCompletions);
    } catch (error) {
      console.error("Completions ni saqlashda xatolik:", error);
      alert("Ma'lumotlarni saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const toggleHabit = async (habitId, day) => {
    const key = `${habitId}-${day}`;
    const newCompletions = {
      ...completions,
      [key]: !completions[key],
    };
    await saveCompletions(newCompletions);
  };

  const addHabit = async () => {
    if (newHabitName.trim()) {
      const newHabit = {
        id: Date.now(),
        name: newHabitName,
        emoji: "✨",
        color: "bg-cyan-100",
      };
      await saveHabits([...habits, newHabit]);
      setNewHabitName("");
      setShowAddHabit(false);
    }
  };

  const deleteHabit = async (habitId) => {
    const newHabits = habits.filter((h) => h.id !== habitId);
    await saveHabits(newHabits);
  };

  const calculateStats = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    let totalPossible = habits.length * daysInMonth;
    let totalCompleted = 0;

    habits.forEach((habit) => {
      for (let day = 1; day <= daysInMonth; day++) {
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

  const resetAllData = async () => {
    if (
      confirm(
        "Barcha ma'lumotlarni o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi!"
      )
    ) {
      try {
        const habitsKey = `habits_${currentUser}`;
        const completionsKey = `completions_${currentUser}`;

        localStorage.removeItem(habitsKey);
        localStorage.removeItem(completionsKey);

        await loadData(currentUser);
      } catch (error) {
        console.error("Ma'lumotlarni o'chirishda xatolik:", error);
        alert("Xatolik yuz berdi");
      }
    }
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <div
        className="bg-black/50 flex items-center h-screen w-full justify-center z-50"
        style={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <Ballpit
          count={150}
          gravity={1}
          friction={0.9}
          wallBounce={0.95}
          followCursor={false}
        />

        <div className="min-h-screen flex items-center justify-center top-0 right-0 left-0 absolute p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-md w-full">
            <div className="text-center mb-8">
              <div className="bg-blue-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Habit Tracker
              </h1>
              <p className="text-white/60">Kirish uchun kodingizni kiriting</p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={loginCode}
                  onChange={(e) => {
                    setLoginCode(e.target.value);
                    setLoginError("");
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Kirish kodi"
                  className="w-full bg-white/10 text-white px-4 py-3 rounded-lg border border-white/20 focus:outline-none focus:border-blue-400 text-center text-lg font-semibold tracking-wider"
                  autoFocus
                />
                {loginError && (
                  <p className="text-red-400 text-sm mt-2 text-center">
                    {loginError}
                  </p>
                )}
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-linear-to-r bg-blue-700 hover:to-blue-900 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-100"
              >
                Kirish
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/80 text-xs text-center">
                💡 Kod yo'qmi? Administrator bilan bog'laning
              </p>
              <a
                className="text-white text-center block mt-2"
                type="tel"
                href="tel:+998996036611"
              >
                +998996036611
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const daysInMonth = getDaysInMonth(currentMonth);

  return (
    <div className="min-h-screen bg-blue-950 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <Target className="w-7 h-7" />
              Hayotingizni O'zgartiring
              {saving && <Loader2 className="w-5 h-5 animate-spin" />}
            </h1>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setView("calendar")}
                className={`px-3 py-2 rounded-lg hover:scale-105 active:scale-100 ${
                  view === "calendar"
                    ? "bg-blue-700 text-white"
                    : "bg-white/10 text-white/70"
                }`}
              >
                <Calendar className="w-5 h-5 sm:hidden" />
                <span className="hidden sm:flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Calendar
                </span>
              </button>

              <button
                onClick={() => setView("stats")}
                className={`px-3 py-2 rounded-lg hover:scale-105 active:scale-100 ${
                  view === "stats"
                    ? "bg-blue-700 text-white"
                    : "bg-white/10 text-white/70"
                }`}
              >
                <TrendingUp className="w-5 h-5 sm:hidden" />
                <span className="hidden sm:flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Stats
                </span>
              </button>

              <button
                onClick={resetAllData}
                className="px-3 py-2 rounded-lg bg-red-500/20 text-red-300 hover:scale-105 active:scale-100" 
              >
                Reset
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg bg-white/10 text-white/70 hover:scale-105 active:scale-100"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User info */}
          <div className="mb-3 text-white/60 text-sm">
            👤 Foydalanuvchi:{" "}
            <span className="font-semibold text-white/80">{currentUser}</span>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/5 rounded-full h-8 overflow-hidden mb-3">
            <div
              className="h-full bg-linear-to-r from-green-400 to-emerald-500 transition-all duration-500 flex items-center justify-end"
              style={{ width: `${stats.percentage}%` }}
            >
              <span className="text-white font-bold text-sm">
                {stats.percentage}%
              </span>
            </div>
          </div>

          <div className="flex justify-between text-white/70 text-sm">
            <span>
              {stats.completed} / {stats.total} bajarildi
            </span>
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" />
              {Math.floor(stats.percentage / 10)} level
            </span>
          </div>
        </div>

        {view === "calendar" ? (
          <>
            {/* Habits List with Calendar */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Mening Odatlarim
                </h2>
                <button
                  onClick={() => setShowAddHabit(true)}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition hover:scale-105 active:scale-100"
                  disabled={saving}
                >
                  <Plus className="w-5 h-5" />
                  Qo'shish
                </button>
              </div>

              {showAddHabit && (
                <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                  <div className="sm:flex gap-2">
                    <input
                      type="text"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addHabit()}
                      placeholder="Yangi odat nomi..."
                      className="flex-1 bg-white/10 text-white w-full px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-blue-400"
                      disabled={saving}
                    />
                    <div className="flex justify-between items-center gap-2">
                      <button
                        onClick={addHabit}
                        className="bg-green-500 hover:bg-green-600 my-4 sm:my-0 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                        disabled={saving}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setShowAddHabit(false);
                          setNewHabitName("");
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                        disabled={saving}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-white font-semibold p-2 sticky left-0 bg-slate-900/50 backdrop-blur">
                        Odat
                      </th>
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const date = new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth(),
                          i + 1
                        );
                        const dayOfWeek = [
                          "Ya",
                          "Du",
                          "Se",
                          "Cho",
                          "Pa",
                          "Ju",
                          "Sh",
                          "Ya",
                        ][date.getDay()];
                        return (
                          <th key={i} className="text-center p-1 min-w-8">
                            <div className="text-white/50 text-xs">
                              {dayOfWeek}
                            </div>
                            <div className="text-white/70 text-xs font-semibold">
                              {i + 1}
                            </div>
                          </th>
                        );
                      })}
                      <th className="text-center text-white/70 text-xs p-2">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {habits.map((habit) => {
                      const habitStats = getHabitStats(habit.id);
                      return (
                        <tr key={habit.id} className="border-t border-white/10">
                          <td className="p-2 sticky left-0 bg-slate-900/50 backdrop-blur">
                            <div className="flex items-center gap-2 group">
                              <span className="text-xl">{habit.emoji}</span>
                              <span className="text-white text-sm">
                                {habit.name}
                              </span>
                              <button
                                onClick={() => deleteHabit(habit.id)}
                                className="opacity-0 group-hover:opacity-100 ml-auto text-red-400 hover:text-red-300 transition"
                                disabled={saving}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const key = `${habit.id}-${day}`;
                            const isCompleted = completions[key];
                            return (
                              <td key={day} className="p-1">
                                <button
                                  onClick={() => toggleHabit(habit.id, day)}
                                  className={`w-7 h-7 rounded-md border-2 transition-all ${
                                    isCompleted
                                      ? "bg-green-500 border-green-400 scale-110"
                                      : "border-white/20 hover:border-white/40 hover:bg-white/5"
                                  }`}
                                  disabled={saving}
                                >
                                  {isCompleted && (
                                    <Check className="w-4 h-4 mx-auto text-white" />
                                  )}
                                </button>
                              </td>
                            );
                          })}
                          <td className="text-center p-2">
                            <span
                              className={`text-sm font-bold ${
                                habitStats.percentage >= 70
                                  ? "text-green-400"
                                  : habitStats.percentage >= 40
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              }`}
                            >
                              {habitStats.percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Statistics View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {habits.map((habit) => {
              const habitStats = getHabitStats(habit.id);
              return (
                <div
                  key={habit.id}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{habit.emoji}</span>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{habit.name}</h3>
                      <p className="text-white/60 text-sm">
                        {habitStats.completed} / {habitStats.total} kun
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {habitStats.percentage}%
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        habitStats.percentage >= 70
                          ? "bg-green-500"
                          : habitStats.percentage >= 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${habitStats.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-200 text-sm text-center">
            💾 Sizning shaxsiy ma'lumotlaringiz xavfsiz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HabitTrackerGame;
