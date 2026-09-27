import React, { createContext, useContext, useEffect, useState } from 'react';
import { startaOversattning, stoppaOversattning } from '../utils/oversattning';

export type Lang = 'SV' | 'EN';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'SV',
  setLang: () => {},
});

const LAGRING = 'stodona-sprak';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Alltid SV i första renderingen, så den förrenderade (svenska) sidan
  // hydreras utan avvikelser. Ett sparat EN-val sätts direkt efteråt.
  const [lang, setLangState] = useState<Lang>('SV');

  useEffect(() => {
    try {
      if (localStorage.getItem(LAGRING) === 'EN') setLangState('EN');
    } catch { /* privat läge */ }
  }, []);

  // Hela sidan översätts när EN är valt – även text utan nyckel i translations.ts.
  useEffect(() => {
    document.documentElement.lang = lang === 'EN' ? 'en' : 'sv';
    if (lang === 'EN') startaOversattning();
    else stoppaOversattning();
  }, [lang]);

  const setLang = (ny: Lang) => {
    // Stoppa före Reacts svenska rendering, så att observern inte översätter den igen.
    if (ny === 'SV') stoppaOversattning();
    setLangState(ny);
    try {
      localStorage.setItem(LAGRING, ny);
    } catch { /* privat läge */ }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
