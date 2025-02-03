const CategoryExpense = require('../models/categoryExpenseModel');
const Expense = require('../models/expenseModel');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

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
        const expense = await Expense.findByIdAndUpdate(id, req.body);
        if(!expense){
            return res.status(404).json({message: "Expense not found"});
        }
        const expense_update = await Expense.findById(id);
        res.status(200).json(expense_update);
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

const excelDateToJSDate = (serialDate) => {
    const parsedDate = xlsx.SSF.parse_date_code(serialDate);
    return new Date(parsedDate.y, parsedDate.m - 1, parsedDate.d, parsedDate.H, parsedDate.M, parsedDate.S); // Convert to JavaScript Date
};

// Date formatting function
const formatDate = (date) => {
const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};

const uploadExpense = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
        if (req.file) {
          fs.unlink(req.file.path, (unlinkErr) => {
            if (unlinkErr) {
              res.status(404).json({message: unlinkErr.message});
            }
          });
        }
        return res.status(500).json({ message: err.message });
    }

    try {
      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);

      const sheetNames = workbook.SheetNames;
      const sheet = workbook.Sheets[sheetNames[0]];
      const jsonData = xlsx.utils.sheet_to_json(sheet);
      const formattedData = jsonData.map(item => ({
        ...item,
        date: formatDate(item.date ? (typeof item.date === 'number' ? excelDateToJSDate(item.date) : new Date(item.date)) : new Date()),
        userId: req.body.userId || ''
      }));

      const categoryCodes = formattedData.map(item => item.category);
      const categories = await CategoryExpense.find({ code: { $in: categoryCodes }, userId: req.body.userId });

      // Create a mapping of category codes to category _id
      const categoryMap = categories.reduce((acc, category) => {
        acc[category.code] = category._id; // Map code to _id
        return acc;
      }, {});

      const updatedData = formattedData.map(item => {
        if (categoryMap[item.category]) {
          item.category = categoryMap[item.category];
        } else {
          console.log(`Category not found for code: ${item.category}`);
          return null;
        }
        return item;
      }).filter(item => item !== null); // Remove any null entries

      // Check if all categories were replaced successfully
      if (updatedData.length !== formattedData.length) {
        return res.status(400).json({
          message: 'Some categories were not found.'
        });
      }

      const expenses = await Expense.insertMany(formattedData);

      // Delete the file after successful processing
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          res.status(404).json({message: unlinkErr.message});
        }
      });
      res.status(200).json({
        message: 'File uploaded and data inserted successfully!',
        data: expenses,
      });
    } catch (error) {
      res.status(500).json({ message: error.message});
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
  uploadExpense,
  getExpensesByDate
};
