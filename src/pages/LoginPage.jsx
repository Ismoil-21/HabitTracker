// pages/LoginPage.jsx
import React from "react";
import { Lock } from "lucide-react";
import Galaxy from "../Galaxy";

const LoginPage = ({
  language,
  onLanguageChange,
  loginCode,
  setLoginCode,
  loginError,
  setLoginError,
  onLogin,
  t,
}) => {
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

          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={loginCode}
                onChange={(e) => {
                  setLoginCode(e.target.value);
                  setLoginError("");
                }}
                onKeyPress={(e) => e.key === "Enter" && onLogin()}
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
              onClick={onLogin}
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
};

export default LoginPage;
