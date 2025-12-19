// components/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { Target, Calendar, TrendingUp, Loader2, LogOut, Menu, X } from "lucide-react";
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef(null);

  // Tashqariga bosilganda menuni yopish
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('[data-menu-button]')
      ) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      // Body scroll'ni to'xtatish
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Body scroll'ni qayta yoqish
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  const handleViewChange = (newView) => {
    setView(newView);
    setShowMobileMenu(false);
  };

  const handleReset = () => {
    onReset();
    setShowMobileMenu(false);
  };

  const handleLogout = () => {
    onLogout();
    setShowMobileMenu(false);
  };

  return (
    <div className="bg-black/10 p-6 mb-6 border border-white/5 rounded-3xl relative">
      <div className="flex items-center justify-between mb-4 gap-4">
        <h1 className="sm:text-2xl md:text-3xl font-bold text-black flex items-center gap-3">
          <Target className="w-8 h-8" />
          {t.title}
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
        </h1>

        <div className="flex gap-2 items-center">
          {/* Desktop uchun tugmalar */}
          <div className="hidden md:flex gap-2 flex-wrap items-center">
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
              className="px-4 py-2 rounded-lg font-medium hover:scale-110 active:scale-100 bg-red-500 text-white transition"
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

          {/* Mobile burger menu tugmasi */}
          <button
            data-menu-button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg border border-black text-black hover:bg-black/5 transition"
            aria-label="Menu"
          >
            <Menu className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowMobileMenu(false)}
            style={{ zIndex: 99998 }}
          />

          {/* Slide-in menu */}
          <div
            ref={mobileMenuRef}
            className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl animate-slideInRight"
            style={{ zIndex: 99999 }}
          >
            {/* Menu header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="font-bold text-xl text-gray-800">Menu</h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Menu content */}
            <div className="p-6 space-y-4 overflow-y-auto h-[calc(100%-80px)]">
              {/* Language Selector */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  {t.language || "Til"}
                </label>
                <LanguageSelector
                  language={language}
                  onLanguageChange={onLanguageChange}
                  showMenu={showLangMenu}
                  setShowMenu={setShowLangMenu}
                  mobile
                />
              </div>

              {/* View buttons */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Ko'rinish
                </label>
                
                <button
                  onClick={() => handleViewChange("calendar")}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition ${
                    view === "calendar"
                      ? "bg-black text-white shadow-lg"
                      : "border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Kalendar</span>
                  </div>
                  {view === "calendar" && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>

                <button
                  onClick={() => handleViewChange("stats")}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition ${
                    view === "stats"
                      ? "bg-black text-white shadow-lg"
                      : "border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">Statistika</span>
                  </div>
                  {view === "stats" && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              </div>

              {/* User info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Foydalanuvchi</div>
                <div className="font-semibold text-gray-800 flex items-center gap-2">
                  👤 {currentUser}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  className="w-full p-4 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition shadow-lg"
                >
                  {t.reset}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-xl font-medium border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t.logout}</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mb-3 text-black/70 text-sm">
        👤 {t.user}:{" "}
        <span className="font-semibold text-black/80">{currentUser}</span>
      </div>

      <div className="bg-white/5 rounded-full border border-black/20 h-8 overflow-hidden mb-3 relative">
        <span className="text-black absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center font-bold text-sm z-10">
          {stats.percentage}%
        </span>
        <div
          className="h-full bg-green-500 transition-all duration-500"
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