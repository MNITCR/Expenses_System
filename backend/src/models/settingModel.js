const mongoose = require('mongoose');

const SettingSchema = mongoose.Schema(
    {
        language: {
            type: Number,
            required: true,
            default: 1
        },
        currency : {
            type: Number,
            required: true,
            default: 1
        },
        theme: {
            type: Number,
            required:  true,
            default: 1
        },
        date_format: {
            type: Number,
            required:  true,
            default: 1
        },
        decimals: {
            type: Number,
            required:  true,
            default: 2
        },
        ds_separator: {
            type: Number,
            required:  true,
            default: 1
        },
        ths_separator: {
            type: Number,
            required:  true,
            default: 2
        },
        dsc_symbol:{
            type: Number,
            required:  true,
            default: 1
        },
        userId: {
            type: String,
            required: false,
        }
    },
    {
        timestamps: true
    }
);

const Setting = mongoose.model('Setting', SettingSchema);

module.exports = Setting;
