import React, { useState } from "react";
import { Button, Label, Modal, TextInput } from "flowbite-react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiSwitcher from "../../utils/apiSwitcher";
import { useTranslation } from "react-i18next";

const ModalAddExpense = ({
  showAddModal,
  setOpenAddModal,
  currencyCodeRef,
  reloadCurrencyList,
}) => {
  const { t, i18n } = useTranslation();
  const [code, setCurCode] = useState("");
  const [name, setCurName] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const serverUrl = await apiSwitcher.connectToServer();

    try {
      await axios.post(
        `${serverUrl}/${import.meta.env.VITE_API_URL_CURRENCY}`,
        { code, name, exchange_rate: exchangeRate, userId },
        {
          headers: {
            Authorization: token,
          }
        }
      );
      setCurCode("");
      setCurName("");
      toast.success(`Add ${name} successfully!`);
      reloadCurrencyList();
      setOpenAddModal(false);
    } catch (error) {
      toast.warning(`${error.response.data.message} !`);
    }
  };

  return (
    <>
      <Modal
        show={showAddModal}
        size="md"
        popup
        onClose={() => setOpenAddModal(false)}
        initialFocus={currencyCodeRef}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3
              className={`text-xl font-medium text-gray-900 dark:text-white text-center ${
                i18n.language === "km" ? "font-kh_siemreap" : ""
              }`}
            >
              {t("add_currency")}
            </h3>
            <div>
              <div
                className={`mb-2 block ${
                  i18n.language === "km" ? "font-kh_siemreap" : ""
                }`}
              >
                <Label htmlFor="cur_code" value={t("category_code")} />
              </div>
              <TextInput
                id="cur_code"
                required
                ref={currencyCodeRef}
                onChange={(e) => setCurCode(e.target.value)}
              />
            </div>
            <div>
              <div
                className={`mb-2 block ${
                  i18n.language === "km" ? "font-kh_siemreap" : ""
                }`}
              >
                <Label htmlFor="cur_name" value={t("name")} />
              </div>
              <TextInput
                id="cur_name"
                required
                onChange={(e) => setCurName(e.target.value)}
              />
            </div>

            <div>
              <div
                className={`mb-2 block ${
                  i18n.language === "km" ? "font-kh_siemreap" : ""
                }`}
              >
                <Label htmlFor="exchange_rate" value={t("exchange_rate")} />
              </div>
              <TextInput
                id="exchange_rate"
                required
                onChange={(e) => setExchangeRate(e.target.value)}
              />
            </div>

            <div
              className={`w-full ${
                i18n.language === "km" ? "font-kh_siemreap" : ""
              }`}
            >
              <Button onClick={handleSubmit}>{t("add")}</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ModalAddExpense;
