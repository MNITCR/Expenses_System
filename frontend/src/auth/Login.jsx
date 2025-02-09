import React, { useState } from "react";
import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import apiSwitcher from "../utils/apiSwitcher";
import { useTranslation } from "react-i18next";

const Login = () => {
  const {t,i18n} = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const notify = () => toast.success("Login Successfully!");

  const handleLoginRequest = async (email, password) => {
    const serverUrl = await apiSwitcher.connectToServer();
    try {
      const response = await axios.post(`${serverUrl}/${import.meta.env.VITE_API_URL_AUTH}/login`, {
        email,
        password,
      });

      const {token, id} = response.data;
      if (token) {
        localStorage.setItem("authToken", `Bearer ${token}`);
        localStorage.setItem("userId", id);
        const expirationTime = new Date().getTime() + 3600000; // 1 hour expiration
        // const expirationTime = new Date().getTime() + 1000; // 1 hour expiration
        localStorage.setItem("tokenExpiration", expirationTime.toString());
        const insertSetting = await axios.post(`${serverUrl}/${import.meta.env.VITE_API_URL_SETTING}`, {
          userId: id
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        );

        if(insertSetting){
          const lastVisitedPath = localStorage.getItem("lastVisitedPath") || "/";
          localStorage.removeItem("lastVisitedPath");
          navigate(lastVisitedPath);
          notify();
          // navigate("/");
        }
      } else {
        console.error("Login failed: No token received");
      }
    } catch (error) {
      if(error.response?.data?.message == "setting already setup"){
        const lastVisitedPath = localStorage.getItem("lastVisitedPath") || "/";
        localStorage.removeItem("lastVisitedPath");
        navigate(lastVisitedPath);
        notify();
        // navigate("/");
      }else{
        const errorMessage = error.response?.data?.message || "Login failed";
        toast.warning(errorMessage);
        console.log(error.message);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    handleLoginRequest(email, password);
  };

  return (
    <>
      <form
        className="flex max-w-md flex-col gap-4 m-auto mt-48"
        onSubmit={handleLogin}
      >
        <div>
          <h1 className={`text-3xl font-bold text-center mb-4 dark:text-white ${i18n.language === "km" ? "font-kh_siemreap" : ""}`}>{t('login')}</h1>
          <div className={`mb-2 block ${i18n.language === "km" ? "font-kh_siemreap" : ""}`}>
            <Label htmlFor="email1" value={t('email')} />
          </div>
          <TextInput
            id="email1"
            type="email"
            placeholder="name@flowbite.com"
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
          <Checkbox id="remember" />
          <Label htmlFor="remember" className={i18n.language === "km" ? "font-kh_siemreap" : ""}>{t('remember_me')}</Label>
        </div>
        <Button type="submit" className={i18n.language === "km" ? "font-kh_siemreap" : ""}>{t('btn_login')}</Button>
        <div className="flex items-center gap-2">
          <Label htmlFor="agree" className={`flex ${i18n.language === "km" ? "font-kh_siemreap" : ""}`}>
            {t('no_have_account')} &nbsp;
            <Link
              to="/register"
              className="text-cyan-600 hover:underline dark:text-cyan-500"
            >
              {t('register')}
            </Link>
          </Label>
        </div>
      </form>
    </>
  );
};

export default Login;
