// src/pages/AdminPage.jsx - Admin Panel
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Users,
  UserPlus,
  Key,
  Trash2,
  RefreshCw,
  LogOut,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
} from "lucide-react";

const AdminPage = () => {
  const navigate = useNavigate();

  

  // Admin auth
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminToken, setAdminToken] = useState(null);

  // Users
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create user form
  const [newUserCode, setNewUserCode] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newLanguage, setNewLanguage] = useState("uz");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newlyCreatedUser, setNewlyCreatedUser] = useState(null);

  // Messages
  const [message, setMessage] = useState({ type: "", text: "" });

  // Password visibility
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [showPasswordInput, setShowPasswordInput] = useState(true);
  const [copiedPassword, setCopiedPassword] = useState(null);

  const API_BASE = "http://localhost:5001/api";

  // Check if already logged in as admin
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser.isAdmin) {
          setIsAdminLoggedIn(true);
          setAdminToken(token);
          loadUsers(token);
        }
      } catch (error) {
        console.error("Error parsing user:", error);
      }
    }
  }, []);

  // Show message
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // Generate random password
  const generateRandomPassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  // Admin login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: adminCode, password: adminPassword }),
      });

      const data = await response.json();

      if (data.success && data.user.isAdmin) {
        setAdminToken(data.token);
        setIsAdminLoggedIn(true);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        showMessage("success", "Admin sifatida muvaffaqiyatli kirdingiz!");
        loadUsers(data.token);
      } else {
        showMessage("error", "Admin huquqi yo'q!");
      }
    } catch (error) {
      showMessage("error", "Login xatosi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Admin logout
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminToken(null);
    setAdminCode("");
    setAdminPassword("");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Load users
  const loadUsers = async (token = adminToken) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.users);

        const visibilityState = {};
        data.users.forEach((user) => {
          visibilityState[user.code] = true;
        });
        setVisiblePasswords(visibilityState);
      }
    } catch (error) {
      showMessage("error", "Foydalanuvchilarni yuklashda xato");
    } finally {
      setLoading(false);
    }
  };

  // Create new user
  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!newUserCode || !newUsername || !newPassword) {
      showMessage("error", "Barcha maydonlarni to'ldiring!");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          code: newUserCode,
          username: newUsername,
          password: newPassword,
          language: newLanguage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Set generated password for display
        setGeneratedPassword(newPassword);

        // Store newly created user info
        const newUser = {
          code: newUserCode,
          username: newUsername,
          password: newPassword,
          language: newLanguage,
        };
        setNewlyCreatedUser(newUser);

        // Show password modal
        setShowPasswordModal(true);

        // Reset form
        setNewUserCode("");
        setNewUsername("");
        setNewPassword("");
        setNewLanguage("uz");

        // Reload users list
        loadUsers();
      } else {
        showMessage("error", data.error);
      }
    } catch (error) {
      showMessage("error", "Xato: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Close password modal
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setNewlyCreatedUser(null);
    setGeneratedPassword("");
  };

  // Toggle password visibility
  const togglePasswordVisibility = (userCode) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userCode]: !prev[userCode],
    }));
  };

  // Copy password to clipboard
  const copyPassword = (password, userCode = null) => {
    navigator.clipboard
      .writeText(password)
      .then(() => {
        if (userCode) {
          setCopiedPassword(userCode);
          setTimeout(() => setCopiedPassword(null), 2000);
        }
        showMessage("success", "Parol clipboardga nusxalandi!");
      })
      .catch((err) => {
        showMessage("error", "Nusxalashda xato: " + err.message);
      });
  };

  // Generate password for new user
  const handleGeneratePassword = () => {
    const password = generateRandomPassword();
    setNewPassword(password);
  };

  // Change password
  const handleChangePassword = async (userCode) => {
    const newPass = prompt(`${userCode} uchun yangi parol kiriting:`);
    if (!newPass) return;

    try {
      const response = await fetch(
        `${API_BASE}/admin/change-password/${userCode}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ newPassword: newPass }),
        }
      );

      const data = await response.json();

      if (data.success) {
        showMessage("success", "Parol muvaffaqiyatli o'zgartirildi!");
        loadUsers();
      } else {
        showMessage("error", data.error);
      }
    } catch (error) {
      showMessage("error", "Xato: " + error.message);
    }
  };

  // Delete user
  const handleDeleteUser = async (userCode) => {
    if (!window.confirm(`${userCode} ni o'chirmoqchimisiz?`)) return;

    try {
      const response = await fetch(
        `${API_BASE}/admin/delete-user/${userCode}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      const data = await response.json();

      if (data.success) {
        showMessage("success", "Foydalanuvchi o'chirildi!");
        loadUsers();
      } else {
        showMessage("error", data.error);
      }
    } catch (error) {
      showMessage("error", "Xato: " + error.message);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("uz-UZ");
  };

  // If not logged in as admin
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-linear-to-br from-purple-500 to-blue-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600">Foydalanuvchilarni boshqarish</p>
          </div>

          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Login
              </label>
              <input
                type="text"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="superadmin"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Parol
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
            >
              {loading ? "Kirish..." : "Kirish"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Asosiy sahifaga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-blue-50 p-6">
      {/* Password Modal */}
      {showPasswordModal && newlyCreatedUser && (
        <div className="fixed inset-0 flex items-center z-50 justify-center p-4">
            <div className="fixed inset-0 bg-black -z-50 opacity-50"></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  ✅ Foydalanuvchi yaratildi!
                </h2>
                <p className="text-gray-600">
                  Yangi foydalanuvchi ma'lumotlari
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Foydalanuvchi nomi</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {newlyCreatedUser.username}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Login kodi</p>
                    <p className="text-lg font-semibold text-gray-800 font-mono">
                      {newlyCreatedUser.code}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Parol</p>
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-300">
                      <code className="text-lg font-bold text-gray-800 font-mono">
                        {generatedPassword}
                      </code>
                      <button
                        onClick={() => copyPassword(generatedPassword)}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Nusxalash
                      </button>
                    </div>
                    <p className="text-sm text-red-500 mt-2">
                      ⚠️ Bu parolni yozib oling yoki nusxalab qo'ying!
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={closePasswordModal}
                className="w-full bg-linear-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                Tushunarli
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🔐 Admin Panel
              </h1>
              <p className="text-gray-600">Foydalanuvchilarni boshqarish</p>
            </div>
            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Chiqish
            </button>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Create User Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="md:flex md:justify-between items-center  mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-blue-500" />
              Yangi foydalanuvchi yaratish
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Parol yaratish
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordInput(!showPasswordInput)}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {showPasswordInput ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {showPasswordInput ? "Yashirish" : "Ko'rsatish"}
              </button>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Login kod *
                </label>
                <input
                  type="text"
                  value={newUserCode}
                  onChange={(e) => setNewUserCode(e.target.value)}
                  placeholder="john_doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foydalanuvchi nomi *
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parol *
                </label>
                <div className="relative">
                  <input
                    type={showPasswordInput ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-24"
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPasswordInput(!showPasswordInput)}
                      className="text-gray-500 hover:text-gray-700"
                      title={showPasswordInput ? "Yashirish" : "Ko'rsatish"}
                    >
                      {showPasswordInput ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyPassword(newPassword)}
                      className="text-gray-500 hover:text-gray-700"
                      title="Nusxalash"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Til
                </label>
                <select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="uz">🇺🇿 O'zbek</option>
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50"
            >
              {loading ? "Yaratilmoqda..." : "Foydalanuvchi yaratish"}
            </button>
          </form>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              Barcha foydalanuvchilar ({users.length})
            </h2>
            <button
              onClick={() => loadUsers()}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              Yangilash
            </button>
          </div>

          <div className="space-y-4">
            {users.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Hozircha foydalanuvchilar yo'q
              </p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="bg-linear-to-r from-gray-50 to-blue-50 p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {user.username}
                        </h3>
                        <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-mono">
                          {user.code}
                        </span>
                        {user.isAdmin && (
                          <span className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full">
                            🛡️ Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            Parol:
                          </span>
                          <span className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded font-mono font-bold">
                            {visiblePasswords[user.code]
                              ? user.password
                              : "••••••••"}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                togglePasswordVisibility(user.code)
                              }
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title={
                                visiblePasswords[user.code]
                                  ? "Yashirish"
                                  : "Ko'rsatish"
                              }
                            >
                              {visiblePasswords[user.code] ? (
                                <EyeOff className="w-4 h-4 text-gray-600" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                copyPassword(user.password, user.code)
                              }
                              className="p-1 hover:bg-gray-200 rounded transition-colors relative"
                              title="Nusxalash"
                            >
                              {copiedPassword === user.code ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          </div>
                        </div>
                        <span className="text-sm text-gray-600">
                          🌐 {user.language.toUpperCase()} | 📅{" "}
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleChangePassword(user.code)}
                        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Key className="w-4 h-4" />
                        Parolni o'zgartirish
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.code)}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        O'chirish
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
