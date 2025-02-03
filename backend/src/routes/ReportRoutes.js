const express = require("express");
const {
  getExpenses,
  getAllExpenseAction
} = require("../controllers/Reports");
const router = express.Router();

router.get("/", getExpenses);
router.get("/expense_action", getAllExpenseAction);


module.exports = router;
