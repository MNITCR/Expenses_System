import React, { createContext, useState, useContext, useEffect } from "react";
import i18n from "i18next";
import FlagOfCam from "../assets/FlagOfCam.png";
import FlagOfUSA from "../assets/FlagOfUSA.png";
const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [globalSetting, setGlobalSetting] = useState({
    language: 'en',
    currency: 1,
    theme: 1,
    date_format: 1,
    decimals: 2,
    ds_separator: 1,
    ths_separator: 2,
    dsc_symbol: 1,
  });

  const [currentFlag, setCurrentFlag] = useState(FlagOfUSA);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      setGlobalSetting((prev) => ({ ...prev, language: savedLanguage }));
      if (savedLanguage === "km") {
        setCurrentFlag(FlagOfCam);
        i18n.changeLanguage("km");
      } else {
        setCurrentFlag(FlagOfUSA);
        i18n.changeLanguage("en");
      }
    }
  }, []);

  // Function to change the language
  const changeLanguage = (language) => {
    setGlobalSetting((prev) => ({ ...prev, language }));
    if (language === "km") {
      setCurrentFlag(FlagOfCam);
      i18n.changeLanguage("km");
      localStorage.setItem("language", "km");
    } else {
      setCurrentFlag(FlagOfUSA);
      i18n.changeLanguage("en");
      localStorage.setItem("language", "en");
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        globalSetting,
        setGlobalSetting,
        currentFlag,
        changeLanguage,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalSetting = () => {
  return useContext(GlobalContext);
};
