const mongoose = require('mongoose');

const ExpenseSchema = mongoose.Schema(
    {
        date: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required:  true,
            default: 0
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CategoryExpense',
            required: true
        },
        description: {
            type: String,
            required:  false,
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

const Expense = mongoose.model('Expense', ExpenseSchema);

module.exports = Expense;
