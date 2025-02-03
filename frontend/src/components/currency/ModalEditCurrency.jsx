import React, { useState, useEffect } from 'react';
import { Button, Label, Modal, TextInput } from "flowbite-react";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiSwitcher from '../../utils/apiSwitcher';
import { useTranslation } from 'react-i18next';

const ModalEditExpense = ({ showEditModal, setOpenEditModal, editId ,reloadCurrencyList}) => {
  const {t,i18n} = useTranslation()
  const [code, setCurCode] = useState('');
  const [name, setCurName] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');

  const getCurrencyByID = async () => {
    const serverUrl = await apiSwitcher.connectToServer();

    try {
      const response = await axios.get(`${serverUrl}/${import.meta.env.VITE_API_URL_CURRENCY}/${editId}`);
      setCurCode(response.data.code);
      setCurName(response.data.name);
      setExchangeRate(response.data.exchange_rate);
    } catch (error) {
      toast.warning(`${error.response.data.message} !`);
    }
  };

  useEffect(() => {
    if (editId !== null && showEditModal) {
      getCurrencyByID();
    }
  }, [editId,showEditModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const serverUrl = await apiSwitcher.connectToServer();

    try {
      await axios.put(`${serverUrl}/${import.meta.env.VITE_API_URL_CURRENCY}/${editId}`, { code, name, exchange_rate: exchangeRate });
      setCurCode('');
      setCurName('');
      setExchangeRate('');
      toast.success(`Updated ${name} successfully!`);
      reloadCurrencyList();
      setOpenEditModal(false);
    } catch (error) {
      toast.warning(`${error.response.data.message} !`);
    }
  };

  return (
    <Modal show={showEditModal} size="md" popup onClose={() => setOpenEditModal(false)}>
      <Modal.Header />
      <Modal.Body>
        <div className="space-y-6">
          <h3 className={`text-xl font-medium text-gray-900 dark:text-white text-center ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>{t('edit_currency')}</h3>
          <div>
            <div className={`mb-2 block ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
              <Label htmlFor="cur_code" value={t('category_code')} />
            </div>
            <TextInput
              id="cur_code"
              required
              value={code || ''}
              onChange={(e) => setCurCode(e.target.value)}
            />
          </div>
          <div>
            <div className={`mb-2 block ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
              <Label htmlFor="cur_name" value={t('name')} />
            </div>
            <TextInput
              id="cur_name"
              required
              value={name || ''}
              onChange={(e) => setCurName(e.target.value)}
            />
          </div>

          <div>
            <div className={`mb-2 block ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
              <Label htmlFor="exchange_rate" value={t('exchange_rate')} />
            </div>
            <TextInput
              id="exchange_rate"
              required
              value={exchangeRate || ''}
              onChange={(e) => setExchangeRate(e.target.value)}
            />
          </div>

          <div className={`w-full ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
            <Button onClick={handleSubmit}>{t('edit')}</Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalEditExpense;
