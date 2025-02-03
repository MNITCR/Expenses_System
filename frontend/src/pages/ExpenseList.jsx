import React, { useState, useRef, useEffect } from "react";
import { LineWave } from "react-loader-spinner";
import Paginations from "../components/Paginations";
import Dropdowns from "../components/Dropdowns";
import { format } from "date-fns";
import ModalUploadExpense from "../components/expenses/ModalUploadExpense";
import ModalAdd from "../components/expenses/ModalAddExpense";
import ModalEdit from "../components/expenses/ModalEditExpense";
import { Checkbox, Dropdown, Table, TextInput } from "flowbite-react";
import axios from "axios";
import ModalDelete from "../components/ModalDelete";
import { TfiMenuAlt } from "react-icons/tfi";
import { FaRegEdit } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";
import { GrAdd } from "react-icons/gr";
import { ImFolderUpload } from "react-icons/im";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import apiSwitcher from "../utils/apiSwitcher";
import { formatMoney } from '../utils/Site';
import { useGlobalSetting } from "../context/GlobalContext";
import { useTranslation } from "react-i18next";

const ExpenseList = () => {
  const { t,i18n } = useTranslation()
  const { globalSetting, setGlobalSetting } = useGlobalSetting();
  const [expenseList, setExpenseList] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");

  // start stat for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = import.meta.env.VITE_LIMIT_PAGE;
  const onPageChange = (page) => {
    setCurrentPage(page);
  };
  // end stat for pagination

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState(null);

  // start stat for dropdowns filter date
  const [selectedOption, setSelectedOption] = useState("All Day");
  const handleOptionChange = (newOption) => {
    setSelectedOption(newOption);
  };
  // end stat for dropdowns filter date

  // start stat add modal pop up
  const [openAddModal, setOpenAddModal] = useState(false);
  const handleOnClickAdd = () => {
    setOpenAddModal(true);
  };
  const expensesNameInputRef = useRef(null);
  // end state add modal pop up

  // start state edit modal pop up
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const handleOnClickEdit = (id) => {
    setEditId(id);
    setOpenEditModal(true);
  };
  // end state edit modal pop up

  // start get expense
  const getExpenseLists = async () => {
    setLoading(true);

    const serverUrl = await apiSwitcher.connectToServer();
    try {
      const response = await axios.get(
        `${serverUrl}/${import.meta.env.VITE_API_URL_EXPENSE}`,
        {
          params: {
            page: currentPage,
            limit: limit,
            search: search,
            filterDate: selectedOption,
            userId: userId,
          },
        }
      );
      setExpenseList(response.data.exp);
      setTotalPages(Math.ceil(response.data.totalCount / limit));
    } catch (error) {
      console.error("Error fetching categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    getExpenseLists();
  }, [currentPage, selectedOption, debouncedSearch]);
  // end get expense

  // start reload fetch expense
  const reloadExpenseList = () => {
    getExpenseLists();
  };
  // end reload fetch expense

  // delete category expense
  const handleDelete = async () => {
    const serverUrl = await apiSwitcher.connectToServer();
    try {
      const response = await axios.delete(
        `${serverUrl}/${
          import.meta.env.VITE_API_URL_EXPENSE
        }/${deleteExpenseId}`
      );

      if (response.status == 200) {
        toast.success(response.data.message);
        setShowDeleteConfirm(false);
        getExpenseLists();
      }

      if (expenseList.length === 1 && currentPage === 2) {
        setCurrentPage(1);
      }
    } catch (error) {
      toast.warning(`${error.response.data.message} !`);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteExpenseId(null);
  };
  // end delete category expense

  // start modal upload
  const [openModalUpload, setOpenModalUpload] = useState(false);
  const handleOnClickUpload = () => {
    setOpenModalUpload(true);
  };
  // end modal upload

  // get setting
  const [formatDate, setFormatDate] = useState("yyyy-MM-dd");
  const [currencySymbol, setCurrencySymbol] = useState("USD");

  useEffect(() => {
    const fetchData = async () => {
      const serverUrl = await apiSwitcher.connectToServer();
      try {
        const response = await axios.get(
          `${serverUrl}/${import.meta.env.VITE_API_URL_SETTING}`,
          {
            params: {
              userId: userId,
            },
          }
        );

        if (
          response.status === 200 &&
          response.data &&
          response.data.length > 0
        ) {
          setGlobalSetting(response.data[0]);
        }
      } catch (error) {
        toast.warning(`${error.message}!`);
      }
    };

    fetchData();
  }, [setGlobalSetting]);

  useEffect(() => {
    if (globalSetting && globalSetting.date_format) {
      switch(globalSetting.date_format){
        case 1:
          setFormatDate("yyyy-MM-dd");
        break;
        case 2:
          setFormatDate("yyyy/MM/dd");
        break;
        case 3:
          setFormatDate("yyyy.MM.dd");
        break;
        case 4:
          setFormatDate("dd-MM-yyyy");
        break;
        case 5:
          setFormatDate("dd/MM/yyyy");
        break;
        case 6:
          setFormatDate("dd.MM.yyyy");
        break;
        default:
          setFormatDate("yyyy-MM-dd");
        break;
      }
    }

    if (globalSetting && globalSetting.currency){
      switch(globalSetting.currency){
        case 1:
          setCurrencySymbol("USD");
        break;
        case 2:
          setCurrencySymbol("KHR");
        break;
        default:
          setCurrencySymbol("USD");
        break;
      }
    };
  });

  return (
    <>
      <div className="overflow-x-auto relative">
        <div className="flex justify-between">
          <Dropdowns
            options={[
              { value: "All Day", label: t('all_day')},
              { value: "Last Day", label: t('last_day')},
              { value: "Last 7 Days", label: t('last_7_day') },
              { value: "Last 15 Days", label: t('last_15_day') },
              { value: "Last 30 Days", label: t('last_30_day') },
              { value: "Last Year", label: t('last_year') },
            ]}
            label={selectedOption}
            onChange={handleOptionChange}
            selectedOption={selectedOption}
          />
          <div className="flex gap-4 items-center">
            <TextInput
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              type="search"
              sizing="sm"
              className={`w-[15rem] ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}
              placeholder={t('input_search')}
            />

            <Dropdown
              dismissOnClick={false}
              label=<TfiMenuAlt className="bold text-lg text-gray-500" />
              color="gray"
              size="sm"
              arrowIcon={false}
            >
              <Dropdown.Item as={Link} href="#" onClick={handleOnClickAdd} className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>
                <GrAdd className="text-xl text-emerald-400 font-bold mr-2" />{" "}
                {t('add_expense')}
              </Dropdown.Item>
              <Dropdown.Item as={Link} href="#" onClick={handleOnClickUpload} className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>
                <ImFolderUpload className="text-lg text-emerald-400 font-bold mr-2" />{" "}
                {t('upload_export')}
              </Dropdown.Item>
            </Dropdown>
          </div>
        </div>

        <Table hoverable className="mt-5 h-auto">
          <Table.Head>
            <Table.HeadCell className="p-4">
              <Checkbox />
            </Table.HeadCell>
            <Table.HeadCell>
              <span className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{t('no')}</span>
            </Table.HeadCell>
            <Table.HeadCell className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{t('date')}</Table.HeadCell>
            <Table.HeadCell className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{t('name')}</Table.HeadCell>
            <Table.HeadCell className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{t('price')}</Table.HeadCell>
            <Table.HeadCell className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{t('category')}</Table.HeadCell>
            <Table.HeadCell className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{t('description')}</Table.HeadCell>
            <Table.HeadCell className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{t('action')}</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {expenseList.length === 0 ? (
              <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <Table.Cell
                  colSpan={8}
                  className={`text-center font-bold text-red-400 ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}
                >
                  {t('not_found')}
                </Table.Cell>
              </Table.Row>
            ) : (
              expenseList.map((expense, i) => (
                <Table.Row
                  key={i}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="p-4">
                    <Checkbox value={expense._id} />
                  </Table.Cell>
                  <Table.Cell>
                    {i + 1 + (currentPage - 1) * limit}
                  </Table.Cell>
                  <Table.Cell>
                    {expense.date
                      ? format(new Date(expense.date), formatDate)
                      : "N/A"}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {expense.name}
                  </Table.Cell>
                  <Table.Cell>{formatMoney(Number(expense.price), currencySymbol, globalSetting.decimals, globalSetting.ds_separator, globalSetting.ths_separator, globalSetting.dsc_symbol)}</Table.Cell>
                  <Table.Cell>
                    {expense.category ? expense.category.name : ""}
                  </Table.Cell>
                  <Table.Cell>{expense.description || "N/A"}</Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center">
                      <a
                        onClick={() => handleOnClickEdit(expense._id)}
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
                          setDeleteExpenseId(expense._id);
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
          expensesNameInputRef={expensesNameInputRef}
          reloadExpenseList={reloadExpenseList}
        />
        <ModalEdit
          showEditModal={openEditModal}
          setOpenEditModal={setOpenEditModal}
          editId={editId}
          reloadExpenseList={reloadExpenseList}
        />
        <ModalUploadExpense
          openModalUpload={openModalUpload}
          setOpenModalUpload={setOpenModalUpload}
          reloadExpenseList={reloadExpenseList}
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

export default ExpenseList;
