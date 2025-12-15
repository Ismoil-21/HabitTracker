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
  Globe,
} from "lucide-react";
import Galaxy from "./Galaxy";

const HabitTrackerGame = () => {
  // Login kodlari - bu yerga o'z kodlaringizni qo'shing
  const VALID_CODES = ["Ismoil", "Mustafo", "Oyatilloh"];

  // Translations
  const translations = {
    uz: {
      title: "Hayotingizni O'zgartiring",
      loginTitle: "Habit Tracker",
      loginSubtitle: "Kirish uchun kodingizni kiriting",
      loginPlaceholder: "Kirish kodi",
      loginButton: "Kirish",
      loginError: "Noto'g'ri kod! Qaytadan urinib ko'ring.",
      noCode: "💡 Kod yo'qmi? Administrator bilan bog'laning",
      myHabits: "Mening Odatlarim",
      addHabit: "Qo'shish",
      newHabitPlaceholder: "Yangi odat nomi...",
      user: "Foydalanuvchi",
      completed: "bajarildi",
      level: "level",
      loading: "Ma'lumotlar yuklanmoqda...",
      saving: "Saqlanmoqda...",
      reset: "Reset",
      logout: "Chiqish",
      logoutConfirm: "Haqiqatan ham chiqmoqchimisiz?",
      resetConfirm:
        "Barcha ma'lumotlarni o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi!",
      resetSuccess: "Ma'lumotlar muvaffaqiyatli o'chirildi!",
      error: "Xatolik yuz berdi",
      saveError: "Ma'lumotlarni saqlashda xatolik yuz berdi",
      infoMessage: "💾 Sizning shaxsiy ma'lumotlaringiz xavfsiz.",
      days: "kun",
      habit: "Odat",
      weekDays: ["Ya", "Du", "Se", "Cho", "Pa", "Ju", "Sh", "Ya"],
    },
    ru: {
      title: "Измените свою жизнь",
      loginTitle: "Habit Tracker",
      loginSubtitle: "Введите код для входа",
      loginPlaceholder: "Код входа",
      loginButton: "Войти",
      loginError: "Неверный код! Попробуйте еще раз.",
      noCode: "💡 Нет кода? Свяжитесь с администратором",
      myHabits: "Мои привычки",
      addHabit: "Добавить",
      newHabitPlaceholder: "Название новой привычки...",
      user: "Пользователь",
      completed: "выполнено",
      level: "уровень",
      loading: "Загрузка данных...",
      saving: "Сохранение...",
      reset: "Сброс",
      logout: "Выход",
      logoutConfirm: "Вы действительно хотите выйти?",
      resetConfirm: "Удалить все данные? Это действие нельзя отменить!",
      resetSuccess: "Данные успешно удалены!",
      error: "Произошла ошибка",
      saveError: "Ошибка при сохранении данных",
      infoMessage: "💾 Ваши личные данные в безопасности.",
      days: "дней",
      habit: "Привычка",
      weekDays: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    },
    en: {
      title: "Change your life",
      loginTitle: "Habit Tracker",
      loginSubtitle: "Enter your code to login",
      loginPlaceholder: "Login code",
      loginButton: "Login",
      loginError: "Wrong code! Try again.",
      noCode: "💡 Don't have a code? Contact administrator",
      myHabits: "My Habits",
      addHabit: "Add",
      newHabitPlaceholder: "New habit name...",
      user: "User",
      completed: "completed",
      level: "level",
      loading: "Loading data...",
      saving: "Saving...",
      reset: "Reset",
      logout: "Logout",
      logoutConfirm: "Are you sure you want to logout?",
      resetConfirm: "Delete all data? This action cannot be undone!",
      resetSuccess: "Data successfully deleted!",
      error: "An error occurred",
      saveError: "Error saving data",
      infoMessage: "💾 Your personal data is secure.",
      days: "days",
      habit: "Habit",
      weekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },
  };

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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const t = translations[language];

  // Check if user is logged in on mount
  useEffect(() => {
    const savedUser = sessionStorage.getItem("currentUser");
    const savedLanguage = sessionStorage.getItem("language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    if (savedUser && VALID_CODES.includes(savedUser)) {
      setCurrentUser(savedUser);
      setIsLoggedIn(true);
      loadData(savedUser);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    sessionStorage.setItem("language", lang);
  };

  const handleLogin = () => {
    const code = loginCode.trim();

    if (VALID_CODES.includes(code)) {
      setCurrentUser(code);
      setIsLoggedIn(true);
      sessionStorage.setItem("currentUser", code);
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
      sessionStorage.removeItem("currentUser");
      setHabits([]);
      setCompletions({});
    }
  };

  const loadData = async (userCode) => {
    try {
      setLoading(true);

      // Load habits for this user
      const habitsKey = `habits_${userCode}`;
      const habitsResult = await window.storage.get(habitsKey);
      if (habitsResult && habitsResult.value) {
        setHabits(JSON.parse(habitsResult.value));
      } else {
        // Default habits if none exist
        const defaultHabits = [
          {
            id: 1,
            name: "Wake up at 05:00",
            emoji: "⏰",
            color: "bg-cyan-100",
          },
          { id: 2, name: "Gym", emoji: "💪", color: "bg-cyan-100" },
          {
            id: 3,
            name: "Stop Watching Porn",
            emoji: "💧",
            color: "bg-cyan-100",
          },
          {
            id: 4,
            name: "Reading / Learning",
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
        await window.storage.set(habitsKey, JSON.stringify(defaultHabits));
      }

      // Load completions for this user
      const completionsKey = `completions_${userCode}`;
      const completionsResult = await window.storage.get(completionsKey);
      if (completionsResult && completionsResult.value) {
        setCompletions(JSON.parse(completionsResult.value));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      const defaultHabits = [
        { id: 1, name: "Wake up at 05:00", emoji: "⏰", color: "bg-cyan-100" },
        { id: 2, name: "Gym", emoji: "💪", color: "bg-cyan-100" },
        {
          id: 3,
          name: "Stop Watching Porn",
          emoji: "💧",
          color: "bg-cyan-100",
        },
        {
          id: 4,
          name: "Reading / Learning",
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
    } finally {
      setLoading(false);
    }
  };

  const saveHabits = async (newHabits) => {
    try {
      setSaving(true);
      const habitsKey = `habits_${currentUser}`;
      await window.storage.set(habitsKey, JSON.stringify(newHabits));
      setHabits(newHabits);
    } catch (error) {
      console.error("Error saving habits:", error);
      alert(t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const saveCompletions = async (newCompletions) => {
    try {
      setSaving(true);
      const completionsKey = `completions_${currentUser}`;
      await window.storage.set(completionsKey, JSON.stringify(newCompletions));
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
    if (confirm(t.resetConfirm)) {
      try {
        const habitsKey = `habits_${currentUser}`;
        const completionsKey = `completions_${currentUser}`;
        await window.storage.delete(habitsKey);
        await window.storage.delete(completionsKey);
        await loadData(currentUser);
        alert(t.resetSuccess);
      } catch (error) {
        console.error("Error deleting data:", error);
        alert(t.error);
      }
    }
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <div
        className="flex items-center justify-center bg-black"
        style={{
          width: "100%",
          height: "100vh",
          background: "rgb(0, 0, 20)",
          position: "fixed",
        }}
      >
        <Galaxy />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/10 absolute  backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-md w-full">
            <div className="flex justify-center gap-2 mb-6">
              <button
                onClick={() => changeLanguage("uz")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  language === "uz"
                    ? "bg-purple-500 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                O'zbek
              </button>
              <button
                onClick={() => changeLanguage("ru")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  language === "ru"
                    ? "bg-purple-500 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                Русский
              </button>
              <button
                onClick={() => changeLanguage("en")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  language === "en"
                    ? "bg-purple-500 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                English
              </button>
            </div>

            <div className="text-center mb-8">
              <div className="bg-purple-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-10 h-10 text-purple-300" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {t.loginTitle}
              </h1>
              <p className="text-white/60">{t.loginSubtitle}</p>
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
                  placeholder={t.loginPlaceholder}
                  className="w-full bg-white/10 text-white px-4 py-3 rounded-lg border border-white/20 focus:outline-none focus:border-purple-400 text-center text-lg font-semibold tracking-wider"
                />
                {loginError && (
                  <p className="text-red-400 text-sm mt-2 text-center">
                    {loginError}
                  </p>
                )}
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                {t.loginButton}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/40 text-xs text-center">{t.noCode}</p>
              <div className="text-center mt-4">
                <a
                  type="tel"
                  className="text-white/40 text-center"
                  href="tel:+998996036611"
                >
                  +998996036611
                </a>
              </div>
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
          <p className="text-white text-lg">{t.loading}</p>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const daysInMonth = getDaysInMonth(currentMonth);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Target className="w-8 h-8" />
              {t.title}
              {saving && <Loader2 className="w-5 h-5 animate-spin" />}
            </h1>
            <div className="flex gap-2 flex-wrap">
              {/* Language selector */}
              <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => changeLanguage("uz")}
                  className={`px-3 py-1 rounded text-xs font-medium transition ${
                    language === "uz"
                      ? "bg-purple-500 text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  UZ
                </button>
                <button
                  onClick={() => changeLanguage("ru")}
                  className={`px-3 py-1 rounded text-xs font-medium transition ${
                    language === "ru"
                      ? "bg-purple-500 text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  RU
                </button>
                <button
                  onClick={() => changeLanguage("en")}
                  className={`px-3 py-1 rounded text-xs font-medium transition ${
                    language === "en"
                      ? "bg-purple-500 text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  EN
                </button>
              </div>

              <button
                onClick={() => setView("calendar")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  view === "calendar"
                    ? "bg-purple-500 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                <Calendar className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView("stats")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  view === "stats"
                    ? "bg-purple-500 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                <TrendingUp className="w-5 h-5" />
              </button>
              <button
                onClick={resetAllData}
                className="px-4 py-2 rounded-lg font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
                title={t.reset}
              >
                {t.reset}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-medium bg-white/10 text-white/70 hover:bg-white/20 transition flex items-center gap-2"
                title={t.logout}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User info */}
          <div className="mb-3 text-white/60 text-sm">
            👤 {t.user}:{" "}
            <span className="font-semibold text-white/80">{currentUser}</span>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/5 rounded-full h-8 overflow-hidden mb-3">
            <div
              className="h-full bg-linear-to-r from-green-400 to-emerald-500 transition-all duration-500 flex items-center justify-end px-4"
              style={{ width: `${stats.percentage}%` }}
            >
              <span className="text-white font-bold text-sm">
                {stats.percentage}%
              </span>
            </div>
          </div>

          <div className="flex justify-between text-white/70 text-sm">
            <span>
              {stats.completed} / {stats.total} {t.completed}
            </span>
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" />
              {Math.floor(stats.percentage / 10)} {t.level}
            </span>
          </div>
        </div>

        {view === "calendar" ? (
          <>
            {/* Habits List with Calendar */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{t.myHabits}</h2>
                <button
                  onClick={() => setShowAddHabit(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                  disabled={saving}
                >
                  <Plus className="w-5 h-5" />
                  {t.addHabit}
                </button>
              </div>

              {showAddHabit && (
                <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addHabit()}
                      placeholder={t.newHabitPlaceholder}
                      className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-purple-400"
                      disabled={saving}
                    />
                    <button
                      onClick={addHabit}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
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
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-white font-semibold p-2 sticky left-0 bg-slate-900/50 backdrop-blur">
                        {t.habit}
                      </th>
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const date = new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth(),
                          i + 1
                        );
                        const dayOfWeek = t.weekDays[date.getDay()];
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
          <p className="text-blue-200 text-sm text-center">{t.infoMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default HabitTrackerGame;
