// components/LoadingScreen.jsx
import React from "react";
import { Loader2 } from "lucide-react";

const LoadingScreen = ({ t }) => {
  return (
    <div className="min-h-screen bg-blue-800 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">{t.loading}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
