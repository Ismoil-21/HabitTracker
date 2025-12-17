import React, { useState, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  Award,
  Target,
  Plus,
  Trash,
  X,
  Globe,
  Check,
  Loader2,
  LogOut,
  Lock,
} from "lucide-react";
import Galaxy from "./Galaxy";

const HabitTrackerGame = () => {
  const VALID_CODES = ["Ismoil", "Mustafo", "Oyatilloh"];

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
      reset: "O'chirish",
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
      weekDays: ["Ya", "Du", "Se", "Cho", "Pa", "Ju", "Sh"],
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
      reset: "Сброс все",
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
      useInstead: "wake up 05:00 AM",
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
            name: `wake up 05:00 AM`,
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
        localStorage.setItem(habitsKey, JSON.stringify(defaultHabits));
      }

      const completionsKey = `completions_${userCode}`;
      const savedCompletions = localStorage.getItem(completionsKey);
      if (savedCompletions) {
        setCompletions(JSON.parse(savedCompletions));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      const defaultHabits = [
        { id: 1, name: "wake up 05:00 AM", emoji: "⏰", color: "bg-cyan-100" },
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
      <div
        className="flex items-center px-10 justify-center bg-black"
        style={{
          width: "100%",
          height: "100vh",
          background: "rgb(0, 0, 20)",
          position: "fixed",
        }}
      >
        <Galaxy />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/10 absolute backdrop-blur-lg rounded-3xl p-8 border border-white/20 w-90 sm:w-100">
            <div className="flex justify-center gap-2 mb-6">
              <button
                onClick={() => changeLanguage("uz")}
                className={`px-4 py-2 rounded-lg hover:scale-110 active:scale-100 text-4xl transition ${
                  language === "uz"
                    ? "bg-black"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                🇺🇿
              </button>
              <button
                onClick={() => changeLanguage("ru")}
                className={`px-4 py-2 rounded-lg hover:scale-110 active:scale-100 text-4xl transition ${
                  language === "ru"
                    ? "bg-black"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                🇷🇺
              </button>
              <button
                onClick={() => changeLanguage("en")}
                className={`px-4 py-2 rounded-lg text-4xl hover:scale-110 active:scale-100 transition ${
                  language === "en"
                    ? "bg-black "
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                🇺🇸
              </button>
            </div>

            <div className="text-center mb-8">
              <div className="bg-black/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-10 h-10 text-white" />
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
                  className="w-full bg-white/10 text-white px-4 py-3 rounded-lg border border-white/20 focus:outline-none focus:border-blue-600 text-center text-lg font-semibold tracking-wider"
                />
                {loginError && (
                  <p className="text-red-400 text-sm mt-2 text-center">
                    {loginError}
                  </p>
                )}
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-blue-800 hover:bg-blue-900 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                {t.loginButton}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/40 text-xs text-center">{t.noCode}</p>
              <div className="text-center mt-4 text-white">
                <a
                  className="flex items-center justify-center"
                  href="https://t.me/tox1roff_16"
                >
                  {" "}
                  <img
                    className="mr-2"
                    width={20}
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Telegram_2019_Logo.svg/1200px-Telegram_2019_Logo.svg.png"
                    alt=""
                  />
                  @tox1roff_16
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-800 flex items-center justify-center">
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
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-black/30 backdrop-blur-lg p-6 mb-6 border border-black/30">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-black flex items-center gap-3">
              <Target className="w-8 h-8" />
              {t.title}
              {saving && <Loader2 className="w-5 h-5 animate-spin" />}
            </h1>
            <div className="flex gap-2 flex-wrap items-center">
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center w-25 justify-between bg-black/30 hover:bg-black/50 text-white px-5 py-1 rounded-lg font-medium transition shadow-lg"
                >
                  <span className="text-xl">
                    {language === "uz" ? "🇺🇿" : language === "ru" ? "🇷🇺" : "🇬🇧"}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      showLangMenu ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showLangMenu && (
                  <div className="absolute top-13 z-1 left-0 bg-white rounded-2xl rounded-tl-none shadow-2xl overflow-hidden w-64 border border-gray-100">
                    <button
                      onClick={() => changeLanguage("uz")}
                      className={`w-full flex items-center gap-3 px-5 py-2 hover:bg-gray-300 transition ${
                        language === "uz" ? "bg-gray-300" : ""
                      }`}
                    >
                      <span className="text-lg">🇺🇿</span>
                      <span className="text-lg font-medium text-gray-800">
                        O'zbekcha
                      </span>
                      {language === "uz" && (
                        <svg
                          className="w-6 h-6 ml-auto text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => changeLanguage("ru")}
                      className={`w-full flex items-center gap-3 px-5 py-2 hover:bg-gray-300 transition border-t border-gray-100 ${
                        language === "ru" ? "bg-gray-300" : ""
                      }`}
                    >
                      <span className="text-lg">🇷🇺</span>
                      <span className="text-lg font-medium text-gray-800">
                        Русский
                      </span>
                      {language === "ru" && (
                        <svg
                          className="w-6 h-6 ml-auto text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => changeLanguage("en")}
                      className={`w-full flex items-center gap-3 px-5 py-2 hover:bg-gray-300 transition border-t border-gray-100 ${
                        language === "en" ? "bg-gray-300" : ""
                      }`}
                    >
                      <span className="text-lg">🇬🇧</span>
                      <span className="text-lg font-medium text-gray-800">
                        English
                      </span>
                      {language === "en" && (
                        <svg
                          className="w-6 h-6 ml-auto text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setView("calendar")}
                className={`px-4 py-2 rounded-lg hover:scale-110 active:scale-100 font-medium transition ${
                  view === "calendar"
                    ? "bg-black text-white"
                    : "border border-black text-black"
                }`}
              >
                <Calendar className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView("stats")}
                className={`px-4 py-2 rounded-lg font-medium hover:scale-110 active:scale-100 transition ${
                  view === "stats"
                    ? "bg-black text-white"
                    : "border border-black text-black"
                }`}
              >
                <TrendingUp className="w-5 h-5" />
              </button>
              <button
                onClick={resetAllData}
                className="px-4 py-2 rounded-lg font-medium hover:scale-110 active:scale-100 bg-red-500 text-red-300 transition"
                title={t.reset}
              >
                {t.reset}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 hover:scale-110 active:scale-100 rounded-lg font-medium border border-black bg-white/10 text-black hover:bg-white/20 transition flex items-center gap-2"
                title={t.logout}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mb-3 text-white/60 text-sm">
            👤 {t.user}:{" "}
            <span className="font-semibold text-white/80">{currentUser}</span>
          </div>

          <div className="bg-white/5 rounded-full h-8 overflow-hidden mb-3">
            <div
              className="h-full bg-green-500 transition-all duration-500 flex items-center justify-end px-4"
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
            <div className="bg-black/30 backdrop-blur-lg z-0 p-6 border border-gray-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-black">
                  {t.myHabits}
                </h2>
                <button
                  onClick={() => setShowAddHabit(true)}
                  className="bg-white text-black px-4 hover:scale-110 active:scale-100 py-2 rounded-lg flex items-center gap-2 transition"
                  disabled={saving}
                >
                  <Plus className="w-5 h-5" />
                  <p className="hidden sm:block">{t.addHabit}</p>
                </button>
              </div>

              {showAddHabit && (
                <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                  <div className="sm:flex items-center gap-2">
                    <input
                      type="text"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addHabit()}
                      placeholder={t.newHabitPlaceholder}
                      className="flex-1 bg-white/10 text-black px-4 py-2 rounded-lg border w-full border-white/20 focus:outline-none focus:border-black"
                      disabled={saving}
                    />
                    <div className="flex gap-2 my-4 items-center justify-between">
                      <button
                        onClick={addHabit}
                        className="bg-green-500 hover:scale-110 active:scale-100 hover:bg-green-600 text-black px-4 py-2 rounded-lg transition disabled:opacity-50"
                        disabled={saving}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setShowAddHabit(false);
                          setNewHabitName("");
                        }}
                        className="bg-red-500 hover:scale-110 active:scale-100 hover:bg-red-600 text-black px-4 py-2 rounded-lg transition"
                        disabled={saving}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-scroll">
                <table className="w-full">
                  <thead className="border-y border-r border-gray-500">
                    <tr>
                      <th className="text-center font-semibold p-2 sticky left-0 bg-gray-500 text-white backdrop-blur">
                        {t.habit}
                      </th>

                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const date = new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth(),
                          currentMonth.getDate() + i
                        );
                        const dayOfWeek = t.weekDays[date.getDay()];
                        return (
                          <th
                            key={i}
                            className="text-center border border-gray-500 p-1 min-w-8"
                          >
                            <tr className="flex flex-col border-gray-500">
                              <div className="text-black text-xs">
                                {dayOfWeek}
                              </div>
                            </tr>
                            <div className="text-black text-xs font-semibold">
                              {date.getDate()}.{date.getMonth() + 1}.
                              {date.getFullYear()}
                            </div>
                          </th>
                        );
                      })}
                      <th className="text-center text-black text-xs p-2">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {habits.map((habit) => {
                      const habitStats = getHabitStats(habit.id);
                      return (
                        <tr
                          key={habit.id}
                          className="border-y border-r border-gray-500"
                        >
                          <td className="p-1 z-1 font-bold sticky left-0 text-center bg-green-400 backdrop-blur">
                            <div className="flex items-center justify-between sm:w-50 md:w-70 group">
                              <span className="text-xl text-center">
                                {habit.emoji}
                              </span>
                              <span className="text-black text-center text-sm">
                                {habit.name}
                              </span>

                              <div className="lg:opacity-0 lg:group-hover:opacity-100 tranisition-all">
                                <button
                                  onClick={() => deleteHabit(habit.id)}
                                  className="group-hover:opacity-100 text-red-600 p-2 tranisition-all hover:scale-110 active:scale-100"
                                >
                                  <Trash className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </td>
                          {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const key = `${habit.id}-${day}`;
                            const isCompleted = completions[key];
                            return (
                              <td
                                key={day}
                                className="border border-gray-500 text-center"
                              >
                                <button
                                  onClick={() => toggleHabit(habit.id, day)}
                                  className={`w-5 h-5 rounded-md border transition-all  ${
                                    isCompleted
                                      ? "bg-green-500 border-green-500 hover:scale-110 active: scale-110"
                                      : "border-gray-500 hover:scale-110 active:scale-100 hover:bg-white/5"
                                  }`}
                                  disabled={saving}
                                >
                                  {isCompleted && (
                                    <Check className="w-3 z-0 h-4 mx-auto text-black" />
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
          <div className="space-y-6">
            {/* Overall Progress Chart */}
            <div className="bg-black/30 backdrop-blur-lg p-6 border border-gray-500">
              <h3 className="text-xl font-bold text-black mb-4">
                📊 Umumiy Progress
              </h3>
              <div className="bg-white/10 rounded-lg p-4">
                <svg viewBox="0 0 800 300" className="w-full h-64">
                  <defs>
                    <linearGradient
                      id="areaGradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop
                        offset="100%"
                        stopColor="#10b981"
                        stopOpacity="0.1"
                      />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((y) => (
                    <line
                      key={y}
                      x1="50"
                      y1={250 - y * 2}
                      x2="750"
                      y2={250 - y * 2}
                      stroke="#d1d5db"
                      strokeWidth="1"
                      strokeDasharray="5,5"
                      opacity="0.3"
                    />
                  ))}

                  {/* Area chart */}
                  {(() => {
                    const points = habits.map((habit, index) => {
                      const habitStats = getHabitStats(habit.id);
                      const x = 50 + index * (700 / (habits.length - 1 || 1));
                      const y = 250 - habitStats.percentage * 2;
                      return {
                        x,
                        y,
                        percentage: habitStats.percentage,
                        emoji: habit.emoji,
                        name: habit.name,
                      };
                    });

                    const pathData =
                      points
                        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
                        .join(" ") +
                      ` L ${points[points.length - 1].x},250 L 50,250 Z`;

                    return (
                      <>
                        <path d={pathData} fill="url(#areaGradient)" />
                        <path
                          d={points
                            .map(
                              (p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`
                            )
                            .join(" ")}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                        />
                        {points.map((point, index) => (
                          <g key={index}>
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="6"
                              fill="#10b981"
                              stroke="white"
                              strokeWidth="2"
                            />
                            <text
                              x={point.x}
                              y={point.y - 15}
                              textAnchor="middle"
                              fontSize="12"
                              fontWeight="bold"
                              fill="#000"
                            >
                              {point.percentage}%
                            </text>
                            <text
                              x={point.x}
                              y="280"
                              textAnchor="middle"
                              fontSize="20"
                            >
                              {point.emoji}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}

                  {/* Y-axis labels */}
                  {[0, 25, 50, 75, 100].map((y) => (
                    <text
                      key={y}
                      x="35"
                      y={255 - y * 2}
                      textAnchor="end"
                      fontSize="12"
                      fill="#666"
                    >
                      {y}%
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            {/* Best Performing Habits */}
            <div className="bg-black/30 backdrop-blur-lg p-6 border border-gray-500">
              <h3 className="text-xl font-bold text-black mb-4">
                🏆 Eng Yaxshi Odatlar
              </h3>
              <div className="space-y-3">
                {habits
                  .map((habit) => ({
                    ...habit,
                    stats: getHabitStats(habit.id),
                  }))
                  .sort((a, b) => b.stats.percentage - a.stats.percentage)
                  .slice(0, 5)
                  .map((habit, index) => (
                    <div
                      key={habit.id}
                      className="flex items-center gap-4 bg-white/10 rounded-lg p-4"
                    >
                      <span className="text-3xl font-bold text-black">
                        #{index + 1}
                      </span>
                      <span className="text-3xl">{habit.emoji}</span>
                      <div className="flex-1">
                        <h4 className="text-black font-semibold">
                          {habit.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-white/20 rounded-full h-2">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                habit.stats.percentage >= 70
                                  ? "bg-green-500"
                                  : habit.stats.percentage >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${habit.stats.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-black">
                            {habit.stats.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Daily Completion Rate */}
            <div className="bg-black/30 backdrop-blur-lg p-6 border border-gray-500">
              <h3 className="text-xl font-bold text-black mb-4">
                📅 Kunlik Bajarilish
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  let dayCompleted = 0;
                  habits.forEach((habit) => {
                    const key = `${habit.id}-${day}`;
                    if (completions[key]) dayCompleted++;
                  });
                  const dayPercentage =
                    habits.length > 0
                      ? Math.round((dayCompleted / habits.length) * 100)
                      : 0;

                  return (
                    <div key={day} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-full h-16 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                          dayPercentage >= 70
                            ? "bg-green-500 text-black"
                            : dayPercentage >= 40
                            ? "bg-yellow-500 text-black"
                            : dayPercentage === 0
                            ? "bg-gray-300 text-gray-600"
                            : "bg-red-500 text-black"
                        }`}
                      >
                        {dayPercentage}%
                      </div>
                      <span className="text-xs text-black font-semibold">
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-black/30 backdrop-blur-lg p-6 border border-gray-500">
              <h3 className="text-xl font-bold text-black mb-4">
                📈 Haftalik Xulosa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-2xl font-bold text-black">
                    {stats.completed}
                  </div>
                  <div className="text-sm text-gray-700">Bajarilgan</div>
                </div>
                <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-2xl font-bold text-black">
                    {stats.total}
                  </div>
                  <div className="text-sm text-gray-700">Jami Vazifalar</div>
                </div>
                <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-2xl font-bold text-black">
                    {stats.percentage}%
                  </div>
                  <div className="text-sm text-gray-700">Umumiy Progress</div>
                </div>
              </div>
            </div>

            {/* Habit Details */}
            <div className="bg-black/30 backdrop-blur-lg p-6 border border-gray-500">
              <h3 className="text-xl font-bold text-black mb-4">
                📋 Batafsil Ma'lumot
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {habits.map((habit) => {
                  const habitStats = getHabitStats(habit.id);
                  return (
                    <div
                      key={habit.id}
                      className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-gray-400"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{habit.emoji}</span>
                        <div className="flex-1">
                          <h3 className="text-black font-semibold">
                            {habit.name}
                          </h3>
                          <p className="text-gray-700 text-sm">
                            {habitStats.completed} / {habitStats.total} kun
                          </p>
                        </div>
                        <div className="text-xl font-bold text-black">
                          {habitStats.percentage}%
                        </div>
                      </div>
                      <div className="bg-white/20 rounded-full h-3 overflow-hidden">
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
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-500/60 border border-blue-500/20 rounded-lg p-4">
          <p className="text-white text-sm text-center">{t.infoMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default HabitTrackerGame;
