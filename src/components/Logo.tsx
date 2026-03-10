import React from "react";

export default function Logo({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  if (!dark) {
    return (
      <div className={`flex items-center ${className}`}>
        <img
          src="/logotyp.png?v=2"
          alt="Stodona"
          className="h-8 md:h-12 object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center relative ${className}`}>
      {/* White version of the logo */}
      <img
        src="/logotyp.png?v=2"
        alt="Stodona"
        className="h-8 md:h-12 object-contain brightness-0 invert"
      />
      {/* Colored leaf overlay - clipped to show only the right part */}
      <img
        src="/logotyp.png?v=2"
        alt=""
        className="h-8 md:h-12 object-contain absolute top-0 left-0"
        style={{ clipPath: "inset(0 0 0 82%)" }}
      />
    </div>
  );
}
