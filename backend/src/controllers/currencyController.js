const Currency = require('../models/currencyModel');

const getCurrencys = async (req, res) => {
    const {userId} = req.params;
    try {
        const currency = await Currency.find(userId);
        res.status(200).json(currency);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

const getCurrency = async (req, res) => {
    try {
        const {id} = req.params;
        const currency = await Currency.findById(id);
        if(!currency){
            return res.status(404).json({message: "Currency not found"});
        }
        res.status(200).json(currency);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const createCurrency = async (req, res) => {
    try {
        const currency = await Currency.create(req.body);
        res.status(200).json(currency);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const updateCurrency = async (req, res) => {
    try {
        const {id} = req.params;
        const currency = await Currency.findByIdAndUpdate(id, req.body);
        if(!currency){
            return res.status(404).json({message: "Currency not found"});
        }
        const currency_update = await Currency.findById(id);
        res.status(200).json(currency_update);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const deleteCurrency = async (req, res) => {
    try {
        const {id} = req.params;
        const currency = await Currency.findByIdAndDelete(id);
        if(!currency){
            return res.status(404).json({message: "Currency not found"});
        }
        res.status(200).json({message: "Currency deleted successfully"});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

module.exports = {
    getCurrency,
    getCurrencys,
    createCurrency,
    updateCurrency,
    deleteCurrency
};
