import React, { useState, useRef } from "react";
import { Button, FileInput, Modal } from "flowbite-react";
import { IoNewspaperOutline } from "react-icons/io5";
import { FaDownload } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiSwitcher from "../../utils/apiSwitcher";

const ModalUploadExpense = ({
  openModalUpload,
  setOpenModalUpload,
  reloadExpenseList,
}) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const userId = localStorage.getItem("userId");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const clearFile = (e) => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const downloadSampleFile = () => {
    const url = "/sample_expense.xlsx";
    const fileName = "sample_expense.xlsx";
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.type =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    const serverUrl = await apiSwitcher.connectToServer();

    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", userId);
        const response = await axios.post(
          `${serverUrl}/${import.meta.env.VITE_API_URL_EXPENSE}/upload_expense`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response) {
          reloadExpenseList();
          setOpenModalUpload(false);
          toast.success(response.data.message);
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          toast.warning(error.response.data.message);
        } else {
          toast.warning(`${error.response?.data?.message || error.message}`);
        }
      }
    } else {
      toast.success("Please select a file to upload.");
    }
  };

  return (
    <Modal
      show={openModalUpload}
      position="center"
      popup
      onClose={() => setOpenModalUpload(false)}
    >
      <Modal.Header className="ml-4 mr-4 mt-3">
        <div className="flex items-center gap-4">
          <IoNewspaperOutline />
          <span className="text-xl text-gray-700 dark:first-line:text-gray-300">Upload expense by Excel</span>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="mt-4">
          <div className="relative">
            <div className="absolute rounded-sm bg-green-500 w-52 p-2 right-0">
              <button
                onClick={downloadSampleFile}
                className="flex justify-center items-center gap-2"
              >
                <FaDownload />
                <span className="text-white">Download Sample File</span>
              </button>
            </div>

            <span className="text-orange-500">
              The first line in downloaded Excel file should remain <br /> as it
              is. Please do not change the order of columns.
            </span>
            <br />
            <span className="dark:text-white">
              The correct column order is{" "}
              <span className="text-cyan-600">
                ( Date, Name, Price, Category Code, Description )
              </span>{" "}
              & you must follow this. <br />
              Please make sure the Excel file is UTF-8 encoded and not saved
              with byte order mark (BOM).
            </span>
          </div>

          <div className="mt-3">
            <FileInput
              id="small-file-upload"
              sizing="sm"
              accept=".xls, .xlsx"
              onChange={handleFileChange}
              name="userfile"
              required
              className="relative"
              ref={fileInputRef}
            />
            <button
              type="button"
              className={`text-red-500 absolute right-6 bottom-[123px] text-sm mr-3 ${
                file ? "" : "hidden"
              }`}
              onClick={clearFile}
            >
              <i className="fa fa-ban-circle"></i> Remove
            </button>
          </div>
          <small className="help-block" style={{ display: "none" }}>
            Please enter/select a value
          </small>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleUpload}>Upload</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalUploadExpense;
