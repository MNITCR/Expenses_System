import { Label, Select, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { FiSettings } from "react-icons/fi";
import apiSwitcher from "../utils/apiSwitcher";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { useGlobalSetting } from "../context/GlobalContext";

const SystemSettings = () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  const { globalSetting, changeLanguage } = useGlobalSetting();
  const {t,i18n} = useTranslation();
  const [countExp, setCountExp] = useState(0);
  const userId = localStorage.getItem("userId");
  const [setting, setSetting] = useState({
    language: 1,
    currency: 1,
    theme: 1,
    date_format: 1,
    decimals: 2,
    ds_separator: 1,
    ths_separator: 2,
    dsc_symbol: 1,
    userId: userId,
  });

  const getSetting = async () => {
    const serverUrl = await apiSwitcher.connectToServer();
    try {
        const response_ex = await axios.get(
            `${serverUrl}/${import.meta.env.VITE_API_URL_EXPENSE}`,
            {
                params: {
                userId: userId,
                }
            }
        );
        setCountExp(response_ex.data.exp);
        const response = await axios.get(`${serverUrl}/${import.meta.env.VITE_API_URL_SETTING}`,{
            params: {
                userId: userId,
            }
        });
      if (
        response.status === 200 &&
        response.data &&
        response.data.length > 0
      ) {
        setSetting(response.data[0]);
        localStorage.setItem('theme', response.data[0]?.theme === 1 ? 'dark' : '');
        const selectedLanguage = response.data[0]?.language === 1 ? 'en' : 'km';
        changeLanguage(selectedLanguage);
      }
    } catch (error) {
      toast.warning(`${error.message}!`);
    }
  };

  useEffect(() => {
    getSetting();
  }, []);

  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    setSetting((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));

    if(name == "language"){
      const selectedLanguage = value === '1' ? 'en' : 'km';
      changeLanguage(selectedLanguage);
    }

    if(name == "theme"){
      if (value === '1') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.removeItem('theme');
      }
    }
  };

  const updateSetting = async () => {
    const serverUrl = await apiSwitcher.connectToServer();
    if (!setting || Object.keys(setting).length === 0) {
      toast.warning("Please provide valid setting data!");
      return;
    }

    try {
      await axios.put(
        `${serverUrl}/${import.meta.env.VITE_API_URL_SETTING}/${userId}`,
        setting
      );
      setSetting({});
      toast.success(`Updated ${name} successfully!`);
      getSetting();
    } catch (error) {
      toast.warning(`${error.message} !`);
    }
  };


  return (
    <>
      <div className="overflow-x-auto relative">
        <div className="flex items-center rounded-ss-md rounded-se-md border-[1.5px] border-x-[1.5px] dark:border-gray-600 transition-all duration-300 ease-in-out">
          <div className="gap-4 p-3 border-e-[1.5px] dark:border-gray-600 ">
            <FiSettings className="dark:text-gray-400 text-xl text-gray-700" />
          </div>
          <div className="px-2">
            <h1 className={`dark:text-gray-400 text-gray-600 font-medium ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
              {t('system_setting')}
            </h1>
          </div>
        </div>

        <div className="p-2.5 border-x-[1.5px] border-b-[1.5px] dark:border-gray-600 rounded-es-md rounded-ee-md">
          <h2 className={`dark:text-gray-400 text-gray-800 ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
            {t('system_setting_desc')}
          </h2>
        </div>

        {/* site */}
        <div className="relative rounded-md mt-7 border-[1.5px] dark:border-gray-600 px-4 pt-4 pb-8 transition-all duration-300 ease-in-out">
          <div className="top-[-37px] z-20 absolute rounded-md py-1.5 px-4 mt-4 border-[1.5px] dark:border-gray-600 dark:bg-gray-800 bg-white">
            <h3 className={`dark:text-gray-400 text-gray-600 font-medium ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
              {t('site_config')}
            </h3>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-2">
            <div>
              <div className="mb-2 bloc">
                <Label
                  className="dark:text-gray-400"
                  htmlFor="language"
                  value="Language *"
                />
              </div>
              <Select
                id="language"
                name="language"
                value={setting.language}
                required
                onChange={handleSettingChange}
              >
                <option value="1">English</option>
                <option value="2">Khmer</option>
              </Select>
            </div>

            <div>
              <div className="mb-2 block">
                <Label
                  className="dark:text-gray-400"
                  htmlFor="df_currency"
                  value="Default Currency *"
                />
              </div>
              <Select
                id="df_currency"
                name="currency"
                disabled= {countExp.length > 0 }
                value={setting.currency}
                required
                onChange={handleSettingChange}
              >
                <option value="1" defaultValue>
                  USD Dollar
                </option>
                <option value="2">Riel</option>
              </Select>
            </div>

            <div>
              <div className="mb-2 block">
                <Label
                  className="dark:text-gray-400"
                  htmlFor="theme"
                  value="Theme *"
                />
              </div>
              <Select
                id="theme"
                name="theme"
                value={setting.theme}
                required
                onChange={handleSettingChange}
              >
                <option value="1" defaultValue>
                  Dark
                </option>
                <option value="2">Light</option>
              </Select>
            </div>

            <div>
              <div className="mb-2 block">
                <Label
                  className="dark:text-gray-400"
                  htmlFor="date_format"
                  value="Date Format *"
                />
              </div>
              <Select
                id="date_format"
                name="date_format"
                value={setting.date_format}
                required
                onChange={handleSettingChange}
              >
                <option value="1" defaultValue>
                  yyyy-mm-dd
                </option>
                <option value="2">yyyy/mm/dd</option>
                <option value="3">yyyy.mm.dd</option>
                <option value="4">dd-mm-yyyy</option>
                <option value="5">dd/mm/yyyy</option>
                <option value="3">dd.mm.yyyy</option>
              </Select>
            </div>
          </div>
        </div>

        {/* money */}
        <div className="relative rounded-md mt-7 border-[1.5px] dark:border-gray-600 px-4 pt-4 pb-8 transition-all duration-300 ease-in-out">
          <div className="top-[-37px] z-20 absolute rounded-md py-1.5 px-4 mt-4 border-[1.5px] dark:border-gray-600 dark:bg-gray-800 bg-white">
            <h3 className={`dark:text-gray-400 text-gray-600 font-medium ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
              {t('money_and_number')}
            </h3>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-2">
            <div>
              <div className="mb-2 bloc">
                <Label
                  className="dark:text-gray-400"
                  htmlFor="decimals"
                  value="Decimals *"
                />
              </div>
              <Select
                id="decimals"
                name="decimals"
                value={setting.decimals}
                required
                onChange={handleSettingChange}
              >
                <option value="1">1</option>
                <option value="2" defaultValue>2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </Select>
            </div>

            <div>
              <div className="mb-2 block">
                <Label
                  className="dark:text-gray-400"
                  htmlFor="ds_separator"
                  value="Decimals Separator *"
                />
              </div>
              <Select
                id="ds_separator"
                name="ds_separator"
                value={setting.ds_separator}
                required
                onChange={handleSettingChange}
              >
                <option value="1" defaultValue>Dot</option>
                <option value="2">Comma</option>
              </Select>
            </div>

            <div>
              <div className="mb-2 block">
                <Label
                  className="dark:text-gray-400"
                  htmlFor="ths_separator"
                  value="Thousands Separator *"
                />
              </div>
              <Select
                id="ths_separator"
                name="ths_separator"
                value={setting.ths_separator}
                required
                onChange={handleSettingChange}
              >
                <option value="1">Dot</option>
                <option value="2" defaultValue>Comma</option>
                <option value="3">Space</option>
              </Select>
            </div>

            <div>
              <div className="mb-2 block">
                <Label
                  className="dark:text-gray-400"
                  htmlFor="dsc_symbol"
                  value="Display Currency Symbol *"
                />
              </div>
              <Select
                id="dsc_symbol"
                name="dsc_symbol"
                value={setting.dsc_symbol}
                required
                onChange={handleSettingChange}
              >
                <option value="1">Before</option>
                <option value="2" defaultValue>After</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-start">
          <button
            className={`${i18n.language === 'km' ? "font-kh_siemreap" : ""} border-[1.5px] dark:bg-slate-800 dark:border-gray-500 dark:text-gray-400 font-medium px-10 py-1.5 rounded-md dark:active:bg-gray-700 active:bg-cyan-100 transition-all text-gray-600}`}
            onClick={updateSetting}
          >
            {t('edit')}
          </button>
        </div>
      </div>
    </>
  );
};

export default SystemSettings;
