// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { translations } from "./translations";
import LoginPage from "./pages/LoginPage";
import CalendarPage from "./pages/CalendarPage";
import StatsPage from "./pages/StatsPage";
import LoadingScreen from "./components/LoadingScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import { apiService } from "../services/apiService";
import AdminPage from "./pages/AdminPage";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [language, setLanguage] = useState("uz");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginCode, setLoginCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("online");

  const t = translations[language];

  // Internet holatini kuzatish
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus("online");
      console.log("Internet ulandi, sync qilinmoqda...");
      apiService.processSyncQueue();
    };

    const handleOffline = () => {
      setConnectionStatus("offline");
      console.log("Internet uzildi, offline rejimda ishlanmoqda");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Foydalanuvchi ma'lumotlarini yuklash
  // App.jsx ichida - loadUserData funksiyasini tuzatamiz
  const loadUserData = useCallback(async () => {
    try {
      console.log("🔄 Loading user data...");
      setLoading(true);

      const data = await apiService.syncData();
      console.log("📊 Data loaded:", data);

      // Odatlarni set qilish
      if (data.habits) {
        setHabits(data.habits);
        console.log("✅ Habits set:", data.habits.length);
      } else {
        setHabits([]);
        console.log("⚠️ No habits found");
      }

      // Bajarishlarni set qilish
      if (data.completions) {
        setCompletions(data.completions);
        console.log(
          "✅ Completions set:",
          Object.keys(data.completions).length
        );
      } else {
        setCompletions({});
        console.log("⚠️ No completions found");
      }

      // Foydalanuvchini yangilash
      if (data.user) {
        setCurrentUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("✅ User updated:", data.user);
      }
    } catch (error) {
      console.error("❌ Error loading data:", error);

      // Offline holatda lokal ma'lumotlarni ko'rsatish
      const localUser = localStorage.getItem("user");
      const localHabits = localStorage.getItem("habits");
      const localCompletions = localStorage.getItem("completions");

      console.log("📁 Local data check:", {
        user: !!localUser,
        habits: !!localHabits,
        completions: !!localCompletions,
      });

      if (localUser) {
        try {
          setCurrentUser(JSON.parse(localUser));
        } catch (e) {
          console.error("Local user parse error:", e);
        }
      }

      if (localHabits) {
        try {
          setHabits(JSON.parse(localHabits));
        } catch (e) {
          console.error("Local habits parse error:", e);
        }
      }

      if (localCompletions) {
        try {
          setCompletions(JSON.parse(localCompletions));
        } catch (e) {
          console.error("Local completions parse error:", e);
        }
      }
    } finally {
      console.log("✅ Loading complete");
      setLoading(false);
    }
  }, []);

  // Dastlabki yuklash
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);

      try {
        // Token va user mavjudligini tekshirish
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        console.log("🔍 App init:");
        console.log("Token:", token);
        console.log("Saved user:", savedUser);

        if (token && savedUser) {
          try {
            const user = JSON.parse(savedUser);
            console.log("👤 Parsed user:", user);

            setCurrentUser(user);
            setIsLoggedIn(true);

            // Til sozlamalarini yuklash
            if (user.language) {
              setLanguage(user.language);
            } else {
              const savedLang = localStorage.getItem("language");
              if (savedLang) setLanguage(savedLang);
            }

            // Ma'lumotlarni yuklash
            console.log("🔄 Loading user data...");
            await loadUserData();
          } catch (parseError) {
            console.error("❌ User parse xatosi:", parseError);
            // Xato bo'lsa, tozalash
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setIsLoggedIn(false);
          }
        } else {
          console.log(
            "ℹ️ Token yoki user yo'q, login sahifasiga yo'naltiriladi"
          );
        }
      } catch (error) {
        console.error("Dastlabki yuklashda xato:", error);
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, [loadUserData]);

  // Route o'zgarganda loading ko'rsatish
  useEffect(() => {
    if (isLoggedIn && location.pathname !== "/login") {
      setLoading(true);
      // 3 soniya kutish
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isLoggedIn]);

  // Tilni o'zgartirish
  const changeLanguage = async (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);

    if (isLoggedIn && currentUser) {
      try {
        await apiService.updateLanguage(lang);
      } catch (error) {
        console.warn("Tilni serverga saqlashda xato:", error);
      }
    }
  };

  // Login qilish
  const handleLogin = async (code, password) => {
    // code va password parametrlarini olish
    const loginCode = (code || "").trim();
    const loginPassword = (password || "").trim();

    if (!loginCode) {
      setLoginError(t.loginError || "Login kodi kiritilmadi");
      return false;
    }

    if (!loginPassword) {
      setLoginError(t.loginError || "Parol kiritilmadi");
      return false;
    }

    try {
      setLoading(true);

      // API service ga code VA password yuborish
      const response = await apiService.login(loginCode, loginPassword);

      if (response.success) {
        setCurrentUser(response.user);
        setIsLoggedIn(true);
        setLoginError("");
        setLoginCode("");

        // Til sozlamalarini yangilash
        if (response.user.language) {
          setLanguage(response.user.language);
          localStorage.setItem("language", response.user.language);
        }

        // Ma'lumotlarni yuklash
        await loadUserData();

        // 1 soniya kutish
        setTimeout(() => {
          setLoading(false);
          navigate("/dashboard");
        }, 1000);

        return true;
      }
    } catch (error) {
      console.error("Login xatosi:", error);
      setLoginError(error.message || t.loginError || "Login xatosi");
      setLoading(false);
    }

    return false;
  };

  // Logout qilish
  const handleLogout = async () => {
    if (confirm(t.logoutConfirm || "Rostdan chiqmoqchimisiz?")) {
      try {
        await apiService.logout();
      } catch (error) {
        console.error("Logout xatosi:", error);
      } finally {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setHabits([]);
        setCompletions({});
        navigate("/login");
      }
    }
  };

  // Odatlarni saqlash
  const saveHabits = async (newHabits) => {
    try {
      setSaving(true);
      setHabits(newHabits);
      await apiService.updateHabits(newHabits);
    } catch (error) {
      console.error("Odatlarni saqlashda xato:", error);
      if (connectionStatus === "offline") {
        alert(
          t.offlineWarning ||
            "Offline rejimda. Internet ulanib qolsa, avtomatik saqlanadi."
        );
      } else {
        alert(t.saveError || "Saqlashda xato");
      }
    } finally {
      setSaving(false);
    }
  };

  // Bajarishlarni saqlash
  const saveCompletions = async (newCompletions) => {
    try {
      setSaving(true);
      setCompletions(newCompletions);
      await apiService.updateCompletions(newCompletions);
    } catch (error) {
      console.error("Bajarishlarni saqlashda xato:", error);
    } finally {
      setSaving(false);
    }
  };

  // Oylardagi kunlar sonini olish
  const getDaysInMonth = useCallback((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, []);

  // Odatni bajarishni belgilash
  const toggleHabit = async (habitId, day) => {
    try {
      const today = new Date();
      const completed = await apiService.toggleCompletion(
        habitId,
        day,
        today.getMonth() + 1,
        today.getFullYear()
      );

      const key = `${habitId}-${day}`;
      const newCompletions = {
        ...completions,
        [key]: completed,
      };

      setCompletions(newCompletions);
      localStorage.setItem("completions", JSON.stringify(newCompletions));
    } catch (error) {
      console.error("Toggle habit error:", error);
      alert("Bajarishni yangilashda xato");
    }
  };

  // Yangi odat qo'shish
  const addHabit = async () => {
    const name = newHabitName.trim();
    if (!name) return;

    try {
      setSaving(true);
      const newHabit = {
        name,
        emoji: "✨",
        color: "bg-cyan-100",
      };

      const createdHabit = await apiService.addHabit(newHabit);

      // Agar offline bo'lsa, createdHabit undefined bo'lishi mumkin
      const habitToAdd = createdHabit || {
        ...newHabit,
        id: Date.now(),
        _id: Date.now().toString(),
      };

      setHabits([...habits, habitToAdd]);
      setNewHabitName("");
      setShowAddHabit(false);
    } catch (error) {
      console.error("Odat qo'shishda xato:", error);
      alert(t.saveError || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  // Odatni o'chirish
  const deleteHabit = async (habitId) => {
    if (!confirm(t.deleteConfirm || "Rostdan o'chirmoqchimisiz?")) return;

    try {
      await apiService.deleteHabit(habitId);
      setHabits(habits.filter((h) => h.id !== habitId));
    } catch (error) {
      console.error("Odatni o'chirishda xato:", error);
      alert(t.deleteError || "O'chirishda xatolik");
    }
  };

  // Statistikani hisoblash
  const calculateStats = useCallback(() => {
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
  }, [habits, completions, currentMonth, getDaysInMonth]);

  // Har bir odat uchun statistikani hisoblash
  const getHabitStats = useCallback(
    (habitId) => {
      const daysInMonth = getDaysInMonth(currentMonth);
      let completed = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const key = `${habitId}-${day}`;
        if (completions[key]) completed++;
      }

      return {
        completed,
        total: daysInMonth,
        percentage:
          daysInMonth > 0 ? Math.round((completed / daysInMonth) * 100) : 0,
      };
    },
    [completions, currentMonth, getDaysInMonth]
  );

  // Barcha ma'lumotlarni tozalash
  const resetAllData = async () => {
    if (!confirm(t.resetConfirm || "Barcha ma'lumotlarni o'chirmoqchimisiz?"))
      return;

    try {
      await apiService.resetData();
      setHabits([]);
      setCompletions({});

      // Default odatlarni qayta yuklash
      const defaultHabits = await apiService.createDefaultHabits();
      setHabits(defaultHabits);

      alert(t.resetSuccess || "Ma'lumotlar muvaffaqiyatli tozalandi");
    } catch (error) {
      console.error("Ma'lumotlarni tozalashda xato:", error);
      alert(t.resetError || "Tozalashda xatolik");
    }
  };

  // Loading ekranini ko'rsatish
  if (loading) {
    return <LoadingScreen t={t} connectionStatus={connectionStatus} />;
  }

  return (
    <>
      {/* Connection status indicator */}
      {connectionStatus === "offline" && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-1 z-50">
          ⚠️ {t.offlineMode || "Offline rejimda ishlanmoqda"}
        </div>
      )}

      {saving && (
        <div className="fixed top-10 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          💾 {t.saving || "Saqlanmoqda..."}
        </div>
      )}

      <Routes>
        {/* Login sahifasi */}
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
                connectionStatus={connectionStatus}
                t={t}
              />
            )
          }
        />

        <Route path="/admin" element={<AdminPage />} />

        {/* Asosiy dashboard sahifasi */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <CalendarPage
                language={language}
                onLanguageChange={changeLanguage}
                currentUser={
                  currentUser?.username || currentUser?.code || "User"
                }
                habits={habits}
                completions={completions}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
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
                connectionStatus={connectionStatus}
                t={t}
              />
            </ProtectedRoute>
          }
        />

        {/* Statistikalar sahifasi */}
        <Route
          path="/stats"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <StatsPage
                language={language}
                onLanguageChange={changeLanguage}
                currentUser={
                  currentUser?.username || currentUser?.code || "User"
                }
                habits={habits}
                completions={completions}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                getHabitStats={getHabitStats}
                calculateStats={calculateStats}
                getDaysInMonth={getDaysInMonth}
                onReset={resetAllData}
                onLogout={handleLogout}
                saving={saving}
                connectionStatus={connectionStatus}
                t={t}
              />
            </ProtectedRoute>
          }
        />

        {/* Boshqa barcha URL lar uchun redirect */}
        <Route
          path="*"
          element={
            <Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </>
  );
};

export default App;
