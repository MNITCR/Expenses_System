import React, { useState, useRef, useEffect } from "react";
import { LineWave } from "react-loader-spinner";
import Paginations from "../components/Paginations";
import { FaRegEdit } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";
import { IoIosAddCircleOutline } from "react-icons/io";
import ModalAdd from "../components/expense_categorys/ModalAddExpenseCategory";
import ModalEdit from "../components/expense_categorys/ModalEditExpenseCategory";
import axios from "axios";
import { Button, Checkbox, Table, TextInput } from "flowbite-react";
import ModalDelete from "../components/ModalDelete";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiSwitcher from "../utils/apiSwitcher";
import { useTranslation } from "react-i18next";


const ExpenseCategoryList = () => {
  const {t, i18n} = useTranslation();
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem('userId');
  // start stat for pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [categoryExpenses, setCategoryExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = import.meta.env.VITE_LIMIT_PAGE;
  const onPageChange = (page) => {
    setCurrentPage(page);
  };
  // end stat for pagination

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);

  const getCategoryExpenses = async () => {
    setLoading(true);
    const serverUrl = await apiSwitcher.connectToServer();

    try {
      const response = await axios.get(`${serverUrl}/${import.meta.env.VITE_API_URL_EXP_CAT}`, {
        params: {
          page: currentPage,
          limit: limit,
          search: search,
          userId: userId
        },
      });

      setCategoryExpenses(response.data.categories);
      setTotalPages(Math.ceil(response.data.totalCount / limit));
      setCurrentPage(1);
    } catch (error) {
      toast.warning(`${error.response.data.message} !`);
    } finally {
      setLoading(false);
    }
  };

  // start stat add modal pop up
  const [openAddModal, setOpenAddModal] = useState(false);
  const handleOnClickAdd = () => {
    setOpenAddModal(true);
  };
  const catCodeRef = useRef(null);
  // end stat add modal pop up

  // start stat edit modal pop up
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleOnClickEdit = (id) => {
    setEditId(id);
    setOpenEditModal(true);
  };
  // end stat edit modal pop up

  // start fetch category expense
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    getCategoryExpenses();
  }, [currentPage, debouncedSearch]);
  // end fetch category expense

  // start reload fetch category expense
  const reloadCategoryList = () => {
    getCategoryExpenses();
  };
  // end reload fetch category expense

  // delete category expense
  const handleDelete = async () => {
    const serverUrl = await apiSwitcher.connectToServer();
    try {
      const response = await axios.delete(
        `${serverUrl}/${import.meta.env.VITE_API_URL_EXP_CAT}/${deleteCategoryId}`
      );

      if (response.status == 200) {
        toast.success(response.data.message);
        setShowDeleteConfirm(false);
        getCategoryExpenses();
      }

      if (categoryExpenses.length === 1 && currentPage === 2) {
        setCurrentPage(1);
      }
    } catch (error) {
      toast.warning(`${error.response.data.message} !`);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteCategoryId(null);
  };
  // end delete category expense

  return (
    <>
      <div className="overflow-x-auto">
        <div className="flex justify-end mb-5 gap-4 items-center">
          <TextInput
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            className={`w-[15rem] ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}
            placeholder={t('input_search')}
            sizing="sm"
          />
          <Button onClick={handleOnClickAdd} color="gray" size="sm">
            <IoIosAddCircleOutline className="text-lg text-emerald-400 font-bold" />
          </Button>
        </div>

        <Table hoverable className="mt-5 h-auto">
          <Table.Head>
            <Table.HeadCell className="p-4">
              <Checkbox />
            </Table.HeadCell>
            <Table.HeadCell className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{t('category_code')}</Table.HeadCell>
            <Table.HeadCell className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{t('category')}</Table.HeadCell>
            <Table.HeadCell className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{t('action')}</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {categoryExpenses.length === 0 ? (
              <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <Table.Cell
                  colSpan={4}
                  className="text-center font-bold text-red-400"
                >
                  {t('not_found')}
                </Table.Cell>
              </Table.Row>
            ) : (
              categoryExpenses.map((cat) => (
                <Table.Row
                  key={cat._id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="p-4">
                    <Checkbox value={cat._id} />
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {cat.code}
                  </Table.Cell>
                  <Table.Cell>{cat.name}</Table.Cell>
                  <Table.Cell colSpan={2}>
                    <div className="flex items-center">
                      <a
                        onClick={() => handleOnClickEdit(cat._id)}
                        title="Update"
                        href="#"
                        className="mr-2 font-medium text-cyan-600 hover:underline dark:text-cyan-500"
                      >
                        <i>
                          <FaRegEdit />
                        </i>
                      </a>
                      <a
                        onClick={() => {
                          setDeleteCategoryId(cat._id);
                          setShowDeleteConfirm(true);
                        }}
                        title="Deleted"
                        href="#"
                        className="text-[16px] text-red-600 hover:underline dark:text-red-500"
                      >
                        <i>
                          <AiOutlineDelete />
                        </i>
                      </a>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>

        <ModalAdd
          showAddModal={openAddModal}
          setOpenAddModal={setOpenAddModal}
          catCodeRef={catCodeRef}
          reloadCategoryList={reloadCategoryList}
        />
        <ModalEdit
          showEditModal={openEditModal}
          setOpenEditModal={setOpenEditModal}
          editId={editId}
          reloadCategoryList={reloadCategoryList}
        />

        <Paginations
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />

        <ModalDelete
          showDeleteConfirm={showDeleteConfirm}
          handleCancelDelete={handleCancelDelete}
          handleDelete={handleDelete}
        />

        {loading && (
          <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50">
            <LineWave
              visible={true}
              height="100"
              width="100"
              color="#4fa94d"
              ariaLabel="line-wave-loading"
              wrapperStyle={{}}
              wrapperClass=""
              firstLineColor=""
              middleLineColor=""
              lastLineColor=""
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ExpenseCategoryList;
