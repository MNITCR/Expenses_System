import React, { useEffect, useState } from "react";
import { Button, Label, Modal, TextInput } from "flowbite-react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiSwitcher from "../../utils/apiSwitcher";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Profile = ({showUserModal, setOpenUserModal}) => {
    const {t,i18n} = useTranslation();
  const userId = localStorage.getItem('userId');
  const [username, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const getUserInfo = async () => {
      const serverUrl = await apiSwitcher.connectToServer();
    try {
        const res = await axios.get(`${serverUrl}/${import.meta.env.VITE_API_URL_AUTH}/${userId}`);
        if(res.status === 200) {
            setName(res.data.name)
            setPassword("")
            setEmail(res.data.email)
        }
    } catch (error) {
        toast.warning(error.data.message);
    }
  }

  useEffect(() => {
    getUserInfo();
  },[]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const serverUrl = await apiSwitcher.connectToServer();

    try {
        const res = await axios.put(`${serverUrl}/${import.meta.env.VITE_API_URL_AUTH}/${userId}`, {
            username,
            password,
            email,
        });
        if(res.status === 200) {
            if(password !== undefined && password !== '') {
                localStorage.removeItem("authToken");
                localStorage.removeItem("tokenExpiration");
                localStorage.removeItem("userId");
                setName('');
                setPassword('');
                setEmail('');
                setOpenUserModal(false);
                navigate("/login");
            }
            setName('');
            setPassword('');
            setEmail('');
            toast.success(`Edit ${username} successfully!`);
            setOpenUserModal(false);
            getUserInfo();
        }
    } catch (error) {
      toast.warning(`${error}!`);
    }
  };

  return (
    <>
      <Modal
        show={showUserModal}
        size="md"
        popup
        onClose={() => setOpenUserModal(false)}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3
              className={`text-xl font-medium text-gray-900 dark:text-white text-center ${
                i18n.language === "km" ? "font-kh_siemreap" : ""
              }`}
            >
              {t("profile_info")}
            </h3>
            <div>
              <div
                className={`mb-2 block ${
                  i18n.language === "km" ? "font-kh_siemreap" : ""
                }`}
              >
                <Label htmlFor="user_name" value={t("username")} />
              </div>
              <TextInput
                id="user_name"
                value={username}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <div
                className={`mb-2 block ${
                  i18n.language === "km" ? "font-kh_siemreap" : ""
                }`}
              >
                <Label htmlFor="user_password" value={t("password")} />
              </div>
              <TextInput
                id="user_password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <div
                className={`mb-2 block ${
                  i18n.language === "km" ? "font-kh_siemreap" : ""
                }`}
              >
                <Label htmlFor="user_email" value={t("email")} />
              </div>
              <TextInput
                id="user_email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>


            <div
              className={`w-full ${
                i18n.language === "km" ? "font-kh_siemreap" : ""
              }`}
            >
              <Button onClick={handleSubmit}>{t("edit")}</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Profile;
