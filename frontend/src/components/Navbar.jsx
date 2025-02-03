import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Avatar, Dropdown, Navbar } from "flowbite-react";
import useSWR from 'swr';
import avatar from "../../src/assets/react.svg";
import { DarkThemeToggle } from "flowbite-react";
import { FaRegMoneyBillAlt } from 'react-icons/fa';
import { FiSettings } from "react-icons/fi";
import { MdCurrencyExchange  } from 'react-icons/md';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import apiSwitcher from "../utils/apiSwitcher";
import { useGlobalSetting } from '../context/GlobalContext';
import FlagOfCam from "../assets/FlagOfCam.png";
import Profile from "./user/Profile";


const fetcher = (url) => axios.get(url).then((res) => res.data);
const Nav = () => {
  const { currentFlag, changeLanguage } = useGlobalSetting();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
  });
  const { t, i18n } = useTranslation();

  const getUserInfo = async () => {
    const serverUrl = await apiSwitcher.connectToServer();
    try {
      const res = await axios.get(`${serverUrl}/api/auth/${userId}`);
      
      if(res){
        setUserInfo({
          name: res.data.name,
          email: res.data.email
        })
      }
    } catch (error) {
      toast.warning(error.message)
    }
  };

  useEffect(() => {
    getUserInfo()
  }, []);

  const handleLogout = () => {
    if(window.confirm("Are you sure you want to log out?")){
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenExpiration");
      localStorage.removeItem("userId");
      toast.success("Logged out successfully!");
      navigate("/login");
    }
  };

  // Function to handle flag change
  const handleChangeFlag = () => {
    if (currentFlag === FlagOfCam) {
      changeLanguage('en');
    } else {
      changeLanguage('km');
    }
  };

  const [openUserModal, setOpenUserModal] = useState(false);
  const handleOnClickEdit = () => {
    setOpenUserModal(true);
  };

  const isActive = ["/category_expense", "/currencies", "/system_settings"].includes(location.pathname);
  return (
    <>
      <style>
        {`
          #navbar_collapse_id ul {
            align-items: center;
          }
        `}
      </style>
      <Navbar fluid>
        <Navbar.Brand href="#">
          <img
            src={avatar}
            className="mr-3 h-6 sm:h-9"
            alt="Flowbite React Logo"
          />
          <span className={`self-center whitespace-nowrap text-xl font-semibold dark:text-white ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
            {t('expense_system')}
          </span>
        </Navbar.Brand>

        <Navbar.Collapse id="navbar_collapse_id">
          <Navbar.Link as={Link} to="/" active={location.pathname === "/"} className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{i18n.t('home')}</Navbar.Link>
          <Navbar.Link active={location.pathname === "/expense_report"} className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>
            <Dropdown arrowIcon={true} inline label={i18n.t('report')}>
              <Dropdown.Item as={Link} to="/expense_report" className={`${location.pathname === '/expense_report' ? 'text-cyan-700' : ''}`}><FaRegMoneyBillAlt className="mr-2 text-[16px]"/>{i18n.t('expense_report')}</Dropdown.Item>
            </Dropdown>
            <Navbar.Toggle />
          </Navbar.Link>
          <Navbar.Link active={isActive} className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>
            <Dropdown arrowIcon={true} inline label={i18n.t('setting')}>
              <Dropdown.Item as={Link} to="/system_settings" className={`${location.pathname === '/system_settings' ? 'text-cyan-700' : ''}`}><FiSettings className="mr-2"/>{i18n.t('system_setting')}</Dropdown.Item>
              <Dropdown.Item as={Link} to="/category_expense" className={`${location.pathname === '/category_expense' ? 'text-cyan-700' : ''}`}><FaRegMoneyBillAlt className="mr-2 text-[16px]"/>{i18n.t('category_expense')}</Dropdown.Item>
              <Dropdown.Item as={Link} to="/currencies" className={`${location.pathname === '/currencies' ? 'text-cyan-700' : ''}`}><MdCurrencyExchange className="mr-2"/>{i18n.t('currency')}</Dropdown.Item>
            </Dropdown>
            <Navbar.Toggle />
          </Navbar.Link>
          <Navbar.Link className="bg-none cursor-pointer" onClick={handleChangeFlag}>
            <img src={currentFlag} alt="Flag Cambodia" className="w-6"/>
          </Navbar.Link>
          <Navbar.Link>
            <DarkThemeToggle />
          </Navbar.Link>

          <Navbar.Link>
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar
                  alt="User settings"
                  img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                  rounded
                />
              }
            >
              <Dropdown.Header>
                <span className="block text-sm">{userInfo.name}</span>
                <span className="block truncate text-sm font-medium">
                  {userInfo.email}
                </span>
              </Dropdown.Header>
              <Dropdown.Item className={i18n.language === 'km' ? "font-kh_siemreap" : ""} onClick={handleOnClickEdit}>{t('profile')}</Dropdown.Item>
              {/* <Dropdown.Item>Settings</Dropdown.Item> */}
              <Dropdown.Divider />
              <Dropdown.Item className={i18n.language === 'km' ? "font-kh_siemreap" : ""} onClick={handleLogout}>{i18n.t('sign_out')}</Dropdown.Item>
            </Dropdown>
            <Navbar.Toggle />
          </Navbar.Link>

        </Navbar.Collapse>
      </Navbar>

      <Profile
        showUserModal={openUserModal}
        setOpenUserModal={setOpenUserModal}
      />
    </>
  );
};

export default Nav;
