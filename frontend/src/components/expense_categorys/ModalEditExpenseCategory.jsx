import React, { useState, useEffect } from 'react';
import { Button, Label, Modal, TextInput } from "flowbite-react";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiSwitcher from '../../utils/apiSwitcher';
import { useTranslation } from 'react-i18next';


const ModalEditExpenseCategory = ({ showEditModal, setOpenEditModal, editId ,reloadCategoryList}) => {
  const {t,i18n} = useTranslation();
  const [code, setCatCode] = useState('');
  const [name, setCatName] = useState('');

  const getCategoryExpensesByID = async () => {
    const serverUrl = await apiSwitcher.connectToServer();

    try {
      const response = await axios.get(`${serverUrl}/${import.meta.env.VITE_API_URL_EXP_CAT}/${editId}`);
      setCatCode(response.data.code);
      setCatName(response.data.name);
    } catch (error) {
      console.error('Error fetching category expense', error);
    }
  };

  useEffect(() => {
    if (editId !== null && showEditModal) {
      getCategoryExpensesByID();
    }
  }, [editId,showEditModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const serverUrl = await apiSwitcher.connectToServer();

    try {
      await axios.put(`${serverUrl}/${import.meta.env.VITE_API_URL_EXP_CAT}/${editId}`, { code, name });
      setCatCode('');
      setCatName('');
      toast.success(`Updated ${name} successfully!`);
      reloadCategoryList();
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
          <h3 className={`text-xl font-medium text-gray-900 dark:text-white text-center ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>{t('edit_category_expense')}</h3>
          <TextInput id="cat_id" type="hidden" value={editId ? editId : ''} />
          <div>
            <div className={`mb-2 block ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
              <Label htmlFor="cat_code" value={t('category_code')} />
            </div>
            <TextInput
              id="cat_code"
              required
              value={code || ''}
              onChange={(e) => setCatCode(e.target.value)}
            />
          </div>
          <div>
            <div className={`mb-2 block ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
              <Label htmlFor="cat_name" value={t('name')} />
            </div>
            <TextInput
              id="cat_name"
              required
              value={name || ''}
              onChange={(e) => setCatName(e.target.value)}
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

export default ModalEditExpenseCategory;
