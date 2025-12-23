// components/LoadingScreen.jsx
import React from "react";
import { Loader2 } from "lucide-react";

const LoadingScreen = ({ t, connectionStatus }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-gray-100">
      <div className="text-center">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>

        {/* Loading text */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t.loading || "Yuklanmoqda..."}
        </h2>

        {/* Connection status */}
        {connectionStatus === "offline" && (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm mt-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            {t.offlineMode || "Offline rejim"}
          </div>
        )}

        {/* Tips */}
        <p className="text-gray-600 mt-4 max-w-md">
          {t.loadingTip || "Iltimos, kuting. Ma'lumotlar yuklanmoqda..."}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
