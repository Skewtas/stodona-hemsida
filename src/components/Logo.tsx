import React from "react";

/**
 * Logotypen. Ordmärket och bladet ritas som två urklipp ur samma bild – vid
 * 82 % går skarven – så att bladet kan studsa högre och luta lite extra medan
 * ordmärket bara trycks ihop och skjuter i väg. Glansen ligger överst och
 * maskas med logotypen, så ljuset sveper över formerna och inte som en
 * rektangel över bakgrunden. Rörelsen bor i index.css under .stodona-logga.
 */
export default function Logo({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  // w-auto är nödvändigt: bredd-attributet (2000) plus max-width 100 % gör
  // annars bilden lika bred som hela headern, med logotypen letterboxad inuti.
  // Då skulle både urklippen vid 82 % och glansens mask hamna fel.
  const hojd = "h-8 md:h-12 w-auto object-contain";

  return (
    <div className={`stodona-logga flex items-center ${className}`}>
      <span className="stodona-logga__yta">
        <img
          src="/logotyp.png?v=2"
          alt="Stodona"
          className={`stodona-logga__ordmarke ${hojd} ${dark ? "brightness-0 invert" : ""}`}
          style={{ clipPath: "inset(0 18% 0 0)" }}
          width="2000"
          height="567"
          loading="lazy"
        />
        {/* Bladet. På den mörka varianten behåller det sin terrakotta medan
            ordmärket vänds till vitt. */}
        <img
          src="/logotyp.png?v=2"
          alt=""
          aria-hidden="true"
          className={`stodona-logga__blad ${hojd}`}
          style={{ clipPath: "inset(0 0 0 82%)" }}
          width="2000"
          height="567"
          loading="lazy"
        />
        <span className="stodona-logga__glans" aria-hidden="true" />
      </span>
    </div>
  );
}
