const mongoose = require('mongoose');

const CurrencySchema = mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required:  true,
        },
        exchange_rate: {
            type: Number,
            required:  true,
            default: 0
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

const Currency = mongoose.model('Currency', CurrencySchema);

module.exports = Currency;
