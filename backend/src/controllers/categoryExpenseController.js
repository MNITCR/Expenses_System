const categoryExpense = require('../models/categoryExpenseModel');

const getCategoryExpenses = async (req, res) => {
    const { page = 1, limit = 10, search = '',userId } = req.query;
    try {
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const searchQuery = search ? { 'name': { $regex: search, $options: 'i' } } : {};
        const userQuery = userId ? { userId: userId } : {};
        const query = { ...searchQuery,...userQuery };
        const ctExpenses = await categoryExpense.find(query)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        const totalCount = await categoryExpense.countDocuments(query);

        res.status(200).json({
            categories: ctExpenses,
            totalCount: totalCount
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const getCategoryExpense = async (req, res) => {
    try {
        const {id} = req.params;
        const ctExpense = await categoryExpense.findById(id);
        if(!ctExpense){
            return res.status(404).json({message: "Expense Category not found"});
        }
        res.status(200).json(ctExpense);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const createCategoryExpense = async (req, res) => {
    const { code, userId } = req.body;
    try {
        const existingCategory = await categoryExpense.findOne({$or: [{ userId }, { code }]});

        if (existingCategory) {
            return res.status(400).json({ message: `Category name ${name} and code ${code} already exists.` });
        }
        const ctExpense = await categoryExpense.create(req.body);
        res.status(200).json(ctExpense);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const updateCategoryExpense = async (req, res) => {
    try {
        const {id} = req.params;
        const { name, code } = req.body;
        const ctExpense = await categoryExpense.findByIdAndUpdate(id, req.body);
        if(!ctExpense){
            return res.status(404).json({message: "Expense Category not found"});
        }

        const existingCategory = await categoryExpense.findOne({$or: [{name} , {code}],_id: { $ne: id }});

        if (existingCategory) {
            return res.status(400).json({ message: `Category name ${name} and code ${code} already exists.` });
        }
        const ctExpense_update = await categoryExpense.findById(id);
        res.status(200).json(ctExpense_update);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const deleteCategoryExpense = async (req, res) => {
    try {
        const {id} = req.params;
        const ctExpense = await categoryExpense.findByIdAndDelete(id);
        if(!ctExpense){
            return res.status(404).json({message: `Category ${ctExpense.name} not found`});
        }
        res.status(200).json({message: `Category ${ctExpense.name} deleted successfully !`});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

module.exports = {
    getCategoryExpense,
    getCategoryExpenses,
    createCategoryExpense,
    updateCategoryExpense,
    deleteCategoryExpense
};
