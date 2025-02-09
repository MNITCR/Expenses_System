import React, { useState, useRef, useEffect } from "react";
import { LineWave } from "react-loader-spinner";
import { FaRegEdit } from "react-icons/fa";
import { AiOutlineDelete } from "react-icons/ai";
import { IoIosAddCircleOutline } from "react-icons/io";
import ModalAdd from "../components/currency/ModalAddCurrency";
import ModalEdit from "../components/currency/ModalEditCurrency";
import { Button, Checkbox, Table } from "flowbite-react";
import axios from "axios";
import ModalDelete from "../components/ModalDelete";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiSwitcher from "../utils/apiSwitcher";
import { useTranslation } from "react-i18next";

const CurrenciesList = () => {
  const { t, i18n } = useTranslation();
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCurrencyId, setDeleteCurrencyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  // start stat add modal pop up
  const [currencyList, setCurrencyList] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const handleOnClickAdd = () => {
    setOpenAddModal(true);
  };
  const currencyCodeRef = useRef(null);
  // end stat add modal pop up

  // start stat edit modal pop up
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const handleOnClickEdit = (id) => {
    setEditId(id);
    setOpenEditModal(true);
  };
  // end stat edit modal pop up

  // start get currency
  const getCurrencyList = async () => {
    setLoading(true);
    const serverUrl = await apiSwitcher.connectToServer();
    try {
      const response = await axios.get(
        `${serverUrl}/${import.meta.env.VITE_API_URL_CURRENCY}`,
        {
          params: {
            userId: userId,
          },
          headers: {
            Authorization: token,
          },
        }
      );
      setCurrencyList(response.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrencyList();
  }, []);
  // end get currency

  // start reload fetch currency expense
  const reloadCurrencyList = () => {
    getCurrencyList();
  };
  // end reload fetch currency expense

  // delete currency
  const handleDelete = async () => {
    const serverUrl = await apiSwitcher.connectToServer();

    try {
      const response = await axios.delete(
        `${serverUrl}/${
          import.meta.env.VITE_API_URL_CURRENCY
        }/${deleteCurrencyId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.status == 200) {
        toast.success(response.data.message);
        setShowDeleteConfirm(false);
        getCurrencyList();
      }
    } catch (error) {
      toast.warning(error.response.data.message);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteCurrencyId(null);
  };
  // end delete currency

  return (
    <>
      <div className="overflow-x-auto">
        <div className="flex justify-end mb-5">
          <Button onClick={handleOnClickAdd} color="light" size="sm">
            <IoIosAddCircleOutline className="text-lg text-emerald-400 font-bold" />
          </Button>
        </div>

        <Table hoverable className="mt-5 h-auto">
          <Table.Head>
            <Table.HeadCell className="p-4">
              <Checkbox />
            </Table.HeadCell>
            <Table.HeadCell
              className={i18n.language === "km" ? "font-kh_siemreap" : ""}
            >
              {t("category_code")}
            </Table.HeadCell>
            <Table.HeadCell
              className={i18n.language === "km" ? "font-kh_siemreap" : ""}
            >
              {t("name")}
            </Table.HeadCell>
            <Table.HeadCell
              className={i18n.language === "km" ? "font-kh_siemreap" : ""}
            >
              {t("exchange_rate")}
            </Table.HeadCell>
            <Table.HeadCell
              className={i18n.language === "km" ? "font-kh_siemreap" : ""}
            >
              {t("action")}
            </Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {currencyList.length === 0 ? (
              <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <Table.Cell
                  colSpan={5}
                  className="text-center font-bold text-red-400"
                >
                  Not Found
                </Table.Cell>
              </Table.Row>
            ) : (
              currencyList.map((currency, i) => (
                <Table.Row
                  key={i}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="p-4">
                    <Checkbox />
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {currency.code}
                  </Table.Cell>
                  <Table.Cell>{currency.name}</Table.Cell>
                  <Table.Cell>{currency.exchange_rate}</Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center">
                      <a
                        onClick={() => handleOnClickEdit(currency._id)}
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
                          setDeleteCurrencyId(currency._id);
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
          currencyCodeRef={currencyCodeRef}
          reloadCurrencyList={reloadCurrencyList}
        />
        <ModalEdit
          showEditModal={openEditModal}
          setOpenEditModal={setOpenEditModal}
          editId={editId}
          reloadCurrencyList={reloadCurrencyList}
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

export default CurrenciesList;
