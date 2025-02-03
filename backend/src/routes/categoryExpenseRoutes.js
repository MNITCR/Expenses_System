const express = require("express");
const {
  getCategoryExpenses,
  getCategoryExpense,
  createCategoryExpense,
  updateCategoryExpense,
  deleteCategoryExpense,
} = require("../controllers/categoryExpenseController");
const router = express.Router();

router.get("/", getCategoryExpenses);
router.get("/:id", getCategoryExpense);
router.post("/", createCategoryExpense);
router.put("/:id", updateCategoryExpense);
router.delete("/:id", deleteCategoryExpense);

module.exports = router;
