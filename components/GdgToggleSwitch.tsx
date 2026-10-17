"use client";

import { useEffect, useState } from "react";

type GdgToggleSwitchProps = {
  className?: string;
  autoPlayInterval?: number;
};

export function GdgToggleSwitch({
  className = "",
  autoPlayInterval = 1800,
}: GdgToggleSwitchProps) {
  const [isChecked, setIsChecked] = useState(false);

  const toggleState = () => {
    setIsChecked((prev) => !prev);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      toggleState();
    }, autoPlayInterval);

    return () => {
      clearInterval(timer);
    };
  }, [autoPlayInterval]);

  return (
    <div
      role="switch"
      aria-checked={isChecked}
      aria-label="Toggle between GDG Pune and Global GDG"
      tabIndex={0}
      onClick={toggleState}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleState();
        }
      }}
      className={`relative inline-flex h-[34px] w-[68px] shrink-0 items-center justify-center select-none ${className}`}
      style={{
        width: "68px",
        height: "34px",
      }}
      title="Toggle between GDG Pune and Global GDG"
    >
      <div
        style={{
          transform: "scale(0.4857)",
          transformOrigin: "center center",
        }}
      >
        <div className={`toggle-switch ${isChecked ? "checked" : ""}`}>
          {/* Background Icons */}
          <div className="icon-container">
            {/* GDG Logo Side (Left) */}
            <div
              className="gdg-logo-mark"
              style={{
                width: "38px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                viewBox="78 44 332 186"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto"
                aria-hidden="true"
              >
                {/* Left Bracket (<) */}
                <path
                  d="M219.975 64.907 C230.968 80.204 227.48 101.516 212.183 112.509 L139.321 164.873 C124.025 175.866 102.712 172.377 91.719 157.081 C80.726 141.784 84.214 120.472 99.511 109.478 L172.373 57.115 C187.669 46.122 208.982 49.61 219.975 64.907 Z"
                  fill="#EA4335"
                  stroke="#1E1E1E"
                  strokeWidth="6"
                  strokeLinejoin="round"
                />
                <path
                  d="M91.719 117.282 C80.726 132.579 84.214 153.891 99.511 164.884 L172.373 217.248 C187.669 228.241 208.982 224.752 219.975 209.456 C230.968 194.159 227.48 172.847 212.183 161.853 L139.321 109.49 C124.025 98.497 102.712 101.985 91.719 117.282 Z"
                  fill="#4285F4"
                  stroke="#1E1E1E"
                  strokeWidth="6"
                  strokeLinejoin="round"
                />

                {/* Right Bracket (>) */}
                <path
                  d="M396.036 117.282 C407.029 132.579 403.541 153.891 388.244 164.884 L315.382 217.248 C300.086 228.241 278.773 224.752 267.78 209.456 C256.787 194.159 260.275 172.847 275.572 161.853 L348.434 109.49 C363.73 98.497 385.043 101.985 396.036 117.282 Z"
                  fill="#FBBC05"
                  stroke="#1E1E1E"
                  strokeWidth="6"
                  strokeLinejoin="round"
                />
                <path
                  d="M267.78 64.907 C256.787 80.204 260.275 101.516 275.572 112.509 L348.434 164.873 C363.73 175.866 385.043 172.377 396.036 157.081 C407.029 141.784 403.541 120.472 388.244 109.478 L315.382 57.115 C300.086 46.122 278.773 49.61 267.78 64.907 Z"
                  fill="#34A853"
                  stroke="#1E1E1E"
                  strokeWidth="6"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Globe Side (Right) */}
            <div
              className="globe-icon-container"
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                aria-hidden="true"
              >
                {/* Earth sphere */}
                <circle
                  cx="16"
                  cy="16"
                  r="13.5"
                  fill="#F1F3F4"
                  stroke="#5f6368"
                  strokeWidth="2"
                />
                {/* Longitude meridian */}
                <ellipse
                  cx="16"
                  cy="16"
                  rx="6.5"
                  ry="13.5"
                  stroke="#5f6368"
                  strokeWidth="1.6"
                  fill="none"
                />
                {/* Equator */}
                <path
                  d="M2.5 16h27"
                  stroke="#5f6368"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                {/* Prime meridian axis */}
                <path
                  d="M16 2.5v27"
                  stroke="#5f6368"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                {/* Latitude parallels */}
                <path
                  d="M5.5 9.5c3 1.5 18 1.5 21 0"
                  stroke="#5f6368"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M5.5 22.5c3 -1.5 18 -1.5 21 0"
                  stroke="#5f6368"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          {/* Sliding Knob */}
          <div className="toggle-knob" />
        </div>
      </div>
    </div>
  );
}

