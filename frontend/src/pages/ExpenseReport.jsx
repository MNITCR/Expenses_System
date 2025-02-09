import React, { useEffect, useState } from "react";
import { LineWave } from "react-loader-spinner";
import {
  Checkbox,
  Datepicker,
  Dropdown,
  Label,
  Select,
  Table,
  TextInput,
} from "flowbite-react";
import Paginations from "../components/Paginations";
import { TfiMenuAlt } from "react-icons/tfi";
import { FaCaretUp, FaCaretDown, FaFileExcel, FaFilePdf } from "react-icons/fa";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";
import ExcelJS from "exceljs";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import { formatMoney } from '../utils/Site';
import { useGlobalSetting } from "../context/GlobalContext";
import apiSwitcher from "../utils/apiSwitcher";
import { useTranslation } from "react-i18next";

const ExpenseReport = () => {
  const { t,i18n } = useTranslation();
  const { globalSetting, setGlobalSetting } = useGlobalSetting();
  const [categoryExpenses, setCategoryExpenses] = useState([]);
  const [category, setCategory] = useState();
  const [expenseList, setExpenseList] = useState([]);
  const [expenseAll, setExpenseAll] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");
  const [searchParams, setSearchParams] = useState({
    date: "",
    name: "",
    description: "",
  });

  // get setting
  const [formatDate, setFormatDate] = useState("yyyy-MM-dd");
  const [currencySymbol, setCurrencySymbol] = useState("USD");
  const [currencyCode, setCurrencyCode] = useState("$");

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
            headers:{
              Authorization: token
            }
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
          setCurrencyCode("$");
        break;
        case 2:
          setCurrencySymbol("KHR");
          setCurrencyCode("៛");
        break;
        default:
          setCurrencySymbol("USD");
          setCurrencyCode("$");
        break;
      }
    };
  });

  // open form search
  const [formSearch, setFormsSearch] = useState(false);
  const showFormSearch = (opt) => {
    setFormsSearch(opt);
  };
  // end form search

  // start stat for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = import.meta.env.VITE_LIMIT_PAGE;
  const onPageChange = (page) => {
    setCurrentPage(page);
  };
  // end stat for pagination

  const getCategoryExpenses = async () => {
    try {
      const serverUrl = await apiSwitcher.connectToServer();
      const response = await axios.get(
        `${serverUrl}/${import.meta.env.VITE_API_URL_EXP_CAT}`,{
          params: {
            userId: userId
          },
          headers:{
            Authorization: token
          }
        }
      );
      setCategoryExpenses(response.data.categories);
      // if (response.data.categories.length > 1 && !category) {
      //   setCategory(response.data.categories[0]._id);
      // }
    } catch (error) {
      toast.warning(`${error.response.data.message} !`);
    }
  };

  // start fetch category expense
  useEffect(() => {
    getCategoryExpenses();
  }, []);
  // end fetch category expense

  // start get expense
  const getAllExpenseAction = async () => {
    try {
      const params = {
        search: search,
        userId: userId,
        categoryId: category == "select" ? "" : category,
        startDate: startDate,
        endDate: endDate,
      };
      const serverUrl = await apiSwitcher.connectToServer();
      const response = await axios.get(
        `${serverUrl}${import.meta.env.VITE_API_URL_REPORTS}/expense_action`,
        { params,
        headers:{
          Authorization: token
        }}
      );

      setExpenseAll(response.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const getExpenseLists = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: limit,
        search: search,
        userId: userId,
        categoryId: category == "select" ? "" : category,
        startDate: startDate,
        endDate: endDate,
      };
      const serverUrl = await apiSwitcher.connectToServer();
      const response = await axios.get(
        `${serverUrl}${import.meta.env.VITE_API_URL_REPORTS}`,
        { params,
          headers:{
            Authorization: token
          }
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
    getAllExpenseAction();
  }, [currentPage, debouncedSearch]);
  // end get expense

  // start filter with date
  const handleStartDateChange = (date) => {
    const formattedDate = format(new Date(date), "yyyy-MM-dd");
    setStartDate(formattedDate);
  };

  // Handle date change (for end date)
  const handleEndDateChange = (date) => {
    const formattedDate = format(new Date(date), "yyyy-MM-dd");
    setEndDate(formattedDate);
  };

  const reloadExpenseList = () => {
    getExpenseLists();
    getAllExpenseAction();
  };
  const filterExpenseList = () => {
    setFormsSearch(false);
    reloadExpenseList();
  };

  // Define the document structure using React PDF components
  Font.register({
    family: "KhmerOS",
    src: "/fonts/Siemreap-Regular.ttf",
  });

  const styles = StyleSheet.create({
    page: {
      padding: 20,
    },
    header: {
      marginBottom: 12,
      textAlign: "center",
    },
    title: {
      fontSize: 15,
      fontFamily: "KhmerOS",
      fontWeight: "bold",
    },
    table: {
      marginTop: 5,
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#000",
      width: "100%",
    },
    row: {
      flexDirection: "row",
      borderBottomWidth: 1,
    },
    cell: {
      flex: 1,
      padding: 2,
      textAlign: "center",
      fontFamily: "KhmerOS",
      fontSize: 11,
    },
    footer: {
      marginTop: 20,
      textAlign: "right",
      fontSize: 12,
      fontFamily: "KhmerOS",
      fontWeight: "bold",
    },
  });

  const totalPricePDF = expenseAll.reduce((total, expense) => total + expense.price, 0);
  const MyDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {t('from_date')}: {format(new Date(startDate), formatDate)} {t('to_date')} {format(new Date(endDate), formatDate)}
          </Text>
        </View>

        {/* table */}
        <View style={styles.table}>
          {/* thead */}
          <View style={styles.row}>
            <Text style={styles.cell}>{t('no')}</Text>
            <Text style={styles.cell}>{t('date')}</Text>
            <Text style={styles.cell}>{t('name')}</Text>
            <Text style={styles.cell}>{t('price')}</Text>
            <Text style={styles.cell}>{t('category')}</Text>
            <Text style={styles.cell}>{t('description')}</Text>
          </View>

          {/* body */}
          {expenseAll.map((expense, index) => (
            <View style={[styles.row, index === expenseAll.length - 1 && { borderBottomWidth: 0 }]} key={index}>
              <Text style={styles.cell}>{index+1}</Text>
              <Text style={styles.cell}>
                {expense.date
                  ? format(new Date(expense.date), formatDate)
                  : "N/A"}
              </Text>
              <Text style={styles.cell}>{expense.name || "N/A"}</Text>
              <Text style={styles.cell}>{expense.price +" "+currencyCode || "N/A"}</Text>
              <Text style={styles.cell}>
                {expense.category ? expense.category.name : "N/A"}
              </Text>
              <Text style={styles.cell}>{expense.description || "N/A"}</Text>
            </View>
          ))}
        </View>

        {/* footer */}
        <View style={styles.footer}>
          <Text>{t("total")}: {totalPricePDF} {currencyCode}</Text>
        </View>
      </Page>
    </Document>
  );

  const expense_action = async (isExcel, isPDF) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Expenses");

    const headerText = `${t('from_date')} ${format(new Date(startDate), formatDate)} ${t('to_date')} ${format(new Date(endDate), formatDate)}`;
    worksheet.mergeCells("A1:F1");
    worksheet.getCell("A1").value = headerText;
    worksheet.getCell("A1").alignment = { horizontal: "center" };
    worksheet.getCell("A1").font = { name: "Khmer OS Siemreap", size: 12 };

    const tableHeaders = [`${t('no')}`,`${t('date')}`, `${t('name')}`, `${t('price')}`, `${t('category')}`, `${t('description')}`];
    tableHeaders.forEach((header, index) => {
      worksheet.getCell(2, index + 1).value = header;
      worksheet.getCell(2, index + 1).alignment = { horizontal: "center" };
      worksheet.getCell(2, index + 1).font = {
        name: "Khmer OS Siemreap",
        size: 11,
      };
      worksheet.getCell(2, index + 1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "D2DBE6" },
      };
    });

    // Format the expense data and add to the worksheet
    var row = 3;
    var totalPrice = 0;
    expenseAll.forEach((expense, index) => {
      worksheet.getCell(row, 1).value = index+1;
      worksheet.getCell(row, 2).value = expense.date
        ? format(new Date(expense.date), formatDate)
        : "N/A";
      worksheet.getCell(row, 3).value = expense.name;
      worksheet.getCell(row, 4).value = expense.price +" "+ currencyCode;
      worksheet.getCell(row, 5).value = expense.category
        ? expense.category.name
        : "N/A";
      worksheet.getCell(row, 6).value = expense.description || "N/A";
      for (let col = 1; col <= 6; col++) {
        worksheet.getCell(row, col).font = {
          name: "Khmer OS Siemreap",
          size: 11,
        };
      }
      row++;
      totalPrice += expense.price;
    });

    // Footer
    worksheet.getCell(row, 3).value = t('total') +" "+ currencySymbol;
    worksheet.getCell(row, 4).value = totalPrice +" "+ currencyCode;
    worksheet.getCell(row, 3).font = {
      name: "Khmer OS Siemreap",
      size: 11,
      bold: false,
    };
    worksheet.getCell(row, 4).font = {
      name: "Khmer OS Siemreap",
      size: 11,
      bold: false,
    };

    // Apply borders to all cells in the worksheet
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Auto-adjust column widths
    worksheet.columns = [
      { key: "A", width: 10 },
      { key: "B", width: 15 },
      { key: "C", width: 25 },
      { key: "D", width: 10 },
      { key: "E", width: 20 },
      { key: "F", width: 30 },
    ];

    // Generate and download the Excel file
    if (isExcel) {
      if (!expenseAll || expenseAll.length === 0) {
        return toast.error(`No expense data available!`);
      }
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `expense_report_${startDate}.xlsx`;
        link.click();
      });
    }

    if (isPDF) {
      if (!expenseAll || expenseAll.length === 0) {
        toast.error("No expense data available!");
        return null;
      }
      const blob = await pdf(<MyDocument />).toBlob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `expense_report_${startDate}.pdf`;
      link.click();
    }
  };

  // Update searchParams state when input fields change
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearch(value);
    setSearchParams(prevParams => ({
      ...prevParams,
      [name]: value,
    }));
    getExpenseLists();
  };

  const totalPrice = expenseList.reduce(
    (acc, expense) => acc + expense.price,
    0
  );

  return (
    <>
      <div className="overflow-x-auto relative">
        <div className="flex justify-end">
          <div className="flex gap-3 items-center">
            <TextInput
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              type="search"
              className={`w-[15rem] ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}
              placeholder={t('input_search')}
              sizing="sm"
            />

            <button
              className="border-[1.5px] border-gray-200 dark:border-gray-600 p-2 rounded-md active:bg-gray-100 dark:active:border-white dark:active:bg-gray-700 transition-all"
              onClick={() => showFormSearch(true)}
            >
              <FaCaretDown className="text-gray-500" />
            </button>
            <button
              className="border-[1.5px] border-gray-200 dark:border-gray-600 p-2 rounded-md active:bg-gray-100 dark:active:border-white dark:active:bg-gray-700 transition-all"
              onClick={() => showFormSearch(false)}
            >
              <FaCaretUp className="text-gray-500" />
            </button>

            <Dropdown
              size="sm"
              dismissOnClick={false}
              label=<TfiMenuAlt className="bold text-lg text-gray-600" />
              color="gray"
              arrowIcon={false}
            >
              <Dropdown.Item
                as={Link}
                href="#"
                onClick={() => expense_action("excel", 0)}
                className={i18n.language === 'km' ? "font-kh_siemreap" : ""}
              >
                <FaFileExcel className="text-lg text-emerald-500 font-bold mr-2" />{" "}
                {t('export_excel')}
              </Dropdown.Item>
              <Dropdown.Item
                as={Link}
                href="#"
                onClick={() => expense_action(0, "pdf")}
                className={i18n.language === 'km' ? "font-kh_siemreap" : ""}
              >
                <FaFilePdf className="text-[18.8px] text-emerald-500 font-bold mr-2" />{" "}
                {t('export_pdf')}
              </Dropdown.Item>
            </Dropdown>
          </div>
        </div>

        <div
          className={`rounded-md mt-4 border-[1.5px] dark:border-gray-600 p-4 transition-all duration-300 ease-in-out ${
            formSearch ? "" : "hidden"
          }`}
        >
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="mb-2 bloc">
                <Label
                  className={`dark:text-gray-400 ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}
                  htmlFor="cat_exp"
                  value={t('category')}
                />
              </div>
              <Select
                id="cat_exp"
                required
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="select">Select category</option>
                {categoryExpenses.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name} ( {category.code} )
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <div className="mb-2 block">
                <Label
                  className={`dark:text-gray-400 ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}
                  htmlFor="start_date"
                  value={t('start_date')}
                />
              </div>
              <Datepicker autoHide={false} onChange={handleStartDateChange} />
            </div>

            <div>
              <div className="mb-2 block">
                <Label
                  className={`dark:text-gray-400 ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}
                  htmlFor="end_date"
                  value={t('end_date')}
                />
              </div>
              <Datepicker autoHide={false} onChange={handleEndDateChange} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              className={`${i18n.language === 'km' ? "font-kh_siemreap" : ""} border-[1.5px] dark:bg-slate-800 dark:border-gray-500 dark:text-white border-cyan-400 px-10 py-1 rounded-md active:bg-cyan-100 transition-all bg-cyan-50 text-gray-700}`}
              onClick={() => filterExpenseList()}
            >
              {t('search')}
            </button>
          </div>
        </div>

        <Table hoverable className="mt-5 h-auto text-center">
          <Table.Head>
            <Table.HeadCell className="p-4">
              <Checkbox />
            </Table.HeadCell>
            <Table.HeadCell className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{t('no')}</Table.HeadCell>
            <Table.HeadCell className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{t('date')}</Table.HeadCell>
            <Table.HeadCell className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{t('name')}</Table.HeadCell>
            <Table.HeadCell className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{t('price')}</Table.HeadCell>
            <Table.HeadCell className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{t('category')}</Table.HeadCell>
            <Table.HeadCell className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{t('description')}</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {expenseList.length === 0 ? (
              <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <Table.Cell
                  colSpan={7}
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
                </Table.Row>
              ))
            )}
          </Table.Body>
          {/* <Table.Head className={`${expenseList.length ? "" : "hidden"}`}> */}
          <Table.Head>
            <Table.HeadCell className="p-4">
              <Checkbox />
            </Table.HeadCell>
            <Table.HeadCell>
              <span className={`text-gray-600 ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>{t('no')}</span>
            </Table.HeadCell>
            <Table.HeadCell>
              <input
                type="search"
                name="date"
                value={searchParams.date}
                onChange={handleSearchChange}
                className="p-0 dark:bg-gray-700 font-normal focus:border-none border-gray-200 dark:border-gray-600 focus:ring-1 dark:focus:ring-gray-400 focus:ring-gray-300 focus:outline-none text-center"
                placeholder="YYYY-MM-DD"
              />
            </Table.HeadCell>
            <Table.HeadCell>
              <input
                type="search"
                name="name"
                value={searchParams.name}
                onChange={handleSearchChange}
                className={`p-0 dark:bg-gray-700 font-normal focus:border-none border-gray-200 dark:border-gray-600 focus:ring-1 dark:focus:ring-gray-400 focus:ring-gray-300 focus:outline-none text-center ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}
                placeholder={t('name')}
              />
            </Table.HeadCell>
            <Table.HeadCell className={i18n.language === 'km' ? "font-kh_siemreap" : ""}>{formatMoney(Number(totalPrice), currencySymbol, globalSetting.decimals, globalSetting.ds_separator, globalSetting.ths_separator, globalSetting.dsc_symbol)}</Table.HeadCell>
            <Table.HeadCell>
              <span className={`text-gray-600 ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}>{t('category')}</span>
            </Table.HeadCell>
            <Table.HeadCell>
              <input
                type="search"
                name="description"
                value={searchParams.description}
                onChange={handleSearchChange}
                className={`p-0 dark:bg-gray-700 font-normal focus:border-none border-gray-200 dark:border-gray-600 focus:ring-1 dark:focus:ring-gray-400 focus:ring-gray-300 focus:outline-none text-center ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`}
                placeholder={t('description')}
              />
            </Table.HeadCell>
          </Table.Head>
        </Table>
        <Paginations
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
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

export default ExpenseReport;
