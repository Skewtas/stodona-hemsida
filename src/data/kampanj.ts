/**
 * Kampanjen "30 % året ut" (kod TRETTI) – en källa för startsidan, den fasta
 * bokningsknappen och Camillas pratbubbla. Villkoren står på /kampanj:
 * 30 % på varje hemstädning till och med 31 december 2026 vid städabonnemang
 * med 6 eller 12 månaders bindning.
 *
 * Allt som visar kampanjen slutar av sig självt efter slutdatumet.
 */
import { useEffect, useState } from "react";

export const KAMPANJ = {
  kod: "TRETTI",
  procent: 30,
  /** Sista dagen (Stockholmstid). */
  slut: "2026-12-31",
  sida: "/kampanj",
} as const;

function idagSthlm(nu: Date): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", year: "numeric", month: "2-digit", day: "2-digit" }).format(nu);
}

export function kampanjAktiv(nu = new Date()): boolean {
  return idagSthlm(nu) <= KAMPANJ.slut;
}

/** Dagar kvar, sista dagen inräknad. */
export function dagarKvar(nu = new Date()): number {
  const idag = new Date(`${idagSthlm(nu)}T12:00:00Z`).getTime();
  const slut = new Date(`${KAMPANJ.slut}T12:00:00Z`).getTime();
  return Math.max(0, Math.round((slut - idag) / 86400000) + 1);
}

/**
 * Kampanjens läge i en komponent. Den förrenderade sidan visar kampanjen utan
 * nedräkning; i webbläsaren räknas dagarna och kampanjen döljs efter slutdatum
 * – så att hydreringen aldrig krockar med byggets datum.
 */
export function useKampanj(): { aktiv: boolean; dagar: number | null } {
  const [lage, setLage] = useState<{ aktiv: boolean; dagar: number | null }>({ aktiv: kampanjAktiv(), dagar: null });
  useEffect(() => setLage({ aktiv: kampanjAktiv(), dagar: dagarKvar() }), []);
  return lage;
}
