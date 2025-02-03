const mongoose = require('mongoose');

const CategoryExpenseSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter category name"],
        },
        code: {
            type: String,
            required: [true, "Please enter category code"],
        },
        userId: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true
    }
);

const CategoryExpense = mongoose.model('CategoryExpense', CategoryExpenseSchema);

module.exports = CategoryExpense;
