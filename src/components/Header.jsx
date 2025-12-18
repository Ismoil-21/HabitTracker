// components/Header.jsx
import React from "react";
import { Target, Calendar, TrendingUp, Loader2, LogOut } from "lucide-react";
import LanguageSelector from "./LanguageSelector";

const Header = ({
  t,
  saving,
  language,
  onLanguageChange,
  showLangMenu,
  setShowLangMenu,
  view,
  setView,
  onReset,
  onLogout,
  currentUser,
  stats,
}) => {
  return (
    <div className="bg-black/10 backdrop-blur-lg p-6 mb-6 border border-white/5 rounded-3xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-black flex items-center gap-3">
          <Target className="w-8 h-8" />
          {t.title}
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
        </h1>
        <div className="flex gap-2 flex-wrap items-center">
          <LanguageSelector
            language={language}
            onLanguageChange={onLanguageChange}
            showMenu={showLangMenu}
            setShowMenu={setShowLangMenu}
          />

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
            onClick={onReset}
            className="px-4 py-2 rounded-lg font-medium hover:scale-110 active:scale-100 bg-red-500 text-red-300 transition"
            title={t.reset}
          >
            {t.reset}
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 hover:scale-110 active:scale-100 rounded-lg font-medium border border-black bg-white/10 text-black hover:bg-white/20 transition flex items-center gap-2"
            title={t.logout}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mb-3 text-black/70 text-sm">
        👤 {t.user}:{" "}
        <span className="font-semibold text-black/80">{currentUser}</span>
      </div>

      <div className="bg-white/5 rounded-full border border-black/20 h-8 overflow-hidden mb-3">
        <span className="text-black absolute bottom-13 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center font-bold text-sm">
          {stats.percentage}%
        </span>
        <div
          className="h-full bg-green-500 transition-all duration-500 flex items-center justify-end px-4"
          style={{ width: `${stats.percentage}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-black/70 text-sm">
        <span>
          {stats.completed} / {stats.total} {t.completed}
        </span>
        <span className="flex items-center gap-2">
          <span className="text-yellow-400">🏆</span>
          {Math.floor(stats.percentage / 10)} {t.level}
        </span>
      </div>
    </div>
  );
};

export default Header;
