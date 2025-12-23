// pages/LoginPage.jsx - PAROL BILAN (Galaxy dizayni)
import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import Galaxy from "../Galaxy";

const LoginPage = ({
  language,
  onLanguageChange,
  loginCode,
  setLoginCode,
  loginError,
  setLoginError,
  onLogin,
  connectionStatus,
  t,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoginError("");

    if (!loginCode.trim()) {
      setLoginError(t.loginCodeRequired || "Login kodi kiritilmadi");
      return;
    }

    if (!password.trim()) {
      setLoginError(t.passwordRequired || "Parol kiritilmadi");
      return;
    }

    setIsLoading(true);

    try {
      const success = await onLogin(loginCode, password);

      if (!success) {
        setIsLoading(false);
      }
    } catch (error) {
      setLoginError(error.message);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

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
        <div className="bg-white/10 absolute backdrop-blur-lg rounded-3xl p-8 border border-white/20 w-85 sm:w-100">
          {connectionStatus === "offline" && (
            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm text-center">
              ⚠️ {t.offlineMode || "Offline rejimda"}
            </div>
          )}

          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => onLanguageChange("uz")}
              className={`px-4 py-2 rounded-lg hover:scale-110 active:scale-100 text-4xl transition ${
                language === "uz"
                  ? "bg-black"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              🇺🇿
            </button>
            <button
              onClick={() => onLanguageChange("ru")}
              className={`px-4 py-2 rounded-lg hover:scale-110 active:scale-100 text-4xl transition ${
                language === "ru"
                  ? "bg-black"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              🇷🇺
            </button>
            <button
              onClick={() => onLanguageChange("en")}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={loginCode}
                onChange={(e) => {
                  setLoginCode(e.target.value);
                  setLoginError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder={t.loginPlaceholder}
                className="w-full bg-white/10 text-white px-4 py-3 rounded-lg border border-white/20 focus:outline-none focus:border-blue-600 text-center text-lg font-semibold tracking-wider"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder={t.passwordPlaceholder || "••••••••"}
                className="w-full bg-white/10 text-white px-4 py-3 rounded-lg border border-white/20 focus:outline-none focus:border-blue-600 text-center text-lg font-semibold tracking-wider pr-12"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {loginError && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-800 hover:bg-blue-900 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {t.loggingIn || "Kirish..."}
                </span>
              ) : (
                t.loginButton
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/40 text-xs text-center">{t.noCode}</p>
            <div className="text-center mt-4 text-white">
              <a
                className="flex items-center justify-center hover:text-blue-400 transition-colors"
                href="https://t.me/tox1roff_16"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="mr-2"
                  width={20}
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Telegram_2019_Logo.svg/1200px-Telegram_2019_Logo.svg.png"
                  alt="Telegram"
                />
                @tox1roff_16
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
