import React,{useState} from "react";
import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import axios from "axios";
import apiSwitcher from "../utils/apiSwitcher";
import { useTranslation } from "react-i18next";

const Register = () => {
  const {t,i18n} = useTranslation();
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const role = "admin";
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const serverUrl = await apiSwitcher.connectToServer();
    try {
      const response = await axios.post(
        `${serverUrl}/${import.meta.env.VITE_API_URL_AUTH}/register`,
        {
          username,
          email,
          password,
          role
        }
      );
      if (response) {
        const notify = () => toast.success(response.data.message);
        notify();
        navigate("/login");
      }
    } catch (error) {
      const notify = () => toast.success(error);
      notify();
    }
  };
  return (
    <>
      <form
        className="flex max-w-md flex-col gap-4 m-auto mt-32"
        onSubmit={handleRegister}
      >
        <h1 className={`text-3xl font-bold text-center mb-4 dark:text-white ${i18n.language === "km" ? "font-kh_siemreap" : ""}`}>{t('register')}</h1>
        <div>
          <div className={`mb-2 block ${i18n.language === "km" ? "font-kh_siemreap" : ""}`}>
            <Label htmlFor="name" value={t('name')} />
          </div>
          <TextInput
            id="name"
            type="text"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </div>
        <div>
          <div className={`mb-2 block ${i18n.language === "km" ? "font-kh_siemreap" : ""}`}>
            <Label htmlFor="email" value={t('email')} />
          </div>
          <TextInput
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <div className={`mb-2 block ${i18n.language === "km" ? "font-kh_siemreap" : ""}`}>
            <Label htmlFor="password1" value={t('password')} />
          </div>
          <TextInput
            id="password1"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="agree" />
          <Label htmlFor="agree" className={`flex ${i18n.language === "km" ? "font-kh_siemreap" : ""}`}>
            {t('i_agree')}&nbsp;
            <Link
              to="#"
              className="text-cyan-600 hover:underline dark:text-cyan-500"
            >
              {t('term_condition')}
            </Link>
          </Label>
        </div>
        <Button type="submit" className={i18n.language === "km" ? "font-kh_siemreap" : ""}>{t('btn_register')}</Button>
        <Label htmlFor="agree" className={`flex ${i18n.language === "km" ? "font-kh_siemreap" : ""}`}>
          {t('already_account')}&nbsp;
          <Link
            to="/login"
            className={`text-cyan-600 hover:underline dark:text-cyan-500 ${i18n.language === "km" ? "font-kh_siemreap" : ""}`}
          >
            {t('login')}
          </Link>
        </Label>
      </form>
    </>
  );
};

export default Register;
