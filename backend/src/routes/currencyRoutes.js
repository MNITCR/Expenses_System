const express = require("express");
const {getCurrencys, getCurrency, createCurrency, updateCurrency, deleteCurrency} = require("../controllers/currencyController");
const router = express.Router();

router.get("/", getCurrencys);
router.get("/:id", getCurrency);
router.post("/", createCurrency);
router.put("/:id", updateCurrency);
router.delete("/:id", deleteCurrency);


module.exports = router;
