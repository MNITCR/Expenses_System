import React, { useState } from 'react'
import { Button, Label, Modal, TextInput } from "flowbite-react";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiSwitcher from '../../utils/apiSwitcher';
import { useTranslation } from 'react-i18next';

const ModalAddExpenseCategory = ({showAddModal,setOpenAddModal, catCodeRef, reloadCategoryList}) => {
  const {t,i18n} = useTranslation();
  const [code, setCatCode] = useState('');
  const [name, setCatName] = useState('');
  const userId = localStorage.getItem('userId');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const serverUrl = await apiSwitcher.connectToServer();
    try {
      await axios.post(`${serverUrl}/${import.meta.env.VITE_API_URL_EXP_CAT}`, { code, name, userId },{headers:{
          Authorization: token
      }});
      setCatCode('');
      setCatName('');
      toast.success(`Add ${name} successfully!`);
      reloadCategoryList();
      setOpenAddModal(false);
    } catch (error) {
      toast.warning(`${error.response.data.message} !`);
    }
  };

  return (
    <>
      <Modal show={showAddModal} size="md" popup onClose={() => setOpenAddModal(false)} initialFocus={catCodeRef}>
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className={`text-xl font-medium text-gray-900 dark:text-white text-center ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>{t('add_category_expense')}</h3>
            <div>
              <div className={`mb-2 block ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
                <Label htmlFor="cat_code" value={t('category_code')} />
              </div>
              <TextInput id="cat_code" ref={catCodeRef} required onChange={(e) => setCatCode(e.target.value)}/>
            </div>
            <div>
              <div className={`mb-2 block ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
                <Label htmlFor="cat_name" value={t("name")} />
              </div>
              <TextInput id="cat_name" required onChange={(e) => setCatName(e.target.value)}/>
            </div>

            <div className={`w-full ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
              <Button onClick={handleSubmit}>{t('add')}</Button>
            </div>

          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default ModalAddExpenseCategory
