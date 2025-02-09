const CategoryExpense = require('../models/categoryExpenseModel');
const Expense = require('../models/expenseModel');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { default: mongoose } = require('mongoose');

const getStartDateForFilter = (filterDate) => {
    const now = new Date();
    let startDate = new Date(now);

    switch (filterDate) {
        case "All Day":
            return null;
      case "Last Day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "Last 7 Days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "Last 15 Days":
        startDate.setMonth(now.getDate() - 15);
        break;
      case "Last 30 Days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "Last Year":
        startDate.setFullYear(now.getFullYear() - 1);
        startDate.setMonth(0);
        startDate.setDate(1);
        break;
      default:
        break;
    }

    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getExpenses = async (req, res) => {
    const { page = 1, limit, search = '', filterDate = 'All Day', userId  } = req.query;
    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const searchQuery = search ? {
        $or: [
          { 'date': { $regex: search, $options: 'i' } },
          { 'name': { $regex: search, $options: 'i' } }
        ]} : {};
      let dateQuery = {};
      if (filterDate !== 'All Day') {
        const startDate = getStartDateForFilter(filterDate);
        dateQuery = { 'date': { $gte: startDate } };
      }
      const userQuery = userId ? { userId: userId } : {};
      const query = { ...searchQuery, ...dateQuery, ...userQuery };
      const expenses = await Expense.find(query)
          .populate('category', 'name')
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .exec();

      const totalCount = await Expense.countDocuments(query);

      res.status(200).json({
          exp: expenses,
          totalCount: totalCount
      });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const getExpense = async (req, res) => {
    try {
        const {id} = req.params;
        const expense = await Expense.findById(id);
        if(!expense){
            return res.status(404).json({message: "Expense not found"});
        }
        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
}

const updateExpense = async (req, res) => {
    try {
        if(req.body.category == 'select'){
          return res.status(400).json({message: "Please select a category"});
        }
        const {id} = req.params;
        const expense = await Expense.findByIdAndUpdate(id, req.body,{ new: true });
        if(!expense){
            return res.status(404).json({message: "Expense not found"});
        }
        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const deleteExpense = async (req, res) => {
  try {
      const {id} = req.params;
      const expense = await Expense.findByIdAndDelete(id);
      if(!expense){
        return res.status(404).json({message: "Expense not found"});
      }
      res.status(200).json({message: "Expense deleted successfully"});
  } catch (error) {
      res.status(500).json({message: error.message});
  }
}

const deleteMultiExpense = async (req, res) => {
  try {
    const { ids } = req.body;

    const objectIds = ids.map(id => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }
      return new mongoose.Types.ObjectId(id);
    }).filter(id => id !== null);

    if (objectIds.length === 0) {
      return res.status(400).json({ message: 'No valid IDs provided' });
    }
    const result = await Expense.deleteMany({ _id: { $in: objectIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No expenses found with the provided IDs" });
    }

    res.status(200).json({ message: `${result.deletedCount} expenses deleted successfully` });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// upload excel file
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage }).single('file');

const excelDateToJSDate = (serial) => {
  const excelEpoch = new Date(1899, 11, 30);
  return new Date(excelEpoch.getTime() + serial * 86400000);
};

// Date formatting function
const formatDate = (date) => {
  return date.toISOString().split('T')[0] + "";
};

const uploadExpense = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      if (req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Failed to delete file after error:", unlinkErr.message);
          }
        });
      }
      return res.status(500).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);

      const sheetNames = workbook.SheetNames;
      const sheet = workbook.Sheets[sheetNames[0]];
      const jsonData = xlsx.utils.sheet_to_json(sheet);

      const formattedData = jsonData.map((item) => ({
        ...item,
        date: formatDate(
          item.date
            ? typeof item.date === "number"
              ? excelDateToJSDate(item.date)
              : new Date(item.date)
            : new Date()
        ).toString(),
        userId: req.body.userId || "",
      }));

      const categoryCodes = formattedData.map((item) => item.category);
      const categories = await CategoryExpense.find({
        code: { $in: categoryCodes },
        userId: req.body.userId,
      });

      // Create category mapping
      const categoryMap = categories.reduce((acc, category) => {
        acc[category.code] = category._id;
        return acc;
      }, {});

      const updatedData = formattedData.filter((item) => {
        if (categoryMap[item.category]) {
          item.category = categoryMap[item.category];
          return true;
        }
        return false;
      });

      // If some categories are missing, return error and stop execution
      if (updatedData.length !== formattedData.length) {
        await fs.promises.unlink(filePath);
        return res.status(400).json({
          message: "Some categories were not found.",
        });
      }

      const expenses = await Expense.insertMany(updatedData);

      await fs.promises.unlink(filePath);
      return res.status(200).json({
        message: "File uploaded and data inserted successfully!",
        data: expenses,
      });

    } catch (error) {
      if (req.file) {
        await fs.promises.unlink(req.file.path).catch((unlinkErr) => {
          console.error("Failed to delete file after catch error:", unlinkErr.message);
        });
      }
      return res.status(500).json({ message: error.message });
    }
  });
};

const getExpensesByDate = async (req, res) => {
  const { page = 1, limit, search = '', category ='' ,startDate = '', endDate = '', userId  } = req.query;
  try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const searchQuery = search ? {
        $or: [
          { 'date': { $regex: search, $options: 'i' } },
          { 'name': { $regex: search, $options: 'i' } }
        ]} : {};
      let dateQuery = {};
      if (startDate && endDate) {
        dateQuery = {
          'date': { $lte: new Date(startDate), $gte: new Date(endDate) }
        };
      }
      const userQuery = userId ? { userId: userId } : {};
      let categoryQuery = {};
      if (category && mongoose.Types.ObjectId.isValid(category)) {
        categoryQuery = { category: mongoose.Types.ObjectId(category) };
      }
      const categoryId = category ? { category: mongoose.Types.ObjectId(category) }	: {};
      const query = { ...searchQuery, ...dateQuery, ...userQuery, ...categoryQuery };
      const expenses = await Expense.find(query)
          .populate('category', 'name')
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .exec();

      const totalCount = await Expense.countDocuments(query);

      res.status(200).json({
          exp: expenses,
          totalCount: totalCount
      });
  } catch (error) {
      res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getExpense,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  deleteMultiExpense,
  uploadExpense,
  getExpensesByDate
};
