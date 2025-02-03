const express = require("express");
const {
  getSetting,
  createSetting,
  updateSetting
} = require("../controllers/settingController");
const router = express.Router();

router.get("/", getSetting);
router.post("/", createSetting);
router.put("/:id", updateSetting);

module.exports = router;
