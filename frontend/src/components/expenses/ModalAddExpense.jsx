import React, { useEffect, useState } from "react";
import {
  Button,
  Select,
  Label,
  Modal,
  TextInput,
  Textarea,
  Datepicker,
} from "flowbite-react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";
import apiSwitcher from "../../utils/apiSwitcher";
import { useTranslation } from "react-i18next";

const ModalAddExpense = ({
  showAddModal,
  setOpenAddModal,
  expensesNameInputRef,
  reloadExpenseList,
}) => {
  const { t,i18n } = useTranslation();
  const [categoryExpenses, setCategoryExpenses] = useState([]);
  const [date, setDate] = useState(new Date());
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const userId = localStorage.getItem("userId");

  const getCategoryExpenses = async () => {
    const serverUrl = await apiSwitcher.connectToServer();

    try {
      const response = await axios.get(
        `${serverUrl}/${import.meta.env.VITE_API_URL_EXP_CAT}`,
        { params: { userId: userId } }
      );
      setCategoryExpenses(response.data.categories);
      if (response.data.categories.length > 1 && !category) {
        setCategory(response.data.categories[0]._id);
      }
    } catch (error) {
      toast.warning(`${error.response.data.message} !`);
    }
  };

  // start fetch category expense
  useEffect(() => {
    getCategoryExpenses();
  }, []);
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
      await axios.post(`${serverUrl}/${import.meta.env.VITE_API_URL_EXPENSE}`, {
        date,
        name,
        price,
        category,
        description,
        userId,
      });
      setName("");
      setPrice("");
      setCategory("");
      setDescription("");
      toast.success(`Add ${name} successfully!`);
      reloadExpenseList();
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
        initialFocus={expensesNameInputRef}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-4">
            <h3 className={`text-xl font-medium text-gray-900 dark:text-white text-center ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
              {t('add_expense')}
            </h3>
            <div>
              <div className={`mb-2 block ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
                <Label htmlFor="exp_date" value={t('date')} />
              </div>
              <Datepicker
                id="exp_date"
                required
                onChange={(date) => {
                  const formatData = format(new Date(date), "yyyy-MM-dd");
                  setDate(formatData);
                }}
              />
            </div>
            <div>
              <div className={`mb-2 block ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
                <Label htmlFor="exp_name" value={t('name')} />
              </div>
              <TextInput
                id="exp_name"
                ref={expensesNameInputRef}
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
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="select">Select Category</option>
                {categoryExpenses.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name} ( {category.code} )
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
                required
                rows={4}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className={`w-full mb-48 ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>
              <Button onClick={handleSubmit}>{t('add')}</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ModalAddExpense;
