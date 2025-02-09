const express = require("express");
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  deleteMultiExpense,
  uploadExpense
} = require("../controllers/expenseController");
const router = express.Router();

router.get("/", getExpenses);
router.get("/:id", getExpense);
router.post("/", createExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);
router.post("/delete-multiple", deleteMultiExpense);
router.post("/upload_expense", uploadExpense);

module.exports = router;
