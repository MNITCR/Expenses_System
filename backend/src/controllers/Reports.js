const Expense = require('../models/expenseModel');

const getExpenses = async (req, res) => {
  const { page = 1, limit, search = '', categoryId, startDate, endDate, userId } = req.query;
  try {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const searchQuery = search ? {
      $or: [
        { 'date': { $regex: search, $options: 'i' } },
        { 'name': { $regex: search, $options: 'i' } },
        {'description': { $regex: search, $options: 'i' }}
      ]} : {};
    let dateQuery = {}, categoryQuery = {};

    if (categoryId) {
      categoryQuery = { category: categoryId };
    }

    if (startDate && endDate) {
      dateQuery = {
        'date': { $gte: startDate, $lte: endDate }
      };
    }
    const userQuery = userId ? { userId: userId } : {};
    const query = { ...searchQuery, ...dateQuery, ...userQuery,...categoryQuery };
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

const getAllExpenseAction = async (req, res) => {
    const { search = '', categoryId, startDate, endDate, userId  } = req.query;
    try {
      const searchQuery = search ? {
        $or: [
          { 'date': { $regex: search, $options: 'i' } },
          { 'name': { $regex: search, $options: 'i' } }
        ]} : {};
      let dateQuery = {}, categoryQuery = {};

      if (categoryId) {
          categoryQuery = { category: categoryId };
      }

      if (startDate && endDate) {
        dateQuery = {
          'date': { $gte: startDate, $lte: endDate }
        };
      }
      const userQuery = userId ? { userId: userId } : {};
      const query = { ...searchQuery, ...dateQuery, ...userQuery,...categoryQuery };
      const expenses = await Expense.find(query)
          .populate('category', 'name')
          .exec();


      res.status(200).json(expenses);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
  };

module.exports = {
    getExpenses,
    getAllExpenseAction
}
