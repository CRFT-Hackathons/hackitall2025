"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function TimeDisplayButton() {
  const [blurred, setBlurred] = useState(true);

  return (
    <div className="relative group">
      <span
        className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 transition-all duration-200 ${
          blurred ? "blur-sm" : ""
        }`}
        id="time-display"
      >
        35:42
      </span>
      <button
        className="absolute -right-7 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        onClick={() => setBlurred(!blurred)}
      >
        {blurred ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>
    </div>
  );
}
