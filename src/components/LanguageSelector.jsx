// components/LanguageSelector.jsx
import React from "react";

const LanguageSelector = ({
  language,
  onLanguageChange,
  showMenu,
  setShowMenu,
}) => {
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center w-25 justify-between bg-black/30 hover:bg-black/50 text-red-500 px-5 py-1 rounded-lg font-medium transition shadow-lg"
      >
        <span className="text-xl">
          {language === "uz" ? "🇺🇿" : language === "ru" ? "🇷🇺" : "🇬🇧"}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${
            showMenu ? "rotate-180" : ""
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

      {showMenu && (
        <div className="absolute top-13 z-1 left-0 bg-white rounded-2xl rounded-tl-none shadow-2xl overflow-hidden w-64 border border-gray-100">
          <button
            onClick={() => onLanguageChange("uz")}
            className={`w-full flex items-center gap-3 px-5 py-2 hover:bg-gray-300 transition ${
              language === "uz" ? "bg-gray-300" : ""
            }`}
          >
            <span className="text-lg">🇺🇿</span>
            <span className="text-lg font-medium text-gray-800">O'zbekcha</span>
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
            onClick={() => onLanguageChange("ru")}
            className={`w-full flex items-center gap-3 px-5 py-2 hover:bg-gray-300 transition border-t border-gray-100 ${
              language === "ru" ? "bg-gray-300" : ""
            }`}
          >
            <span className="text-lg">🇷🇺</span>
            <span className="text-lg font-medium text-gray-800">Русский</span>
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
            onClick={() => onLanguageChange("en")}
            className={`w-full flex items-center gap-3 px-5 py-2 hover:bg-gray-300 transition border-t border-gray-100 ${
              language === "en" ? "bg-gray-300" : ""
            }`}
          >
            <span className="text-lg">🇬🇧</span>
            <span className="text-lg font-medium text-gray-800">English</span>
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
  );
};

export default LanguageSelector;
