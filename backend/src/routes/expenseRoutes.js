const express = require("express");
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  uploadExpense
} = require("../controllers/expenseController");
const router = express.Router();

router.get("/", getExpenses);
router.get("/:id", getExpense);
router.post("/", createExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);
router.post("/upload_expense", uploadExpense);

module.exports = router;
