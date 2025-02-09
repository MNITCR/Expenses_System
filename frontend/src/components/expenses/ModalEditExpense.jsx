import React, { useEffect, useState } from "react";
import {
  Button,
  Select,
  Label,
  Modal,
  TextInput,
  Textarea,
} from "flowbite-react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";
import apiSwitcher from "../../utils/apiSwitcher";
import { useTranslation } from "react-i18next";

const ModalEditExpense = ({
  showEditModal,
  setOpenEditModal,
  editId,
  reloadExpenseList,
}) => {
  const {t,i18n} = useTranslation();
  const [categoryExpenses, setCategoryExpenses] = useState([]);
  const [date_expense, setDate] = useState(new Date);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  const getCategoryExpenses = async () => {
    const serverUrl = await apiSwitcher.connectToServer();

    try {
      const response = await axios.get(
        `${serverUrl}/${import.meta.env.VITE_API_URL_EXP_CAT}`,
        {
          params: {
            userId: userId,
          },
          headers:{
          Authorization: token
        }
        }
      );
      setCategoryExpenses(response.data.categories);
    } catch (error) {
      toast.warning(`${error.response.data.message} !`);
    }
  };

  const getExpenses = async () => {
    const serverUrl = await apiSwitcher.connectToServer();

    try {
      const response = await axios.get(
        `${serverUrl}/${import.meta.env.VITE_API_URL_EXPENSE}/${editId}`,
        {headers:{
          Authorization: token
        }}
      );

      setDate(format(new Date(response.data.date), "yyyy-MM-dd"));
      setName(response.data.name);
      setPrice(response.data.price);
      setCategory(response.data.category);
      setDescription(response.data.description);
    } catch (error) {
      toast.warning(`${error.response.data.message} !`);
    }
  };

  // start fetch category expense
  useEffect(() => {
    getCategoryExpenses();
    if (editId && showEditModal) {
      getExpenses();
    }
  }, [editId, showEditModal]);
  // end fetch category expense

  const handleSubmit = async (e) => {
    e.preventDefault();
    const serverUrl = await apiSwitcher.connectToServer();
    if (!category) {
      toast.warning("Please select a category!");
      return;
    }

    if (!price || isNaN(price) || price <= 0) {
      toast.warning("Please enter a valid price!");
      return;
    }

    try {
      await axios.put(
        `${serverUrl}/${import.meta.env.VITE_API_URL_EXPENSE}/${editId}`,
        {
          date: format(new Date(date_expense), "yyyy-MM-dd"),
          name,
          price,
          category,
          description,
        },{headers:{
          Authorization: token
        }}
      );
      setDate("");
      setName("");
      setPrice("");
      setCategory("");
      setDescription("");
      toast.success(`Updated ${name} successfully!`);
      reloadExpenseList();
      setOpenEditModal(false);
    } catch (error) {
      console.log(error.message)
      // toast.warning(`${error.response.data.message} !`);
    }
  };

  return (
    <>
      <Modal
        show={showEditModal}
        size="md"
        popup
        onClose={() => setOpenEditModal(false)}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-4">
            <h3 className={`text-xl font-medium text-gray-900 dark:text-white text-center ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
              {t('edit_expense')}
            </h3>
            <div>
              <div className={`mb-2 block ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
                <Label htmlFor="exp_date" value={t('date')} />
              </div>
              <TextInput
                id="exp_date"
                value={date_expense}
                type="date"
                required
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <div className={`mb-2 block ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
                <Label htmlFor="exp_name" value={t('name')} />
              </div>
              <TextInput
                id="exp_name"
                value={name || ""}
                required
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <div className={`mb-2 block ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
                <Label htmlFor="cat_exp" value={t('category')} />
              </div>
              <Select
                id="cat_exp"
                required
                value={category || ""}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="select">Select Category</option>
                {categoryExpenses.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} ( {cat.code} )
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <div className={`mb-2 block ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
                <Label htmlFor="price" value={t('price')} />
              </div>
              <TextInput
                id="price"
                type="number"
                value={price || ""}
                required
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="max-w-md">
              <div className={`mb-2 block ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
                <Label htmlFor="comment" value={t('description')} />
              </div>
              <Textarea
                id="comment"
                placeholder="Leave a comment..."
                rows={4}
                value={description || ""}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className={`w-full ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
              <Button onClick={handleSubmit}>{t('edit')}</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ModalEditExpense;
