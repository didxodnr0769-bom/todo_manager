import { useEffect, useState } from "react";
import { Calendar, CheckSquare } from "lucide-react";

export function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Logo/Icon */}
        <div className="relative">
          {/* Animated background circle */}
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{
              backgroundColor: "#E8F0FE",
              width: "120px",
              height: "120px",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Icon container */}
          <div
            className="relative flex items-center justify-center rounded-full"
            style={{
              backgroundColor: "#4285F4",
              width: "100px",
              height: "100px",
              boxShadow: "0 4px 20px rgba(66, 133, 244, 0.3)",
            }}
          >
            <div className="relative">
              <Calendar
                className="absolute"
                style={{
                  color: "white",
                  width: "40px",
                  height: "40px",
                  top: "-4px",
                  left: "-4px",
                }}
              />
              <CheckSquare
                className="absolute"
                style={{
                  color: "white",
                  width: "32px",
                  height: "32px",
                  top: "8px",
                  left: "8px",
                }}
              />
            </div>
          </div>
        </div>

        {/* App Name */}
        <div className="flex flex-col items-center gap-2">
          <h1
            className="tracking-tight"
            style={{
              color: "#202124",
              fontSize: "1.75rem",
            }}
          >
            G-Cal To-Do Automator
          </h1>
          <p style={{ color: "#5F6368", fontSize: "0.875rem" }}>
            캘린더와 할 일을 하나로
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-2">
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: "#4285F4",
              animationDelay: "0ms",
            }}
          />
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: "#4285F4",
              animationDelay: "150ms",
            }}
          />
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{
              backgroundColor: "#4285F4",
              animationDelay: "300ms",
            }}
          />
        </div>
      </div>
    </div>
  );
}
